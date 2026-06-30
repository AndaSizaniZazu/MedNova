"""Data Extraction Engine — vitals, medications, procedures from clinical text"""

import logging
import asyncio
import re
from typing import List
from models.data_extraction import ExtractionResult, Vital, Medication, HandoverResult

logger = logging.getLogger(__name__)


def _classify_bp(systolic: int, diastolic: int) -> str:
    if systolic >= 180 or diastolic >= 120:
        return "critical"
    if systolic >= 140 or diastolic >= 90:
        return "warning"
    return "normal"


def _classify_hr(hr: int) -> str:
    if hr < 40 or hr > 130:
        return "critical"
    if hr < 60 or hr > 100:
        return "warning"
    return "normal"


def _extract_vitals(text: str) -> List[Vital]:
    vitals = []

    bp_match = re.search(r"(\d{2,3})[/\\](\d{2,3})\s*(?:mmhg)?", text, re.IGNORECASE)
    if bp_match:
        sys_val, dia_val = int(bp_match.group(1)), int(bp_match.group(2))
        vitals.append(Vital(name="Blood Pressure", value=f"{sys_val}/{dia_val}", unit="mmHg", status=_classify_bp(sys_val, dia_val)))

    hr_match = re.search(r"(?:hr|heart rate|pulse)[:\s]+(\d{2,3})\s*(?:bpm)?", text, re.IGNORECASE)
    if hr_match:
        hr = int(hr_match.group(1))
        vitals.append(Vital(name="Heart Rate", value=str(hr), unit="bpm", status=_classify_hr(hr)))

    temp_match = re.search(r"(?:temp(?:erature)?)[:\s]+(\d{2}\.?\d?)\s*(?:°?[cC])?", text, re.IGNORECASE)
    if temp_match:
        temp = float(temp_match.group(1))
        status = "critical" if temp >= 39.5 or temp < 35 else "warning" if temp >= 38 else "normal"
        vitals.append(Vital(name="Temperature", value=str(temp), unit="°C", status=status))

    spo2_match = re.search(r"(?:spo2|o2 sat(?:uration)?)[:\s]+(\d{2,3})\s*%?", text, re.IGNORECASE)
    if spo2_match:
        spo2 = int(spo2_match.group(1))
        status = "critical" if spo2 < 90 else "warning" if spo2 < 95 else "normal"
        vitals.append(Vital(name="SpO2", value=str(spo2), unit="%", status=status))

    return vitals


def _extract_medications(text: str) -> List[Medication]:
    meds = []
    patterns = [
        r"([\w\-]+)\s+(\d+\s*mg)\s+(OD|BD|TDS|QDS|PRN|once daily|twice daily|three times daily)",
        r"([\w\-]+)\s+(\d+\s*mg)\s+(daily|twice|three times|four times)",
    ]
    seen = set()
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            name = match.group(1).capitalize()
            if name.lower() in seen:
                continue
            seen.add(name.lower())
            freq_map = {"od": "Once daily", "bd": "Twice daily", "tds": "Three times daily", "qds": "Four times daily", "prn": "As needed", "daily": "Once daily", "twice": "Twice daily"}
            freq_raw = match.group(3).lower()
            frequency = freq_map.get(freq_raw, match.group(3))
            meds.append(Medication(name=name, dose=match.group(2).strip(), frequency=frequency))
    return meds


def _extract_allergies(text: str) -> List[str]:
    match = re.search(r"allergi(?:es|c)[:\s]+([^\n.]+)", text, re.IGNORECASE)
    if match:
        raw = match.group(1)
        return [a.strip() for a in re.split(r",|;", raw) if a.strip()]
    return []


def _extract_procedures(text: str) -> List[str]:
    keywords = ["ECG", "echocardiogram", "X-ray", "MRI", "CT scan", "ultrasound", "biopsy", "renal function", "full blood count", "troponin", "blood culture", "lumbar puncture"]
    found = []
    for kw in keywords:
        if re.search(rf"\b{re.escape(kw)}\b", text, re.IGNORECASE):
            context_match = re.search(rf"\b{re.escape(kw)}[^\n.]*", text, re.IGNORECASE)
            found.append(context_match.group(0).strip() if context_match else kw)
    return found


def _summarise(text: str) -> str:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return " ".join(lines[:3]) if lines else text[:200]


class DataExtractionEngine:
    async def extract(self, clinical_text: str) -> ExtractionResult:
        await asyncio.sleep(0.1)
        vitals = _extract_vitals(clinical_text)
        medications = _extract_medications(clinical_text)
        allergies = _extract_allergies(clinical_text)
        procedures = _extract_procedures(clinical_text)
        summary = _summarise(clinical_text)
        logger.info(f"Extracted {len(vitals)} vitals, {len(medications)} medications")
        return ExtractionResult(summary=summary, vitals=vitals, medications=medications, procedures=procedures, allergies=allergies)

    async def generate_handover(self, ward: str, shift: str) -> HandoverResult:
        await asyncio.sleep(0.1)
        return HandoverResult(
            shift_summary=f"{ward} {shift} Shift — 07 June 2025. Ward stable. All medications administered as prescribed. No critical incidents this shift.",
            active_cases=12,
            critical_patients=[f"Patient A (Bed 4) — close monitoring", f"Patient B (Bed 7) — post-procedure observation"],
            pending_tasks=["Morning bloods for all patients", "Follow-up echo pending for Bed 2", f"Review {ward} discharge list"],
            notes=f"On-call consultant available for {ward} emergencies. Night handover completed without incident.",
        )
