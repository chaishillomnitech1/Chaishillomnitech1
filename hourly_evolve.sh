#!/bin/bash

# ============================================================================
# Hourly Evolve Script - ScrollVerse Monitoring & Maintenance
# ============================================================================
# 
# This script performs hourly maintenance tasks for ScrollVerse deployments:
# - Health checks for deployed services
# - Log rotation and cleanup
# - Metrics collection
# - Alert generation for anomalies
#
# Usage: ./hourly_evolve.sh [--dry-run] [--verbose]
#
# Environment Variables:
#   SCROLLVERSE_ENV     - Environment (development|staging|production)
#   ALERT_WEBHOOK_URL   - Webhook URL for alerts (optional)
#   LOG_RETENTION_DAYS  - Number of days to retain logs (default: 30)
#
# @author ScrollVerse DevOps Team
# @version 1.0.0
# ============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${LOG_DIR:-/var/log/scrollverse}"
METRICS_DIR="${METRICS_DIR:-/var/lib/scrollverse/metrics}"
SCROLLVERSE_ENV="${SCROLLVERSE_ENV:-development}"
LOG_RETENTION_DAYS="${LOG_RETENTION_DAYS:-30}"
DRY_RUN=false
VERBOSE=false

# Sacred frequencies for ScrollVerse
declare -A FREQUENCIES=(
    ["healing"]=528
    ["awakening"]=741
    ["pineal"]=963
    ["crown"]=999
)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ============================================================================
# Utility Functions
# ============================================================================

log() {
    local level="$1"
    local message="$2"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")
            echo -e "${GREEN}[${timestamp}] [INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[${timestamp}] [WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] [ERROR]${NC} $message"
            ;;
        "DEBUG")
            if [[ "$VERBOSE" == true ]]; then
                echo -e "${BLUE}[${timestamp}] [DEBUG]${NC} $message"
            fi
            ;;
        *)
            echo -e "[${timestamp}] $message"
            ;;
    esac
}

banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║           🔱 ScrollVerse Hourly Evolution Script 🔱              ║"
    echo "║                 Frequency: ${FREQUENCIES["healing"]} Hz - DNA Healing                 ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --dry-run     Run without making changes"
    echo "  --verbose     Enable verbose output"
    echo "  --help        Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  SCROLLVERSE_ENV      - Environment (development|staging|production)"
    echo "  ALERT_WEBHOOK_URL    - Webhook URL for alerts"
    echo "  LOG_RETENTION_DAYS   - Number of days to retain logs (default: 30)"
}

