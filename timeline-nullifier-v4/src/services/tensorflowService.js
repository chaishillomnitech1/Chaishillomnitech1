/**
 * TensorFlow Service
 * 
 * Service for Russell rotation signals and risk prediction using TensorFlow.js.
 * 
 * @module services/tensorflowService
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import * as tf from '@tensorflow/tfjs';
import CONFIG from '../config/config';

let russellRotationModel = null;
let riskPredictionModel = null;

/**
 * Load TensorFlow models
 * @returns {Promise<void>}
 */
export const loadModels = async () => {
  if (!CONFIG.tensorflow.enabled) {
    console.warn('TensorFlow is disabled in configuration');
    return;
  }

  try {
    // In production, load actual trained models
    // russellRotationModel = await tf.loadLayersModel(CONFIG.tensorflow.models.russellRotation);
    // riskPredictionModel = await tf.loadLayersModel(CONFIG.tensorflow.models.riskPrediction);

    // For now, create simple mock models
    russellRotationModel = createMockRotationModel();
    riskPredictionModel = createMockRiskModel();

    console.log('TensorFlow models loaded successfully');
  } catch (error) {
    console.error('Error loading TensorFlow models:', error);
    throw error;
  }
};

/**
 * Create a mock Russell rotation model
 * @returns {tf.LayersModel} Mock model
 */
function createMockRotationModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [10] }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 3, activation: 'softmax' })); // Growth, Value, Neutral
  model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });
  return model;
}

/**
 * Create a mock risk prediction model
 * @returns {tf.LayersModel} Mock model
 */
function createMockRiskModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [15] }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // Risk score 0-1
  model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
  return model;
}

/**
 * Predict Russell rotation signals
 * @param {Array} marketData - Market indicators (10 features)
 * @returns {Promise<Object>} Rotation prediction
 */
export const predictRussellRotation = async (marketData) => {
  if (!russellRotationModel) {
    await loadModels();
  }

  try {
    // Prepare input tensor
    const inputTensor = tf.tensor2d([marketData], [1, 10]);

    // Make prediction
    const prediction = russellRotationModel.predict(inputTensor);
    const probabilities = await prediction.data();

    // Cleanup tensors
    inputTensor.dispose();
    prediction.dispose();

    const rotationSignal = {
      growth: probabilities[0],
      value: probabilities[1],
      neutral: probabilities[2],
      recommendation: getRecommendation(probabilities),
      confidence: Math.max(...probabilities),
      timestamp: new Date().toISOString(),
    };

    return rotationSignal;
  } catch (error) {
    console.error('Error predicting Russell rotation:', error);
    throw error;
  }
};

/**
 * Predict systemic risk level
 * @param {Array} riskIndicators - Risk indicators (15 features)
 * @returns {Promise<Object>} Risk prediction
 */
export const predictSystemicRisk = async (riskIndicators) => {
  if (!riskPredictionModel) {
    await loadModels();
  }

  try {
    // Prepare input tensor
    const inputTensor = tf.tensor2d([riskIndicators], [1, 15]);

    // Make prediction
    const prediction = riskPredictionModel.predict(inputTensor);
    const riskScore = (await prediction.data())[0];

    // Cleanup tensors
    inputTensor.dispose();
    prediction.dispose();

    return {
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      needsNullification: riskScore > 0.7,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error predicting systemic risk:', error);
    throw error;
  }
};

/**
 * Analyze market conditions and provide trading signals
 * @param {Object} marketSnapshot - Current market data
 * @returns {Promise<Object>} Trading signals
 */
export const analyzeMarketConditions = async (marketSnapshot) => {
  try {
    // Extract features from market snapshot
    const rotationFeatures = extractRotationFeatures(marketSnapshot);
    const riskFeatures = extractRiskFeatures(marketSnapshot);

    // Get predictions
    const [rotationSignal, riskPrediction] = await Promise.all([
      predictRussellRotation(rotationFeatures),
      predictSystemicRisk(riskFeatures),
    ]);

    return {
      rotation: rotationSignal,
      risk: riskPrediction,
      recommendation: generateTradeRecommendation(rotationSignal, riskPrediction),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error analyzing market conditions:', error);
    throw error;
  }
};

// Helper functions

/**
 * Extract rotation features from market snapshot
 * @param {Object} marketSnapshot - Market data
 * @returns {Array} Feature array (10 elements)
 */
function extractRotationFeatures(marketSnapshot) {
  // Mock feature extraction - in production, use real market indicators
  return [
    Math.random(), // P/E ratio spread
    Math.random(), // Momentum factor
    Math.random(), // Value factor
    Math.random(), // Size factor
    Math.random(), // Quality factor
    Math.random(), // Interest rate trend
    Math.random(), // GDP growth
    Math.random(), // Inflation rate
    Math.random(), // VIX level
    Math.random(), // Market breadth
  ];
}

/**
 * Extract risk features from market snapshot
 * @param {Object} marketSnapshot - Market data
 * @returns {Array} Feature array (15 elements)
 */
function extractRiskFeatures(marketSnapshot) {
  // Mock feature extraction - in production, use real risk indicators
  return Array.from({ length: 15 }, () => Math.random());
}

/**
 * Get rotation recommendation from probabilities
 * @param {Array} probabilities - [growth, value, neutral]
 * @returns {string} Recommendation
 */
function getRecommendation(probabilities) {
  const maxProb = Math.max(...probabilities);
  const index = probabilities.indexOf(maxProb);
  const recommendations = ['ROTATE_TO_GROWTH', 'ROTATE_TO_VALUE', 'HOLD_NEUTRAL'];
  return recommendations[index];
}

/**
 * Get risk level from risk score
 * @param {number} riskScore - Risk score (0-1)
 * @returns {string} Risk level
 */
function getRiskLevel(riskScore) {
  if (riskScore < 0.3) return 'LOW';
  if (riskScore < 0.5) return 'MODERATE';
  if (riskScore < 0.7) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Generate trade recommendation
 * @param {Object} rotationSignal - Rotation signal
 * @param {Object} riskPrediction - Risk prediction
 * @returns {Object} Trade recommendation
 */
function generateTradeRecommendation(rotationSignal, riskPrediction) {
  const shouldHedge = riskPrediction.riskScore > 0.6;
  const confidence = Math.min(rotationSignal.confidence, 1 - riskPrediction.riskScore);

  return {
    action: shouldHedge ? 'HEDGE' : rotationSignal.recommendation,
    confidence,
    hedgeInstruments: shouldHedge ? ['PSQ', 'TLT'] : [],
    reasoning: `Risk: ${riskPrediction.riskLevel}, Rotation: ${rotationSignal.recommendation}`,
  };
}

export default {
  loadModels,
  predictRussellRotation,
  predictSystemicRisk,
  analyzeMarketConditions,
};
