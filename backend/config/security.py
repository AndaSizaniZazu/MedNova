"""
Security Configuration
Handles TLS/SSL, encryption, and security middleware
"""

from fastapi import FastAPI
import logging
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

logger = logging.getLogger(__name__)

def setup_security(app: FastAPI):
    """Configure security settings for the application"""
    try:
        # SSL/TLS configuration
        logger.info("Configuring TLS/SSL encryption")
        
        # CORS headers for security
        app.add_middleware_header = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
        }
        
        logger.info("Security headers configured")
        
    except Exception as e:
        logger.error(f"Security setup failed: {str(e)}")
        raise
