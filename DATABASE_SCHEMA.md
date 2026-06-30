# MedNova AI - Database Schema Guide

## Overview

This guide covers the database structure for MedNova AI. The system supports both traditional PostgreSQL and Supabase (cloud option).

## Database Configuration

### Option 1: PostgreSQL (Local)
```bash
# Install PostgreSQL
# Create database
createdb mednova_db

# Update .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=mednova_user
DB_PASSWORD=secure_password
DB_NAME=mednova_db
```

### Option 2: Supabase (Cloud)
```bash
# Update .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

---

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    department VARCHAR(100),
    roles TEXT[] DEFAULT ARRAY['user'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department);
```

### 2. Patients Table
```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    medical_aid_member BOOLEAN DEFAULT false,
    medical_aid_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_email ON patients(email);
```

### 3. Consultations Table
```sql
CREATE TABLE consultations (
    id SERIAL PRIMARY KEY,
    consultation_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    clinician_id VARCHAR(50) NOT NULL REFERENCES users(user_id),
    consultation_type VARCHAR(50),
    consultation_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    language_used VARCHAR(10),
    is_stateless BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_clinician ON consultations(clinician_id);
CREATE INDEX idx_consultations_date ON consultations(consultation_date);
```

### 4. Transcripts Table
```sql
CREATE TABLE transcripts (
    id SERIAL PRIMARY KEY,
    transcript_id VARCHAR(50) UNIQUE NOT NULL,
    consultation_id VARCHAR(50) NOT NULL REFERENCES consultations(consultation_id),
    audio_duration_seconds INTEGER,
    transcript_text TEXT,
    language VARCHAR(10),
    confidence_score FLOAT,
    processing_time_ms INTEGER,
    auto_delete_scheduled BOOLEAN DEFAULT true,
    deletion_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_transcripts_consultation ON transcripts(consultation_id);
CREATE INDEX idx_transcripts_deletion ON transcripts(deletion_timestamp);
```

### 5. SOAP Notes Table
```sql
CREATE TABLE soap_notes (
    id SERIAL PRIMARY KEY,
    soap_note_id VARCHAR(50) UNIQUE NOT NULL,
    consultation_id VARCHAR(50) NOT NULL REFERENCES consultations(consultation_id),
    transcript_id VARCHAR(50) REFERENCES transcripts(transcript_id),
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    generated_from_transcript BOOLEAN DEFAULT true,
    language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_soap_notes_consultation ON soap_notes(consultation_id);
```

### 6. Medical Codes Table
```sql
CREATE TABLE medical_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    code_type VARCHAR(20), -- ICD-10, CPT, SNOMED
    description TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_codes_type ON medical_codes(code_type);
CREATE INDEX idx_codes_category ON medical_codes(category);
CREATE FULLTEXT INDEX idx_codes_description ON medical_codes(description);
```

### 7. Clinical Notes Table
```sql
CREATE TABLE clinical_notes (
    id SERIAL PRIMARY KEY,
    note_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    consultation_id VARCHAR(50) REFERENCES consultations(consultation_id),
    note_type VARCHAR(50), -- referral, discharge, progress
    note_content TEXT NOT NULL,
    associated_codes TEXT[],
    created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_patient ON clinical_notes(patient_id);
CREATE INDEX idx_notes_type ON clinical_notes(note_type);
```

### 8. Billing Claims Table
```sql
CREATE TABLE billing_claims (
    id SERIAL PRIMARY KEY,
    claim_id VARCHAR(50) UNIQUE NOT NULL,
    consultation_id VARCHAR(50) REFERENCES consultations(consultation_id),
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    provider_id VARCHAR(50) NOT NULL,
    icd_codes TEXT[] NOT NULL,
    cpt_codes TEXT[] NOT NULL,
    claim_amount DECIMAL(10, 2),
    claim_status VARCHAR(20), -- draft, submitted, approved, rejected
    submission_date TIMESTAMP,
    validation_errors TEXT[],
    validation_warnings TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claims_patient ON billing_claims(patient_id);
CREATE INDEX idx_claims_status ON billing_claims(claim_status);
```

