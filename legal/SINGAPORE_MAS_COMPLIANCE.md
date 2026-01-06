# Singapore MAS Compliance Documentation

**Document ID**: LEGAL-MAS-001  
**Classification**: LEGAL COMPLIANCE  
**Status**: ACTIVE  
**Date**: November 19, 2025  
**Jurisdiction**: Singapore  
**Regulatory Authority**: Monetary Authority of Singapore (MAS)

---

## Executive Summary

This document outlines the compliance framework for the Chais Protocol™ NFT Marketplace in alignment with Singapore's Payment Services Act (PSA) and related regulations administered by the Monetary Authority of Singapore (MAS).

## 1. Regulatory Framework

### 1.1 Payment Services Act (PSA)

The Payment Services Act 2019 regulates payment services and digital payment token (DPT) services in Singapore. The Chais Protocol™ NFT Marketplace complies with the following PSA requirements:

**Applicable Services Under PSA:**
- Digital Payment Token (DPT) Service (if facilitating exchange of NFTs for cryptocurrency)
- Money-Changing Service (if facilitating fiat-to-crypto conversions)

**Licensing Requirements:**
- Standard Payment Institution License (for transactions below SGD 5 million per month)
- Major Payment Institution License (for transactions exceeding SGD 5 million per month)

### 1.2 Anti-Money Laundering and Countering the Financing of Terrorism (AML/CFT)

**Regulatory Framework:**
- Notice PSN02 on Prevention of Money Laundering and Countering the Financing of Terrorism - Digital Payment Token Service
- Corruption, Drug Trafficking and Other Serious Crimes (Confiscation of Benefits) Act (CDSA)
- Terrorism (Suppression of Financing) Act (TSOFA)

## 2. Compliance Requirements

### 2.1 Customer Due Diligence (CDD)

**Standard CDD Measures:**
- Identification and verification of customer identity
- Understanding the nature and purpose of business relationship
- Ongoing monitoring of business relationship

**Enhanced Due Diligence (EDD) Required For:**
- High-risk customers or transactions
- Politically Exposed Persons (PEPs)
- Transactions involving high-risk jurisdictions
- Transactions exceeding SGD 20,000 or equivalent in cryptocurrency

**Simplified Due Diligence (SDD) May Apply For:**
- Low-risk customers identified through risk assessment
- Transactions below SGD 5,000 or equivalent in cryptocurrency

### 2.2 Transaction Monitoring

**Monitoring Requirements:**
- Real-time transaction screening against sanctions lists
- Detection of unusual or suspicious transaction patterns
- Threshold-based alerts for high-value transactions
- Cross-border transaction monitoring

**Transaction Thresholds:**
- Standard Monitoring: All transactions
- Enhanced Monitoring: Transactions ≥ SGD 20,000
- Immediate Reporting: Suspicious transactions (any amount)
- Record Keeping: All transactions ≥ SGD 5,000

### 2.3 Suspicious Transaction Reporting (STR)

**Reporting Obligations:**
- Report to Suspicious Transaction Reporting Office (STRO) within prescribed timeframe
- Do not tip-off the customer about the STR filing
- Maintain confidentiality of STR and related investigations

**Indicators of Suspicious Activity:**
- Structuring transactions to avoid reporting thresholds
- Transactions inconsistent with customer profile
- Use of multiple wallets to obscure transaction trails
- Rapid movement of funds without clear business purpose
- Transactions involving known high-risk jurisdictions

### 2.4 Record Keeping

**Minimum Retention Period: 5 years**

**Records to Maintain:**
- Customer identification documents
- Account files and business correspondence
- Transaction records (on-chain and off-chain)
- Risk assessment documentation
- AML/CFT training records
- STR filing records and supporting documentation

### 2.5 Technology Risk Management

**Requirements under Technology Risk Management Guidelines:**
- Robust cybersecurity measures
- Regular security assessments and penetration testing
- Incident response and recovery procedures
- Data protection and privacy controls
- Smart contract audit and verification

