// Sample inputs shared by the feature pages and the AI Workbench.
// Demo mode (LLM_PROVIDER=demo) returns drafts written for exactly these inputs
// - see backend/modules/skills/demo_samples.py.

export const sampleTranscript = `DR: Good morning. What brings you in today?
PT: I've had a headache for about two weeks. It's worse in the mornings. Paracetamol helps a bit.
DR: How bad is it, out of ten?
PT: About a seven. And isisu siyaqaqanjelwa sometimes, after meals.
DR: Any vomiting or changes in your vision?
PT: No.
DR: Any allergies to medicines?
PT: Penicillin gives me a rash.
DR: Your blood pressure is 130 over 85, temperature 37.2, pulse 78. I think this is a tension-type headache, but I want to keep an eye on the blood pressure. Take paracetamol 1 g up to four times a day for five days, drink more water, and come back in a week so we can repeat the BP. If it isn't better in two weeks we'll think about a referral.`;

export const sampleReferral = {
  patient_ref: "PAT-456",
  referral_to: "Cardiologist",
  reason: "Hypertension management",
  clinical_summary: "Patient presents with BP 160/100 on two readings. Family history of cardiac disease. Requires specialist assessment.",
};

export const referralNotes = (form: typeof sampleReferral) =>
  `Reason for referral: ${form.reason}\n\n${form.clinical_summary}`;

export const sampleCodingNote = `A: Laceration to left forearm, 4 cm, after falling off a ladder at home.
P: Wound cleaned and sutured (5 sutures). Tetanus toxoid given. Review in 7 days.`;

export const sampleClaimForm = {
  claim_reference: "CLM-1042",
  practice_number: "0123456",
  member_number: "12345678",
  dependant_code: "01",
  date_of_service: "2026-10-28",
  icd10: "S51.8",
  tariff_codes: "0190, 0190, 3305",
};

const splitCodes = (value: string) => value.split(",").map((c) => c.trim()).filter(Boolean);

export const toClaim = (form: typeof sampleClaimForm) => {
  const icd10 = splitCodes(form.icd10);
  return {
    claim_reference: form.claim_reference,
    practice_number: form.practice_number,
    member_number: form.member_number,
    dependant_code: form.dependant_code,
    date_of_service: form.date_of_service,
    lines: splitCodes(form.tariff_codes).map((tariff, i) => ({ line: i + 1, tariff, icd10, quantity: 1 })),
  };
};

export const sampleDischarge = {
  patient_ref: "PAT-001",
  admission_date: "2026-10-24",
  discharge_date: "2026-10-30",
  clinical_course: "Admitted for hypertensive crisis. BP stabilised on Amlodipine 10mg and Enalapril 20mg. Renal function normal.",
  allergies: "Penicillin (rash), Sulfonamides",
  admission_medications: "Aspirin 75mg OD",
  medications: "Amlodipine 10mg OD, Enalapril 20mg BD, Aspirin 75mg OD",
};

export const dischargeRecords = (form: typeof sampleDischarge) =>
  [
    `Admission date: ${form.admission_date}`,
    `Discharge date: ${form.discharge_date}`,
    `Clinical course: ${form.clinical_course}`,
    `Allergies: ${form.allergies}`,
    `Medications on admission: ${form.admission_medications}`,
    `Discharge medications: ${form.medications}`,
  ].join("\n");

export const sampleRecord = `Patient ref: PAT-001, 54F
Admitted: 2026-10-24 for hypertensive crisis
BP on admission: 190/120 mmHg, HR: 98 bpm, Temp: 37.1°C, SpO2: 96%
Current BP: 142/88 mmHg, HR: 72 bpm, SpO2: 98%
Medications: Amlodipine 10mg OD, Enalapril 20mg BD, Aspirin 75mg OD
Allergies: Penicillin (rash), Sulfonamides
Procedures: ECG (normal sinus rhythm), Echocardiogram (mild LVH), Renal function panel
Clinical notes: Patient responding well to antihypertensives. Renal function stable.
Pending: repeat U&E in the morning.
Discharge planned for 2026-10-30.`;

export const sampleAllocation = `Practice: Sunrise Family Clinic.
Dr Patel, Tue 10 Nov 08:00-12:00, 15-min slots. Dr Singh, Tue 10 Nov 13:00-16:00 (procedure room available).
Requests:
- New patient, urgent (chest pain on exertion), prefers morning
- 3x follow-ups (routine), waiting 2-3 weeks
- Wound review procedure, 30 min, needs procedure room
Keep same-day urgent buffer per policy.`;

export type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  previousNoShows: number;
  bookedDaysAhead: number;
  reminderConfirmed: boolean;
  reminderApproved: boolean;
};

export const sampleAppointments: Appointment[] = [
  { id: "APT-001", patient: "Thabo Nkosi", doctor: "Dr. Patel", date: "2026-11-10", time: "09:00", type: "General Consultation", previousNoShows: 0, bookedDaysAhead: 3, reminderConfirmed: true, reminderApproved: false },
  { id: "APT-002", patient: "Sarah van der Merwe", doctor: "Dr. Dlamini", date: "2026-11-10", time: "09:30", type: "Follow-up", previousNoShows: 3, bookedDaysAhead: 42, reminderConfirmed: false, reminderApproved: false },
  { id: "APT-003", patient: "Ayanda Mbeki", doctor: "Dr. Patel", date: "2026-11-10", time: "10:00", type: "New Patient", previousNoShows: 1, bookedDaysAhead: 14, reminderConfirmed: true, reminderApproved: false },
  { id: "APT-004", patient: "Lerato Molefe", doctor: "Dr. Singh", date: "2026-11-11", time: "11:00", type: "Specialist", previousNoShows: 0, bookedDaysAhead: 21, reminderConfirmed: false, reminderApproved: false },
];

// Only scheduling features go to the AI - never patient names (POPIA data minimisation)
export const describeAppointments = (appointments: Appointment[]) =>
  appointments
    .map(
      (a) =>
        `${a.id}: ${a.type} with ${a.doctor} on ${a.date} at ${a.time}; previous no-shows (12 months): ${a.previousNoShows}; booked ${a.bookedDaysAhead} days ahead; reminder confirmed: ${a.reminderConfirmed ? "yes" : "no"}`,
    )
    .join("\n");
