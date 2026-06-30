"""Database Configuration"""

import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConfig:
    """Database configuration"""
    
    # PostgreSQL settings (for on-premise encrypted storage)
    DB_USER = os.getenv("DB_USER", "mednova_user")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "secure_password")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "mednova_db")
    
    # Supabase settings (cloud option)
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    # Stateless mode
    STATELESS_MODE = os.getenv("STATELESS_MODE", "true").lower() == "true"
    AUTO_DELETE_MINUTES = int(os.getenv("AUTO_DELETE_MINUTES", "60"))
    
    @staticmethod
    def get_connection_string():
        """Get database connection string"""
        if DatabaseConfig.SUPABASE_URL:
            return f"postgresql://{DatabaseConfig.DB_USER}:{DatabaseConfig.DB_PASSWORD}@{DatabaseConfig.DB_HOST}:{DatabaseConfig.DB_PORT}/{DatabaseConfig.DB_NAME}"
        return f"postgresql://{DatabaseConfig.DB_USER}:{DatabaseConfig.DB_PASSWORD}@{DatabaseConfig.DB_HOST}:{DatabaseConfig.DB_PORT}/{DatabaseConfig.DB_NAME}"
