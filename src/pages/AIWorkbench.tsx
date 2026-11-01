import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { DraftPanel } from "@/components/DraftPanel";
import { Markdown } from "@/components/Markdown";
import { roles, useSkillDraft } from "@/utils/skills";
import {
  describeAppointments,
  referralNotes,
  sampleAllocation,
  sampleAppointments,
  sampleClaimForm,
  sampleCodingNote,
  sampleRecord,
  sampleReferral,
  sampleTranscript,
  toClaim,
} from "@/utils/samples";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

type Feature = {
  id: string;
  label: string;
  skill: string;
  inputLabel: string;
  sample: string;
  path: (option: string) => string;
  options?: { value: string; label: string }[];
  body: (input: string, option: string) => Record<string, unknown>;
};

const features: Feature[] = [
  {
    id: "soap",
    label: "SOAP Note",
    skill: "mednova-soap-notes",
    inputLabel: "Consultation transcript",
    sample: sampleTranscript,
    path: () => "/api/ai/notes/soap",
    body: (input) => ({ transcript: input, practice_type: "GP" }),
  },
  {
    id: "letter",
    label: "Referral Letter",
    skill: "mednova-referral-letters",
    inputLabel: "Source clinical notes",
    sample: referralNotes(sampleReferral),
    path: () => "/api/ai/letters",
    options: [
      { value: "referral", label: "Referral" },
      { value: "scheme_motivation", label: "Scheme motivation" },
      { value: "sick_note", label: "Sick note" },
      { value: "admin_email", label: "Admin email" },
    ],
    body: (input, option) => ({ source_notes: input, document_type: option || "referral", recipient: sampleReferral.referral_to }),
  },
  {
    id: "coding",
    label: "Clinical Coding",
    skill: "mednova-clinical-coding",
    inputLabel: "Clinical note",
    sample: sampleCodingNote,
    path: () => "/api/ai/coding/suggest",
    body: (input) => ({ note: input }),
  },
  {
    id: "claim",
    label: "Claim Pre-check",
    skill: "mednova-billing-precheck",
    inputLabel: "Claim (JSON)",
    sample: JSON.stringify(toClaim(sampleClaimForm), null, 2),
    path: () => "/api/ai/claims/precheck",
    body: (input) => ({ claim: JSON.parse(input) }),
  },
  {
    id: "summary",
    label: "Summaries",
    skill: "mednova-clinical-summaries",
    inputLabel: "Patient records",
    sample: sampleRecord,
    path: (option) => `/api/ai/summaries/${option || "history"}`,
    options: [
      { value: "history", label: "History summary" },
      { value: "extraction", label: "Structured extraction (JSON)" },
      { value: "handover", label: "Handover (SBAR)" },
      { value: "discharge", label: "Discharge summary" },
    ],
    body: (input) => ({ records: input }),
  },
  {
    id: "schedule",
    label: "Scheduling",
    skill: "mednova-scheduling",
    inputLabel: "Slots, requests or appointment list",
    sample: `${sampleAllocation}\n\nUpcoming appointments:\n${describeAppointments(sampleAppointments)}`,
    path: () => "/api/ai/schedule/propose",
    options: [
      { value: "allocation", label: "Smart allocation" },
      { value: "no_show_risk", label: "No-show risk flags" },
      { value: "reminders", label: "Reminder messages" },
    ],
    body: (input, option) => ({ details: input, task: option || "allocation", channel: "SMS" }),
  },
];

export const AIWorkbench = () => {
  const [featureId, setFeatureId] = useState(features[0].id);
  const feature = features.find((f) => f.id === featureId) ?? features[0];
  const [input, setInput] = useState(features[0].sample);
  const [option, setOption] = useState("");
  const [patientRef, setPatientRef] = useState("");
  const skill = useSkillDraft();

  const selectFeature = (f: Feature) => {
    setFeatureId(f.id);
    setInput(f.sample);
    setOption(f.options?.[0].value ?? "");
    skill.reset();
  };

  const handleGenerate = () => {
    if (!input.trim()) return;
    let body: Record<string, unknown>;
    try {
      body = feature.body(input, option);
    } catch {
      skill.setError("Claim must be valid JSON.");
      return;
    }
    skill.run(feature.path(option), { ...body, patient_ref: patientRef || undefined });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-20">
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> AI Workbench
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            MedNova <span className="text-primary">AI Skills</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every output is a draft. Nothing enters the record until a clinician signs it off.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-wrap justify-center gap-2 mb-8">
          {features.map((f) => (
            <Button key={f.id} size="sm" variant={f.id === featureId ? "default" : "outline"} onClick={() => selectFeature(f)}>
              {f.label}
            </Button>
          ))}
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="rounded-lg border border-primary/10 bg-primary/5 p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Skill: <span className="font-mono">{feature.skill}</span> + <span className="font-mono">mednova-popia-compliance</span>
              </p>
              {feature.options && (
                <div>
                  <label className="text-sm font-semibold">Mode</label>
                  <select
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm"
                  >
                    {feature.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Patient reference</label>
                  <input
                    value={patientRef}
                    onChange={(e) => setPatientRef(e.target.value)}
                    placeholder="e.g. P-00123 (no names)"
                    className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Your role</label>
                  <select
                    value={skill.role}
                    onChange={(e) => skill.setRole(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">{feature.inputLabel}</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={14}
                  className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm font-mono"
                />
              </div>
              <Button onClick={handleGenerate} disabled={skill.loading} className="w-full">
                {skill.loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating draft...</> : "Generate Draft"}
              </Button>
            </div>

            <DraftPanel
              state={skill}
              placeholder="Choose a skill, adjust the sample input and generate a draft."
              renderBody={(d) =>
                d.structured ? (
                  <pre className="whitespace-pre-wrap text-xs text-left">{JSON.stringify(d.structured, null, 2)}</pre>
                ) : (
                  <Markdown text={d.content} />
                )
              }
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
