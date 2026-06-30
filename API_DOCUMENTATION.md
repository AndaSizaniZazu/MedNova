# MedNova AI - API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
Most endpoints require Bearer token authentication:
```
Authorization: Bearer {token}
```

---

## 1. Clinical Transcription Endpoints

### Transcribe Audio to SOAP Note
```
POST /api/transcription/transcribe
```

**Request Body:**
```json
{
  "audio_base64": "base64_encoded_audio_file",
  "language": "en",
  "patient_id": "PAT-12345",
  "consultation_type": "general",
  "auto_delete_after_processing": true
}
```

**Parameters:**
- `audio_base64` (string, required): Base64 encoded audio file
- `language` (string, required): Language code (en, af, xh, zu)
- `patient_id` (string, optional): Patient identifier
- `consultation_type` (string, optional): Type of consultation
- `auto_delete_after_processing` (boolean, optional): Auto-delete transcript

**Response:**
```json
{
  "transcript": "Patient reports persistent headaches for 2 weeks...",
  "soap_note": {
    "subjective": "Patient reports persistent headaches for 2 weeks, pain severity 7/10",
    "objective": "Blood pressure: 130/85, Temperature: 37.2°C",
    "assessment": "Tension headache, possibly migraine-related",
    "plan": "Prescribe paracetamol 500mg, recommend rest",
    "generated_at": "2024-02-21T10:30:00",
    "language": "en"
  },
  "confidence_score": 0.95,
  "processing_time_ms": 2340
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request
- `500`: Server error

---

### Get Supported Languages
```
GET /api/transcription/languages
```

**Response:**
```json
{
  "languages": [
    {"code": "en", "name": "English"},
    {"code": "af", "name": "Afrikaans"},
    {"code": "xh", "name": "isiXhosa"},
    {"code": "zu", "name": "isiZulu"}
  ]
}
```

---

### Get SOAP Note Formats
```
GET /api/transcription/soap-formats
```

**Response:**
```json
{
  "formats": [
    "standard_soap",
    "detailed_clinical",
    "brief_summary"
  ]
}
```

---

## 2. Administrative Automation Endpoints

### Get Medical Coding Suggestions
```
POST /api/admin/coding/suggestions
```

**Request Body:**
```json
{
  "clinical_note": "Patient presents with hypertension and mild dyslipidemia..."
}
```

**Response:**
```json
{
  "clinical_note": "Patient presents with hypertension...",
  "suggested_codes": [
    {
      "code": "I10",
      "type": "ICD-10",
      "description": "Essential (primary) hypertension",
      "confidence": 0.95
    },
    {
      "code": "99213",
      "type": "CPT",
      "description": "Office/outpatient visit",
      "confidence": 0.88
    }
  ],
  "primary_diagnosis": {
    "code": "I10",
    "type": "ICD-10",
    "description": "Essential hypertension",
    "confidence": 0.95
  }
}
```

---

### Billing Pre-check
```
POST /api/admin/billing/precheck
```

**Request Body:**
```json
{
  "claim_id": "CLM-001",
  "provider_id": "PROV-123",
  "patient_id": "PAT-456",
  "icd_codes": ["I10", "E78.5"],
  "cpt_codes": ["99213"]
}
```

**Response:**
```json
{
  "claim_id": "CLM-001",
  "status": "valid",
  "issues": [],
  "recommendations": [
    "Claim appears to be valid for submission",
    "Consider adding modifier -25 for additional procedures"
  ]
}
```

**Status Options:**
- `valid`: Claim ready for submission
- `warning`: Review recommended
- `error`: Issues preventing submission

---

### Generate Referral Letter
```
POST /api/admin/referral/generate
```

**Query Parameters:**
- `patient_name`: Patient's full name
- `referral_to`: Specialist/facility name
- `reason`: Reason for referral
- `clinical_summary`: Clinical findings

**Response:**
```json
{
  "patient_name": "John Doe",
  "referral_to": "Dr. Smith - Cardiology",
  "reason": "Hypertension management",
  "clinical_summary": "Patient with elevated BP...",
  "generated_at": "2024-02-21T10:30:00"
}
```

---

### Generate Discharge Summary
```
POST /api/admin/discharge/summary
```

**Query Parameters:**
- `patient_id`: Patient identifier
- `admission_date`: Admission date (ISO format)
- `discharge_date`: Discharge date (ISO format)
- `clinical_course`: Clinical course description
- `medications`: List of medications

**Response:**
```json
{
  "patient_id": "PAT-456",
  "admission_date": "2024-02-15T09:00:00",
  "discharge_date": "2024-02-21T14:00:00",
  "clinical_course": "Stable throughout admission...",
  "medications": ["Lisinopril 10mg daily", "Atorvastatin 20mg daily"],
  "follow_up": "Follow-up appointment in 2 weeks"
}
```

---

### Search ICD-10 Codes
```
GET /api/admin/icd10/search
```

**Query Parameters:**
- `query` (string, required): Search term
- `limit` (integer, optional, default: 10): Number of results

**Response:**
```json
[
  {
    "code": "I10",
    "type": "ICD-10",
    "description": "Essential hypertension",
    "confidence": 0.95
  }
]
```

---

### Search CPT Codes
```
GET /api/admin/cpt/search
```

**Query Parameters:**
- `query` (string, required): Search term
- `limit` (integer, optional, default: 10): Number of results

**Response:**
```json
[
  {
    "code": "99213",
    "type": "CPT",
    "description": "Office/outpatient visit",
    "confidence": 0.95
  }
]
```

---

## 3. Compliance & Security Endpoints

### Get Audit Trail
```
GET /api/compliance/audit-trail
```

**Query Parameters:**
- `patient_id` (string, optional): Filter by patient
- `user_id` (string, optional): Filter by user
- `action` (string, optional): Filter by action

**Response:**
```json
{
  "audit_logs": [
    {
      "timestamp": "2024-02-21T10:30:00",
      "user_id": "DR-001",
      "action": "transcription_completed",
      "data_type": "audio_consultation",
      "patient_id": "PAT-123",
      "status": "success",
      "details": {}
    }
  ]
}
```

---

### Anonymize Data
```
POST /api/compliance/anonymize
```

**Request Body:**
```json
{
  "data": "Patient John Doe, email: john@example.com, phone: 555-1234",
  "level": "strict"
}
```

**Parameters:**
- `level` (string): Anonymization level
  - `strict`: Remove all PII (names, emails, phones, dates, IDs)
  - `moderate`: Remove most PII
  - `light`: Remove only direct identifiers

**Response:**
```json
{
  "data": "Patient [NAME], email: [EMAIL], phone: [PHONE]",
  "anonymization_level": "strict"
}
```

---

### Get RBAC Roles
```
GET /api/compliance/rbac/roles
```

**Response:**
```json
{
  "roles": [
    "doctor",
    "nurse",
    "admin",
    "patient",
    "billing"
  ],
  "permissions": {
    "doctor": [
      "read_patient",
      "write_patient",
      "generate_codes",
      "generate_referral"
    ],
    "admin": [
      "read_all",
      "write_all",
      "manage_users",
      "view_audit"
    ]
  }
}
```

---

### Enable Stateless Mode
```
POST /api/compliance/stateless-mode/enable
```

**Query Parameters:**
- `auto_delete_minutes` (integer, optional, default: 60): Auto-delete delay

**Response:**
```json
{
  "status": "enabled",
  "auto_delete_minutes": 60,
  "encryption": true
}
```

---

### Enable Encryption
```
POST /api/compliance/encryption/enable
```

**Response:**
```json
{
  "status": "encryption_enabled"
}
```

---

### Get Compliance Status
```
GET /api/compliance/status
```

**Response:**
```json
{
  "stateless_mode": true,
  "auto_delete_minutes": 60,
  "encryption_enabled": true,
  "audit_logging": "active"
}
```

---

## Health Check Endpoints

### Root Endpoint
```
GET /
```

**Response:**
```json
{
  "status": "healthy",
  "service": "MedNova AI Platform",
  "version": "1.0.0",
  "compliance": "POPIA"
}
```

---

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "components": {
    "api": "operational",
    "database": "operational",
    "security": "operational"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing the issue"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Standard endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

---

## Example Integration

### cURL Example
```bash
curl -X POST http://localhost:8000/api/transcription/transcribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "audio_base64": "UklGRi4...",
    "language": "en"
  }'
```

### Python Example
```python
import requests

url = "http://localhost:8000/api/transcription/transcribe"
headers = {
    "Authorization": "Bearer your_token_here",
    "Content-Type": "application/json"
}
data = {
    "audio_base64": "UklGRi4...",
    "language": "en"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

### JavaScript Example
```javascript
fetch('http://localhost:8000/api/transcription/transcribe', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_token_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audio_base64: 'UklGRi4...',
    language: 'en'
  })
})
.then(response => response.json())
.then(data => console.log(data))
```

---

## Interactive API Documentation

Access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
