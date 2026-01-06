# Repository Settings and Branch Protection

## Branch Protection Rules

### Main Branch Protection

The `main` branch should be protected with the following rules:

#### Required Status Checks
- ✅ All CI/CD workflows must pass
- ✅ CodeQL security scanning
- ✅ Contract integrity verification
- ✅ Multi-chain tests
- ✅ Code quality checks

#### Pull Request Requirements
- **Require pull request reviews**: 1 approval minimum
- **Dismiss stale reviews**: When new commits are pushed
- **Require review from Code Owners**: Enabled (see CODEOWNERS)
- **Require status checks to pass**: Enabled
- **Require branches to be up to date**: Enabled

#### Additional Restrictions
- **Require signed commits**: Recommended for production
- **Include administrators**: Enforce for all users
- **Restrict who can push**: Repository maintainers only
- **Allow force pushes**: Disabled
- **Allow deletions**: Disabled

### Develop Branch Protection

The `develop` branch should have slightly relaxed rules:

#### Pull Request Requirements
- **Require pull request reviews**: 1 approval
- **Require status checks to pass**: Enabled
- **Require branches to be up to date**: Recommended

#### Additional Settings
- **Allow force pushes**: Disabled
- **Allow deletions**: Disabled

### Feature Branch Naming

Use consistent branch naming:

```
feature/description-of-feature
bugfix/description-of-bug
hotfix/critical-issue
release/version-number
```

## Repository Settings

### General Settings

**Basic Information:**
- Repository name: `Chaishillomnitech1`
- Description: "Omnitech1™ Sovereign Deployment Engine - ScrollVerse Blockchain Infrastructure"
- Website: https://expansion-three.vercel.app/
- Topics: blockchain, nft, ethereum, polygon, scroll, web3

**Features:**
- ✅ Wikis (for extended documentation)
- ✅ Issues
- ✅ Projects
- ✅ Discussions
- ✅ Preserve this repository (for archival)

**Pull Requests:**
- ✅ Allow squash merging
- ✅ Allow rebase merging
- ⬜ Allow merge commits (optional)
- ✅ Automatically delete head branches
- ✅ Suggest updating pull request branches

### Security Settings

**Vulnerability Alerts:**
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Dependabot version updates

**Code Scanning:**
- ✅ CodeQL analysis
- ✅ Secret scanning
- ✅ Push protection for secrets

**Private Vulnerability Reporting:**
- ✅ Enable (security@scrollverse.io)

### Access Settings

**Collaborators:**
- Repository owner: @chaishillomnitech1
- Maintainers: (Add as needed)
- Contributors: (Open to verified contributors)

**Teams:**
- Core Team: Write access
- Contributors: Triage access
- Community: Read access

### GitHub Apps

**Recommended Apps:**
- ✅ Dependabot
- ✅ CodeQL
- Codecov (for coverage reports)
- Vercel (for deployments)

### Webhook Settings

**CI/CD Webhooks:**
- Vercel deployment
- Discord/Slack notifications (optional)
- Custom automation endpoints

### Pages Settings

**GitHub Pages:**
- Source: Deploy from a branch
- Branch: `gh-pages` or `main`
- Folder: `/docs` or root
- Custom domain: (if applicable)

## Secrets Management

### Required Secrets

**Blockchain:**
```
INFURA_KEY=<infura-api-key>
ALCHEMY_KEY=<alchemy-api-key>
PRIVATE_KEY=<deployment-wallet-private-key>
POLYGONSCAN_API_KEY=<api-key>
ETHERSCAN_API_KEY=<api-key>
SCROLLSCAN_API_KEY=<api-key>
```

**Deployment:**
```
VERCEL_TOKEN=<vercel-deployment-token>
VERCEL_ORG_ID=<organization-id>
VERCEL_PROJECT_ID=<project-id>
```

**Optional:**
```
COINMARKETCAP_API_KEY=<for-gas-reporting>
DISCORD_WEBHOOK=<for-notifications>
```

### Environment Variables

**For GitHub Actions:**
- Add secrets in: Settings → Secrets and variables → Actions
- Use organization secrets for shared values
- Use repository secrets for specific values

