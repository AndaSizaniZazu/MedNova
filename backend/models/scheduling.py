from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AppointmentRequest(BaseModel):
    patient: str
    doctor: str
    date: str
    time: str
    type: str = "General Consultation"

class Appointment(BaseModel):
    appointment_id: str
    patient: str
    doctor: str
    date: str
    time: str
    type: str
    no_show_risk: str  # low, medium, high
    reminder_sent: bool = False
    created_at: datetime

class ReminderRequest(BaseModel):
    appointment_id: str
    channel: str = "sms"  # sms, email, both

class BulkReminderResponse(BaseModel):
    sent_count: int
    failed_count: int
    appointment_ids: List[str]
