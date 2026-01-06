// Genesis Witness NFT Minting Gateway
// XTOKEN-WEB3 Gateway Integration for cross-browser mint experience

const { ethers } = require("ethers");

/**
 * Genesis Witness Minting Gateway Configuration
 * Provides smooth HTTP endpoints for cross-browser mint experience
 */

const GATEWAY_CONFIG = {
  // Network configuration
  network: {
    chainId: 137, // Polygon Mainnet (or 80001 for Mumbai)
    chainName: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    }
  },

  // Contract configuration
  contract: {
    address: "", // To be filled after deployment
    abi: [], // Genesis Witness NFT ABI
    name: "GenesisWitnessNFT"
  },

  // Gateway endpoints
  endpoints: {
    mint: "/api/genesis/mint",
    status: "/api/genesis/status",
    verify: "/api/genesis/verify",
    statistics: "/api/genesis/statistics",
    leaderboard: "/api/genesis/leaderboard"
  },

  // Wallet support
  wallets: {
    metamask: true,
    walletConnect: true,
    coinbase: true,
    trust: true,
    mobile: true
  },

  // UI configuration
  ui: {
    theme: "dark",
    colors: {
      primary: "#FFD700", // Gold
      secondary: "#9B59B6", // Purple
      accent: "#3498DB", // Blue
      background: "#000000", // Black
      text: "#FFFFFF"
    },
    animations: true,
    soundEffects: true
  }
};

/**
 * Genesis Witness Minting Gateway Class
 */
class GenesisWitnessGateway {
  constructor(config) {
    this.config = config;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.userAddress = null;
  }