### 9. Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    log_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    data_type VARCHAR(100),
    patient_id VARCHAR(50),
    resource_id VARCHAR(50),
    status VARCHAR(20), -- success, failed
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_patient ON audit_logs(patient_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
CREATE INDEX idx_audit_status ON audit_logs(status);
```

### 10. Encryption Keys Table
```sql
CREATE TABLE encryption_keys (
    id SERIAL PRIMARY KEY,
    key_id VARCHAR(50) UNIQUE NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    key_type VARCHAR(50), -- RSA, AES, etc.
    algorithm VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    rotation_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_keys_active ON encryption_keys(is_active);
```

### 11. Settings Table
```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50), -- string, boolean, integer, json
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(setting_key);
```

---

## Sample SQL Initialization

```sql
-- Create extension for UUID generation (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sample users
INSERT INTO users (user_id, email, password_hash, full_name, department, roles)
VALUES 
    ('DR-001', 'dr.smith@hospital.com', 'hash', 'Dr. Smith', 'Cardiology', ARRAY['doctor']),
    ('NURSE-001', 'nurse.johnson@hospital.com', 'hash', 'Nurse Johnson', 'Cardiology', ARRAY['nurse']),
    ('ADMIN-001', 'admin@hospital.com', 'hash', 'Admin User', 'Administration', ARRAY['admin']);

-- Create sample patient
INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender)
VALUES ('PAT-001', 'John', 'Doe', '1980-01-15', 'M');

-- Insert common ICD-10 codes
INSERT INTO medical_codes (code, code_type, description, category)
VALUES 
    ('I10', 'ICD-10', 'Essential (primary) hypertension', 'Circulatory'),
    ('E11', 'ICD-10', 'Type 2 diabetes mellitus', 'Metabolic'),
    ('M79.3', 'ICD-10', 'Panniculitis, unspecified', 'Musculoskeletal');

-- Insert common CPT codes
INSERT INTO medical_codes (code, code_type, description, category)
VALUES 
    ('99213', 'CPT', 'Office/outpatient visit - established patient', 'Evaluation'),
    ('99214', 'CPT', 'Office/outpatient visit - established patient, moderate', 'Evaluation');
```

---

## Data Encryption

### Sensitive Data to Encrypt
- `passwords` - Always hashed and salted
- `contact_number` - Patient phone numbers
- `address` - Patient addresses
- `medical_aid_number` - Medical aid details
- `transcript_text` - Audio transcripts (before deletion)

### Encryption Implementation
```python
from cryptography.fernet import Fernet

# Generate key (store securely in environment)
key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt data
encrypted = cipher.encrypt(data.encode())

# Decrypt data
decrypted = cipher.decrypt(encrypted).decode()
```

---

## Backup & Disaster Recovery

### Backup Schedule
- Daily incremental backups
- Weekly full backups
- Monthly archive backups

### Backup Locations
- Primary: Secure on-premise storage
- Secondary: Encrypted cloud backup
- Tertiary: Off-site archive

### Recovery Procedures
```sql
-- Backup command
pg_dump mednova_db > backup_$(date +%Y%m%d_%H%M%S).sql

-- Restore command
psql mednova_db < backup_2024_02_21_100000.sql
```

---

## Performance Optimization

### Recommended Indexes
✅ All primary and foreign key indexes
✅ Date range indexes for audit logs
✅ Patient and consultation lookups
✅ Full-text search on medical descriptions

### Query Performance Tips
- Use EXPLAIN ANALYZE for query optimization
- Monitor slow query log
- Archive old audit logs regularly
- Partition large tables by date

---

## POPIA Compliance

### Data Retention Policies
- **Transcripts**: Auto-deleted after 1 hour (configurable)
- **Audit Logs**: Retained for 7 years
- **Medical Records**: Retained per healthcare regulations
- **User Data**: Deleted 30 days after account deactivation

### Data Access Control
```sql
-- Create role with limited permissions
CREATE ROLE clinician_role;
GRANT SELECT, INSERT ON TABLE consultations TO clinician_role;
GRANT SELECT, INSERT ON TABLE soap_notes TO clinician_role;

-- User restrictions
GRANT clinician_role TO 'dr.smith@hospital.com';
```

### Anonymization
- Patient names: Replace with identifiers
- Contact info: Hash or remove
- Addresses: Replace with postal code only
- Dates: Shift by random interval

---

## Migration Strategy

### Alembic Setup (SQLAlchemy Migrations)
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### Migration File Example
```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String(255), unique=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

def downgrade():
    op.drop_table('users')
```

---

## Monitoring & Maintenance

### Health Checks
```sql
-- Connection count
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes;
```

---

## Production Checklist

✅ PostgreSQL configured with proper authentication
✅ Daily automated backups in place
✅ Encryption keys securely stored
✅ Audit logging enabled
✅ POPIA retention policies implemented
✅ Database monitoring configured
✅ Query performance optimized
✅ Disaster recovery plan tested

---

For more information, refer to:
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Supabase Docs: https://supabase.com/docs
- SQLAlchemy: https://docs.sqlalchemy.org/
