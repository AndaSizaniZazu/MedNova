from pydantic import BaseModel


class TranscribeRequest(BaseModel):
    audio_base64: str
    language: str = "en"


class TranscribeResponse(BaseModel):
    transcript: str
    language: str


class SOAPNoteRequest(BaseModel):
    transcript: str
    patient_context: str = ""


class SOAPNoteResponse(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str
    raw_transcript: str


class ConsultRequest(BaseModel):
    audio_base64: str
    language: str
    patient_context: str = ""


class ConsultResponse(BaseModel):
    transcript: str
    soap: SOAPNoteResponse
    s3_key: str