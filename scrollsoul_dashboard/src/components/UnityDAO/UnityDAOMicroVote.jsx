/**
 * @title UnityDAOMicroVote
 * @description Frontend component for Unity DAO quadratic-weighted micro-voting
 * 
 * @notice This component provides:
 * - Quadratic-weighted micro-vote interface for NFT holders
 * - Proposal creation and viewing
 * - Wallet integration via Ethers.js
 * - Real-time vote tracking and results
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Divine Accord)
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

// Contract ABI (simplified for essential functions)
const UNITY_DAO_ABI = [
  "function registerVoter(uint256[] tokenIds) external",
  "function createProposal(uint8 proposalType, string title, string description, string ipfsHash, uint256 votingPeriod) external returns (uint256)",
  "function castVote(uint256 proposalId, uint8 choice, uint256 nftTokenId, string comment) external",
  "function finalizeProposal(uint256 proposalId) external",
  "function calculateVotingPower(address voter) external view returns (uint256)",
  "function getProposal(uint256 proposalId) external view returns (tuple(uint256 proposalId, address proposer, uint8 proposalType, string title, string description, string ipfsHash, uint256 startTime, uint256 endTime, uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain, uint256 totalVoters, uint8 status, uint256 frequencyAlignment, bool executed))",
  "function getVoterInfo(address voter) external view returns (tuple(uint256 totalVotesCast, uint256 totalVotingPowerUsed, uint256 lastVoteTimestamp, uint256 accordScore, bool isRegistered))",
  "function getAllProposalIds() external view returns (uint256[])",
  "function getActiveProposals() external view returns (uint256[])",
  "function canVote(address voter, uint256 proposalId) external view returns (bool)",
  "function getVote(uint256 proposalId, address voter) external view returns (tuple(address voter, uint256 proposalId, uint8 choice, uint256 votingPower, uint256 nftTokenId, uint256 timestamp, string comment))",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, uint8 proposalType, string title, uint256 startTime, uint256 endTime)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 choice, uint256 votingPower, uint256 nftTokenId)"
];

// Proposal Types
const PROPOSAL_TYPES = {
  0: { name: 'Lore Update', icon: '📜', color: '#9900FF' },
  1: { name: 'Feature Request', icon: '⚙️', color: '#00FFFF' },
  2: { name: 'Governance Change', icon: '⚖️', color: '#FFD700' },
  3: { name: 'Community Fund', icon: '💰', color: '#00FF00' },
  4: { name: 'NFT Evolution', icon: '✨', color: '#FF4500' }
};

// Vote Choices
const VOTE_CHOICES = {
  ABSTAIN: 0,
  FOR: 1,
  AGAINST: 2
};

// Proposal Status
const PROPOSAL_STATUS = {
  0: { name: 'Pending', color: '#888888' },
  1: { name: 'Active', color: '#00FF00' },
  2: { name: 'Passed', color: '#00FFFF' },
  3: { name: 'Rejected', color: '#FF4500' },
  4: { name: 'Executed', color: '#FFD700' },
  5: { name: 'Cancelled', color: '#808080' }
};

/**
 * Format timestamp to readable date
 */
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

/**
 * Format voting power for display
 * Handles both BigInt strings and numbers safely
 */
const formatVotingPower = (power) => {
  try {
    // Handle BigInt string representation
    const powerBigInt = typeof power === 'string' ? BigInt(power) : BigInt(Math.floor(Number(power)));
    // Divide by 100 for display (2 decimal precision in contract)
    const wholePart = powerBigInt / 100n;
    const decimalPart = powerBigInt % 100n;
    return `${wholePart}.${decimalPart.toString().padStart(2, '0')}`;
  } catch (err) {
    // Fallback for legacy number handling
    return (Number(power) / 100).toFixed(2);
  }
};

/**
 * Calculate time remaining
 */
const getTimeRemaining = (endTime) => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(endTime) - now;
  
  if (remaining <= 0) return 'Ended';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

