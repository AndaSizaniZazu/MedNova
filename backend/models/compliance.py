"""
Compliance & Security models
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLog(BaseModel):
    """Audit log entry"""
    timestamp: datetime
    user_id: str
    action: str
    data_type: str
    patient_id: Optional[str] = None
    status: str  # success, failed
    details: Optional[Dict[str, Any]] = None

class AccessControl(BaseModel):
    """User access control settings"""
    user_id: str
    roles: list  # e.g., ["doctor", "nurse", "admin"]
    permissions: list
    department: str

class DataAnonymization(BaseModel):
    """Anonymization request"""
    data: str
    anonymization_level: str  # strict, moderate, light

class StatelessModeConfig(BaseModel):
    """Stateless mode configuration"""
    enabled: bool
    auto_delete_minutes: int = 60
    encryption_enabled: bool = True
