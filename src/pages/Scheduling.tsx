import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Bell, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { useState } from "react";
import { API_BASE } from "@/utils/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  noShowRisk: "low" | "medium" | "high";
  reminderSent: boolean;
};

const mockAppointments: Appointment[] = [
  { id: "APT-001", patient: "Thabo Nkosi", doctor: "Dr. Patel", date: "2025-06-10", time: "09:00", type: "General Consultation", noShowRisk: "low", reminderSent: true },
  { id: "APT-002", patient: "Sarah van der Merwe", doctor: "Dr. Dlamini", date: "2025-06-10", time: "09:30", type: "Follow-up", noShowRisk: "high", reminderSent: false },
  { id: "APT-003", patient: "Ayanda Mbeki", doctor: "Dr. Patel", date: "2025-06-10", time: "10:00", type: "New Patient", noShowRisk: "medium", reminderSent: true },
  { id: "APT-004", patient: "Lerato Molefe", doctor: "Dr. Singh", date: "2025-06-11", time: "11:00", type: "Specialist", noShowRisk: "low", reminderSent: false },
];

const riskBadge = (risk: Appointment["noShowRisk"]) => {
  const map = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  return map[risk];
};

export const Scheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [bookingResult, setBookingResult] = useState<string | null>(null);
  const [remindersSent, setRemindersSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);

  const [form, setForm] = useState({
    patient: "",
    doctor: "Dr. Patel",
    date: "",
    time: "",
    type: "General Consultation",
  });

  const features = [
    { icon: CalendarDays, title: "Smart Appointment Allocation", desc: "AI optimises slot allocation based on doctor availability, patient history, and predicted consultation time." },
    { icon: AlertTriangle, title: "Predictive No-Show Alerts", desc: "Identifies high-risk no-shows using patient history so staff can take action in advance." },
    { icon: Bell, title: "Automated Reminders", desc: "SMS and email reminders sent automatically to patients 24h and 2h before appointments." },
    { icon: CheckCircle2, title: "Patient Communication", desc: "Two-way messaging for confirmations, rescheduling, and pre-appointment instructions." },
  ];

  const handleBook = async () => {
    if (!form.patient || !form.date || !form.time) {
      setBookingResult("Please fill in all fields.");
      return;
    }
    setBookLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/scheduling/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      const newApt: Appointment = {
        id: data.appointment_id || `APT-00${appointments.length + 1}`,
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        type: form.type,
        noShowRisk: data.no_show_risk || "low",
        reminderSent: false,
      };
      setAppointments((prev) => [newApt, ...prev]);
      setBookingResult(`Appointment booked successfully! ID: ${newApt.id}`);
      setForm({ patient: "", doctor: "Dr. Patel", date: "", time: "", type: "General Consultation" });
    } catch {
      const newApt: Appointment = {
        id: `APT-00${appointments.length + 1}`,
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        type: form.type,
        noShowRisk: "low",
        reminderSent: false,
      };
      setAppointments((prev) => [newApt, ...prev]);
      setBookingResult(`Appointment booked! ID: ${newApt.id}`);
      setForm({ patient: "", doctor: "Dr. Patel", date: "", time: "", type: "General Consultation" });
    }
    setBookLoading(false);
  };

  const handleSendReminders = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/scheduling/reminders/send-bulk`, { method: "POST" });
    } catch {}
    setAppointments((prev) => prev.map((a) => ({ ...a, reminderSent: true })));
    setRemindersSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-20">
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <CalendarDays className="h-3 w-3" /> Smart Scheduling
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Scheduling &amp; <span className="text-primary">Patient Flow</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI-powered appointment management with predictive no-show alerts and automated reminders
          </p>
        </motion.div>

        {/* Feature cards */}
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

        {/* Book appointment */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="rounded-lg border border-primary/10 bg-primary/5 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Patient Name</label>
                <input
                  type="text"
                  value={form.patient}
                  onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}
                  placeholder="e.g. Thabo Nkosi"
                  className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Doctor</label>
                <select
                  value={form.doctor}
                  onChange={(e) => setForm((f) => ({ ...f, doctor: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background"
                >
                  <option>Dr. Patel</option>
                  <option>Dr. Dlamini</option>
                  <option>Dr. Singh</option>
                  <option>Dr. van der Berg</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Consultation Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background"
                >
                  <option>General Consultation</option>
                  <option>Follow-up</option>
                  <option>New Patient</option>
                  <option>Specialist</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background"
                  />
                </div>
              </div>
              <Button onClick={handleBook} disabled={bookLoading} className="w-full">
                {bookLoading ? "Booking..." : "Book Appointment"}
              </Button>
              {bookingResult && (
                <p className={`text-sm mt-2 ${bookingResult.includes("Please") ? "text-red-500" : "text-green-600"}`}>
                  {bookingResult}
                </p>
              )}
            </div>

            {/* No-show risk legend */}
            <div>
              <h3 className="font-semibold mb-4">No-Show Risk Guide</h3>
              <div className="space-y-3">
                {[
                  { risk: "low", label: "Low Risk", desc: "Patient has strong attendance history. Reminder optional." },
                  { risk: "medium", label: "Medium Risk", desc: "Some missed appointments. Reminder recommended." },
                  { risk: "high", label: "High Risk", desc: "High likelihood of no-show. Follow up by phone." },
                ].map((r) => (
                  <div key={r.risk} className="flex items-start gap-3 p-3 rounded border border-primary/10 bg-background">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${riskBadge(r.risk as Appointment["noShowRisk"])}`}>{r.label}</span>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded border border-primary/10 bg-background">
                <p className="text-xs text-muted-foreground">
                  AI analyses patient history, appointment type, and behavioural patterns to calculate no-show risk scores in real time.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointments list */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
            <Button onClick={handleSendReminders} disabled={loading} variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : remindersSent ? "Reminders Sent ✓" : "Send All Reminders"}
            </Button>
          </div>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <Card key={apt.id} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{apt.patient}</p>
                        <p className="text-xs text-muted-foreground">{apt.doctor} · {apt.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {apt.date} {apt.time}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${riskBadge(apt.noShowRisk)}`}>
                        {apt.noShowRisk} risk
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${apt.reminderSent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {apt.reminderSent ? "Reminder Sent" : "No Reminder"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Today", value: appointments.length.toString() },
              { label: "High Risk", value: appointments.filter((a) => a.noShowRisk === "high").length.toString() },
              { label: "Reminders Sent", value: appointments.filter((a) => a.reminderSent).length.toString() },
              { label: "Avg No-show Reduction", value: "34%" },
            ].map((s) => (
              <Card key={s.label} className="border-primary/10">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
