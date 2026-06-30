import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Stethoscope, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const plans = [
  {
    icon: Stethoscope,
    name: "GP Starter",
    price: "R999",
    period: "/month per doctor",
    description: "Perfect for solo GPs and small practices looking to modernise.",
    features: [
      "AI Clinical Transcription (50 sessions/month)",
      "Auto SOAP note generation",
      "Multilingual support (EN, AF, XH, ZU)",
      "Billing pre-check (20 claims/month)",
      "Email & SMS appointment reminders",
      "POPIA-compliant data handling",
      "Standard support",
    ],
    highlight: false,
    cta: "Start Free Trial",
  },
  {
    icon: Stethoscope,
    name: "GP Professional",
    price: "R2,999",
    period: "/month per doctor",
    description: "For busy practices needing unlimited AI assistance and full automation.",
    features: [
      "Everything in GP Starter",
      "Unlimited transcription sessions",
      "ICD-10 & CPT coding suggestions",
      "Referral letter generation",
      "Patient history summarisation",
      "Smart scheduling & no-show prediction",
      "Priority support",
      "API access",
    ],
    highlight: true,
    cta: "Get Started",
  },
  {
    icon: Building2,
    name: "Hospital",
    price: "From R20,000",
    period: "/month",
    description: "Scalable deployment for hospital groups and large multi-department facilities.",
    features: [
      "Everything in GP Professional",
      "Multi-department scheduling",
      "Discharge summary automation",
      "Team handover reports",
      "Advanced audit trails",
      "Role-based access control",
      "On-premise or private cloud hosting",
      "Dedicated integration team",
      "SLA-backed uptime guarantee",
    ],
    highlight: false,
    cta: "Contact Sales",
  },
];

const enterprise = [
  { label: "On-premise deployment", value: "R100,000 – R600,000 one-time" },
  { label: "Custom EHR integration (HL7/FHIR)", value: "Custom quote" },
  { label: "White-label licensing", value: "Custom quote" },
  { label: "AI staff training programme", value: "R15,000 / session" },
  { label: "Medical insurance API partnership", value: "Revenue share" },
];

const projections = [
  { year: "Year 1", revenue: "R4.5m", profit: "R1.3m", color: "bg-primary/10" },
  { year: "Year 2", revenue: "R14m", profit: "R7m", color: "bg-primary/20" },
  { year: "Year 3", revenue: "R35m", profit: "R21m", color: "bg-primary/30" },
];

export const Pricing = () => (
  <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-20">
    <div className="container">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Transparent Pricing
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simple, <span className="text-primary">Scalable Pricing</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          SaaS subscriptions built for South African healthcare — from solo GPs to hospital groups.
          All plans include a 2-month pilot for hospitals.
        </p>
      </motion.div>

      {/* Plans */}
      <div className="grid gap-8 mb-16 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <Card className={`h-full flex flex-col relative ${plan.highlight ? "border-primary shadow-lg shadow-primary/10" : "border-primary/10"}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <plan.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-extrabold text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/transcription">
                  <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enterprise */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Enterprise & Custom Solutions</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {enterprise.map((e) => (
            <div key={e.label} className="flex justify-between items-center p-4 rounded border border-primary/10 bg-background">
              <span className="text-sm font-medium">{e.label}</span>
              <span className="text-sm text-primary font-semibold">{e.value}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Contact our team for bespoke pricing on white-labelling, HL7/FHIR EHR integrations, and government health sector deployments.
        </p>
      </motion.div>

      {/* Financial projections */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Financial Projections</h2>
          <p className="text-sm text-muted-foreground mt-1">Profitability expected by Month 14</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projections.map((p) => (
            <Card key={p.year} className="border-primary/10">
              <CardContent className={`p-6 ${p.color} rounded-lg`}>
                <h3 className="font-bold text-lg mb-4">{p.year}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-bold text-primary">{p.revenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profit</span>
                    <span className="font-bold text-green-600">{p.profit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);
