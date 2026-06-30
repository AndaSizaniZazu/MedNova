"""Data Extraction & Summaries Service"""

from fastapi import APIRouter, HTTPException
import logging
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
from models.data_extraction import ExtractionRequest, ExtractionResult, HandoverRequest, HandoverResult
from modules.data_extraction.extraction_engine import DataExtractionEngine
from modules.compliance.audit_logger import AuditLogger

logger = logging.getLogger(__name__)
router = APIRouter()

engine = DataExtractionEngine()
audit_logger = AuditLogger()


@router.post("/extract", response_model=ExtractionResult)
async def extract_clinical_data(request: ExtractionRequest):
    """Extract vitals, medications, procedures, and allergies from clinical text"""
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="clinical_record",
            action="data_extraction",
            patient_id=request.patient_id,
        )
        result = await engine.extract(request.clinical_text)
        return result
    except Exception as e:
        logger.error(f"Extraction error: {e}")
        raise HTTPException(status_code=500, detail="Data extraction failed")


@router.post("/handover", response_model=HandoverResult)
async def generate_handover(request: HandoverRequest):
    """Generate shift handover report for clinical team"""
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="handover_report",
            action="generate_handover",
        )
        result = await engine.generate_handover(request.ward, request.shift)
        return result
    except Exception as e:
        logger.error(f"Handover generation error: {e}")
        raise HTTPException(status_code=500, detail="Handover generation failed")


@router.post("/summarise")
async def summarise_patient_history(clinical_text: str):
    """Summarise a patient's clinical history from unstructured notes"""
    try:
        result = await engine.extract(clinical_text)
        return {"summary": result.summary, "key_findings": result.vitals}
    except Exception as e:
        logger.error(f"Summarisation error: {e}")
        raise HTTPException(status_code=500, detail="Summarisation failed")