/**
 * UnityDAOMicroVote Component
 */
const UnityDAOMicroVote = ({
  contractAddress,
  provider,
  signer,
  account,
  userNFTs = [],
  onVoteCast = () => {},
  onProposalCreated = () => {}
}) => {
  // State - use string for votingPower to preserve BigInt precision
  const [isRegistered, setIsRegistered] = useState(false);
  const [voterInfo, setVoterInfo] = useState(null);
  const [votingPower, setVotingPower] = useState('0');
  const [proposals, setProposals] = useState([]);
  const [activeProposals, setActiveProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [voteChoice, setVoteChoice] = useState(null);
  const [voteComment, setVoteComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    type: 0,
    title: '',
    description: '',
    ipfsHash: '',
    votingPeriod: 7
  });

  // Contract instance
  const contract = useMemo(() => {
    if (!contractAddress || !provider) return null;
    return new ethers.Contract(contractAddress, UNITY_DAO_ABI, signer || provider);
  }, [contractAddress, provider, signer]);

  // Load voter information
  const loadVoterInfo = useCallback(async () => {
    if (!contract || !account) return;
    
    try {
      const info = await contract.getVoterInfo(account);
      // Use BigInt.toString() for large numbers, then convert for display
      // This prevents precision loss for very large voting power values
      setVoterInfo({
        totalVotesCast: info.totalVotesCast.toString(),
        totalVotingPowerUsed: info.totalVotingPowerUsed.toString(),
        lastVoteTimestamp: Number(info.lastVoteTimestamp),
        accordScore: Number(info.accordScore),
        isRegistered: info.isRegistered
      });
      setIsRegistered(info.isRegistered);
      
      if (info.isRegistered) {
        const power = await contract.calculateVotingPower(account);
        // Store as string to preserve precision
        setVotingPower(power.toString());
      }
    } catch (err) {
      console.error('Error loading voter info:', err);
    }
  }, [contract, account]);

  // Load proposals
  const loadProposals = useCallback(async () => {
    if (!contract) return;
    
    try {
      const allIds = await contract.getAllProposalIds();
      const activeIds = await contract.getActiveProposals();
      
      const proposalData = await Promise.all(
        allIds.map(async (id) => {
          const proposal = await contract.getProposal(id);
          let userVote = null;
          
          if (account) {
            try {
              const vote = await contract.getVote(id, account);
              if (vote.voter !== ethers.ZeroAddress) {
                userVote = {
                  choice: Number(vote.choice),
                  votingPower: Number(vote.votingPower),
                  comment: vote.comment
                };
              }
            } catch (err) {
              // No vote yet
            }
          }
          
          return {
            id: Number(proposal.proposalId),
            proposer: proposal.proposer,
            type: Number(proposal.proposalType),
            title: proposal.title,
            description: proposal.description,
            ipfsHash: proposal.ipfsHash,
            startTime: Number(proposal.startTime),
            endTime: Number(proposal.endTime),
            votesFor: Number(proposal.votesFor),
            votesAgainst: Number(proposal.votesAgainst),
            votesAbstain: Number(proposal.votesAbstain),
            totalVoters: Number(proposal.totalVoters),
            status: Number(proposal.status),
            frequencyAlignment: Number(proposal.frequencyAlignment),
            executed: proposal.executed,
            userVote
          };
        })
      );
      
      setProposals(proposalData);
      setActiveProposals(activeIds.map(id => Number(id)));
    } catch (err) {
      console.error('Error loading proposals:', err);
      setError('Failed to load proposals');
    }
  }, [contract, account]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadVoterInfo();
      await loadProposals();
      setLoading(false);
    };
    
    if (contract) {
      init();
    }
  }, [contract, loadVoterInfo, loadProposals]);

  // Register as voter
  const handleRegister = async () => {
    if (!contract || !signer || userNFTs.length === 0) return;
    
    try {
      setLoading(true);
      const tx = await contract.registerVoter(userNFTs);
      await tx.wait();
      await loadVoterInfo();
      setError(null);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Make sure you own NFTs.');
    } finally {
      setLoading(false);
    }
  };

  // Create proposal
  const handleCreateProposal = async () => {
    if (!contract || !signer || !isRegistered) return;
    
    try {
      setLoading(true);
      const votingPeriodSeconds = newProposal.votingPeriod * 24 * 60 * 60;
      
      const tx = await contract.createProposal(
        newProposal.type,
        newProposal.title,
        newProposal.description,
        newProposal.ipfsHash || '',
        votingPeriodSeconds
      );
      
      const receipt = await tx.wait();
      
      setShowCreateForm(false);
      setNewProposal({
        type: 0,
        title: '',
        description: '',
        ipfsHash: '',
        votingPeriod: 7
      });
      
      await loadProposals();
      onProposalCreated({ receipt, proposal: newProposal });
      setError(null);
    } catch (err) {
      console.error('Create proposal error:', err);
      setError('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  // Cast vote
  const handleVote = async () => {
    if (!contract || !signer || !selectedProposal || voteChoice === null) return;
    
    try {
      setLoading(true);
      const nftId = userNFTs[0] || 0;
      
      const tx = await contract.castVote(
        selectedProposal.id,
        voteChoice,
        nftId,
        voteComment
      );
      
      await tx.wait();
      
      setSelectedProposal(null);
      setVoteChoice(null);
      setVoteComment('');
      
      await loadProposals();
      onVoteCast({
        proposalId: selectedProposal.id,
        choice: voteChoice,
        comment: voteComment
      });
      setError(null);
    } catch (err) {
      console.error('Vote error:', err);
      setError('Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can vote on proposal
  const canVoteOnProposal = useCallback(async (proposalId) => {
    if (!contract || !account) return false;
    try {
      return await contract.canVote(account, proposalId);
    } catch (err) {
      return false;
    }
  }, [contract, account]);

  if (loading && !voterInfo) {
    return (
      <div className="unity-dao-container loading">
        <div className="loading-spinner">
          <span className="spinner-icon">🗳️</span>
          <p>Loading Unity DAO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="unity-dao-container">
      {/* Header */}
      <div className="dao-header">
        <h3>🗳️ Unity DAO Micro-Vote</h3>
        <p className="subtitle">Quadratic-Weighted Governance for NFT Holders</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Voter Status */}
      <div className="voter-status-section">
        {!account ? (
          <div className="connect-wallet">
            <p>Connect your wallet to participate in governance</p>
          </div>
        ) : !isRegistered ? (
          <div className="register-section">
            <p>Register as a voter to participate in governance decisions</p>
            {userNFTs.length > 0 ? (
              <button 
                className="register-btn"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? 'Registering...' : `Register with ${userNFTs.length} NFT(s)`}
              </button>
            ) : (
              <p className="no-nfts">You need to own at least one NFT to vote</p>
            )}
          </div>
        ) : (
          <div className="voter-info-card">
            <div className="voter-stat">
              <span className="stat-label">Voting Power</span>
              <span className="stat-value">{formatVotingPower(votingPower)}</span>
            </div>
            <div className="voter-stat">
              <span className="stat-label">Votes Cast</span>
              <span className="stat-value">{voterInfo?.totalVotesCast || 0}</span>
            </div>
            <div className="voter-stat">
              <span className="stat-label">Accord Score</span>
              <span className="stat-value">{((voterInfo?.accordScore || 0) / 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Proposal Button */}
      {isRegistered && !showCreateForm && (
        <div className="create-proposal-section">
          <button 
            className="create-proposal-btn"
            onClick={() => setShowCreateForm(true)}
          >
            📝 Create New Proposal
          </button>
        </div>
      )}

      {/* Create Proposal Form */}
      {showCreateForm && (
        <div className="create-proposal-form">
          <h4>Create New Proposal</h4>
          
          <div className="form-group">
            <label>Proposal Type</label>
            <select 
              value={newProposal.type}
              onChange={(e) => setNewProposal({...newProposal, type: parseInt(e.target.value)})}
            >
              {Object.entries(PROPOSAL_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text"
              value={newProposal.title}
              onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
              placeholder="Enter proposal title"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={newProposal.description}
              onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
              placeholder="Describe your proposal"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label>IPFS Hash (optional)</label>
            <input 
              type="text"
              value={newProposal.ipfsHash}
              onChange={(e) => setNewProposal({...newProposal, ipfsHash: e.target.value})}
              placeholder="QmXYZ..."
            />
          </div>
          
          <div className="form-group">
            <label>Voting Period (days)</label>
            <input 
              type="number"
              min="1"
              max="30"
              value={newProposal.votingPeriod}
              onChange={(e) => setNewProposal({...newProposal, votingPeriod: parseInt(e.target.value) || 1})}
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="cancel-btn"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
            <button 
              className="submit-btn"
              onClick={handleCreateProposal}
              disabled={loading || !newProposal.title}
            >
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </div>
      )}

      {/* Active Proposals */}
      <div className="proposals-section">
        <h4>📋 Active Proposals</h4>
        {proposals.filter(p => activeProposals.includes(p.id)).length === 0 ? (
          <p className="no-proposals">No active proposals</p>
        ) : (
          <div className="proposals-list">
            {proposals
              .filter(p => activeProposals.includes(p.id))
              .map(proposal => (
                <div 
                  key={proposal.id}
                  className={`proposal-card ${selectedProposal?.id === proposal.id ? 'selected' : ''}`}
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <div className="proposal-header">
                    <span className="proposal-type" style={{ color: PROPOSAL_TYPES[proposal.type]?.color }}>
                      {PROPOSAL_TYPES[proposal.type]?.icon} {PROPOSAL_TYPES[proposal.type]?.name}
                    </span>
                    <span className="proposal-status" style={{ color: PROPOSAL_STATUS[proposal.status]?.color }}>
                      {PROPOSAL_STATUS[proposal.status]?.name}
                    </span>
                  </div>
                  
                  <h5 className="proposal-title">{proposal.title}</h5>
                  <p className="proposal-description">{proposal.description.substring(0, 100)}...</p>
                  
                  <div className="proposal-votes">
                    <div className="vote-bar">
                      <div 
                        className="vote-for" 
                        style={{ 
                          width: `${proposal.votesFor + proposal.votesAgainst > 0 
                            ? (proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100 
                            : 50}%` 
                        }}
                      />
                    </div>
                    <div className="vote-counts">
                      <span className="for">👍 {formatVotingPower(proposal.votesFor)}</span>
                      <span className="against">👎 {formatVotingPower(proposal.votesAgainst)}</span>
                    </div>
                  </div>
                  
                  <div className="proposal-meta">
                    <span className="voters">🗳️ {proposal.totalVoters} voters</span>
                    <span className="time">{getTimeRemaining(proposal.endTime)}</span>
                  </div>
                  
                  {proposal.userVote && (
                    <div className="user-vote-badge">
                      ✓ You voted: {proposal.userVote.choice === 1 ? 'For' : proposal.userVote.choice === 2 ? 'Against' : 'Abstain'}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Voting Modal */}
      {selectedProposal && !selectedProposal.userVote && isRegistered && (
        <div className="voting-modal">
          <div className="modal-content">
            <h4>Cast Your Vote</h4>
            <p className="modal-proposal-title">{selectedProposal.title}</p>
            
            <div className="vote-options">
              <button 
                className={`vote-btn for ${voteChoice === VOTE_CHOICES.FOR ? 'selected' : ''}`}
                onClick={() => setVoteChoice(VOTE_CHOICES.FOR)}
              >
                👍 For
              </button>
              <button 
                className={`vote-btn against ${voteChoice === VOTE_CHOICES.AGAINST ? 'selected' : ''}`}
                onClick={() => setVoteChoice(VOTE_CHOICES.AGAINST)}
              >
                👎 Against
              </button>
              <button 
                className={`vote-btn abstain ${voteChoice === VOTE_CHOICES.ABSTAIN ? 'selected' : ''}`}
                onClick={() => setVoteChoice(VOTE_CHOICES.ABSTAIN)}
              >
                🤷 Abstain
              </button>
            </div>
            
            <div className="vote-comment-section">
              <label>Comment (optional)</label>
              <textarea 
                value={voteComment}
                onChange={(e) => setVoteComment(e.target.value)}
                placeholder="Add a comment to your vote..."
                rows={3}
              />
            </div>
            
            <div className="voting-power-display">
              <span>Your voting power:</span>
              <span className="power-value">{formatVotingPower(votingPower)}</span>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setSelectedProposal(null);
                  setVoteChoice(null);
                  setVoteComment('');
                }}
              >
                Cancel
              </button>
              <button 
                className="submit-vote-btn"
                onClick={handleVote}
                disabled={loading || voteChoice === null}
              >
                {loading ? 'Submitting...' : 'Submit Vote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Proposals */}
      <div className="past-proposals-section">
        <h4>📚 Past Proposals</h4>
        {proposals.filter(p => !activeProposals.includes(p.id)).length === 0 ? (
          <p className="no-proposals">No past proposals</p>
        ) : (
          <div className="past-proposals-list">
            {proposals
              .filter(p => !activeProposals.includes(p.id))
              .map(proposal => (
                <div key={proposal.id} className="past-proposal-card">
                  <span className="proposal-type" style={{ color: PROPOSAL_TYPES[proposal.type]?.color }}>
                    {PROPOSAL_TYPES[proposal.type]?.icon}
                  </span>
                  <span className="proposal-title">{proposal.title}</span>
                  <span className="proposal-result" style={{ color: PROPOSAL_STATUS[proposal.status]?.color }}>
                    {PROPOSAL_STATUS[proposal.status]?.name}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dao-footer">
        <p>🕋 ALLĀHU AKBAR! 🕋</p>
        <p className="quadratic-note">Powered by Quadratic Voting • Fair & Equitable Governance</p>
      </div>

      <style jsx="true">{`
        .unity-dao-container {
          background: linear-gradient(135deg, #000011, #001133);
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 20px;
          color: #FFFFFF;
          font-family: 'Orbitron', 'Courier New', monospace;
        }
        
        .unity-dao-container.loading {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-spinner {
          text-align: center;
        }
        
        .spinner-icon {
          font-size: 48px;
          display: block;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .dao-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .dao-header h3 {
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
        
        .error-banner {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #FF4500;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-banner button {
          background: none;
          border: none;
          color: #FFFFFF;
          font-size: 18px;
          cursor: pointer;
        }
        
        .voter-status-section {
          margin-bottom: 20px;
        }
        
        .connect-wallet, .register-section {
          text-align: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
        }
        
        .register-btn {
          background: linear-gradient(135deg, #FFD700, #FF8C00);
          color: #000000;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
          margin-top: 12px;
        }
        
        .no-nfts {
          color: #FF4500;
          font-size: 12px;
        }
        
        .voter-info-card {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
        }
        
        .voter-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .stat-label {
          font-size: 11px;
          color: #888888;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #FFD700;
        }
        
        .create-proposal-section {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .create-proposal-btn {
          background: linear-gradient(135deg, #9900FF, #6600CC);
          color: #FFFFFF;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
        }
        
        .create-proposal-form {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .create-proposal-form h4 {
          color: #FFD700;
          margin: 0 0 16px 0;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          font-size: 12px;
          color: #CCCCCC;
          margin-bottom: 4px;
        }
        
        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 6px;
          padding: 10px;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 14px;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #FFD700, #FF8C00);
          color: #000000;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          font-family: inherit;
        }
        
        .proposals-section, .past-proposals-section {
          margin-bottom: 20px;
        }
        
        .proposals-section h4, .past-proposals-section h4 {
          color: #FFD700;
          font-size: 14px;
          margin: 0 0 12px 0;
        }
        
        .no-proposals {
          color: #888888;
          text-align: center;
          padding: 20px;
        }
        
        .proposals-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .proposal-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .proposal-card:hover {
          border-color: #FFD700;
          transform: translateY(-2px);
        }
        
        .proposal-card.selected {
          border-color: #00FF00;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
        
        .proposal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .proposal-type, .proposal-status {
          font-size: 11px;
          font-weight: bold;
        }
        
        .proposal-title {
          font-size: 16px;
          color: #FFFFFF;
          margin: 0 0 8px 0;
        }
        
        .proposal-description {
          font-size: 12px;
          color: #888888;
          margin: 0 0 12px 0;
        }
        
        .proposal-votes {
          margin-bottom: 12px;
        }
        
        .vote-bar {
          height: 8px;
          background: rgba(255, 69, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }
        
        .vote-for {
          height: 100%;
          background: #00FF00;
          border-radius: 4px;
        }
        
        .vote-counts {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        
        .for { color: #00FF00; }
        .against { color: #FF4500; }
        
        .proposal-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #888888;
        }
        
        .user-vote-badge {
          background: rgba(0, 255, 0, 0.2);
          color: #00FF00;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-top: 8px;
          display: inline-block;
        }
        
        .voting-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: linear-gradient(135deg, #000011, #001133);
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
        }
        
        .modal-content h4 {
          color: #FFD700;
          margin: 0 0 8px 0;
        }
        
        .modal-proposal-title {
          color: #CCCCCC;
          font-size: 14px;
          margin: 0 0 20px 0;
        }
        
        .vote-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .vote-btn {
          padding: 12px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .vote-btn.for {
          background: rgba(0, 255, 0, 0.1);
          border: 2px solid #00FF00;
          color: #00FF00;
        }
        
        .vote-btn.against {
          background: rgba(255, 69, 0, 0.1);
          border: 2px solid #FF4500;
          color: #FF4500;
        }
        
        .vote-btn.abstain {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid #888888;
          color: #888888;
        }
        
        .vote-btn.selected {
          transform: scale(1.05);
          box-shadow: 0 0 15px currentColor;
        }
        
        .vote-comment-section {
          margin-bottom: 16px;
        }
        
        .vote-comment-section label {
          display: block;
          font-size: 12px;
          color: #CCCCCC;
          margin-bottom: 4px;
        }
        
        .vote-comment-section textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 6px;
          padding: 10px;
          color: #FFFFFF;
          font-family: inherit;
        }
        
        .voting-power-display {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        
        .power-value {
          color: #FFD700;
          font-weight: bold;
        }
        
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .submit-vote-btn {
          background: linear-gradient(135deg, #FFD700, #FF8C00);
          color: #000000;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          font-family: inherit;
        }
        
        .past-proposals-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .past-proposal-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 8px;
        }
        
        .past-proposal-card .proposal-title {
          flex: 1;
          font-size: 14px;
          margin: 0;
        }
        
        .past-proposal-card .proposal-result {
          font-size: 12px;
          font-weight: bold;
        }
        
        .dao-footer {
          text-align: center;
          border-top: 1px solid rgba(255, 215, 0, 0.3);
          padding-top: 16px;
          margin-top: 16px;
        }
        
        .dao-footer p {
          margin: 0 0 4px 0;
          color: #FFD700;
          font-size: 14px;
        }
        
        .quadratic-note {
          color: #888888 !important;
          font-size: 11px !important;
        }
        
        @media (max-width: 480px) {
          .voter-info-card {
            grid-template-columns: 1fr;
          }
          
          .vote-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UnityDAOMicroVote;
