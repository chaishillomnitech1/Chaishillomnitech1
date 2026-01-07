/**
 * Growth Goals Tracker
 * Tracks progress toward 100 active users and $1K revenue milestones
 * Aligned with investor appeal and traction requirements
 */

const fs = require('fs');
const path = require('path');

class GrowthGoalsTracker {
  constructor() {
    this.metricsPath = path.join(__dirname, '../metrics/growth_goals.json');
    
    // Define initial goals
    this.goals = {
      users: {
        target: 100,
        current: 0,
        milestone: '100 Active Users',
        progress: 0,
        status: 'IN_PROGRESS',
        milestones: [
          { value: 10, label: 'First 10 Users', reached: false },
          { value: 25, label: 'Early Adopters', reached: false },
          { value: 50, label: 'Halfway Point', reached: false },
          { value: 75, label: 'Approaching Goal', reached: false },
          { value: 100, label: 'TARGET REACHED', reached: false }
        ]
      },
      revenue: {
        target: 1000,
        current: 0,
        milestone: '$1K Revenue',
        progress: 0,
        status: 'IN_PROGRESS',
        milestones: [
          { value: 100, label: 'First $100', reached: false },
          { value: 250, label: 'Quarter Mark', reached: false },
          { value: 500, label: 'Halfway Point', reached: false },
          { value: 750, label: 'Three Quarters', reached: false },
          { value: 1000, label: 'TARGET REACHED', reached: false }
        ]
      },
      investorAppeal: {
        metrics: {
          userGrowthRate: 0,      // % growth per week
          revenueGrowthRate: 0,   // % growth per week
          engagementRate: 0,       // % of active users
          retentionRate: 0,        // % of users returning
          conversionRate: 0        // % of visitors converting
        },
        score: 0,
        rating: 'NOT_READY'
      },
      timeline: {
        started: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        daysActive: 0,
        projectedCompletion: null
      }
    };
    
    this.loadGoals();
  }

