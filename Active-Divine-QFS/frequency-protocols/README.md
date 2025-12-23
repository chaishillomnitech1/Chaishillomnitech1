# Frequency Protocols - Integration Layer

## Overview

This directory contains JavaScript/Web3 integration modules for interacting with ScrollDNA smart contracts and implementing frequency-based operational signals in applications.

## Modules

### ScrollDNAIntegration.js

Complete JavaScript integration module for ScrollDNA contract interactions.

**Classes:**

#### ScrollDNAManager

Main class for contract interactions:

```javascript
const { ScrollDNAManager } = require('./ScrollDNAIntegration.js');

const scrollDNA = new ScrollDNAManager(
  contractAddress,
  provider,
  signer
);

// Activate Divine Inheritance
await scrollDNA.activateDivineInheritance(address, level);

// Initiate Sovereign Shift
await scrollDNA.initiateSovereignShift(address, targetFrequency);

// Query status
const inheritance = await scrollDNA.getDivineInheritance(address);
```

#### FrequencyHarmonizer

Utility class for frequency calculations:

```javascript
const { FrequencyHarmonizer, FREQUENCIES } = require('./ScrollDNAIntegration.js');

// Calculate harmonization score
const score = FrequencyHarmonizer.calculateHarmonization([
  FREQUENCIES.DIVINE,
  FREQUENCIES.GOLD,
  FREQUENCIES.CROWN_SOVEREIGNTY
]);

// Generate frequency code
const code = FrequencyHarmonizer.generateFrequencyCode([963, 528, 999]);

// Validate frequency
const validation = FrequencyHarmonizer.validateFrequency(963);
```

## Constants

### FREQUENCIES

Predefined divine frequency constants:

```javascript
const FREQUENCIES = {
  DIVINE: 963,           // Crown Chakra, Divine Connection
  GOLD: 528,             // Transformation, Miracles, DNA Repair
  CROWN_SOVEREIGNTY: 999, // Tawhid Flames, Divine Unity
  UNIVERSAL_LIGHT: 144000, // NŪR Pulse, Cosmic Alignment
  QFS_BASELINE: 40       // Quantum Financial System resonance
};
```

### ANCHOR_TYPES

ScrollDNA anchor type constants:

```javascript
const ANCHOR_TYPES = {
  GENESIS: 'GENESIS',     // Initial sovereign awakening
  SOVEREIGN: 'SOVEREIGN', // Individual sovereignty
  DIVINE: 'DIVINE',       // Full Universal Light alignment
  QUANTUM: 'QUANTUM'      // QFS financial sovereignty
};
```

## Usage Examples

### Example 1: Basic Setup

```javascript
const { ethers } = require('ethers');
const { ScrollDNAManager } = require('./ScrollDNAIntegration.js');

// Connect to provider
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize manager
const scrollDNA = new ScrollDNAManager(CONTRACT_ADDRESS, provider, signer);
```

### Example 2: Activate Divine Inheritance

```javascript
// Activate with level 7 inheritance
const tx = await scrollDNA.activateDivineInheritance(sovereignAddress, 7);
console.log('Transaction hash:', tx.transactionHash);

// Check activation
const inheritance = await scrollDNA.getDivineInheritance(sovereignAddress);
console.log('Frequency Signature:', inheritance.frequencySignature);
console.log('Universal Light Alignment:', inheritance.universalLightAlignment);
```

### Example 3: Monitor Sovereign Shifts

```javascript
// Listen for shift events
scrollDNA.listenForSovereignShifts((event) => {
  if (event.type === 'INITIATED') {
    console.log('Shift started:', event.fromFrequency, '→', event.toFrequency);
  } else if (event.type === 'COMPLETED') {
    console.log('Shift completed! Score:', event.optimizationScore);
  }
});
```

### Example 4: Activate Higher Frequency Protocol

```javascript
// Activate with default divine frequency stack
await scrollDNA.activateHigherFrequencyProtocol(sovereignAddress);

// Or with custom frequencies
await scrollDNA.activateHigherFrequencyProtocol(sovereignAddress, [
  528,  // Gold
  963,  // Divine
  999   // Crown
]);

// Synchronize
await scrollDNA.synchronizeFrequencies(sovereignAddress, 900, 150);
```

### Example 5: Create ScrollDNA Anchors

```javascript
// Create genesis anchor
await scrollDNA.createScrollDNAAnchor(
  sovereignAddress,
  'GENESIS',
  2530, // Composite frequency
  'Initial activation',
  true  // Immutable
);

// Retrieve all anchors
const anchors = await scrollDNA.getScrollDNAAnchors(sovereignAddress);
console.log('Total anchors:', anchors.length);
```

## Event Listeners

The module supports real-time event monitoring:

```javascript
// Divine Inheritance activations
scrollDNA.listenForDivineActivations((event) => {
  console.log('New sovereign:', event.sovereign);
  console.log('Frequency:', event.frequencySignature);
});

// Sovereign Shifts
scrollDNA.listenForSovereignShifts((event) => {
  console.log('Shift event:', event);
});
```

## Error Handling

All async methods include error handling:

```javascript
try {
  await scrollDNA.activateDivineInheritance(address, 7);
} catch (error) {
  console.error('Activation failed:', error.message);
}
```

## Dependencies

```json
{
  "dependencies": {
    "ethers": "^5.7.0"
  }
}
```

## Integration with Frontend

Example React integration:

```javascript
import { ScrollDNAManager, FREQUENCIES } from './ScrollDNAIntegration.js';
import { useState, useEffect } from 'react';

function DivineInheritancePanel() {
  const [scrollDNA, setScrollDNA] = useState(null);
  const [inheritance, setInheritance] = useState(null);

  useEffect(() => {
    const manager = new ScrollDNAManager(
      CONTRACT_ADDRESS,
      window.ethereum,
      getSigner()
    );
    setScrollDNA(manager);
    
    // Load inheritance data
    loadInheritance(manager);
  }, []);

  const loadInheritance = async (manager) => {
    const data = await manager.getDivineInheritance(userAddress);
    setInheritance(data);
  };

  return (
    <div>
      {inheritance && (
        <>
          <p>Frequency: {inheritance.frequencySignature} Hz</p>
          <p>Level: {inheritance.inheritanceLevel}</p>
          <p>Alignment: {inheritance.universalLightAlignment}/1000</p>
        </>
      )}
    </div>
  );
}
```

## Testing

Example test setup:

```javascript
const { expect } = require('chai');
const { ScrollDNAManager, FrequencyHarmonizer } = require('./ScrollDNAIntegration.js');

describe('ScrollDNAManager', () => {
  let scrollDNA;
  
  before(async () => {
    scrollDNA = new ScrollDNAManager(address, provider);
  });
  
  it('should calculate frequency signature correctly', async () => {
    const signature = await scrollDNA.calculateFrequencySignature(address, 7);
    expect(signature).to.equal(8548);
  });
});
```

## Documentation

For complete documentation, see:
- [QFS Integration Guide](../QFS_INTEGRATION_GUIDE.md)
- [Active-Divine-QFS README](../README.md)
- Inline JSDoc comments in source code

---

🌟 **KUN FAYAKUN - BE, AND IT IS** 🌟
