import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { API_BASE } from "@/utils/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface ComplianceStatus {
  stateless_mode: boolean;
  encryption_enabled: boolean;
  audit_logging: string;
  auto_delete_minutes: number;
}

export const ComplianceSecurity = () => {
  const [anonymized, setAnonymized] = useState("");
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);

  const features = [
    { icon: Lock, title: "End-to-End Encryption", desc: "TLS/SSL encryption for all data" },
    { icon: Eye, title: "Audit Logging", desc: "Complete audit trail for all data access" },
    { icon: Database, title: "Data Anonymization", desc: "Remove PII automatically" },
    { icon: Zap, title: "Stateless Mode", desc: "No data stored by default" },
    { icon: Shield, title: "RBAC", desc: "Role-Based Access Control" },
    { icon: CheckCircle2, title: "POPIA Compliant", desc: "Full POPIA compliance" },
  ];

  const handleAnonymize = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/compliance/anonymize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer token" },
        body: JSON.stringify({
          data: "Patient John Doe, email: john@example.com, phone: 555-1234",
          level: "strict",
        }),
      });
      const data = await response.json();
      setAnonymized(data.data);
    } catch (error) {
      console.error("Anonymization failed:", error);
    }
  };

  const handleGetStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/compliance/status`);
      const data: ComplianceStatus = await response.json();
      setComplianceStatus(data);
    } catch (error) {
      console.error("Status fetch failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-20">
      <div className="container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" /> Compliance & Security
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Healthcare-Grade <span className="text-primary">Security & Compliance</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            POPIA-compliant with full audit trails and data protection
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 mb-16 md:grid-cols-3">
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

        {/* Security Demo */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={7}
          className="grid md:grid-cols-2 gap-8 mb-8"
        >
          {/* Anonymization */}
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-8">
            <h2 className="text-2xl font-bold mb-6">Data Anonymization</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Original Data</label>
                <textarea
                  defaultValue="Patient John Doe, email: john@example.com, phone: 555-1234"
                  className="w-full mt-1 px-3 py-2 rounded border border-gray-200 h-24"
                />
              </div>
              <Button onClick={handleAnonymize} className="w-full">
                Anonymize
              </Button>
              {anonymized && (
                <div>
                  <label className="text-sm font-semibold">Anonymized Data</label>
                  <div className="mt-1 px-3 py-2 rounded border border-primary/10 bg-background p-3">
                    <p className="text-sm">{anonymized}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-8">
            <h2 className="text-2xl font-bold mb-6">Compliance Status</h2>
            <Button onClick={handleGetStatus} className="w-full mb-4">
              Get Status
            </Button>
            {complianceStatus && (
              <div className="space-y-3 bg-background rounded p-4 border border-primary/10">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold">Stateless Mode</span>
                  <span className="text-sm font-bold text-primary">
                    {complianceStatus.stateless_mode ? "✓ Enabled" : "✗ Disabled"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold">Encryption</span>
                  <span className="text-sm font-bold text-primary">
                    {complianceStatus.encryption_enabled ? "✓ Enabled" : "✗ Disabled"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold">Audit Logging</span>
                  <span className="text-sm font-bold text-primary">✓ {complianceStatus.audit_logging}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold">Auto-Delete</span>
                  <span className="text-sm font-bold text-primary">{complianceStatus.auto_delete_minutes}min</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security Standards */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <Card className="border-primary/10 bg-background/60 backdrop-blur">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Security Standards & Compliance</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3">Data Protection</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ POPIA Compliance</li>
                    <li>✓ GDPR Compatible</li>
                    <li>✓ End-to-End Encryption</li>
                    <li>✓ TLS 1.3</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-3">Healthcare Standards</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ HL7 Support</li>
                    <li>✓ FHIR Compliance</li>
                    <li>✓ ICD-10 Standard</li>
                    <li>✓ CPT Compliance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
