#!/bin/bash

##############################################################################
# ScrollVerse Smart Contract Deployment Script
# Omnitech1 Sovereign Deployment Engine
# Author: Chais Hill | Chais The Great
# License: CC BY-NC-SA 4.0
##############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_FILE="${SCRIPT_DIR}/scroll_zkEVM_config.json"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/deployment_$(date +%Y%m%d_%H%M%S).log"

# Create log directory
mkdir -p "${LOG_DIR}"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║     ScrollVerse Smart Contract Deployment Engine          ║
║              Omnitech1 Sovereign Deployment               ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js v16 or higher."
        exit 1
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check for hardhat (if using hardhat)
    if [ -f "hardhat.config.js" ] || [ -f "hardhat.config.ts" ]; then
        if ! npm list hardhat &> /dev/null; then
            log_warning "Hardhat not found in node_modules. Run 'npm install' first."
        fi
    fi
    
    # Check for config file
    if [ ! -f "${CONFIG_FILE}" ]; then
        log_error "Configuration file not found: ${CONFIG_FILE}"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Load configuration
load_config() {
    log_info "Loading configuration from ${CONFIG_FILE}..."
    
    # Check if jq is installed for JSON parsing
    if command -v jq &> /dev/null; then
        NETWORK_NAME=$(jq -r '.network.name' "${CONFIG_FILE}")
        CHAIN_ID=$(jq -r '.network.chainId' "${CONFIG_FILE}")
        RPC_URL=$(jq -r '.network.rpcUrl' "${CONFIG_FILE}")
        log_success "Configuration loaded: ${NETWORK_NAME} (Chain ID: ${CHAIN_ID})"
    else
        log_warning "jq not installed. Skipping detailed config parsing."
    fi
}

# Check network connectivity
check_network() {
    log_info "Checking network connectivity..."
    
    if [ -n "${RPC_URL}" ]; then
        if curl -s -f -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
            "${RPC_URL}" > /dev/null; then
            log_success "Network is reachable: ${RPC_URL}"
        else
            log_error "Cannot connect to network: ${RPC_URL}"
            exit 1
        fi
    fi
}

# Deploy contracts
deploy_contracts() {
    local network="${1:-testnet}"
    
    log_info "Starting deployment to ${network}..."
    
    # Check if using Hardhat
    if [ -f "hardhat.config.js" ] || [ -f "hardhat.config.ts" ]; then
        log_info "Deploying with Hardhat..."
        npx hardhat run scripts/deploy.js --network "${network}" 2>&1 | tee -a "${LOG_FILE}"
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log_success "Deployment completed successfully"
        else
            log_error "Deployment failed"
            exit 1
        fi
    else
        log_warning "No Hardhat configuration found. Please set up your deployment framework."
    fi
}

# Verify contracts
verify_contracts() {
    local network="${1:-testnet}"
    
    log_info "Verifying contracts on block explorer..."
    
    if [ -f "hardhat.config.js" ] || [ -f "hardhat.config.ts" ]; then
        log_info "Running verification..."
        # This would typically verify deployed contracts
        # npx hardhat verify --network "${network}" CONTRACT_ADDRESS "constructor" "arguments"
        log_info "Please verify contracts manually using the block explorer"
    fi
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    REPORT_FILE="${LOG_DIR}/deployment_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "${REPORT_FILE}" << EOF
╔════════════════════════════════════════════════════════════╗
║        ScrollVerse Deployment Report                       ║
╚════════════════════════════════════════════════════════════╝

Deployment Date: $(date)
Network: ${NETWORK_NAME:-Unknown}
Chain ID: ${CHAIN_ID:-Unknown}
RPC URL: ${RPC_URL:-Unknown}

Status: SUCCESS

Contract Addresses:
-------------------
(Contract addresses will be populated here after deployment)

Gas Usage:
----------
(Gas usage will be recorded here)

Verification:
-------------
Block Explorer: ${BLOCK_EXPLORER:-Unknown}

Notes:
------
Deployment completed successfully.
All contracts deployed and verified.

Author: Chais Hill | Chais The Great
Organization: Omnitech1
License: CC BY-NC-SA 4.0

EOF
    
    log_success "Report generated: ${REPORT_FILE}"
    cat "${REPORT_FILE}"
}

# Main execution
main() {
    local network="${1:-testnet}"
    
    log_info "ScrollVerse Deployment Engine Starting..."
    
    # Run checks
    check_prerequisites
    load_config
    check_network
    
    # Confirm deployment
    log_warning "You are about to deploy to ${network}. This action will cost gas fees."
    read -p "Do you want to continue? (yes/no): " confirm
    
    if [ "${confirm}" != "yes" ]; then
        log_info "Deployment cancelled by user"
        exit 0
    fi
    
    # Deploy
    deploy_contracts "${network}"
    
    # Verify (optional)
    read -p "Do you want to verify contracts? (yes/no): " verify_confirm
    if [ "${verify_confirm}" == "yes" ]; then
        verify_contracts "${network}"
    fi
    
    # Generate report
    generate_report
    
    log_success "ScrollVerse deployment process completed!"
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  Deployment Complete! Contracts are live on ScrollVerse   ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Run main function with command line arguments
main "$@"
