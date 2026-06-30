import AudioRecorder from "./components/AudioRecorder";
import LanguageSelector from "./components/LanguageSelector";
import SOAPNoteDisplay from "./components/SOAPNoteDisplay";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="text-xl font-semibold">MedNova AI</div>
      </nav>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <LanguageSelector />
        <AudioRecorder />
        <SOAPNoteDisplay />
      </main>
    </div>
  );
}