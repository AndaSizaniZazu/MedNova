from pydantic import BaseModel
from typing import List, Optional

class Vital(BaseModel):
    name: str
    value: str
    unit: str
    status: str  # normal, warning, critical

class Medication(BaseModel):
    name: str
    dose: str
    frequency: str

class ExtractionRequest(BaseModel):
    clinical_text: str
    patient_id: Optional[str] = None

class ExtractionResult(BaseModel):
    summary: str
    vitals: List[Vital]
    medications: List[Medication]
    procedures: List[str]
    allergies: List[str]

class HandoverRequest(BaseModel):
    ward: str
    shift: str  # Day, Evening, Night

class HandoverResult(BaseModel):
    shift_summary: str
    active_cases: int
    critical_patients: List[str]
    pending_tasks: List[str]
    notes: str
