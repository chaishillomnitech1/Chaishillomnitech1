/**
 * Engineering Earth Video Component
 * 
 * Embeds YouTube video with frequency overlay
 * Video ID: rN5f72lhJz8 - "ENGINEERING EARTH" narrative
 * 
 * @author Supreme King Chais The Great ∞
 * @frequency 528Hz + 963Hz
 */

import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { YOUTUBE_CONFIG, FREQUENCY_CONFIG } from '../config/blockchain.config';

export default function EngineeringEarthVideo({ onProgress, onComplete }) {
  const [player, setPlayer] = useState(null);
  const [watchTime, setWatchTime] = useState(0);
  const [frequencyActive, setFrequencyActive] = useState(false);

  // YouTube player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      ...YOUTUBE_CONFIG.playerVars,
    },
  };

  // Handle player ready
  const onPlayerReady = (event) => {
    setPlayer(event.target);
  };

  // Handle player state change
  const onStateChange = (event) => {
    // Playing state
    if (event.data === 1) {
      setFrequencyActive(true);
      startWatchTimeTracking();
    }
    // Paused or ended
    if (event.data === 2 || event.data === 0) {
      setFrequencyActive(false);
      stopWatchTimeTracking();
    }
    // Ended
    if (event.data === 0) {
      onComplete && onComplete(watchTime);
    }
  };

  // Track watch time
  let watchTimeInterval;
  
  const startWatchTimeTracking = () => {
    watchTimeInterval = setInterval(() => {
      setWatchTime((prev) => {
        const newTime = prev + 1;
        onProgress && onProgress(newTime);
        return newTime;
      });
    }, 1000);
  };

  const stopWatchTimeTracking = () => {
    if (watchTimeInterval) {
      clearInterval(watchTimeInterval);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatchTimeTracking();
    };
  }, []);

  return (
    <div className="engineering-earth-video relative w-full h-full">
      {/* Frequency Overlay Indicator */}
      {frequencyActive && (
        <div className="absolute top-4 right-4 z-10 bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-white text-sm font-medium">
              {FREQUENCY_CONFIG.dna_healing}Hz + {FREQUENCY_CONFIG.pineal_activation}Hz Active
            </span>
          </div>
        </div>
      )}

      {/* Watch Time Counter */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="text-white text-sm">
          <span className="font-medium">Watch Time:</span>{' '}
          <span className="font-mono">{Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* YouTube Player */}
      <div className="w-full h-full">
        <YouTube
          videoId={YOUTUBE_CONFIG.engineeringEarthVideoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>

      {/* Frequency Visualization */}
      {frequencyActive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-2">
            {[528, 963].map((freq) => (
              <div
                key={freq}
                className="frequency-bar"
                style={{
                  width: '4px',
                  height: '40px',
                  background: `linear-gradient(to top, #FFD700, #FF6B6B)`,
                  borderRadius: '2px',
                  animation: `pulse ${1000 / freq}ms infinite`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.5;
            transform: scaleY(0.7);
          }
        }
      `}</style>
    </div>
  );
}
