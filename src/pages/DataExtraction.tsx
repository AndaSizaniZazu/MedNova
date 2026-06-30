import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Activity, Pill, FileText, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_BASE } from "@/utils/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

type ExtractionResult = {
  summary: string;
  vitals: { name: string; value: string; unit: string; status: "normal" | "warning" | "critical" }[];
  medications: { name: string; dose: string; frequency: string }[];
  procedures: string[];
  allergies: string[];
};

type HandoverResult = {
  shift_summary: string;
  active_cases: number;
  critical_patients: string[];
  pending_tasks: string[];
  notes: string;
};

const sampleRecord = `Patient: Nomsa Dlamini, 54F
Admitted: 2025-05-28 for hypertensive crisis
BP on admission: 190/120 mmHg, HR: 98 bpm, Temp: 37.1°C, SpO2: 96%
Current BP: 142/88 mmHg, HR: 72 bpm, SpO2: 98%
Medications: Amlodipine 10mg OD, Enalapril 20mg BD, Aspirin 75mg OD
Allergies: Penicillin (rash), Sulfonamides
Procedures: ECG (normal sinus rhythm), Echocardiogram (mild LVH), Renal function panel
Clinical notes: Patient responding well to antihypertensives. Renal function stable.
Discharge planned for 2025-06-02.`;

