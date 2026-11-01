import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Languages, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { DraftPanel } from "@/components/DraftPanel";
import { useSkillDraft } from "@/utils/skills";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
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
  const [patientRef, setPatientRef] = useState("");
  const soap = useSkillDraft("doctor");

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
    soap.reset();
  };

  const handleTranscribe = () => {
    if (!transcript.trim()) return;
    const languageName = languages.find((l) => l.code === language)?.name ?? "English";
    soap.run("/api/ai/notes/soap", {
      transcript,
      practice_type: `${consultationType} consultation (transcript language: ${languageName})`,
      output_language: "English",
      patient_ref: patientRef || undefined,
    });
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
                <div>
                  <label className="text-sm font-semibold block mb-2">Patient Reference</label>
                  <input
                    type="text"
                    value={patientRef}
                    onChange={(e) => setPatientRef(e.target.value)}
                    placeholder="e.g. P-00123 (no names)"
                    className="px-3 py-2 rounded border border-gray-200 bg-background text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground max-w-xs">
                  POPIA: transcripts are not stored. The draft is deleted once it is signed off, rejected or expires.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Transcription Demo</h2>
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
              <Button onClick={handleTranscribe} disabled={soap.loading} className="mt-4 w-full">
                {soap.loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating SOAP Note...</> : "Generate SOAP Note"}
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-4">SOAP Note</h3>
              <DraftPanel state={soap} placeholder="SOAP note will appear here..." downloadName="soap-note" />
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
