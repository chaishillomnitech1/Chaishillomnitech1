---
name: Vercel Setup
about: Track setup and configuration of Vercel deployment
title: '[VERCEL] Setup Vercel deployment for [environment]'
labels: deployment, vercel, infrastructure
assignees: chaishillomnitech1
---

## 🚀 Vercel Deployment Setup

This issue tracks the setup and configuration of Vercel deployment for the ScrollVerse project.

---

## 📋 Setup Checklist

### Prerequisites
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Vercel CLI installed locally (`npm install -g vercel`)

### Vercel Configuration
- [ ] `.vercel.json` configuration file created/updated
- [ ] `.vercelignore` file configured
- [ ] Build settings configured in Vercel dashboard
- [ ] Environment variables set in Vercel dashboard

### GitHub Integration
- [ ] GitHub Actions workflow configured (`.github/workflows/vercel-deploy.yml`)
- [ ] Required secrets added to GitHub repository
- [ ] Branch deployment strategy configured

### Required GitHub Secrets
- [ ] `VERCEL_TOKEN` - Vercel authentication token
- [ ] `VERCEL_ORG_ID` - Vercel organization ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID

### Environment Variables (Vercel Dashboard)
- [ ] `NEXT_PUBLIC_CHAIN_ID` - Blockchain network chain ID
- [ ] `NEXT_PUBLIC_RPC_URL` - RPC endpoint URL
- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS` - Smart contract addresses
- [ ] Additional environment-specific variables

### Testing
- [ ] Manual deployment test (`vercel --prod`)
- [ ] GitHub Actions workflow test (create test PR)
- [ ] Preview deployment verification
- [ ] Production deployment verification
- [ ] Custom domain configuration (if applicable)

---

## 🔐 Secret Configuration

### How to Get Vercel Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name (e.g., "GitHub Actions - ScrollVerse")
4. Set appropriate scope (Full Account recommended for deployment)
5. Copy the token (you won't see it again!)

### How to Get Vercel IDs

Run this command in your project directory:

```bash
vercel link
```

This will create a `.vercel/project.json` file containing:
- `orgId` → Use as `VERCEL_ORG_ID`
- `projectId` → Use as `VERCEL_PROJECT_ID`

### Adding Secrets to GitHub

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:
   - Name: `VERCEL_TOKEN`
   - Value: [paste your token]
4. Repeat for `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

---

## 🌍 Deployment Environments

### Development
- **Branch**: `develop`
- **URL**: `https://dev-scrollverse.vercel.app`
- **Purpose**: Development testing and feature validation

### Staging
- **Branch**: `staging`
- **URL**: `https://staging-scrollverse.vercel.app`
- **Purpose**: Pre-production testing and QA

### Production
- **Branch**: `main`
- **URL**: `https://scrollverse.vercel.app`
- **Purpose**: Live production environment

---

## 📝 Configuration Files

### `.vercel.json` Example

```json
{
  "version": 2,
  "name": "ScrollVerse",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Environment Variables

Document all required environment variables:

```bash
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# API Keys (never commit these!)
INFURA_KEY=your_infura_key
ALCHEMY_KEY=your_alchemy_key
```

---

## 🧪 Testing Instructions

### Test Preview Deployment

1. Create a test branch:
   ```bash
   git checkout -b test/vercel-setup
   ```

2. Make a small change and push:
   ```bash
   git commit -m "test: Vercel deployment" --allow-empty
   git push origin test/vercel-setup
   ```

3. Create a pull request
4. Check GitHub Actions for deployment status
5. Verify preview URL in PR comment

### Test Production Deployment

1. Merge PR to `main` branch
2. Monitor GitHub Actions workflow
3. Verify production deployment
4. Check production URL

---

## 🔧 Troubleshooting

### Common Issues

**Build fails with "Module not found"**
- Check `package.json` dependencies
- Verify all required packages are listed
- Run `npm ci` locally to test

**Environment variables not loading**
- Verify variables are set in Vercel dashboard
- Check variable names match exactly
- Ensure client-side variables use `NEXT_PUBLIC_` prefix

**Deployment timeout**
- Check build logs for slow operations
- Optimize build process
- Consider increasing timeout in Vercel settings

**Authentication errors**
- Verify `VERCEL_TOKEN` is valid and not expired
- Check token has correct permissions
- Regenerate token if needed

### Getting Help

- Review [Vercel Documentation](https://vercel.com/docs)
- Check [GitHub Actions logs](../../actions)
- Review [DEPLOYMENT.md](../../DEPLOYMENT.md)
- Contact @chaishillomnitech1 for assistance

---

## 📚 Related Documentation

- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Complete deployment guide
- [GITHUB_SECRETS_SETUP.md](../../GITHUB_SECRETS_SETUP.md) - Secrets configuration
- [.env.example](../../.env.example) - Environment variables template
- [Vercel Documentation](https://vercel.com/docs)

---

## ✅ Acceptance Criteria

- [ ] All checklist items completed
- [ ] Test deployments successful (preview and production)
- [ ] All secrets configured correctly
- [ ] Environment variables set for all environments
- [ ] Documentation updated with deployment URLs
- [ ] Team members have access to Vercel project
- [ ] Monitoring and alerts configured

---

## 📸 Screenshots

Please attach screenshots of:
- [ ] Vercel dashboard showing successful deployment
- [ ] GitHub Actions workflow run
- [ ] Preview deployment URL working
- [ ] Production deployment URL working

---

## 🎯 Next Steps

After setup is complete:
1. Configure custom domain (if applicable)
2. Set up monitoring and analytics
3. Configure automatic PR comments for deployments
4. Set up deployment notifications
5. Document deployment process for team

---

**ALLAHU AKBAR! 🕋🔥💎🌌**

**CHAIS THE GREAT ∞** — Forever our creator, forever our compass, forever our source.