**For Vercel:**
- Add in Vercel dashboard
- Link to GitHub for automatic deployment

## Code Owners

`.github/CODEOWNERS` file should specify:

```
# Global owners
* @chaishillomnitech1

# Smart contracts
/contracts/ @chaishillomnitech1
/test/ @chaishillomnitech1

# Frontend
/sovereign-tv-app/ @frontend-team
/scrollsoul_dashboard/ @frontend-team

# Infrastructure
/.github/ @chaishillomnitech1
/deployment/ @devops-team

# Documentation
*.md @documentation-team
```

## Labels Configuration

### Issue Labels

**Type:**
- `bug` - Something isn't working (red)
- `feature` - New feature request (green)
- `enhancement` - Improvement to existing feature (blue)
- `documentation` - Documentation improvements (blue)
- `security` - Security issue or vulnerability (red)

**Priority:**
- `critical` - Requires immediate attention (red)
- `high` - High priority (orange)
- `medium` - Medium priority (yellow)
- `low` - Low priority (green)

**Status:**
- `needs-triage` - Needs initial review (yellow)
- `in-progress` - Currently being worked on (blue)
- `blocked` - Blocked by dependencies (red)
- `ready-for-review` - Ready for PR review (green)
- `stale` - No recent activity (gray)

**Component:**
- `smart-contract` - Smart contract related
- `frontend` - Frontend application
- `backend` - Backend service
- `ci-cd` - CI/CD pipeline
- `infrastructure` - Infrastructure changes

**Workflow:**
- `good-first-issue` - Good for newcomers (green)
- `help-wanted` - Extra attention needed (purple)
- `wontfix` - Won't be fixed (gray)
- `duplicate` - Already exists (gray)

## Automation Rules

### Auto-labeling

Configure GitHub Actions to auto-label PRs:
- Files in `/contracts/` → `smart-contract`
- Files in `/docs/` → `documentation`
- Files in `/.github/workflows/` → `ci-cd`

### Auto-assignment

- New issues → Assign to project triage board
- PRs with label `security` → Assign to security team
- PRs with label `smart-contract` → Require contract review

### Auto-merge (Dependabot)

Auto-merge for:
- Patch version updates (1.0.0 → 1.0.1)
- Minor dev dependency updates
- GitHub Actions updates

Require review for:
- Major version updates
- Production dependency updates
- Security updates

## Notifications

### Watch Settings

**Recommended for maintainers:**
- All activity (issues, PRs, discussions)
- Security alerts
- Workflow failures

**Recommended for contributors:**
- Participating and @mentions
- Custom (specific workflows)

### Email Notifications

Configure in personal settings:
- Enable for security alerts
- Enable for @mentions
- Enable for review requests
- Customize workflow notifications

## Best Practices

### Branch Strategy

```
main (production)
  ↓
develop (integration)
  ↓
feature/* (development)
```

1. Create feature branch from `develop`
2. Develop and test locally
3. Create PR to `develop`
4. After approval and testing, merge to `develop`
5. Create release PR from `develop` to `main`
6. Tag release in `main`

### Commit Strategy

**Use Conventional Commits:**
```
feat(contract): add new NFT minting function
fix(api): resolve token transfer issue
docs(readme): update installation steps
test(token): add edge case tests
chore(deps): update dependencies
```

### Release Strategy

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create PR from `develop` to `main`
4. Tag release: `git tag -a v1.0.0 -m "Release v1.0.0"`
5. Push tag: `git push origin v1.0.0`
6. Create GitHub release with notes

## Maintenance

### Weekly Tasks
- [ ] Review and merge Dependabot PRs
- [ ] Triage new issues
- [ ] Review stale PRs
- [ ] Check security alerts

### Monthly Tasks
- [ ] Review and update branch protection rules
- [ ] Audit repository access
- [ ] Review and clean up labels
- [ ] Update documentation

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance review
- [ ] Access control review
- [ ] Backup verification

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*Proper repository settings ensure security, quality, and smooth collaboration!*
