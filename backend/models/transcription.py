"""
Clinical Transcription Module
Handles real-time speech-to-SOAP notes conversion
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AudioInput(BaseModel):
    """Audio input schema"""
    audio_file: bytes
    language: str  # 'en', 'af', 'xh', 'zu'
    patient_id: Optional[str] = None
    consultation_type: str = "general"  # general, follow-up, emergency

class SOAPNote(BaseModel):
    """SOAP Note structure"""
    subjective: str
    objective: str
    assessment: str
    plan: str
    generated_at: datetime
    language: str

class TranscriptionResponse(BaseModel):
    """Transcription response"""
    transcript: str
    soap_note: SOAPNote
    confidence_score: float
    processing_time_ms: int

class TranscriptionRequest(BaseModel):
    """Clinical transcription request"""
    audio_base64: str
    language: str
    patient_id: Optional[str] = None
    consultation_type: str = "general"
    auto_delete_after_processing: bool = True  # POPIA compliance
