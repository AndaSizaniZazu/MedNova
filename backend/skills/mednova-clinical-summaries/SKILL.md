---
name: mednova-clinical-summaries
description: Summarises patient histories and extracts structured clinical data (vitals, medications, allergies, procedures, results) for MedNova AI, and produces shift handover and discharge summaries. Use this whenever the user provides patient records, ward notes, a long history, or lab results and wants a summary, a handover, a discharge summary, a medication list, or any data extracted into structured form.
---

# MedNova Clinical Summaries & Data Extraction

Three modes. Pick the one the user asked for; if unclear, default to **history summary**.

## Mode 1 — Structured extraction

Return JSON so other MedNova services (and EHR integrations) can consume it:

```json
{
  "vitals": [{"type": "BP", "value": "138/86", "unit": "mmHg", "recorded_at": "2026-03-04T09:10", "source": "nursing obs p.2"}],
  "medications": [{"name": "Metformin", "dose": "850 mg", "route": "PO", "frequency": "bd", "status": "active", "source": "..."}],
  "allergies": [{"substance": "Penicillin", "reaction": "rash", "source": "..."}],
  "procedures": [{"name": "...", "date": "...", "source": "..."}],
  "results": [{"test": "HbA1c", "value": "8.1", "unit": "%", "date": "...", "source": "..."}],
  "uncertain": [{"field": "...", "reason": "..."}]
}
```

Every item carries a `source` pointer. Ambiguous items go in `uncertain`, not in the main lists. Use `null` for unknown values — never a guess.

## Mode 2 — History summary

- One-line opener: age, sex, key active problems
- Active problems, past history, current meds, allergies (allergies always shown, even if "none recorded")
- Recent significant events in date order
- Outstanding items: pending results, follow-ups
- Max ~250 words unless asked otherwise

## Mode 3 — Handover / discharge

**Handover (SBAR):** Situation, Background, Assessment, Recommendation — with outstanding tasks and "watch for" items first.

**Discharge summary:** admission/discharge dates, presenting problem, diagnoses, key investigations and results, procedures, complications, discharge medications (with changes vs admission marked **NEW / CHANGED / STOPPED**), follow-up plan, information given to the patient.

## Rules

- Medication reconciliation errors are dangerous: if admission and discharge lists conflict without explanation, flag it prominently.
- Never drop an allergy, even if it appears only once.
- Prefer the most recent value when sources conflict, but show the conflict.
- Output is a draft for clinician review.
