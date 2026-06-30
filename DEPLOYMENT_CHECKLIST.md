# MedNova AI - Deployment & Production Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] All tests passing (`pytest tests/`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] TypeScript compilation successful (`tsc -b`)
- [ ] Code coverage > 80%
- [ ] No console errors or warnings
- [ ] Security vulnerabilities scanned (`npm audit`)

### Backend Preparation
- [ ] All environment variables set in `.env`
- [ ] Database connection tested
- [ ] API documentation generated
- [ ] Error handling comprehensive
- [ ] Logging configured for production
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented

### Frontend Preparation
- [ ] Production build tested (`npm run build`)
- [ ] Bundle size acceptable
- [ ] All routes working
- [ ] API endpoints configured for production
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Responsive design verified

### Security Audit
- [ ] No hardcoded credentials
- [ ] Environment variables for all secrets
- [ ] TLS/SSL certificates ready
- [ ] Authentication/authorization working
- [ ] RBAC roles properly defined
- [ ] Data encryption enabled
- [ ] Audit logging active
- [ ] POPIA compliance verified

---

## Database Deployment

### PostgreSQL Setup
```bash
# Create production database
createdb mednova_db_prod

# Initialize schema
psql mednova_db_prod < schema_dump.sql

# Run migrations
alembic upgrade head

# Verify tables
psql mednova_db_prod -c "\dt"
```

### Backup Configuration
```bash
# Set up automated backups
0 2 * * * pg_dump mednova_db_prod > /backups/mednova_$(date +\%Y\%m\%d).sql

# Encrypt backup
gpg --symmetric /backups/mednova_20240221.sql

# Upload to cloud storage
aws s3 cp /backups/mednova_20240221.sql.gpg s3://mednova-backups/
```

### Database Optimization
```sql
-- Analyze tables for query optimization
ANALYZE;

-- Rebuild indexes
REINDEX DATABASE mednova_db_prod;

-- Update table statistics
VACUUM ANALYZE;
```

---

## Backend Deployment

### Docker Deployment
```bash
# Build backend image
docker build -t mednova-backend:1.0 -f Dockerfile.backend .

# Tag for registry
docker tag mednova-backend:1.0 registry.example.com/mednova-backend:1.0

# Push to registry
docker push registry.example.com/mednova-backend:1.0

# Deploy with docker-compose
docker-compose -f docker-compose.yml up -d backend
```

### Kubernetes Deployment (Optional)
```bash
# Create namespace
kubectl create namespace mednova

# Apply configurations
kubectl apply -f k8s/backend-deployment.yaml -n mednova
kubectl apply -f k8s/backend-service.yaml -n mednova
kubectl apply -f k8s/configmap.yaml -n mednova
kubectl apply -f k8s/secrets.yaml -n mednova

# Verify deployment
kubectl get pods -n mednova
kubectl logs -n mednova deployment/mednova-backend
```

### Environment Setup
```bash
# Create .env.prod
cat > .env.prod << EOF
DEBUG=false
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql://user:pass@prod-db:5432/mednova_db_prod
OPENAI_API_KEY=your_key_here
CORS_ORIGINS=https://mednova.example.com
ALLOWED_HOSTS=mednova.example.com,api.mednova.example.com
SSL_CERT_PATH=/etc/ssl/certs/mednova.crt
SSL_KEY_PATH=/etc/ssl/private/mednova.key
STATELESS_MODE=true
AUTO_DELETE_MINUTES=60
EOF
```

### Health Checks
```bash
# Test API health
curl -i https://api.mednova.example.com/health

# Expected response: 200 OK with status details
```

### Monitoring
```bash
# Application Monitoring (APM)
# Configure with: New Relic, DataDog, or similar

# Log Aggregation
# Configure with: ELK Stack, CloudWatch, or similar

# Error Tracking
# Configure with: Sentry, Rollbar, or similar
```

---

## Frontend Deployment

### Build Optimization
```bash
# Production build
npm run build

# Analyze bundle
npm install -D rollup-plugin-visualizer
npm run build -- --analyze

# Output optimizations
# - Enable gzip compression
# - Enable brotli compression
# - Configure CDN caching
```

### Deployment Options

#### Option 1: Vercel (Recommended for React)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# VITE_API_URL=https://api.mednova.example.com
```

#### Option 2: Docker
```bash
# Build frontend image
docker build -t mednova-frontend:1.0 -f Dockerfile.frontend .

# Push to registry
docker push registry.example.com/mednova-frontend:1.0
```

#### Option 3: Traditional Server
```bash
# Build static files
npm run build

