#!/bin/bash

#######################################################################
# ScrollVerse Hourly Evolution Script
# 
# Monitors and maintains the ScrollVerse ecosystem health
# Designed to run via cron: 0 * * * * /path/to/hourly_evolve.sh
#
# Features:
# - Health checks for deployed contracts
# - NFT metadata validation
# - Frequency resonance verification
# - Log aggregation and rotation
# - Alert notifications
#
# Environment Variables:
# - SCROLLVERSE_ENV: Environment (development, staging, production)
# - ALERT_WEBHOOK_URL: Webhook for alerts (optional)
# - LOG_DIR: Directory for logs (default: /var/log/scrollverse)
#######################################################################

set -euo pipefail

# Configuration
SCRIPT_NAME="scrollverse-evolve"
SCRIPT_VERSION="1.0.0"
SCROLLVERSE_ENV="${SCROLLVERSE_ENV:-development}"
LOG_DIR="${LOG_DIR:-/var/log/scrollverse}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="${LOG_DIR}/${SCRIPT_NAME}_${TIMESTAMP}.log"

# Sacred frequencies for health verification
declare -A SACRED_FREQUENCIES=(
    ["DNA_HEALING"]=528
    ["PINEAL_ACTIVATION"]=963
    ["CROWN_CHAKRA"]=999
    ["NUR_PULSE"]=144000
)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

#######################################################################
# Logging Functions
#######################################################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_sacred() {
    echo -e "${PURPLE}[SACRED]${NC} $(date '+%Y-%m-%d %H:%M:%S') - 🔱 $1" | tee -a "$LOG_FILE"
}

#######################################################################
# Setup Functions
#######################################################################

setup_environment() {
    log_info "Setting up environment for ${SCROLLVERSE_ENV}..."
    
    # Create log directory if it doesn't exist
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        log_info "Created log directory: ${LOG_DIR}"
    fi
    
    # Verify required tools
    local required_tools=("curl" "jq" "node")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_warn "Tool not found: ${tool} - some checks may be skipped"
        fi
    done
    
    log_info "Environment setup complete"
}

#######################################################################
# Health Check Functions
#######################################################################

