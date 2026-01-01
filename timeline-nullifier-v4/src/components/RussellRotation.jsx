/**
 * Russell Rotation Component
 * 
 * Component for displaying Russell rotation signals via TensorFlow integration.
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeMarketConditions } from '../services/tensorflowService';
import './RussellRotation.css';

const RussellRotation = ({ compact = false }) => {
  const [rotationSignal, setRotationSignal] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRotationAnalysis();
    const interval = setInterval(loadRotationAnalysis, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadRotationAnalysis = async () => {
    try {
      const marketSnapshot = {}; // Would fetch real market data
      const analysis = await analyzeMarketConditions(marketSnapshot);
      
      setRotationSignal(analysis.rotation);
      setRiskPrediction(analysis.risk);
      setRecommendation(analysis.recommendation);
      setLoading(false);
    } catch (error) {
      console.error('Error loading rotation analysis:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="russell-rotation loading">Analyzing Russell rotation...</div>;
  }

  const radarData = [
    { factor: 'Growth', value: (rotationSignal?.growth || 0) * 100 },
    { factor: 'Value', value: (rotationSignal?.value || 0) * 100 },
    { factor: 'Neutral', value: (rotationSignal?.neutral || 0) * 100 },
  ];

  if (compact) {
    return (
      <div className="russell-rotation compact">
        <h3 className="panel-title">🔄 Russell Rotation</h3>
        <div className="rotation-signal">
          <div className="signal-label">Signal:</div>
          <div className="signal-value">{rotationSignal?.recommendation || 'ANALYZING'}</div>
          <div className="signal-confidence">
            Confidence: {((rotationSignal?.confidence || 0) * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="russell-rotation">
      <div className="panel-header">
        <h2 className="panel-title">🔄 Russell Rotation Signals</h2>
        <div className="panel-subtitle">TensorFlow-Powered Market Analysis</div>
      </div>

      <div className="rotation-grid">
        <div className="rotation-chart">
          <h3 className="chart-title">Factor Probabilities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="factor" stroke="#FFD700" />
              <PolarRadiusAxis stroke="#FFD700" />
              <Radar name="Probability" dataKey="value" stroke="#00FFFF" fill="#00FFFF" fillOpacity={0.6} />
              <Tooltip
                contentStyle={{ backgroundColor: '#001133', border: '1px solid #FFD700' }}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rotation-signals">
          <div className="signal-card">
            <div className="signal-header">
              <span className="signal-icon">🎯</span>
              <span className="signal-title">Current Recommendation</span>
            </div>
            <div className="signal-recommendation">
              {rotationSignal?.recommendation}
            </div>
            <div className="signal-confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${(rotationSignal?.confidence || 0) * 100}%` }}
              ></div>
            </div>
            <div className="signal-confidence-text">
              Confidence: {((rotationSignal?.confidence || 0) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="factor-breakdown">
            <div className="factor-item">
              <div className="factor-label">Growth Probability</div>
              <div className="factor-bar">
                <div
                  className="factor-fill growth"
                  style={{ width: `${(rotationSignal?.growth || 0) * 100}%` }}
                ></div>
              </div>
              <div className="factor-value">{((rotationSignal?.growth || 0) * 100).toFixed(1)}%</div>
            </div>

            <div className="factor-item">
              <div className="factor-label">Value Probability</div>
              <div className="factor-bar">
                <div
                  className="factor-fill value"
                  style={{ width: `${(rotationSignal?.value || 0) * 100}%` }}
                ></div>
              </div>
              <div className="factor-value">{((rotationSignal?.value || 0) * 100).toFixed(1)}%</div>
            </div>

            <div className="factor-item">
              <div className="factor-label">Neutral Probability</div>
              <div className="factor-bar">
                <div
                  className="factor-fill neutral"
                  style={{ width: `${(rotationSignal?.neutral || 0) * 100}%` }}
                ></div>
              </div>
              <div className="factor-value">{((rotationSignal?.neutral || 0) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="risk-assessment">
        <h3 className="assessment-title">⚠️ Systemic Risk Assessment</h3>
        <div className="risk-metrics">
          <div className="risk-metric">
            <div className="risk-label">Risk Score</div>
            <div className={`risk-score risk-${riskPrediction?.riskLevel?.toLowerCase()}`}>
              {((riskPrediction?.riskScore || 0) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="risk-metric">
            <div className="risk-label">Risk Level</div>
            <div className={`risk-level risk-${riskPrediction?.riskLevel?.toLowerCase()}`}>
              {riskPrediction?.riskLevel}
            </div>
          </div>
          <div className="risk-metric">
            <div className="risk-label">Nullification</div>
            <div className={`nullification-status ${riskPrediction?.needsNullification ? 'required' : 'not-required'}`}>
              {riskPrediction?.needsNullification ? 'REQUIRED' : 'NOT REQUIRED'}
            </div>
          </div>
        </div>
      </div>

      <div className="trade-recommendation">
        <h3 className="recommendation-title">💡 AI-Powered Trade Recommendation</h3>
        <div className="recommendation-content">
          <div className="recommendation-action">
            <span className="action-label">Recommended Action:</span>
            <span className="action-value">{recommendation?.action}</span>
          </div>
          {recommendation?.hedgeInstruments?.length > 0 && (
            <div className="hedge-instruments">
              <span className="hedge-label">Hedge with:</span>
              <span className="hedge-list">{recommendation.hedgeInstruments.join(', ')}</span>
            </div>
          )}
          <div className="recommendation-reasoning">
            <span className="reasoning-label">Reasoning:</span>
            <span className="reasoning-text">{recommendation?.reasoning}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RussellRotation;
