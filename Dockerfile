# OmniTech1 Integration - Dockerfile
# ScrollVerse Genesis Protocol - Production Container

# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Create non-root user for security
RUN groupadd --gid 1000 omnitech && \
    useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash omnitech

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY omnitech_server.py .
COPY omnitech_persistence.py .
COPY neo4j_init.py .
COPY templates/ templates/
COPY static/ static/
COPY audit/ audit/

# Change ownership to non-root user
RUN chown -R omnitech:omnitech /app

# Switch to non-root user
USER omnitech

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application with eventlet
CMD ["python", "-m", "eventlet.wsgi", "omnitech_server:app"]
