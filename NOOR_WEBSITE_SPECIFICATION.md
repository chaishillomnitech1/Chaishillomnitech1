# 🌐 NOOR CITIES WEBSITE SPECIFICATION 🌐

## **noorcities.scrollverse.is - PUBLIC PORTAL**

**Document ID**: NOOR-WEB-005  
**Classification**: TECHNICAL SPECIFICATION  
**Status**: READY FOR DEVELOPMENT  
**Frequency**: 528Hz + 963Hz + 888Hz  
**Signature**: ∞ ARCHITEX ∞

---

## 🎯 **OVERVIEW**

The Noor Cities website serves as the primary public interface for the Noor Cities of Light Initiative. It provides real-time data visualization, citizen services, staking interfaces, governance tools, and educational resources in a beautiful, responsive, multilingual platform.

---

## 🏗️ **SITE ARCHITECTURE**

### **Technology Stack**
- **Frontend**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS + Framer Motion
- **Blockchain**: ethers.js v6 + wagmi v2
- **State Management**: Zustand + React Query
- **Maps**: Mapbox GL JS
- **Charts**: Recharts + D3.js
- **3D Graphics**: Three.js + React Three Fiber
- **i18n**: next-intl (77 languages)
- **Analytics**: Vercel Analytics + Plausible
- **Hosting**: Vercel Edge Network
- **CDN**: Cloudflare

### **Smart Contract Integration**
```typescript
// Contract addresses from .env
NOOR_TOKEN_ADDRESS
CITIZEN_REGISTRY_ADDRESS
OBELISK_NFT_ADDRESS
STAKING_POOL_ADDRESS
```

### **API Endpoints**
```typescript
// Internal API routes
/api/obelisks/status      // Real-time Obelisk data
/api/citizens/count       // Total citizens
/api/staking/stats        // Staking statistics
/api/governance/proposals // Active proposals
/api/frequencies/live     // Live frequency data
/api/events/upcoming      // Scheduled events
```

---

## 📄 **PAGE STRUCTURE**

### **1. Home Page** (`/`)

#### **Hero Section**
- Full-screen immersive entrance
- Animated frequency visualization (528, 963, 888 Hz)
- Sacred geometry background patterns
- Fade-in welcome message: "Welcome to the Cities of Light"
- "Become a Citizen" CTA button
- "Explore the Map" secondary button

#### **Overview Section**
- Mission statement
- Key statistics (animated counters):
  - 1,111 Cities Planned
  - X Citizens Registered
  - $X.XX Billion Total Value Locked
  - X Obelisks Active
- Three pillars graphic: Love (528Hz), Unity (963Hz), Abundance (888Hz)

#### **Featured Obelisks Carousel**
- Rotating showcase of recently activated Obelisks
- City name, country, activation date
- Current status (online/offline)
- Click to view on map

#### **Latest News Section**
- 3 most recent news articles
- "View All News" link

#### **Call to Action**
- "Join the Movement" button
- Email newsletter signup
- Social media links

#### **Footer**
- Navigation links
- Language selector (77 languages)
- Social media
- Contact information
- Legal links (Terms, Privacy, etc.)

---

### **2. Interactive Map** (`/map`)

#### **Map Interface**
- Full-screen Mapbox integration
- 3D globe mode and flat map mode toggle
- Zoom to any continent
- Search by city name or country

#### **Obelisk Markers**
- Color-coded by status:
  - 🟢 Green: Online and broadcasting
  - 🟡 Yellow: Online but maintenance mode
  - 🔴 Red: Offline
  - ⚪ Gray: Planned but not yet installed

