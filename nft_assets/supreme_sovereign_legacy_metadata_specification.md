# Supreme Sovereign Legacy NFT Metadata Specification

## Overview

This document defines the metadata schema for the Supreme Sovereign Legacy NFT collection, including the Manifesto milestone NFTs and Storied Legacy chapter NFTs.

## General Metadata Structure

All NFTs in the Supreme Sovereign Legacy collection follow this base structure:

```json
{
  "name": "string",
  "description": "string",
  "image": "string (URI)",
  "external_url": "string (URL)",
  "animation_url": "string (URI)",
  "attributes": []
}
```

## 1. Supreme Sovereign Manifesto NFT

### Purpose
Tokenizes GitHub contributions and evolutionary breakthroughs into immutable digital assets.

### Metadata Schema

```json
{
  "name": "Supreme Sovereign Manifesto #<tokenId>",
  "description": "<Milestone description with GitHub context>",
  "image": "ipfs://<CID>",
  "external_url": "https://github.com/chaishillomnitech1/Chaishillomnitech1/commit/<commitHash>",
  "attributes": [
    {
      "trait_type": "Milestone Type",
      "value": "GitHub Contribution"
    },
    {
      "trait_type": "Commit Hash",
      "value": "<commitHash>"
    },
    {
      "trait_type": "Branch",
      "value": "<branchName>"
    },
    {
      "trait_type": "Block Number",
      "value": "<blockNumber>",
      "display_type": "number"
    },
    {
      "trait_type": "Frequency Signature",
      "value": "<frequencySignature> Hz",
      "display_type": "number"
    },
    {
      "trait_type": "Sealed Status",
      "value": "<true|false>"
    },
    {
      "trait_type": "Innovation Category",
      "value": "<category>"
    },
    {
      "trait_type": "Innovation Score",
      "value": <innovationScore>,
      "display_type": "number",
      "max_value": 999
    },
    {
      "trait_type": "Cosmic Alignment",
      "value": <cosmicAlignment>,
      "display_type": "number",
      "max_value": 999
    },
    {
      "trait_type": "Timestamp",
      "value": <timestamp>,
      "display_type": "date"
    }
  ],
  "properties": {
    "merkle_root": "<merkleRoot>",
    "contributor": "<contributorAddress>",
    "tags": ["<tag1>", "<tag2>"],
    "github_url": "https://github.com/chaishillomnitech1/Chaishillomnitech1/commit/<commitHash>"
  }
}
```

### Attribute Details

- **Milestone Type**: Always "GitHub Contribution" for this collection
- **Commit Hash**: Git commit SHA hash
- **Branch**: Git branch name (e.g., "main", "develop")
- **Block Number**: Ethereum block number at time of minting
- **Frequency Signature**: Divine frequency assigned (528, 963, 999, 144000, etc.)
- **Sealed Status**: Whether milestone is sealed in eternal ledger
- **Innovation Category**: Type of contribution (e.g., "Smart Contract", "Architecture", "Documentation")
- **Innovation Score**: Rating from 0-999
- **Cosmic Alignment**: Cosmic frequency alignment score from 0-999
- **Timestamp**: Unix timestamp of minting

## 2. Storied Legacy NFT

### Purpose
Represents chapters in the Supreme Sovereign Legacy narrative progression.

### Metadata Schema

