# 🚀 Deployment Guide - Omni-Portal & Repository Enhancement Suite

## Quick Start

This guide will help you deploy and use all the new components added to the ScrollVerse repository.

## 📦 What's Included

1. **CHAIS THE GREAT Omni-Portal** - Interactive web portal
2. **Command & Knowledge Center** - Knowledge management system
3. **Leadership AI** - AI-powered decision support
4. **Repository Health Monitor** - Automated CI/CD health checks
5. **Portal Home** - Unified navigation page

## 🌐 GitHub Pages Deployment

### Enable GitHub Pages

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** (or your default branch)
   - Folder: **/ (root)**
4. Click **Save**

### Access Your Applications

After GitHub Pages is enabled (takes 1-2 minutes), access your applications at:

```
Base URL: https://chaishillomnitech1.github.io/Chaishillomnitech1/

Applications:
- Portal Home:     /portal-home.html
- Omni-Portal:     /omni-portal/index.html
- Command Center:  /command-center/index.html
- Manifesto:       /omni-portal/manifesto.html
```

### Verify Deployment

```bash
# Check if GitHub Pages is working
curl -I https://chaishillomnitech1.github.io/Chaishillomnitech1/portal-home.html

# Should return HTTP 200 OK
```

## 🖥️ Local Development

### Prerequisites

