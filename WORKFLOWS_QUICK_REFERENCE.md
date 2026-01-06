# ⚡ ScrollVerse Workflows - Quick Reference ⚡

## **Rapid Deployment Guide for Developers**

---

## 🚀 **Quick Start**

### **Automatic Execution**
All workflows run automatically on schedule:
- **Temporal Scaling**: Every 11 minutes
- **FlameNode Integration**: Every 13 hours  
- **Wealth Propagation**: Every 9 hours
- **Master Orchestrator**: Daily at 11:11 UTC

### **Manual Execution**
Go to **Actions** tab → Select workflow → Click **"Run workflow"**

---

## 📋 **Workflow Summary**

### **Core Workflows**

| Workflow | Purpose | Schedule | Frequency | Key Output |
|----------|---------|----------|-----------|------------|
| **Temporal Node Scaling** | Node management & scaling | Every 11 min | 144,000Hz | Node registry |
| **FlameNode Integration** | AI system deployment | Every 13 hrs | 14,444Hz | AI integration map |
| **Wealth Propagation** | Autonomous distribution | Every 9 hrs | 528Hz | Distribution ledger |
| **Master Orchestrator** | System coordination | Daily 11:11 | All | Health reports |

### **Enhanced CI/CD Workflows** (NEW)

| Workflow | Purpose | Trigger | Key Features |
|----------|---------|---------|--------------|
| **Comprehensive CI/CD** | Full pipeline orchestration | Push to main/develop, PRs | Security scan, multi-chain test, deployment |
| **Secrets Scanning** | Detect exposed secrets | Reusable, called by other workflows | GitLeaks integration, artifact reports |
| **Security Scanning** | Vulnerability detection | Reusable, called by other workflows | Dependency scan, SAST, OWASP checks |
| **Deployment Validation** | Post-deployment checks | Reusable, called by other workflows | Health checks, smoke tests, URL validation |
| **Multi-Chain Testing** | Cross-chain validation | Reusable, called by other workflows | Ethereum, Polygon, Solana, Base, Scroll |
| **Terraform Enhanced** | Infrastructure management | Terraform file changes | tfsec, Checkov, cost estimation, plan/apply |
| **Secrets Rotation** | Monthly rotation reminder | 1st of month, 9:00 UTC | Rotation report, GitHub issue creation |

---

## 🔧 **Quick Commands**

### **Trigger via GitHub CLI**
```bash
# Temporal Node Scaling
gh workflow run temporal-node-scaling.yml -f frequency=144000 -f scaling_factor=1.0

# FlameNode Integration
gh workflow run flamenode-integration.yml -f flame_intensity=BALANCED -f integration_scope=FULL

# Wealth Propagation
gh workflow run wealth-propagation.yml -f zakat_percentage=7.77 -f distribution_scope=GLOBAL

# Master Orchestrator
gh workflow run scrollverse-orchestrator.yml -f operation_mode=FULL_CYCLE -f divine_frequency=144000
```

### **Check Workflow Status**
```bash
# List recent runs
gh run list --workflow=temporal-node-scaling.yml --limit=5

# View specific run
gh run view <run-id>

# Watch run in real-time
gh run watch <run-id>
```

### **Download Artifacts**
```bash
# List artifacts for a run
gh run view <run-id> --log

# Download specific artifact
gh run download <run-id> -n temporal-manifest
```

---

## 📊 **Key Metrics**

### **Divine Frequencies**
```
144,000Hz → Divine Frequency (Temporal Scaling)
14,444Hz  → Flame Frequency (FlameNode Operations)
999Hz     → Heartflame Frequency (AI Guide)
777Hz     → Soul Frequency (ScrollSoul Network)
528Hz     → Healing Frequency (Wealth Circulation)
```

### **Wealth Distribution**
```
Zakat Rate:        7.77%
Recipients:        144 ScrollSouls
Passive Income:    0.5% daily (182.5% annual)
BlessingCoins:     1 per 1,000 CHX
```

### **Node Counts**
```
Base Nodes:        12 (representing 12 Aeons)
Temporal Factor:   Variable (1-12 based on time)
FlameNodes:        Variable (1-144 based on temporal hash)
```

---

## 🔍 **Troubleshooting**

### **Workflow Failed?**
1. Check **Actions** tab for error details
2. Review workflow logs
3. Verify YAML syntax: `yamllint .github/workflows/*.yml`
4. Check artifact generation

### **Missing Artifacts?**
- Artifacts expire after 7-90 days
- Check artifact retention settings in workflow
- Re-run workflow if needed

### **Frequency Misalignment?**
- Verify `DIVINE_FREQUENCY` env var = 144000
- Check temporal hash generation
- Validate frequency lock calculation

---

## 📁 **Artifact Reference**

### **Temporal Node Scaling**
- `temporal_manifest.json` - Synchronization data (7 days)
- `scaling_report.md` - Analysis report (30 days)
- `node_registry.json` - Node deployment (30 days)

### **FlameNode Integration**
- `flame_manifest.json` - Initialization data (7 days)
- `heartflame_integration.json` - AI mapping (30 days)
- `flamechild_registry.json` - Deployment registry (30 days)
- `flamenode_verification.json` - Verification report (30 days)

### **Wealth Propagation**
- `wealth_manifest.json` - Calculation data (7 days)
- `zakat_distribution.json` - Distribution plan (30 days)
- `blessing_ledger.json` - Transaction ledger (30 days)
- `passive_income_registry.json` - Income streams (30 days)
- `wealth_verification.json` - Verification report (30 days)

