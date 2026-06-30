import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic, FileText, CalendarDays, Database, Shield, Clock,
  TrendingDown, Building2, Stethoscope, Heart, CheckCircle2
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const stats = [
  { icon: Clock, value: "2-3 hrs", label: "Saved daily per clinician" },
  { icon: TrendingDown, value: "40%", label: "Reduction in admin costs" },
  { icon: Building2, value: "25-60%", label: "Less operational overhead" },
];

const features = [
  { icon: Mic, title: "AI Clinical Transcription", desc: "Real-time speech-to-SOAP notes in multiple South African languages." },
  { icon: FileText, title: "Administrative Automation", desc: "Auto-generate referral letters, billing codes, and medical reports." },
  { icon: CalendarDays, title: "Smart Scheduling", desc: "AI-optimised appointment booking with no-show prediction." },
  { icon: Database, title: "Data Extraction", desc: "Summarise patient histories and extract insights from records." },
  { icon: Shield, title: "Compliance & Security", desc: "POPIA-compliant with end-to-end encryption and audit trails." },
];

const audiences = [
  {
    icon: Building2, title: "For Hospitals",
    points: ["Reduce admin staff overhead by 25-60%", "Automate ICD-10 & CPT coding", "Centralised patient data summaries", "Multi-department scheduling"],
  },
  {
    icon: Stethoscope, title: "For GP Practices",
    points: ["Save 2-3 hours on daily paperwork", "Instant SOAP note generation", "Automated billing & referrals", "Multi-language support"],
  },
  {
    icon: Heart, title: "For Patients",
    points: ["Shorter wait times", "More face-to-face time with doctors", "Accurate medical records", "Seamless appointment booking"],
  },
];

const Index = () => (
  <>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
      <div className="container text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" /> POPIA Compliant · South African Built
          </span>
        </motion.div>
        <motion.h1
          className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
        >
          AI Assistant for{" "}
          <span className="text-primary">Hospitals & GP Practices</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
        >
          Reduce admin burden, cut costs, and give clinicians more time with patients — powered by AI built for South African healthcare.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
        >
          <Link to="/transcription">
            <Button size="lg">Request a Demo</Button>
          </Link>
          <Link to="/admin">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-2xl gap-6 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 4}>
              <Card className="border-primary/10 bg-background/60 backdrop-blur">
                <CardContent className="flex flex-col items-center p-6">
                  <s.icon className="mb-2 h-6 w-6 text-primary" />
                  <span className="text-3xl font-extrabold text-primary">{s.value}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{s.label}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-20">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-2 text-muted-foreground">Purpose-built AI tools for healthcare administration</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Value Proposition */}
    <section className="bg-muted/30 py-20">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Built for Everyone in Healthcare</h2>
          <p className="mt-2 text-muted-foreground">Tailored benefits for every stakeholder</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {audiences.map((a, i) => (
            <motion.div key={a.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <a.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{a.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {a.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container text-center">
        <h2 className="text-3xl font-bold">Ready to Transform Your Practice?</h2>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          Join forward-thinking healthcare providers already saving hours every day.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/transcription">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/compliance">
            <Button size="lg" variant="outline">See Pricing</Button>
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default Index;
