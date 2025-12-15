const hre = require("hardhat");

async function main() {
  console.log("🍳 Deploying Operation Bounce Back NFT...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Configuration
  const TREASURY_WALLET = process.env.OBB_TREASURY_WALLET || deployer.address;
  const BASE_URI = process.env.OBB_BASE_URI || "https://operationbounceback.org/api/metadata/";

  console.log("Configuration:");
  console.log("- Treasury Wallet:", TREASURY_WALLET);
  console.log("- Base URI:", BASE_URI);
  console.log("");

  // Deploy contract
  const OperationBounceBackNFT = await hre.ethers.getContractFactory("OperationBounceBackNFT");
  console.log("Deploying OperationBounceBackNFT...");
  
  const nft = await OperationBounceBackNFT.deploy(
    deployer.address,  // initialOwner
    TREASURY_WALLET,   // treasuryWallet
    BASE_URI           // baseURI
  );

  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();

  console.log("✅ OperationBounceBackNFT deployed to:", nftAddress);
  console.log("");

  // Verify contract info
  console.log("Contract Information:");
  console.log("- Name:", await nft.name());
  console.log("- Symbol:", await nft.symbol());
  console.log("- Max Supply:", (await nft.MAX_SUPPLY()).toString());
  console.log("- Treasury Wallet:", await nft.treasuryWallet());
  console.log("- Total Minted:", (await nft.totalMinted()).toString());
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: nftAddress,
    deployerAddress: deployer.address,
    treasuryWallet: TREASURY_WALLET,
    baseURI: BASE_URI,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    transactionHash: nft.deploymentTransaction().hash
  };

  console.log("Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");

  // Instructions for verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📝 To verify on block explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${nftAddress} "${deployer.address}" "${TREASURY_WALLET}" "${BASE_URI}"`);
    console.log("");
  }

  console.log("🎉 Deployment complete!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Verify contract on block explorer");
  console.log("2. Set up IPFS metadata for NFTs");
  console.log("3. Test minting functionality");
  console.log("4. Configure charity validator");
  console.log("5. Begin partnership outreach");

  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
