"""
Admin module models for medical coding and billing
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MedicalCode(BaseModel):
    """Medical coding suggestion"""
    code: str
    type: str  # ICD-10, CPT, SNOMED
    description: str
    confidence: float

class CodingSuggestion(BaseModel):
    """Coding suggestions for clinical notes"""
    clinical_note: str
    suggested_codes: List[MedicalCode]
    primary_diagnosis: MedicalCode

class BillingPrecheck(BaseModel):
    """Pre-billing verification"""
    claim_id: str
    status: str  # valid, warning, error
    issues: List[str]
    recommendations: List[str]

class ReferralLetter(BaseModel):
    """Referral letter generation"""
    patient_name: str
    referral_to: str
    reason: str
    clinical_summary: str
    letter_body: Optional[str] = None
    generated_at: datetime

class DischargeSummary(BaseModel):
    """Discharge summary"""
    patient_id: str
    admission_date: datetime
    discharge_date: datetime
    clinical_course: str
    medications: List[str]
    follow_up: str
