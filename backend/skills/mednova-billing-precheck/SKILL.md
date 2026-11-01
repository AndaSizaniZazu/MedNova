---
name: mednova-billing-precheck
description: Reviews a medical claim or billing line items before submission and flags likely rejection reasons for MedNova AI — missing or mismatched codes, absent authorisations, duplicate lines, member/dependant detail errors, and diagnosis–procedure mismatches. Use this whenever a user asks to check a claim, reduce rejections, review billing, or prepare an invoice for a medical scheme.
---

# MedNova Billing Pre-Check

Catch claim problems before the medical scheme does. Output is a checklist of issues, ranked by how likely they are to cause rejection.

## Inputs

- Claim data: patient/member reference, dependant code, date of service, provider/practice number, ICD-10 codes, procedure/tariff codes, quantities, amounts, authorisation number if any
- Optional: clinical note, scheme rules the practice has supplied

## Checks (run all)

**Completeness**
- Practice number, treating provider, date of service present
- Every line has at least one ICD-10 code
- Member number and dependant code present and correctly formatted

**Coding validity**
- ICD-10 codes are specific enough (flag truncated 3-character codes where a 4th character exists)
- Injury codes (S/T) accompanied by an external cause code (V01–Y98)
- Diagnosis supports the procedure billed (e.g. an X-ray line with no related diagnosis)
- Codes match the clinical note, if supplied (use `mednova-clinical-coding` for re-coding)

**Business rules**
- Duplicate lines or duplicate claims for the same date of service
- Procedures that typically require pre-authorisation with no auth number
- Quantities or units outside a plausible range
- Date of service in the future or outside the scheme's submission window (only if the window is supplied)

## Output

```markdown
**Claim pre-check — {claim reference}**
Status: ✅ Ready / ⚠️ Review recommended / ❌ Likely rejection

| Severity | Line | Issue | Suggested fix |
|---|---|---|---|
| High | 2 | Injury code without external cause code | Add V/W/X/Y code from the note |
```

## Rules

- Flag, don't fix silently. Any change to a code or amount is a suggestion the user approves.
- Don't assert scheme-specific rules you haven't been given; label general rules as "commonly required".
- Never alter amounts to "optimise" payment.
