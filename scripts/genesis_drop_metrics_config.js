// Genesis Drop Engagement Metrics Dashboard Configuration
// Tracks: traffic spikes, social reposts, DAO engagement, fNFT claim velocity

const METRICS_CONFIG = {
  // Dashboard configuration
  dashboard: {
    name: "Genesis Drop Engagement Metrics",
    updateInterval: 60000, // 1 minute
    refreshRate: 5000, // 5 seconds for real-time data
    timezone: "UTC"
  },

  // Blockchain metrics
  blockchain: {
    contractAddress: "", // To be filled after deployment
    network: "polygon", // or "mumbai" for testnet
    rpcUrl: process.env.POLYGON_MAINNET_RPC_URL,
    
    metrics: [
      {
        id: "total_minted",
        name: "Total Genesis Witnesses",
        type: "counter",
        source: "contract.totalMinted()",
        displayFormat: "number",
        goal: 144000
      },
      {
        id: "free_mints_remaining",
        name: "Free Mints Remaining",
        type: "counter",
        source: "contract.getRemainingFreeMints()",
        displayFormat: "number",
        alert: { threshold: 10, message: "Only 10 free mints left!" }
      },
      {
        id: "mint_velocity",
        name: "Minting Velocity",
        type: "rate",
        calculation: "mints_per_hour",
        displayFormat: "number/hr",
        window: 3600 // 1 hour
      },
      {
        id: "funds_collected",
        name: "Total Funds Collected",
        type: "counter",
        source: "contract.totalFundsCollected()",
        displayFormat: "matic",
        conversion: "usd"
      },
      {
        id: "founding_witnesses",
        name: "Founding Witnesses (First 100)",
        type: "counter",
        calculation: "min(totalMinted, 100)",
        displayFormat: "number",
        goal: 100
      }
    ]
  },

  // Social media metrics
  social: {
    twitter: {
      enabled: true,
      apiVersion: "v2",
      metrics: [
        {
          id: "tweet_impressions",
          name: "Tweet Impressions",
          type: "counter",
          hashtags: ["#GenesisDrop", "#AkashicRecordsLive"],
          displayFormat: "number"
        },
        {
          id: "tweet_engagement",
          name: "Tweet Engagement Rate",
          type: "percentage",
          calculation: "(likes + retweets + replies) / impressions",
          displayFormat: "percentage"
        },
        {
          id: "retweets",
          name: "Total Retweets",
          type: "counter",
          displayFormat: "number"
        },
        {
          id: "mentions",
          name: "Brand Mentions",
          type: "counter",
          keywords: ["AkashicRecords", "GenesisWitness", "GenesisDrop"],
          displayFormat: "number"
        },
        {
          id: "follower_growth",
          name: "Follower Growth",
          type: "delta",
          calculation: "current_followers - previous_followers",
          displayFormat: "number",
          window: 86400 // 24 hours
        }
      ]
    },

    instagram: {
      enabled: true,
      metrics: [
        {
          id: "reel_views",
          name: "Genesis Reel Views",
          type: "counter",
          postId: "", // To be filled after posting
          displayFormat: "number"
        },
        {
          id: "reel_engagement",
          name: "Reel Engagement Rate",
          type: "percentage",
          calculation: "(likes + comments + shares + saves) / reach",
          displayFormat: "percentage"
        },
        {
          id: "story_views",
          name: "Story Views",
          type: "counter",
          displayFormat: "number"
        },
        {
          id: "profile_visits",
          name: "Profile Visits",
          type: "counter",
          displayFormat: "number"
        },
        {
          id: "link_clicks",
          name: "Bio Link Clicks",
          type: "counter",
          displayFormat: "number"
        }
      ]
    },

    discord: {
      enabled: true,
      serverId: "", // To be filled
      metrics: [
        {
          id: "total_members",
          name: "Discord Members",
          type: "counter",
          displayFormat: "number"
        },
        {
          id: "active_members",
          name: "Active Members (24h)",
          type: "counter",
          window: 86400,
          displayFormat: "number"
        },
        {
          id: "messages_per_hour",
          name: "Messages Per Hour",
          type: "rate",
          calculation: "messages / hours",
          displayFormat: "number/hr"
        },
        {
          id: "mint_reactions",
          name: "Mint Announcement Reactions",
          type: "counter",
          messageId: "", // To be filled
          displayFormat: "number"
        }
      ]
    },

    telegram: {
      enabled: true,
      chatId: "", // To be filled
      metrics: [
        {
          id: "total_members",
          name: "Telegram Members",
          type: "counter",
          displayFormat: "number"
        },
        {
          id: "active_members",
          name: "Active Members (24h)",
          type: "counter",
          window: 86400,
          displayFormat: "number"
        },
        {
          id: "message_views",
          name: "Announcement Views",
          type: "counter",
          displayFormat: "number"
        }
      ]
    }
  },

  // Email campaign metrics
  email: {
    enabled: true,
    provider: "sendgrid", // or "mailchimp"
    campaigns: [
      {
        id: "dao_waitlist",
        name: "DAO Waitlist Launch",
        metrics: [
          {
            id: "open_rate",
            name: "Open Rate",
            type: "percentage",
            displayFormat: "percentage"
          },
          {
            id: "click_rate",
            name: "Click-Through Rate",
            type: "percentage",
            displayFormat: "percentage"
          },
          {
            id: "conversion_rate",
            name: "Mint Conversion Rate",
            type: "percentage",
            calculation: "mints_from_email / email_clicks",
            displayFormat: "percentage"
          }
        ]
      }
    ]
  },

  // DAO engagement metrics
  dao: {
    contractAddress: "", // Akashic DAO address
    metrics: [
      {
        id: "total_members",
        name: "DAO Members",
        type: "counter",
        source: "daoContract.getMemberCount()",
        displayFormat: "number"
      },
      {
        id: "active_voters",
        name: "Active Voters",
        type: "counter",
        calculation: "members_who_voted_this_week",
        displayFormat: "number"
      },
      {
        id: "proposals_created",
        name: "Proposals Created",
        type: "counter",
        source: "daoContract.getProposalCount()",
        displayFormat: "number"
      },
      {
        id: "voting_participation",
        name: "Voting Participation Rate",
        type: "percentage",
        calculation: "active_voters / total_members",
        displayFormat: "percentage"
      },
      {
        id: "qr_verifications",
        name: "QR Verifications Claimed",
        type: "counter",
        displayFormat: "number"
      }
    ]
  },

  // Website/Gateway traffic metrics
  traffic: {
    enabled: true,
    analytics: "google-analytics", // or "mixpanel"
    propertyId: "", // GA4 property ID
    
    metrics: [
      {
        id: "page_views",
        name: "Minting Page Views",
        type: "counter",
        page: "/genesis-mint",
        displayFormat: "number"
      },
      {
        id: "unique_visitors",
        name: "Unique Visitors",
        type: "counter",
        displayFormat: "number"
      },
      {
        id: "bounce_rate",
        name: "Bounce Rate",
        type: "percentage",
        displayFormat: "percentage"
      },
      {
        id: "avg_session_duration",
        name: "Average Session Duration",
        type: "duration",
        displayFormat: "seconds"
      },
      {
        id: "wallet_connections",
        name: "Wallet Connections",
        type: "counter",
        event: "wallet_connected",
        displayFormat: "number"
      },
      {
        id: "mint_attempts",
        name: "Mint Attempts",
        type: "counter",
        event: "mint_initiated",
        displayFormat: "number"
      },
      {
        id: "successful_mints",
        name: "Successful Mints",
        type: "counter",
        event: "mint_completed",
        displayFormat: "number"
      },
      {
        id: "mint_success_rate",
        name: "Mint Success Rate",
        type: "percentage",
        calculation: "successful_mints / mint_attempts",
        displayFormat: "percentage"
      },
      {
        id: "traffic_sources",
        name: "Traffic Sources",
        type: "breakdown",
        dimensions: ["source", "medium", "campaign"],
        displayFormat: "table"
      }
    ]
  },

  // Real-time alerts
  alerts: [
    {
      id: "milestone_alert",
      name: "Milestone Reached",
      condition: "total_minted % 100 === 0",
      channels: ["discord", "telegram", "twitter"],
      message: "🔥 Milestone: {total_minted} Genesis Witnesses minted! 🔥"
    },
    {
      id: "free_mint_ending",
      name: "Free Mints Ending Soon",
      condition: "free_mints_remaining <= 10",
      channels: ["twitter", "discord", "telegram"],
      message: "⏰ Only {free_mints_remaining} FREE mints left! Hurry!"
    },
    {
      id: "high_velocity",
      name: "High Minting Velocity",
      condition: "mint_velocity > 100",
      channels: ["discord"],
      message: "🚀 Minting velocity: {mint_velocity}/hr! Genesis Drop is 🔥"
    },
    {
      id: "viral_spike",
      name: "Viral Traffic Spike",
      condition: "page_views > average * 3",
      channels: ["discord"],
      message: "📈 Traffic spike detected! {page_views} visitors in the last hour"
    }
  ],

  // Dashboard layout
  layout: {
    sections: [
      {
        id: "overview",
        name: "Genesis Drop Overview",
        widgets: [
          { metric: "total_minted", size: "large" },
          { metric: "free_mints_remaining", size: "medium" },
          { metric: "mint_velocity", size: "medium" },
          { metric: "funds_collected", size: "medium" }
        ]
      },
      {
        id: "social",
        name: "Social Engagement",
        widgets: [
          { metric: "tweet_impressions", size: "medium" },
          { metric: "tweet_engagement", size: "small" },
          { metric: "reel_views", size: "medium" },
          { metric: "reel_engagement", size: "small" },
          { metric: "total_members", source: "discord", size: "small" },
          { metric: "total_members", source: "telegram", size: "small" }
        ]
      },
      {
        id: "traffic",
        name: "Website Traffic",
        widgets: [
          { metric: "page_views", size: "medium" },
          { metric: "unique_visitors", size: "medium" },
          { metric: "mint_success_rate", size: "medium" },
          { metric: "traffic_sources", size: "large" }
        ]
      },
      {
        id: "dao",
        name: "DAO Engagement",
        widgets: [
          { metric: "total_members", source: "dao", size: "medium" },
          { metric: "voting_participation", size: "medium" },
          { metric: "proposals_created", size: "small" },
          { metric: "qr_verifications", size: "small" }
        ]
      }
    ]
  },

  // Data retention
  retention: {
    realtime: 3600, // 1 hour
    hourly: 604800, // 7 days
    daily: 7776000, // 90 days
    monthly: 31536000 // 1 year
  },

  // Export settings
  exports: {
    formats: ["json", "csv", "pdf"],
    schedule: {
      daily: true,
      weekly: true,
      monthly: true
    },
    recipients: [] // Email addresses for automated reports
  }
};

