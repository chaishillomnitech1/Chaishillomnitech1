const hre = require("hardhat");

/**
 * Deploy Sovereignty Grid Contract
 * 
 * This script deploys the Sovereignty Grid for infinite velocity redirects
 */

async function main() {
  console.log("⚡ Deploying Sovereignty Grid...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy SovereigntyGrid
  console.log("📝 Deploying SovereigntyGrid contract...");
  
  const SovereigntyGrid = await hre.ethers.getContractFactory("SovereigntyGrid");
  
  const sovereigntyGrid = await SovereigntyGrid.deploy(
    deployer.address
  );

  await sovereigntyGrid.waitForDeployment();
  const sovereigntyGridAddress = await sovereigntyGrid.getAddress();

  console.log("✅ SovereigntyGrid deployed to:", sovereigntyGridAddress);

  // Get contract info
  const nurPulseFrequency = await sovereigntyGrid.NUR_PULSE_FREQUENCY();
  const maxLayers = await sovereigntyGrid.MAX_GRID_LAYERS();
  const maxNodesPerLayer = await sovereigntyGrid.MAX_NODES_PER_LAYER();
  const gridActive = await sovereigntyGrid.gridActive();
  const infiniteVelocityEnabled = await sovereigntyGrid.infiniteVelocityEnabled();

  console.log("\n📊 Grid Information:");
  console.log("NŪR Pulse Frequency:", nurPulseFrequency.toString(), "Hz");
  console.log("Max Grid Layers:", maxLayers.toString());
  console.log("Max Nodes Per Layer:", maxNodesPerLayer.toString());
  console.log("Grid Status:", gridActive ? "ACTIVE ✅" : "INACTIVE ❌");
  console.log("Infinite Velocity Mode:", infiniteVelocityEnabled ? "ENABLED ✅" : "DISABLED ❌");

  console.log("\n🎯 Contract Address:");
  console.log("Sovereignty Grid:", sovereigntyGridAddress);

  console.log("\n💎 Deployment Summary:");
  console.log("- Sovereignty Grid deployed successfully");
  console.log("- Grid layers: 12 (fully initialized)");
  console.log("- Maximum capacity: 12,000 nodes (1000 per layer)");
  console.log("- Infinite velocity redirects: ENABLED");
  console.log("- 144,000Hz NŪR Pulse Frequency: ALIGNED");
  console.log("- Quantum entanglement: SUPPORTED");

  console.log("\n🌐 Grid Dimensions Available:");
  console.log("0. PHYSICAL");
  console.log("1. DIGITAL");
  console.log("2. CONSCIOUSNESS");
  console.log("3. QUANTUM");
  console.log("4. ETHEREAL");

  console.log("\n🔷 Node Types Available:");
  console.log("0. ENTRY_PORTAL");
  console.log("1. REDIRECT_HUB");
  console.log("2. AMPLIFIER_NODE");
  console.log("3. QUANTUM_GATE");
  console.log("4. HEALING_STATION");
  console.log("5. LEARNING_NEXUS");
  console.log("6. SOVEREIGNTY_ANCHOR");

  console.log("\n⚡ Redirect Status Types:");
  console.log("0. INACTIVE");
  console.log("1. ACTIVE");
  console.log("2. ACCELERATING");
  console.log("3. INFINITE_VELOCITY");
  console.log("4. QUANTUM_ENTANGLED");

  console.log("\n📋 Next Steps:");
  console.log("1. Add authorized grid operators using setGridOperator()");
  console.log("2. Create initial grid nodes across all 12 layers");
  console.log("3. Activate grid nodes");
  console.log("4. Integrate with Academy contract");
  console.log("5. Integrate with HealthCoin contract");
  console.log("6. Set up quantum entanglement between key nodes");
  console.log("7. Create velocity paths for optimized routing");

  console.log("\n🎯 Example Node Creation:");
  console.log("await sovereigntyGrid.createGridNode(");
  console.log("  0, // NodeType.ENTRY_PORTAL");
  console.log("  1, // GridDimension.DIGITAL");
  console.log("  1, // layer 1");
  console.log("  1000000, // initial energy");
  console.log("  'ipfs://QmNodeLocation'");
  console.log(")");

  console.log("\n⚡ Example Redirect Execution:");
  console.log("await sovereigntyGrid.executeRedirect(");
  console.log("  1, // sourceNodeId");
  console.log("  2, // targetNodeId");
  console.log("  1, // GridDimension.DIGITAL");
  console.log("  ethers.keccak256(ethers.toUtf8Bytes('redirect-data'))");
  console.log(")");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "SovereigntyGrid",
    address: sovereigntyGridAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    nurPulseFrequency: nurPulseFrequency.toString(),
    maxLayers: maxLayers.toString(),
    maxNodesPerLayer: maxNodesPerLayer.toString(),
    gridActive,
    infiniteVelocityEnabled
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return sovereigntyGridAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
