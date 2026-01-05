# Dependency Management Guide

## Overview

This guide covers how we manage dependencies in the Omnitech1 ecosystem, including updates, security scanning, and best practices.

## Automated Dependency Updates

### Dependabot Configuration

We use GitHub Dependabot to automatically check for dependency updates. Configuration is in `.github/dependabot.yml`.

**Enabled Ecosystems:**
- npm (JavaScript/Node.js)
- GitHub Actions
- Docker
- Terraform

**Update Schedule:**
- Weekly on Mondays at 9:00 AM EST
- Automatic pull requests for security updates
- Grouped updates for related packages

### Renovate Bot (Optional)

Renovate provides additional configuration options. See `.github/renovate.json` for settings.

## Manual Dependency Updates

### Check for Outdated Packages

```bash
# Check all outdated packages
npm outdated

# Check specific package
npm outdated <package-name>
```

### Update Dependencies

```bash
# Update all dependencies to latest (respect semver)
npm update

# Update to latest version (may break semver)
npm install <package>@latest

# Update all to latest (careful!)
npm update --latest
```

### Update Hardhat and OpenZeppelin

```bash
# Update Hardhat
npm install hardhat@latest @nomicfoundation/hardhat-toolbox@latest --save-dev

# Update OpenZeppelin (check for breaking changes!)
npm install @openzeppelin/contracts@latest
```

**⚠️ Important**: OpenZeppelin v5.x has breaking changes from v4.x. Review migration guide before updating.

## Security Scanning

### npm audit

Run security audits regularly:

```bash
# Run audit
npm audit

# Show detailed report
npm audit --json

# Fix automatically (use with caution)
npm audit fix

# Fix including breaking changes
npm audit fix --force
```

### Dependabot Security Alerts

GitHub will automatically create security alerts for vulnerabilities in dependencies.

**How to handle:**
1. Review the alert details
2. Check if fix is available
3. Test the update locally
4. Merge the Dependabot PR

## Dependency Policies

### Version Pinning

**Smart Contracts (production):**
```json
{
  "dependencies": {
    "@openzeppelin/contracts": "5.0.1"  // Exact version
  }
}
```

**Development Tools:**
```json
{
  "devDependencies": {
    "hardhat": "^2.19.0",  // Minor updates allowed
    "eslint": "^8.56.0"
  }
}
```

### Allowed Licenses

We only use dependencies with compatible licenses:
- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC

### Version Update Strategy

| Type | Strategy | Example |
|------|----------|---------|
| Patch | Auto-merge | 1.0.0 → 1.0.1 |
| Minor | Review + Merge | 1.0.0 → 1.1.0 |
| Major | Manual Review | 1.0.0 → 2.0.0 |
| Security | Immediate | Any version |

## Handling Dependency Updates

### Review Process

1. **Check Changelog**: Review what changed
2. **Test Locally**: Run all tests
3. **Check Breaking Changes**: Look for migration guides
4. **Update Code**: Adapt to API changes
5. **Deploy to Testnet**: Test in real environment
6. **Merge**: After verification

### Testing After Updates

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Compile contracts
npm run compile

# Run all tests
npm test

# Check for linting issues
npm run lint

# Run specific tests
npm run test:unit
npm run test:coverage
```

### Rollback Process

If an update causes issues:

```bash
# Revert to previous version
npm install <package>@<previous-version>

# Or restore package-lock.json from git
git checkout package-lock.json
npm ci
```

## OpenZeppelin Updates

### Version Compatibility

Current version: **5.0.1**

**Breaking changes from v4.x:**
- Ownable constructor requires `initialOwner` parameter
- AccessControl changes
- ERC20/ERC721 updates

### Migration Checklist

- [ ] Read OpenZeppelin migration guide
- [ ] Update all contract imports
- [ ] Modify constructor calls
- [ ] Update tests
- [ ] Run full test suite
- [ ] Deploy to testnet
- [ ] Audit changes

### Example Migration

**Old (v4.x):**
```solidity
contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        // Owner is msg.sender by default
    }
}
```

**New (v5.x):**
```solidity
contract MyToken is ERC20, Ownable {
    constructor(address initialOwner) 
        ERC20("MyToken", "MTK") 
        Ownable(initialOwner) 
    {
        // Must explicitly set owner
    }
}
```

## Hardhat Updates

### Update Procedure

```bash
# Update Hardhat
npm install hardhat@latest --save-dev

# Update Hardhat plugins
npm install @nomicfoundation/hardhat-toolbox@latest --save-dev

# Clean cache
npx hardhat clean

# Test compilation
npm run compile
```

### Configuration Changes

After updates, check `hardhat.config.js` for:
- New configuration options
- Deprecated settings
- Plugin updates

## GitHub Actions Updates

Dependabot automatically updates GitHub Actions versions.

**Review checklist:**
- [ ] Check action changelog
- [ ] Verify inputs/outputs compatibility
- [ ] Test workflow locally (if possible)
- [ ] Monitor first workflow run

## Best Practices

### Before Updating

1. **Backup**: Commit current working state
2. **Read**: Review changelogs and migration guides
3. **Plan**: Identify potential breaking changes
4. **Test**: Have comprehensive test coverage

### During Update

1. **One at a time**: Update dependencies individually
2. **Test**: Run tests after each update
3. **Document**: Note any required code changes
4. **Commit**: Make atomic commits per dependency

### After Update

1. **Verify**: All tests pass
2. **Deploy**: Test on testnet/staging
3. **Monitor**: Watch for issues
4. **Document**: Update changelog

## Troubleshooting

### Dependency Conflicts

```bash
# Check dependency tree
npm list <package>

# Remove lock file and reinstall
rm package-lock.json
npm install

# Use npm dedupe
npm dedupe
```

### Build Failures After Update

```bash
# Clear cache
npx hardhat clean
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run compile
npm test
```

### Audit Failures

```bash
# See details
npm audit --json

# Force resolution
npm audit fix --force

# Manual fix
npm install <package>@<safe-version>
```

## Monitoring

### Weekly Tasks

- [ ] Review Dependabot PRs
- [ ] Check for security alerts
- [ ] Run `npm outdated`
- [ ] Monitor build status

### Monthly Tasks

- [ ] Review all dependencies
- [ ] Check for major version updates
- [ ] Audit unused dependencies
- [ ] Update documentation

### Quarterly Tasks

- [ ] Major version reviews
- [ ] License compliance check
- [ ] Dependency cleanup
- [ ] Security audit

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Hardhat Updates](https://hardhat.org/hardhat-runner/docs/getting-started)
- [OpenZeppelin Releases](https://github.com/OpenZeppelin/openzeppelin-contracts/releases)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)

## Emergency Updates

For critical security vulnerabilities:

1. **Assess**: Review vulnerability details
2. **Update**: Apply fix immediately
3. **Test**: Run comprehensive tests
4. **Deploy**: Emergency deployment to production
5. **Notify**: Inform stakeholders
6. **Document**: Record incident and response

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

*Keep dependencies secure and up-to-date for a robust ecosystem!*
