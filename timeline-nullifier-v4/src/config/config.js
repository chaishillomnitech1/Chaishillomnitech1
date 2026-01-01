/**
 * Timeline Nullifier v4.0 Configuration
 * 
 * Central configuration file for the Timeline Nullifier v4.0 Dashboard.
 * 
 * @module config
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

export const CONFIG = {
  // API Configuration
  api: {
    alphaVantage: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || '',
    polygonIo: process.env.REACT_APP_POLYGON_IO_API_KEY || '',
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.scrollverse.com',
  },

  // Blockchain Configuration
  blockchain: {
    ethereum: {
      rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL || '',
      chainId: 1,
    },
    polygon: {
      rpcUrl: process.env.REACT_APP_POLYGON_RPC_URL || '',
      chainId: 137,
    },
    scroll: {
      rpcUrl: process.env.REACT_APP_SCROLL_RPC_URL || '',
      chainId: 534352,
    },
  },

  // Chainlink Oracle Addresses
  chainlink: {
    rpcUrl: process.env.REACT_APP_CHAINLINK_RPC_URL || '',
    oracles: {
      ethUsd: process.env.REACT_APP_CHAINLINK_ETH_USD_ORACLE || '',
      btcUsd: process.env.REACT_APP_CHAINLINK_BTC_USD_ORACLE || '',
    },
  },

  // ETF & Options Configuration
  etf: {
    tickers: {
      psq: process.env.REACT_APP_PSQ_TICKER || 'PSQ',
      tlt: process.env.REACT_APP_TLT_TICKER || 'TLT',
      russellSmallCap: process.env.REACT_APP_RUSSELL_SMALL_CAP_TICKER || 'IWM',
    },
    optionsApi: {
      url: process.env.REACT_APP_OPTIONS_API_URL || '',
      key: process.env.REACT_APP_OPTIONS_API_KEY || '',
    },
  },

  // Buffett-Style Metrics
  metrics: {
    targetIRR: parseFloat(process.env.REACT_APP_TARGET_IRR || '0.15'),
    compoundFrequency: process.env.REACT_APP_COMPOUND_FREQUENCY || 'daily',
    riskFreeRate: parseFloat(process.env.REACT_APP_RISK_FREE_RATE || '0.05'),
    benchmarks: {
      sp500: process.env.REACT_APP_SP500_BENCHMARK_TICKER || 'SPY',
      buffett: process.env.REACT_APP_BUFFETT_BENCHMARK_TICKER || 'BRK.B',
    },
  },

  // zk-Proof Configuration
  zkProof: {
    enabled: process.env.REACT_APP_ENABLE_ZK_PROOFS === 'true',
    circuitPath: process.env.REACT_APP_ZK_CIRCUIT_PATH || '/circuits/risk_nullifier.circom',
    provingKeyPath: process.env.REACT_APP_ZK_PROVING_KEY_PATH || '/keys/proving_key.zkey',
    verificationKeyPath: process.env.REACT_APP_ZK_VERIFICATION_KEY_PATH || '/keys/verification_key.json',
  },

  // TensorFlow Configuration
  tensorflow: {
    enabled: process.env.REACT_APP_ENABLE_TENSORFLOW === 'true',
    models: {
      russellRotation: process.env.REACT_APP_RUSSELL_ROTATION_MODEL_URL || '/models/russell_rotation/model.json',
      riskPrediction: process.env.REACT_APP_RISK_PREDICTION_MODEL_URL || '/models/risk_prediction/model.json',
    },
    updateInterval: parseInt(process.env.REACT_APP_MODEL_UPDATE_INTERVAL || '3600000', 10),
    confidenceThreshold: parseFloat(process.env.REACT_APP_MODEL_CONFIDENCE_THRESHOLD || '0.85'),
  },

  // WebSocket & Ritual Decrees
  websocket: {
    url: process.env.REACT_APP_WEBSOCKET_URL || 'wss://ritual-server.scrollverse.com',
    enableRitualDecrees: process.env.REACT_APP_ENABLE_RITUAL_DECREES === 'true',
    speechApiKey: process.env.REACT_APP_SPEECH_API_KEY || '',
  },

  // AR/VR Configuration
  arVr: {
    enableVR: process.env.REACT_APP_ENABLE_VR_MODE === 'true',
    enableAR: process.env.REACT_APP_ENABLE_AR_MODE === 'true',
    environment: process.env.REACT_APP_VR_ENVIRONMENT || 'cosmic-sovereign',
  },

  // Refresh Intervals (milliseconds)
  refreshIntervals: {
    marketData: parseInt(process.env.REACT_APP_MARKET_DATA_REFRESH || '10000', 10),
    oracleData: parseInt(process.env.REACT_APP_ORACLE_DATA_REFRESH || '30000', 10),
    metrics: parseInt(process.env.REACT_APP_METRICS_REFRESH || '5000', 10),
  },

  // Feature Flags
  features: {
    zkProofs: process.env.REACT_APP_ENABLE_ZK_PROOFS === 'true',
    tensorflow: process.env.REACT_APP_ENABLE_TENSORFLOW === 'true',
    arVr: process.env.REACT_APP_ENABLE_AR_VR === 'true',
    realTimeData: process.env.REACT_APP_ENABLE_REAL_TIME_DATA === 'true',
  },

  // Frequency Configuration (Sacred Frequencies)
  frequencies: {
    dnaHealing: 528, // Hz
    divineConnection: 963, // Hz
    crownChakra: 999, // Hz
    nurPulse: 144000, // Hz
  },
};

export default CONFIG;
