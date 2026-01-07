/**
 * Frequency-to-Output Converter
 * Converts frequency resonance to tangible outputs (user growth, revenue)
 * Aligned with Phase 4+ resonance protocols
 * 
 * @frequency 528Hz (DNA Healing), 963Hz (Pineal Activation), 144000Hz (NŪR Pulse)
 */

const fs = require('fs');
const path = require('path');

// Load frequency configuration with error handling
let FREQUENCY_CONFIG;
try {
  FREQUENCY_CONFIG = require('../../frequency_config.json');
} catch (error) {
  console.warn('⚠️  Could not load frequency_config.json, using defaults');
  FREQUENCY_CONFIG = {
    frequencies: {
      primary: {
        dna_healing: { hz: 528 },
        pineal_activation: { hz: 963 }
      },
      secondary: {
        crown_sovereignty: { hz: 999 },
        nur_pulse: { hz: 144000 }
      }
    },
    protection_levels: {
      STANDARD: {},
      ENHANCED: {},
      SOVEREIGN: {},
      ETERNAL: {}
    }
  };
}

class FrequencyToOutputConverter {
  constructor() {
    this.frequencies = FREQUENCY_CONFIG.frequencies;
    this.protectionLevels = FREQUENCY_CONFIG.protection_levels;
    this.metricsPath = path.join(__dirname, '../metrics/frequency_outputs.json');
    
    // Initialize output metrics
    this.metrics = {
      userGrowth: {
        total: 0,
        active: 0,
        conversionRate: 0,
        frequencyAlignment: {}
      },
      revenue: {
        total: 0,
        monthly: 0,
        frequencyMultipliers: {}
      },
      resonance: {
        currentLevel: 'STANDARD',
        alignmentScore: 0,
        phaseLevel: 4
      },
      lastUpdated: new Date().toISOString()
    };
    
    this.loadMetrics();
  }

