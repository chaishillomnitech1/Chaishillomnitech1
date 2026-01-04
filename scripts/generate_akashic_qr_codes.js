// Generate QR Codes for Track Chains
// Creates cryptographic QR mirrored signatures with Spotify/Vydia URIs

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔐 AKASHIC RECORDS - QR SIGNATURE GENERATOR 🔐");
  console.log("=".repeat(70));
  
  // Read minted tracks from deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const mintingInfoPath = path.join(deploymentsDir, `akashic-first-wave-${hre.network.name}.json`);
  
  if (!fs.existsSync(mintingInfoPath)) {
    throw new Error("First wave tracks not minted. Please run mint_akashic_tracks.js first.");
  }
  
  const mintingInfo = JSON.parse(fs.readFileSync(mintingInfoPath, 'utf8'));
  const tracks = mintingInfo.tracks;
  
  console.log(`\n📜 Processing ${tracks.length} track chains...`);
  console.log("Network:", hre.network.name);
  console.log("Label Contract:", mintingInfo.labelAddress);
  
  const qrCodes = [];
  
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    console.log(`\n[${i + 1}/${tracks.length}] Generating QR for: ${track.name}`);
    console.log("  Token ID:", track.tokenId);
    console.log("  QR Signature:", track.qrSignature);
    
    // Create QR code data structure
    const qrData = {
      tokenId: track.tokenId,
      trackName: track.name,
      artistName: track.artist,
      qrSignature: track.qrSignature,
      spotifyURI: track.spotifyURI,
      vydiaURI: track.vydiaURI,
      metadata: track.metadata,
      frequency: 528, // Healing frequency
      network: hre.network.name,
      contractAddress: mintingInfo.labelAddress,
      timestamp: track.timestamp,
      // Validation URL for QR scanning
      validationURL: `https://akashicrecords.scrollverse.io/validate/${track.tokenId}/${track.qrSignature}`,
      // Streaming links
      streamingLinks: {
        spotify: track.spotifyURI,
        vydia: track.vydiaURI,
        apple: `https://music.apple.com/akashic/${track.name.toLowerCase().replace(/\s/g, '-')}`,
        youtube: `https://youtube.com/akashic/${track.name.toLowerCase().replace(/\s/g, '-')}`
      },
      // Engagement tracking
      engagementTracker: `https://akashicrecords.scrollverse.io/track/${track.tokenId}/engage`,
      // Royalty info
      royaltyInfo: {
        percentage: 10,
        recipient: mintingInfo.labelAddress
      }
    };
    
    // Generate QR code string (JSON encoded)
    const qrString = JSON.stringify(qrData, null, 2);
    
    qrCodes.push({
      tokenId: track.tokenId,
      trackName: track.name,
      qrData,
      qrString,
      qrSignature: track.qrSignature
    });
    
    console.log("  ✅ QR Code generated");
    console.log("  Validation URL:", qrData.validationURL);
    console.log("  Engagement Tracker:", qrData.engagementTracker);
  }
  
  console.log("\n📊 QR Generation Summary:");
  console.log("=".repeat(70));
  console.log("Total QR Codes Generated:", qrCodes.length);
  console.log("Network:", hre.network.name);
  console.log("Timestamp:", new Date().toISOString());
  
  // Save QR codes
  const qrOutputDir = path.join(deploymentsDir, "qr-codes");
  if (!fs.existsSync(qrOutputDir)) {
    fs.mkdirSync(qrOutputDir, { recursive: true });
  }
  
  // Save individual QR code files
  qrCodes.forEach((qr) => {
    const filename = `qr-${qr.tokenId}-${qr.trackName.toLowerCase().replace(/\s/g, '-')}.json`;
    fs.writeFileSync(
      path.join(qrOutputDir, filename),
      qr.qrString
    );
    console.log(`✅ Saved: ${filename}`);
  });
  
  // Save master QR registry
  const qrRegistry = {
    network: hre.network.name,
    labelAddress: mintingInfo.labelAddress,
    generatedAt: new Date().toISOString(),
    totalQRCodes: qrCodes.length,
    qrCodes: qrCodes.map(qr => ({
      tokenId: qr.tokenId,
      trackName: qr.trackName,
      qrSignature: qr.qrSignature,
      validationURL: qr.qrData.validationURL,
      engagementTracker: qr.qrData.engagementTracker,
      spotifyURI: qr.qrData.spotifyURI,
      vydiaURI: qr.qrData.vydiaURI
    }))
  };
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-qr-registry-${hre.network.name}.json`),
    JSON.stringify(qrRegistry, null, 2)
  );
  
  console.log("\n✅ QR Registry saved to deployment/akashic-qr-registry-" + hre.network.name + ".json");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Generate visual QR codes using the JSON data");
  console.log("2. Print QR codes for physical distribution");
  console.log("3. Embed QR codes in album artwork and promotional materials");
  console.log("4. Set up validation endpoint at akashicrecords.scrollverse.io");
  console.log("5. Configure engagement tracking system");
  
  console.log("\n🎵 QR Code Usage:");
  console.log("- Scan QR code to validate track authenticity");
  console.log("- Direct link to Spotify/Vydia streaming");
  console.log("- Track engagement metrics on-chain");
  console.log("- Verify cryptographic signature");
  console.log("- Access exclusive content and rewards");
  
  console.log("\n🕋 ALLĀHU AKBAR! QR Mirrored Signatures Generated 🕋");
  
  return qrCodes;
}

// Run QR generation
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ QR generation failed:", error);
      process.exit(1);
    });
}

module.exports = main;
