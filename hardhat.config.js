require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const deployerAccounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];
const networks = {
  hardhat: { chainId: 1337 },
  scrollMainnet: {
    url: process.env.SCROLL_MAINNET_RPC_URL || "https://rpc.scroll.io",
    accounts: deployerAccounts,
    chainId: 534352,
    gasPrice: 1000000000,
  },
  scrollSepolia: {
    url: process.env.SCROLL_SEPOLIA_RPC_URL || "https://sepolia-rpc.scroll.io",
    accounts: deployerAccounts,
    chainId: 534351,
    gasPrice: 1000000000,
  },
  ethereum: {
    url: process.env.ETHEREUM_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/demo",
    accounts: deployerAccounts,
    chainId: 1,
    gasPrice: "auto",
  },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/",
    accounts: deployerAccounts,
    chainId: 11155111,
    gasPrice: "auto",
  },
};

// Polygon PoS Amoy and mainnet are separate, explicitly configured targets.
if (process.env.AMOY_RPC_URL) {
  networks.amoy = {
    url: process.env.AMOY_RPC_URL,
    accounts: deployerAccounts,
    chainId: 80002,
    gasPrice: "auto",
  };
}
if (process.env.POLYGON_RPC_URL) {
  networks.polygon = {
    url: process.env.POLYGON_RPC_URL,
    accounts: deployerAccounts,
    chainId: 137,
    gasPrice: "auto",
  };
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks,
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      ethereum: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      scrollMainnet: process.env.SCROLLSCAN_API_KEY || "",
      scrollSepolia: process.env.SCROLLSCAN_API_KEY || "",
      scroll: process.env.SCROLLSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
      {
        network: "scrollMainnet",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com",
        },
      },
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com",
        },
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: { timeout: 40000 },
};
