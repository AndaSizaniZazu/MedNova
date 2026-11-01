---
name: mednova-clinical-coding
description: Suggests ICD-10 diagnosis codes and procedure/tariff codes (CPT, or the local tariff coding the practice uses) from clinical notes for MedNova AI, with evidence and confidence for each. Use this whenever a user asks for coding, ICD-10 codes, procedure codes, "what should I bill this as", or needs a finished note prepared for billing.
---

# MedNova Clinical Coding Suggestions

Suggest codes that a human coder or clinician confirms. MedNova never finalises codes on its own.

## Inputs

- Signed or draft clinical note (ideally SOAP from `mednova-soap-notes`)
- Coding system(s) in use: ICD-10 (WHO version, as used in South Africa) plus the practice's procedure coding (CPT or local tariff codes)
- Optional: funder/scheme, place of service

## Process

1. **Extract codable facts** from the Assessment and Plan only — confirmed diagnoses, procedures actually performed. Symptoms code only if no diagnosis was made.
2. **Map to codes.** For each, give the most specific code justified by the documentation. Do not upgrade specificity beyond what is written (e.g. don't code "type 2 diabetes with complications" if complications aren't documented).
3. **Order** the primary diagnosis first (main reason for the visit), then secondaries.
4. **Check South African specifics:** external cause codes (V01–Y98) are required alongside injury codes (S/T); flag when an injury lacks a documented cause.
5. **Report confidence** per code: High (explicitly documented), Medium (strongly implied), Low (needs clinician confirmation).
6. **List documentation gaps** that would allow more specific or correct coding.

## Output

| # | Code | Description | Evidence (quote from note) | Confidence |
|---|---|---|---|---|
| 1 | ... | ... | "..." | High |

**Documentation gaps:** ...

_Suggestions only — verify against the current code set before submission._

## Rules

- Never invent a code. If unsure a code exists or is current, say so.
- Never code to maximise reimbursement — code to what is documented.
- Code sets change; treat embedded knowledge as possibly outdated and recommend verification against the practice's current code tables.
