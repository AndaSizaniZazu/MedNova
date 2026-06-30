# MedNova AI - Getting Started Guide

## Quick Start

### 1. Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- Git installed

### 2. Clone & Setup

```bash
# Navigate to project directory
cd MedNova

# Copy environment configuration
cp .env.example .env
```

### 3. Backend Setup

```bash
# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Run backend server
python -m uvicorn main:app --reload --port 8000
```

Backend API will be available at: **http://localhost:8000**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. Frontend Setup

In a new terminal:

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## Project Structure Overview

### Frontend (`/src`)
```
src/
├── pages/              # Feature pages
├── components/         # Reusable React components
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

### Backend (`/backend`)
```
backend/
├── modules/           # Feature modules
│   ├── transcription/ # Speech-to-SOAP
│   ├── admin/         # Billing & coding
│   └── compliance/    # Security & audit
├── config/            # Configuration
├── models/            # Data models
└── main.py            # FastAPI app
```

## Available Scripts

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

### Backend
```bash
python -m uvicorn backend.main:app --reload  # Development
python -m uvicorn backend.main:app            # Production
pytest tests/                                  # Run tests
```

## Key Modules

### 1. Clinical Transcription
- **Location**: `/backend/modules/transcription/`
- **Features**: Real-time audio processing, multilingual SOAP note generation
- **Supported Languages**: English, Afrikaans, isiXhosa, isiZulu

### 2. Administrative Automation  
- **Location**: `/backend/modules/admin/`
- **Features**: Medical coding, billing verification, document generation
- **Codes Supported**: ICD-10, CPT, SNOMED

### 3. Compliance & Security
- **Location**: `/backend/modules/compliance/`
- **Features**: RBAC, audit logging, data anonymization, stateless mode
- **Compliance**: POPIA, GDPR compatible

## Configuration

Edit `.env` file for:
- Database credentials
- OpenAI API key
- CORS origins
- Stateless mode settings
- Auto-delete timing

## Database Setup (Optional)

For local development with PostgreSQL:

```bash
# Install PostgreSQL
# Create database:
createdb mednova_db

# Update .env with credentials
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
```

## Testing the API

### Using cURL:

```bash
# Get health status
curl http://localhost:8000/health

# Transcribe audio (example)
curl -X POST http://localhost:8000/api/transcription/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "audio_base64": "base64_encoded_audio",
    "language": "en"
  }'

# Get billing precheck
curl -X POST http://localhost:8000/api/admin/billing/precheck \
  -H "Content-Type: application/json" \
  -d '{
    "claim_id": "CLM-001",
    "provider_id": "PROV-123"
  }'
```

### Using Postman:

1. Import the API collection from `docs/postman_collection.json`
2. Set the base URL to `http://localhost:8000`
3. Execute the requests

## Troubleshooting

### Backend Issues
- **Port already in use**: Change port with `--port 8001`
- **Module not found**: Ensure virtual environment is activated
- **Database connection error**: Check `.env` credentials

### Frontend Issues
- **Dependencies not installing**: Delete `node_modules` and `package-lock.json`, then `npm install`
- **Port conflict**: Change Vite port in `vite.config.ts`

## Next Steps

1. **Customize Configuration**: Update `.env` with your settings
2. **Database Setup**: Configure PostgreSQL or Supabase
3. **API Integration**: Connect frontend to backend endpoints
4. **Testing**: Run test suites
5. **Deployment**: Follow deployment guide

## Support

For issues or questions:
1. Check the IMPLEMENTATION_GUIDE.md for detailed documentation
2. Review API docs at http://localhost:8000/docs
3. Check backend logs for error messages

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [POPIA Act](https://www.justice.gov.za/legislation/acts/2013-04.pdf)
- [HL7 Standards](https://www.hl7.org/)
- [FHIR Resources](https://www.hl7.org/fhir/)
