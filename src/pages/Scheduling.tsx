import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Bell, AlertTriangle, CheckCircle2, Clock, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_BASE } from "@/utils/api";
import { DraftPanel } from "@/components/DraftPanel";
import { useSkillDraft, type ReviewOutcome } from "@/utils/skills";
import { describeAppointments, sampleAllocation, sampleAppointments, type Appointment } from "@/utils/samples";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export const Scheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [bookingResult, setBookingResult] = useState<string | null>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [channel, setChannel] = useState<"SMS" | "WhatsApp" | "email">("SMS");
  const [language, setLanguage] = useState("English");
  const [assistantTask, setAssistantTask] = useState<"no_show_risk" | "reminders">("no_show_risk");
  const assistant = useSkillDraft("admin");

  const allocation = useSkillDraft("admin");
  const [allocationInput, setAllocationInput] = useState(sampleAllocation);

  const [form, setForm] = useState({
    patient: "",
    doctor: "Dr. Patel",
    date: "",
    time: "",
    type: "General Consultation",
  });

  const features = [
    { icon: CalendarDays, title: "Smart Appointment Allocation", desc: "AI proposes slot allocation by urgency, wait time and clinician availability, keeping an urgent buffer." },
    { icon: AlertTriangle, title: "Predictive No-Show Alerts", desc: "Flags likely no-shows from attendance history so staff can reach out in advance." },
    { icon: Bell, title: "Reminder Drafting", desc: "Channel-appropriate reminders in English, Afrikaans, isiXhosa or isiZulu — logistics only, no clinical details." },
    { icon: CheckCircle2, title: "Staff Approval", desc: "Schedules and messages are proposals until staff sign them off." },
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
        ...form,
        previousNoShows: 0,
        bookedDaysAhead: Math.max(0, Math.round((new Date(form.date).getTime() - Date.now()) / 86_400_000)),
        reminderConfirmed: false,
        reminderApproved: false,
      };
      setAppointments((prev) => [newApt, ...prev]);
      setBookingResult(`Appointment booked successfully! ID: ${newApt.id}`);
      setForm({ patient: "", doctor: "Dr. Patel", date: "", time: "", type: "General Consultation" });
    } catch {
      setBookingResult("Could not reach the MedNova API - appointment not booked.");
    }
    setBookLoading(false);
  };

  const runAssistant = (task: "no_show_risk" | "reminders") => {
    setAssistantTask(task);
    assistant.run("/api/ai/schedule/propose", {
      task,
      details: `Practice: Sunrise Family Clinic.\n${describeAppointments(appointments)}`,
      channel: task === "reminders" ? channel : undefined,
      language,
    });
  };

  const handleAssistantReviewed = (outcome: ReviewOutcome) => {
    if (assistantTask === "reminders" && outcome !== "Rejected") {
      setAppointments((prev) => prev.map((a) => ({ ...a, reminderApproved: true })));
    }
  };

  const handleAllocate = () => {
    if (!allocationInput.trim()) return;
    allocation.run("/api/ai/schedule/propose", { task: "allocation", details: allocationInput });
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
                <p className={`text-sm mt-2 ${bookingResult.includes("successfully") ? "text-green-600" : "text-red-500"}`}>
                  {bookingResult}
                </p>
              )}
            </div>

            {/* Smart allocation */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Smart Allocation — rosters, slots &amp; requests</label>
                <textarea
                  value={allocationInput}
                  onChange={(e) => setAllocationInput(e.target.value)}
                  rows={8}
                  className="w-full mt-1 px-3 py-2 rounded border border-gray-200 bg-background text-sm font-mono"
                />
              </div>
              <Button onClick={handleAllocate} disabled={allocation.loading} variant="outline" className="w-full">
                {allocation.loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Proposing...</> : "Propose Schedule"}
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <DraftPanel state={allocation} placeholder="Proposed schedule will appear here..." downloadName="proposed-schedule" />
          </div>
        </motion.div>

        {/* Appointments list */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={() => runAssistant("no_show_risk")} disabled={assistant.loading} variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" /> Assess No-Show Risk
              </Button>
              <select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)} className="px-2 py-1 rounded border border-gray-200 bg-background text-sm">
                <option>SMS</option>
                <option>WhatsApp</option>
                <option>email</option>
              </select>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-2 py-1 rounded border border-gray-200 bg-background text-sm">
                <option>English</option>
                <option>Afrikaans</option>
                <option>isiXhosa</option>
                <option>isiZulu</option>
              </select>
              <Button onClick={() => runAssistant("reminders")} disabled={assistant.loading} variant="outline" size="sm">
                {assistant.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
                Draft Reminders
              </Button>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {appointments.map((apt) => (
              <Card key={apt.id} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{apt.patient} <span className="text-xs text-muted-foreground font-normal">· {apt.id}</span></p>
                        <p className="text-xs text-muted-foreground">{apt.doctor} · {apt.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {apt.date} {apt.time}
                      </div>
                      <span className="text-xs text-muted-foreground">{apt.previousNoShows} missed (12 mo)</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${apt.reminderApproved ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {apt.reminderApproved ? "Reminder Approved" : "No Reminder"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DraftPanel
            state={assistant}
            placeholder="Assess no-show risk or draft reminders — patient names are never sent to the AI."
            onReviewed={handleAssistantReviewed}
            downloadName={assistantTask === "reminders" ? "reminders" : "no-show-risk"}
          />
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total Upcoming", value: appointments.length.toString() },
              { label: "With Prior No-shows", value: appointments.filter((a) => a.previousNoShows > 0).length.toString() },
              { label: "Reminders Approved", value: appointments.filter((a) => a.reminderApproved).length.toString() },
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
