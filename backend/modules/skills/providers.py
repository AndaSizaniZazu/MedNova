"""
LLM Providers
One interface over the model services MedNova can use:
  - anthropic          Claude via the Anthropic API (production default)
  - openai_compatible  Any OpenAI-style API: Kimi (Moonshot), OpenRouter, Ollama, ...
  - demo               Scripted sample drafts, no AI call (pitches and offline demos)
Select with LLM_PROVIDER in .env.
"""

import json
import logging
import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class SkillRunnerError(Exception):
    """Raised when a skill call fails; carries the HTTP status to return and an audit outcome"""

    def __init__(self, status_code: int, message: str, audit_outcome: str = "error"):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.audit_outcome = audit_outcome


@dataclass
class Completion:
    """A provider's answer, normalised"""
    text: str
    model: str
    truncated: bool = False


class AnthropicProvider:
    """Claude via the Anthropic API"""

    name = "anthropic"
    FALLBACK_BETA = "server-side-fallback-2026-07-01"

    def __init__(self):
        self.model = os.getenv("MEDNOVA_MODEL", "claude-opus-5-5")
        self.effort = os.getenv("MEDNOVA_EFFORT", "high")
        self._client = None

    @property
    def client(self):
        # Created lazily so the API boots without credentials configured
        if self._client is None:
            import anthropic

            client = anthropic.AsyncAnthropic()
            if client.api_key is None and client.auth_token is None and client.credentials is None:
                raise SkillRunnerError(503, "AI service is not configured - set ANTHROPIC_API_KEY", "not_configured")
            self._client = client
        return self._client

    async def complete(self, system: List[Dict[str, Any]], user_content: str, json_schema: Optional[Dict[str, Any]], context: Dict[str, Any]) -> Completion:
        import anthropic

        output_config: Dict[str, Any] = {"effort": self.effort}
        if json_schema is not None:
            output_config["format"] = {"type": "json_schema", "schema": json_schema}

        # Skill text is stable per feature, so cache the whole system prefix
        cached_system = [dict(block) for block in system]
        cached_system[-1]["cache_control"] = {"type": "ephemeral"}

        try:
            response = await self.client.beta.messages.create(
                model=self.model,
                max_tokens=16000,
                betas=[self.FALLBACK_BETA],
                fallbacks="default",
                system=cached_system,
                output_config=output_config,
                messages=[{"role": "user", "content": user_content}],
            )
        except anthropic.AuthenticationError as e:
            raise SkillRunnerError(503, "AI service is not configured - check ANTHROPIC_API_KEY", "auth_error") from e
        except anthropic.RateLimitError as e:
            raise SkillRunnerError(429, "AI service is busy - please retry shortly", "rate_limited") from e
        except anthropic.APIStatusError as e:
            raise SkillRunnerError(502, "AI service returned an error", f"api_{e.status_code}") from e
        except anthropic.APIConnectionError as e:
            raise SkillRunnerError(503, "AI service is unreachable", "connection_error") from e

        if response.stop_reason == "refusal":
            raise SkillRunnerError(422, "The AI declined this request - please complete it manually", "refusal")

        text = "".join(block.text for block in response.content if block.type == "text").strip()
        return Completion(text=text, model=response.model, truncated=response.stop_reason == "max_tokens")


class OpenAICompatibleProvider:
    """Any OpenAI-style chat completions API (Kimi, OpenRouter, Ollama, ...)"""

    name = "openai_compatible"

    def __init__(self):
        self.base_url = os.getenv("OPENAI_COMPAT_BASE_URL", "http://localhost:11434/v1")
        self.model = os.getenv("OPENAI_COMPAT_MODEL", "qwen2.5:3b")
        # Ollama ignores the key but the client requires one
        self.api_key = os.getenv("OPENAI_COMPAT_API_KEY") or "not-needed"
        self._client = None

    @property
    def client(self):
        if self._client is None:
            from openai import AsyncOpenAI

            self._client = AsyncOpenAI(base_url=self.base_url, api_key=self.api_key, timeout=600)
        return self._client

    async def complete(self, system: List[Dict[str, Any]], user_content: str, json_schema: Optional[Dict[str, Any]], context: Dict[str, Any]) -> Completion:
        import openai

        system_text = "\n\n".join(block["text"] for block in system)
        if json_schema is not None:
            # No guaranteed structured output here - ask for JSON and validate it in the runner
            system_text += (
                "\n\nRespond with a single JSON object only - no prose, no code fences - matching this JSON Schema:\n"
                + json.dumps(json_schema)
            )

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=8000,
                messages=[
                    {"role": "system", "content": system_text},
                    {"role": "user", "content": user_content},
                ],
            )
        except openai.AuthenticationError as e:
            raise SkillRunnerError(503, "AI service is not configured - check OPENAI_COMPAT_API_KEY", "auth_error") from e
        except openai.RateLimitError as e:
            raise SkillRunnerError(429, "AI service is busy - please retry shortly", "rate_limited") from e
        except openai.APIStatusError as e:
            raise SkillRunnerError(502, "AI service returned an error", f"api_{e.status_code}") from e
        except openai.APIConnectionError as e:
            raise SkillRunnerError(503, f"AI service is unreachable at {self.base_url}", "connection_error") from e

        choice = response.choices[0]
        text = (choice.message.content or "").strip()
        if json_schema is not None:
            # Smaller models often wrap JSON in ```json fences
            text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
        return Completion(text=text, model=response.model or self.model, truncated=choice.finish_reason == "length")


class DemoProvider:
    """Scripted sample drafts for pitches - no AI is called"""

    name = "demo"
    model = "demo-mode (scripted sample, not live AI)"

    async def complete(self, system: List[Dict[str, Any]], user_content: str, json_schema: Optional[Dict[str, Any]], context: Dict[str, Any]) -> Completion:
        from modules.skills.demo_samples import sample_for

        return Completion(text=sample_for(context["feature"], context.get("variant")), model=self.model)


PROVIDERS = {
    AnthropicProvider.name: AnthropicProvider,
    OpenAICompatibleProvider.name: OpenAICompatibleProvider,
    DemoProvider.name: DemoProvider,
}


def create_provider():
    """Build the provider named by LLM_PROVIDER (default: anthropic)"""
    name = os.getenv("LLM_PROVIDER", "anthropic").strip().lower()
    if name not in PROVIDERS:
        raise ValueError(f"Unknown LLM_PROVIDER '{name}' - use one of: {', '.join(PROVIDERS)}")
    provider = PROVIDERS[name]()
    logger.info(f"MedNova AI provider: {provider.name} ({provider.model})")
    return provider