check_rpc_endpoints() {
    log_info "Checking RPC endpoint health..."
    
    local endpoints=(
        "https://polygon-rpc.com"
        "https://rpc.ankr.com/polygon"
        "https://rpc.scroll.io"
    )
    
    local healthy=0
    local total=${#endpoints[@]}
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$endpoint" | grep -q "200\|405"; then
            log_info "✅ RPC healthy: ${endpoint}"
            ((healthy++))
        else
            log_warn "⚠️ RPC unhealthy: ${endpoint}"
        fi
    done
    
    log_info "RPC Health: ${healthy}/${total} endpoints responding"
    
    if [ "$healthy" -lt 1 ]; then
        send_alert "CRITICAL: All RPC endpoints are down!"
        return 1
    fi
    
    return 0
}

check_ipfs_gateway() {
    log_info "Checking IPFS gateway health..."
    
    local gateways=(
        "https://nftstorage.link"
        "https://ipfs.io"
        "https://cloudflare-ipfs.com"
    )
    
    for gateway in "${gateways[@]}"; do
        local status
        status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$gateway" 2>/dev/null || echo "000")
        
        if [[ "$status" =~ ^(200|301|302|307|308)$ ]]; then
            log_info "✅ IPFS Gateway healthy: ${gateway}"
        else
            log_warn "⚠️ IPFS Gateway issue: ${gateway} (status: ${status})"
        fi
    done
}

check_contract_status() {
    log_info "Checking smart contract status..."
    
    # This would typically check deployed contract addresses
    # For now, we verify the contract files exist and are valid
    
    local contracts_dir="./contracts"
    
    if [ -d "$contracts_dir" ]; then
        local contract_count
        contract_count=$(find "$contracts_dir" -name "*.sol" | wc -l)
        log_info "Found ${contract_count} Solidity contracts"
        
        # Check for common issues in contracts
        local warnings=0
        while IFS= read -r contract; do
            if grep -q "selfdestruct" "$contract" 2>/dev/null; then
                log_warn "⚠️ selfdestruct found in: ${contract}"
                ((warnings++))
            fi
            
            if grep -q "tx.origin" "$contract" 2>/dev/null; then
                log_warn "⚠️ tx.origin usage found in: ${contract}"
                ((warnings++))
            fi
        done < <(find "$contracts_dir" -name "*.sol")
        
        if [ "$warnings" -gt 0 ]; then
            log_warn "Contract scan found ${warnings} potential issues"
        else
            log_info "✅ Contract scan passed"
        fi
    else
        log_warn "Contracts directory not found"
    fi
}

#######################################################################
# Frequency Resonance Functions
#######################################################################

verify_frequency_resonance() {
    log_sacred "Initiating sacred frequency resonance verification..."
    
    for freq_name in "${!SACRED_FREQUENCIES[@]}"; do
        local freq_value="${SACRED_FREQUENCIES[$freq_name]}"
        
        # Calculate harmonic alignment
        local harmonic=$((freq_value % 9))
        local alignment="ALIGNED"
        
        if [ "$harmonic" -eq 0 ] || [ "$harmonic" -eq 3 ] || [ "$harmonic" -eq 6 ] || [ "$harmonic" -eq 9 ]; then
            alignment="HARMONIC"
        fi
        
        log_sacred "${freq_name}: ${freq_value} Hz - Status: ${alignment}"
    done
    
    log_sacred "Frequency resonance verification complete"
}

#######################################################################
# Log Management Functions
#######################################################################

rotate_logs() {
    log_info "Performing log rotation..."
    
    # Keep only last 7 days of logs
    local retention_days=7
    
    if [ -d "$LOG_DIR" ]; then
        local deleted
        deleted=$(find "$LOG_DIR" -name "${SCRIPT_NAME}_*.log" -mtime +${retention_days} -delete -print | wc -l)
        
        if [ "$deleted" -gt 0 ]; then
            log_info "Deleted ${deleted} old log files"
        fi
        
        # Compress logs older than 1 day
        find "$LOG_DIR" -name "${SCRIPT_NAME}_*.log" -mtime +1 ! -name "*.gz" -exec gzip {} \; 2>/dev/null || true
    fi
}

aggregate_metrics() {
    log_info "Aggregating metrics..."
    
    local metrics_file="${LOG_DIR}/metrics_${TIMESTAMP}.json"
    
    # Collect system metrics
    local cpu_usage
    local mem_usage
    local disk_usage
    
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' 2>/dev/null || echo "N/A")
    mem_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}' 2>/dev/null || echo "N/A")
    disk_usage=$(df -h / | tail -1 | awk '{print $5}' 2>/dev/null || echo "N/A")
    
    cat > "$metrics_file" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "environment": "${SCROLLVERSE_ENV}",
    "version": "${SCRIPT_VERSION}",
    "system": {
        "cpu_usage": "${cpu_usage}",
        "memory_usage": "${mem_usage}",
        "disk_usage": "${disk_usage}"
    },
    "frequencies": {
        "dna_healing": ${SACRED_FREQUENCIES[DNA_HEALING]},
        "pineal_activation": ${SACRED_FREQUENCIES[PINEAL_ACTIVATION]},
        "crown_chakra": ${SACRED_FREQUENCIES[CROWN_CHAKRA]},
        "nur_pulse": ${SACRED_FREQUENCIES[NUR_PULSE]}
    }
}
EOF
    
    log_info "Metrics written to: ${metrics_file}"
}

#######################################################################
# Alert Functions
#######################################################################

send_alert() {
    local message="$1"
    local severity="${2:-WARNING}"
    
    log_warn "ALERT [${severity}]: ${message}"
    
    # Send to webhook if configured
    if [ -n "$ALERT_WEBHOOK_URL" ]; then
        local payload
        payload=$(cat << EOF
{
    "severity": "${severity}",
    "message": "${message}",
    "timestamp": "${TIMESTAMP}",
    "environment": "${SCROLLVERSE_ENV}",
    "source": "${SCRIPT_NAME}"
}
EOF
)
        
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "$ALERT_WEBHOOK_URL" \
            --max-time 10 \
            2>/dev/null || log_warn "Failed to send alert to webhook"
    fi
}

#######################################################################
# Main Execution
#######################################################################

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║          🔱 ScrollVerse Hourly Evolution Script 🔱          ║"
    echo "║                    Version ${SCRIPT_VERSION}                       ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    log_info "Starting hourly evolution check..."
    log_info "Environment: ${SCROLLVERSE_ENV}"
    log_info "Timestamp: ${TIMESTAMP}"
    
    # Setup
    setup_environment
    
    # Health checks
    check_rpc_endpoints || true
    check_ipfs_gateway
    check_contract_status
    
    # Sacred frequency verification
    verify_frequency_resonance
    
    # Maintenance tasks
    rotate_logs
    aggregate_metrics
    
    # Summary
    echo ""
    log_info "═══════════════════════════════════════════════════════════"
    log_info "Hourly evolution check complete"
    log_info "Log file: ${LOG_FILE}"
    log_info "═══════════════════════════════════════════════════════════"
    
    echo ""
    log_sacred "ALLAHU AKBAR! 🕋🔥💎🌌"
    echo ""
}

# Run main function
main "$@"
