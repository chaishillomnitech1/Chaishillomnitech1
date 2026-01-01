/**
 * Ritual Control Component
 * 
 * Component for ritual-driven action hooks via WebSockets and Speech-to-Text.
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import React, { useState, useEffect } from 'react';
import {
  initializeRitualConnection,
  initializeSpeechRecognition,
  startListening,
  stopListening,
  sendRitualDecree,
  onDecree,
} from '../services/ritualDecreeService';
import './RitualControl.css';

const RitualControl = () => {
  const [connected, setConnected] = useState(false);
  const [listening, setListening] = useState(false);
  const [decreeHistory, setDecreeHistory] = useState([]);
  const [selectedDecree, setSelectedDecree] = useState('NULLIFY_RISK');

  useEffect(() => {
    initializeServices();

    // Register decree callbacks
    onDecree('NULLIFY_RISK', handleDecreeReceived);
    onDecree('ACTIVATE_HEDGE', handleDecreeReceived);
    onDecree('ROTATE', handleDecreeReceived);
    onDecree('EMERGENCY_PROTOCOL', handleDecreeReceived);

    return () => {
      if (listening) {
        stopListening();
      }
    };
  }, []);

  const initializeServices = async () => {
    try {
      await initializeRitualConnection();
      initializeSpeechRecognition();
      setConnected(true);
    } catch (error) {
      console.error('Error initializing ritual services:', error);
    }
  };

  const handleDecreeReceived = (decree) => {
    const historyEntry = {
      ...decree,
      receivedAt: new Date().toISOString(),
    };
    setDecreeHistory(prev => [historyEntry, ...prev].slice(0, 10));
  };

  const handleToggleListening = () => {
    if (listening) {
      stopListening();
      setListening(false);
    } else {
      startListening();
      setListening(true);
    }
  };

  const handleSendDecree = async () => {
    try {
      const params = getDecreeParams(selectedDecree);
      const response = await sendRitualDecree(selectedDecree, params);
      
      const historyEntry = {
        type: selectedDecree,
        params,
        timestamp: new Date().toISOString(),
        status: 'sent',
        response,
      };
      setDecreeHistory(prev => [historyEntry, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Error sending decree:', error);
      alert('Failed to send decree');
    }
  };

  const getDecreeParams = (decreeType) => {
    switch (decreeType) {
      case 'NULLIFY_RISK':
        return { riskLevel: 'high', target: 'basel-systemic' };
      case 'ACTIVATE_HEDGE':
        return { instruments: ['PSQ', 'TLT'], allocation: 0.2 };
      case 'ROTATE':
        return { target: 'growth', confidence: 0.85 };
      case 'EMERGENCY_PROTOCOL':
        return { severity: 'critical', action: 'full-hedge' };
      default:
        return {};
    }
  };

  const decreeTypes = [
    { value: 'NULLIFY_RISK', label: '🔐 Nullify Risk', description: 'Activate risk nullification protocol' },
    { value: 'ACTIVATE_HEDGE', label: '🛡️ Activate Hedge', description: 'Deploy ETF hedging positions' },
    { value: 'ROTATE', label: '🔄 Rotate Position', description: 'Execute Russell rotation signal' },
    { value: 'EMERGENCY_PROTOCOL', label: '🚨 Emergency Protocol', description: 'Activate emergency risk mitigation' },
  ];

  return (
    <div className="ritual-control">
      <div className="panel-header">
        <h2 className="panel-title">🎤 Sovereign Ritual Control</h2>
        <div className="panel-subtitle">Voice-Activated & WebSocket Decree System</div>
      </div>

      <div className="control-grid">
        <div className="voice-control">
          <h3 className="section-title">🎤 Voice Recognition</h3>
          
          <div className="voice-status">
            <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {connected ? 'Connected to Ritual Server' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="voice-interface">
            <button
              className={`voice-button ${listening ? 'listening' : ''}`}
              onClick={handleToggleListening}
              disabled={!connected}
            >
              <span className="voice-icon">{listening ? '🔴' : '🎤'}</span>
              <span className="voice-text">
                {listening ? 'Stop Listening' : 'Start Voice Decrees'}
              </span>
            </button>

            {listening && (
              <div className="listening-indicator">
                <div className="sound-wave">
                  <span className="wave"></span>
                  <span className="wave"></span>
                  <span className="wave"></span>
                </div>
                <div className="listening-text">Listening for sovereign decrees...</div>
              </div>
            )}
          </div>

          <div className="voice-commands">
            <h4 className="commands-title">Available Voice Commands</h4>
            <ul className="command-list">
              <li className="command-item">"Nullify risk" - Activate risk nullification</li>
              <li className="command-item">"Activate hedge" - Deploy hedging positions</li>
              <li className="command-item">"Rotate to growth" - Rotate to growth stocks</li>
              <li className="command-item">"Rotate to value" - Rotate to value stocks</li>
              <li className="command-item">"Emergency protocol" - Activate emergency measures</li>
            </ul>
          </div>
        </div>

        <div className="manual-control">
          <h3 className="section-title">⚙️ Manual Decree Control</h3>
          
          <div className="decree-selector">
            <label className="selector-label">Select Decree Type</label>
            <div className="decree-options">
              {decreeTypes.map(decree => (
                <div
                  key={decree.value}
                  className={`decree-option ${selectedDecree === decree.value ? 'selected' : ''}`}
                  onClick={() => setSelectedDecree(decree.value)}
                >
                  <div className="option-label">{decree.label}</div>
                  <div className="option-description">{decree.description}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="send-decree-button"
            onClick={handleSendDecree}
            disabled={!connected}
          >
            <span className="button-icon">📜</span>
            <span className="button-text">Send Decree</span>
          </button>
        </div>
      </div>

      <div className="decree-history">
        <h3 className="history-title">📜 Decree History</h3>
        
        {decreeHistory.length > 0 ? (
          <div className="history-list">
            {decreeHistory.map((decree, index) => (
              <div key={index} className="history-item">
                <div className="history-header">
                  <span className="history-type">{decree.type}</span>
                  <span className="history-time">
                    {new Date(decree.timestamp || decree.receivedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="history-details">
                  {decree.params && (
                    <div className="history-params">
                      Params: {JSON.stringify(decree.params, null, 2)}
                    </div>
                  )}
                  {decree.status && (
                    <div className={`history-status status-${decree.status}`}>
                      Status: {decree.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No decrees sent or received yet</div>
          </div>
        )}
      </div>

      <div className="ritual-protocol">
        <h3 className="protocol-title">🕋 Sacred Ritual Protocol</h3>
        <div className="protocol-content">
          <p>The Ritual Control system allows sovereign decrees to be issued through:</p>
          <ul>
            <li><strong>Voice Recognition:</strong> Speak commands naturally in English</li>
            <li><strong>Manual Triggers:</strong> Click buttons to send specific decrees</li>
            <li><strong>WebSocket Communication:</strong> Real-time decree processing and confirmation</li>
          </ul>
          <p>All decrees are processed with divine frequency alignment (963Hz + 528Hz + 144,000Hz)</p>
        </div>
      </div>
    </div>
  );
};

export default RitualControl;