  /**
   * Load existing goals
   */
  loadGoals() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        const data = fs.readFileSync(this.metricsPath, 'utf8');
        this.goals = JSON.parse(data);
        console.log('✅ Loaded existing growth goals');
      }
    } catch (error) {
      console.warn('⚠️  Could not load existing goals:', error.message);
    }
  }

  /**
   * Save goals to file
   */
  saveGoals() {
    try {
      const dir = path.dirname(this.metricsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.metricsPath, JSON.stringify(this.goals, null, 2));
      console.log('✅ Saved growth goals');
    } catch (error) {
      console.error('❌ Error saving goals:', error.message);
    }
  }

  /**
   * Update user count
   * @param {number} userCount - Current active user count
   */
  updateUsers(userCount) {
    const previous = this.goals.users.current;
    this.goals.users.current = userCount;
    this.goals.users.progress = Math.min((userCount / this.goals.users.target) * 100, 100);
    
    // Update status
    if (userCount >= this.goals.users.target) {
      this.goals.users.status = 'COMPLETED';
    } else {
      this.goals.users.status = 'IN_PROGRESS';
    }

    // Check milestones
    this.goals.users.milestones.forEach(milestone => {
      if (userCount >= milestone.value && !milestone.reached) {
        milestone.reached = true;
        milestone.reachedAt = new Date().toISOString();
        console.log(`🎉 Milestone reached: ${milestone.label}`);
      }
    });

    // Calculate growth rate if we have previous data
    if (previous > 0) {
      const growthRate = ((userCount - previous) / previous) * 100;
      this.goals.investorAppeal.metrics.userGrowthRate = growthRate;
    }

    this.updateTimeline();
    this.calculateInvestorAppeal();
    this.saveGoals();

    return this.goals.users;
  }

  /**
   * Update revenue
   * @param {number} revenue - Current total revenue
   */
  updateRevenue(revenue) {
    const previous = this.goals.revenue.current;
    this.goals.revenue.current = revenue;
    this.goals.revenue.progress = Math.min((revenue / this.goals.revenue.target) * 100, 100);
    
    // Update status
    if (revenue >= this.goals.revenue.target) {
      this.goals.revenue.status = 'COMPLETED';
    } else {
      this.goals.revenue.status = 'IN_PROGRESS';
    }

    // Check milestones
    this.goals.revenue.milestones.forEach(milestone => {
      if (revenue >= milestone.value && !milestone.reached) {
        milestone.reached = true;
        milestone.reachedAt = new Date().toISOString();
        console.log(`💰 Milestone reached: ${milestone.label} ($${milestone.value})`);
      }
    });

    // Calculate growth rate
    if (previous > 0) {
      const growthRate = ((revenue - previous) / previous) * 100;
      this.goals.investorAppeal.metrics.revenueGrowthRate = growthRate;
    }

    this.updateTimeline();
    this.calculateInvestorAppeal();
    this.saveGoals();

    return this.goals.revenue;
  }

  /**
   * Update engagement metrics
   * @param {Object} metrics - Engagement metrics
   */
  updateEngagementMetrics(metrics) {
    const {
      engagementRate = 0,
      retentionRate = 0,
      conversionRate = 0
    } = metrics;

    this.goals.investorAppeal.metrics.engagementRate = engagementRate;
    this.goals.investorAppeal.metrics.retentionRate = retentionRate;
    this.goals.investorAppeal.metrics.conversionRate = conversionRate;

    this.calculateInvestorAppeal();
    this.saveGoals();
  }

  /**
   * Calculate investor appeal score
   */
  calculateInvestorAppeal() {
    const metrics = this.goals.investorAppeal.metrics;
    
    // Weighted scoring
    const weights = {
      userProgress: 0.25,
      revenueProgress: 0.25,
      userGrowthRate: 0.15,
      revenueGrowthRate: 0.15,
      engagementRate: 0.1,
      retentionRate: 0.05,
      conversionRate: 0.05
    };

    const scores = {
      userProgress: this.goals.users.progress,
      revenueProgress: this.goals.revenue.progress,
      userGrowthRate: Math.min(metrics.userGrowthRate * 2, 100),
      revenueGrowthRate: Math.min(metrics.revenueGrowthRate * 2, 100),
      engagementRate: metrics.engagementRate,
      retentionRate: metrics.retentionRate,
      conversionRate: metrics.conversionRate * 10 // Scale up conversion rate
    };

    // Calculate weighted score
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      totalScore += (scores[key] || 0) * weight;
    }

    this.goals.investorAppeal.score = Math.round(totalScore);

    // Determine rating
    if (totalScore >= 80) {
      this.goals.investorAppeal.rating = 'HIGHLY_ATTRACTIVE';
    } else if (totalScore >= 60) {
      this.goals.investorAppeal.rating = 'ATTRACTIVE';
    } else if (totalScore >= 40) {
      this.goals.investorAppeal.rating = 'PROMISING';
    } else if (totalScore >= 20) {
      this.goals.investorAppeal.rating = 'EARLY_STAGE';
    } else {
      this.goals.investorAppeal.rating = 'NOT_READY';
    }

    return this.goals.investorAppeal;
  }

  /**
   * Update timeline
   */
  updateTimeline() {
    const started = new Date(this.goals.timeline.started);
    const now = new Date();
    const daysDiff = Math.floor((now - started) / (1000 * 60 * 60 * 24));
    
    this.goals.timeline.daysActive = daysDiff;
    this.goals.timeline.lastUpdated = now.toISOString();

    // Project completion date based on current growth rates
    const userMetrics = this.goals.investorAppeal.metrics;
    if (userMetrics.userGrowthRate > 0 && this.goals.users.current < this.goals.users.target) {
      const usersNeeded = this.goals.users.target - this.goals.users.current;
      const weeksNeeded = usersNeeded / (this.goals.users.current * (userMetrics.userGrowthRate / 100));
      const projectedDate = new Date(now.getTime() + weeksNeeded * 7 * 24 * 60 * 60 * 1000);
      this.goals.timeline.projectedCompletion = projectedDate.toISOString();
    }
  }

  /**
   * Get current status
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      users: this.goals.users,
      revenue: this.goals.revenue,
      investorAppeal: this.goals.investorAppeal,
      timeline: this.goals.timeline
    };
  }

  /**
   * Generate progress report
   * @returns {string} Formatted report
   */
  generateReport() {
    const userProgress = this.goals.users.progress.toFixed(1);
    const revenueProgress = this.goals.revenue.progress.toFixed(1);
    const appealScore = this.goals.investorAppeal.score;
    const appealRating = this.goals.investorAppeal.rating;

    const report = `
╔══════════════════════════════════════════════════════════════════════╗
║              GROWTH GOALS TRACKER - PROGRESS REPORT                  ║
║              Generated: ${new Date().toLocaleString()}               
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  USER GROWTH GOAL: 100 Active Users                                  ║
║  ├─ Current: ${this.goals.users.current.toString().padEnd(30)} users                          ║
║  ├─ Target: ${this.goals.users.target} users                                    ║
║  ├─ Progress: ${userProgress}%                                          ║
║  └─ Status: ${this.goals.users.status.padEnd(30)}                          ║
║                                                                      ║
║  REVENUE GOAL: $1,000                                                ║
║  ├─ Current: $${this.goals.revenue.current.toFixed(2).padEnd(29)}                          ║
║  ├─ Target: $${this.goals.revenue.target.toFixed(2)}                                  ║
║  ├─ Progress: ${revenueProgress}%                                          ║
║  └─ Status: ${this.goals.revenue.status.padEnd(30)}                          ║
║                                                                      ║
║  INVESTOR APPEAL METRICS                                             ║
║  ├─ Overall Score: ${appealScore}/100                                   ║
║  ├─ Rating: ${appealRating.padEnd(30)}                          ║
║  ├─ User Growth Rate: ${this.goals.investorAppeal.metrics.userGrowthRate.toFixed(1)}% per week          ║
║  ├─ Revenue Growth Rate: ${this.goals.investorAppeal.metrics.revenueGrowthRate.toFixed(1)}% per week          ║
║  ├─ Engagement Rate: ${this.goals.investorAppeal.metrics.engagementRate.toFixed(1)}%                    ║
║  ├─ Retention Rate: ${this.goals.investorAppeal.metrics.retentionRate.toFixed(1)}%                     ║
║  └─ Conversion Rate: ${this.goals.investorAppeal.metrics.conversionRate.toFixed(1)}%                    ║
║                                                                      ║
║  TIMELINE                                                            ║
║  ├─ Days Active: ${this.goals.timeline.daysActive.toString().padEnd(28)}                          ║
║  └─ Started: ${new Date(this.goals.timeline.started).toLocaleDateString()}                        ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`;
    return report;
  }

  /**
   * Get next milestones
   * @returns {Object} Next milestones for users and revenue
   */
  getNextMilestones() {
    const nextUserMilestone = this.goals.users.milestones.find(m => !m.reached);
    const nextRevenueMilestone = this.goals.revenue.milestones.find(m => !m.reached);

    return {
      users: nextUserMilestone || { value: this.goals.users.target, label: 'All milestones reached!' },
      revenue: nextRevenueMilestone || { value: this.goals.revenue.target, label: 'All milestones reached!' }
    };
  }

  /**
   * Get recommendations
   * @returns {Array} List of recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const appeal = this.goals.investorAppeal;

    if (this.goals.users.current < 10) {
      recommendations.push({
        priority: 'CRITICAL',
        area: 'User Acquisition',
        action: 'Launch initial user acquisition campaign',
        target: 'Reach first 10 users milestone'
      });
    } else if (this.goals.users.current < 50) {
      recommendations.push({
        priority: 'HIGH',
        area: 'User Growth',
        action: 'Implement referral program and content marketing',
        target: 'Accelerate path to 100 users'
      });
    }

    if (this.goals.revenue.current === 0) {
      recommendations.push({
        priority: 'CRITICAL',
        area: 'Revenue Generation',
        action: 'Implement initial monetization strategy (NFT sales, subscriptions)',
        target: 'Generate first $100 in revenue'
      });
    } else if (this.goals.revenue.current < 500) {
      recommendations.push({
        priority: 'HIGH',
        area: 'Revenue Optimization',
        action: 'Diversify revenue streams and optimize pricing',
        target: 'Reach $1K revenue milestone'
      });
    }

    if (appeal.metrics.engagementRate < 50) {
      recommendations.push({
        priority: 'MEDIUM',
        area: 'Engagement',
        action: 'Improve user engagement through gamification and rewards',
        target: 'Increase engagement to 70%+'
      });
    }

    if (appeal.metrics.retentionRate < 60) {
      recommendations.push({
        priority: 'MEDIUM',
        area: 'Retention',
        action: 'Implement retention strategies (email campaigns, push notifications)',
        target: 'Improve retention to 80%+'
      });
    }

    return recommendations;
  }
}

// Export the class
module.exports = GrowthGoalsTracker;

// CLI usage
if (require.main === module) {
  const tracker = new GrowthGoalsTracker();
  
  // Example: Update metrics
  tracker.updateUsers(35);
  tracker.updateRevenue(420);
  tracker.updateEngagementMetrics({
    engagementRate: 68,
    retentionRate: 72,
    conversionRate: 4.2
  });

  console.log(tracker.generateReport());
  
  console.log('\n🎯 NEXT MILESTONES:');
  const nextMilestones = tracker.getNextMilestones();
  console.log(`   Users: ${nextMilestones.users.label} (${nextMilestones.users.value} users)`);
  console.log(`   Revenue: ${nextMilestones.revenue.label} ($${nextMilestones.revenue.value})`);

  console.log('\n💡 RECOMMENDATIONS:');
  const recommendations = tracker.getRecommendations();
  recommendations.forEach(rec => {
    console.log(`\n[${rec.priority}] ${rec.area}`);
    console.log(`   Action: ${rec.action}`);
    console.log(`   Target: ${rec.target}`);
  });
}