- Python 3.7+ (for Leadership AI and local server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/chaishillomnitech1/Chaishillomnitech1.git
cd Chaishillomnitech1

# Start local web server
python3 -m http.server 8000

# Or use Node.js if you prefer
npx serve .
```

### Access Locally

Open your browser to:
- Portal Home: http://localhost:8000/portal-home.html
- Omni-Portal: http://localhost:8000/omni-portal/index.html
- Command Center: http://localhost:8000/command-center/index.html

## 🧠 Leadership AI Usage

### Python API

```bash
# Navigate to leadership-ai directory
cd leadership-ai

# Run the demo
python leadership_ai.py

# Use in your own scripts
python
>>> from leadership_ai import LeadershipAI
>>> ai = LeadershipAI()
>>> 
>>> # Get deployment guidance
>>> rec = ai.recommend_for_workflow('deployment')
>>> print(rec['guidance'])
>>> 
>>> # Analyze a situation
>>> situation = {
...     'description': 'Deploy new NFT contract',
...     'urgency': 'high',
...     'complexity': 'medium',
...     'resources': 'adequate'
... }
>>> analysis = ai.analyze_situation(situation)
>>> print(analysis['strategy']['name'])
>>> 
>>> # Get leader wisdom
>>> wisdom = ai.get_leader_wisdom('alexander_the_great')
>>> print(wisdom['philosophy'])
```

### Integration with Workflows

Add to your GitHub Actions workflows:

```yaml
- name: Get AI Deployment Guidance
  run: |
    cd leadership-ai
    python -c "
    from leadership_ai import LeadershipAI
    ai = LeadershipAI()
    rec = ai.recommend_for_workflow('deployment')
    print('\n🧠 Leadership AI Guidance:')
    print(f'   {rec[\"guidance\"]}\n')
    print('📋 Deployment Checklist:')
    for i, check in enumerate(rec['checks'], 1):
        print(f'   {i}. {check}')
    "
```

## 📊 Repository Health Monitoring

### Automated Checks

The health check workflow runs automatically:
- **Schedule**: Every 6 hours
- **Triggers**: Push to main/master/develop, Pull requests
- **Manual**: Can be triggered from Actions tab

### View Health Reports

1. Go to **Actions** tab in GitHub
2. Select "Repository Health Check & Monitoring"
3. Click on a recent run
4. Download the "health-report" artifact

### Manual Trigger

```bash
# Using GitHub CLI
gh workflow run repository-health-check.yml

# Or via GitHub web interface:
# Actions → Repository Health Check & Monitoring → Run workflow
```

## 🎨 Customization

### Omni-Portal

**Change Frequencies:**
Edit `omni-portal/portal.js`:

```javascript
const FREQUENCIES = {
    528: { name: 'DNA Healing', color: '#00FF00', speed: 1 },
    777: { name: 'Divine Harmony', color: '#00FFFF', speed: 1.2 },
    // Add your frequencies
};
```

**Update Styling:**
Edit `omni-portal/styles.css`:

```css
:root {
    --gold-primary: #FFD700;      /* Change primary gold color */
    --purple-primary: #9B59B6;    /* Change purple accent */
    --dark-bg: #0a0a1a;           /* Change background */
}
```

### Command Center

**Add Initial Data:**
Edit `command-center/command-center.js` in the `sampleData` object:

```javascript
const sampleData = {
    strategies: [
        {
            title: "Your Strategy",
            description: "Description here",
            category: "Your Category",
            tags: ["tag1", "tag2"],
            date: new Date().toISOString()
        }
    ],
    // ... add leaders and insights
};
```

### Leadership AI

**Add New Leaders:**

```python
from leadership_ai import LeadershipAI

ai = LeadershipAI()

# Add a new leader
ai.leaders['sun_tzu'] = {
    'name': 'Sun Tzu',
    'era': '544-496 BC',
    'domain': 'Military Strategy',
    'key_traits': ['strategic', 'tactical', 'philosophical'],
    'achievements': ['Authored The Art of War'],
    'leadership_style': 'Strategic superiority through wisdom',
    'decision_philosophy': 'Win without fighting'
}

ai.save_knowledge_base()
```

**Add New Strategies:**

```python
ai.strategies['agile_adaptation'] = {
    'name': 'Agile Adaptation Strategy',
    'description': 'Rapidly iterate and adapt based on feedback',
    'when_to_use': 'Fast-changing technology environments',
    'steps': [
        'Build minimum viable version',
        'Deploy and gather feedback',
        'Iterate rapidly',
        'Scale what works'
    ],
    'historical_examples': ['napoleon_bonaparte']
}

ai.save_knowledge_base()
```

## 🔒 Security Best Practices

### Environment Variables

If you add backend functionality later:

```bash
# Create .env file (already in .gitignore)
cp .env.example .env

# Add your secrets
echo "API_KEY=your_key_here" >> .env
```

### Data Privacy

- **Omni-Portal**: All data stored locally in browser (localStorage)
- **Command Center**: All data stored locally in browser
- **Leadership AI**: Knowledge base stored locally as JSON file
- No external API calls or data transmission

### Content Security

The applications follow security best practices:
- No external dependencies in browser apps
- No eval() or dangerous JavaScript
- Proper input sanitization
- CSP headers configured in vercel.json

## 📱 Mobile Access

All applications are fully responsive and work on:
- ✅ iOS (Safari, Chrome)
- ✅ Android (Chrome, Firefox)
- ✅ Tablets
- ✅ Desktop browsers

Test on mobile:
1. Deploy to GitHub Pages
2. Open on mobile device
3. Add to home screen for app-like experience

## 🔧 Troubleshooting

### GitHub Pages Not Working

**Issue**: 404 errors when accessing pages

**Solution**:
1. Check Settings → Pages is enabled
2. Verify branch is correct (main/master)
3. Wait 2-3 minutes after enabling
4. Clear browser cache

### Canvas Not Rendering (Omni-Portal)

**Issue**: Blank portal visualization

**Solution**:
1. Check browser console for errors (F12)
2. Ensure JavaScript is enabled
3. Try different browser
4. Check if canvas element exists

### Leadership AI Module Not Found

**Issue**: `ModuleNotFoundError: No module named 'leadership_ai'`

**Solution**:
```bash
# Ensure you're in the leadership-ai directory
cd leadership-ai

# Run Python from this directory
python leadership_ai.py

# Or add to Python path
export PYTHONPATH="${PYTHONPATH}:/path/to/Chaishillomnitech1/leadership-ai"
```

### Command Center Data Not Persisting

**Issue**: Data disappears after browser close

**Solution**:
1. Check if localStorage is enabled in browser
2. Don't use incognito/private mode
3. Check browser storage settings
4. Export data regularly using console: `exportDatabase()`

### Health Check Workflow Failing

**Issue**: Workflow shows errors

**Solution**:
1. Check if package.json is valid JSON (known issue in repo)
2. Review workflow logs in Actions tab
3. Ensure all required files exist
4. Check if permissions are correct

## 📚 Additional Resources

- [Omni-Portal README](omni-portal/README.md)
- [Leadership AI README](leadership-ai/README.md)
- [Integration Guide](OMNI_PORTAL_INTEGRATION.md)
- [Main Repository README](README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🎯 Testing Checklist

Before finalizing deployment:

- [ ] GitHub Pages enabled and working
- [ ] Omni-Portal loads and animates correctly
- [ ] Frequency buttons work
- [ ] Portal activation works
- [ ] Command Center loads
- [ ] Can add/search/view entries in Command Center
- [ ] Leadership AI runs without errors
- [ ] Knowledge base initializes correctly
- [ ] Health check workflow runs successfully
- [ ] All links work correctly
- [ ] Mobile responsive design verified
- [ ] Browser compatibility checked

## 🚀 Go Live Steps

1. **Merge to Main Branch**
   ```bash
   git checkout main
   git merge copilot/integrate-omni-portal-design
   git push origin main
   ```

2. **Enable GitHub Pages** (if not already enabled)
   - Settings → Pages → Enable

3. **Verify Deployment**
   - Wait 2-3 minutes
   - Visit portal-home.html
   - Test all applications

4. **Announce Launch**
   - Share portal URL with team
   - Update README with links
   - Create announcement post

5. **Monitor**
   - Check health check workflow results
   - Monitor for any issues
   - Gather user feedback

## 🆘 Support

For issues or questions:
1. Check this deployment guide
2. Review documentation in each component's README
3. Check GitHub Issues
4. Review workflow logs in Actions tab

## 📝 Version Information

**Version**: 1.0.0
**Release Date**: January 2026
**Components**:
- Omni-Portal v1.0.0
- Command Center v1.0.0
- Leadership AI v1.0.0
- Repository Health Monitor v1.0.0

---

**"Sovereign deployment for eternal expansion."**

👑 **Supreme King Chais The Great** 👑