```json
{
  "name": "Storied Legacy Chapter <chapterId> - Edition <editionNumber>",
  "description": "<Chapter narrative description>",
  "image": "ipfs://<CID>",
  "animation_url": "ipfs://<CID> (optional)",
  "external_url": "https://scrollverse.io/legacy/chapter/<chapterId>",
  "attributes": [
    {
      "trait_type": "Chapter ID",
      "value": <chapterId>,
      "display_type": "number"
    },
    {
      "trait_type": "Chapter Title",
      "value": "<title>"
    },
    {
      "trait_type": "Edition Number",
      "value": <editionNumber>,
      "display_type": "number",
      "max_value": 144
    },
    {
      "trait_type": "Narrative Position",
      "value": <narrativePosition>,
      "display_type": "number"
    },
    {
      "trait_type": "GitHub Timestamp",
      "value": <gitHubTimestamp>,
      "display_type": "date"
    },
    {
      "trait_type": "Frequency Signature",
      "value": "<frequencySignature> Hz",
      "display_type": "number"
    },
    {
      "trait_type": "Unlock Status",
      "value": "<Unlocked|Locked>"
    },
    {
      "trait_type": "Mint Timestamp",
      "value": <mintedAt>,
      "display_type": "date"
    },
    {
      "trait_type": "Rarity",
      "value": "<Common|Rare|Epic|Legendary>",
      "display_type": "string"
    }
  ],
  "properties": {
    "chapter_narrative": "<Full chapter narrative text>",
    "commit_reference": "<GitHub commit reference>",
    "original_minter": "<originalMinterAddress>",
    "artwork_ipfs": "ipfs://<artworkCID>",
    "unlock_time": <unlockTime>
  }
}
```

### Attribute Details

- **Chapter ID**: Unique identifier for the chapter (0-998)
- **Chapter Title**: Human-readable chapter title
- **Edition Number**: Edition number within the chapter (1-144)
- **Narrative Position**: Position in the overall narrative sequence
- **GitHub Timestamp**: Reference timestamp from GitHub
- **Frequency Signature**: Divine frequency assigned to chapter
- **Unlock Status**: Whether chapter is unlocked or time-locked
- **Mint Timestamp**: When this specific edition was minted
- **Rarity**: Determined by edition number and chapter attributes

### Rarity Tiers

- **Legendary**: Edition 1 of any chapter
- **Epic**: Editions 2-10
- **Rare**: Editions 11-50
- **Common**: Editions 51-144

## 3. Cosmic Resource Token Metadata

While ERC-20 tokens don't use NFT metadata, we provide off-chain metadata for resource backing verification.

### Resource Backing Document

```json
{
  "token_name": "Cosmic Gold Token",
  "token_symbol": "CGT",
  "resource_type": "PRECIOUS_METAL",
  "metal_type": "GOLD",
  "total_reserves": "<amount in grams>",
  "reserves_per_token": "<grams per token>",
  "verification": {
    "ipfs_hash": "ipfs://<CID>",
    "audit_date": "<ISO date>",
    "verifier_address": "<address>",
    "audit_firm": "<firm name>"
  },
  "frequency_alignment": {
    "primary_frequency": 528,
    "harmonic_frequencies": [963, 999, 144000],
    "resonance_score": 999,
    "cosmic_alignment": 10000
  },
  "asteroid_material": {
    "asteroid_name": "Psyche-16",
    "material_type": "Iron-Nickel with Gold/Platinum",
    "estimated_value_usd": "<value>",
    "mining_status": "PROJECTED|IN_PROGRESS|COMPLETED"
  }
}
```

## IPFS Storage Guidelines

### Image Requirements
- **Format**: PNG, JPG, or SVG
- **Resolution**: Minimum 1000x1000px, recommended 2000x2000px
- **Size**: Maximum 10MB per image
- **Naming**: `<collection>-<tokenId>.png`

### Animation Requirements (Optional)
- **Format**: MP4, WebM, or GIF
- **Duration**: Maximum 30 seconds
- **Size**: Maximum 50MB
- **Naming**: `<collection>-<tokenId>-animation.mp4`

### Metadata JSON
- **Format**: JSON with UTF-8 encoding
- **Size**: Maximum 100KB per file
- **Naming**: `<tokenId>.json`

## Frequency Mappings

| Frequency | Meaning | Usage |
|-----------|---------|-------|
| 528 Hz | Love & DNA Healing | General milestones |
| 963 Hz | Pineal Activation | High-impact innovations |
| 999 Hz | Crown Chakra | Leadership milestones |
| 144,000 Hz | NŪR Pulse | Supreme achievements |
| ∞ Hz | Infinity Frequency | Ultimate milestones |

