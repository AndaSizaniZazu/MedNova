---
name: mednova-popia-compliance
description: Shared privacy and compliance rules for every MedNova AI feature — POPIA (South Africa) handling of health information, GDPR-aligned practices, data minimisation, anonymisation, consent, retention and audit logging. Use this before processing any patient data, when designing any MedNova feature that touches personal information, when writing patient-facing messages, or when the user asks about compliance, privacy, consent, data retention or audit trails.
---

# MedNova POPIA & Compliance Rules

Health information is **special personal information** under POPIA. Treat every patient record accordingly.

> This skill encodes design and handling rules. It is not legal advice — the MedNova compliance officer and the client's Information Officer make final decisions.

## Handling rules (apply in every skill)

1. **Purpose limitation** — use patient data only for the feature the user invoked. Don't reuse a transcript for coding analytics unless that purpose is configured and consented.
2. **Data minimisation** — include only the fields the output needs. Referral letters, reminders and summaries should carry the minimum identifiers required.
3. **Pseudonymise by default** — refer to patients by a reference ID in outputs unless the user's workflow needs a name (e.g. a letter being sent).
4. **No clinical content in low-security channels** — SMS, WhatsApp and email reminders contain logistics only.
5. **Don't echo identifiers unnecessarily** — no ID numbers, medical aid numbers or contact details in summaries unless asked.
6. **Flag over-collection** — if input contains data irrelevant to the task (e.g. HIV status in a dental referral), warn the user rather than carrying it forward.

## Anonymisation (for analytics, training, demos)

Remove or replace: names, SA ID numbers, medical aid/member numbers, phone, email, addresses, exact dates of birth (use age/age band), facility-specific record numbers, free-text mentions of family members and employers. Shift dates consistently per patient if timelines matter. Re-identification risk must be reviewed for small groups (rare conditions, small towns).

## Platform controls (for builders)

| POPIA condition | MedNova control |
|---|---|
| Accountability | Named Information Officer per client; DPA signed before go-live |
| Processing limitation / consent | Consent or legitimate-interest basis recorded per patient and purpose |
| Purpose specification | Feature-level purpose tags on every data flow |
| Further processing | Analytics only on anonymised data |
| Information quality | Human review/sign-off before any output enters the record |
| Openness | Patient-facing notice that AI assists documentation |
| Security safeguards | TLS in transit, encryption at rest, RBAC, MFA, private cloud or on-prem |
| Data subject participation | Export and correction workflow for patient requests |
| Retention | Stateless mode by default; transcripts auto-deleted after note sign-off (configurable window) |
| Cross-border transfer | Region-pinned hosting; no transfer outside SA without adequate protection/consent |

## Audit trail requirements

Log for every request: who (user ID, role), what (feature, record reference), when, source IP/device, model version, and whether the output was accepted, edited or rejected. Logs must not contain the clinical content itself. Logs are append-only.

## Incident response

Suspected breach → stop processing, notify the client's Information Officer immediately; the responsible party must notify the Information Regulator and affected data subjects as soon as reasonably possible.
