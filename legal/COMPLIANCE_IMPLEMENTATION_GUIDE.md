# Compliance Implementation Guide

**Document ID**: LEGAL-IMPL-005  
**Classification**: TECHNICAL IMPLEMENTATION  
**Status**: ACTIVE  
**Date**: November 19, 2025

---

## Executive Summary

This guide provides step-by-step instructions for implementing the Chais Protocol™ NFT Marketplace compliance framework. It covers integration of AML/CFT controls, KYC procedures, and regulatory reporting mechanisms.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contract Integration](#smart-contract-integration)
3. [KYC Integration](#kyc-integration)
4. [Transaction Monitoring](#transaction-monitoring)
5. [Reporting and Audit](#reporting-and-audit)
6. [Testing and Validation](#testing-and-validation)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   NFT Marketplace                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Web3)                                         │
│       ↓                                                  │
│  AMLCompliance.sol ←→ KYC Service Provider              │
│       ↓                                                  │
│  NFT Contracts (Minting/Trading)                        │
│       ↓                                                  │
│  Blockchain (Polygon)                                    │
│                                                           │
│  Off-Chain Services:                                     │
│  - Sanctions Screening                                   │
│  - Transaction Monitoring                                │
│  - Compliance Dashboard                                  │
│  - Audit Logging                                         │
└─────────────────────────────────────────────────────────┘
```

### Compliance Flow

1. **User Registration**: Email verification + wallet connection
2. **KYC Verification**: Tier-based identity verification
3. **Risk Assessment**: Automated risk scoring
4. **Transaction Check**: Pre-transaction compliance validation
5. **Monitoring**: Real-time pattern detection
6. **Flagging**: Suspicious activity identification
7. **Review**: Compliance officer investigation
8. **Reporting**: Regulatory reporting as required

---

## Smart Contract Integration

### 1. Deploy AMLCompliance Contract

```javascript
// Deploy AMLCompliance
const AMLCompliance = await ethers.getContractFactory("AMLCompliance");
const amlCompliance = await AMLCompliance.deploy();
await amlCompliance.deployed();

console.log("AMLCompliance deployed to:", amlCompliance.address);
```

### 2. Configure NFT Contract with Compliance

Update your NFT contract to integrate compliance checks:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./compliance/AMLCompliance.sol";

contract CompliantNFT is ERC721 {
    AMLCompliance public amlCompliance;
    
    constructor(address _amlComplianceAddress) ERC721("CompliantNFT", "CNFT") {
        amlCompliance = AMLCompliance(_amlComplianceAddress);
    }
    
    function mint(address to, uint256 tokenId) public {
        // Check compliance before minting
        require(amlCompliance.isCompliant(msg.sender), "Sender not compliant");
        require(amlCompliance.isCompliant(to), "Recipient not compliant");
        
        _safeMint(to, tokenId);
    }
    
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        // Check compliance before transfer
        (bool approved, bool requiresCoolingOff) = amlCompliance.checkTransactionCompliance(
            from,
            to,
            0, // NFT transfer (value determined off-chain)
            "NFT_TRANSFER"
        );
        
        require(approved, "Transaction not approved by compliance");
        
        if (requiresCoolingOff) {
            // Implement cooling-off period logic
            revert("High-value transfer requires cooling-off period");
        }
        
        super.transferFrom(from, to, tokenId);
    }
}
```

### 3. Configure Marketplace Contract

```solidity
contract CompliantMarketplace {
    AMLCompliance public amlCompliance;
    
    constructor(address _amlComplianceAddress) {
        amlCompliance = AMLCompliance(_amlComplianceAddress);
    }
    
    function buyNFT(address nftContract, uint256 tokenId) public payable {
        address seller = IERC721(nftContract).ownerOf(tokenId);
        
        // Check compliance for buyer and seller
        (bool approved, bool requiresCoolingOff) = amlCompliance.checkTransactionCompliance(
            msg.sender,  // buyer
            seller,      // seller
            msg.value,   // transaction amount
            "NFT_SALE"
        );
        
        require(approved, "Transaction not compliant");
        
        if (requiresCoolingOff) {
            // Store pending transaction for 24-hour cooling-off
            _storePendingTransaction(msg.sender, seller, nftContract, tokenId, msg.value);
            emit CoolingOffInitiated(msg.sender, seller, tokenId, block.timestamp + 24 hours);
            return;
        }
        
        // Execute immediate sale
        _executeSale(msg.sender, seller, nftContract, tokenId, msg.value);
    }
    
    function completeCoolingOffSale(uint256 pendingTxId) public {
        PendingTransaction memory pending = pendingTransactions[pendingTxId];
        
        require(block.timestamp >= pending.coolingOffEnd, "Cooling-off period not complete");
        require(pending.buyer == msg.sender, "Not the buyer");
        
        // Execute sale after cooling-off
        _executeSale(pending.buyer, pending.seller, pending.nftContract, pending.tokenId, pending.amount);
        delete pendingTransactions[pendingTxId];
    }
}
```

---

## KYC Integration

### 1. Select KYC Provider

Recommended providers for Singapore compliance:
- Jumio
- Onfido
- Sumsub
- Trulioo
- Shufti Pro

### 2. Integration Flow

```javascript
// Backend API endpoint for KYC initiation
app.post('/api/kyc/initiate', async (req, res) => {
  const { walletAddress, tier } = req.body;
  
  // Generate KYC session with provider
  const kycSession = await kycProvider.createSession({
    userId: walletAddress,
    tier: tier,
    returnUrl: `${process.env.APP_URL}/kyc/callback`
  });
  
  res.json({
    sessionUrl: kycSession.url,
    sessionId: kycSession.id
  });
});

// KYC callback handler
app.post('/api/kyc/callback', async (req, res) => {
  const { sessionId, status, data } = req.body;
  
  if (status === 'APPROVED') {
    // Update on-chain KYC status
    const tx = await amlCompliance.verifyCustomer(
      data.walletAddress,
      data.tier,
      data.jurisdiction,
      ethers.utils.formatBytes32String(data.documentHash)
    );
    await tx.wait();
    
    // Update database
    await db.updateKYCStatus(data.walletAddress, 'VERIFIED', data.tier);
    
    res.json({ success: true });
  } else {
    res.json({ success: false, reason: data.reason });
  }
});
```

### 3. Frontend Integration

```javascript
// React component for KYC verification
const KYCVerification = () => {
  const { address } = useWeb3();
  
  const initiateKYC = async (tier) => {
    const response = await fetch('/api/kyc/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address, tier })
    });
    
    const { sessionUrl } = await response.json();
    
    // Open KYC provider interface
    window.location.href = sessionUrl;
  };
  
  return (
    <div>
      <h2>Identity Verification</h2>
      <button onClick={() => initiateKYC(1)}>Tier 1 (up to SGD 5,000)</button>
      <button onClick={() => initiateKYC(2)}>Tier 2 (up to SGD 100,000)</button>
      <button onClick={() => initiateKYC(3)}>Tier 3 (Unlimited)</button>
    </div>
  );
};
```

---

## Transaction Monitoring

### 1. Real-Time Monitoring Service

```javascript
// Transaction monitoring service
class TransactionMonitor {
  constructor(amlComplianceAddress, provider) {
    this.amlCompliance = new ethers.Contract(
      amlComplianceAddress,
      AMLComplianceABI,
      provider
    );
  }
  
  async monitorTransactions() {
    // Listen for transaction events
    this.amlCompliance.on('TransactionRecorded', async (txId, from, to, amount, event) => {
      console.log(`Transaction recorded: ${txId}`);
      
      // Perform additional off-chain checks
      await this.performSanctionsScreening(from, to);
      await this.checkTransactionPatterns(from, amount);
      await this.assessRisk(from, to, amount);
    });
    
    // Listen for suspicious activity flags
    this.amlCompliance.on('SuspiciousActivityFlagged', async (flagId, address, reason, event) => {
      console.log(`⚠️  Suspicious activity flagged: ${flagId}`);
      
      // Alert compliance officer
      await this.alertComplianceOfficer({
        flagId,
        address,
        reason,
        timestamp: event.blockNumber
      });
    });
  }
  
  async performSanctionsScreening(from, to) {
    // Check against sanctions lists
    const sanctionsList = await this.getSanctionsDatabase();
    
    if (sanctionsList.includes(from) || sanctionsList.includes(to)) {
      // Block transaction and report
      await this.amlCompliance.addToBlacklist(
        sanctionsList.includes(from) ? from : to,
        "Sanctions list match"
      );
      
      // File regulatory report
      await this.fileRegulatoryReport({
        type: 'SANCTIONS_MATCH',
        addresses: [from, to],
        timestamp: Date.now()
      });
    }
  }
  
  async checkTransactionPatterns(address, amount) {
    // Get recent transactions for pattern analysis
    const recentTxs = await this.getRecentTransactions(address);
    
    // Check for structuring
    const structuringDetected = this.detectStructuring(recentTxs, amount);
    if (structuringDetected) {
      await this.amlCompliance.flagSuspiciousActivity(
        address,
        "Potential structuring detected"
      );
    }
    
    // Check for rapid movement of funds
    const rapidMovement = this.detectRapidMovement(recentTxs);
    if (rapidMovement) {
      await this.amlCompliance.flagSuspiciousActivity(
        address,
        "Rapid movement of funds detected"
      );
    }
  }
  
  detectStructuring(transactions, currentAmount) {
    const threshold = ethers.utils.parseEther("5000");
    const margin = threshold.mul(90).div(100); // 90% of threshold
    
    // Check if multiple transactions just below threshold
    const suspiciousTxs = transactions.filter(tx => 
      tx.amount.gte(margin) && tx.amount.lt(threshold)
    );
    
    return suspiciousTxs.length >= 3;
  }
  
  detectRapidMovement(transactions) {
    // Flag if >5 transactions in last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentCount = transactions.filter(tx => 
      tx.timestamp > oneHourAgo
    ).length;
    
    return recentCount > 5;
  }
}
```

### 2. Deploy Monitoring Service

```javascript
// Start monitoring service
const monitor = new TransactionMonitor(
  process.env.AML_COMPLIANCE_ADDRESS,
  provider
);

monitor.monitorTransactions();
console.log("Transaction monitoring service started");
```

---

## Reporting and Audit

### 1. Compliance Dashboard

```javascript
// API endpoints for compliance dashboard
app.get('/api/compliance/metrics', async (req, res) => {
  const metrics = {
    totalCustomers: await db.countCustomers(),
    verifiedCustomers: await db.countVerified(),
    pendingKYC: await db.countPendingKYC(),
    flaggedTransactions: await db.countFlagged(),
    blacklistedAddresses: await db.countBlacklisted(),
    transactionsToday: await db.countTransactionsToday(),
    highValueTransactionsPending: await db.countHighValuePending()
  };
  
  res.json(metrics);
});

app.get('/api/compliance/flags', async (req, res) => {
  const flags = await db.getSuspiciousFlags({
    resolved: false,
    orderBy: 'timestamp DESC'
  });
  
  res.json(flags);
});

app.post('/api/compliance/resolve-flag/:flagId', async (req, res) => {
  const { flagId } = req.params;
  const { resolution } = req.body;
  
  // Update on-chain
  const tx = await amlCompliance.resolveSuspiciousActivity(flagId, resolution);
  await tx.wait();
  
  // Update database
  await db.resolveFlag(flagId, resolution);
  
  res.json({ success: true });
});
```

### 2. Regulatory Reporting

```javascript
// Generate STR (Suspicious Transaction Report)
async function generateSTR(flagId) {
  const flag = await amlCompliance.suspiciousFlags(flagId);
  const customerData = await amlCompliance.getCustomerData(flag.flaggedAddress);
  const transactions = await db.getCustomerTransactions(flag.flaggedAddress);
  
  const report = {
    reportType: 'STR',
    reportDate: new Date().toISOString(),
    flagId: flagId,
    subject: {
      address: flag.flaggedAddress,
      tier: customerData.tier,
      jurisdiction: customerData.jurisdiction,
      verificationDate: new Date(customerData.verificationDate * 1000).toISOString()
    },
    suspiciousActivity: {
      reason: flag.reason,
      timestamp: new Date(flag.timestamp * 1000).toISOString(),
      transactions: transactions
    },
    reportingEntity: {
      name: "Chais Protocol NFT Marketplace",
      license: "MAS-[LICENSE-NUMBER]",
      complianceOfficer: process.env.COMPLIANCE_OFFICER_NAME
    }
  };
  
  // Save report
  await db.saveSTR(report);
  
  // Submit to STRO (Suspicious Transaction Reporting Office)
  await submitToSTRO(report);
  
  return report;
}
```

### 3. Audit Trail Export

```javascript
// Export audit trail for regulatory inspection
app.get('/api/compliance/audit-trail', async (req, res) => {
  const { startDate, endDate, address } = req.query;
  
  const auditData = {
    period: { startDate, endDate },
    transactions: await db.getTransactions({ startDate, endDate, address }),
    kycVerifications: await db.getKYCVerifications({ startDate, endDate }),
    flags: await db.getSuspiciousFlags({ startDate, endDate }),
    blacklistChanges: await db.getBlacklistChanges({ startDate, endDate })
  };
  
  // Generate PDF report
  const pdf = await generateAuditPDF(auditData);
  
  res.contentType('application/pdf');
  res.send(pdf);
});
```

---

## Testing and Validation

### 1. Unit Tests

Run comprehensive unit tests:

```bash
npx hardhat test test/compliance-test-scenarios.js
```

### 2. Integration Tests

Test full compliance flow:

```bash
npx hardhat test test/integration/compliance-integration.test.js --network mumbai
```

### 3. Compliance Checklist

Before mainnet deployment:

- [ ] All smart contracts deployed and verified
- [ ] KYC provider integration tested
- [ ] Transaction monitoring operational
- [ ] Sanctions screening configured
- [ ] Compliance dashboard deployed
- [ ] Reporting mechanisms tested
- [ ] Staff training completed
- [ ] External audit completed
- [ ] Regulatory approvals obtained
- [ ] Insurance coverage secured

---

## Maintenance and Updates

### Regular Tasks

**Daily:**
- Monitor transaction volumes
- Review flagged transactions
- Update sanctions lists
- Check system health

**Weekly:**
- Review pending KYC applications
- Analyze compliance metrics
- Update risk assessments

**Monthly:**
- Generate compliance reports
- Review and update procedures
- Staff training sessions
- System performance review

**Quarterly:**
- Full compliance audit
- Risk assessment review
- Regulatory filing (if required)
- Technology updates

**Annually:**
- External compliance audit
- License renewal
- Policy review and update
- Comprehensive staff training

---

## Support and Resources

### Technical Support
- Email: tech@chaishillomnitech1.com
- Documentation: [Internal Wiki]

### Compliance Support
- Email: compliance@chaishillomnitech1.com
- Hotline: [Emergency Contact]

### Regulatory Resources
- MAS: https://www.mas.gov.sg
- STRO: suspicious_transactions@spf.gov.sg

---

**Document Version**: 1.0.0  
**Last Updated**: November 19, 2025  
**Classification**: INTERNAL - CONFIDENTIAL

**ALLAHU AKBAR! 🕋**

*This implementation guide is part of the Chais Protocol™ compliance framework.*