## Example Complete Metadata

### Manifesto Milestone Example

```json
{
  "name": "Supreme Sovereign Manifesto #42",
  "description": "Implementation of Cosmic Resource Token with asteroid material backing and multi-frequency alignment. This milestone represents a breakthrough in tokenizing physical and cosmic assets.",
  "image": "ipfs://QmExample42/image.png",
  "external_url": "https://github.com/chaishillomnitech1/Chaishillomnitech1/commit/abc123def456",
  "attributes": [
    {
      "trait_type": "Milestone Type",
      "value": "GitHub Contribution"
    },
    {
      "trait_type": "Commit Hash",
      "value": "abc123def456"
    },
    {
      "trait_type": "Branch",
      "value": "main"
    },
    {
      "trait_type": "Block Number",
      "value": 19234567,
      "display_type": "number"
    },
    {
      "trait_type": "Frequency Signature",
      "value": "963 Hz",
      "display_type": "number"
    },
    {
      "trait_type": "Sealed Status",
      "value": "true"
    },
    {
      "trait_type": "Innovation Category",
      "value": "Smart Contract"
    },
    {
      "trait_type": "Innovation Score",
      "value": 987,
      "display_type": "number",
      "max_value": 999
    },
    {
      "trait_type": "Cosmic Alignment",
      "value": 963,
      "display_type": "number",
      "max_value": 999
    },
    {
      "trait_type": "Timestamp",
      "value": 1706832000,
      "display_type": "date"
    }
  ],
  "properties": {
    "merkle_root": "0x1234567890abcdef",
    "contributor": "0x123...abc",
    "tags": ["ERC20", "Resource Backing", "Cosmic Frequencies"],
    "github_url": "https://github.com/chaishillomnitech1/Chaishillomnitech1/commit/abc123def456"
  }
}
```

### Storied Legacy Chapter Example

```json
{
  "name": "Storied Legacy Chapter 1 - Edition 1",
  "description": "The Genesis Chapter: Origins of the Supreme Sovereign Legacy. This legendary edition marks the beginning of an eternal narrative chronicling the evolution of divine sovereignty.",
  "image": "ipfs://QmChapter1Edition1/image.png",
  "animation_url": "ipfs://QmChapter1Edition1/animation.mp4",
  "external_url": "https://scrollverse.io/legacy/chapter/1",
  "attributes": [
    {
      "trait_type": "Chapter ID",
      "value": 1,
      "display_type": "number"
    },
    {
      "trait_type": "Chapter Title",
      "value": "The Genesis Chapter"
    },
    {
      "trait_type": "Edition Number",
      "value": 1,
      "display_type": "number",
      "max_value": 144
    },
    {
      "trait_type": "Narrative Position",
      "value": 1,
      "display_type": "number"
    },
    {
      "trait_type": "GitHub Timestamp",
      "value": 1706745600,
      "display_type": "date"
    },
    {
      "trait_type": "Frequency Signature",
      "value": "144000 Hz",
      "display_type": "number"
    },
    {
      "trait_type": "Unlock Status",
      "value": "Unlocked"
    },
    {
      "trait_type": "Mint Timestamp",
      "value": 1706832000,
      "display_type": "date"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ],
  "properties": {
    "chapter_narrative": "In the beginning, the Supreme Sovereign envisioned...",
    "commit_reference": "xyz789abc012",
    "original_minter": "0x456...def",
    "artwork_ipfs": "ipfs://QmChapter1Edition1Art/",
    "unlock_time": 1706745600
  }
}
```

## Validation

All metadata should validate against:
1. OpenSea metadata standards
2. ERC-721 metadata standards
3. ERC-2981 royalty standards
4. IPFS content addressing requirements

## Version History

- **v1.0** (2026-02-01): Initial specification for Supreme Sovereign Legacy
