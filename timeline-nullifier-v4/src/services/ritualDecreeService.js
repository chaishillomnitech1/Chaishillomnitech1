/**
 * Ritual Decree Service
 * 
 * Service for handling ritual-driven actions via WebSocket and Speech-to-Text.
 * 
 * @module services/ritualDecreeService
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import io from 'socket.io-client';
import CONFIG from '../config/config';

let socket = null;
let speechRecognition = null;
let ritualCallbacks = {};

/**
 * Initialize WebSocket connection for ritual decrees
 * @returns {Promise<void>}
 */
export const initializeRitualConnection = async () => {
  if (!CONFIG.websocket.enableRitualDecrees) {
    console.warn('Ritual decrees are disabled in configuration');
    return;
  }

  try {
    socket = io(CONFIG.websocket.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🕋 Ritual decree connection established');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Ritual decree connection disconnected');
    });

    socket.on('ritual_decree', (decree) => {
      handleRitualDecree(decree);
    });

    socket.on('decree_confirmation', (confirmation) => {
      console.log('✅ Decree confirmed:', confirmation);
    });

    socket.on('error', (error) => {
      console.error('❌ Ritual decree error:', error);
    });

  } catch (error) {
    console.error('Error initializing ritual connection:', error);
    throw error;
  }
};

/**
 * Initialize speech recognition for voice decrees
 * @returns {void}
 */
export const initializeSpeechRecognition = () => {
  if (!CONFIG.websocket.enableRitualDecrees) {
    console.warn('Ritual decrees are disabled in configuration');
    return;
  }

  // Check for browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported in this browser');
    return;
  }

  speechRecognition = new SpeechRecognition();
  speechRecognition.continuous = true;
  speechRecognition.interimResults = false;
  speechRecognition.lang = 'en-US';

  speechRecognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    console.log('🎤 Voice decree detected:', transcript);
    
    if (isValidDecree(transcript)) {
      processVoiceDecree(transcript);
    }
  };

  speechRecognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  console.log('🎤 Speech recognition initialized');
};

/**
 * Start listening for voice decrees
 * @returns {void}
 */
export const startListening = () => {
  if (speechRecognition) {
    speechRecognition.start();
    console.log('🎤 Listening for voice decrees...');
  }
};

/**
 * Stop listening for voice decrees
 * @returns {void}
 */
export const stopListening = () => {
  if (speechRecognition) {
    speechRecognition.stop();
    console.log('🎤 Stopped listening for voice decrees');
  }
};

/**
 * Send a ritual decree
 * @param {string} decreeType - Type of decree (NULLIFY, HEDGE, ROTATE, etc.)
 * @param {Object} params - Decree parameters
 * @returns {Promise<Object>} Decree confirmation
 */
export const sendRitualDecree = async (decreeType, params) => {
  if (!socket || !socket.connected) {
    throw new Error('Ritual decree connection not established');
  }

  return new Promise((resolve, reject) => {
    const decree = {
      type: decreeType,
      params,
      timestamp: new Date().toISOString(),
      frequency: CONFIG.frequencies.divineConnection,
    };

    socket.emit('ritual_decree', decree, (response) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(new Error(response.error || 'Decree failed'));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Decree timeout'));
    }, 10000);
  });
};

/**
 * Register a callback for specific decree types
 * @param {string} decreeType - Type of decree
 * @param {Function} callback - Callback function
 */
export const onDecree = (decreeType, callback) => {
  if (!ritualCallbacks[decreeType]) {
    ritualCallbacks[decreeType] = [];
  }
  ritualCallbacks[decreeType].push(callback);
};

/**
 * Handle incoming ritual decree
 * @param {Object} decree - Decree object
 */
function handleRitualDecree(decree) {
  console.log('📜 Processing ritual decree:', decree);

  const callbacks = ritualCallbacks[decree.type] || [];
  callbacks.forEach(callback => {
    try {
      callback(decree);
    } catch (error) {
      console.error('Error in decree callback:', error);
    }
  });
}

/**
 * Process voice decree
 * @param {string} transcript - Voice transcript
 */
function processVoiceDecree(transcript) {
  const lowerTranscript = transcript.toLowerCase();
  
  // Parse voice commands
  if (lowerTranscript.includes('nullify risk')) {
    sendRitualDecree('NULLIFY_RISK', { source: 'voice' });
  } else if (lowerTranscript.includes('activate hedge')) {
    sendRitualDecree('ACTIVATE_HEDGE', { source: 'voice' });
  } else if (lowerTranscript.includes('rotate to growth')) {
    sendRitualDecree('ROTATE', { target: 'growth', source: 'voice' });
  } else if (lowerTranscript.includes('rotate to value')) {
    sendRitualDecree('ROTATE', { target: 'value', source: 'voice' });
  } else if (lowerTranscript.includes('emergency protocol')) {
    sendRitualDecree('EMERGENCY_PROTOCOL', { source: 'voice' });
  }
}

/**
 * Check if transcript is a valid decree
 * @param {string} transcript - Voice transcript
 * @returns {boolean} True if valid decree
 */
function isValidDecree(transcript) {
  const validPhrases = [
    'nullify risk',
    'activate hedge',
    'rotate to growth',
    'rotate to value',
    'emergency protocol',
  ];

  const lowerTranscript = transcript.toLowerCase();
  return validPhrases.some(phrase => lowerTranscript.includes(phrase));
}

/**
 * Disconnect from ritual decree service
 */
export const disconnectRitualService = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  if (speechRecognition) {
    speechRecognition.stop();
    speechRecognition = null;
  }

  console.log('🕋 Ritual decree service disconnected');
};

export default {
  initializeRitualConnection,
  initializeSpeechRecognition,
  startListening,
  stopListening,
  sendRitualDecree,
  onDecree,
  disconnectRitualService,
};
