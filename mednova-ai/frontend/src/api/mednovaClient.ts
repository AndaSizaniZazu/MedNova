import axios from "axios";
import type {
  ConsultResponse,
  SOAPNote,
  TranscribeResponse,
} from "../types/mednova";

const client = axios.create({
  baseURL: "/api",
});

export async function transcribeAudio(audioBase64: string, language: string) {
  const response = await client.post<TranscribeResponse>(
    "/transcription/transcribe",
    {
      audio_base64: audioBase64,
      language,
    }
  );
  return response.data;
}

export async function generateSOAPNote(transcript: string, patientContext = "") {
  const response = await client.post<SOAPNote>("/transcription/generate-notes", {
    transcript,
    patient_context: patientContext,
  });
  return response.data;
}

export async function runConsult(
  audioBase64: string,
  language: string,
  patientContext = ""
) {
  const response = await client.post<ConsultResponse>("/transcription/consult", {
    audio_base64: audioBase64,
    language,
    patient_context: patientContext,
  });
  return response.data;
}