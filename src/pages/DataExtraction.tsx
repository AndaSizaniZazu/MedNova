import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Activity, Pill, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { DraftPanel } from "@/components/DraftPanel";
import { Markdown } from "@/components/Markdown";
import { useSkillDraft, type Draft } from "@/utils/skills";
import { sampleRecord } from "@/utils/samples";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

// Mirrors the Mode 1 JSON in backend/skills/mednova-clinical-summaries/SKILL.md
type Extraction = {
  vitals: { type: string; value: string | null; unit: string | null; recorded_at: string | null; source: string }[];
  medications: { name: string; dose: string | null; route: string | null; frequency: string | null; status: string | null; source: string }[];
  allergies: { substance: string; reaction: string | null; source: string }[];
  procedures: { name: string; date: string | null; source: string }[];
  results: { test: string; value: string | null; unit: string | null; date: string | null; source: string }[];
  uncertain: { field: string; reason: string }[];
};

const show = (...parts: (string | null)[]) => parts.filter(Boolean).join(" ");

const ExtractionView = ({ data }: { data: Extraction }) => (
  <div className="space-y-4">
    <div className="rounded border border-primary/10 p-4">
      <p className="text-xs font-semibold text-primary mb-3">Vitals</p>
      {data.vitals.length === 0 && <p className="text-sm text-muted-foreground">None recorded</p>}
      <div className="space-y-2">
        {data.vitals.map((v, i) => (
          <div key={i} className="flex justify-between items-center gap-2">
            <span className="text-sm">{v.type}</span>
            <span className="text-xs text-muted-foreground">{v.recorded_at}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{show(v.value, v.unit) || "—"}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded border border-primary/10 p-4">
      <p className="text-xs font-semibold text-primary mb-3">Medications</p>
      {data.medications.length === 0 && <p className="text-sm text-muted-foreground">None recorded</p>}
      <div className="space-y-1">
        {data.medications.map((m, i) => (
          <div key={i} className="text-sm flex justify-between gap-2">
            <span>{show(m.name, m.dose, m.route)}</span>
            <span className="text-muted-foreground text-xs">{show(m.frequency, m.status)}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Allergies are always shown, even when none are recorded */}
    <div className="rounded border border-red-100 bg-red-50 p-4">
      <p className="text-xs font-semibold text-red-600 mb-2">Allergies</p>
      <div className="flex flex-wrap gap-2">
        {data.allergies.length === 0 && <span className="text-sm text-red-700">None recorded</span>}
        {data.allergies.map((a, i) => (
          <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
            {a.substance}{a.reaction ? ` (${a.reaction})` : ""}
          </span>
        ))}
      </div>
    </div>

    {(data.procedures.length > 0 || data.results.length > 0) && (
      <div className="rounded border border-primary/10 p-4">
        <p className="text-xs font-semibold text-primary mb-2">Procedures &amp; Results</p>
        <ul className="space-y-1">
          {data.procedures.map((p, i) => (
            <li key={`p${i}`} className="text-sm text-muted-foreground">• {show(p.name, p.date)}</li>
          ))}
          {data.results.map((r, i) => (
            <li key={`r${i}`} className="text-sm text-muted-foreground">• {r.test}: {show(r.value, r.unit) || "—"} {r.date ?? ""}</li>
          ))}
        </ul>
      </div>
    )}

    {data.uncertain.length > 0 && (
      <div className="rounded border border-yellow-100 bg-yellow-50 p-4">
        <p className="text-xs font-semibold text-yellow-700 mb-2">Needs Review</p>
        <ul className="space-y-1">
          {data.uncertain.map((u, i) => (
            <li key={i} className="text-sm text-yellow-800">• {u.field}: {u.reason}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const renderExtraction = (draft: Draft) =>
  draft.structured ? (
    <ExtractionView data={draft.structured as Extraction} />
  ) : (
    <Markdown text={draft.content} />
  );

export const DataExtraction = () => {
  const [patientRecord, setPatientRecord] = useState(sampleRecord);
  const [summaryMode, setSummaryMode] = useState<"extraction" | "history">("extraction");
  const [ward, setWard] = useState("Cardiology");
  const [shift, setShift] = useState("Night Shift");
  const extraction = useSkillDraft("doctor");
  const handover = useSkillDraft("nurse");

  const features = [
    { icon: Database, title: "Patient History Summaries", desc: "Instantly summarise complex patient histories into structured, readable clinical snapshots." },
    { icon: Activity, title: "Vitals Extraction", desc: "Extract vitals from unstructured notes, each linked back to its source." },
    { icon: Pill, title: "Medication & Procedure Extraction", desc: "Identify all medications, dosages, and procedures from clinical text automatically." },
    { icon: Users, title: "Team Handovers", desc: "Auto-generate SBAR shift handover reports ensuring continuity of care between clinical teams." },
  ];

  const handleExtract = () => {
    if (!patientRecord.trim()) return;
    extraction.run(`/api/ai/summaries/${summaryMode}`, { records: patientRecord });
  };

  const handleHandover = () => {
    if (!patientRecord.trim()) return;
    handover.run("/api/ai/summaries/handover", {
      records: patientRecord,
      instructions: `${ward} ward, ${shift} handover.`,
    });
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
              <div className="flex gap-2">
                {[
                  { value: "extraction" as const, label: "Structured extraction" },
                  { value: "history" as const, label: "History summary" },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setSummaryMode(m.value)}
                    className={`flex-1 px-3 py-2 rounded border text-sm font-medium transition-colors ${
                      summaryMode === m.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:bg-muted"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <Button onClick={handleExtract} disabled={extraction.loading} className="w-full">
                {extraction.loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : "Extract & Summarise"}
              </Button>
            </div>

            <DraftPanel
              state={extraction}
              placeholder="Extraction results will appear here..."
              renderBody={renderExtraction}
              downloadName="clinical-extraction"
            />
          </div>
        </motion.div>

        {/* Handover generator */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="rounded-lg border border-primary/10 bg-primary/5 p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Team Handover Report</h2>
              <p className="text-sm text-muted-foreground mt-1">SBAR handover from the clinical notes above</p>
            </div>
            <div className="flex gap-3">
              <select value={ward} onChange={(e) => setWard(e.target.value)} className="px-3 py-2 rounded border border-gray-200 bg-background text-sm">
                <option>Cardiology</option>
                <option>General Medicine</option>
                <option>ICU</option>
                <option>Orthopaedics</option>
              </select>
              <select value={shift} onChange={(e) => setShift(e.target.value)} className="px-3 py-2 rounded border border-gray-200 bg-background text-sm">
                <option>Night Shift</option>
                <option>Day Shift</option>
                <option>Evening Shift</option>
              </select>
              <Button onClick={handleHandover} disabled={handover.loading}>
                {handover.loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate Handover"}
              </Button>
            </div>
          </div>

          <DraftPanel
            state={handover}
            placeholder="Select a ward and shift, then click Generate Handover"
            downloadName="handover"
          />
        </motion.div>
      </div>
    </div>
  );
};
