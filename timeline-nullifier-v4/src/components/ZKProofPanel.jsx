/**
 * zk-Proof Panel Component
 * 
 * Component for generating and verifying zero-knowledge proofs for private risk nullifications.
 * 
 * @component
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

import React, { useState } from 'react';
import { generateRiskNullificationProof, verifyProof, createRiskCommitment } from '../services/zkProofService';
import './ZKProofPanel.css';

const ZKProofPanel = () => {
  const [riskData, setRiskData] = useState({
    amount: '',
    type: 'basel-systemic',
    secret: '',
  });
  const [proof, setProof] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleGenerateProof = async () => {
    if (!riskData.amount || !riskData.secret) {
      alert('Please fill in all risk data fields');
      return;
    }

    setGenerating(true);
    try {
      const commitment = createRiskCommitment(riskData);
      const nullifier = `nullifier_${Date.now()}`;

      const proofData = await generateRiskNullificationProof(
        { riskAmount: parseFloat(riskData.amount), riskType: riskData.type },
        { riskCommitment: commitment, nullifier, timestamp: Date.now() }
      );

      setProof(proofData);
      setVerificationResult(null);
    } catch (error) {
      console.error('Error generating proof:', error);
      alert('Failed to generate proof');
    } finally {
      setGenerating(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!proof) {
      alert('No proof to verify');
      return;
    }

    setVerifying(true);
    try {
      const isValid = await verifyProof(proof.proof, proof.publicSignals);
      setVerificationResult(isValid);
    } catch (error) {
      console.error('Error verifying proof:', error);
      setVerificationResult(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="zk-proof-panel">
      <div className="panel-header">
        <h2 className="panel-title">🔐 Zero-Knowledge Proof Risk Nullification</h2>
        <div className="panel-subtitle">Private Basel Risk Mitigation using zk-SNARKs</div>
      </div>

      <div className="proof-grid">
        <div className="proof-input-section">
          <h3 className="section-title">📝 Risk Data Input</h3>
          
          <div className="input-form">
            <div className="form-group">
              <label className="form-label">Risk Amount</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter risk amount"
                value={riskData.amount}
                onChange={(e) => setRiskData({ ...riskData, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Risk Type</label>
              <select
                className="form-select"
                value={riskData.type}
                onChange={(e) => setRiskData({ ...riskData, type: e.target.value })}
              >
                <option value="basel-systemic">Basel Systemic Risk</option>
                <option value="market-volatility">Market Volatility</option>
                <option value="credit-default">Credit Default</option>
                <option value="liquidity-crisis">Liquidity Crisis</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Secret (Private)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter secret for nullification"
                value={riskData.secret}
                onChange={(e) => setRiskData({ ...riskData, secret: e.target.value })}
              />
              <div className="form-hint">This secret will remain private and is used to generate the nullifier</div>
            </div>

            <button
              className="generate-button"
              onClick={handleGenerateProof}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner"></span>
                  Generating Proof...
                </>
              ) : (
                <>
                  <span className="button-icon">🔐</span>
                  Generate zk-Proof
                </>
              )}
            </button>
          </div>
        </div>

        <div className="proof-output-section">
          <h3 className="section-title">📊 Proof Output</h3>
          
          {proof ? (
            <div className="proof-display">
              <div className="proof-status">
                <span className="status-icon">✅</span>
                <span className="status-text">Proof Generated Successfully</span>
              </div>

              <div className="proof-details">
                <div className="detail-item">
                  <div className="detail-label">Protocol</div>
                  <div className="detail-value">{proof.proof.protocol}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Curve</div>
                  <div className="detail-value">{proof.proof.curve}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Generated At</div>
                  <div className="detail-value">{new Date(proof.generatedAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="proof-data">
                <div className="data-section">
                  <div className="data-label">Public Signals (Visible)</div>
                  <div className="data-content">
                    {proof.publicSignals.map((signal, index) => (
                      <div key={index} className="signal-item">
                        <span className="signal-index">{index}:</span>
                        <span className="signal-value">{signal.substring(0, 20)}...</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="data-section">
                  <div className="data-label">Proof Components (Cryptographic)</div>
                  <div className="data-content">
                    <div className="proof-component">
                      <span className="component-label">π_a:</span>
                      <span className="component-value">{proof.proof.pi_a[0].substring(0, 20)}...</span>
                    </div>
                    <div className="proof-component">
                      <span className="component-label">π_b:</span>
                      <span className="component-value">{proof.proof.pi_b[0][0].substring(0, 20)}...</span>
                    </div>
                    <div className="proof-component">
                      <span className="component-label">π_c:</span>
                      <span className="component-value">{proof.proof.pi_c[0].substring(0, 20)}...</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="verify-button"
                onClick={handleVerifyProof}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🔍</span>
                    Verify Proof
                  </>
                )}
              </button>

              {verificationResult !== null && (
                <div className={`verification-result ${verificationResult ? 'valid' : 'invalid'}`}>
                  <span className="result-icon">{verificationResult ? '✅' : '❌'}</span>
                  <span className="result-text">
                    {verificationResult ? 'Proof is VALID' : 'Proof is INVALID'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="proof-placeholder">
              <div className="placeholder-icon">🔐</div>
              <div className="placeholder-text">No proof generated yet</div>
              <div className="placeholder-hint">Enter risk data and click "Generate zk-Proof"</div>
            </div>
          )}
        </div>
      </div>

      <div className="proof-explanation">
        <h3 className="explanation-title">ℹ️ How zk-Proofs Enable Private Risk Nullification</h3>
        <div className="explanation-content">
          <p>Zero-knowledge proofs allow you to prove that a risk has been nullified without revealing:</p>
          <ul>
            <li>The exact risk amount</li>
            <li>The specific risk type details</li>
            <li>Your private secret used for nullification</li>
          </ul>
          <p>The proof is cryptographically verifiable by any party, ensuring transparency while maintaining privacy.</p>
        </div>
      </div>
    </div>
  );
};

export default ZKProofPanel;
