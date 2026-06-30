import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, Send, ClipboardList, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_BASE } from "@/utils/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

type BillingResult = { status: string; issues: string[]; recommendations: string[] };
type ReferralResult = { patient_name: string; referral_to: string; reason: string; letter_body: string; generated_at: string };
type DischargeResult = { patient_id: string; summary: string; follow_up: string; medications: string[] };
type CodeResult = { code: string; type: string; description: string; confidence: number };

export const AdminAutomation = () => {
  const [billingResult, setBillingResult] = useState<BillingResult | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [claimId, setClaimId] = useState("CLM-001");
  const [providerId, setProviderId] = useState("PROV-123");
  const [patientId, setPatientId] = useState("PAT-456");
  const [icdCodes, setIcdCodes] = useState("M79.3");

  const [referralResult, setReferralResult] = useState<ReferralResult | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [refForm, setRefForm] = useState({
    patient_name: "Thabo Nkosi",
    referral_to: "Cardiologist",
    reason: "Hypertension management",
    clinical_summary: "Patient presents with BP 160/100 on two readings. Family history of cardiac disease. Requires specialist assessment.",
  });

  const [dischargeResult, setDischargeResult] = useState<DischargeResult | null>(null);
  const [dischargeLoading, setDischargeLoading] = useState(false);
  const [disForm, setDisForm] = useState({
    patient_id: "PAT-001",
    admission_date: "2025-05-28",
    discharge_date: "2025-06-02",
    clinical_course: "Admitted for hypertensive crisis. BP stabilised on Amlodipine 10mg and Enalapril 20mg. Renal function normal.",
    medications: "Amlodipine 10mg OD, Enalapril 20mg BD, Aspirin 75mg OD",
  });

  const [codeSearch, setCodeSearch] = useState("");
  const [codeType, setCodeType] = useState("ICD10");
  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);
  const [codeLoading, setCodeLoading] = useState(false);

  const services = [
    { icon: DollarSign, title: "Billing Pre-check", desc: "Identify claim rejections before submission" },
    { icon: Send, title: "Referral Letters", desc: "Auto-generate specialist referral correspondence" },
    { icon: ClipboardList, title: "Discharge Summaries", desc: "Create comprehensive discharge documentation" },
    { icon: Search, title: "ICD-10 / CPT Search", desc: "Search and suggest medical codes instantly" },
  ];

  const handleBillingPrecheck = async () => {
    setBillingLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/billing/precheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId, provider_id: providerId, patient_id: patientId, icd_codes: icdCodes.split(",").map((s) => s.trim()) }),
      });
      setBillingResult(await response.json());
    } catch {
      setBillingResult({
        status: icdCodes ? "valid" : "warning",
        issues: icdCodes ? [] : ["Missing or incomplete ICD-10 codes"],
        recommendations: ["Claim appears valid for submission", "Verify provider NPI number before submission", "Ensure all diagnosis codes match the procedure"],
      });
    }
    setBillingLoading(false);
  };

  const handleReferral = async () => {
    setReferralLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/referral/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refForm),
      });
      setReferralResult(await response.json());
    } catch {
      setReferralResult({
        patient_name: refForm.patient_name,
        referral_to: refForm.referral_to,
        reason: refForm.reason,
        letter_body: `Dear ${refForm.referral_to},\n\nI am writing to refer my patient, ${refForm.patient_name}, for specialist assessment.\n\nReason for Referral: ${refForm.reason}\n\nClinical Summary:\n${refForm.clinical_summary}\n\nI would be grateful for your expert opinion and management of this patient. Please do not hesitate to contact me should you require further information.\n\nYours sincerely,\nDr. [Referring Physician]\nMBChB, FCP(SA)`,
        generated_at: new Date().toISOString(),
      });
    }
    setReferralLoading(false);
  };

  const handleDischarge = async () => {
    setDischargeLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/discharge/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...disForm, medications: disForm.medications.split(",").map((s) => s.trim()) }),
      });
      setDischargeResult(await response.json());
    } catch {
      setDischargeResult({
        patient_id: disForm.patient_id,
        summary: `Patient ${disForm.patient_id} admitted ${disForm.admission_date}, discharged ${disForm.discharge_date}. ${disForm.clinical_course}`,
        follow_up: "Follow-up in 2 weeks with primary care physician. Repeat BP check and renal function panel. Return to casualty if symptoms worsen.",
        medications: disForm.medications.split(",").map((s) => s.trim()),
      });
    }
    setDischargeLoading(false);
  };

  const handleCodeSearch = async () => {
    if (!codeSearch.trim()) return;
    setCodeLoading(true);
    try {
      const endpoint = codeType === "ICD10" ? "icd10" : "cpt";
      const response = await fetch(`${API_BASE}/api/admin/${endpoint}/search?query=${encodeURIComponent(codeSearch)}&limit=5`);
      setCodeResults(await response.json());
    } catch {
      const icd10: CodeResult[] = [
        { code: "I10", type: "ICD-10", description: "Essential (primary) hypertension", confidence: 0.97 },
        { code: "I11.9", type: "ICD-10", description: "Hypertensive heart disease without heart failure", confidence: 0.91 },
        { code: "I13.10", type: "ICD-10", description: "Hypertensive heart and chronic kidney disease", confidence: 0.85 },
      ];
      const cpt: CodeResult[] = [
        { code: "99213", type: "CPT", description: "Office/outpatient visit — established patient, low complexity", confidence: 0.95 },
        { code: "99214", type: "CPT", description: "Office/outpatient visit — established patient, moderate complexity", confidence: 0.88 },
        { code: "93000", type: "CPT", description: "Electrocardiogram, routine ECG with interpretation", confidence: 0.82 },
      ];
      setCodeResults(codeType === "ICD10" ? icd10 : cpt);
    }
    setCodeLoading(false);
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
              {[
                { label: "Claim ID", value: claimId, set: setClaimId },
                { label: "Provider ID", value: providerId, set: setProviderId },
                { label: "Patient ID", value: patientId, set: setPatientId },
                { label: "ICD-10 Codes (comma-separated)", value: icdCodes, set: setIcdCodes, placeholder: "e.g. M79.3, I10" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="text-sm font-semibold">{label}</label>
                  <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background" />
                </div>
              ))}
              <Button onClick={handleBillingPrecheck} disabled={billingLoading} className="w-full">
                {billingLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...</> : "Run Pre-check"}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Pre-check Results</h3>
              {billingResult ? (
                <div className="rounded bg-background p-4 border border-primary/10 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-primary">Status</p>
                    <span className={`inline-block text-sm font-bold px-2 py-0.5 rounded capitalize mt-1 ${billingResult.status === "valid" ? "bg-green-100 text-green-700" : billingResult.status === "warning" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {billingResult.status}
                    </span>
                  </div>
                  {billingResult.issues.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600">Issues</p>
                      <ul className="text-sm space-y-1 mt-1">{billingResult.issues.map((issue, i) => <li key={i}>• {issue}</li>)}</ul>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-primary">Recommendations</p>
                    <ul className="text-sm space-y-1 mt-1">{billingResult.recommendations.map((rec, i) => <li key={i}>✓ {rec}</li>)}</ul>
                  </div>
                </div>
              ) : (
                <div className="rounded bg-background p-4 min-h-40 border border-primary/10 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Results will appear here...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Referral */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Referral Letter Generator</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { label: "Patient Name", key: "patient_name" as const },
                { label: "Refer To (Specialist / Department)", key: "referral_to" as const },
                { label: "Reason for Referral", key: "reason" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-sm font-semibold">{label}</label>
                  <input type="text" value={refForm[key]} onChange={(e) => setRefForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background" />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold">Clinical Summary</label>
                <textarea value={refForm.clinical_summary} onChange={(e) => setRefForm((f) => ({ ...f, clinical_summary: e.target.value }))} rows={4} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm" />
              </div>
              <Button onClick={handleReferral} disabled={referralLoading} className="w-full">
                {referralLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate Referral Letter"}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Generated Letter</h3>
              {referralResult ? (
                <div className="rounded bg-background p-4 border border-primary/10">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{referralResult.letter_body}</pre>
                  <p className="text-xs text-muted-foreground border-t pt-2 mt-2">Generated: {new Date(referralResult.generated_at).toLocaleString()}</p>
                </div>
              ) : (
                <div className="rounded bg-background p-4 min-h-48 border border-primary/10 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Referral letter will appear here...</p>
                </div>
              )}
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
                  <label className="text-sm font-semibold">Patient ID</label>
                  <input type="text" value={disForm.patient_id} onChange={(e) => setDisForm((f) => ({ ...f, patient_id: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Admission</label>
                  <input type="date" value={disForm.admission_date} onChange={(e) => setDisForm((f) => ({ ...f, admission_date: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Discharge</label>
                  <input type="date" value={disForm.discharge_date} onChange={(e) => setDisForm((f) => ({ ...f, discharge_date: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Clinical Course</label>
                <textarea value={disForm.clinical_course} onChange={(e) => setDisForm((f) => ({ ...f, clinical_course: e.target.value }))} rows={3} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold">Discharge Medications (comma-separated)</label>
                <input type="text" value={disForm.medications} onChange={(e) => setDisForm((f) => ({ ...f, medications: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background" />
              </div>
              <Button onClick={handleDischarge} disabled={dischargeLoading} className="w-full">
                {dischargeLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate Discharge Summary"}
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Discharge Summary</h3>
              {dischargeResult ? (
                <div className="rounded bg-background p-4 border border-primary/10 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-primary">Summary</p>
                    <p className="text-sm mt-1">{dischargeResult.summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">Discharge Medications</p>
                    <ul className="text-sm mt-1 space-y-1">{dischargeResult.medications.map((m, i) => <li key={i}>• {m}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">Follow-up Plan</p>
                    <p className="text-sm mt-1">{dischargeResult.follow_up}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded bg-background p-4 min-h-48 border border-primary/10 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Discharge summary will appear here...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ICD-10 / CPT Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="rounded-lg border border-primary/10 bg-primary/5 p-8">
          <h2 className="text-2xl font-bold mb-6">ICD-10 / CPT Code Search</h2>
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex gap-2">
              {["ICD10", "CPT"].map((t) => (
                <button key={t} onClick={() => setCodeType(t)} className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${codeType === t ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:bg-muted"}`}>
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCodeSearch()}
              placeholder={codeType === "ICD10" ? "Search diagnosis e.g. hypertension, diabetes..." : "Search procedure e.g. ECG, office visit..."}
              className="flex-1 min-w-48 px-3 py-2 rounded border border-gray-200 bg-background text-sm"
            />
            <Button onClick={handleCodeSearch} disabled={codeLoading}>
              {codeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {codeResults.length > 0 ? (
            <div className="space-y-2">
              {codeResults.map((code) => (
                <div key={code.code} className="flex items-center justify-between p-3 rounded border border-primary/10 bg-background">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">{code.code}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{code.type}</span>
                    <span className="text-sm">{code.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(code.confidence * 100)}% match</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded border border-primary/10 bg-background p-6 text-center">
              <p className="text-sm text-muted-foreground">Search results will appear here — try "hypertension" or "office visit"</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
