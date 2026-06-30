"""Clinical Transcription Service"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Optional
import logging
import base64
import sys
import os
from datetime import datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
from models.transcription import TranscriptionRequest, TranscriptionResponse, SOAPNote
from modules.transcription.llm_engine import ClinicalLLMEngine
from modules.compliance.audit_logger import AuditLogger

logger = logging.getLogger(__name__)
router = APIRouter()

llm_engine = ClinicalLLMEngine()
audit_logger = AuditLogger()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_consultation(
    request: TranscriptionRequest,
    background_tasks: BackgroundTasks
):
    """
    Real-time transcription and SOAP note generation
    
    - Processes audio input
    - Generates structured SOAP notes
    - Supports multilingual processing
    - Auto-deletes transcripts for POPIA compliance
    """
    try:
        # Log access for compliance
        await audit_logger.log_data_access(
            user_id="system",
            data_type="audio_consultation",
            action="transcription_start",
            patient_id=request.patient_id
        )
        
        # Decode and process audio
        audio_bytes = base64.b64decode(request.audio_base64)
        
        # Transcribe audio to text
        transcript_result = await llm_engine.transcribe_audio(
            audio_bytes=audio_bytes,
            language=request.language
        )
        
        # Generate SOAP note
        soap_note = await llm_engine.generate_soap_note(
            transcript=transcript_result['text'],
            language=request.language,
            consultation_type=request.consultation_type
        )
        
        response = TranscriptionResponse(
            transcript=transcript_result['text'],
            soap_note=soap_note,
            confidence_score=transcript_result.get('confidence', 0.95),
            processing_time_ms=transcript_result.get('duration', 0)
        )
        
        # Schedule auto-deletion if enabled (POPIA compliance)
        if request.auto_delete_after_processing:
            background_tasks.add_task(
                llm_engine.schedule_transcript_deletion,
                transcript_id=request.patient_id or "temp",
                delay_seconds=3600  # Delete after 1 hour
            )
        
        # Log successful processing
        await audit_logger.log_data_access(
            user_id="system",
            data_type="audio_consultation",
            action="transcription_completed",
            patient_id=request.patient_id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        await audit_logger.log_data_access(
            user_id="system",
            data_type="audio_consultation",
            action="transcription_failed",
            patient_id=request.patient_id,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail="Transcription failed")

@router.get("/languages")
async def get_supported_languages():
    """List supported languages"""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "af", "name": "Afrikaans"},
            {"code": "xh", "name": "isiXhosa"},
            {"code": "zu", "name": "isiZulu"}
        ]
    }

@router.get("/soap-formats")
async def get_soap_formats():
    """Get available SOAP note formats"""
    return {
        "formats": [
            "standard_soap",
            "detailed_clinical",
            "brief_summary"
        ]
    }
