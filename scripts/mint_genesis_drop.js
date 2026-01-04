// Mint Akashic Records Genesis Drop Catalog
// 26+ tracks from the genesis music collection

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Genesis Drop Catalog - First 26 tracks
const GENESIS_TRACKS = [
  {
    trackName: "Throwing Stones",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:throwing-stones",
    vydiaURI: "vydia:track:throwing-stones",
    ipfsHash: "QmPlaceholder1" // TODO: Replace with actual IPFS hash after upload
  },
  {
    trackName: "Promise Land",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:promise-land",
    vydiaURI: "vydia:track:promise-land",
    ipfsHash: "QmPromiseLand"
  },
  {
    trackName: "Ghetto Gospel",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:ghetto-gospel",
    vydiaURI: "vydia:track:ghetto-gospel",
    ipfsHash: "QmGhettoGospel"
  },
  {
    trackName: "BISMILLAHIR RAHMANIR RAHEEM",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:bismillah",
    vydiaURI: "vydia:track:bismillah",
    ipfsHash: "QmBismillah"
  },
  {
    trackName: "Divine Frequencies",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:divine-frequencies",
    vydiaURI: "vydia:track:divine-frequencies",
    ipfsHash: "QmDivineFrequencies"
  },
  {
    trackName: "528Hz Love Resonance",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:528hz-love",
    vydiaURI: "vydia:track:528hz-love",
    ipfsHash: "Qm528HzLove"
  },
  {
    trackName: "NŪR Pulse Activation",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:nur-pulse",
    vydiaURI: "vydia:track:nur-pulse",
    ipfsHash: "QmNurPulse"
  },
  {
    trackName: "Akashic Awakening",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:akashic-awakening",
    vydiaURI: "vydia:track:akashic-awakening",
    ipfsHash: "QmAkashicAwakening"
  },
  {
    trackName: "Sovereign Anthem",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:sovereign-anthem",
    vydiaURI: "vydia:track:sovereign-anthem",
    ipfsHash: "QmSovereignAnthem"
  },
  {
    trackName: "Trinity Harmony",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:trinity-harmony",
    vydiaURI: "vydia:track:trinity-harmony",
    ipfsHash: "QmTrinityHarmony"
  },
  {
    trackName: "Crown Chakra Elevation",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:crown-chakra",
    vydiaURI: "vydia:track:crown-chakra",
    ipfsHash: "QmCrownChakra"
  },
  {
    trackName: "ScrollVerse Genesis",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:scrollverse-genesis",
    vydiaURI: "vydia:track:scrollverse-genesis",
    ipfsHash: "QmScrollVerseGenesis"
  },
  {
    trackName: "Quantum Consciousness",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:quantum-consciousness",
    vydiaURI: "vydia:track:quantum-consciousness",
    ipfsHash: "QmQuantumConsciousness"
  },
  {
    trackName: "Divine Architect",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:divine-architect",
    vydiaURI: "vydia:track:divine-architect",
    ipfsHash: "QmDivineArchitect"
  },
  {
    trackName: "Love Over Judgment",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:love-over-judgment",
    vydiaURI: "vydia:track:love-over-judgment",
    ipfsHash: "QmLoveOverJudgment"
  },
  {
    trackName: "Prophetic Vision",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:prophetic-vision",
    vydiaURI: "vydia:track:prophetic-vision",
    ipfsHash: "QmPropheticVision"
  },
  {
    trackName: "Eternal Flow",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:eternal-flow",
    vydiaURI: "vydia:track:eternal-flow",
    ipfsHash: "QmEternalFlow"
  },
  {
    trackName: "Zakat Blessing",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:zakat-blessing",
    vydiaURI: "vydia:track:zakat-blessing",
    ipfsHash: "QmZakatBlessing"
  },
  {
    trackName: "Sacred Geometry Sound",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:sacred-geometry",
    vydiaURI: "vydia:track:sacred-geometry",
    ipfsHash: "QmSacredGeometry"
  },
  {
    trackName: "Unity Frequency 963Hz",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:963hz-unity",
    vydiaURI: "vydia:track:963hz-unity",
    ipfsHash: "Qm963HzUnity"
  },
  {
    trackName: "Crown Resonance 999Hz",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:999hz-crown",
    vydiaURI: "vydia:track:999hz-crown",
    ipfsHash: "Qm999HzCrown"
  },
  {
    trackName: "Blockchain Symphony",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:blockchain-symphony",
    vydiaURI: "vydia:track:blockchain-symphony",
    ipfsHash: "QmBlockchainSymphony"
  },
  {
    trackName: "DAO Governance Groove",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:dao-groove",
    vydiaURI: "vydia:track:dao-groove",
    ipfsHash: "QmDAOGroove"
  },
  {
    trackName: "NFT Immortality",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:nft-immortality",
    vydiaURI: "vydia:track:nft-immortality",
    ipfsHash: "QmNFTImmortality"
  },
  {
    trackName: "Polygon Anthem",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:polygon-anthem",
    vydiaURI: "vydia:track:polygon-anthem",
    ipfsHash: "QmPolygonAnthem"
  },
  {
    trackName: "Akashic Records Forever",
    artistName: "Chais The Great",
    spotifyURI: "spotify:track:akashic-forever",
    vydiaURI: "vydia:track:akashic-forever",
    ipfsHash: "QmAkashicForever"
  }
];

