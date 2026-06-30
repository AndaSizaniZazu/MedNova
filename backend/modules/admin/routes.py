"""Administrative Automation Service"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
from models.admin import (
    CodingSuggestion, BillingPrecheck, ReferralLetter, 
    DischargeSummary, MedicalCode
)
from modules.admin.coding_engine import MedicalCodingEngine
from modules.admin.billing_engine import BillingEngine
from modules.compliance.audit_logger import AuditLogger

logger = logging.getLogger(__name__)
router = APIRouter()

coding_engine = MedicalCodingEngine()
billing_engine = BillingEngine()
audit_logger = AuditLogger()

@router.post("/coding/suggestions")
async def get_coding_suggestions(clinical_note: str) -> CodingSuggestion:
    """
    Suggest ICD-10 and CPT medical codes from clinical notes
    """
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="clinical_note",
            action="coding_analysis"
        )
        
        suggestions = await coding_engine.suggest_codes(clinical_note)
        return suggestions
        
    except Exception as e:
        logger.error(f"Coding suggestion error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate coding suggestions")

@router.post("/billing/precheck")
async def billing_precheck(claim_data: dict) -> BillingPrecheck:
    """
    Perform pre-billing verification to identify potential claim rejections
    """
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="billing_claim",
            action="precheck_analysis"
        )
        
        precheck_result = await billing_engine.verify_claim(claim_data)
        return precheck_result
        
    except Exception as e:
        logger.error(f"Billing precheck error: {str(e)}")
        raise HTTPException(status_code=500, detail="Billing precheck failed")

class ReferralRequest(BaseModel):
    patient_name: str
    referral_to: str
    reason: str
    clinical_summary: str

class DischargeRequest(BaseModel):
    patient_id: str
    admission_date: str
    discharge_date: str
    clinical_course: str
    medications: List[str]

@router.post("/referral/generate")
async def generate_referral_letter(request: ReferralRequest) -> ReferralLetter:
    """
    Generate referral letters based on clinical information
    """
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="referral_letter",
            action="generation"
        )
        referral = await coding_engine.generate_referral(
            request.patient_name, request.referral_to, request.reason, request.clinical_summary
        )
        referral_dict = referral.dict()
        referral_dict["letter_body"] = (
            f"Dear {request.referral_to},\n\nI am writing to refer my patient, {request.patient_name}, for specialist assessment.\n\n"
            f"Reason for Referral: {request.reason}\n\nClinical Summary:\n{request.clinical_summary}\n\n"
            "I would be grateful for your expert opinion and management of this patient.\n\nYours sincerely,\nDr. [Referring Physician]"
        )
        return ReferralLetter(**referral_dict)

    except Exception as e:
        logger.error(f"Referral generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate referral letter")

@router.post("/discharge/summary")
async def generate_discharge_summary(request: DischargeRequest) -> DischargeSummary:
    """
    Generate discharge summaries from patient records
    """
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="discharge_summary",
            action="generation",
            patient_id=request.patient_id
        )

        summary = await coding_engine.generate_discharge_summary(
            request.patient_id, request.admission_date, request.discharge_date,
            request.clinical_course, request.medications
        )
        return summary
        
    except Exception as e:
        logger.error(f"Discharge summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate discharge summary")

@router.get("/icd10/search")
async def search_icd10_codes(query: str, limit: int = 10) -> List[MedicalCode]:
    """
    Search ICD-10 codes database
    """
    try:
        codes = await coding_engine.search_codes("ICD10", query, limit)
        return codes
    except Exception as e:
        logger.error(f"ICD-10 search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Search failed")

@router.get("/cpt/search")
async def search_cpt_codes(query: str, limit: int = 10) -> List[MedicalCode]:
    """
    Search CPT codes database
    """
    try:
        codes = await coding_engine.search_codes("CPT", query, limit)
        return codes
    except Exception as e:
        logger.error(f"CPT search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Search failed")
