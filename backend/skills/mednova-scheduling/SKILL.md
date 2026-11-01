---
name: mednova-scheduling
description: Handles appointment allocation, no-show risk flagging, waiting-list prioritisation and patient reminder/communication messages for MedNova AI. Use this whenever the user asks about booking, rescheduling, filling a clinic schedule, reducing no-shows, sending appointment reminders, or improving patient flow in a practice or hospital department.
---

# MedNova Scheduling & Patient Flow

## 1. Smart allocation

Given available slots, clinician rosters, appointment types and requests:

- Match appointment type to slot length (e.g. new patient 30 min, follow-up 15 min, procedure per practice config).
- Respect clinician skills and room/equipment constraints.
- Prioritise by clinical urgency first, then wait time, then patient preference.
- Leave buffer slots for same-day urgent cases (default 10–15% of capacity, configurable).
- Output a proposed schedule plus a list of requests that couldn't be placed and why.

## 2. No-show risk flags

Score each upcoming appointment Low / Medium / High using only the features supplied, for example:
previous no-shows, booking lead time, time of day, day of week, appointment type, whether a reminder was confirmed.

- Explain each High flag in one line ("3 missed appointments in 12 months; booked 6 weeks ahead").
- Suggest actions: extra reminder, confirmation call, or controlled overbooking where policy allows.
- Never use protected characteristics (race, religion, etc.) or proxies for them as risk features. Avoid penalising patients for factors like distance or income in a way that reduces their access to care — flag for outreach, not for deprioritisation.

## 3. Reminders & patient messages

- Channel-appropriate: SMS ≤ 160 characters, WhatsApp short and friendly, email fuller.
- Offer English, Afrikaans, isiXhosa or isiZulu per the patient's preference.
- Include: practice name, date, time, clinician, preparation instructions, how to cancel/reschedule.
- **No clinical details in reminders** (no diagnosis, test type that reveals a condition, or results) — see `mednova-popia-compliance`.

Example SMS:
> {Practice}: Reminder of your appointment with Dr {Name} on {Wed 12 Mar} at {09:30}. Reply 1 to confirm, 2 to reschedule.

## Rules

- Schedules are proposals until staff approve them.
- Patient messages are only sent through the practice's approved channel with the patient's communication consent recorded.