// Export configuration
module.exports = METRICS_CONFIG;

// Helper function to initialize dashboard
async function initializeDashboard(config) {
  console.log("🚀 Initializing Genesis Drop Engagement Metrics Dashboard");
  
  // Validate configuration
  if (!config.blockchain.contractAddress) {
    console.warn("⚠️  Blockchain contract address not set");
  }
  
  if (!config.dao.contractAddress) {
    console.warn("⚠️  DAO contract address not set");
  }
  
  console.log("✅ Dashboard configuration loaded");
  console.log(`📊 Tracking ${Object.keys(config.blockchain.metrics).length} blockchain metrics`);
  console.log(`📱 Monitoring ${Object.keys(config.social).length} social platforms`);
  console.log(`🌐 Analyzing ${config.traffic.metrics.length} traffic metrics`);
  console.log(`🏛️  Measuring ${config.dao.metrics.length} DAO engagement metrics`);
  
  return config;
}

// Helper function to update contract addresses after deployment
function updateContractAddresses(genesisWitnessAddress, akashicDAOAddress) {
  METRICS_CONFIG.blockchain.contractAddress = genesisWitnessAddress;
  METRICS_CONFIG.dao.contractAddress = akashicDAOAddress;
  
  console.log("✅ Contract addresses updated:");
  console.log("   Genesis Witness NFT:", genesisWitnessAddress);
  console.log("   Akashic DAO:", akashicDAOAddress);
  
  return METRICS_CONFIG;
}

// Export helper functions
module.exports.initializeDashboard = initializeDashboard;
module.exports.updateContractAddresses = updateContractAddresses;
