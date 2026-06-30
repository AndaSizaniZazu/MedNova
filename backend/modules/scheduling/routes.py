"""Scheduling & Patient Flow Service"""

from fastapi import APIRouter, HTTPException
import logging
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
from models.scheduling import AppointmentRequest, Appointment, ReminderRequest, BulkReminderResponse
from modules.scheduling.scheduling_engine import SchedulingEngine
from modules.compliance.audit_logger import AuditLogger

logger = logging.getLogger(__name__)
router = APIRouter()

engine = SchedulingEngine()
audit_logger = AuditLogger()


@router.post("/appointments", response_model=Appointment)
async def book_appointment(request: AppointmentRequest):
    """Book a new appointment with AI no-show risk scoring"""
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="appointment",
            action="book_appointment",
            patient_id=request.patient,
        )
        appointment = await engine.book_appointment(request.dict())
        return appointment
    except Exception as e:
        logger.error(f"Booking error: {e}")
        raise HTTPException(status_code=500, detail="Failed to book appointment")


@router.get("/appointments")
async def list_appointments():
    """List all appointments"""
    try:
        appointments = await engine.get_appointments()
        return {"appointments": appointments, "total": len(appointments)}
    except Exception as e:
        logger.error(f"List error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve appointments")


@router.post("/reminders/send-bulk", response_model=BulkReminderResponse)
async def send_bulk_reminders():
    """Send automated reminders for all upcoming appointments"""
    try:
        await audit_logger.log_data_access(
            user_id="system",
            data_type="reminder",
            action="bulk_reminder_send",
        )
        result = await engine.send_bulk_reminders()
        return result
    except Exception as e:
        logger.error(f"Bulk reminder error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reminders")


@router.post("/reminders/send")
async def send_reminder(request: ReminderRequest):
    """Send reminder for a specific appointment"""
    try:
        result = await engine.send_reminder(request.appointment_id, request.channel)
        return result
    except Exception as e:
        logger.error(f"Reminder error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reminder")
