# MedNova AI — Skills Pack

Skills derived from the MedNova AI Business Plan (2025). Each folder is a standalone skill
(`SKILL.md` with YAML frontmatter) that can be installed in Claude, Claude Code, or loaded as
system-prompt modules in the MedNova backend.

| Skill | Business plan section | What it does |
|---|---|---|
| `mednova-soap-notes` | 3.1 AI Clinical Transcription | Consultation transcript → structured SOAP note (EN, AF, isiXhosa, isiZulu) |
| `mednova-referral-letters` | 3.2 Administrative Automation | Drafts referral letters, reports and admin emails from clinical notes |
| `mednova-clinical-coding` | 3.2 Administrative Automation | Suggests ICD-10 / procedure codes with evidence and confidence |
| `mednova-billing-precheck` | 3.2 Administrative Automation | Pre-checks claims for likely rejection reasons before submission |
| `mednova-clinical-summaries` | 3.4 Data Extraction & Summaries | Patient history summaries, vitals/meds extraction, handover & discharge summaries |
| `mednova-scheduling` | 3.3 Scheduling & Patient Flow | Appointment allocation, no-show risk flags, reminder messages |
| `mednova-popia-compliance` | 3.5, 10 Compliance & Security | Shared privacy rules every other skill must follow |
| `mednova-integration-architecture` | 9 Technology & Architecture | Guidance for building the platform: HL7/FHIR, stateless mode, audit trails, .NET |

## Shared principles (apply to every skill)

1. **Human-in-the-loop.** Every output is a draft for a clinician or admin to review and sign off. Nothing is auto-submitted.
2. **Never invent clinical facts.** Missing information is flagged, never guessed.
3. **POPIA first.** Read `mednova-popia-compliance` before handling any patient data.
4. **Traceability.** Every extracted fact, code or flag should point back to the source text that supports it.

## Installing

- **Claude.ai:** zip an individual skill folder and upload it under Settings → Capabilities → Skills.
- **Claude Code:** copy the folders into `~/.claude/skills/` (personal) or `.claude/skills/` (project).
- **MedNova backend:** load the `SKILL.md` body as the system prompt for the matching feature endpoint.
