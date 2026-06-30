export interface TranscribeResponse {
  transcript: string;
  language: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  raw_transcript: string;
}

export interface ConsultResponse {
  transcript: string;
  soap: SOAPNote;
  s3_key: string;
}

export type SupportedLanguage = "en" | "af" | "zu" | "xh";