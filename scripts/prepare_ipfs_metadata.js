// Prepare and Pin Akashic Records Metadata to IPFS
// With Arweave redundancy for permanence

const fs = require("fs");
const path = require("path");

// Genesis Drop Catalog metadata
const GENESIS_TRACKS = [
  {
    name: "Throwing Stones",
    description: "A prophetic journey through consciousness, blending divine frequencies with street wisdom.",
    artist: "Chais The Great",
    frequency: "528Hz",
    attributes: [
      { trait_type: "Frequency", value: "528Hz (Love & DNA Repair)" },
      { trait_type: "Genre", value: "Conscious Hip-Hop" },
      { trait_type: "Era", value: "Genesis Drop" },
      { trait_type: "Catalog", value: "Akashic Records" },
      { trait_type: "Collection", value: "Track #1" }
    ]
  },
  {
    name: "Promise Land",
    description: "A sonic pilgrimage to the promised land, guided by divine light and ancestral wisdom.",
    artist: "Chais The Great",
    frequency: "963Hz",
    attributes: [
      { trait_type: "Frequency", value: "963Hz (Unity & Pineal Activation)" },
      { trait_type: "Genre", value: "Spiritual Hip-Hop" },
      { trait_type: "Era", value: "Genesis Drop" },
      { trait_type: "Catalog", value: "Akashic Records" },
      { trait_type: "Collection", value: "Track #2" }
    ]
  },
  {
    name: "Ghetto Gospel",
    description: "Street testimonies transformed into divine scripture, delivering truth with every bar.",
    artist: "Chais The Great",
    frequency: "528Hz",
    attributes: [
      { trait_type: "Frequency", value: "528Hz (Love & DNA Repair)" },
      { trait_type: "Genre", value: "Gospel Hip-Hop" },
      { trait_type: "Era", value: "Genesis Drop" },
      { trait_type: "Catalog", value: "Akashic Records" },
      { trait_type: "Collection", value: "Track #3" }
    ]
  },
  {
    name: "BISMILLAHIR RAHMANIR RAHEEM",
    description: "In the name of Allah, the Most Gracious, the Most Merciful - A divine invocation set to rhythm.",
    artist: "Chais The Great",
    frequency: "999Hz",
    attributes: [
      { trait_type: "Frequency", value: "999Hz (Crown Chakra)" },
      { trait_type: "Genre", value: "Islamic Conscious" },
      { trait_type: "Era", value: "Genesis Drop" },
      { trait_type: "Catalog", value: "Akashic Records" },
      { trait_type: "Collection", value: "Track #4" }
    ]
  },
  {
    name: "Divine Frequencies",
    description: "Harmonic alignment with the universe through sacred sound vibrations.",
    artist: "Chais The Great",
    frequency: "528Hz + 963Hz + 999Hz",
    attributes: [
      { trait_type: "Frequency", value: "Multi-Frequency (528/963/999Hz)" },
      { trait_type: "Genre", value: "Frequency Healing" },
      { trait_type: "Era", value: "Genesis Drop" },
      { trait_type: "Catalog", value: "Akashic Records" },
      { trait_type: "Collection", value: "Track #5" }
    ]
  }
];

