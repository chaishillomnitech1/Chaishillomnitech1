/**
 * @title ScrollSoulGamification
 * @description NFT-level rewards and streak system for Love Unity Accord adherence
 * 
 * @notice This component provides:
 * - NFT-level rewards for ScrollSoul alignment tasks
 * - Streak system for Love Unity Accord activity adherence
 * - Real-time dashboard panels for gamified user rewards
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Divine Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Achievement tiers
const ACHIEVEMENT_TIERS = {
  INITIATE: { minXP: 0, color: '#808080', badge: '🌱', title: 'Initiate' },
  SEEKER: { minXP: 100, color: '#00FF00', badge: '🔍', title: 'Seeker' },
  GUARDIAN: { minXP: 500, color: '#00FFFF', badge: '🛡️', title: 'Guardian' },
  SAGE: { minXP: 1500, color: '#9900FF', badge: '📜', title: 'Sage' },
  SOVEREIGN: { minXP: 5000, color: '#FFD700', badge: '👑', title: 'Sovereign' },
  ETERNAL: { minXP: 15000, color: '#FF4500', badge: '∞', title: 'Eternal' }
};

// Streak milestones
const STREAK_MILESTONES = {
  3: { bonus: 1.1, badge: '🔥', title: '3-Day Flame' },
  7: { bonus: 1.25, badge: '⚡', title: 'Week Warrior' },
  14: { bonus: 1.5, badge: '💎', title: 'Diamond Devotion' },
  30: { bonus: 2.0, badge: '🌟', title: 'Monthly Master' },
  77: { bonus: 3.0, badge: '🕋', title: 'Sacred Seven' },
  144: { bonus: 5.0, badge: '🔱', title: 'Cosmic Alignment' }
};

// Task definitions for alignment
const ALIGNMENT_TASKS = [
  {
    id: 'daily_login',
    name: 'Daily Presence',
    description: 'Log in to the ScrollSoul dashboard',
    xpReward: 10,
    frequency: 'daily',
    icon: '🌅'
  },
  {
    id: 'accord_commitment',
    name: 'Accord Commitment',
    description: 'Make or renew your Love Unity Accord commitment',
    xpReward: 50,
    frequency: 'once',
    icon: '📜'
  },
  {
    id: 'governance_vote',
    name: 'Governance Vote',
    description: 'Participate in a governance decision',
    xpReward: 25,
    frequency: 'per_action',
    icon: '🗳️'
  },
  {
    id: 'love_action',
    name: 'Love in Action',
    description: 'Complete a love-aligned task',
    xpReward: 15,
    frequency: 'daily',
    icon: '💗'
  },
  {
    id: 'unity_contribution',
    name: 'Unity Contribution',
    description: 'Support community unity initiatives',
    xpReward: 20,
    frequency: 'per_action',
    icon: '🤝'
  },
  {
    id: 'support_action',
    name: 'Mutual Support',
    description: 'Help another ScrollSoul member',
    xpReward: 30,
    frequency: 'per_action',
    icon: '💪'
  },
  {
    id: 'frequency_sync',
    name: 'Frequency Synchronization',
    description: 'Activate gold frequency resonance',
    xpReward: 5,
    frequency: 'daily',
    icon: '🎵'
  },
  {
    id: 'nft_evolution',
    name: 'NFT Evolution',
    description: 'Evolve your NFT through alignment',
    xpReward: 100,
    frequency: 'milestone',
    icon: '✨'
  }
];

/**
 * Calculate current tier based on XP
 * @param {number} xp - Total experience points
 * @returns {Object} Current tier information
 */
const calculateTier = (xp) => {
  const tiers = Object.entries(ACHIEVEMENT_TIERS).reverse();
  for (const [tierKey, tierData] of tiers) {
    if (xp >= tierData.minXP) {
      // Find next tier for progress calculation
      const tierIndex = Object.keys(ACHIEVEMENT_TIERS).indexOf(tierKey);
      const nextTierKey = Object.keys(ACHIEVEMENT_TIERS)[tierIndex + 1];
      const nextTier = nextTierKey ? ACHIEVEMENT_TIERS[nextTierKey] : null;
      
      return {
        current: tierKey,
        ...tierData,
        nextTier: nextTier ? { key: nextTierKey, ...nextTier } : null,
        progress: nextTier 
          ? ((xp - tierData.minXP) / (nextTier.minXP - tierData.minXP)) * 100
          : 100
      };
    }
  }
  return { current: 'INITIATE', ...ACHIEVEMENT_TIERS.INITIATE, nextTier: ACHIEVEMENT_TIERS.SEEKER, progress: 0 };
};