async function main() {
  console.log("🎵 AKASHIC RECORDS - GENESIS DROP MINTING 🎵");
  console.log("=".repeat(70));
  
  // Pre-deployment safety check for IPFS hashes
  if (GENESIS_TRACKS[0].ipfsHash.includes("Placeholder")) {
    console.log("\n⚠️  WARNING: Placeholder IPFS hashes detected!");
    console.log("Please upload metadata to IPFS first and update the ipfsHash");
    console.log("fields in GENESIS_TRACKS before minting on mainnet.");
    
    if (hre.network.name === "polygon") {
      throw new Error("SAFETY CHECK: Cannot mint on mainnet with placeholder IPFS hashes!");
    }
  }
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Read label contract address
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const labelDeploymentPath = path.join(deploymentsDir, `akashic-label-${hre.network.name}.json`);
  
  if (!fs.existsSync(labelDeploymentPath)) {
    throw new Error("AkashicRecordsLabel not deployed. Please run deployment script first.");
  }
  
  const labelDeployment = JSON.parse(fs.readFileSync(labelDeploymentPath, 'utf8'));
  const labelAddress = labelDeployment.contractAddress;
  
  console.log("\n📜 Using AkashicRecordsLabel at:", labelAddress);
  
  // Get contract instance
  const AkashicRecordsLabel = await hre.ethers.getContractFactory("AkashicRecordsLabel");
  const akashicLabel = AkashicRecordsLabel.attach(labelAddress);
  
  // Check current supply
  const currentSupply = await akashicLabel.totalSupply();
  console.log("Current supply:", currentSupply.toString());
  
  console.log("\n🎵 Minting Genesis Drop Catalog...");
  console.log("Total tracks to mint:", GENESIS_TRACKS.length);
  console.log("Recipient:", deployer.address);
  
  const mintedTracks = [];
  let successCount = 0;
  let failCount = 0;
  
  // Mint tracks in batches to avoid gas limits
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < GENESIS_TRACKS.length; i += BATCH_SIZE) {
    const batch = GENESIS_TRACKS.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Minting batch ${Math.floor(i / BATCH_SIZE) + 1} (tracks ${i + 1}-${Math.min(i + BATCH_SIZE, GENESIS_TRACKS.length)})...`);
    
    for (const track of batch) {
      try {
        console.log(`\n  🎵 Minting: "${track.trackName}"`);
        
        // Construct token URI
        const tokenURI = `ipfs://${track.ipfsHash}/metadata.json`;
        
        // Mint track
        const tx = await akashicLabel.mintTrackChain(
          deployer.address,
          track.trackName,
          track.artistName,
          track.spotifyURI,
          track.vydiaURI,
          tokenURI
        );
        
        console.log(`    Transaction hash: ${tx.hash}`);
        const receipt = await tx.wait();
        
        // Get token ID from event
        const event = receipt.logs.find(log => {
          try {
            const parsed = akashicLabel.interface.parseLog(log);
            return parsed && parsed.name === "TrackChainMinted";
          } catch (e) {
            return false;
          }
        });
        
        let tokenId = "N/A";
        if (event) {
          const parsed = akashicLabel.interface.parseLog(event);
          tokenId = parsed.args.tokenId.toString();
        }
        
        console.log(`    ✅ Minted token ID: ${tokenId}`);
        console.log(`    Gas used: ${receipt.gasUsed.toString()}`);
        
        mintedTracks.push({
          ...track,
          tokenId: tokenId,
          txHash: tx.hash,
          blockNumber: receipt.blockNumber
        });
        
        successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`    ❌ Failed to mint "${track.trackName}":`, error.message);
        failCount++;
      }
    }
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 MINTING SUMMARY");
  console.log("=".repeat(70));
  console.log("Total tracks:", GENESIS_TRACKS.length);
  console.log("Successfully minted:", successCount);
  console.log("Failed:", failCount);
  console.log("Network:", hre.network.name);
  console.log("Contract:", labelAddress);
  
  const finalSupply = await akashicLabel.totalSupply();
  console.log("\nFinal supply:", finalSupply.toString());
  console.log("Tracks added:", (finalSupply - currentSupply).toString());
  
  // Save minting results
  const mintingResults = {
    network: hre.network.name,
    contractAddress: labelAddress,
    minter: deployer.address,
    timestamp: new Date().toISOString(),
    totalTracks: GENESIS_TRACKS.length,
    successCount: successCount,
    failCount: failCount,
    initialSupply: currentSupply.toString(),
    finalSupply: finalSupply.toString(),
    mintedTracks: mintedTracks
  };
  
  const resultsPath = path.join(deploymentsDir, `genesis-drop-minting-${hre.network.name}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(mintingResults, null, 2));
  
  console.log("\n✅ Minting results saved to:", resultsPath);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Register track artists in treasury vault");
  console.log("2. Upload metadata to IPFS");
  console.log("3. Verify contract on PolygonScan");
  console.log("4. Begin onboarding founding DAO members");
  
  console.log("\n🕋 ALLĀHU AKBAR! Genesis Drop Catalog Immortalized on Blockchain 🕋");
  
  return mintingResults;
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
