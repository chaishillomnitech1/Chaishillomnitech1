# 🚀 Deployment Guide - ScrollVerse Sovereignty Infrastructure

## **Supreme King Chais The Great ∞ — Omnisovereign Architect**

**Document ID**: DG-001-ETERNAL  
**Classification**: OMNISOVEREIGN DEPLOYMENT  
**Status**: SEALED LAW  
**Frequency**: 963Hz + 528Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 🔥 Introduction

This guide provides comprehensive deployment instructions for the ScrollVerse Sovereignty Infrastructure across multiple platforms and environments.

**ALLĀHU AKBAR! 🕋🔥💎🌌**

---

## 📋 Prerequisites

### Required Tools
- **Node.js** 18+ and npm 9+
- **Git** for version control
- **Vercel CLI** (optional, for manual deployments)
- **Environment variables** properly configured

### Required Accounts
- GitHub account with repository access
- Vercel account (for production deployments)
- Blockchain RPC providers (Infura, Alchemy, etc.)
- Email service provider (SendGrid, AWS SES, etc.)

---

## 🌍 Environment Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1

# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

**Important**: Never commit `.env` to version control!

### 3. Validate Configuration

```bash
# Run validation checks
npm run validate

# Check for security vulnerabilities
npm run security-check
```

---

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)

The repository is configured with automated GitHub Actions workflows that deploy on push to main branch.

**Setup Steps:**

1. **Connect to Vercel**
   - Go to Vercel Dashboard
   - Import the GitHub repository
   - Configure environment variables in Vercel settings

2. **Push to Main Branch**
   ```bash
   git checkout main
   git pull origin main
   git push origin main
   ```

3. **Monitor Deployment**
   - Check GitHub Actions tab for workflow status
   - View deployment logs in Vercel dashboard

### Option 2: Manual Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 3: Custom Server Deployment

```bash
# Build the project
npm run build

# Serve with a static server
npx serve -s public -l 3000

# Or use your preferred web server (nginx, Apache, etc.)
```

---

## 🔧 Platform-Specific Deployment

### Vercel (Primary Platform)

**Configuration File**: `vercel.json`

```bash
# Deploy with Vercel CLI
vercel --prod

# Or via GitHub integration (automatic)
git push origin main
```

**Environment Variables in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Ensure production values are secure

### Netlify (Alternative)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=public
```

**Configuration**: Create `netlify.toml`:
```toml
[build]
  publish = "public"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### AWS S3 + CloudFront

```bash
# Build project
npm run build

# Sync to S3 bucket
aws s3 sync public/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### GitHub Pages

```bash
# Add homepage to package.json
# "homepage": "https://chaishillomnitech1.github.io/Chaishillomnitech1"

# Install gh-pages
npm install --save-dev gh-pages

# Add deploy script to package.json
# "deploy": "gh-pages -d public"

# Deploy
npm run build
npm run deploy
```

---

## 🔐 Security Configuration

### SSL/TLS Certificates

**Vercel**: Automatic SSL certificates
**Custom Domain**: 
- Ensure HTTPS is enforced
- Configure security headers (see `vercel.json`)

### Environment Variables Security

```bash
# Never expose these in client-side code:
- Private keys
- API secrets
- Database credentials
- JWT secrets
```

### Security Headers

Already configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` for camera, microphone, geolocation

---

## 🌐 Domain Configuration

### Custom Domain Setup

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

**SSL Certificate**: Automatic via Let's Encrypt

### DNS Configuration

```
# Example DNS Records
A     @           76.76.21.21
CNAME www         cname.vercel-dns.com
TXT   @           "vercel-verification=..."
```

---

## 📊 Monitoring & Logging

### Vercel Analytics

Enable in Project Settings → Analytics

### Custom Monitoring

```javascript
// Add to your application
if (process.env.NODE_ENV === 'production') {
  // Sentry for error tracking
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
  
  // Google Analytics
  gtag('config', process.env.GOOGLE_ANALYTICS_ID);
}
```

### Health Checks

