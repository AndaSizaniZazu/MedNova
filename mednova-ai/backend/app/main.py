from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.transcription import router as transcription_router

app = FastAPI(title="MedNova AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "mednova-ai"}


app.include_router(transcription_router, prefix="/api/transcription", tags=["transcription"])