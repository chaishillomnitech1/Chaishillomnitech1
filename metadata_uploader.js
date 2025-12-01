#!/usr/bin/env node

/**
 * ScrollVerse NFT Metadata Uploader
 * Node.js helper for uploading NFT metadata to IPFS via NFT.Storage
 * 
 * Environment Variables Required:
 * - NFT_STORAGE_API_KEY: Your NFT.Storage API key
 * 
 * Usage:
 *   node metadata_uploader.js <metadata.json> [--batch <directory>]
 * 
 * @module metadata_uploader
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const NFT_STORAGE_API = 'https://api.nft.storage';
const IPFS_GATEWAY = 'https://nftstorage.link/ipfs/';

/**
 * Upload file to NFT.Storage
 * @param {Buffer|string} data - File data or JSON string
 * @param {string} apiKey - NFT.Storage API key
 * @returns {Promise<string>} - IPFS CID
 */
async function uploadToIPFS(data, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = typeof data === 'string' ? data : JSON.stringify(data);
    
    const options = {
      hostname: 'api.nft.storage',
      port: 443,
      path: '/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.ok && parsed.value && parsed.value.cid) {
            resolve(parsed.value.cid);
          } else {
            reject(new Error(`Upload failed: ${responseData}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Validate NFT metadata against ERC-721 metadata standard
 * @param {Object} metadata - Metadata object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateMetadata(metadata) {
  const errors = [];
  
  // Required fields
  if (!metadata.name || typeof metadata.name !== 'string') {
    errors.push('Missing or invalid "name" field (required string)');
  }
  
  if (!metadata.description || typeof metadata.description !== 'string') {
    errors.push('Missing or invalid "description" field (required string)');
  }
  
  if (!metadata.image || typeof metadata.image !== 'string') {
    errors.push('Missing or invalid "image" field (required string)');
  }
  
  // Optional but recommended fields
  if (metadata.attributes && !Array.isArray(metadata.attributes)) {
    errors.push('"attributes" must be an array');
  }
  
  if (metadata.attributes) {
    metadata.attributes.forEach((attr, index) => {
      if (!attr.trait_type || !('value' in attr)) {
        errors.push(`Attribute at index ${index} missing trait_type or value`);
      }
    });
  }
  
  // ScrollVerse specific validations
  if (metadata.scrollverse) {
    if (metadata.scrollverse.frequency && typeof metadata.scrollverse.frequency !== 'number') {
      errors.push('scrollverse.frequency must be a number');
    }
    
    if (metadata.scrollverse.chakra && typeof metadata.scrollverse.chakra !== 'string') {
      errors.push('scrollverse.chakra must be a string');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate ScrollVerse enhanced metadata
 * @param {Object} baseMetadata - Base NFT metadata
 * @param {Object} scrollverseOptions - ScrollVerse specific options
 * @returns {Object} - Enhanced metadata
 */
function enhanceScrollVerseMetadata(baseMetadata, scrollverseOptions = {}) {
  const defaultScrollverse = {
    frequency: 528,
    chakra: 'Heart',
    protocol: 'ScrollVerse Genesis Protocol',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    energySignature: generateEnergySignature()
  };
  
  return {
    ...baseMetadata,
    scrollverse: {
      ...defaultScrollverse,
      ...scrollverseOptions
    },
    external_url: baseMetadata.external_url || 'https://scrollverse.io',
    background_color: baseMetadata.background_color || '0d0d2b'
  };
}

/**
 * Generate a unique energy signature for ScrollVerse NFTs
 * @returns {string} - Hexadecimal energy signature
 */
function generateEnergySignature() {
  const timestamp = Date.now().toString(16);
  const random = Math.random().toString(16).substring(2, 10);
  return `0x${timestamp}${random}`.toUpperCase();
}

/**
 * Process a batch of metadata files
 * @param {string} directory - Directory containing metadata JSON files
 * @param {string} apiKey - NFT.Storage API key
 * @returns {Promise<Array>} - Array of upload results
 */
async function processBatch(directory, apiKey) {
  const results = [];
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.json'));
  
  console.log(`Found ${files.length} metadata files to process`);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    console.log(`Processing: ${file}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const metadata = JSON.parse(content);
      
      // Validate
      const validation = validateMetadata(metadata);
      if (!validation.isValid) {
        console.warn(`  ⚠️ Validation warnings for ${file}:`, validation.errors);
      }
      
      // Enhance with ScrollVerse data
      const enhanced = enhanceScrollVerseMetadata(metadata);
      
      // Upload
      const cid = await uploadToIPFS(enhanced, apiKey);
      const ipfsUrl = `${IPFS_GATEWAY}${cid}`;
      
      results.push({
        file,
        cid,
        ipfsUrl,
        success: true
      });
      
      console.log(`  ✅ Uploaded: ${ipfsUrl}`);
    } catch (error) {
      results.push({
        file,
        error: error.message,
        success: false
      });
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
ScrollVerse NFT Metadata Uploader
=================================

Usage:
  node metadata_uploader.js <metadata.json>
  node metadata_uploader.js --batch <directory>
  node metadata_uploader.js --validate <metadata.json>
  node metadata_uploader.js --enhance <metadata.json> --output <output.json>

Options:
  --batch <dir>     Process all JSON files in directory
  --validate        Validate metadata without uploading
  --enhance         Add ScrollVerse metadata enhancements
  --output <file>   Output file for enhanced metadata
  --help, -h        Show this help message

Environment Variables:
  NFT_STORAGE_API_KEY   Required for upload operations

Examples:
  NFT_STORAGE_API_KEY=your_key node metadata_uploader.js token.json
  node metadata_uploader.js --validate token.json
  node metadata_uploader.js --batch ./metadata --output ./results.json
`);
    process.exit(0);
  }
  
  const apiKey = process.env.NFT_STORAGE_API_KEY;
  
  // Handle validation only
  if (args.includes('--validate')) {
    const fileIndex = args.indexOf('--validate') + 1;
    if (fileIndex >= args.length) {
      console.error('Error: Please provide a file to validate');
      process.exit(1);
    }
    
    const filePath = args[fileIndex];
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.parse(content);
    const validation = validateMetadata(metadata);
    
    if (validation.isValid) {
      console.log('✅ Metadata is valid');
    } else {
      console.log('❌ Validation errors:');
      validation.errors.forEach(err => console.log(`  - ${err}`));
      process.exit(1);
    }
    return;
  }
  
  // Handle enhancement only
  if (args.includes('--enhance')) {
    const fileIndex = args.indexOf('--enhance') + 1;
    if (fileIndex >= args.length) {
      console.error('Error: Please provide a file to enhance');
      process.exit(1);
    }
    
    const filePath = args[fileIndex];
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.parse(content);
    const enhanced = enhanceScrollVerseMetadata(metadata);
    
    const outputIndex = args.indexOf('--output');
    if (outputIndex !== -1 && outputIndex + 1 < args.length) {
      fs.writeFileSync(args[outputIndex + 1], JSON.stringify(enhanced, null, 2));
      console.log(`✅ Enhanced metadata written to ${args[outputIndex + 1]}`);
    } else {
      console.log(JSON.stringify(enhanced, null, 2));
    }
    return;
  }
  
  // Upload operations require API key
  if (!apiKey) {
    console.error('Error: NFT_STORAGE_API_KEY environment variable is required');
    console.error('Get your API key at https://nft.storage');
    process.exit(1);
  }
  
  // Handle batch processing
  if (args.includes('--batch')) {
    const dirIndex = args.indexOf('--batch') + 1;
    if (dirIndex >= args.length) {
      console.error('Error: Please provide a directory for batch processing');
      process.exit(1);
    }
    
    const directory = args[dirIndex];
    if (!fs.existsSync(directory)) {
      console.error(`Error: Directory not found: ${directory}`);
      process.exit(1);
    }
    
    console.log('🚀 Starting batch upload...\n');
    const results = await processBatch(directory, apiKey);
    
    const outputIndex = args.indexOf('--output');
    if (outputIndex !== -1 && outputIndex + 1 < args.length) {
      fs.writeFileSync(args[outputIndex + 1], JSON.stringify(results, null, 2));
      console.log(`\n📄 Results written to ${args[outputIndex + 1]}`);
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n✨ Batch complete: ${successful}/${results.length} successful`);
    return;
  }
  
  // Single file upload
  const filePath = args[0];
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  console.log(`🚀 Uploading ${filePath}...\n`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const metadata = JSON.parse(content);
  
  // Validate
  const validation = validateMetadata(metadata);
  if (!validation.isValid) {
    console.warn('⚠️ Validation warnings:', validation.errors);
  }
  
  // Enhance
  const enhanced = enhanceScrollVerseMetadata(metadata);
  
  // Upload
  try {
    const cid = await uploadToIPFS(enhanced, apiKey);
    const ipfsUrl = `${IPFS_GATEWAY}${cid}`;
    
    console.log('✅ Upload successful!');
    console.log(`   CID: ${cid}`);
    console.log(`   URL: ${ipfsUrl}`);
    console.log(`\n📋 Use this URI in your smart contract:`);
    console.log(`   ipfs://${cid}`);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  uploadToIPFS,
  validateMetadata,
  enhanceScrollVerseMetadata,
  generateEnergySignature,
  processBatch
};