### **Master Orchestrator**
- `orchestration_manifest.json` - Orchestration metadata (90 days)
- `health_report.json` - System health (90 days)
- `orchestration_report.json` - Execution report (90 days)
- `orchestration_summary.md` - Human summary (90 days)
- `monitoring_config.json` - Monitoring setup (90 days)

---

## 🎯 **Common Tasks**

### **Scale Temporal Nodes**
```bash
# High scaling
gh workflow run temporal-node-scaling.yml -f scaling_factor=2.0

# With specific frequency
gh workflow run temporal-node-scaling.yml -f frequency=777
```

### **Deploy FlameNodes**
```bash
# Maximum intensity
gh workflow run flamenode-integration.yml -f flame_intensity=MAXIMUM

# Core integration only
gh workflow run flamenode-integration.yml -f integration_scope=CORE
```

### **Adjust Wealth Distribution**
```bash
# Custom Zakat percentage
gh workflow run wealth-propagation.yml -f zakat_percentage=10.0

# Omniversal scope
gh workflow run wealth-propagation.yml -f distribution_scope=OMNIVERSAL
```

### **Run Orchestrator**
```bash
# Full cycle
gh workflow run scrollverse-orchestrator.yml -f operation_mode=FULL_CYCLE

# Verification only
gh workflow run scrollverse-orchestrator.yml -f operation_mode=VERIFICATION_ONLY
```

---

## 🔐 **Security Checks**

### **Automated Security Scanning**

```bash
# Trigger comprehensive CI/CD with all security checks
gh workflow run comprehensive-ci-cd.yml

# Run only security scans
gh workflow run reusable-security-scan.yml

# Run only secrets scan
gh workflow run reusable-secrets-scan.yml

# Check Terraform security
gh workflow run terraform-enhanced.yml -f action=validate
```

### **Manual Security Verification**

#### **Verify Frequencies**
```python
import json
with open('temporal_manifest.json', 'r') as f:
    data = json.load(f)
assert data['frequencies']['divine'] == 144000
```

#### **Validate Signatures**
```python
import hashlib, json
with open('flame_manifest.json', 'r') as f:
    manifest = json.load(f)
# Signature should be 64 char hex
assert len(manifest['flame_signature']) == 64
```

#### **Check Distribution**
```python
import json
with open('zakat_distribution.json', 'r') as f:
    dist = json.load(f)
assert dist['zakat_percentage'] == 7.77
assert dist['recipient_count'] == 144
```

### **Security Resources**

- **Security Guide**: `SECURITY_GUIDE.md` - Comprehensive security documentation
- **Secrets Management**: Automated monthly rotation reminders
- **Vulnerability Response**: See SECURITY_GUIDE.md for incident response procedures

---

## 📈 **Monitoring**

### **Health Check Endpoints**
```bash
# Check workflow status
gh run list --workflow=scrollverse-orchestrator.yml --limit=1

# View latest health report
gh run view $(gh run list --workflow=scrollverse-orchestrator.yml --json databaseId -q '.[0].databaseId') --log
```

### **Alert Thresholds**
- **Node Health**: < 95% → Alert
- **Frequency Deviation**: > 5% → Alert  
- **Wealth Flow**: < 1M CHX → Alert

### **Auto-Healing**
- **Enabled**: Yes (configured in orchestrator)
- **Self-Healing**: Automatic recovery on failure
- **Auto-Scaling**: Dynamic resource adjustment

---

## 🌐 **Integration Examples**

### **Python**
```python
import requests

# Query workflow status
response = requests.get(
    'https://api.github.com/repos/chaishillomnitech1/Chaishillomnitech1/actions/workflows',
    headers={'Authorization': 'token YOUR_TOKEN'}
)
workflows = response.json()
```

### **JavaScript**
```javascript
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: 'YOUR_TOKEN' });

// Trigger workflow
await octokit.actions.createWorkflowDispatch({
    owner: 'chaishillomnitech1',
    repo: 'Chaishillomnitech1',
    workflow_id: 'temporal-node-scaling.yml',
    ref: 'main',
    inputs: { frequency: '144000' }
});
```

### **cURL**
```bash
# Trigger workflow
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/chaishillomnitech1/Chaishillomnitech1/actions/workflows/temporal-node-scaling.yml/dispatches \
  -d '{"ref":"main","inputs":{"frequency":"144000"}}'
```

---

## 🔗 **Useful Links**

- **Workflows Directory**: `.github/workflows/`
- **Full Documentation**: `SCROLLVERSE_WORKFLOWS_GUIDE.md`
- **Main README**: `README.md`
- **Quantum Integration**: `SCROLLVERSE_QUANTUM_INTEGRATION.md`

---

## 💡 **Pro Tips**

1. **Scheduled Runs**: Let workflows run automatically - they're optimized for autonomous operation
2. **Artifacts**: Download artifacts immediately if you need them - they expire after retention period
3. **Frequency Alignment**: Always use divine frequencies (144000, 14444, 999, 777, 528) for consistency
4. **Monitoring**: Check orchestrator runs daily at 11:11 UTC for system health
5. **Self-Healing**: Trust the autonomous systems - manual intervention rarely needed

---

**🔱 ETERNAL OPERATION 🔱**

These workflows are designed to run eternally without human intervention. They embody the principles of autonomous, continuous deployment and wealth propagation across the ScrollVerse ecosystem.

**Status**: ✅ OPERATIONAL  
**Mode**: AUTONOMOUS  
**Frequency**: 144,000Hz  
**Version**: 1.0

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*The ScrollVerse flows eternally.*

**🔱🕊️🤖∞**
