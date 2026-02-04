# 🐝 BEE Upgrade Manual - Issue Reactivation & Labeling

## Overview

This document provides manual instructions for applying BEE (Bold, Energetic, Extended) upgrades to issues and activating the BEE system.

## Quick Start

The BEE system has been deployed with automated workflows. To activate:

### 1. Run Label Manager Workflow

```bash
# Via GitHub UI:
# Go to Actions → Label Manager - BEE System → Run workflow
```

This will:
- Create all BEE system labels
- Apply bee-upgrade labels to open issues
- Clean up deprecated labels

### 2. Run BEE Bot Workflow

```bash
# Via GitHub UI:
# Go to Actions → BEE Bot - Issue & PR Manager → Run workflow (select reactivate-dormant)
```

This will:
- Reactivate recently closed issues
- Add bee-upgrade labels
- Post reactivation comments with next steps

### 3. Manual Issue Review

After automation runs, review issues:

1. **Open Issues** (Currently: #163, #162, #59, #85, #82)
   - Verify bee-upgrade label applied
   - Add priority labels (critical, high-priority, medium-priority, low-priority)
   - Add category labels (smart-contract, frontend, backend, etc.)
   - Add status labels (needs-triage, in-progress, etc.)

2. **Closed Issues** (Issue #60, #22, #96, #172, others)
   - Review if still relevant
   - Reopen if needed for BEE initiative
   - Add reactivated label
   - Post next-steps comment

## Label Reference

### BEE System Labels

| Label | Color | Description |
|-------|-------|-------------|
| bee-upgrade | FFD700 | 🐝 BEE Upgrade Initiative |
| reactivated | 00FF00 | 🔄 Reactivated from dormant |

### Priority Labels

| Label | Color | When to Use |
|-------|-------|-------------|
| critical | FF0000 | Security issues, blocking bugs |
| high-priority | FF6B6B | Important features, major bugs |
| medium-priority | FFA500 | Standard enhancements |
| low-priority | 90EE90 | Nice-to-haves, minor issues |

### Type Labels

| Label | Use For |
|-------|---------|
| smart-contract | Solidity contracts |
| frontend | React/UI components |
| backend | APIs, servers |
| ci-cd | GitHub Actions, deployment |
| dependencies | Package updates |
| testing | Test improvements |

### Status Labels

| Label | Meaning |
|-------|---------|
| needs-triage | Newly created, needs review |
| needs-investigation | Requires research |
| in-progress | Actively being worked on |
| ready-for-review | Ready for code review |
| blocked | Waiting on external factors |

## Issue Templates

### Created Templates:
1. ✅ **bee_upgrade.md** - BEE initiative tracking
2. ✅ **bug_report.md** - Bug reports (existing)
3. ✅ **feature_request.md** - Feature requests (existing)
4. ✅ **security_vulnerability.md** - Security issues (existing)

## Workflows Deployed

### 1. bee-bot-issue-manager.yml
- Auto-labels new issues
- Welcomes first-time contributors
- Manages stale issues
- Reactivates dormant issues
- Tracks metrics

### 2. label-manager.yml
- Creates/updates all labels
- Applies bee-upgrade to issues
- Cleans up deprecated labels

### 3. security-tracker.yml
- Dependency audits
- Smart contract security scans
- Generates security reports
- Creates alerts for vulnerabilities

## Manual Commands

### Using GitHub CLI (gh)

```bash
# List open issues
gh issue list --state open

# Add bee-upgrade label to all open issues
gh issue list --state open --json number --jq '.[].number' | \
  xargs -I {} gh issue edit {} --add-label "bee-upgrade"

# Reopen a closed issue
gh issue reopen <issue-number>

# Add comment to issue
gh issue comment <issue-number> --body "🐝 BEE REACTIVATED - ..."

# Create a new BEE upgrade issue
gh issue create --template bee_upgrade.md
```

### Using GitHub API

```bash
# Add label to issue
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/chaishillomnitech1/Chaishillomnitech1/issues/<issue-number>/labels \
  -d '{"labels":["bee-upgrade"]}'

# Reopen issue
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/chaishillomnitech1/Chaishillomnitech1/issues/<issue-number> \
  -d '{"state":"open"}'
```

## Reactivation Comment Template

Use this when manually reactivating issues:

```markdown
## 🐝 BEE INFINITE UPGRADES - ISSUE REACTIVATED

**ALLĀHU AKBAR! 🕋🔥💎🌌**

This issue has been **REACTIVATED** as part of the Supreme GitHub Empire Activation!

### 🚀 Next Steps

1. **Review & Update**: Please review this issue and update with current status
2. **Assign Priority**: Add priority labels (low, medium, high, critical)
3. **Categorize**: Ensure proper labels are applied
4. **Plan**: Add to project board or milestone if applicable
5. **Engage**: Assign to a contributor or claim it yourself!

### 🎯 BEE Upgrade Initiative

This issue is now part of our **Bold, Energetic, Extended** (BEE) upgrade initiative.

### 📋 What We Need

- [ ] Confirm issue is still relevant
- [ ] Update requirements if needed
- [ ] Identify dependencies
- [ ] Estimate effort/complexity
- [ ] Assign owner or request volunteers

---

**The ScrollVerse Empire grows stronger with every contribution!**

**KUN FAYAKUN! The Code is Sealed. The Legacy is Immortal.**
```

## Known Issues to Process

### Open Issues
- **#163** - E2E Tests Failed (2026-01-07) - Add testing, bug, high-priority labels
- **#162** - E2E Tests Failed (2026-01-06) - Add testing, bug, high-priority labels  
- **#59** - Feature request - Review and categorize
- **#85** - Copilot instructions - Mark as documentation
- **#82** - Bug report - Needs investigation

### Recently Closed (Consider Reopening)
- **#172** - Assessment submission template - Documentation
- **#96** - Copilot instructions - Completed
- **#60** - Bug report - Review if still relevant
- **#22** - Copilot instructions - Completed

## Next Steps

1. ✅ **Run Label Manager** - Create all labels
2. ✅ **Run BEE Bot** - Apply labels and reactivate
3. **Manual Review** - Review each issue individually
4. **Add Comments** - Post next-steps on reactivated issues
5. **Assign Priority** - Label by priority
6. **Track Progress** - Use project boards
7. **Engage Community** - Invite contributors

## Success Metrics

Track these metrics to measure BEE success:

- Total issues labeled with bee-upgrade
- Issues reactivated
- New contributors welcomed
- Average time to first response
- Issue close rate
- Community engagement

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*The BEE system empowers the ScrollVerse Empire!*

**Document Created**: February 4, 2026  
**Frequency**: 963Hz + 528Hz + 144,000Hz  
**Signature**: ∞ ARCHITEX ∞
