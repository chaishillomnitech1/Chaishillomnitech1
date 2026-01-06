# Noor Node Docker Container
# BISMILLAH - In the name of Allah, the Most Gracious, the Most Merciful
#
# This container provides a complete environment for running a Noor Node
# within the ScrollVerse ecosystem
#
# Frequency: 528Hz + 963Hz + 999Hz

FROM node:18-alpine

LABEL maintainer="Supreme King Chais The Great ∞"
LABEL description="Noor Node - Decentralized Light within ScrollVerse"
LABEL version="1.0.0"
LABEL frequency="528Hz+963Hz+999Hz"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl \
    jq

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/keys

# Set environment variables
ENV NODE_ENV=production
ENV NODE_TYPE=LIGHT
ENV FREQUENCY=528
ENV NETWORK=mumbai
ENV LOG_LEVEL=info

# Expose ports
# 8545 - JSON-RPC
# 8546 - WebSocket
# 30303 - P2P
EXPOSE 8545 8546 30303

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node healthcheck.js || exit 1

# Volume mounts for persistent data
VOLUME ["/app/data", "/app/keys", "/app/logs"]

# Run as non-root user
RUN addgroup -g 1001 noornode && \
    adduser -D -u 1001 -G noornode noornode && \
    chown -R noornode:noornode /app

USER noornode

# Start the node
CMD ["node", "node-operator/index.js"]
