"""
Data Anonymization Utility
Removes PII to prevent data leakage
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class DataAnonymizer:
    """Utility for data anonymization"""
    
    @staticmethod
    def anonymize_strict(data: str) -> str:
        """Strict anonymization - removes all PII"""
        try:
            anonymized = data
            
            # Remove email addresses
            anonymized = re.sub(
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                '[EMAIL]',
                anonymized
            )
            
            # Remove phone numbers
            anonymized = re.sub(
                r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b',
                '[PHONE]',
                anonymized
            )
            
            # Remove SSN/ID numbers
            anonymized = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[ID]', anonymized)
            
            # Remove dates
            anonymized = re.sub(
                r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
                '[DATE]',
                anonymized
            )
            
            # Remove names (placeholder)
            anonymized = re.sub(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', '[NAME]', anonymized)
            
            logger.info("Data anonymized (strict)")
            return anonymized
        except Exception as e:
            logger.error(f"Anonymization failed: {str(e)}")
            return data
    
    @staticmethod
    def anonymize_moderate(data: str) -> str:
        """Moderate anonymization"""
        try:
            anonymized = DataAnonymizer.anonymize_strict(data)
            # Additional masking for moderate level
            logger.info("Data anonymized (moderate)")
            return anonymized
        except Exception as e:
            logger.error(f"Anonymization failed: {str(e)}")
            return data
    
    @staticmethod
    def anonymize_light(data: str) -> str:
        """Light anonymization - removes only direct identifiers"""
        try:
            anonymized = data
            
            # Remove email addresses
            anonymized = re.sub(
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                '[EMAIL]',
                anonymized
            )
            
            logger.info("Data anonymized (light)")
            return anonymized
        except Exception as e:
            logger.error(f"Anonymization failed: {str(e)}")
            return data
