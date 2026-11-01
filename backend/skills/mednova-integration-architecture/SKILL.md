---
name: mednova-integration-architecture
description: Engineering guidance for building the MedNova AI platform — service architecture, LLM gateway, stateless processing, HL7 v2 and FHIR integration with EHRs (Epic, MediTech, Care2x), speech-to-text pipeline, role-based access, audit logging, and on-prem vs private-cloud deployment, with .NET / ASP.NET Core and SQL Server as the default stack. Use this whenever the user is designing, coding, reviewing or deploying any part of MedNova AI, writing integration code, designing the database, or asking how a MedNova feature should be built.
---

# MedNova Integration & Architecture

Default stack: **ASP.NET Core (.NET 8+), SQL Server, C# with explicit types (no `var`)**. Prefer minimal, incremental changes when modifying existing code.

## Reference architecture

```
[Clinician UI / EHR plug-in]
        │ HTTPS (TLS 1.2+), OAuth2/OIDC + MFA
        ▼
[API Gateway] ── rate limiting, tenant routing, request IDs
        │
        ├─► [Speech Service]  audio → transcript (streaming, multilingual)
        ├─► [AI Orchestrator] loads the matching MedNova skill as system prompt → LLM
        │        └─► [De-identification filter] (optional, per tenant)
        ├─► [Integration Service] HL7 v2 / FHIR R4 adapters per EHR
        └─► [Audit Service]  append-only metadata log (no clinical content)

[Tenant Config DB] settings, RBAC, consent flags, retention windows
[Transient store]  encrypted, TTL-based — only when stateless mode is off
```

Analogy: the API gateway is the hospital reception desk — it checks who you are and points you to the right department; it never reads your file.

## Key design rules

- **Stateless by default.** Audio and transcripts live in memory or a TTL store until the clinician signs the note, then are deleted. Persisting requires a tenant-level setting.
- **Tenant isolation.** Every table carries `TenantId`; enforce with row-level security in SQL Server plus a global query filter in EF Core.
- **Human sign-off is a state, not a convention.** Model outputs are stored as `Draft`; only a user with the right role can move them to `Signed`, and only signed content is pushed to the EHR.
- **Idempotent integrations.** Use message IDs so a retried HL7/FHIR send never duplicates a note.

## Feature → skill → endpoint

| Endpoint | Skill loaded | Output |
|---|---|---|
| `POST /notes/soap` | mednova-soap-notes | Markdown note + flags |
| `POST /letters` | mednova-referral-letters | Draft letter |
| `POST /coding/suggest` | mednova-clinical-coding | Code table JSON |
| `POST /claims/precheck` | mednova-billing-precheck | Issue list JSON |
| `POST /summaries/{mode}` | mednova-clinical-summaries | JSON or Markdown |
| `POST /schedule/propose` | mednova-scheduling | Proposed slots |

## EHR integration

- **FHIR R4 (preferred):** write notes as `DocumentReference` (or `Composition` for structured), extracted data as `Observation`, `MedicationStatement`, `AllergyIntolerance`, `Procedure`; appointments as `Appointment`/`Slot`.
- **HL7 v2 (legacy hospitals):** `MDM^T02` for documents, `SIU^S12` for scheduling, `ADT` feeds for patient context. Use an interface engine (e.g. Mirth/NextGen Connect) rather than hand-parsing in production.
- **DICOM:** out of scope for v1 (future version per business plan).

## Audit record (example)

```csharp
public sealed class AuditEntry
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Feature { get; init; } = string.Empty;        // e.g. "notes.soap"
    public string RecordReference { get; init; } = string.Empty; // pseudonymised
    public string ModelVersion { get; init; } = string.Empty;
    public string Outcome { get; init; } = string.Empty;         // Accepted | Edited | Rejected
    public DateTimeOffset OccurredAt { get; init; }
}
```

Insert-only: grant the app login `INSERT, SELECT` on the audit table, never `UPDATE`/`DELETE`.

## Deployment options

| Option | When | Notes |
|---|---|---|
| Private cloud (SA region) | GPs, clinics, most hospitals | Region-pinned, managed keys |
| On-premise | High-security hospitals, government | Containerised (Docker/Kubernetes), customer-managed keys, LLM via approved private endpoint or on-prem model |

## Quality gates before release

- Clinical safety review of each skill's outputs on a test set reviewed by the clinical advisors
- Pen test and POPIA review (see `mednova-popia-compliance`)
- Load test transcription at expected concurrent consultations per tenant
