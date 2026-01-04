// Register Track Artists in Akashic Treasury Vault
// Links minted tracks to artist addresses for royalty distribution

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("👨‍🎨 AKASHIC RECORDS - TRACK ARTIST REGISTRATION 👨‍🎨");
  console.log("=".repeat(80));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Registering with account:", deployer.address);
  console.log("Network:", hre.network.name);
  
  // Read deployment files
  const deploymentsDir = path.join(__dirname, "..", "deployment");
  const vaultDeploymentPath = path.join(deploymentsDir, `akashic-treasury-${hre.network.name}.json`);
  const mintingPath = path.join(deploymentsDir, `genesis-drop-minting-${hre.network.name}.json`);
  
  if (!fs.existsSync(vaultDeploymentPath)) {
    throw new Error("Treasury vault not deployed. Please run deployment script first.");
  }
  
  if (!fs.existsSync(mintingPath)) {
    throw new Error("Genesis drop not minted. Please run minting script first.");
  }
  
  const vaultDeployment = JSON.parse(fs.readFileSync(vaultDeploymentPath, 'utf8'));
  const mintingData = JSON.parse(fs.readFileSync(mintingPath, 'utf8'));
  
  const vaultAddress = vaultDeployment.vaultAddress;
  console.log("\n📜 Using AkashicTreasuryVault at:", vaultAddress);
  
  // Get vault contract
  const vault = await hre.ethers.getContractAt("AkashicTreasuryVault", vaultAddress);
  
  // Check if we have TREASURY_ADMIN_ROLE
  const TREASURY_ADMIN_ROLE = await vault.TREASURY_ADMIN_ROLE();
  const hasRole = await vault.hasRole(TREASURY_ADMIN_ROLE, deployer.address);
  
  if (!hasRole) {
    throw new Error("Deployer does not have TREASURY_ADMIN_ROLE. Cannot register artists.");
  }
  
  console.log("✅ Deployer has TREASURY_ADMIN_ROLE");
  
  // Artist configuration
  // IMPORTANT: In production, provide individual artist wallet addresses
  const DEFAULT_ARTIST_ADDRESS = process.env.ARTIST_WALLET_ADDRESS || deployer.address;
  
  // Safety check for production deployments
  if (hre.network.name === "polygon" && DEFAULT_ARTIST_ADDRESS === deployer.address) {
    console.log("\n⚠️  CRITICAL WARNING: Using deployer address as default artist!");
    console.log("For production (polygon mainnet), you MUST provide individual artist addresses.");
    console.log("\nOptions:");
    console.log("1. Set ARTIST_WALLET_ADDRESS in .env file");
    console.log("2. Modify this script with individual artist addresses per track");
    console.log("3. Run on testnet first (mumbai) to test");
    
    throw new Error("SAFETY CHECK: Cannot use deployer as default artist on mainnet. Please configure individual artist addresses.");
  }
  
  console.log("\n📋 Artist Configuration:");
  console.log("  Default Artist Address:", DEFAULT_ARTIST_ADDRESS);
  console.log("  Tracks to Register:", mintingData.mintedTracks.length);
  
  if (DEFAULT_ARTIST_ADDRESS === deployer.address) {
    console.log("\n⚠️  WARNING: Using deployer address for all tracks.");
    console.log("In production, update this script with individual artist addresses.");
  }
  
  // Prepare batch registration data
  const tokenIds = [];
  const artistAddresses = [];
  
  for (const track of mintingData.mintedTracks) {
    if (track.tokenId && track.tokenId !== "N/A") {
      tokenIds.push(BigInt(track.tokenId));
      
      // TODO: Map specific artists to tracks
      // For now, using default artist address for all tracks
      artistAddresses.push(DEFAULT_ARTIST_ADDRESS);
    }
  }
  
  console.log("\n🎵 Tracks to Register:");
  mintingData.mintedTracks.forEach((track, index) => {
    if (track.tokenId && track.tokenId !== "N/A") {
      console.log(`  ${index + 1}. Token ${track.tokenId}: ${track.trackName} → ${artistAddresses[index]}`);
    }
  });
  
  console.log("\n📝 Registering artists in batch...");
  
  try {
    // Check if any tracks are already registered
    let alreadyRegistered = 0;
    for (const tokenId of tokenIds) {
      const existingArtist = await vault.trackArtists(tokenId);
      if (existingArtist !== "0x0000000000000000000000000000000000000000") {
        console.log(`ℹ️  Token ${tokenId} already registered to:`, existingArtist);
        alreadyRegistered++;
      }
    }
    
    if (alreadyRegistered === tokenIds.length) {
      console.log("\n✅ All tracks already registered!");
      return;
    }
    
    // Batch register artists
    const tx = await vault.batchRegisterTrackArtists(tokenIds, artistAddresses);
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Artists registered successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Block number:", receipt.blockNumber);
    
    // Verify registrations
    console.log("\n🔍 Verifying Registrations:");
    let verified = 0;
    for (let i = 0; i < tokenIds.length; i++) {
      const registeredArtist = await vault.trackArtists(tokenIds[i]);
      const expected = artistAddresses[i].toLowerCase();
      const actual = registeredArtist.toLowerCase();
      
      if (expected === actual) {
        console.log(`✅ Token ${tokenIds[i]}: ${registeredArtist}`);
        verified++;
      } else {
        console.log(`❌ Token ${tokenIds[i]}: Expected ${expected}, got ${actual}`);
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 REGISTRATION SUMMARY");
    console.log("=".repeat(80));
    console.log("Total Tracks:", tokenIds.length);
    console.log("✅ Successfully Registered:", verified);
    console.log("❌ Failed:", tokenIds.length - verified);
    console.log("Already Registered:", alreadyRegistered);
    
    if (verified === tokenIds.length) {
      console.log("\n🎉 ALL ARTISTS REGISTERED SUCCESSFULLY! 🎉");
    } else {
      console.log("\n⚠️  SOME REGISTRATIONS FAILED");
      console.log("Please review the output above and retry failed registrations.");
    }
    
    // Save registration results
    const registrationResults = {
      network: hre.network.name,
      vaultAddress: vaultAddress,
      registrar: deployer.address,
      timestamp: new Date().toISOString(),
      totalTracks: tokenIds.length,
      verified: verified,
      failed: tokenIds.length - verified,
      alreadyRegistered: alreadyRegistered,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      registrations: tokenIds.map((tokenId, index) => ({
        tokenId: tokenId.toString(),
        trackName: mintingData.mintedTracks[index]?.trackName,
        artistAddress: artistAddresses[index]
      }))
    };
    
    const resultsPath = path.join(deploymentsDir, `artist-registrations-${hre.network.name}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(registrationResults, null, 2));
    console.log("\n✅ Registration results saved to:", resultsPath);
    
    console.log("\n📝 Next Steps:");
    console.log("1. Verify artist addresses are correct (update if needed)");
    console.log("2. Test royalty distribution with small amount");
    console.log("3. Configure multi-sig for treasury admin");
    console.log("4. Begin onboarding DAO members");
    
  } catch (error) {
    console.error("\n❌ Registration failed:", error.message);
    throw error;
  }
  
  console.log("\n🕋 ALLĀHU AKBAR! Artist Registration Complete 🕋");
}

// Run registration
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Artist registration failed:", error);
      process.exit(1);
    });
}

module.exports = main;