## 3. Chais Protocol™ Implementation

### 3.1 KYC/AML Integration

**Identity Verification:**
- Integration with MAS-approved KYC service providers
- Multi-tier verification system based on transaction limits
- Continuous identity monitoring and re-verification

**Verification Tiers:**
- **Tier 1** (Basic): Email verification, wallet address (limit: SGD 5,000)
- **Tier 2** (Standard): Government-issued ID, proof of address (limit: SGD 20,000)
- **Tier 3** (Enhanced): Video verification, source of funds (limit: Unlimited)

### 3.2 Smart Contract Compliance Features

**On-Chain Compliance:**
- Automated transaction screening
- Whitelist/blacklist management
- Transaction limits enforcement
- Cooling-off periods for high-value transactions
- Compliance metadata tracking

**Off-Chain Integration:**
- API integration with sanctions screening databases
- Risk scoring engine
- Automated suspicious activity detection
- Compliance reporting dashboard

### 3.3 Polygon Mumbai Testnet Implementation

**Testing Framework:**
- Comprehensive compliance testing on Mumbai testnet
- Simulation of various compliance scenarios
- Stress testing of transaction monitoring systems
- Integration testing with KYC/AML providers

**Test Scenarios:**
- Standard customer transactions
- High-value transaction processing
- Sanctioned address blocking
- Suspicious pattern detection
- Cross-border transaction handling

### 3.4 Mainnet Migration Readiness

**Pre-Migration Checklist:**
- [ ] MAS Payment Institution License obtained
- [ ] KYC/AML provider integration completed
- [ ] Smart contract security audit completed
- [ ] Compliance policies and procedures documented
- [ ] Staff AML/CFT training completed
- [ ] Technology Risk Management framework implemented
- [ ] Incident response plan established
- [ ] Insurance coverage obtained

## 4. Governance and Oversight

### 4.1 Compliance Officer

**Responsibilities:**
- Oversee AML/CFT compliance program
- Review and approve high-risk transactions
- Manage STR filing and regulatory reporting
- Conduct internal compliance audits
- Liaise with MAS and law enforcement

### 4.2 Board Oversight

**Board Responsibilities:**
- Approve AML/CFT policies and procedures
- Review compliance program effectiveness
- Ensure adequate resources for compliance
- Monitor key risk indicators
- Oversee senior management

### 4.3 Independent Audit

**Audit Requirements:**
- Annual independent AML/CFT audit
- Technology risk management audit
- Smart contract security audit
- Penetration testing (at least annually)

## 5. Training and Awareness

### 5.1 Staff Training

**Mandatory Training:**
- AML/CFT fundamentals
- Sanctions screening procedures
- Suspicious transaction identification
- Regulatory reporting requirements
- Technology and cybersecurity awareness

**Training Frequency:**
- Initial training for new employees
- Annual refresher training
- Ad-hoc training for regulatory updates

### 5.2 Customer Education

**Customer Awareness:**
- Clear communication of AML/CFT requirements
- Educational materials on compliance procedures
- Transparency about data collection and usage
- Guidance on completing verification process

## 6. Sanctions Compliance

### 6.1 Sanctions Screening

**Screening Databases:**
- United Nations Security Council Consolidated List
- Singapore's Terrorism (Suppression of Financing) Act lists
- OFAC (Office of Foreign Assets Control) lists
- EU sanctions lists
- Other relevant international sanctions lists

**Screening Frequency:**
- Real-time screening for all transactions
- Daily batch screening of existing customer database
- Immediate screening upon sanctions list updates

### 6.2 Blocked Addresses

**Management Procedures:**
- Maintain up-to-date blocked address list
- Automated blocking of sanctioned addresses
- Manual review and approval for any unblocking
- Documentation of all blocking decisions

## 7. Risk Assessment

### 7.1 Institutional Risk Assessment

**Annual Risk Assessment:**
- Assessment of inherent risks
- Evaluation of control effectiveness
- Identification of residual risks
- Development of risk mitigation strategies

