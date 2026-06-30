from fastapi import APIRouter
from app.models.schemas import (
    TranscribeRequest,
    TranscribeResponse,
    SOAPNoteRequest,
    SOAPNoteResponse,
    ConsultRequest,
    ConsultResponse,
)

router = APIRouter()


@router.post("/transcribe", response_model=TranscribeResponse)
def transcribe_audio(payload: TranscribeRequest):
    return {"transcript": "placeholder", "language": payload.language}


@router.post("/generate-notes", response_model=SOAPNoteResponse)
def generate_notes(payload: SOAPNoteRequest):
    return {
        "subjective": "",
        "objective": "",
        "assessment": "",
        "plan": "",
        "raw_transcript": payload.transcript,
    }


@router.post("/consult", response_model=ConsultResponse)
def consult(payload: ConsultRequest):
    soap = {
        "subjective": "",
        "objective": "",
        "assessment": "",
        "plan": "",
        "raw_transcript": "placeholder",
    }
    return {
        "transcript": "placeholder",
        "soap": soap,
        "s3_key": "",
    }