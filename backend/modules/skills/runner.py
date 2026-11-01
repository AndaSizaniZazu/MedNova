"""
Skill Runner
Calls Claude with a MedNova skill as the system prompt and tracks the
resulting draft until a clinician or admin reviews it
"""

import hashlib
import json
import logging
import os
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import anthropic

from modules.compliance.audit_logger import AuditLogger
from modules.skills.loader import COMPLIANCE_SKILL, get_skill

logger = logging.getLogger(__name__)

MODEL = os.getenv("MEDNOVA_MODEL", "claude-opus-5-5")
EFFORT = os.getenv("MEDNOVA_EFFORT", "high")
MAX_TOKENS = 16000
FALLBACK_BETA = "server-side-fallback-2026-07-01"
DRAFT_TTL_MINUTES = int(os.getenv("AUTO_DELETE_MINUTES", "60"))


class SkillRunnerError(Exception):
    """Raised when a skill call fails; carries the HTTP status to return"""

    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


@dataclass
class Draft:
    """Model output awaiting human sign-off (held in memory only - stateless mode)"""
    id: str
    feature: str
    skill: str
    record_reference: str
    content: str
    structured: Optional[Dict[str, Any]]
    model: str
    created_at: datetime
    expires_at: datetime
    status: str = "Draft"
    reviews: list = field(default_factory=list)


def pseudonymise(patient_ref: Optional[str]) -> str:
    """Stable, non-reversible reference for audit logs (never log raw identifiers)"""
    if not patient_ref:
        return "unreferenced"
    digest = hashlib.sha256(patient_ref.encode("utf-8")).hexdigest()
    return f"ref-{digest[:12]}"


class SkillRunner:
    """Runs MedNova skills against Claude"""

    def __init__(self):
        self._client: Optional[anthropic.AsyncAnthropic] = None
        self.audit_logger = AuditLogger()
        self.drafts: Dict[str, Draft] = {}

    @property
    def client(self) -> anthropic.AsyncAnthropic:
        # Created lazily so the API boots without credentials configured
        if self._client is None:
            client = anthropic.AsyncAnthropic()
            if client.api_key is None and client.auth_token is None and client.credentials is None:
                raise SkillRunnerError(503, "AI service is not configured - set ANTHROPIC_API_KEY")
            self._client = client
        return self._client

    def _system_prompt(self, skill_name: str) -> list:
        compliance = get_skill(COMPLIANCE_SKILL)
        skill = get_skill(skill_name)
        return [
            {
                "type": "text",
                "text": (
                    "You are MedNova AI, a clinical documentation assistant for South African "
                    "practices and hospitals. Every output is a draft for a clinician or admin "
                    "to review and sign off. Never invent clinical facts - flag what is missing.\n\n"
                    f"# Shared compliance rules\n\n{compliance.body}"
                ),
            },
            {
                "type": "text",
                "text": f"# Active skill: {skill.name}\n\n{skill.body}",
                # Skill text is stable per feature, so cache the whole system prefix
                "cache_control": {"type": "ephemeral"},
            },
        ]

    def _purge_expired(self) -> None:
        now = datetime.now()
        expired = [draft_id for draft_id, draft in self.drafts.items() if draft.expires_at <= now]
        for draft_id in expired:
            del self.drafts[draft_id]
            logger.info(f"Draft {draft_id} auto-deleted (stateless mode)")

    async def run(
        self,
        feature: str,
        skill_name: str,
        user_content: str,
        user_id: str,
        role: str,
        patient_ref: Optional[str] = None,
        json_schema: Optional[Dict[str, Any]] = None,
    ) -> Draft:
        """Run a skill and return a stored draft"""
        self._purge_expired()
        record_reference = pseudonymise(patient_ref)

        output_config: Dict[str, Any] = {"effort": EFFORT}
        if json_schema is not None:
            output_config["format"] = {"type": "json_schema", "schema": json_schema}

        try:
            response = await self.client.beta.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                betas=[FALLBACK_BETA],
                fallbacks="default",
                system=self._system_prompt(skill_name),
                output_config=output_config,
                messages=[{"role": "user", "content": user_content}],
            )
        except anthropic.AuthenticationError as e:
            await self._audit(user_id, role, feature, record_reference, "failed", "auth_error")
            raise SkillRunnerError(503, "AI service is not configured - set ANTHROPIC_API_KEY") from e
        except anthropic.RateLimitError as e:
            await self._audit(user_id, role, feature, record_reference, "failed", "rate_limited")
            raise SkillRunnerError(429, "AI service is busy - please retry shortly") from e
        except anthropic.APIStatusError as e:
            await self._audit(user_id, role, feature, record_reference, "failed", f"api_{e.status_code}")
            raise SkillRunnerError(502, "AI service returned an error") from e
        except anthropic.APIConnectionError as e:
            await self._audit(user_id, role, feature, record_reference, "failed", "connection_error")
            raise SkillRunnerError(503, "AI service is unreachable") from e

        if response.stop_reason == "refusal":
            await self._audit(user_id, role, feature, record_reference, "failed", "refusal", response.model)
            raise SkillRunnerError(422, "The AI declined this request - please complete it manually")

        text = "".join(block.text for block in response.content if block.type == "text").strip()
        if response.stop_reason == "max_tokens":
            text += "\n\n_[Output truncated - review carefully or split the input.]_"

        structured: Optional[Dict[str, Any]] = None
        if json_schema is not None:
            try:
                structured = json.loads(text)
            except json.JSONDecodeError:
                logger.warning(f"{feature}: structured output could not be parsed")

        now = datetime.now()
        draft = Draft(
            id=str(uuid.uuid4()),
            feature=feature,
            skill=skill_name,
            record_reference=record_reference,
            content=text,
            structured=structured,
            model=response.model,
            created_at=now,
            expires_at=now + timedelta(minutes=DRAFT_TTL_MINUTES),
        )
        self.drafts[draft.id] = draft

        await self._audit(user_id, role, feature, record_reference, "success", "Draft", response.model)
        return draft

    async def review(
        self,
        draft_id: str,
        outcome: str,
        user_id: str,
        role: str,
    ) -> Draft:
        """Record a human decision on a draft; signed or rejected drafts are deleted"""
        self._purge_expired()
        draft = self.drafts.get(draft_id)
        if draft is None:
            raise SkillRunnerError(404, "Draft not found or already expired")

        draft.status = "Rejected" if outcome == "Rejected" else "Signed"
        draft.reviews.append({"user_id": user_id, "role": role, "outcome": outcome, "at": datetime.now().isoformat()})
        await self._audit(user_id, role, draft.feature, draft.record_reference, "success", outcome, draft.model)

        # Stateless by default: content leaves MedNova once a human has decided on it
        del self.drafts[draft_id]
        return draft

    async def _audit(
        self,
        user_id: str,
        role: str,
        feature: str,
        record_reference: str,
        status: str,
        outcome: str,
        model_version: str = MODEL,
    ) -> None:
        # Metadata only - POPIA: audit logs never contain clinical content
        await self.audit_logger.log_data_access(
            user_id=user_id,
            data_type=feature,
            action=f"ai.{feature}",
            patient_id=record_reference,
            status=status,
            details={"role": role, "model_version": model_version, "outcome": outcome},
        )


skill_runner = SkillRunner()
