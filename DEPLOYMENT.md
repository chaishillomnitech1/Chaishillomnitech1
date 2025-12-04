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
