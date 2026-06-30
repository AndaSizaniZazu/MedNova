"""Scheduling engine — appointment allocation and no-show risk scoring"""

import logging
import asyncio
import random
from datetime import datetime
from typing import List, Dict, Any
from models.scheduling import Appointment, BulkReminderResponse

logger = logging.getLogger(__name__)

_appointments: List[Dict[str, Any]] = []


def _no_show_risk(patient: str, appointment_type: str) -> str:
    """Simple heuristic risk scorer — replace with ML model in production."""
    seed = sum(ord(c) for c in patient) + len(appointment_type)
    value = seed % 3
    return ["low", "medium", "high"][value]


class SchedulingEngine:
    async def book_appointment(self, data: Dict[str, Any]) -> Appointment:
        await asyncio.sleep(0.05)
        apt_id = f"APT-{len(_appointments) + 1:03d}"
        risk = _no_show_risk(data.get("patient", ""), data.get("type", ""))
        appointment = Appointment(
            appointment_id=apt_id,
            patient=data.get("patient", "Unknown"),
            doctor=data.get("doctor", "Unknown"),
            date=data.get("date", ""),
            time=data.get("time", ""),
            type=data.get("type", "General Consultation"),
            no_show_risk=risk,
            reminder_sent=False,
            created_at=datetime.now(),
        )
        _appointments.append(appointment.dict())
        logger.info(f"Booked appointment {apt_id} for {appointment.patient}")
        return appointment

    async def get_appointments(self) -> List[Dict[str, Any]]:
        await asyncio.sleep(0.02)
        return _appointments

    async def send_bulk_reminders(self) -> BulkReminderResponse:
        await asyncio.sleep(0.1)
        sent = 0
        ids = []
        for apt in _appointments:
            apt["reminder_sent"] = True
            sent += 1
            ids.append(apt["appointment_id"])
        logger.info(f"Sent reminders for {sent} appointments")
        return BulkReminderResponse(sent_count=sent, failed_count=0, appointment_ids=ids)

    async def send_reminder(self, appointment_id: str, channel: str) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        for apt in _appointments:
            if apt["appointment_id"] == appointment_id:
                apt["reminder_sent"] = True
                return {"status": "sent", "appointment_id": appointment_id, "channel": channel}
        return {"status": "not_found", "appointment_id": appointment_id}