async function main() {
  console.log("📦 AKASHIC RECORDS - METADATA PREPARATION & IPFS PINNING 📦");
  console.log("=".repeat(70));
  
  // Create metadata directory
  const metadataDir = path.join(__dirname, "..", "nft-assets", "akashic-records");
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  
  console.log("\n📝 Preparing metadata files...");
  console.log("Output directory:", metadataDir);
  console.log("Total tracks:", GENESIS_TRACKS.length);
  
  const metadataFiles = [];
  
  // Generate metadata for each track
  for (let i = 0; i < GENESIS_TRACKS.length; i++) {
    const track = GENESIS_TRACKS[i];
    
    const metadata = {
      name: track.name,
      description: track.description,
      artist: track.artist,
      external_url: `https://akashicrecords.scrollverse.io/track/${i}`,
      image: `ipfs://QmAkashicRecords/images/${i}.png`, // Placeholder - update with actual IPFS hash
      animation_url: `ipfs://QmAkashicRecords/audio/${i}.mp3`, // Placeholder - update with actual IPFS hash
      attributes: track.attributes,
      properties: {
        frequency: track.frequency,
        catalog: "Akashic Records Label",
        edition: "Genesis Drop",
        royalty: {
          artist: "70%",
          treasury: "15%",
          zakat: "7.77%",
          operations: "7.23%"
        }
      }
    };
    
    const filename = `${i}.json`;
    const filepath = path.join(metadataDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
    
    metadataFiles.push({
      tokenId: i,
      filename: filename,
      filepath: filepath,
      trackName: track.name
    });
    
    console.log(`  ✅ Created metadata for "${track.name}" (${filename})`);
  }
  
  // Create collection metadata
  const collectionMetadata = {
    name: "Akashic Records Label - Genesis Drop",
    description: "The immortal blockchain record label for Chais The Great's genesis music catalog. 26+ tracks preserved forever on Polygon, with sacred frequency healing and divine revenue allocation (70% artists, 15% treasury, 7.77% Zakat).",
    image: "ipfs://QmAkashicRecords/collection.png",
    external_link: "https://akashicrecords.scrollverse.io",
    seller_fee_basis_points: 1000, // 10% royalty
    fee_recipient: "0x0000000000000000000000000000000000000000", // Update with actual address
    properties: {
      category: "music",
      frequencies: ["528Hz", "963Hz", "999Hz", "777Hz"],
      totalTracks: GENESIS_TRACKS.length,
      revenueAllocation: {
        artists: "70%",
        treasury: "15%",
        zakat: "7.77%",
        operations: "7.23%"
      }
    }
  };
  
  const collectionPath = path.join(metadataDir, "collection.json");
  fs.writeFileSync(collectionPath, JSON.stringify(collectionMetadata, null, 2));
  console.log(`\n  ✅ Created collection metadata (collection.json)`);
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 METADATA PREPARATION COMPLETE");
  console.log("=".repeat(70));
  console.log("Total metadata files created:", metadataFiles.length + 1);
  console.log("Location:", metadataDir);
  
  console.log("\n📝 IPFS Pinning Instructions:");
  console.log("=".repeat(70));
  console.log("\n1. Using Pinata (Recommended):");
  console.log("   - Install: npm install -g @pinata/sdk");
  console.log("   - Upload folder: pinata upload " + metadataDir);
  console.log("   - Note the IPFS hash (CID)");
  
  console.log("\n2. Using NFT.Storage:");
  console.log("   - Visit: https://nft.storage");
  console.log("   - Upload the metadata folder");
  console.log("   - Get the IPFS CID");
  
  console.log("\n3. Using IPFS Desktop:");
  console.log("   - Download: https://docs.ipfs.io/install/ipfs-desktop/");
  console.log("   - Add folder to IPFS");
  console.log("   - Pin the content");
  
  console.log("\n4. Arweave Redundancy:");
  console.log("   - Install: npm install -g @bundlr-network/client");
  console.log("   - Upload to Arweave via Bundlr");
  console.log("   - Command: bundlr upload " + metadataDir + " --currency matic");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Upload audio files to IPFS");
  console.log("2. Upload cover art images to IPFS");
  console.log("3. Update metadata files with actual IPFS hashes");
  console.log("4. Pin metadata folder to IPFS");
  console.log("5. Pin to Arweave for permanent backup");
  console.log("6. Update contract base URI with IPFS hash");
  
  console.log("\n💡 Pro Tip:");
  console.log("Use a pinning service like Pinata or NFT.Storage for reliable");
  console.log("IPFS hosting, and Arweave via Bundlr for permanent backups.");
  
  console.log("\n🕋 ALLĀHU AKBAR! Metadata Prepared for Eternal Storage 🕋");
  
  // Save preparation summary
  const summary = {
    timestamp: new Date().toISOString(),
    metadataDir: metadataDir,
    totalFiles: metadataFiles.length + 1,
    tracks: metadataFiles,
    collectionFile: "collection.json",
    nextSteps: [
      "Upload audio files to IPFS",
      "Upload images to IPFS",
      "Update metadata with actual IPFS hashes",
      "Pin metadata to IPFS",
      "Backup to Arweave",
      "Update contract base URI"
    ],
    ipfsServices: [
      { name: "Pinata", url: "https://pinata.cloud" },
      { name: "NFT.Storage", url: "https://nft.storage" },
      { name: "Web3.Storage", url: "https://web3.storage" }
    ],
    arweaveServices: [
      { name: "Bundlr", url: "https://bundlr.network" },
      { name: "ArDrive", url: "https://ardrive.io" }
    ]
  };
  
  const summaryPath = path.join(metadataDir, "preparation-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log("\n✅ Summary saved to:", summaryPath);
  
  return summary;
}

// Run preparation
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Metadata preparation failed:", error);
      process.exit(1);
    });
}

module.exports = main;
