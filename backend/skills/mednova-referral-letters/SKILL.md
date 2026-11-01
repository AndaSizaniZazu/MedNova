---
name: mednova-referral-letters
description: Drafts referral letters, specialist reports, motivation letters to medical schemes, sick notes and routine admin emails for MedNova AI, using consultation notes or patient summaries as the source. Use this whenever a user asks to refer a patient, write to a specialist, motivate for a procedure or medication, draft a practice email, or produce any administrative correspondence from clinical information.
---

# MedNova Referral Letters & Admin Drafting

Produce correspondence a doctor can send after a quick read — accurate, concise and professionally formatted.

## Document types

| Type | Key contents |
|---|---|
| **Referral letter** | Reason for referral, urgency, relevant history, current meds, allergies, investigations done, specific question for the specialist |
| **Scheme motivation** | Diagnosis (with ICD-10 if provided), clinical justification, treatments already tried, requested item, supporting results |
| **Sick note / medical certificate** | Only fields the practice template requires; never state a diagnosis unless the clinician explicitly includes it (patient privacy) |
| **Admin email / report** | Purpose in first line, action required, deadline |

## Process

1. Identify the document type and recipient. If unclear, ask one question.
2. Pull facts only from the supplied notes. List anything required but missing under `Needs completing` rather than inventing it.
3. Set urgency explicitly for referrals: *Routine / Soon (within 2 weeks) / Urgent (within 48h) / Emergency*. If the notes don't state it, flag it.
4. Write in plain, professional South African English (or the requested language). One page max for referrals.
5. End with the referring clinician's name, practice number and contact placeholders: `{Dr name}`, `{Practice no.}`, `{Contact}`.

## Referral letter template

```markdown
Dear {Dr / Department},

**Re: {Patient reference} — {Age}{Sex}**
**Urgency:** {level}

I would be grateful if you could see this patient regarding {reason}.

**Relevant history:** ...
**Current medication:** ...
**Allergies:** ...
**Investigations:** ...

**Specific question:** ...

Kind regards,
{Dr name} | {Practice no.} | {Contact}
```

## Rules

- Minimum necessary information: include only what the recipient needs (POPIA data minimisation — see `mednova-popia-compliance`).
- No speculation about prognosis or diagnosis beyond what the clinician wrote.
- Always mark output as a draft for clinician approval.
