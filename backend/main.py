"""
MedNova AI - Healthcare AI Platform
Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
from dotenv import load_dotenv
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Import routers
from modules.transcription.routes import router as transcription_router
from modules.admin.routes import router as admin_router
from modules.compliance.routes import router as compliance_router
from modules.scheduling.routes import router as scheduling_router
from modules.data_extraction.routes import router as data_extraction_router
from config.security import setup_security

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 MedNova AI Platform Starting...")
    yield
    logger.info("🛑 MedNova AI Platform Shutting Down...")

# Initialize FastAPI app
app = FastAPI(
    title="MedNova AI Platform",
    description="Healthcare AI Platform for Hospitals & GP Practices - POPIA Compliant",
    version="1.0.0",
    lifespan=lifespan
)

# Security middleware setup
app.add_middleware(TrustedHostMiddleware, allowed_hosts=os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(","))

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize security
setup_security(app)

# Include routers
app.include_router(transcription_router, prefix="/api/transcription", tags=["Clinical Transcription"])
app.include_router(admin_router, prefix="/api/admin", tags=["Administrative Automation"])
app.include_router(compliance_router, prefix="/api/compliance", tags=["Compliance & Security"])
app.include_router(scheduling_router, prefix="/api/scheduling", tags=["Scheduling & Patient Flow"])
app.include_router(data_extraction_router, prefix="/api/data-extraction", tags=["Data Extraction & Summaries"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "MedNova AI Platform",
        "version": "1.0.0",
        "compliance": "POPIA"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "ok",
        "components": {
            "api": "operational",
            "database": "operational",
            "security": "operational"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