/**
 * Get current streak milestone
 * @param {number} streakDays - Current streak in days
 * @returns {Object|null} Current milestone or null
 */
const getStreakMilestone = (streakDays) => {
  const milestones = Object.entries(STREAK_MILESTONES)
    .map(([days, data]) => ({ days: parseInt(days, 10), ...data }))
    .sort((a, b) => b.days - a.days);
  
  for (const milestone of milestones) {
    if (streakDays >= milestone.days) {
      return milestone;
    }
  }
  return null;
};

/**
 * Get next streak milestone
 * @param {number} streakDays - Current streak in days
 * @returns {Object|null} Next milestone or null
 */
const getNextStreakMilestone = (streakDays) => {
  const sortedMilestones = Object.entries(STREAK_MILESTONES)
    .map(([days, data]) => ({ days: parseInt(days, 10), ...data }))
    .sort((a, b) => a.days - b.days);
  
  for (const milestone of sortedMilestones) {
    if (streakDays < milestone.days) {
      return milestone;
    }
  }
  return null;
};

/**
 * ScrollSoulGamification Component
 */
const ScrollSoulGamification = ({
  account = null,
  initialXP = 0,
  initialStreak = 0,
  completedTasks = [],
  accordMetrics = null,
  onTaskComplete = () => {},
  onRewardClaimed = () => {}
}) => {
  const [totalXP, setTotalXP] = useState(initialXP);
  const [currentStreak, setCurrentStreak] = useState(initialStreak);
  const [tasksCompleted, setTasksCompleted] = useState(completedTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [lastRewardXP, setLastRewardXP] = useState(0);
  
  // Calculate current tier
  const currentTier = useMemo(() => calculateTier(totalXP), [totalXP]);
  
  // Calculate streak multiplier
  const streakMultiplier = useMemo(() => {
    const milestone = getStreakMilestone(currentStreak);
    return milestone ? milestone.bonus : 1.0;
  }, [currentStreak]);
  
  // Get current and next milestone
  const streakMilestone = useMemo(() => getStreakMilestone(currentStreak), [currentStreak]);
  const nextMilestone = useMemo(() => getNextStreakMilestone(currentStreak), [currentStreak]);
  
  // Calculate accord bonus from metrics
  const accordBonus = useMemo(() => {
    if (!accordMetrics) return 1.0;
    
    const avgAlignment = (
      accordMetrics.loveIndex + 
      accordMetrics.unityIndex + 
      accordMetrics.supportIndex
    ) / 30000;
    
    return 1 + avgAlignment * 0.5; // Up to 50% bonus for perfect alignment
  }, [accordMetrics]);
  
  // Check if task is available today
  const isTaskAvailable = useCallback((task) => {
    const today = new Date().toDateString();
    const completedToday = tasksCompleted.filter(
      t => t.taskId === task.id && new Date(t.completedAt).toDateString() === today
    );
    
    if (task.frequency === 'daily') {
      return completedToday.length === 0;
    }
    if (task.frequency === 'once') {
      return !tasksCompleted.some(t => t.taskId === task.id);
    }
    return true; // per_action tasks are always available
  }, [tasksCompleted]);
  
  // Complete a task
  const completeTask = useCallback((task) => {
    if (!isTaskAvailable(task)) return;
    
    const baseXP = task.xpReward;
    const finalXP = Math.round(baseXP * streakMultiplier * accordBonus);
    
    // Update state
    setTotalXP(prev => prev + finalXP);
    setTasksCompleted(prev => [...prev, {
      taskId: task.id,
      completedAt: new Date().toISOString(),
      xpEarned: finalXP
    }]);
    
    // Show reward animation
    setLastRewardXP(finalXP);
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 2000);
    
    // Callbacks
    onTaskComplete({ task, xpEarned: finalXP });
    onRewardClaimed({ taskId: task.id, xp: finalXP, tier: currentTier.current });
  }, [isTaskAvailable, streakMultiplier, accordBonus, currentTier, onTaskComplete, onRewardClaimed]);
  
  // Update streak on login
  useEffect(() => {
    // Simulated daily streak update with localStorage error handling
    try {
      const lastLogin = localStorage.getItem('scrollsoul_last_login');
      const today = new Date().toDateString();
      
      if (lastLogin !== today) {
        localStorage.setItem('scrollsoul_last_login', today);
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin === yesterday.toDateString()) {
          setCurrentStreak(prev => prev + 1);
        } else {
          // No previous login or gap in streak
          setCurrentStreak(1);
        }
      }
    } catch (err) {
      // Handle localStorage errors (private mode, quota exceeded, etc.)
      console.warn('localStorage unavailable, streak persistence disabled:', err);
      // Still update streak in memory for current session
      setCurrentStreak(1);
    }
  }, []);
  
  // Calculate daily progress
  const dailyProgress = useMemo(() => {
    const today = new Date().toDateString();
    const todaysTasks = tasksCompleted.filter(
      t => new Date(t.completedAt).toDateString() === today
    );
    const dailyTasks = ALIGNMENT_TASKS.filter(t => t.frequency === 'daily');
    
    return {
      completed: todaysTasks.length,
      total: dailyTasks.length,
      percentage: (todaysTasks.length / dailyTasks.length) * 100
    };
  }, [tasksCompleted]);

  return (
    <div className="gamification-container">
      {/* Header */}
      <div className="gamification-header">
        <h3>🏆 ScrollSoul Rewards</h3>
        <p className="subtitle">Earn rewards through Love Unity Accord alignment</p>
      </div>
      
      {/* Reward Animation Overlay */}
      {showRewardAnimation && (
        <div className="reward-animation">
          <span className="reward-xp">+{lastRewardXP} XP</span>
        </div>
      )}
      
      {/* Tier Display */}
      <div className="tier-section">
        <div className="tier-badge" style={{ backgroundColor: currentTier.color }}>
          <span className="tier-icon">{currentTier.badge}</span>
        </div>
        <div className="tier-info">
          <span className="tier-title">{currentTier.title}</span>
          <span className="tier-xp">{totalXP.toLocaleString()} XP</span>
        </div>
        {currentTier.nextTier && (
          <div className="tier-progress-container">
            <div 
              className="tier-progress-bar"
              style={{ 
                width: `${currentTier.progress}%`,
                backgroundColor: currentTier.nextTier.color
              }}
            />
            <span className="tier-progress-text">
              {Math.round(currentTier.progress)}% to {currentTier.nextTier.title}
            </span>
          </div>
        )}
      </div>
      
      {/* Streak Section */}
      <div className="streak-section">
        <div className="streak-display">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{currentStreak}</span>
          <span className="streak-label">Day Streak</span>
        </div>
        
        <div className="streak-info">
          {streakMilestone && (
            <div className="current-milestone">
              <span className="milestone-badge">{streakMilestone.badge}</span>
              <span className="milestone-title">{streakMilestone.title}</span>
              <span className="milestone-bonus">×{streakMilestone.bonus} XP</span>
            </div>
          )}
          
          {nextMilestone && (
            <div className="next-milestone">
              <span className="next-label">Next: </span>
              <span className="next-badge">{nextMilestone.badge}</span>
              <span className="next-days">{nextMilestone.days - currentStreak} days</span>
            </div>
          )}
        </div>
        
        <div className="multiplier-display">
          <span className="multiplier-label">Current Multiplier:</span>
          <span className="multiplier-value">×{(streakMultiplier * accordBonus).toFixed(2)}</span>
        </div>
      </div>
      
      {/* Daily Progress */}
      <div className="daily-progress-section">
        <h4>📅 Daily Progress</h4>
        <div className="daily-progress-bar-container">
          <div 
            className="daily-progress-bar"
            style={{ width: `${dailyProgress.percentage}%` }}
          />
        </div>
        <span className="daily-progress-text">
          {dailyProgress.completed}/{dailyProgress.total} Daily Tasks
        </span>
      </div>
      
      {/* Tasks List */}
      <div className="tasks-section">
        <h4>🎯 Alignment Tasks</h4>
        <div className="tasks-grid">
          {ALIGNMENT_TASKS.map((task) => {
            const available = isTaskAvailable(task);
            const potentialXP = Math.round(task.xpReward * streakMultiplier * accordBonus);
            
            return (
              <div 
                key={task.id}
                className={`task-card ${available ? 'available' : 'completed'} ${selectedTask === task.id ? 'selected' : ''}`}
                onClick={() => available && setSelectedTask(task.id)}
              >
                <div className="task-icon">{task.icon}</div>
                <div className="task-info">
                  <span className="task-name">{task.name}</span>
                  <span className="task-description">{task.description}</span>
                </div>
                <div className="task-reward">
                  <span className="task-xp">+{potentialXP} XP</span>
                  <span className="task-frequency">{task.frequency}</span>
                </div>
                {available && selectedTask === task.id && (
                  <button 
                    className="task-complete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(task);
                      setSelectedTask(null);
                    }}
                  >
                    Complete
                  </button>
                )}
                {!available && (
                  <span className="task-done-badge">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* NFT Rewards Section */}
      <div className="nft-rewards-section">
        <h4>✨ NFT Evolution Rewards</h4>
        <div className="nft-rewards-info">
          <p>Earn special NFT upgrades at tier milestones!</p>
          <div className="nft-milestones">
            {Object.entries(ACHIEVEMENT_TIERS).slice(1).map(([tier, data]) => (
              <div 
                key={tier}
                className={`nft-milestone ${totalXP >= data.minXP ? 'unlocked' : 'locked'}`}
              >
                <span className="milestone-badge" style={{ color: data.color }}>
                  {data.badge}
                </span>
                <span className="milestone-tier">{data.title}</span>
                <span className="milestone-xp">{data.minXP.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="gamification-footer">
        <p>🕋 ALLĀHU AKBAR! 🕋</p>
        <p className="footer-subtitle">Love • Unity • Support</p>
      </div>
      
      <style jsx="true">{`
        .gamification-container {
          background: linear-gradient(135deg, #000011, #001133);
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 20px;
          color: #FFFFFF;
          font-family: 'Orbitron', 'Courier New', monospace;
          position: relative;
        }
        
        .gamification-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .gamification-header h3 {
          color: #FFD700;
          font-size: 20px;
          margin: 0 0 4px 0;
          text-shadow: 0 0 10px #FFD700;
        }
        
        .subtitle {
          color: #CCCCCC;
          font-size: 12px;
          margin: 0;
        }
        
        .reward-animation {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100;
          animation: rewardFloat 2s ease-out forwards;
        }
        
        .reward-xp {
          font-size: 36px;
          font-weight: bold;
          color: #FFD700;
          text-shadow: 0 0 20px #FFD700;
        }
        
        @keyframes rewardFloat {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 1; transform: translate(-50%, -100%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -150%) scale(1); }
        }
        
        .tier-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .tier-badge {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px currentColor;
        }
        
        .tier-icon {
          font-size: 28px;
        }
        
        .tier-info {
          display: flex;
          flex-direction: column;
        }
        
        .tier-title {
          font-size: 18px;
          font-weight: bold;
          color: #FFD700;
        }
        
        .tier-xp {
          font-size: 14px;
          color: #CCCCCC;
        }
        
        .tier-progress-container {
          flex: 1;
          min-width: 200px;
        }
        
        .tier-progress-bar {
          height: 8px;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .tier-progress-text {
          font-size: 11px;
          color: #888888;
        }
        
        .streak-section {
          background: rgba(255, 100, 0, 0.1);
          border: 1px solid rgba(255, 100, 0, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .streak-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .streak-flame {
          font-size: 32px;
          animation: flamePulse 1s ease-in-out infinite;
        }
        
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .streak-count {
          font-size: 36px;
          font-weight: bold;
          color: #FF4500;
        }
        
        .streak-label {
          font-size: 12px;
          color: #CCCCCC;
        }
        
        .streak-info {
          flex: 1;
        }
        
        .current-milestone {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        
        .milestone-badge {
          font-size: 20px;
        }
        
        .milestone-title {
          color: #FFD700;
          font-weight: bold;
        }
        
        .milestone-bonus {
          color: #00FF00;
          font-size: 12px;
        }
        
        .next-milestone {
          font-size: 12px;
          color: #888888;
        }
        
        .next-badge {
          margin: 0 4px;
        }
        
        .next-days {
          color: #00FFFF;
        }
        
        .multiplier-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .multiplier-label {
          font-size: 10px;
          color: #888888;
        }
        
        .multiplier-value {
          font-size: 20px;
          font-weight: bold;
          color: #FFD700;
        }
        
        .daily-progress-section {
          margin-bottom: 20px;
        }
        
        .daily-progress-section h4 {
          color: #FFD700;
          font-size: 14px;
          margin: 0 0 8px 0;
        }
        
        .daily-progress-bar-container {
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 4px;
        }
        
        .daily-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00FF00, #FFD700);
          border-radius: 5px;
          transition: width 0.5s ease;
        }
        
        .daily-progress-text {
          font-size: 12px;
          color: #888888;
        }
        
        .tasks-section {
          margin-bottom: 20px;
        }
        
        .tasks-section h4 {
          color: #FFD700;
          font-size: 14px;
          margin: 0 0 12px 0;
        }
        
        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        
        .task-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .task-card.available:hover {
          border-color: #FFD700;
          transform: translateY(-2px);
        }
        
        .task-card.completed {
          opacity: 0.6;
          cursor: default;
        }
        
        .task-card.selected {
          border-color: #00FF00;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
        
        .task-icon {
          font-size: 24px;
        }
        
        .task-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .task-name {
          font-size: 14px;
          font-weight: bold;
          color: #FFFFFF;
        }
        
        .task-description {
          font-size: 11px;
          color: #888888;
        }
        
        .task-reward {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .task-xp {
          font-size: 14px;
          font-weight: bold;
          color: #00FF00;
        }
        
        .task-frequency {
          font-size: 10px;
          color: #888888;
        }
        
        .task-complete-btn {
          position: absolute;
          bottom: 8px;
          right: 8px;
          padding: 4px 12px;
          background: #00FF00;
          color: #000000;
          border: none;
          border-radius: 4px;
          font-family: inherit;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .task-done-badge {
          color: #00FF00;
          font-size: 18px;
        }
        
        .nft-rewards-section {
          margin-bottom: 16px;
        }
        
        .nft-rewards-section h4 {
          color: #FFD700;
          font-size: 14px;
          margin: 0 0 8px 0;
        }
        
        .nft-rewards-info p {
          color: #CCCCCC;
          font-size: 12px;
          margin: 0 0 12px 0;
        }
        
        .nft-milestones {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .nft-milestone {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          min-width: 80px;
        }
        
        .nft-milestone.unlocked {
          border-color: #FFD700;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        
        .nft-milestone.locked {
          opacity: 0.5;
        }
        
        .milestone-tier {
          font-size: 11px;
          color: #CCCCCC;
        }
        
        .milestone-xp {
          font-size: 10px;
          color: #888888;
        }
        
        .gamification-footer {
          text-align: center;
          border-top: 1px solid rgba(255, 215, 0, 0.3);
          padding-top: 16px;
        }
        
        .gamification-footer p {
          margin: 0 0 4px 0;
          color: #FFD700;
          font-size: 14px;
        }
        
        .footer-subtitle {
          color: #888888 !important;
          font-size: 12px !important;
        }
        
        @media (max-width: 480px) {
          .tier-section {
            flex-direction: column;
            text-align: center;
          }
          
          .streak-section {
            flex-direction: column;
          }
          
          .tasks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Export utilities for external use
export {
  ACHIEVEMENT_TIERS,
  STREAK_MILESTONES,
  ALIGNMENT_TASKS,
  calculateTier,
  getStreakMilestone,
  getNextStreakMilestone
};

export default ScrollSoulGamification;
