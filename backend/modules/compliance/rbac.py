"""
Security Middleware
Implements Role-Based Access Control (RBAC)
"""

from fastapi import Request, HTTPException, Depends
from typing import Optional, List
import logging
from functools import wraps

logger = logging.getLogger(__name__)

class RBACMiddleware:
    """Role-Based Access Control middleware"""
    
    def __init__(self):
        self.role_permissions = {
            "doctor": ["read_patient", "write_patient", "generate_codes", "generate_referral"],
            "nurse": ["read_patient", "write_vitals"],
            "admin": ["read_all", "write_all", "manage_users", "view_audit"],
            "patient": ["read_own_record"],
            "billing": ["read_claims", "process_claims"]
        }
    
    async def check_permission(
        self,
        user_roles: List[str],
        required_permission: str
    ) -> bool:
        """Check if user has required permission"""
        for role in user_roles:
            if required_permission in self.role_permissions.get(role, []):
                logger.info(f"Permission granted: {required_permission} for role {role}")
                return True
        
        logger.warning(f"Permission denied: {required_permission}")
        return False
    
    async def verify_token(self, request: Request) -> dict:
        """Verify JWT token and extract user info"""
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                raise HTTPException(status_code=401, detail="Missing authorization")
            
            # Placeholder token verification
            token = auth_header.replace("Bearer ", "")
            
            # In production, verify JWT signature
            user_info = {
                "user_id": "user123",
                "roles": ["doctor"],
                "department": "Cardiology"
            }
            
            return user_info
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid token")

rbac = RBACMiddleware()

def require_permission(permission: str):
    """Decorator for permission-based access control"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, request: Request, **kwargs):
            user_info = await rbac.verify_token(request)
            has_permission = await rbac.check_permission(
                user_info.get("roles", []),
                permission
            )
            
            if not has_permission:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            return await func(*args, request=request, **kwargs)
        return wrapper
    return decorator
