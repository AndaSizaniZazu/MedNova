"""
Skill Runner
Sends a MedNova skill (as the system prompt) plus the user's input to the
configured LLM provider, and tracks the resulting draft until a clinician
or admin reviews it
"""

import hashlib
import json
import logging
import os
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from modules.compliance.audit_logger import AuditLogger
from modules.skills.loader import COMPLIANCE_SKILL, get_skill
from modules.skills.providers import SkillRunnerError, create_provider

logger = logging.getLogger(__name__)

DRAFT_TTL_MINUTES = int(os.getenv("AUTO_DELETE_MINUTES", "60"))

__all__ = ["Draft", "SkillRunner", "SkillRunnerError", "pseudonymise", "skill_runner"]


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
    """Runs MedNova skills against the configured LLM provider"""

    def __init__(self):
        self.provider = create_provider()
        self.audit_logger = AuditLogger()
        self.drafts: Dict[str, Draft] = {}

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
        variant: Optional[str] = None,
    ) -> Draft:
        """Run a skill and return a stored draft"""
        self._purge_expired()
        record_reference = pseudonymise(patient_ref)

        try:
            completion = await self.provider.complete(
                system=self._system_prompt(skill_name),
                user_content=user_content,
                json_schema=json_schema,
                context={"feature": feature, "variant": variant},
            )
        except SkillRunnerError as e:
            await self._audit(user_id, role, feature, record_reference, "failed", e.audit_outcome)
            raise

        text = completion.text
        if completion.truncated:
            text += "\n\n_[Output truncated - review carefully or split the input.]_"

        structured: Optional[Dict[str, Any]] = None
        if json_schema is not None:
            try:
                structured = json.loads(text)
            except json.JSONDecodeError:
                logger.warning(f"{feature}: structured output could not be parsed - returning text")

        now = datetime.now()
        draft = Draft(
            id=str(uuid.uuid4()),
            feature=feature,
            skill=skill_name,
            record_reference=record_reference,
            content=text,
            structured=structured,
            model=completion.model,
            created_at=now,
            expires_at=now + timedelta(minutes=DRAFT_TTL_MINUTES),
        )
        self.drafts[draft.id] = draft

        await self._audit(user_id, role, feature, record_reference, "success", "Draft", completion.model)
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
        model_version: Optional[str] = None,
    ) -> None:
        # Metadata only - POPIA: audit logs never contain clinical content
        await self.audit_logger.log_data_access(
            user_id=user_id,
            data_type=feature,
            action=f"ai.{feature}",
            patient_id=record_reference,
            status=status,
            details={
                "role": role,
                "provider": self.provider.name,
                "model_version": model_version or self.provider.model,
                "outcome": outcome,
            },
        )


skill_runner = SkillRunner()
