# MedNova AI - Healthcare AI Platform

## Overview

MedNova AI is a comprehensive healthcare AI platform built for hospitals and GP practices in South Africa. It's designed with **Privacy-by-Design** principles and full **POPIA compliance**.

### Core Features

- **Clinical Transcription**: Real-time speech-to-SOAP notes in South African languages
- **Administrative Automation**: Medical coding (ICD-10, CPT), billing pre-checks, referral letters
- **Compliance & Security**: RBAC, audit logging, data anonymization, stateless mode
- **Interoperability**: HL7 and FHIR standards support

## Architecture

### Frontend (React + TypeScript)
- `/src/pages/` - Feature pages with consistent UI/UX
- `/src/components/ui/` - Reusable UI components
- Vite for fast development and builds
- Framer Motion for smooth animations

### Backend (FastAPI + Python)
- `/backend/modules/transcription/` - Clinical transcription engine
- `/backend/modules/admin/` - Administrative automation service
- `/backend/modules/compliance/` - Security & compliance layer
- `/backend/config/` - Configuration management
- `/backend/models/` - Pydantic data models

## Project Structure

```
mednova/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ClinicalTranscription.tsx
│   │   │   ├── AdminAutomation.tsx
│   │   │   └── ComplianceSecurity.tsx
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       └── card.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    ├── modules/
    │   ├── transcription/
    │   │   ├── routes.py
    │   │   └── llm_engine.py
    │   ├── admin/
    │   │   ├── routes.py
    │   │   ├── coding_engine.py
    │   │   └── billing_engine.py
    │   └── compliance/
    │       ├── routes.py
    │       ├── audit_logger.py
    │       ├── rbac.py
    │       ├── anonymizer.py
    │       └── stateless_mode.py
    ├── config/
    │   ├── config.py
    │   ├── database.py
    │   └── security.py
    ├── models/
    │   ├── transcription.py
    │   ├── admin.py
    │   └── compliance.py
    ├── main.py
    └── requirements.txt
```

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp ../.env.example .env
# Edit .env with your configuration
```

3. **Run the backend**:
```bash
python -m uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Run development server**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## API Endpoints

### Clinical Transcription
- `POST /api/transcription/transcribe` - Transcribe audio to SOAP notes
- `GET /api/transcription/languages` - Get supported languages
- `GET /api/transcription/soap-formats` - Get SOAP format options

### Administrative Automation
- `POST /api/admin/coding/suggestions` - Get ICD-10/CPT suggestions
- `POST /api/admin/billing/precheck` - Verify billing claims
- `POST /api/admin/referral/generate` - Generate referral letters
- `POST /api/admin/discharge/summary` - Create discharge summaries
- `GET /api/admin/icd10/search` - Search ICD-10 codes
- `GET /api/admin/cpt/search` - Search CPT codes

### Compliance & Security
- `GET /api/compliance/audit-trail` - Retrieve audit logs
- `POST /api/compliance/anonymize` - Anonymize data
- `GET /api/compliance/rbac/roles` - Get RBAC roles
- `POST /api/compliance/stateless-mode/enable` - Enable stateless mode
- `POST /api/compliance/encryption/enable` - Enable encryption
- `GET /api/compliance/status` - Get compliance status

## Key Features

### Clinical Transcription Module
- **Multilingual Support**: English, Afrikaans, isiXhosa, isiZulu
- **Real-time Processing**: Live transcription during consultations
- **Automatic SOAP Note Generation**: Structured clinical documentation
- **Auto-deletion**: Transcripts deleted after processing for POPIA compliance

### Administrative Automation
- **Medical Coding**: Automatic ICD-10 and CPT code suggestions
- **Billing Verification**: Pre-check claims before submission
- **Document Generation**: Referral letters and discharge summaries
- **Cost Reduction**: Reduce admin overhead by 25-60%

### Compliance & Security
- **Role-Based Access Control (RBAC)**: Different permissions for different roles
- **Audit Logging**: Complete audit trail of all data access
- **Data Anonymization**: Remove PII automatically
- **Stateless Mode**: No patient data stored by default
- **Encryption**: TLS/SSL and end-to-end encryption
- **POPIA Compliance**: Full POPIA-compliant architecture

## Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
DEBUG=false
SECRET_KEY=your-secret-key-change-in-production

# Database
DB_USER=mednova_user
DB_PASSWORD=secure_password_change_this
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mednova_db

# Supabase (optional)
SUPABASE_URL=
SUPABASE_KEY=

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here

# Security
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Stateless Mode
STATELESS_MODE=true
AUTO_DELETE_MINUTES=60
```

## Security & Privacy

- **Privacy-by-Design**: Data minimization principle applied throughout
- **Stateless Mode**: Patient data not stored unless explicitly requested
- **Encryption**: All data encrypted in transit and at rest
- **Audit Trails**: Complete logging of all data access
- **POPIA Compliance**: Full compliance with Protection of Personal Information Act

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
npm run test
```

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Production Considerations
- Use production-grade database (PostgreSQL with encryption)
- Enable TLS/SSL certificates
- Set strong SECRET_KEY
- Configure proper CORS origins
- Enable audit logging
- Use environment-specific .env files

## Technology Stack

### Frontend
- React 19.2
- TypeScript 5.9
- Vite 7.3
- Framer Motion 11
- TailwindCSS (via shadcn/ui)
- React Router 7
- Lucide React Icons

### Backend
- FastAPI 0.109
- Python 3.10+
- SQLAlchemy 2.0 (Database ORM)
- Pydantic 2.5 (Data validation)
- OpenAI (LLM)
- Librosa (Audio processing)
- Cryptography (Security)

## Compliance Standards

- **POPIA**: Protection of Personal Information Act (South Africa)
- **HL7**: Health Level 7 standards
- **FHIR**: Fast Healthcare Interoperability Resources
- **ICD-10**: International Classification of Diseases
- **CPT**: Current Procedural Terminology

## Support & Documentation

- API Documentation: `http://localhost:8000/docs` (Swagger UI)
- ReDoc Documentation: `http://localhost:8000/redoc`

## License

Proprietary - MedNova Healthcare AI Platform

## Contact

For support and inquiries, contact the MedNova team.
