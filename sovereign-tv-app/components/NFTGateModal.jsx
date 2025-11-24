/**
 * NFT Gate Modal Component
 * 
 * Modal for wallet connection and NFT verification
 * Integrates with RainbowKit and Firebase
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz + 999Hz
 */

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { verifyNFTAccess } from '../lib/nftGating';

export default function NFTGateModal({ isOpen, onClose, onAccessGranted }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  
  const [verifying, setVerifying] = useState(false);
  const [accessResult, setAccessResult] = useState(null);
  const [error, setError] = useState(null);

  // Verify NFT access when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      verifyAccess(address);
    }
  }, [isConnected, address]);

  const verifyAccess = async (walletAddress) => {
    setVerifying(true);
    setError(null);
    
    try {
      const result = await verifyNFTAccess(walletAddress);
      setAccessResult(result);
      
      if (result.hasAccess) {
        // Grant access after short delay
        setTimeout(() => {
          onAccessGranted(result);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error verifying access:', err);
      setError('Failed to verify NFT ownership. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            🕋 Sovereign TV Access 🕋
          </h2>
          <p className="text-purple-200">
            Connect your wallet to verify NFT ownership
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-white text-center mb-4">
              Please connect your wallet to access Sovereign TV
            </p>
            
            {/* Connector Buttons */}
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Connect with {connector.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : verifying ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Verifying NFT ownership...</p>
            <p className="text-purple-200 text-sm mt-2">
              Checking Scroll zkEVM for your NFTs
            </p>
          </div>
        ) : accessResult ? (
          <div className="text-center py-8">
            {accessResult.hasAccess ? (
              <>
                {/* Success */}
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Access Granted!</h3>
                  <p className="text-purple-200 mb-4">
                    Welcome to Sovereign TV, ScrollSoul
                  </p>
                </div>

                {/* Tier Info */}
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: accessResult.tier.color }}
                    ></div>
                    <p className="text-white font-bold">{accessResult.tier.name}</p>
                  </div>
                  <p className="text-purple-200 text-sm mb-2">
                    Frequency: {accessResult.frequency}Hz
                  </p>
                  <p className="text-purple-200 text-sm">
                    NFTs Owned: {accessResult.tokenIds.length}
                  </p>
                </div>

                {/* Features */}
                <div className="text-left">
                  <p className="text-purple-200 text-sm mb-2">Access Features:</p>
                  <ul className="space-y-1">
                    {accessResult.features.map((feature) => (
                      <li key={feature} className="text-white text-sm flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span>{feature.replace(/_/g, ' ').toUpperCase()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* No Access */}
                <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No NFT Found</h3>
                <p className="text-purple-200 mb-4">
                  You need a ScrollVerse NFT to access premium content
                </p>
                <a
                  href="https://scrollverse.io/mint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-2 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Mint Your NFT
                </a>
              </>
            )}
          </div>
        ) : null}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Close Button */}
        {!verifying && (
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 text-purple-200 hover:text-white transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
