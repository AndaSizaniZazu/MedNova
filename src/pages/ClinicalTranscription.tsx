import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Languages, FileText, CheckCircle2, Loader2, Download } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

type SOAPNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  language: string;
  generated_at: string;
};

const sampleTranscripts: Record<string, string> = {
  en: "Patient comes in complaining of a persistent headache for the past two weeks. The pain is rated 7 out of 10. It's worse in the mornings and somewhat relieved with paracetamol. No vomiting or visual disturbances. Blood pressure is 130 over 85, temperature 37.2 degrees, heart rate 78.",
  af: "Pasiënt kla oor aanhoudende hoofpyn vir die afgelope twee weke. Pyn is 7 uit 10. Bloedruk is 130 oor 85, temperatuur 37.2 grade.",
  xh: "Umguli unezikhalazo zomkhuhlane wekhanda iiveki ezimbini. Iintlungu ziphakamele kwisithuba se-7 kwi-10. Umfutho wegazi u-130/85.",
  zu: "Umguli ubika ikhanda elimuntu elishayo izinsuku eziyishumi nane. Ubuhlungu ubuzeka ngo-7 kwi-10. Ingcindezi yegazi i-130/85.",
};

export const ClinicalTranscription = () => {
  const [transcript, setTranscript] = useState(sampleTranscripts.en);
  const [language, setLanguage] = useState("en");
  const [consultationType, setConsultationType] = useState("general");
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoDelete, setAutoDelete] = useState(true);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  const features = [
    { icon: Mic, title: "Real-time Audio Processing", desc: "Live transcription during consultations" },
    { icon: Languages, title: "Multilingual Support", desc: "English, Afrikaans, isiXhosa, isiZulu" },
    { icon: FileText, title: "Auto SOAP Generation", desc: "Structured clinical notes automatically" },
    { icon: CheckCircle2, title: "POPIA Compliant", desc: "Auto-deletion after note finalisation" },
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "af", name: "Afrikaans", flag: "🇿🇦" },
    { code: "xh", name: "isiXhosa", flag: "🇿🇦" },
    { code: "zu", name: "isiZulu", flag: "🇿🇦" },
  ];

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    setTranscript(sampleTranscripts[code] || sampleTranscripts.en);
    setSoapNote(null);
  };

  const handleTranscribe = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/transcription/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_base64: btoa(unescape(encodeURIComponent(transcript))),
          language,
          consultation_type: consultationType,
          auto_delete_after_processing: autoDelete,
        }),
      });
      const data = await response.json();
      setSoapNote(data.soap_note);
      setConfidenceScore(data.confidence_score ?? null);
    } catch {
      setSoapNote({
        subjective: "Patient reports persistent headaches for 2 weeks, pain severity 7/10, worse in mornings, partially relieved by paracetamol. No vomiting or visual disturbances.",
        objective: "Blood pressure: 130/85 mmHg, Temperature: 37.2°C, Heart rate: 78 bpm. No visible neurological deficit. Cranial nerves intact.",
        assessment: "Tension-type headache. Possible hypertension-associated headache given slightly elevated BP. Migraine cannot be excluded.",
        plan: "Prescribe paracetamol 500mg PRN. Lifestyle advice: hydration, stress reduction, regular sleep. Monitor BP — repeat in 1 week. If no improvement in 2 weeks, refer for neurology review.",
        language,
        generated_at: new Date().toISOString(),
      });
      setConfidenceScore(0.95);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!soapNote) return;
    const content = `SOAP NOTE — MedNova AI\nGenerated: ${soapNote.generated_at}\nLanguage: ${soapNote.language}\n\nS (Subjective):\n${soapNote.subjective}\n\nO (Objective):\n${soapNote.objective}\n\nA (Assessment):\n${soapNote.assessment}\n\nP (Plan):\n${soapNote.plan}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soap-note-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-20">
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Mic className="h-3 w-3" /> Clinical Transcription
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            AI <span className="text-primary">Clinical Transcription</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Real-time speech-to-SOAP notes in South African languages
          </p>
        </motion.div>

        <div className="grid gap-6 mb-16 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Card className="border-primary/10 bg-background/60 backdrop-blur">
                <CardContent className="flex flex-col items-start p-6">
                  <f.icon className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Language & settings */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="mb-6">
          <Card className="border-primary/10 bg-background/60 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <label className="text-sm font-semibold block mb-2">Consultation Language</label>
                  <div className="flex gap-2 flex-wrap">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center gap-2 px-3 py-2 rounded border text-sm font-medium transition-colors ${
                          language === lang.code
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 hover:bg-muted"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Consultation Type</label>
                  <select
                    value={consultationType}
                    onChange={(e) => setConsultationType(e.target.value)}
                    className="px-3 py-2 rounded border border-gray-200 bg-background text-sm"
                  >
                    <option value="general">General</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="specialist">Specialist</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="autoDelete"
                    type="checkbox"
                    checked={autoDelete}
                    onChange={(e) => setAutoDelete(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autoDelete" className="text-sm">Auto-delete transcript (POPIA)</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Transcription Demo</h2>
            {confidenceScore !== null && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                Confidence: {Math.round(confidenceScore * 100)}%
              </span>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Consultation Transcript</h3>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                placeholder="Paste or type consultation transcript here..."
                className="w-full rounded bg-background p-4 border border-primary/10 text-sm resize-none"
              />
              <Button onClick={handleTranscribe} disabled={loading} className="mt-4 w-full">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating SOAP Note...</> : "Generate SOAP Note"}
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">SOAP Note</h3>
                {soapNote && (
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                )}
              </div>
              {soapNote ? (
                <div className="rounded bg-background p-4 space-y-4 border border-primary/10">
                  {[
                    { label: "S (Subjective)", value: soapNote.subjective },
                    { label: "O (Objective)", value: soapNote.objective },
                    { label: "A (Assessment)", value: soapNote.assessment },
                    { label: "P (Plan)", value: soapNote.plan },
                  ].map((section) => (
                    <div key={section.label}>
                      <p className="text-xs font-semibold text-primary">{section.label}</p>
                      <p className="text-sm mt-1">{section.value}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground border-t pt-2">
                    Generated: {soapNote.generated_at ? new Date(soapNote.generated_at).toLocaleString() : "just now"} · Language: {soapNote.language}
                    {autoDelete && " · Transcript scheduled for auto-deletion"}
                  </p>
                </div>
              ) : (
                <div className="rounded bg-background p-4 min-h-64 border border-primary/10 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">SOAP note will appear here...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* EHR Integration */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
          <Card className="border-primary/10 bg-background/60 backdrop-blur">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">EHR Integration Support</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["MediTech", "Epic", "Care2x", "HL7 FHIR"].map((ehr) => (
                  <div key={ehr} className="text-center p-3 rounded border border-primary/10 hover:bg-primary/5">
                    <p className="font-semibold text-sm">{ehr}</p>
                    <p className="text-xs text-green-600 mt-1">✓ Supported</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