  /**
   * Initialize gateway and connect to blockchain
   */
  async initialize() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask detected');
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        throw new Error('MetaMask not installed');
      }

      // Get contract instance
      this.contract = new ethers.Contract(
        this.config.contract.address,
        this.config.contract.abi,
        this.provider
      );

      console.log('✅ Gateway initialized');
      return true;
    } catch (error) {
      console.error('❌ Gateway initialization failed:', error);
      throw error;
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.userAddress = accounts[0];
      this.signer = await this.provider.getSigner();

      // Check network
      const network = await this.provider.getNetwork();
      if (network.chainId !== this.config.network.chainId) {
        await this.switchNetwork();
      }

      console.log('✅ Wallet connected:', this.userAddress);
      return this.userAddress;
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Switch to Polygon network
   */
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.config.network.chainId.toString(16)}` }]
      });
    } catch (error) {
      // Network not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${this.config.network.chainId.toString(16)}`,
            chainName: this.config.network.chainName,
            nativeCurrency: this.config.network.nativeCurrency,
            rpcUrls: [this.config.network.rpcUrl],
            blockExplorerUrls: [this.config.network.blockExplorer]
          }]
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Check mint eligibility
   */
  async checkEligibility() {
    try {
      if (!this.userAddress) {
        throw new Error('Wallet not connected');
      }

      // Check if already minted
      const hasMinted = await this.contract.hasMinted(this.userAddress);
      if (hasMinted) {
        return {
          eligible: false,
          reason: 'Already minted Genesis Witness NFT'
        };
      }

      // Check supply
      const totalMinted = await this.contract.totalMinted();
      const maxSupply = await this.contract.MAX_SUPPLY();
      
      if (totalMinted >= maxSupply) {
        return {
          eligible: false,
          reason: 'Max supply reached'
        };
      }

      // Check if drop is active
      const isActive = await this.contract.genesisDropActive();
      if (!isActive) {
        return {
          eligible: false,
          reason: 'Genesis Drop not active'
        };
      }

      // Get current price
      const currentPrice = await this.contract.getCurrentMintPrice();
      const isFree = currentPrice.toString() === '0';

      return {
        eligible: true,
        price: ethers.formatEther(currentPrice),
        isFree: isFree,
        freeMints: await this.contract.getRemainingFreeMints()
      };
    } catch (error) {
      console.error('❌ Eligibility check failed:', error);
      throw error;
    }
  }

  /**
   * Mint Genesis Witness NFT
   */
  async mint() {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      // Check eligibility
      const eligibility = await this.checkEligibility();
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }

      // Get contract with signer
      const contractWithSigner = this.contract.connect(this.signer);

      // Prepare transaction
      const mintPrice = await this.contract.getCurrentMintPrice();
      const txOptions = {
        value: mintPrice,
        gasLimit: 300000 // Adjust as needed
      };

      console.log('🎵 Minting Genesis Witness NFT...');
      console.log('Price:', ethers.formatEther(mintPrice), 'MATIC');

      // Send transaction
      const tx = await contractWithSigner.mintGenesisWitness(txOptions);
      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Minted successfully!');

      // Parse events to get token ID
      const event = receipt.logs.find(log => {
        try {
          const parsed = contractWithSigner.interface.parseLog(log);
          return parsed && parsed.name === 'GenesisWitnessMinted';
        } catch (e) {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsed = contractWithSigner.interface.parseLog(event);
        tokenId = parsed.args.tokenId.toString();
      }

      return {
        success: true,
        txHash: tx.hash,
        tokenId: tokenId,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Minting failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Claim QR verification
   */
  async claimQRVerification(qrHash) {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const contractWithSigner = this.contract.connect(this.signer);

      console.log('🔐 Claiming QR verification...');

      const tx = await contractWithSigner.claimQRVerification(qrHash);
      const receipt = await tx.wait();

      console.log('✅ QR verification claimed!');

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ QR verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contract statistics
   */
  async getStatistics() {
    try {
      const stats = await this.contract.getStatistics();
      const currentPrice = await this.contract.getCurrentMintPrice();
      const maxSupply = await this.contract.MAX_SUPPLY();
      const freeMintLimit = await this.contract.FREE_MINT_LIMIT();

      return {
        totalMinted: stats.totalMinted_.toString(),
        totalFree: stats.totalFree.toString(),
        totalPaid: stats.totalPaid.toString(),
        fundsCollected: ethers.formatEther(stats.fundsCollected),
        currentPrice: ethers.formatEther(currentPrice),
        maxSupply: maxSupply.toString(),
        freeMintLimit: freeMintLimit.toString(),
        remainingSupply: (maxSupply - stats.totalMinted_).toString(),
        progress: (stats.totalMinted_ * 100n / maxSupply).toString()
      };
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      throw error;
    }
  }

  /**
   * Get witness record for connected user
   */
  async getMyWitnessRecord() {
    try {
      if (!this.userAddress) {
        throw new Error('Wallet not connected');
      }

      const hasMinted = await this.contract.hasMinted(this.userAddress);
      if (!hasMinted) {
        return null;
      }

      const tokenId = await this.contract.witnessToTokenId(this.userAddress);
      const record = await this.contract.getWitnessRecord(tokenId);

      return {
        tokenId: tokenId.toString(),
        witness: record.witness,
        mintTimestamp: new Date(Number(record.mintTimestamp) * 1000).toISOString(),
        mintPrice: ethers.formatEther(record.mintPrice),
        isFoundingWitness: record.isFoundingWitness,
        engagementScore: record.engagementScore.toString(),
        hasQRVerification: record.qrVerification !== ethers.ZeroHash
      };
    } catch (error) {
      console.error('❌ Failed to get witness record:', error);
      throw error;
    }
  }

  /**
   * Listen to minting events
   */
  listenToMintEvents(callback) {
    this.contract.on('GenesisWitnessMinted', (tokenId, witness, mintPrice, isFoundingWitness, timestamp, event) => {
      callback({
        tokenId: tokenId.toString(),
        witness: witness,
        mintPrice: ethers.formatEther(mintPrice),
        isFoundingWitness: isFoundingWitness,
        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
        txHash: event.log.transactionHash
      });
    });
  }

  /**
   * Stop listening to events
   */
  stopListening() {
    this.contract.removeAllListeners();
  }
}

/**
 * HTTP API Endpoint Handlers
 * For backend integration
 */

const API_HANDLERS = {
  /**
   * POST /api/genesis/mint
   * Mint Genesis Witness NFT via API
   */
  async handleMint(req, res) {
    try {
      const { walletAddress, signature } = req.body;

      // Verify signature
      // ... signature verification logic

      // Check eligibility
      // ... eligibility check

      // Return mint transaction
      res.json({
        success: true,
        message: 'Mint successful',
        // ... transaction details
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/genesis/status
   * Get current Genesis Drop status
   */
  async handleStatus(req, res) {
    try {
      // Get contract statistics
      const gateway = new GenesisWitnessGateway(GATEWAY_CONFIG);
      await gateway.initialize();
      const stats = await gateway.getStatistics();

      res.json({
        success: true,
        status: 'active',
        statistics: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * POST /api/genesis/verify
   * Verify QR code
   */
  async handleVerify(req, res) {
    try {
      const { walletAddress, qrCode } = req.body;

      // Verify QR code
      // ... verification logic

      res.json({
        success: true,
        verified: true,
        engagementBonus: 10
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

// Export
module.exports = {
  GATEWAY_CONFIG,
  GenesisWitnessGateway,
  API_HANDLERS
};

// Example usage in browser
if (typeof window !== 'undefined') {
  window.GenesisWitnessGateway = GenesisWitnessGateway;
  window.GATEWAY_CONFIG = GATEWAY_CONFIG;
}