```bash
# Create health check endpoint
curl https://your-domain.com/health

# Expected response
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-11-12T05:00:00Z"
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The repository includes automated workflows:

1. **Continuous Integration** (`ci.yml`)
   - Linting and formatting
   - Security audits
   - Validation checks

2. **Deployment** (`deploy.yml`)
   - Automated production deployment on main branch push
   - Preview deployments for pull requests

3. **CodeQL Security** (`codeql.yml`)
   - Automated security scanning
   - Vulnerability detection

### Manual Workflow Trigger

```bash
# Trigger workflow manually
# Go to Actions tab → Select workflow → Run workflow
```

---

## 🧪 Testing Deployments

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Build completes without errors
- [ ] Linting passes
- [ ] Security audit passes
- [ ] No console errors
- [ ] All links working
- [ ] SSL certificate valid

### Post-Deployment Verification

```bash
# Check deployment status
curl -I https://your-domain.com

# Verify security headers
curl -I https://your-domain.com | grep "X-Frame-Options"

# Test API endpoints
curl https://your-domain.com/api/health

# Load testing (optional)
npx loadtest -c 10 --rps 100 https://your-domain.com
```

---

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment Variable Issues:**
```bash
# Verify variables are loaded
node -e "console.log(process.env.NODE_ENV)"

# Check Vercel environment variables
vercel env ls
```

**Deployment Timeouts:**
- Check build time (should be < 10 minutes)
- Optimize bundle size
- Check for infinite loops in build scripts

### Rollback Procedure

**Vercel:**
1. Go to Deployments tab
2. Select previous successful deployment
3. Click "Promote to Production"

**Manual:**
```bash
git revert HEAD
git push origin main
```

---

## 📈 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --stats

# Remove unused dependencies
npm prune --production
```

### Caching Strategy

Configure in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🔄 Update Procedures

### Regular Updates

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update to latest versions
npm install package-name@latest
```

### Security Updates

```bash
# Fix security vulnerabilities
npm audit fix

# Force fix (use with caution)
npm audit fix --force
```

---

## 📞 Support & Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Repository Documentation](./README.md)

### Contact
- **Email**: sovereign@omnitech1.com
- **GitHub Issues**: For technical problems
- **Discord**: ScrollVerse Community

---

## 📜 Eternal Declaration

**ALLAHU AKBAR! 🕋🔥💎🌌**

This deployment guide is sealed under the **Eternal Scroll Codex (ESC-88)**, ensuring perpetual operation of the ScrollVerse Sovereignty Infrastructure.

**The Deployment is Sacred. The Infrastructure is Eternal. The Legacy is Immortal.**

---

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

**ALLAHU AKBAR! 🔥🕋🚀♾️❤️🧬💸**

*The Eternal Dance is Perfected. The Deployment is Sovereign. The Legacy Lives Forever.*

---

**Document Sealed**: November 12, 2025  
**Classification**: OMNISOVEREIGN DEPLOYMENT  
**Frequency**: 963Hz + 528Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞

**WALAHI! BARAKALLAHU FEEK! ALLAHU AKBAR!**
# OmniTech1 Integration - Deployment Guide

## ScrollVerse Genesis Protocol - Sovereign Deployment Engine

This document provides instructions for deploying the OmniTech1 Integration service.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Security Notes](#security-notes)
6. [Troubleshooting](#troubleshooting)

---

## Environment Variables

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FLASK_SECRET_KEY` | Secret key for Flask session encryption | Yes (auto-generated if not set) |
| `NEO4J_PASSWORD` | Password for Neo4j database | Yes (for persistence) |

### Security Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_WEBHOOK_SECRET` | HMAC secret for GitHub webhook signature verification | Recommended |
| `ADMIN_TOKEN` | Token for admin endpoint authentication | Recommended |
| `JWT_SECRET` | Secret for JWT token signing | Optional |

### Database Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEO4J_URI` | Neo4j connection URI | `bolt://localhost:7687` |
| `NEO4J_USER` | Neo4j username | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j password | Required |

### Server Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `FLASK_DEBUG` | Enable debug mode | `false` |

---

## Local Development

### Prerequisites

- Python 3.11+
- Neo4j 5.x (optional, for persistence)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
   cd Chaishillomnitech1
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # or
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   ```bash
   export FLASK_SECRET_KEY="your-secret-key"
   export GITHUB_WEBHOOK_SECRET="your-webhook-secret"
   export ADMIN_TOKEN="your-admin-token"
   ```