export const DataExtraction = () => {
  const [patientRecord, setPatientRecord] = useState(sampleRecord);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [handoverResult, setHandoverResult] = useState<HandoverResult | null>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [handoverLoading, setHandoverLoading] = useState(false);

  const features = [
    { icon: Database, title: "Patient History Summaries", desc: "Instantly summarise complex patient histories into structured, readable clinical snapshots." },
    { icon: Activity, title: "Vitals Extraction", desc: "Extract and flag abnormal vital signs with trend analysis from unstructured notes." },
    { icon: Pill, title: "Medication & Procedure Extraction", desc: "Identify all medications, dosages, and procedures from clinical text automatically." },
    { icon: Users, title: "Team Handovers", desc: "Auto-generate shift handover reports ensuring continuity of care between clinical teams." },
  ];

  const handleExtract = async () => {
    if (!patientRecord.trim()) return;
    setExtractLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/data-extraction/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinical_text: patientRecord }),
      });
      const data = await response.json();
      setExtractionResult(data);
    } catch {
      setExtractionResult({
        summary: "54-year-old female admitted for hypertensive crisis on 2025-05-28. BP improved from 190/120 to 142/88 mmHg on antihypertensive therapy. ECG shows normal sinus rhythm. Mild LVH on echo. Stable renal function. Planned discharge 2025-06-02.",
        vitals: [
          { name: "Blood Pressure", value: "142/88", unit: "mmHg", status: "warning" },
          { name: "Heart Rate", value: "72", unit: "bpm", status: "normal" },
          { name: "Temperature", value: "37.1", unit: "°C", status: "normal" },
          { name: "SpO2", value: "98", unit: "%", status: "normal" },
        ],
        medications: [
          { name: "Amlodipine", dose: "10mg", frequency: "Once daily" },
          { name: "Enalapril", dose: "20mg", frequency: "Twice daily" },
          { name: "Aspirin", dose: "75mg", frequency: "Once daily" },
        ],
        procedures: ["ECG (normal sinus rhythm)", "Echocardiogram (mild LVH)", "Renal function panel"],
        allergies: ["Penicillin (rash)", "Sulfonamides"],
      });
    }
    setExtractLoading(false);
  };

  const handleHandover = async () => {
    setHandoverLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/data-extraction/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ward: "Cardiology", shift: "Night" }),
      });
      const data = await response.json();
      setHandoverResult(data);
    } catch {
      setHandoverResult({
        shift_summary: "Cardiology Night Shift — 07 June 2025. Ward stable with 12 patients. Two patients require close monitoring overnight due to haemodynamic instability. All medications administered as prescribed. No critical incidents this shift.",
        active_cases: 12,
        critical_patients: ["Nomsa Dlamini (Bed 4A) — BP monitoring q1h", "James Sithole (Bed 7B) — post-PCI observation"],
        pending_tasks: ["Repeat troponin at 02:00 for Bed 7B", "Morning round bloods for all patients", "Echo report pending for Bed 2C"],
        notes: "Dr. Singh on call overnight. Cardiologist Dr. Patel available for emergencies.",
      });
    }
    setHandoverLoading(false);
  };

  const vitalStatus = (status: ExtractionResult["vitals"][0]["status"]) => {
    const map = { normal: "text-green-600 bg-green-50", warning: "text-yellow-700 bg-yellow-50", critical: "text-red-600 bg-red-50" };
    return map[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-20">
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Database className="h-3 w-3" /> Data Extraction
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Data Extraction &amp; <span className="text-primary">Summaries</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Extract vitals, medications, and procedures from clinical text — generate handovers instantly
          </p>
        </motion.div>

        <div className="grid gap-6 mb-16 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Card className="h-full border-primary/10 bg-background/60 backdrop-blur hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-start p-6">
                  <f.icon className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Extraction demo */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Clinical Data Extraction</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Patient Record / Clinical Notes</label>
                <textarea
                  value={patientRecord}
                  onChange={(e) => setPatientRecord(e.target.value)}
                  rows={12}
                  className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm font-mono"
                />
              </div>
              <Button onClick={handleExtract} disabled={extractLoading} className="w-full">
                {extractLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extracting...</> : "Extract & Summarise"}
              </Button>
            </div>

            <div>
              {extractionResult ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="rounded border border-primary/10 bg-background p-4">
                    <p className="text-xs font-semibold text-primary mb-2">Clinical Summary</p>
                    <p className="text-sm">{extractionResult.summary}</p>
                  </div>

                  {/* Vitals */}
                  <div className="rounded border border-primary/10 bg-background p-4">
                    <p className="text-xs font-semibold text-primary mb-3">Extracted Vitals</p>
                    <div className="space-y-2">
                      {extractionResult.vitals.map((v) => (
                        <div key={v.name} className="flex justify-between items-center">
                          <span className="text-sm">{v.name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${vitalStatus(v.status)}`}>
                            {v.value} {v.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="rounded border border-primary/10 bg-background p-4">
                    <p className="text-xs font-semibold text-primary mb-3">Medications</p>
                    <div className="space-y-1">
                      {extractionResult.medications.map((m) => (
                        <div key={m.name} className="text-sm flex justify-between">
                          <span>{m.name} {m.dose}</span>
                          <span className="text-muted-foreground text-xs">{m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="rounded border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-semibold text-red-600 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {extractionResult.allergies.map((a) => (
                        <span key={a} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{a}</span>
                      ))}
                    </div>
                  </div>

                  {/* Procedures */}
                  <div className="rounded border border-primary/10 bg-background p-4">
                    <p className="text-xs font-semibold text-primary mb-2">Procedures</p>
                    <ul className="space-y-1">
                      {extractionResult.procedures.map((p) => (
                        <li key={p} className="text-sm text-muted-foreground">• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full rounded border border-primary/10 bg-background flex items-center justify-center min-h-64">
                  <p className="text-sm text-muted-foreground">Extraction results will appear here...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Handover generator */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="rounded-lg border border-primary/10 bg-primary/5 p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Team Handover Report</h2>
              <p className="text-sm text-muted-foreground mt-1">Generate shift handover for clinical team continuity</p>
            </div>
            <div className="flex gap-3">
              <select className="px-3 py-2 rounded border border-gray-200 bg-background text-sm">
                <option>Cardiology</option>
                <option>General Medicine</option>
                <option>ICU</option>
                <option>Orthopaedics</option>
              </select>
              <select className="px-3 py-2 rounded border border-gray-200 bg-background text-sm">
                <option>Night Shift</option>
                <option>Day Shift</option>
                <option>Evening Shift</option>
              </select>
              <Button onClick={handleHandover} disabled={handoverLoading}>
                {handoverLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate Handover"}
              </Button>
            </div>
          </div>

          {handoverResult ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="rounded border border-primary/10 bg-background p-4">
                  <p className="text-xs font-semibold text-primary mb-2">Shift Summary</p>
                  <p className="text-sm">{handoverResult.shift_summary}</p>
                </div>
                <div className="rounded border border-primary/10 bg-background p-4">
                  <p className="text-xs font-semibold text-primary mb-2">Active Cases</p>
                  <p className="text-3xl font-extrabold text-primary">{handoverResult.active_cases}</p>
                  <p className="text-xs text-muted-foreground">patients on ward</p>
                </div>
                <div className="rounded border border-primary/10 bg-background p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Handover Notes</p>
                  <p className="text-sm">{handoverResult.notes}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-semibold text-red-600 mb-3">Critical Patients</p>
                  <ul className="space-y-2">
                    {handoverResult.critical_patients.map((p) => (
                      <li key={p} className="text-sm text-red-700">⚠ {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded border border-yellow-100 bg-yellow-50 p-4">
                  <p className="text-xs font-semibold text-yellow-700 mb-3">Pending Tasks</p>
                  <ul className="space-y-2">
                    {handoverResult.pending_tasks.map((t) => (
                      <li key={t} className="text-sm text-yellow-800">• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded border border-primary/10 bg-background p-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a ward and shift, then click Generate Handover</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
