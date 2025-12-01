#!/usr/bin/env node

/**
 * NFT Metadata Uploader - ScrollVerse IPFS Integration
 * Uploads NFT metadata and assets to NFT.Storage IPFS
 * 
 * @author ScrollVerse Development Team
 * @version 1.0.0
 * @license MIT
 * 
 * Usage:
 *   NFT_STORAGE_API_KEY=your_key node metadata_uploader.js --file metadata.json
 *   NFT_STORAGE_API_KEY=your_key node metadata_uploader.js --dir ./nft-assets
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  apiEndpoint: 'https://api.nft.storage',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedFormats: ['.json', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.webm'],
  sacredFrequencies: [111, 369, 528, 639, 741, 852, 963, 999]
};

/**
 * NFTStorageUploader class for managing IPFS uploads
 */
class NFTStorageUploader {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('NFT_STORAGE_API_KEY is required. Set it as an environment variable.');
    }
    this.apiKey = apiKey;
  }

  /**
   * Upload a single file to NFT.Storage
   * @param {string} filePath - Path to the file
   * @returns {Promise<object>} Upload result with CID
   */
  async uploadFile(filePath) {
    const absolutePath = path.resolve(filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const stats = fs.statSync(absolutePath);
    if (stats.size > CONFIG.maxFileSize) {
      throw new Error(`File exceeds maximum size of ${CONFIG.maxFileSize / 1024 / 1024}MB`);
    }

    const ext = path.extname(absolutePath).toLowerCase();
    if (!CONFIG.supportedFormats.includes(ext)) {
      console.warn(`Warning: ${ext} may not be a standard NFT format`);
    }

    const fileContent = fs.readFileSync(absolutePath);
    const fileName = path.basename(absolutePath);
    const contentType = this.getContentType(ext);

    console.log(`📤 Uploading: ${fileName} (${(stats.size / 1024).toFixed(2)} KB)`);

    return this.postToNFTStorage('/upload', fileContent, contentType);
  }

  /**
   * Upload NFT metadata JSON
   * @param {object} metadata - NFT metadata object
   * @returns {Promise<object>} Upload result with CID
   */
  async uploadMetadata(metadata) {
    // Validate ScrollVerse metadata schema
    this.validateMetadata(metadata);

    // Add ScrollVerse specific fields
    const enrichedMetadata = {
      ...metadata,
      scrollverse: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        protocol: 'ScrollVerse Genesis',
        frequencies: metadata.attributes?.find(a => a.trait_type === 'frequency')?.value || 528
      }
    };

    const jsonContent = JSON.stringify(enrichedMetadata, null, 2);
    console.log(`📤 Uploading metadata: ${metadata.name || 'Unnamed NFT'}`);

    return this.postToNFTStorage('/upload', Buffer.from(jsonContent), 'application/json');
  }

  /**
   * Upload entire directory as CAR file
   * @param {string} dirPath - Path to directory
   * @returns {Promise<object>} Upload result with CID
   */
  async uploadDirectory(dirPath) {
    const absolutePath = path.resolve(dirPath);
    
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
      throw new Error(`Directory not found: ${absolutePath}`);
    }

    const files = this.getFilesRecursively(absolutePath);
    console.log(`📁 Found ${files.length} files in directory`);

    const results = [];
    for (const file of files) {
      try {
        const result = await this.uploadFile(file);
        results.push({ file, ...result });
      } catch (error) {
        console.error(`❌ Failed to upload ${file}: ${error.message}`);
        results.push({ file, error: error.message });
      }
    }

    return results;
  }

  /**
   * Create and upload a complete NFT with image and metadata
   * @param {string} imagePath - Path to NFT image
   * @param {object} metadata - NFT metadata
   * @returns {Promise<object>} Complete NFT upload result
   */
  async createNFT(imagePath, metadata) {
    // Upload image first
    console.log('🎨 Step 1: Uploading image...');
    const imageResult = await this.uploadFile(imagePath);
    const imageUrl = `ipfs://${imageResult.value.cid}`;

    // Update metadata with image URL
    const completeMetadata = {
      ...metadata,
      image: imageUrl
    };

    // Upload metadata
    console.log('📝 Step 2: Uploading metadata...');
    const metadataResult = await this.uploadMetadata(completeMetadata);

    return {
      success: true,
      imageCID: imageResult.value.cid,
      imageUrl,
      metadataCID: metadataResult.value.cid,
      metadataUrl: `ipfs://${metadataResult.value.cid}`,
      tokenURI: `https://nftstorage.link/ipfs/${metadataResult.value.cid}`,
      metadata: completeMetadata
    };
  }

  /**
   * Make POST request to NFT.Storage API
   */
  postToNFTStorage(endpoint, data, contentType) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.nft.storage',
        path: endpoint,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': contentType,
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (result.ok) {
              console.log(`✅ Uploaded successfully! CID: ${result.value.cid}`);
              resolve(result);
            } else {
              reject(new Error(result.error?.message || 'Upload failed'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Validate NFT metadata against ScrollVerse schema
   */
  validateMetadata(metadata) {
    const required = ['name', 'description'];
    for (const field of required) {
      if (!metadata[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate attributes if present
    if (metadata.attributes && !Array.isArray(metadata.attributes)) {
      throw new Error('Attributes must be an array');
    }

    return true;
  }

  /**
   * Get content type from file extension
   */
  getContentType(ext) {
    const types = {
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm'
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Recursively get all files in directory
   */
  getFilesRecursively(dirPath, files = []) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        this.getFilesRecursively(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

/**
 * Generate ScrollVerse NFT metadata template
 */
function generateMetadataTemplate(name, description, frequency = 528) {
  return {
    name,
    description,
    external_url: 'https://scrollverse.io',
    attributes: [
      {
        trait_type: 'frequency',
        value: frequency
      },
      {
        trait_type: 'frequency_name',
        value: getFrequencyName(frequency)
      },
      {
        trait_type: 'protocol',
        value: 'ScrollVerse Genesis'
      },
      {
        display_type: 'date',
        trait_type: 'created',
        value: Math.floor(Date.now() / 1000)
      }
    ],
    properties: {
      category: 'sacred_artifact',
      creators: [],
      files: []
    }
  };
}

/**
 * Get frequency name from Hz value
 */
function getFrequencyName(frequency) {
  const names = {
    111: 'Angelic Gateway',
    369: 'Tesla Resonance',
    528: 'DNA Healing & Love',
    639: 'Heart Connection',
    741: 'Awakening',
    852: 'Intuition',
    963: 'Pineal Activation',
    999: 'Crown Chakra'
  };
  return names[frequency] || 'Custom Frequency';
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  const apiKey = process.env.NFT_STORAGE_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: NFT_STORAGE_API_KEY environment variable is required');
    console.log('\nUsage:');
    console.log('  NFT_STORAGE_API_KEY=your_key node metadata_uploader.js --file metadata.json');
    console.log('  NFT_STORAGE_API_KEY=your_key node metadata_uploader.js --dir ./nft-assets');
    console.log('  NFT_STORAGE_API_KEY=your_key node metadata_uploader.js --create image.png "NFT Name" "Description"');
    console.log('  node metadata_uploader.js --template "NFT Name" "Description" 528 > metadata.json');
    process.exit(1);
  }

  const uploader = new NFTStorageUploader(apiKey);

  try {
    // Parse CLI arguments
    const fileIndex = args.indexOf('--file');
    const dirIndex = args.indexOf('--dir');
    const createIndex = args.indexOf('--create');
    const templateIndex = args.indexOf('--template');

    if (fileIndex !== -1 && args[fileIndex + 1]) {
      // Upload single file
      const result = await uploader.uploadFile(args[fileIndex + 1]);
      console.log('\n📋 Result:', JSON.stringify(result, null, 2));
    } else if (dirIndex !== -1 && args[dirIndex + 1]) {
      // Upload directory
      const results = await uploader.uploadDirectory(args[dirIndex + 1]);
      console.log('\n📋 Results:', JSON.stringify(results, null, 2));
    } else if (createIndex !== -1 && args[createIndex + 1]) {
      // Create complete NFT
      const imagePath = args[createIndex + 1];
      const name = args[createIndex + 2] || 'ScrollVerse NFT';
      const description = args[createIndex + 3] || 'A sacred artifact from the ScrollVerse';
      const frequency = parseInt(args[createIndex + 4]) || 528;

      const metadata = generateMetadataTemplate(name, description, frequency);
      const result = await uploader.createNFT(imagePath, metadata);
      
      console.log('\n🎉 NFT Created Successfully!');
      console.log('📋 Result:', JSON.stringify(result, null, 2));
    } else if (templateIndex !== -1) {
      // Generate metadata template (no API key needed)
      const name = args[templateIndex + 1] || 'ScrollVerse NFT';
      const description = args[templateIndex + 2] || 'A sacred artifact from the ScrollVerse';
      const frequency = parseInt(args[templateIndex + 3]) || 528;

      const template = generateMetadataTemplate(name, description, frequency);
      console.log(JSON.stringify(template, null, 2));
    } else {
      console.log('❌ Invalid arguments. Use --file, --dir, --create, or --template');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}

// Export for module usage
module.exports = {
  NFTStorageUploader,
  generateMetadataTemplate,
  getFrequencyName,
  CONFIG
};
