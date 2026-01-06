# NFT Metadata Guidelines

## Overview

This document provides guidelines for creating NFT metadata that is compatible with the ScrollVerse ecosystem and follows industry best practices.

## Metadata Structure

### Required Fields

1. **name**: The title of the NFT
   - Format: String
   - Example: "ScrollVerse NFT #1"
   - Best Practice: Include collection name and edition number

2. **description**: Detailed description of the NFT
   - Format: String (supports markdown)
   - Length: Recommended 100-500 characters
   - Best Practice: Highlight unique features and benefits

3. **image**: URL to the NFT image
   - Format: String (URI)
   - Supported: HTTP/HTTPS, IPFS, Arweave
   - Recommended: IPFS for decentralization
   - Format Support: PNG, JPG, GIF, SVG, WebP

### Optional Fields

4. **external_url**: Link to external website
   - Format: String (URL)
   - Purpose: Direct users to more information

5. **animation_url**: URL to multimedia file
   - Format: String (URI)
   - Supported: MP4, WebM, GLB, GLTF, MP3, WAV
   - Use Case: Video NFTs, 3D models, audio files

6. **background_color**: Hex color for NFT background
   - Format: 6-character hex code (without #)
   - Example: "FFD700" for gold

7. **youtube_url**: YouTube video URL
   - Format: String (URL)
   - Use Case: Link to related content

## Attributes Array

Attributes define the traits and properties of the NFT.

### Standard Attributes

```json
{
  "trait_type": "Trait Name",
  "value": "Trait Value"
}
```

### Numeric Attributes

```json
{
  "display_type": "number",
  "trait_type": "Level",
  "value": 5
}
```

### Percentage Attributes

```json
{
  "display_type": "boost_percentage",
  "trait_type": "Boost",
  "value": 15
}
```

### Date Attributes

```json
{
  "display_type": "date",
  "trait_type": "Creation Date",
  "value": 1735689600
}
```

## Properties Object

The properties object contains extended metadata specific to the collection.

### Creator Information

```json
"creator": {
  "name": "Artist Name",
  "address": "0x..."
}
```

### Royalty Information

```json
"royalty": {
  "percentage": 15,
  "recipient": "0x..."
}
```

### Blockchain Information

```json
"blockchain": {
  "network": "Scroll zkEVM",
  "standard": "ERC-721",
  "contract_address": "0x..."
}
```

## Best Practices

### Image Assets

1. **Resolution**: Minimum 512x512, recommended 1000x1000 or higher
2. **Format**: PNG for transparency, JPG for photographs
3. **File Size**: Optimize for web, aim for < 5MB
4. **Aspect Ratio**: Square (1:1) is most compatible

### IPFS Storage

1. Use pinning services (Pinata, NFT.Storage, Web3.Storage)
2. Pin assets before minting
3. Use CID v1 format for future compatibility
4. Include file hash in smart contract

### Metadata Hosting

1. **IPFS**: Decentralized, immutable (recommended)
2. **Arweave**: Permanent storage
3. **Centralized**: Use CDN with backup

### Validation

Before minting, validate:
- All required fields are present
- URLs are accessible
- Images load correctly
- JSON is properly formatted
- Attributes make sense for your collection

## ScrollVerse-Specific Guidelines

### Collection Naming

Follow the pattern: `[Collection Name] [Type] #[Edition]`
- Example: "ScrollVerse Genesis NFT #001"

### Frequency Attribution

Include frequency attributes for spiritual alignment:
```json
{
  "trait_type": "Frequency",
  "value": "999 Hz"
}
```

### Royalty Standard

ScrollVerse NFTs include 15% perpetual royalty:
```json
{
  "display_type": "boost_percentage",
  "trait_type": "Royalty Rate",
  "value": 15
}
```

### Creator Attribution

Always include creator information:
```json
{
  "trait_type": "Artist",
  "value": "Chais The Great"
}
```

## Token Standards

### ERC-721

Standard for unique, non-fungible tokens:
- Each token has a unique ID
- One owner per token
- Transferable
- Supports metadata URI

### ERC-1155

Multi-token standard:
- Supports fungible and non-fungible tokens
- Batch operations
- More gas efficient
- Supports semi-fungible tokens

## Marketplace Compatibility

Ensure metadata is compatible with:
- OpenSea
- Rarible
- LooksRare
- ScrollVerse Marketplace

### OpenSea Standards

OpenSea recognizes these metadata fields:
- name, description, image (required)
- external_url, animation_url, background_color (optional)
- attributes array with trait_type and value

## Examples

### Art NFT

```json
{
  "name": "ScrollGold Sovereign #1",
  "description": "Exclusive digital art from the ScrollVerse collection",
  "image": "ipfs://Qm...",
  "attributes": [
    {"trait_type": "Type", "value": "Digital Art"},
    {"trait_type": "Style", "value": "Abstract"},
    {"trait_type": "Rarity", "value": "Legendary"}
  ]
}
```

### Music NFT

```json
{
  "name": "Divine Frequency Track #1",
  "description": "999 Hz resonance music NFT",
  "image": "ipfs://Qm...",
  "animation_url": "ipfs://Qm.../track.mp3",
  "attributes": [
    {"trait_type": "Type", "value": "Music"},
    {"trait_type": "Genre", "value": "Spiritual"},
    {"trait_type": "Duration", "value": "3:42"}
  ]
}
```

## Resources

- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
- [IPFS Documentation](https://docs.ipfs.tech/)

## License

Licensed under CC BY-NC-SA 4.0 | https://creativecommons.org/licenses/by-nc-sa/4.0/

**Authored by Chais Hill | Chais The Great**  
**Founder, Omnitech1™ | Architect of the ScrollVerse**