# Copy to web server
scp -r dist/* user@server:/var/www/mednova/

# Configure nginx
# Serve dist/ directory
# Enable gzip compression
# Configure caching headers
# Set up SSL/TLS
```

### Performance Optimization
```bash
# Enable caching headers in nginx
add_header Cache-Control "public, max-age=31536000" for *.js
add_header Cache-Control "public, max-age=3600" for *.html

# Enable compression
gzip on;
gzip_types text/html text/plain application/javascript;

# Configure CDN
# CloudFront, Cloudflare, or similar
```

---

## SSL/TLS Setup

### Certificate Generation
```bash
# Self-signed certificate (development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Production certificate (Let's Encrypt)
sudo certbot certonly --standalone -d mednova.example.com
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name api.mednova.example.com;
    
    ssl_certificate /etc/ssl/certs/mednova.crt;
    ssl_certificate_key /etc/ssl/private/mednova.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Monitoring & Alerting

### Application Monitoring
```python
# Configure APM (Application Performance Monitoring)
# Example with New Relic or similar

# Key metrics to monitor:
# - API response times
# - Error rates
# - Database query performance
# - CPU/Memory usage
# - Disk I/O
```

### Log Monitoring
```bash
# Set up centralized logging
# ELK Stack, CloudWatch, or similar

# Key logs to monitor:
# - API errors
# - Authentication failures
# - Data access (audit logs)
# - System errors
# - Security events
```

### Alerting Rules
```yaml
# Alert if:
- API response time > 2 seconds
- Error rate > 1%
- Database connection pool exhausted
- Disk usage > 80%
- Memory usage > 85%
- Failed authentication attempts > 10 in 5 min
- POPIA compliance check failed
```

---

## Backup & Disaster Recovery

### Backup Strategy
```bash
# Daily incremental backups
0 2 * * * /scripts/backup-database.sh

# Weekly full backups
0 3 * * 0 /scripts/backup-full.sh

# Monthly archive
0 4 1 * * /scripts/backup-archive.sh

# Store in multiple locations
# - Primary: On-premise
# - Secondary: Cloud storage (AWS S3, Azure Blob)
# - Tertiary: Off-site archive
```

### Recovery Testing
- [ ] Monthly backup restoration test
- [ ] Document recovery procedures
- [ ] Train team on recovery process
- [ ] Test failover procedures

### Disaster Recovery Plan
```
RTO (Recovery Time Objective): 1 hour
RPO (Recovery Point Objective): 15 minutes

If database is down:
1. Alert team immediately
2. Check backup status
3. Initiate database restore
4. Verify data integrity
5. Restart services
6. Verify functionality
7. Document incident
```

---

## Post-Deployment Tasks

### Verification Checklist
- [ ] All API endpoints responding
- [ ] Database connectivity verified
- [ ] Authentication working
- [ ] Audit logging recording
- [ ] Email notifications sent
- [ ] Monitoring alerts firing
- [ ] Backups running
- [ ] Error tracking active

### Performance Baseline
```bash
# Record baseline metrics
- API response time: __ms
- Database queries: __ms
- Frontend load time: __ms
- Error rate: __%
- Uptime: __%
```

### Security Verification
```bash
# Run security checks
./scripts/security-check.sh

# Verify:
- SSL/TLS configuration
- Security headers present
- CORS properly configured
- Authentication tokens valid
- Encryption working
- Audit logs recording
```

### User Communication
- [ ] Send deployment notification
- [ ] Document changes
- [ ] Provide support contact info
- [ ] Schedule training if needed
- [ ] Monitor for issues

---

## Post-Deployment Monitoring

### First Week
- Daily monitoring reports
- Quick response to issues
- Performance tracking
- User feedback collection
- Bug tracking

### First Month
- Weekly performance review
- Optimization opportunities
- Security audit
- Database optimization
- Capacity planning

### Ongoing
- Monthly performance reports
- Quarterly security audits
- Annual disaster recovery test
- Continuous optimization

---

## Rollback Plan

If issues occur post-deployment:

```bash
# Step 1: Identify issue
# Review logs, monitoring, and user reports

# Step 2: Decide to rollback
# Assess impact and severity

# Step 3: Execute rollback
docker-compose down
docker pull registry.example.com/mednova-backend:previous-version
docker-compose up -d

# Step 4: Verify rollback
curl https://api.mednova.example.com/health

# Step 5: Investigate root cause
# Fix issue before re-deploying

# Step 6: Test in staging
# Deploy to staging environment first

# Step 7: Redeploy to production
```

---

## Production Access Control

### SSH Access
```bash
# Generate SSH keys
ssh-keygen -t ed25519 -C "devops@mednova.com"

# Configure access
# Only approved keys allowed
# IP whitelist enabled
# VPN required
```

### Database Access
```bash
# Restricted to production team
# All queries logged
# Read-only replicas for reports
# Encryption key rotation quarterly
```

### API Keys
```bash
# OpenAI API key
# Stored in secure vault
# Rotated every 90 days
# Logged access

# Database credentials
# Stored in .env (secure location)
# Change from defaults
# Use strong passwords
```

---

## Compliance Verification

### POPIA Compliance
- [ ] Stateless mode enabled
- [ ] Auto-deletion working
- [ ] Audit logging active
- [ ] Data encryption verified
- [ ] Access control implemented
- [ ] Regular compliance audits scheduled

### Security Compliance
- [ ] SSL/TLS enabled
- [ ] Security headers set
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Input validation working

### Healthcare Compliance
- [ ] HL7 compliance verified
- [ ] FHIR standards implemented
- [ ] Medical codes validated
- [ ] Patient privacy protected

---

## Deployment Summary

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: 1.0.0
**Environment**: Production

### Checklist Complete
- [ ] All pre-deployment checks passed
- [ ] Database deployed successfully
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] SSL/TLS configured
- [ ] Monitoring active
- [ ] Backups running
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained

### Approvals Required
- [ ] Technical Lead: _____________ Date: _____
- [ ] Security Officer: _____________ Date: _____
- [ ] Compliance Officer: _____________ Date: _____
- [ ] Operations Manager: _____________ Date: _____

---

## Support Contacts

**On-call Engineer**: _______________
**Database Admin**: _______________
**Security Officer**: _______________
**Compliance Officer**: _______________

---

For questions or issues, refer to:
- IMPLEMENTATION_GUIDE.md
- DATABASE_SCHEMA.md
- QUICKSTART.md
