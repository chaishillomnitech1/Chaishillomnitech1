// Consciousness Mirror NFT Minting Script
// Mint NFTs with optional IPFS metadata upload

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Journey metadata templates
const JOURNEY_METADATA = {
  "I See You": {
    frequency: 963,
    description: "The first awakening - recognizing consciousness in all things.",
    attributes: [
      { trait_type: "Frequency", value: "963Hz" },
      { trait_type: "Journey", value: "I See You" },
      { trait_type: "Phase", value: "Awakening" }
    ]
  },
  "I Honor You": {
    frequency: 528,
    description: "The path of respect - honoring the divine in every being.",
    attributes: [
      { trait_type: "Frequency", value: "528Hz" },
      { trait_type: "Journey", value: "I Honor You" },
      { trait_type: "Phase", value: "Honor" }
    ]
  },
  "I Reflect You": {
    frequency: 888,
    description: "The mirror of consciousness - seeing yourself in others.",
    attributes: [
      { trait_type: "Frequency", value: "888Hz" },
      { trait_type: "Journey", value: "I Reflect You" },
      { trait_type: "Phase", value: "Reflection" }
    ]
  },
  "I Forgive You": {
    frequency: 963,
    description: "The release of burden - freeing through forgiveness.",
    attributes: [
      { trait_type: "Frequency", value: "963Hz" },
      { trait_type: "Journey", value: "I Forgive You" },
      { trait_type: "Phase", value: "Forgiveness" }
    ]
  },
  "I Thank You": {
    frequency: 528,
    description: "The attitude of gratitude - appreciation for all existence.",
    attributes: [
      { trait_type: "Frequency", value: "528Hz" },
      { trait_type: "Journey", value: "I Thank You" },
      { trait_type: "Phase", value: "Gratitude" }
    ]
  },
  "I Love You": {
    frequency: 528,
    description: "The ultimate truth - unconditional love for all.",
    attributes: [
      { trait_type: "Frequency", value: "528Hz" },
      { trait_type: "Journey", value: "I Love You" },
      { trait_type: "Phase", value: "Love" }
    ]
  }
};

// The 7 Pillars
const PILLARS_METADATA = {
  "Faith": { frequency: 963, pillar: 1 },
  "Gratitude": { frequency: 528, pillar: 2 },
  "Patience": { frequency: 888, pillar: 3 },
  "Honesty": { frequency: 963, pillar: 4 },
  "Generosity": { frequency: 528, pillar: 5 },
  "Justice": { frequency: 999, pillar: 6 },
  "Love": { frequency: 144000, pillar: 7 }
};

async function main() {
  console.log("🔮 CONSCIOUSNESS MIRROR - NFT MINTING SCRIPT 🔮");
  console.log("=".repeat(60));
  
  // Parse arguments
  const args = process.argv.slice(2);
  let contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  let recipient = process.env.MINT_RECIPIENT;
  let journey = "I See You";
  let frequency = 963;
  let batchMint = false;
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--contract" && args[i + 1]) {
      contractAddress = args[i + 1];
      i++;
    } else if (args[i] === "--to" && args[i + 1]) {
      recipient = args[i + 1];
      i++;
    } else if (args[i] === "--journey" && args[i + 1]) {
      journey = args[i + 1];
      i++;
    } else if (args[i] === "--frequency" && args[i + 1]) {
      frequency = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--batch") {
      batchMint = true;
    }
  }
  
  if (!contractAddress) {
    console.error("❌ Error: Contract address required");
    console.log("Usage: node scripts/mint_consciousness_mirror.js --contract <address> --to <recipient> [--journey <name>] [--frequency <hz>]");
    console.log("\nOr set environment variables:");
    console.log("  NFT_CONTRACT_ADDRESS=<address>");
    console.log("  MINT_RECIPIENT=<address>");
    process.exit(1);
  }
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting with account:", deployer.address);
  
  // Connect to contract
  const nft = await hre.ethers.getContractAt("ConsciousnessMirrorNFT", contractAddress);
  console.log("Connected to NFT contract:", contractAddress);
  
  const currentSupply = await nft.totalSupply();
  const maxSupply = await nft.maxSupply();
  console.log("Current Supply:", currentSupply.toString(), "/", maxSupply.toString());
  
  if (batchMint) {
    // Batch mint all 12 journeys
    console.log("\n🎨 Batch minting all journey NFTs...");
    
    const journeys = Object.keys(JOURNEY_METADATA);
    const recipients = journeys.map(() => recipient || deployer.address);
    const frequencies = journeys.map(j => JOURNEY_METADATA[j].frequency);
    
    console.log("  Journeys:", journeys.length);
    console.log("  Recipient:", recipients[0]);
    
    const tx = await nft.batchMint(recipients, journeys, frequencies);
    console.log("  Transaction:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("  ✅ Batch mint successful!");
    console.log("  Block:", receipt.blockNumber);
    
    // Get new supply
    const newSupply = await nft.totalSupply();
    console.log("  New Supply:", newSupply.toString());
    
  } else {
    // Single mint
    if (!recipient) {
      recipient = deployer.address;
    }
    
    console.log("\n🎨 Minting single NFT...");
    console.log("  Recipient:", recipient);
    console.log("  Journey:", journey);
    console.log("  Frequency:", frequency, "Hz");
    
    // Get journey metadata if available
    const meta = JOURNEY_METADATA[journey];
    if (meta) {
      console.log("  Description:", meta.description);
      frequency = meta.frequency; // Use preset frequency for known journeys
    }
    
    const tx = await nft.mintWithJourney(recipient, journey, frequency);
    console.log("  Transaction:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("  ✅ Mint successful!");
    console.log("  Block:", receipt.blockNumber);
    
    // Get token ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = nft.interface.parseLog(log);
        return parsed && parsed.name === "Minted";
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = nft.interface.parseLog(event);
      console.log("  Token ID:", parsed.args.tokenId.toString());
    }
    
    // Get new supply
    const newSupply = await nft.totalSupply();
    console.log("  New Supply:", newSupply.toString());
  }
  
  console.log("\n🕋 MINTING COMPLETE! 🕋");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Minting failed:", error);
    process.exit(1);
  });
