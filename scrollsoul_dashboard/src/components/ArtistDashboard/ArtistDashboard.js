import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './ArtistDashboard.css';

/**
 * @title ArtistDashboard Component
 * @dev Interactive dashboard for artist portfolio tracking and analytics
 * 
 * Features:
 * - Real-time portfolio metrics
 * - Artwork showcase and management
 * - Revenue and royalty tracking
 * - Staking pool integration
 * - Dynamic analytics visualization
 * 
 * Frequency: 528Hz + 963Hz + 999Hz
 */

const ArtistDashboard = ({ artistAddress, contractAddress, contractABI }) => {
    const [profile, setProfile] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [revenueMetrics, setRevenueMetrics] = useState(null);
    const [portfolioMetrics, setPortfolioMetrics] = useState(null);
    const [stakingInfo, setStakingInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contract, setContract] = useState(null);

    // Initialize contract
    useEffect(() => {
        const initContract = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const artistContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(artistContract);
            }
        };
        initContract();
    }, [contractAddress, contractABI]);

    // Load artist data
    useEffect(() => {
        const loadArtistData = async () => {
            if (!contract || !artistAddress) return;

            try {
                setLoading(true);

                // Load profile
                const profileData = await contract.getProfile(artistAddress);
                setProfile(profileData);

                // Load artworks
                const artworkIds = await contract.getArtistArtworks(artistAddress);
                const artworkPromises = artworkIds.map(id => contract.getArtwork(id));
                const artworkData = await Promise.all(artworkPromises);
                setArtworks(artworkData);

                // Load metrics
                const revenue = await contract.getRevenueMetrics(artistAddress);
                setRevenueMetrics(revenue);

                const portfolio = await contract.getPortfolioMetrics(artistAddress);
                setPortfolioMetrics(portfolio);

                const staking = await contract.getStakingInfo(artistAddress);
                setStakingInfo(staking);

                setLoading(false);
            } catch (error) {
                console.error('Error loading artist data:', error);
                setLoading(false);
            }
        };

        loadArtistData();
    }, [contract, artistAddress]);

    // Format currency
    const formatEther = (value) => {
        return ethers.formatEther(value || 0);
    };

    // Get tier name
    const getTierName = (tier) => {
        const tiers = ['Community', 'Creator', 'Master', 'Legendary'];
        return tiers[tier] || 'Unknown';
    };

    // Get tier badge color
    const getTierColor = (tier) => {
        const colors = ['#528Hz', '#963Hz', '#999Hz', '#FFD700'];
        return colors[tier] || '#888';
    };

    if (loading) {
        return (
            <div className="artist-dashboard loading">
                <div className="frequency-loader">
                    <div className="frequency-pulse pulse-528"></div>
                    <div className="frequency-pulse pulse-963"></div>
                    <div className="frequency-pulse pulse-999"></div>
                    <p>Loading Artist Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="artist-dashboard no-profile">
                <p>No artist profile found. Please create a profile first.</p>
            </div>
        );
    }

    return (
        <div className="artist-dashboard">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="profile-banner">
                    <img 
                        src={profile.profileImageURI || '/default-avatar.png'} 
                        alt={profile.name}
                        className="profile-image"
                    />
                    <div className="profile-info">
                        <h1>{profile.name}</h1>
                        <div className="profile-meta">
                            <span className="tier-badge" style={{ backgroundColor: getTierColor(profile.tier) }}>
                                {getTierName(profile.tier)}
                            </span>
                            {profile.isVerified && <span className="verified-badge">✓ Verified</span>}
                        </div>
                        <p className="bio">{profile.bio}</p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                {/* Portfolio Stats */}
                <div className="metric-card portfolio-stats">
                    <h3>📊 Portfolio Statistics</h3>
                    <div className="stat-row">
                        <span className="stat-label">Total Artworks:</span>
                        <span className="stat-value">{Number(profile.totalArtworks)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Published:</span>
                        <span className="stat-value">{Number(portfolioMetrics?.publishedArtworks || 0)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Sold:</span>
                        <span className="stat-value">{Number(portfolioMetrics?.soldArtworks || 0)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Total Views:</span>
                        <span className="stat-value">{Number(portfolioMetrics?.totalViews || 0)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Total Likes:</span>
                        <span className="stat-value">{Number(portfolioMetrics?.totalLikes || 0)}</span>
                    </div>
                </div>

                {/* Revenue Stats */}
                <div className="metric-card revenue-stats">
                    <h3>💰 Revenue & Royalties</h3>
                    <div className="stat-row">
                        <span className="stat-label">Total Revenue:</span>
                        <span className="stat-value">{formatEther(profile.totalRevenue)} ETH</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Total Royalties:</span>
                        <span className="stat-value">{formatEther(profile.totalRoyalties)} ETH</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Total Sales:</span>
                        <span className="stat-value">{Number(revenueMetrics?.totalSales || 0)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Pending Withdrawal:</span>
                        <span className="stat-value highlight">{formatEther(revenueMetrics?.pendingWithdrawal || 0)} ETH</span>
                    </div>
                </div>

                {/* Staking Stats */}
                <div className="metric-card staking-stats">
                    <h3>🔒 Staking Pool</h3>
                    <div className="stat-row">
                        <span className="stat-label">Staked Amount:</span>
                        <span className="stat-value">{formatEther(profile.stakedAmount)} ETH</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Rewards Earned:</span>
                        <span className="stat-value">{formatEther(stakingInfo?.rewardsEarned || 0)} ETH</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Status:</span>
                        <span className={`stat-value ${stakingInfo?.isActive ? 'active' : 'inactive'}`}>
                            {stakingInfo?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Reputation */}
                <div className="metric-card reputation-stats">
                    <h3>⭐ Reputation</h3>
                    <div className="reputation-score">
                        <div className="score-circle">
                            <span className="score-number">{Number(profile.reputationScore)}</span>
                        </div>
                        <p>Reputation Score</p>
                    </div>
                </div>
            </div>

            {/* Artworks Section */}
            <div className="artworks-section">
                <h2>🎨 My Artworks</h2>
                <div className="artworks-grid">
                    {artworks.length > 0 ? (
                        artworks.map((artwork) => (
                            <div key={Number(artwork.artworkId)} className="artwork-card">
                                <div className="artwork-image">
                                    <img src={artwork.artworkURI} alt={artwork.title} />
                                    <div className="artwork-status">
                                        {['Draft', 'Published', 'Sold', 'Archived'][artwork.status]}
                                    </div>
                                </div>
                                <div className="artwork-info">
                                    <h4>{artwork.title}</h4>
                                    <p className="artwork-description">{artwork.description}</p>
                                    <div className="artwork-metrics">
                                        <span>👁 {Number(artwork.views)}</span>
                                        <span>❤️ {Number(artwork.likes)}</span>
                                        <span>💎 {Number(artwork.sales)}</span>
                                    </div>
                                    <div className="artwork-price">
                                        <span>Price: {formatEther(artwork.price)} ETH</span>
                                        <span>Royalty: {Number(artwork.royaltyPercentage) / 100}%</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-artworks">
                            <p>No artworks yet. Start creating!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Frequency Footer */}
            <div className="frequency-footer">
                <div className="frequency-indicator">
                    <span className="freq-528">528Hz DNA</span>
                    <span className="freq-963">963Hz Pineal</span>
                    <span className="freq-999">999Hz Crown</span>
                    <span className="freq-144k">144kHz NŪR</span>
                </div>
            </div>
        </div>
    );
};

export default ArtistDashboard;
