"""
Audit Logging System
Records every data access event for compliance
"""

import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime
from models.compliance import AuditLog

logger = logging.getLogger(__name__)

class AuditLogger:
    """Audit logging system for POPIA compliance"""
    
    def __init__(self):
        self.audit_logs = []
        self.log_file = "audit_logs.jsonl"
    
    async def log_data_access(
        self,
        user_id: str,
        data_type: str,
        action: str,
        patient_id: Optional[str] = None,
        status: str = "success",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log data access event"""
        try:
            log_entry = AuditLog(
                timestamp=datetime.now(),
                user_id=user_id,
                action=action,
                data_type=data_type,
                patient_id=patient_id,
                status=status,
                details=details or {}
            )
            
            # Log to console
            logger.info(
                f"AUDIT: {user_id} - {action} - {data_type}"
                f"{' - ' + patient_id if patient_id else ''}"
            )
            
            # Persist to file
            with open(self.log_file, 'a') as f:
                f.write(log_entry.model_dump_json() + '\n')
            
            self.audit_logs.append(log_entry)
            
        except Exception as e:
            logger.error(f"Failed to log audit event: {str(e)}")
    
    async def get_audit_trail(
        self,
        patient_id: Optional[str] = None,
        user_id: Optional[str] = None,
        action: Optional[str] = None
    ) -> list:
        """Retrieve audit trail with filters"""
        try:
            logs = self.audit_logs
            
            if patient_id:
                logs = [log for log in logs if log.patient_id == patient_id]
            
            if user_id:
                logs = [log for log in logs if log.user_id == user_id]
            
            if action:
                logs = [log for log in logs if log.action == action]
            
            return logs
        except Exception as e:
            logger.error(f"Failed to retrieve audit trail: {str(e)}")
            return []
