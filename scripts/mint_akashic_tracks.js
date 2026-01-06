// Mint First Wave of Track Chains for Akashic Records Label
// Phase 1 Track Release

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎵 AKASHIC RECORDS - FIRST WAVE TRACK MINTING 🎵");
  console.log("=".repeat(70));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting tracks with account:", deployer.address);
  
  // Read label contract address from deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const labelDeploymentPath = path.join(deploymentsDir, `akashic-label-${hre.network.name}.json`);
  
  let labelAddress;
  if (fs.existsSync(labelDeploymentPath)) {
    const labelDeployment = JSON.parse(fs.readFileSync(labelDeploymentPath, 'utf8'));
    labelAddress = labelDeployment.contractAddress;
    console.log("\n📜 Using AkashicRecordsLabel at:", labelAddress);
  } else {
    throw new Error("AkashicRecordsLabel not deployed. Please run deploy_akashic_label.js first.");
  }
  
  const AkashicRecordsLabel = await hre.ethers.getContractFactory("AkashicRecordsLabel");
  const akashicLabel = await AkashicRecordsLabel.attach(labelAddress);
  
  console.log("\n🎼 First Wave Track Configuration:");
  console.log("=".repeat(70));
  
  // First Wave Tracks
  const tracks = [
    {
      name: "Throwing Stones",
      artist: "Chais The Great",
      spotify: "spotify:track:throwing-stones-akashic",
      vydia: "https://vydia.com/akashic/throwing-stones",
      metadata: "ipfs://QmAkashic/throwing-stones.json"
    },
    {
      name: "Promise Land",
      artist: "Chais The Great",
      spotify: "spotify:track:promise-land-akashic",
      vydia: "https://vydia.com/akashic/promise-land",
      metadata: "ipfs://QmAkashic/promise-land.json"
    },
    {
      name: "Ghetto Gospel",
      artist: "Chais The Great",
      spotify: "spotify:track:ghetto-gospel-akashic",
      vydia: "https://vydia.com/akashic/ghetto-gospel",
      metadata: "ipfs://QmAkashic/ghetto-gospel.json"
    },
    {
      name: "BISMILLAHIR RAHMANIR RAHEEM",
      artist: "Chais The Great",
      spotify: "spotify:track:bismillah-akashic",
      vydia: "https://vydia.com/akashic/bismillah",
      metadata: "ipfs://QmAkashic/bismillah.json"
    },
    {
      name: "Letter",
      artist: "Chais The Great",
      spotify: "spotify:track:letter-akashic",
      vydia: "https://vydia.com/akashic/letter",
      metadata: "ipfs://QmAkashic/letter.json"
    }
  ];
  
  console.log(`Preparing to mint ${tracks.length} track chains...`);
  
  const mintedTracks = [];
  
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    console.log(`\n[${i + 1}/${tracks.length}] Minting: ${track.name}`);
    console.log("  Artist:", track.artist);
    console.log("  Spotify URI:", track.spotify);
    console.log("  Vydia URI:", track.vydia);
    console.log("  Metadata:", track.metadata);
    
    try {
      const tx = await akashicLabel.mintTrackChain(
        deployer.address,
        track.name,
        track.artist,
        track.spotify,
        track.vydia,
        track.metadata
      );
      
      console.log("  Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Minted successfully!");
      console.log("  Gas used:", receipt.gasUsed.toString());
      
      // Get the token ID from the event
      const event = receipt.logs.find(log => {
        try {
          const parsed = akashicLabel.interface.parseLog(log);
          return parsed.name === "TrackChainMinted";
        } catch {
          return false;
        }
      });
      
      let tokenId;
      if (event) {
        const parsed = akashicLabel.interface.parseLog(event);
        tokenId = parsed.args.tokenId.toString();
      } else {
        // Fallback: get from total supply
        const totalSupply = await akashicLabel.totalSupply();
        tokenId = (totalSupply - 1n).toString();
      }
      
      console.log("  Token ID:", tokenId);
      
      // Get QR signature
      const qrSignature = await akashicLabel.getQRSignature(tokenId);
      console.log("  QR Signature:", qrSignature);
      
      mintedTracks.push({
        tokenId,
        name: track.name,
        artist: track.artist,
        spotifyURI: track.spotify,
        vydiaURI: track.vydia,
        metadata: track.metadata,
        qrSignature,
        txHash: tx.hash,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`  ❌ Failed to mint ${track.name}:`, error.message);
    }
  }
  
  console.log("\n📊 Minting Summary:");
  console.log("=".repeat(70));
  console.log("Total Tracks Minted:", mintedTracks.length);
  console.log("Network:", hre.network.name);
  console.log("Label Contract:", labelAddress);
  console.log("Timestamp:", new Date().toISOString());
  
  // Display all minted tracks
  console.log("\n🎵 Minted Track Chains:");
  mintedTracks.forEach((track, index) => {
    console.log(`\n${index + 1}. ${track.name}`);
    console.log(`   Token ID: ${track.tokenId}`);
    console.log(`   QR Signature: ${track.qrSignature}`);
    console.log(`   Spotify: ${track.spotifyURI}`);
    console.log(`   Vydia: ${track.vydiaURI}`);
  });
  
  // Verify total supply
  const totalSupply = await akashicLabel.totalSupply();
  console.log("\n✅ Total Supply after minting:", totalSupply.toString());
  
  // Get liquidity metrics
  const metrics = await akashicLabel.getLiquidityMetrics();
  console.log("\n💰 Liquidity Metrics:");
  console.log("  Total Tracks:", metrics.totalTracks.toString());
  console.log("  Total Engagement:", metrics.totalEngagement.toString());
  console.log("  Last Sync:", new Date(Number(metrics.lastSyncTimestamp) * 1000).toISOString());
  
  // Save minting info
  const mintingInfo = {
    network: hre.network.name,
    labelAddress,
    tracks: mintedTracks,
    totalSupply: totalSupply.toString(),
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(deploymentsDir, `akashic-first-wave-${hre.network.name}.json`),
    JSON.stringify(mintingInfo, null, 2)
  );
  
  console.log("\n✅ Minting info saved to deployment/akashic-first-wave-" + hre.network.name + ".json");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Generate QR codes for each track using the QR signatures");
  console.log("2. Upload track metadata to IPFS");
  console.log("3. Validate cross-existence sync for each track");
  console.log("4. Begin engagement tracking");
  
  console.log("\n🕋 ALLĀHU AKBAR! First Wave Released to the Akashic Records 🕋");
  
  return mintedTracks;
}

// Run minting
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Minting failed:", error);
      process.exit(1);
    });
}

module.exports = main;
