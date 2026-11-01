# How AI works in MedNova

MedNova doesn't train its own model. It sends clinical text to a large language model (LLM),
along with a detailed set of instructions called a **skill**, and gets back a **draft** for a
clinician to approve. The skills are the product's clinical know-how; the model is a replaceable
engine.

## The flow of one request

```
 Browser page (e.g. Transcription)
   │  POST /api/ai/notes/soap  { transcript, patient_ref, role }
   ▼
 routes.py ─ validates input, wraps it with context
   ▼
 runner.py ─ builds the system prompt:
   │           1. MedNova identity + "never invent clinical facts"
   │           2. mednova-popia-compliance skill   (always)
   │           3. the feature's skill, e.g. mednova-soap-notes
   ▼
 providers.py ─ sends prompt + input to the configured LLM provider
   │             (demo | anthropic | openai_compatible)
   ▼
 runner.py ─ stores the answer in memory as a Draft (status "Draft"),
   │          writes an audit entry (who/what/when/model - no clinical text)
   ▼
 Browser shows the draft → clinician clicks Sign off / Sign off with edits / Reject
   │  POST /api/ai/drafts/{id}/review
   ▼
 runner.py ─ checks the role may sign this feature, audits the outcome,
              then deletes the draft (stateless by default)
```

## The pieces

| File | What it does |
|---|---|
| `backend/skills/*/SKILL.md` | The skills, one per feature, plus shared POPIA rules. Plain-English instructions and output templates. Editing these changes the AI's behaviour without code changes. |
| `backend/modules/skills/loader.py` | Reads the SKILL.md files and strips the YAML header. |
| `backend/modules/skills/routes.py` | The `/api/ai/*` endpoints, plus the sign-off rules (which roles may sign which drafts). |
| `backend/modules/skills/runner.py` | Builds the prompt, calls the provider, holds drafts in memory with an expiry, writes audit entries. |
| `backend/modules/skills/providers.py` | One interface over the three providers (below). |
| `backend/modules/skills/demo_samples.py` | Scripted drafts used in demo mode. |
| `src/utils/skills.ts` | Frontend hook: call an endpoint, then sign off or reject the draft. |
| `src/components/DraftPanel.tsx` | Shows a draft, the demo-mode notice, Download, and the sign-off buttons. |
| `src/utils/samples.ts` | Sample inputs shared by every page (demo mode is written for these). |

## Feature → skill → endpoint

| Page / feature | Endpoint | Skill |
|---|---|---|
| Transcription → SOAP note | `POST /api/ai/notes/soap` | mednova-soap-notes |
| Admin → referral letter | `POST /api/ai/letters` | mednova-referral-letters |
| Admin → coding suggestions | `POST /api/ai/coding/suggest` | mednova-clinical-coding |
| Admin → claim pre-check | `POST /api/ai/claims/precheck` | mednova-billing-precheck |
| Data Extraction, Admin → discharge | `POST /api/ai/summaries/{extraction\|history\|handover\|discharge}` | mednova-clinical-summaries |
| Scheduling | `POST /api/ai/schedule/propose` | mednova-scheduling |
| Any | `POST /api/ai/drafts/{id}/review` | (sign-off) |

`GET /api/ai/status` reports which provider is active; `GET /api/ai/skills` lists the skills.

## Providers (`LLM_PROVIDER` in `.env`)

| Value | What it is | When to use |
|---|---|---|
| `demo` | Scripted drafts written for the sample inputs. **No AI is called.** Every draft carries a "Demo mode — scripted sample" notice. | Pitches and offline demos. If you type your own input, you still get the scripted sample. |
| `anthropic` | Claude (`claude-opus-5-5`) through the Anthropic API. Guaranteed-valid JSON for structured extraction, prompt caching on the skill text, and automatic retry on another model if a request is declined. | Production. |
| `openai_compatible` | Any OpenAI-style API: Kimi (Moonshot), OpenRouter, or a local model through Ollama. JSON is requested in the prompt and checked, not guaranteed. | Cheaper or local alternatives. |

### Switching to Claude after funding

1. Create an API key at https://console.anthropic.com (billing required).
2. In `.env`, set:
   ```
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Restart the backend. Nothing else changes.

Optional: `MEDNOVA_EFFORT=medium` lowers cost per draft; `MEDNOVA_MODEL` changes the model.

## Safety built in

- **Human sign-off is a state.** Every output is a `Draft`; only roles listed in `SIGN_OFF_ROLES`
  (`routes.py`) can sign it off. For example, nurses can't sign a SOAP note.
- **Never invent facts.** Each skill tells the model to flag missing information
  ("Assessment not stated — clinician to complete") instead of guessing.
- **Stateless.** Drafts live in memory only and are deleted on sign-off, rejection, or after
  `AUTO_DELETE_MINUTES`.
- **Audit without content.** Every call and decision is logged with user, role, feature, a hashed
  patient reference, provider, model and outcome. No clinical text is ever logged.
- **Data minimisation.** Scheduling sends appointment details only, never patient names; forms ask
  for patient references, not names.

## POPIA before going live

With a real provider, clinical text leaves the practice and is processed by that provider, usually
outside South Africa. Before using real patient data: sign a data processing agreement with the
provider, record the cross-border transfer basis (adequate protection or consent), and have the
client's Information Officer approve. Until then, demo with made-up or de-identified data.
