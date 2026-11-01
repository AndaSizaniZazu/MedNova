import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, Send, ClipboardList, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { DraftPanel } from "@/components/DraftPanel";
import { useSkillDraft } from "@/utils/skills";
import { dischargeRecords, referralNotes, sampleClaimForm, sampleCodingNote, sampleDischarge, sampleReferral, toClaim } from "@/utils/samples";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const inputClass = "w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm";

const spinner = (label: string) => <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {label}</>;

export const AdminAutomation = () => {
  const billing = useSkillDraft("billing");
  const [claim, setClaim] = useState(sampleClaimForm);

  const referral = useSkillDraft("doctor");
  const [refForm, setRefForm] = useState(sampleReferral);

  const discharge = useSkillDraft("doctor");
  const [disForm, setDisForm] = useState(sampleDischarge);

  const coding = useSkillDraft("doctor");
  const [codingNote, setCodingNote] = useState(sampleCodingNote);

  const services = [
    { icon: DollarSign, title: "Billing Pre-check", desc: "Identify claim rejections before submission" },
    { icon: Send, title: "Referral Letters", desc: "Auto-generate specialist referral correspondence" },
    { icon: ClipboardList, title: "Discharge Summaries", desc: "Create comprehensive discharge documentation" },
    { icon: Search, title: "ICD-10 / CPT Coding", desc: "Suggest codes from the note, with evidence" },
  ];

  const handleBillingPrecheck = () => {
    billing.run("/api/ai/claims/precheck", { claim: toClaim(claim) });
  };

  const handleReferral = () => {
    referral.run("/api/ai/letters", {
      document_type: "referral",
      recipient: refForm.referral_to,
      patient_ref: refForm.patient_ref || undefined,
      source_notes: referralNotes(refForm),
    });
  };

  const handleDischarge = () => {
    discharge.run("/api/ai/summaries/discharge", {
      patient_ref: disForm.patient_ref || undefined,
      records: dischargeRecords(disForm),
    });
  };

  const handleCoding = () => {
    if (!codingNote.trim()) return;
    coding.run("/api/ai/coding/suggest", { note: codingNote });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-20">
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <FileText className="h-3 w-3" /> Admin Automation
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-primary">Administrative</span> Automation
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Reduce admin overhead with automated coding, billing, referrals, and documentation
          </p>
        </motion.div>

        <div className="grid gap-6 mb-16 md:grid-cols-2">
          {services.map((s, i) => (
            <motion.div key={s.title} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Card className="border-primary/10 bg-background/60 backdrop-blur hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-start p-6">
                  <s.icon className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Billing */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Billing Pre-check</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Claim Reference", key: "claim_reference" as const },
                  { label: "Practice Number", key: "practice_number" as const },
                  { label: "Member Number", key: "member_number" as const },
                  { label: "Dependant Code", key: "dependant_code" as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold">{label}</label>
                    <input type="text" value={claim[key]} onChange={(e) => setClaim((c) => ({ ...c, [key]: e.target.value }))} className={inputClass} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-semibold">Date of Service</label>
                <input type="date" value={claim.date_of_service} onChange={(e) => setClaim((c) => ({ ...c, date_of_service: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold">ICD-10 Codes (comma-separated)</label>
                <input type="text" value={claim.icd10} onChange={(e) => setClaim((c) => ({ ...c, icd10: e.target.value }))} placeholder="e.g. M79.3, I10" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold">Tariff / Procedure Codes (comma-separated)</label>
                <input type="text" value={claim.tariff_codes} onChange={(e) => setClaim((c) => ({ ...c, tariff_codes: e.target.value }))} placeholder="e.g. 0190, 3305" className={inputClass} />
              </div>
              <Button onClick={handleBillingPrecheck} disabled={billing.loading} className="w-full">
                {billing.loading ? spinner("Checking...") : "Run Pre-check"}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Pre-check Results</h3>
              <DraftPanel state={billing} placeholder="Results will appear here..." downloadName="claim-precheck" />
            </div>
          </div>
        </motion.div>

        {/* Referral */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Referral Letter Generator</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { label: "Patient Reference (no names)", key: "patient_ref" as const },
                { label: "Refer To (Specialist / Department)", key: "referral_to" as const },
                { label: "Reason for Referral", key: "reason" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-sm font-semibold">{label}</label>
                  <input type="text" value={refForm[key]} onChange={(e) => setRefForm((f) => ({ ...f, [key]: e.target.value }))} className={inputClass} />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold">Clinical Summary</label>
                <textarea value={refForm.clinical_summary} onChange={(e) => setRefForm((f) => ({ ...f, clinical_summary: e.target.value }))} rows={4} className={inputClass} />
              </div>
              <Button onClick={handleReferral} disabled={referral.loading} className="w-full">
                {referral.loading ? spinner("Generating...") : "Generate Referral Letter"}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Generated Letter</h3>
              <DraftPanel state={referral} placeholder="Referral letter will appear here..." downloadName="referral-letter" />
            </div>
          </div>
        </motion.div>

        {/* Discharge Summary */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Discharge Summary Generator</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold">Patient Ref</label>
                  <input type="text" value={disForm.patient_ref} onChange={(e) => setDisForm((f) => ({ ...f, patient_ref: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-semibold">Admission</label>
                  <input type="date" value={disForm.admission_date} onChange={(e) => setDisForm((f) => ({ ...f, admission_date: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-semibold">Discharge</label>
                  <input type="date" value={disForm.discharge_date} onChange={(e) => setDisForm((f) => ({ ...f, discharge_date: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Clinical Course</label>
                <textarea value={disForm.clinical_course} onChange={(e) => setDisForm((f) => ({ ...f, clinical_course: e.target.value }))} rows={3} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold">Allergies</label>
                <input type="text" value={disForm.allergies} onChange={(e) => setDisForm((f) => ({ ...f, allergies: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold">Admission Medications</label>
                <input type="text" value={disForm.admission_medications} onChange={(e) => setDisForm((f) => ({ ...f, admission_medications: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold">Discharge Medications</label>
                <input type="text" value={disForm.medications} onChange={(e) => setDisForm((f) => ({ ...f, medications: e.target.value }))} className={inputClass} />
              </div>
              <Button onClick={handleDischarge} disabled={discharge.loading} className="w-full">
                {discharge.loading ? spinner("Generating...") : "Generate Discharge Summary"}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Discharge Summary</h3>
              <DraftPanel state={discharge} placeholder="Discharge summary will appear here..." downloadName="discharge-summary" />
            </div>
          </div>
        </motion.div>

        {/* Coding suggestions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="rounded-lg border border-primary/10 bg-primary/5 p-8">
          <h2 className="text-2xl font-bold mb-6">ICD-10 / CPT Coding Suggestions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Clinical Note (Assessment &amp; Plan)</label>
                <textarea value={codingNote} onChange={(e) => setCodingNote(e.target.value)} rows={6} className={inputClass} />
              </div>
              <Button onClick={handleCoding} disabled={coding.loading} className="w-full">
                {coding.loading ? spinner("Suggesting codes...") : "Suggest Codes"}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suggested Codes</h3>
              <DraftPanel state={coding} placeholder="Code suggestions with evidence and confidence will appear here..." downloadName="coding-suggestions" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
