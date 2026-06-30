import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import { Header } from "./components/Header";
import { ClinicalTranscription } from "./pages/ClinicalTranscription";
import { AdminAutomation } from "./pages/AdminAutomation";
import { ComplianceSecurity } from "./pages/ComplianceSecurity";
import { Scheduling } from "./pages/Scheduling";
import { DataExtraction } from "./pages/DataExtraction";
import './App.css'

function App() {
  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transcription" element={<ClinicalTranscription />} />
        <Route path="/admin" element={<AdminAutomation />} />
        <Route path="/compliance" element={<ComplianceSecurity />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/data-extraction" element={<DataExtraction />} />
      </Routes>
    </HashRouter>
  );
}

export default App
