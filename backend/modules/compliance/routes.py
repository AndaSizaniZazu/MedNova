"""Compliance & Security Service"""

from fastapi import APIRouter, HTTPException, Request
import logging
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
from models.compliance import (
    AuditLog, AccessControl, DataAnonymization, StatelessModeConfig
)
from modules.compliance.audit_logger import AuditLogger
from modules.compliance.rbac import rbac, require_permission
from modules.compliance.anonymizer import DataAnonymizer
from modules.compliance.stateless_mode import StatelessModeManager

logger = logging.getLogger(__name__)
router = APIRouter()

audit_logger = AuditLogger()
anonymizer = DataAnonymizer()
stateless_manager = StatelessModeManager()

@router.get("/audit-trail")
@require_permission("view_audit")
async def get_audit_trail(
    request: Request,
    patient_id: str = None,
    user_id: str = None,
    action: str = None
):
    """Retrieve audit trail for compliance"""
    try:
        logs = await audit_logger.get_audit_trail(
            patient_id=patient_id,
            user_id=user_id,
            action=action
        )
        return {"audit_logs": logs}
    except Exception as e:
        logger.error(f"Audit trail retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve audit trail")

@router.post("/anonymize")
@require_permission("write_all")
async def anonymize_data(
    request: Request,
    data: str,
    level: str = "strict"
) -> DataAnonymization:
    """Anonymize data to prevent PII leakage"""
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="anonymization",
            action="anonymize_data"
        )
        
        if level == "strict":
            anonymized = anonymizer.anonymize_strict(data)
        elif level == "moderate":
            anonymized = anonymizer.anonymize_moderate(data)
        else:
            anonymized = anonymizer.anonymize_light(data)
        
        return DataAnonymization(
            data=anonymized,
            anonymization_level=level
        )
    except Exception as e:
        logger.error(f"Anonymization failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Anonymization failed")

@router.get("/rbac/roles")
@require_permission("view_audit")
async def get_available_roles(request: Request):
    """Get available RBAC roles"""
    return {
        "roles": list(rbac.role_permissions.keys()),
        "permissions": rbac.role_permissions
    }

@router.post("/stateless-mode/enable")
@require_permission("manage_users")
async def enable_stateless_mode(
    request: Request,
    auto_delete_minutes: int = 60
):
    """Enable stateless mode for POPIA compliance"""
    try:
        await stateless_manager.enable_stateless_mode(auto_delete_minutes)
        
        await audit_logger.log_data_access(
            user_id="system",
            data_type="configuration",
            action="stateless_mode_enabled"
        )
        
        return {
            "status": "enabled",
            "auto_delete_minutes": auto_delete_minutes,
            "encryption": stateless_manager.encryption_enabled
        }
    except Exception as e:
        logger.error(f"Failed to enable stateless mode: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to enable stateless mode")

@router.post("/encryption/enable")
@require_permission("manage_users")
async def enable_encryption(request: Request):
    """Enable encrypted on-premise storage"""
    try:
        await stateless_manager.enable_encrypted_storage()
        
        await audit_logger.log_data_access(
            user_id="system",
            data_type="configuration",
            action="encryption_enabled"
        )
        
        return {"status": "encryption_enabled"}
    except Exception as e:
        logger.error(f"Failed to enable encryption: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to enable encryption")

@router.get("/status")
async def compliance_status():
    """Get current compliance status"""
    return {
        "stateless_mode": stateless_manager.enabled,
        "auto_delete_minutes": stateless_manager.auto_delete_minutes,
        "encryption_enabled": stateless_manager.encryption_enabled,
        "audit_logging": "active"
    }