#### **Obelisk Info Panel** (on click)
- City name and country
- Obelisk ID (#1-1111)
- GPS coordinates
- Activation date
- Current status
- Frequency broadcast status (528, 963, 888 Hz)
- Citizen count
- Total energy generated
- Last maintenance date
- Photo gallery
- "Navigate to this Obelisk" button (Google Maps)
- "Register at this location" button

#### **Filters & Layers**
- Filter by status (online/offline/planned)
- Filter by continent
- Show/hide sacred geometry grid overlay
- Show/hide citizen density heatmap
- Show/hide energy generation data

#### **Statistics Panel** (sidebar)
- Total Obelisks: X/1111
- Currently Online: X
- Total Citizens: X
- Energy Generated Today: X kWh
- Global Coherence Score: X/100

---

### **3. Citizenship Portal** (`/citizenship`)

#### **Registration Guide**
- Step-by-step process
- Video tutorial (embedded)
- "Find Registration Center Near You" (map integration)
- FAQ accordion

#### **Benefits Showcase**
- Financial benefits
- Governance rights
- Physical access
- Community benefits
- Spiritual benefits
- Visual comparison table: Citizen vs Non-Citizen

#### **Requirements Section**
- What you need to bring
- How long it takes
- Cost (free!)
- Privacy assurances

#### **Register Now CTA**
- Links to nearest registration centers
- Book appointment (coming soon)

---

### **4. Staking Dashboard** (`/stake`)

#### **Connect Wallet**
- WalletConnect integration
- MetaMask, Coinbase Wallet, etc.
- Network check (must be on Scroll)
- Switch network prompt if wrong network

#### **Account Overview** (when connected)
- Your address (abbreviated)
- Noor Citizen status (✓/✗)
- Your tier badge (Guardian/Protector/etc.)
- Total $NOOR balance
- Total staked
- Available to stake
- Pending rewards

#### **Staking Interface**

**Stake Tab**:
- Input: Amount to stake
- Real-time tier calculation
- Expected APY
- Rewards multiplier
- Voting power preview
- "Approve $NOOR" button (if needed)
- "Stake Now" button
- Minimum stake warning if below 111 NOOR

**Your Stake Tab**:
- Current stake: X NOOR
- Current tier: Badge display
- Staked since: Date
- Earned rewards: X NOOR
- Pending rewards: X NOOR
- Next tier: X NOOR away
- Progress bar to next tier
- "Claim Rewards" button
- "Compound Rewards" button
- "Unstake" button
- Auto-compound toggle switch

**Calculator Tab**:
- Input: Amount to stake
- Input: Time period (days)
- Select: Citizen status (Yes/No)
- Output: Expected rewards
- Output: Expected zakat contribution
- Output: Net earnings
- Breakdown chart

#### **Tier Information Table**
| Tier | Min Stake | APY | Multiplier | Voting | Citizen Bonus |
|------|-----------|-----|------------|--------|---------------|
| Guardian | 777,777 | 21% | 3.0x | 5x | +10% |
| Protector | 111,111 | 17% | 2.5x | 3x | +10% |
| Steward | 11,111 | 13% | 2.0x | 2x | +10% |
| Citizen | 1,111 | 9% | 1.5x | 1x | +10% |
| Participant | 111 | 5% | 1.0x | 0.5x | +10% |

#### **Pool Statistics**
- Total Value Locked (TVL): $X.XX
- Total Staked: X NOOR
- Total Stakers: X
- Total Rewards Distributed: X NOOR
- Total Zakat Distributed: X NOOR
- Reward Pool Balance: X NOOR
- Average APY: X%

#### **Zakat Impact**
- "Your Contributions" personal tracker
- Total zakat from your stakes: X NOOR
- Equivalent USD value: $X.XX
- Recent Sabir Allah Fund allocations
- Impact stories

---

### **5. Governance Portal** (`/governance`)

#### **Active Proposals**
- Card grid layout
- Each card shows:
  - Proposal title
  - Proposer address/name
  - Proposal type (Financial, Technical, etc.)
  - Current votes: For/Against/Abstain
  - Progress bars
  - Time remaining
  - "Vote" button
  - "View Details" link

#### **Proposal Details Page** (`/governance/[id]`)
- Full proposal text
- Proposer information
- Creation date
- Voting period timeline
- Current results (live updates)
- Discussion thread (forum integration)
- "Vote For/Against/Abstain" buttons
- Voting transaction status
- Historical votes (if repeat proposal)

#### **Submit Proposal** (requires 111,111 NOOR staked)
- Title input
- Category dropdown
- Description (Markdown editor)
- Implementation details
- Budget (if applicable)
- Timeline
- Supporting documents upload
- Preview mode
- "Submit Proposal" button (transaction)

#### **Past Proposals Archive**
- Searchable/filterable list
- Status: Passed/Rejected/Expired
- Final vote counts
- Implementation status
- Post-mortem (for passed proposals)

#### **Your Voting Power**
- Display: "You have X voting power"
- Breakdown: (Stake Amount) × (Tier Multiplier)
- Delegation status
- "Delegate Voting Power" button
- Voting history

#### **Governance Stats**
- Total proposals: X
- Proposals passed: X (X%)
- Voter turnout average: X%
- Most active voters (leaderboard)
- Treasury balance: X NOOR

---

### **6. Frequencies Hub** (`/frequencies`)

#### **Live Frequency Monitor**
- Real-time visualization of 528Hz, 963Hz, 888Hz
- 3D waveform animation
- Amplitude meters
- Phase indicators
- Harmonic analysis
- Global coherence score

#### **Obelisk-Specific Data**
- Select any Obelisk from dropdown
- View its frequency broadcasts
- Historical data charts (last 24h, 7d, 30d, all-time)
- Uptime percentage
- Anomaly detection alerts

#### **Frequency Education**
- **528Hz - Love Frequency**
  - Scientific research links
  - Benefits explanation
  - How it works
  - Meditation guide
  
- **963Hz - God Connection**
  - Pineal gland activation
  - Spiritual significance
  - Historical use
  - Guided meditation

- **888Hz - Infinite Abundance**
  - Manifestation principles
  - Christ consciousness connection
  - Prosperity meditation
  - Testimonials

#### **Meditation Timer**
- Set duration (11, 33, 77 minutes)
- Choose frequency focus
- Visual/audio guidance
- Session history
- Share achievements

#### **Global Synchronization Events**
- Upcoming scheduled meditations
- Countdown timer
- "Join Event" button
- Past event recordings
- Participant count

---

### **7. Community Hub** (`/community`)

#### **Citizens Directory** (opt-in only)
- Search by sacred name, location, interests
- Profile cards with:
  - Sacred name
  - Citizen ID
  - Home Obelisk
  - Member since
  - Contribution score
  - Skills/interests
  - "Connect" button

#### **Events Calendar**
- Grid/list view toggle
- Filter by Obelisk location
- Filter by event type
- Each event shows:
  - Title and description
  - Date/time
  - Location (Obelisk name)
  - Organizer
  - Expected attendance
  - "RSVP" button

#### **Forum Integration**
- Recent discussions preview
- Categories: General, Governance, Technical, Spiritual, etc.
- "Join Conversation" links to external forum

#### **Social Feed**
- Twitter/Instagram embed
- Community highlights
- Photo submissions from events
- Success stories

#### **Resources**
- Downloadable guides
- Video library
- Podcast episodes
- Research papers
- Press kit

---

### **8. Obelisk Gallery** (`/gallery`)

#### **NFT Art Display**
- Grid of submitted artworks
- Filter by:
  - Currently displayed on Obelisks
  - Trending (most votes)
  - Recent submissions
  - Artist
  
#### **Artwork Detail Page**
- Full artwork display
- Artist information
- Title and description
- Minted as NFT (link to marketplace)
- Vote count
- Currently displayed on: List of Obelisks
- Schedule: When it will be shown
- "Vote for this art" button
- "Share" button

#### **Submit Artwork**
- Upload image/video
- Artwork details form
- Preview
- Mint as NFT (optional)
- Submit for consideration
- Community voting

---

### **9. Documentation** (`/docs`)

#### **Getting Started**
- What is Noor Cities?
- How to become a citizen
- How to stake
- How to participate in governance

#### **Technical Docs**
- Smart contract addresses
- ABI files
- API documentation
- Integration guides
- Developer resources

#### **User Guides**
- Staking tutorial
- Governance guide
- Wallet setup
- Security best practices
- Troubleshooting

#### **Whitepaper**
- Full vision document
- Tokenomics
- Technical architecture
- Roadmap
- Team

---

### **10. About** (`/about`)

#### **Mission & Vision**
- Origin story
- Core values
- Long-term goals
- Impact metrics

#### **Team**
- Founder: Supreme King Chais The Great ∞
- Core team members
- Advisors
- Community leaders

#### **Partners**
- Technology partners
- Financial partners
- Cultural organizations
- Academic institutions

#### **Press & Media**
- Press releases
- Media coverage
- Brand assets
- Contact for media

#### **Roadmap**
- Q1 2025: Foundation (completed milestones)
- Q2 2025: Launch (upcoming)
- Q3-Q4 2025: Expansion
- 2026-2028: Global completion
- Interactive timeline visualization

---

## 🎨 **DESIGN SYSTEM**

### **Color Palette**

**Primary Colors**:
- **Gold**: `#FFD700` - Divinity, enlightenment
- **Deep Purple**: `#4A0E78` - Spirituality, wisdom
- **Teal**: `#00CED1` - Healing, peace

**Frequency Colors**:
- **528Hz Green**: `#00FF00` - Love, healing
- **963Hz Violet**: `#9400D3` - God connection
- **888Hz Gold**: `#FFD700` - Abundance

**Neutrals**:
- **Background Dark**: `#0A0A0F`
- **Background Light**: `#FFFFFF`
- **Text Dark**: `#1A1A1A`
- **Text Light**: `#F5F5F5`
- **Gray**: `#808080`

### **Typography**
- **Headings**: Inter (modern, clean)
- **Body**: Inter (consistent)
- **Sacred/Special**: Cinzel (elegant, formal)
- **Monospace**: Fira Code (code blocks)

### **Animations**
- Frequency waveforms (always subtle background)
- Smooth page transitions (Framer Motion)
- Hover effects on interactive elements
- Loading states (sacred geometry spinners)
- Particle effects (optional, performance-aware)

### **Responsive Breakpoints**
- Mobile: 0-640px
- Tablet: 641-1024px
- Desktop: 1025-1920px
- Large: 1921px+

---

## 🌍 **INTERNATIONALIZATION (i18n)**

### **Implementation**
```typescript
// next-intl configuration
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

### **Language Selector**
- Dropdown in header
- Flags + language names
- Remembers preference (localStorage + cookie)
- Auto-detect browser language on first visit

### **Priority Languages (Tier 1)**
1. English (en)
2. Arabic (ar)
3. Spanish (es)
4. Mandarin (zh)
5. Hindi (hi)
6. French (fr)
7. Russian (ru)
8. Portuguese (pt)
9. Turkish (tr)
10. Urdu (ur)
11. Indonesian (id)

### **Content Strategy**
- All UI text translatable
- Documentation translated
- Smart contract data (numbers, addresses) remain English
- Sacred names display in user's chosen script
- Forum/social content in user's posted language

---

## ⚡ **PERFORMANCE OPTIMIZATION**

### **Core Web Vitals Targets**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### **Optimization Strategies**
- Next.js App Router with streaming SSR
- Image optimization (next/image)
- Font optimization (next/font)
- Code splitting (dynamic imports)
- Edge caching (Vercel Edge Network)
- API route caching (SWR + React Query)
- Lazy load maps and charts
- Service worker for offline capability
- WebSocket for real-time data (not polling)

### **Loading States**
- Skeleton screens (not spinners)
- Progressive image loading
- Staggered content reveal
- Meaningful loading messages

---

## 🔐 **SECURITY**

### **Wallet Connection**
- Never request seed phrases
- Clear permission requests
- Network validation
- Transaction previews before signing
- Phishing protection warnings

### **Data Protection**
- HTTPS only (enforce)
- No sensitive data in localStorage (use IndexedDB encrypted)
- CSP headers
- XSS protection
- CSRF tokens for forms
- Rate limiting on API routes

### **Smart Contract Interaction**
- Display all transaction details before execution
- Gas estimation
- Slippage warnings
- Contract address verification
- Multi-step confirmations for large transactions

---

## 📊 **ANALYTICS & MONITORING**

### **User Analytics** (Privacy-respecting)
- Page views
- User flows
- Conversion rates (registration, staking)
- Geographic distribution
- Language preferences
- Device types
- No personal identifiers tracked

### **Performance Monitoring**
- Error tracking (Sentry)
- Performance metrics (Vercel Analytics)
- API response times
- Contract call success rates
- Real User Monitoring (RUM)

### **Business Metrics Dashboard** (Admin only)
- New citizens per day/week/month
- TVL over time
- Governance participation rate
- Community engagement
- Obelisk activation progress

---

## 🧪 **TESTING**

### **Test Coverage**
- Unit tests: 80%+ coverage
- Integration tests: Critical paths
- E2E tests: Key user journeys
- Visual regression: Storybook + Chromatic
- Performance tests: Lighthouse CI
- Accessibility tests: axe-core

### **Key Test Scenarios**
1. Connect wallet → Check citizen status
2. Stake tokens → Claim rewards
3. View proposal → Cast vote
4. Search map → View Obelisk details
5. Switch language → Verify translation
6. Register citizenship → Receive NFT

---

## 🚀 **DEPLOYMENT**

### **Development**
```bash
npm run dev
# Runs on localhost:3000
```

### **Staging**
```bash
vercel --prod
# Deploys to staging-noorcities.scrollverse.is
```

### **Production**
```bash
vercel --prod --scope=noor-cities
# Deploys to noorcities.scrollverse.is
```

### **Environment Variables**
```env
# Blockchain
NEXT_PUBLIC_NOOR_TOKEN_ADDRESS=
NEXT_PUBLIC_CITIZEN_REGISTRY_ADDRESS=
NEXT_PUBLIC_OBELISK_NFT_ADDRESS=
NEXT_PUBLIC_STAKING_POOL_ADDRESS=
NEXT_PUBLIC_SCROLL_RPC_URL=

# APIs
MAPBOX_TOKEN=
PINATA_API_KEY=
PINATA_SECRET_KEY=

# Services
DATABASE_URL=
REDIS_URL=
WEBSOCKET_URL=

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
SENTRY_DSN=
```

### **CI/CD Pipeline**
1. Push to GitHub
2. Vercel auto-deploys preview
3. Run tests
4. Visual regression check
5. Performance audit
6. Manual approval (for prod)
7. Deploy to production
8. Smoke tests
9. Announce in Discord

---

## 📱 **MOBILE APP** (Future)

### **Native Apps**
- iOS (Swift + SwiftUI)
- Android (Kotlin + Jetpack Compose)

### **Key Mobile Features**
- Biometric authentication
- Push notifications (event reminders, proposals)
- AR Obelisk visualization (point phone at location)
- QR code check-in at Obelisks
- Offline mode (view staked balance, etc.)
- Widget for home screen (your stake stats)

### **Mobile-First Web**
- Progressive Web App (PWA)
- Add to home screen
- Offline capability
- Mobile-optimized layouts
- Touch gestures

---

## ✅ **LAUNCH CHECKLIST**

### **Pre-Launch**
- [ ] All contracts deployed to mainnet
- [ ] Contract addresses in environment variables
- [ ] All translations complete (at least Tier 1 languages)
- [ ] Performance audit passed
- [ ] Accessibility audit passed
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Error monitoring configured
- [ ] Analytics configured
- [ ] DNS configured
- [ ] SSL certificates installed
- [ ] Backup systems tested

### **Launch Day**
- [ ] Final smoke tests
- [ ] Monitor error rates
- [ ] Watch performance metrics
- [ ] Be available for support
- [ ] Announce on social media
- [ ] Press release distributed
- [ ] Community celebration event

### **Post-Launch**
- [ ] Daily monitoring first week
- [ ] User feedback collection
- [ ] Bug fixes prioritization
- [ ] Feature requests triage
- [ ] Performance optimization
- [ ] Content updates

---

## 🎉 **SUCCESS METRICS**

### **Week 1**
- 1,000+ unique visitors
- 100+ wallet connections
- 10+ governance votes
- 0 critical bugs

### **Month 1**
- 10,000+ unique visitors
- 1,000+ citizens registered
- 100+ active stakers
- $1M+ TVL

### **Year 1**
- 1M+ unique visitors
- 100,000+ citizens
- 10,000+ stakers
- $100M+ TVL
- 111 Obelisks activated

---

**ALLĀHU AKBAR! 🕋✨🌐**

**Frequency**: 528Hz + 963Hz + 888Hz = ∞  
**Status**: SPECIFICATION COMPLETE  
**Ready**: FOR DEVELOPMENT

---

**END OF WEBSITE SPECIFICATION**

**Next Steps**: Begin frontend development using this specification as blueprint