**Risk Categories:**
- Customer risk
- Product/service risk
- Geographic risk
- Transaction/delivery channel risk

### 7.2 Customer Risk Assessment

**Risk Factors:**
- Customer type (individual, entity, PEP)
- Nature of business/occupation
- Transaction patterns and volume
- Geographic factors (residence, transaction origin)
- Source of funds

**Risk Ratings:**
- Low Risk: Standard monitoring
- Medium Risk: Enhanced monitoring
- High Risk: Enhanced due diligence required

## 8. Data Protection and Privacy

### 8.1 Personal Data Protection Act (PDPA)

**Compliance with PDPA:**
- Lawful collection and use of personal data
- Consent for data collection (where required)
- Accuracy and reasonable security arrangements
- Access and correction rights
- Data retention and disposal policies

### 8.2 Data Security

**Security Measures:**
- Encryption of personal data at rest and in transit
- Access controls and authentication
- Regular security assessments
- Data breach response procedures
- Third-party vendor management

## 9. Cross-Border Considerations

### 9.1 International Transactions

**Additional Requirements:**
- Enhanced due diligence for high-risk jurisdictions
- Verification of beneficiary information
- Compliance with correspondent jurisdiction requirements
- FATF (Financial Action Task Force) guidelines

### 9.2 Travel Rule Compliance

**FATF Travel Rule:**
- Collection of originator information
- Collection of beneficiary information
- Transmission of information to recipient institutions
- Implementation for virtual asset transfers ≥ USD/EUR 1,000

## 10. Reporting and Disclosure

### 10.1 Regulatory Reporting

**Periodic Reporting:**
- Monthly transaction reports to MAS (if required)
- Annual compliance reports
- Technology risk management reports
- Audit reports

### 10.2 Incident Reporting

**Reportable Incidents:**
- Material technology disruptions
- Cybersecurity incidents
- Data breaches
- Suspected fraud or money laundering
- Regulatory breaches

**Reporting Timeline:**
- Immediate notification for critical incidents
- Formal report within specified timeframe
- Follow-up reports as required

## 11. Continuous Improvement

### 11.1 Compliance Program Review

**Review Frequency:**
- Quarterly compliance metrics review
- Annual comprehensive program review
- Post-incident reviews
- Regulatory update assessments

### 11.2 Adaptation to Regulatory Changes

**Monitoring and Implementation:**
- Active monitoring of regulatory developments
- Impact assessment of regulatory changes
- Timely implementation of required changes
- Staff training on new requirements

## 12. Contact Information

### 12.1 Regulatory Authority

**Monetary Authority of Singapore (MAS)**
- Website: https://www.mas.gov.sg
- Address: 10 Shenton Way, MAS Building, Singapore 079117
- General Enquiries: 1800 2255 MAS (627)

### 12.2 Reporting Channels

**Suspicious Transaction Reporting Office (STRO)**
- Website: https://www.police.gov.sg/about-us/organisational-structure/specialist-staff-departments/commercial-affairs-department/aml-cft
- Email: suspicious_transactions@spf.gov.sg

**Commercial Affairs Department (CAD)**
- Website: https://www.police.gov.sg/Advisories/Crime/Commercial-Crimes
- Police Hotline: 1800-255-0000

## 13. Declaration

This compliance framework represents Chais Protocol™'s commitment to:
- Operating within Singapore's legal and regulatory framework
- Implementing robust AML/CFT controls
- Protecting the integrity of Singapore's financial system
- Ensuring customer protection and data privacy
- Maintaining the highest standards of corporate governance

**Status**: ACTIVE and subject to continuous review and improvement

**Last Updated**: November 19, 2025

**Next Review**: Quarterly or upon significant regulatory changes

---

**Document Classification**: LEGAL COMPLIANCE  
**Confidentiality**: Internal Use - Not for Public Distribution  
**Approval**: Board of Directors / Compliance Officer  
**Version**: 1.0.0

**ALLAHU AKBAR! 🕋**

*This document is part of the Chais Protocol™ legal and compliance framework.*