  /**
   * Load existing metrics from file
   */
  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        const data = fs.readFileSync(this.metricsPath, 'utf8');
        this.metrics = JSON.parse(data);
        console.log('✅ Loaded existing frequency output metrics');
      }
    } catch (error) {
      console.warn('⚠️  Could not load existing metrics, using defaults:', error.message);
    }
  }

  /**
   * Save metrics to file
   */
  saveMetrics() {
    try {
      const dir = path.dirname(this.metricsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.metricsPath, JSON.stringify(this.metrics, null, 2));
      console.log('✅ Saved frequency output metrics');
    } catch (error) {
      console.error('❌ Error saving metrics:', error.message);
    }
  }

  /**
   * Calculate user growth based on frequency resonance
   * @param {number} baseUsers - Base number of users
   * @param {string} frequency - Frequency level (528, 963, 999, 144000)
   * @returns {number} Projected user growth
   */
  calculateUserGrowth(baseUsers, frequency) {
    const frequencyMultipliers = {
      528: 1.2,   // DNA Healing - 20% boost
      963: 1.4,   // Pineal Activation - 40% boost
      999: 1.618, // Golden Ratio - 61.8% boost
      144000: 2.0 // NŪR Pulse - 100% boost
    };

    const multiplier = frequencyMultipliers[frequency] || 1.0;
    const projectedGrowth = baseUsers * multiplier;
    
    // Update metrics
    this.metrics.userGrowth.frequencyAlignment[frequency] = {
      baseUsers,
      multiplier,
      projectedGrowth,
      timestamp: new Date().toISOString()
    };

    return Math.floor(projectedGrowth);
  }

  /**
   * Calculate revenue based on frequency alignment
   * @param {number} baseRevenue - Base revenue amount
   * @param {string} protectionLevel - STANDARD, ENHANCED, SOVEREIGN, ETERNAL
   * @returns {number} Projected revenue with frequency multiplier
   */
  calculateRevenue(baseRevenue, protectionLevel = 'STANDARD') {
    const levelMultipliers = {
      'STANDARD': 1.0,
      'ENHANCED': 1.2,
      'SOVEREIGN': 1.618,
      'ETERNAL': 2.0
    };

    const multiplier = levelMultipliers[protectionLevel] || 1.0;
    const projectedRevenue = baseRevenue * multiplier;

    // Update metrics
    this.metrics.revenue.frequencyMultipliers[protectionLevel] = {
      baseRevenue,
      multiplier,
      projectedRevenue,
      timestamp: new Date().toISOString()
    };

    return projectedRevenue;
  }

  /**
   * Calculate resonance alignment score
   * @param {Object} activityData - User activity data
   * @returns {number} Alignment score (0-100)
   */
  calculateResonanceAlignment(activityData) {
    const {
      activeUsers = 0,
      engagement = 0,
      revenue = 0,
      nftMints = 0,
      daoParticipation = 0
    } = activityData;

    // Weighted scoring system
    const weights = {
      activeUsers: 0.25,
      engagement: 0.2,
      revenue: 0.2,
      nftMints: 0.2,
      daoParticipation: 0.15
    };

    // Normalize values to 0-100 scale
    const normalizedScores = {
      activeUsers: Math.min((activeUsers / 100) * 100, 100),
      engagement: Math.min(engagement, 100),
      revenue: Math.min((revenue / 1000) * 100, 100),
      nftMints: Math.min((nftMints / 50) * 100, 100),
      daoParticipation: Math.min(daoParticipation, 100)
    };

    // Calculate weighted score
    let alignmentScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      alignmentScore += normalizedScores[key] * weight;
    }

    this.metrics.resonance.alignmentScore = Math.round(alignmentScore);
    
    // Determine resonance level based on score
    if (alignmentScore >= 90) {
      this.metrics.resonance.currentLevel = 'ETERNAL';
    } else if (alignmentScore >= 70) {
      this.metrics.resonance.currentLevel = 'SOVEREIGN';
    } else if (alignmentScore >= 50) {
      this.metrics.resonance.currentLevel = 'ENHANCED';
    } else {
      this.metrics.resonance.currentLevel = 'STANDARD';
    }

    return alignmentScore;
  }

  /**
   * Convert frequency resonance to tangible outputs
   * @param {Object} inputData - Input data for conversion
   * @returns {Object} Output projections
   */
  convertToOutputs(inputData) {
    const {
      currentUsers = 0,
      currentRevenue = 0,
      activityData = {}
    } = inputData;

    // Calculate alignment score
    const alignmentScore = this.calculateResonanceAlignment(activityData);

    // Calculate user growth for different frequencies
    const userGrowthProjections = {
      '528Hz': this.calculateUserGrowth(currentUsers, 528),
      '963Hz': this.calculateUserGrowth(currentUsers, 963),
      '999Hz': this.calculateUserGrowth(currentUsers, 999),
      '144000Hz': this.calculateUserGrowth(currentUsers, 144000)
    };

    // Calculate revenue projections for different protection levels
    const revenueProjections = {
      'STANDARD': this.calculateRevenue(currentRevenue, 'STANDARD'),
      'ENHANCED': this.calculateRevenue(currentRevenue, 'ENHANCED'),
      'SOVEREIGN': this.calculateRevenue(currentRevenue, 'SOVEREIGN'),
      'ETERNAL': this.calculateRevenue(currentRevenue, 'ETERNAL')
    };

    // Update overall metrics
    this.metrics.userGrowth.total = currentUsers;
    this.metrics.userGrowth.active = activityData.activeUsers || 0;
    this.metrics.revenue.total = currentRevenue;
    this.metrics.lastUpdated = new Date().toISOString();

    // Save metrics
    this.saveMetrics();

    return {
      alignmentScore,
      resonanceLevel: this.metrics.resonance.currentLevel,
      userGrowthProjections,
      revenueProjections,
      phase: this.metrics.resonance.phaseLevel,
      recommendations: this.generateRecommendations(alignmentScore)
    };
  }

  /**
   * Generate recommendations based on alignment score
   * @param {number} alignmentScore - Current alignment score
   * @returns {Array} List of recommendations
   */
  generateRecommendations(alignmentScore) {
    const recommendations = [];

    if (alignmentScore < 50) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Increase user engagement through frequency-aligned content',
        frequency: '528Hz',
        expectedImpact: '+20% alignment score'
      });
      recommendations.push({
        priority: 'HIGH',
        action: 'Launch DAO participation campaigns',
        frequency: '963Hz',
        expectedImpact: '+15% alignment score'
      });
    } else if (alignmentScore < 70) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Expand NFT minting with sacred geometry integration',
        frequency: '999Hz',
        expectedImpact: '+10% alignment score'
      });
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Implement revenue diversification strategies',
        frequency: '963Hz',
        expectedImpact: '+12% revenue growth'
      });
    } else if (alignmentScore < 90) {
      recommendations.push({
        priority: 'LOW',
        action: 'Optimize existing systems for ETERNAL level',
        frequency: '144000Hz',
        expectedImpact: '+8% alignment score'
      });
    } else {
      recommendations.push({
        priority: 'MAINTENANCE',
        action: 'Maintain ETERNAL resonance level',
        frequency: 'ALL',
        expectedImpact: 'Sustained growth'
      });
    }

    return recommendations;
  }

  /**
   * Get current metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Generate report
   * @returns {string} Formatted report
   */
  generateReport() {
    const report = `
╔══════════════════════════════════════════════════════════════════════╗
║         FREQUENCY-TO-OUTPUT CONVERSION REPORT                        ║
║         Generated: ${new Date().toLocaleString()}                    
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  RESONANCE METRICS                                                   ║
║  ├─ Current Level: ${this.metrics.resonance.currentLevel.padEnd(20)}         ║
║  ├─ Alignment Score: ${this.metrics.resonance.alignmentScore}/100                        ║
║  └─ Phase Level: ${this.metrics.resonance.phaseLevel}                                    ║
║                                                                      ║
║  USER GROWTH METRICS                                                 ║
║  ├─ Total Users: ${this.metrics.userGrowth.total.toString().padEnd(30)}        ║
║  ├─ Active Users: ${this.metrics.userGrowth.active.toString().padEnd(29)}        ║
║  └─ Conversion Rate: ${(this.metrics.userGrowth.conversionRate * 100).toFixed(2)}%                     ║
║                                                                      ║
║  REVENUE METRICS                                                     ║
║  ├─ Total Revenue: $${this.metrics.revenue.total.toFixed(2).padEnd(28)}        ║
║  └─ Monthly Revenue: $${this.metrics.revenue.monthly.toFixed(2).padEnd(26)}        ║
║                                                                      ║
║  FREQUENCY ALIGNMENT                                                 ║
║  ├─ 528Hz (DNA Healing): Active                                      ║
║  ├─ 963Hz (Pineal Activation): Active                                ║
║  └─ 144000Hz (NŪR Pulse): Active                                     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`;
    return report;
  }
}

// Export the class
module.exports = FrequencyToOutputConverter;

// CLI usage
if (require.main === module) {
  const converter = new FrequencyToOutputConverter();
  
  // Example usage
  const result = converter.convertToOutputs({
    currentUsers: 25,
    currentRevenue: 250,
    activityData: {
      activeUsers: 18,
      engagement: 65,
      revenue: 250,
      nftMints: 12,
      daoParticipation: 45
    }
  });

  console.log(converter.generateReport());
  console.log('\n📊 Projections:');
  console.log(JSON.stringify(result, null, 2));
}