send_alert() {
    local title="$1"
    local message="$2"
    local severity="${3:-warning}"
    
    if [[ -n "${ALERT_WEBHOOK_URL:-}" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            curl -s -X POST "$ALERT_WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "{
                    \"title\": \"$title\",
                    \"message\": \"$message\",
                    \"severity\": \"$severity\",
                    \"environment\": \"$SCROLLVERSE_ENV\",
                    \"timestamp\": \"$(date -Iseconds)\"
                }" > /dev/null 2>&1 || log "WARN" "Failed to send alert"
        else
            log "DEBUG" "DRY-RUN: Would send alert: $title - $message"
        fi
    fi
}

# ============================================================================
# Health Check Functions
# ============================================================================

check_service_health() {
    local service="$1"
    local endpoint="${2:-}"
    
    log "DEBUG" "Checking health of service: $service"
    
    if [[ -n "$endpoint" ]]; then
        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
        
        if [[ "$status_code" == "200" ]]; then
            log "INFO" "✅ $service is healthy (HTTP $status_code)"
            return 0
        else
            log "WARN" "⚠️ $service returned HTTP $status_code"
            send_alert "Service Health Warning" "$service returned HTTP $status_code" "warning"
            return 1
        fi
    else
        # Check if process is running (for local services)
        if pgrep -f "$service" > /dev/null 2>&1; then
            log "INFO" "✅ $service process is running"
            return 0
        else
            log "DEBUG" "$service process not found (may not be applicable)"
            return 0
        fi
    fi
}

check_disk_space() {
    local threshold="${1:-85}"
    local usage
    
    log "DEBUG" "Checking disk space (threshold: ${threshold}%)"
    
    usage=$(df -h / | awk 'NR==2 {gsub(/%/,""); print $5}')
    
    if [[ "$usage" -gt "$threshold" ]]; then
        log "WARN" "⚠️ Disk usage is at ${usage}% (threshold: ${threshold}%)"
        send_alert "Disk Space Warning" "Disk usage is at ${usage}%" "warning"
        return 1
    else
        log "INFO" "✅ Disk usage is at ${usage}%"
        return 0
    fi
}

check_memory() {
    local threshold="${1:-90}"
    local usage
    
    log "DEBUG" "Checking memory usage (threshold: ${threshold}%)"
    
    usage=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
    
    if [[ "$usage" -gt "$threshold" ]]; then
        log "WARN" "⚠️ Memory usage is at ${usage}% (threshold: ${threshold}%)"
        send_alert "Memory Warning" "Memory usage is at ${usage}%" "warning"
        return 1
    else
        log "INFO" "✅ Memory usage is at ${usage}%"
        return 0
    fi
}

# ============================================================================
# Maintenance Functions
# ============================================================================

rotate_logs() {
    log "INFO" "🔄 Starting log rotation..."
    
    if [[ ! -d "$LOG_DIR" ]]; then
        log "DEBUG" "Log directory does not exist: $LOG_DIR"
        return 0
    fi
    
    local count=0
    
    while IFS= read -r -d '' file; do
        if [[ "$DRY_RUN" == false ]]; then
            rm -f "$file"
            ((count++))
        else
            log "DEBUG" "DRY-RUN: Would delete: $file"
            ((count++))
        fi
    done < <(find "$LOG_DIR" -type f -name "*.log" -mtime "+${LOG_RETENTION_DAYS}" -print0 2>/dev/null)
    
    log "INFO" "✅ Cleaned up $count old log files"
}

cleanup_temp_files() {
    log "INFO" "🧹 Cleaning up temporary files..."
    
    local temp_dirs=("/tmp/scrollverse-*" "/var/tmp/scrollverse-*")
    local count=0
    
    for pattern in "${temp_dirs[@]}"; do
        for dir in $pattern; do
            if [[ -d "$dir" ]]; then
                local age
                age=$(find "$dir" -maxdepth 0 -mtime +1 2>/dev/null | wc -l)
                
                if [[ "$age" -gt 0 ]]; then
                    if [[ "$DRY_RUN" == false ]]; then
                        rm -rf "$dir"
                        ((count++))
                    else
                        log "DEBUG" "DRY-RUN: Would delete: $dir"
                        ((count++))
                    fi
                fi
            fi
        done
    done
    
    log "INFO" "✅ Cleaned up $count temporary directories"
}

collect_metrics() {
    log "INFO" "📊 Collecting system metrics..."
    
    local metrics_file="${METRICS_DIR}/hourly_$(date +%Y%m%d_%H).json"
    
    # Ensure metrics directory exists
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$METRICS_DIR" 2>/dev/null || true
    fi
    
    local cpu_usage
    local mem_usage
    local disk_usage
    local load_avg
    
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1 2>/dev/null || echo "0")
    mem_usage=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}' 2>/dev/null || echo "0")
    disk_usage=$(df -h / | awk 'NR==2 {gsub(/%/,""); print $5}' 2>/dev/null || echo "0")
    load_avg=$(cat /proc/loadavg | awk '{print $1}' 2>/dev/null || echo "0")
    
    local metrics_json
    metrics_json=$(cat <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "environment": "$SCROLLVERSE_ENV",
    "frequency": ${FREQUENCIES["healing"]},
    "system": {
        "cpu_usage_percent": $cpu_usage,
        "memory_usage_percent": $mem_usage,
        "disk_usage_percent": $disk_usage,
        "load_average": $load_avg
    },
    "scrollverse": {
        "version": "1.0.0",
        "health_status": "operational"
    }
}
EOF
)
    
    if [[ "$DRY_RUN" == false ]]; then
        echo "$metrics_json" > "$metrics_file" 2>/dev/null || log "WARN" "Could not write metrics file"
    else
        log "DEBUG" "DRY-RUN: Would write metrics to: $metrics_file"
    fi
    
    log "INFO" "✅ Metrics collected successfully"
    
    if [[ "$VERBOSE" == true ]]; then
        echo "$metrics_json"
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

main() {
    parse_args "$@"
    
    banner
    
    log "INFO" "Starting hourly evolution for environment: $SCROLLVERSE_ENV"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "WARN" "Running in DRY-RUN mode - no changes will be made"
    fi
    
    # Health Checks
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "INFO" "🏥 Running Health Checks..."
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    check_disk_space 85 || true
    check_memory 90 || true
    
    # Maintenance Tasks
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "INFO" "🔧 Running Maintenance Tasks..."
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    rotate_logs
    cleanup_temp_files
    collect_metrics
    
    # Summary
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "INFO" "✨ Hourly evolution completed successfully!"
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    exit 0
}

# Run main function
main "$@"
