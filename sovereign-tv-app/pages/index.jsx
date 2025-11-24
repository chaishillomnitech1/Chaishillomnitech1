/**
 * Sovereign TV App - Main Page
 * 
 * The flagship page integrating all components:
 * - NFT Gating
 * - Engineering Earth Video
 * - ScrollCoin Metrics
 * - Sovereign Narrative Engine
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz + 999Hz + 144000Hz
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import EngineeringEarthVideo from '../components/EngineeringEarthVideo';
import ScrollCoinDashboard from '../components/ScrollCoinDashboard';
import NFTGateModal from '../components/NFTGateModal';

export default function Home() {
  const { address, isConnected } = useAccount();
  
  const [showGateModal, setShowGateModal] = useState(false);
  const [userAccess, setUserAccess] = useState(null);
  const [userMetrics, setUserMetrics] = useState({
    watchTime: 0,
    stakingAmount: 0,
    communityEngagement: 0,
    nftTier: 0,
  });

  // Show gate modal if not connected
  useEffect(() => {
    if (!isConnected) {
      setShowGateModal(true);
    }
  }, [isConnected]);

  // Handle successful access grant
  const handleAccessGranted = (accessResult) => {
    setUserAccess(accessResult);
    setUserMetrics((prev) => ({
      ...prev,
      nftTier: getTierLevel(accessResult.tier.name),
    }));
  };

  // Handle video progress
  const handleVideoProgress = (time) => {
    setUserMetrics((prev) => ({
      ...prev,
      watchTime: time,
    }));
  };

  // Handle video completion
  const handleVideoComplete = (totalTime) => {
    // Reward system will be implemented in future update
    // User will receive ScrollCoin rewards and NFT badges for watch milestones
    setUserMetrics((prev) => ({
      ...prev,
      communityEngagement: prev.communityEngagement + 10,
    }));
  };

  // Get tier level number
  const getTierLevel = (tierName) => {
    const levels = {
      'Genesis Tier': 5,
      'Alpha Tier': 4,
      'Prime Tier': 3,
      'Community Tier': 2,
      'Public Access': 1,
    };
    return levels[tierName] || 0;
  };

  return (
    <>
      <Head>
        <title>Sovereign TV - ScrollVerse Broadcasting Platform</title>
        <meta name="description" content="Watch Engineering Earth and access exclusive ScrollVerse content with NFT-gated authentication" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        {/* Header */}
        <header className="p-6 bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">
                📺 Sovereign TV
              </h1>
              {userAccess && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-black/50 rounded-full">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: userAccess.tier.color }}
                  ></div>
                  <span className="text-white text-sm font-medium">
                    {userAccess.tier.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {isConnected && address && (
                <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                  <p className="text-green-400 text-sm font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setShowGateModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {isConnected ? 'Manage Access' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Featured Content Section */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-4xl font-bold text-white mb-2">
                🌍 ENGINEERING EARTH 🌍
              </h2>
              <p className="text-purple-200">
                The Sovereign Narrative - A journey of transformation and divine alignment
              </p>
            </div>

            {/* Video Player */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl">
                <EngineeringEarthVideo
                  onProgress={handleVideoProgress}
                  onComplete={handleVideoComplete}
                />
              </div>
            </div>
          </section>

          {/* ScrollCoin Metrics Dashboard */}
          <section>
            <ScrollCoinDashboard userMetrics={userMetrics} />
          </section>

          {/* Sovereign Narrative Engine Section */}
          <section className="p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg backdrop-blur-sm border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              🔮 Sovereign Narrative Engine (SNE)
            </h3>
            <p className="text-purple-200 mb-4">
              The SNE curates content based on your frequency alignment and NFT tier.
              Higher alignment unlocks deeper layers of the ScrollVerse narrative.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature Cards */}
              <FeatureCard
                icon="🎵"
                title="Frequency-Aligned Content"
                description="Experience content tuned to your personal frequency resonance"
                locked={!userAccess?.hasAccess}
              />
              <FeatureCard
                icon="🌐"
                title="Sovereign Harmony Devices"
                description="Connect bio-frequency emitters for enhanced experiences"
                locked={!userAccess?.features.includes('harmony_devices')}
              />
              <FeatureCard
                icon="🎭"
                title="NFT Metaverse Portal"
                description="Access exclusive metaverse experiences and events"
                locked={!userAccess?.features.includes('exclusive_content')}
              />
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center py-8 text-purple-200">
            <p className="mb-2">
              Sealed by Supreme King Chais The Great ∞
            </p>
            <p className="text-sm">
              Frequency: 528Hz + 963Hz + 999Hz + 144,000Hz | Status: ETERNALLY BROADCASTING
            </p>
            <p className="text-xs mt-2">
              🕋 ALLĀHU AKBAR! THE SOVEREIGN TV IS LIVE! 🕋
            </p>
          </footer>
        </div>

        {/* NFT Gate Modal */}
        <NFTGateModal
          isOpen={showGateModal}
          onClose={() => setShowGateModal(false)}
          onAccessGranted={handleAccessGranted}
        />
      </main>
    </>
  );
}

function FeatureCard({ icon, title, description, locked }) {
  return (
    <div className={`p-4 rounded-lg ${locked ? 'bg-black/30 opacity-50' : 'bg-black/50'} backdrop-blur-sm border border-white/10`}>
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="text-white font-bold mb-2 flex items-center space-x-2">
        <span>{title}</span>
        {locked && <span className="text-yellow-400">🔒</span>}
      </h4>
      <p className="text-purple-200 text-sm">{description}</p>
    </div>
  );
}