5. **Run the server:**
   ```bash
   python omnitech_server.py
   ```

6. **Access the dashboard:**
   - Main dashboard: http://localhost:5000/
   - Admin panel: http://localhost:5000/admin
   - Health check: http://localhost:5000/health

---

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Add OmniTech1 variables to `.env`:**
   ```env
   FLASK_SECRET_KEY=your-secure-secret-key
   GITHUB_WEBHOOK_SECRET=your-webhook-secret
   ADMIN_TOKEN=your-admin-token
   JWT_SECRET=your-jwt-secret
   NEO4J_PASSWORD=your-neo4j-password
   ```

3. **Start the stack:**
   ```bash
   docker-compose up -d
   ```

4. **Initialize Neo4j (first time only):**
   ```bash
   docker-compose run --rm neo4j-init
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f omnitech
   ```

### Using Docker Only

1. **Build the image:**
   ```bash
   docker build -t omnitech1-server .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name omnitech1 \
     -p 5000:5000 \
     -e FLASK_SECRET_KEY="your-secret" \
     -e GITHUB_WEBHOOK_SECRET="your-webhook-secret" \
     omnitech1-server
   ```

---

## Production Deployment

### Heroku

1. **Create Heroku app:**
   ```bash
   heroku create omnitech1-integration
   ```

2. **Set config vars:**
   ```bash
   heroku config:set FLASK_SECRET_KEY="your-secret"
   heroku config:set GITHUB_WEBHOOK_SECRET="your-webhook-secret"
   heroku config:set ADMIN_TOKEN="your-admin-token"
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

### AWS / GCP / Azure

For cloud deployments, use the provided `Dockerfile` with your preferred container orchestration service (ECS, Cloud Run, AKS).

Ensure you:
1. Store secrets in a secrets manager (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)
2. Use environment variables to inject secrets at runtime
3. Configure health checks using the `/health` endpoint
4. Enable TLS/HTTPS termination at the load balancer

---

## Security Notes

### Webhook Signature Verification

The `/webhook` endpoint verifies GitHub webhook signatures using HMAC SHA-256:

- If `GITHUB_WEBHOOK_SECRET` is set, all payloads must include a valid `X-Hub-Signature-256` header
- If `GITHUB_WEBHOOK_SECRET` is NOT set, the server logs a warning and accepts all payloads
- **Production Recommendation:** Always set `GITHUB_WEBHOOK_SECRET` in production

### Admin Authentication

Admin endpoints (`/admin/*`) support two authentication methods:

1. **Token-based:** Set `ADMIN_TOKEN` and pass it via `X-Admin-Token` header
2. **JWT-based:** Set `JWT_SECRET` and pass JWT via `Authorization: Bearer <token>` header

If neither is configured, admin endpoints are unprotected (with warning logged).

### Best Practices

- **Never commit secrets to version control**
- **Use environment variables or secrets managers for all sensitive values**
- **Enable HTTPS in production**
- **Set strong, unique values for all secrets**
- **Rotate secrets periodically**
- **Monitor access logs for suspicious activity**

---

## Troubleshooting

### Common Issues

**Issue:** Server won't start
- Check that all required environment variables are set
- Verify Python version is 3.11+
- Ensure port 5000 is not in use

**Issue:** Neo4j connection fails
- Verify Neo4j is running: `docker-compose ps`
- Check Neo4j logs: `docker-compose logs neo4j`
- Ensure credentials match in environment variables

**Issue:** Webhook verification fails
- Verify `GITHUB_WEBHOOK_SECRET` matches GitHub's configured secret
- Check that the payload hasn't been modified in transit
- Ensure the signature header is present

### Logs

```bash
# Docker logs
docker-compose logs -f omnitech

# Application logs
tail -f /var/log/omnitech/app.log
```

---

## Support

For issues and feature requests, please open a GitHub issue at:
https://github.com/chaishillomnitech1/Chaishillomnitech1/issues

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*OmniTech1™ Sovereign Deployment Engine - ScrollVerse Genesis Protocol*
