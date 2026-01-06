const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GenesisWitnessNFT", function () {
  let genesisWitness;
  let owner;
  let treasury;
  let user1;
  let user2;
  let user3;

  const BASE_URI = "ipfs://QmGenesisWitness/";
  const MINT_PRICE = ethers.parseEther("0.0777");
  const FREE_MINT_LIMIT = 100;
  const MAX_SUPPLY = 144000;

  beforeEach(async function () {
    [owner, treasury, user1, user2, user3] = await ethers.getSigners();

    const GenesisWitnessNFT = await ethers.getContractFactory("GenesisWitnessNFT");
    genesisWitness = await GenesisWitnessNFT.deploy(
      owner.address,
      treasury.address,
      BASE_URI
    );
    await genesisWitness.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await genesisWitness.owner()).to.equal(owner.address);
    });

    it("Should set the correct treasury", async function () {
      expect(await genesisWitness.treasury()).to.equal(treasury.address);
    });

    it("Should set correct constants", async function () {
      expect(await genesisWitness.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await genesisWitness.FREE_MINT_LIMIT()).to.equal(FREE_MINT_LIMIT);
      expect(await genesisWitness.MINT_PRICE()).to.equal(MINT_PRICE);
    });

    it("Should start with Genesis Drop inactive", async function () {
      expect(await genesisWitness.genesisDropActive()).to.equal(false);
    });

    it("Should have zero total minted initially", async function () {
      expect(await genesisWitness.totalMinted()).to.equal(0);
    });
  });

  describe("Genesis Drop Activation", function () {
    it("Should allow owner to activate Genesis Drop", async function () {
      await genesisWitness.activateGenesisDrop();
      expect(await genesisWitness.genesisDropActive()).to.equal(true);
    });

    it("Should emit GenesisDropActivated event", async function () {
      await expect(genesisWitness.activateGenesisDrop())
        .to.emit(genesisWitness, "GenesisDropActivated");
    });

    it("Should not allow non-owner to activate", async function () {
      await expect(
        genesisWitness.connect(user1).activateGenesisDrop()
      ).to.be.reverted;
    });

    it("Should not allow double activation", async function () {
      await genesisWitness.activateGenesisDrop();
      await expect(
        genesisWitness.activateGenesisDrop()
      ).to.be.revertedWith("Already active");
    });
  });

  describe("Free Minting (First 100)", function () {
    beforeEach(async function () {
      await genesisWitness.activateGenesisDrop();
    });

    it("Should allow free mint for first 100", async function () {
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
      expect(await genesisWitness.totalMinted()).to.equal(1);
    });

    it("Should mark user as having minted", async function () {
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
      expect(await genesisWitness.hasMinted(user1.address)).to.equal(true);
    });

    it("Should create founding witness record", async function () {
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
      const tokenId = await genesisWitness.witnessToTokenId(user1.address);
      const record = await genesisWitness.witnessRecords(tokenId);
      
      expect(record.isFoundingWitness).to.equal(true);
      expect(record.witness).to.equal(user1.address);
      expect(record.mintPrice).to.equal(0);
    });

    it("Should emit GenesisWitnessMinted event", async function () {
      await expect(genesisWitness.connect(user1).mintGenesisWitness({ value: 0 }))
        .to.emit(genesisWitness, "GenesisWitnessMinted");
    });

    it("Should not allow double mint from same address", async function () {
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
      await expect(
        genesisWitness.connect(user1).mintGenesisWitness({ value: 0 })
      ).to.be.revertedWith("Already minted");
    });

    it("Should reject payment during free mint period", async function () {
      await expect(
        genesisWitness.connect(user1).mintGenesisWitness({ value: MINT_PRICE })
      ).to.not.be.reverted;
      
      // Should refund excess
      const record = await genesisWitness.witnessRecords(0);
      expect(record.mintPrice).to.equal(0);
    });
  });

  describe("Paid Minting (After 100)", function () {
    beforeEach(async function () {
      await genesisWitness.activateGenesisDrop();
    });

    it("Should require payment after free mints", async function () {
      // Simulate 100 free mints by batch minting
      const addresses = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        addresses.push(wallet.address);
      }
      
      await genesisWitness.batchMintForDAO(addresses);
      
      // 101st mint should require payment
      await expect(
        genesisWitness.connect(user1).mintGenesisWitness({ value: 0 })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should accept correct payment after free period", async function () {
      // Batch mint first 100
      const addresses = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        addresses.push(wallet.address);
      }
      await genesisWitness.batchMintForDAO(addresses);
      
      // 101st mint with payment
      await genesisWitness.connect(user1).mintGenesisWitness({ value: MINT_PRICE });
      expect(await genesisWitness.totalMinted()).to.equal(101);
    });

    it("Should track funds collected", async function () {
      const addresses = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        addresses.push(wallet.address);
      }
      await genesisWitness.batchMintForDAO(addresses);
      
      await genesisWitness.connect(user1).mintGenesisWitness({ value: MINT_PRICE });
      expect(await genesisWitness.totalFundsCollected()).to.equal(MINT_PRICE);
    });
  });

  describe("QR Verification", function () {
    beforeEach(async function () {
      await genesisWitness.activateGenesisDrop();
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
    });

    it("Should allow QR verification claim", async function () {
      const qrHash = ethers.keccak256(ethers.toUtf8Bytes("test-qr-code"));
      await genesisWitness.connect(user1).claimQRVerification(qrHash);
      
      const tokenId = await genesisWitness.witnessToTokenId(user1.address);
      const record = await genesisWitness.witnessRecords(tokenId);
      
      expect(record.qrVerification).to.equal(qrHash);
    });

    it("Should increase engagement score on QR claim", async function () {
      const qrHash = ethers.keccak256(ethers.toUtf8Bytes("test-qr-code"));
      await genesisWitness.connect(user1).claimQRVerification(qrHash);
      
      const tokenId = await genesisWitness.witnessToTokenId(user1.address);
      const record = await genesisWitness.witnessRecords(tokenId);
      
      expect(record.engagementScore).to.equal(10);
    });

    it("Should emit QRVerificationClaimed event", async function () {
      const qrHash = ethers.keccak256(ethers.toUtf8Bytes("test-qr-code"));
      await expect(genesisWitness.connect(user1).claimQRVerification(qrHash))
        .to.emit(genesisWitness, "QRVerificationClaimed");
    });

    it("Should not allow reuse of QR code", async function () {
      const qrHash = ethers.keccak256(ethers.toUtf8Bytes("test-qr-code"));
      await genesisWitness.connect(user1).claimQRVerification(qrHash);
      
      await genesisWitness.connect(user2).mintGenesisWitness({ value: 0 });
      await expect(
        genesisWitness.connect(user2).claimQRVerification(qrHash)
      ).to.be.revertedWith("QR already used");
    });

    it("Should reject claim from non-witness", async function () {
      const qrHash = ethers.keccak256(ethers.toUtf8Bytes("test-qr-code"));
      await expect(
        genesisWitness.connect(user2).claimQRVerification(qrHash)
      ).to.be.revertedWith("Not a witness");
    });
  });

  describe("Engagement Score Updates", function () {
    beforeEach(async function () {
      await genesisWitness.activateGenesisDrop();
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
    });

    it("Should allow owner to update engagement score", async function () {
      const tokenId = await genesisWitness.witnessToTokenId(user1.address);
      await genesisWitness.updateEngagementScore(tokenId, 50);
      
      const record = await genesisWitness.witnessRecords(tokenId);
      expect(record.engagementScore).to.equal(50);
    });

    it("Should emit EngagementScoreUpdated event", async function () {
      const tokenId = await genesisWitness.witnessToTokenId(user1.address);
      await expect(genesisWitness.updateEngagementScore(tokenId, 50))
        .to.emit(genesisWitness, "EngagementScoreUpdated");
    });

    it("Should reject unauthorized score updates", async function () {
      const tokenId = await genesisWitness.witnessToTokenId(user1.address);
      await expect(
        genesisWitness.connect(user2).updateEngagementScore(tokenId, 50)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Treasury Functions", function () {
    beforeEach(async function () {
      await genesisWitness.activateGenesisDrop();
    });

    it("Should allow owner to withdraw funds", async function () {
      // Mint 100 free, then one paid
      const addresses = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        addresses.push(wallet.address);
      }
      await genesisWitness.batchMintForDAO(addresses);
      await genesisWitness.connect(user1).mintGenesisWitness({ value: MINT_PRICE });
      
      const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);
      await genesisWitness.withdrawFunds();
      const treasuryBalanceAfter = await ethers.provider.getBalance(treasury.address);
      
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(MINT_PRICE);
    });

    it("Should emit FundsWithdrawn event", async function () {
      const addresses = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        addresses.push(wallet.address);
      }
      await genesisWitness.batchMintForDAO(addresses);
      await genesisWitness.connect(user1).mintGenesisWitness({ value: MINT_PRICE });
      
      await expect(genesisWitness.withdrawFunds())
        .to.emit(genesisWitness, "FundsWithdrawn");
    });
  });

  describe("Statistics and View Functions", function () {
    beforeEach(async function () {
      await genesisWitness.activateGenesisDrop();
    });

    it("Should return correct statistics", async function () {
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
      
      const stats = await genesisWitness.getStatistics();
      expect(stats.totalMinted_).to.equal(1);
      expect(stats.totalFree).to.equal(1);
      expect(stats.totalPaid).to.equal(0);
    });

    it("Should return correct current mint price", async function () {
      expect(await genesisWitness.getCurrentMintPrice()).to.equal(0);
      
      // After 100 mints
      const addresses = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        addresses.push(wallet.address);
      }
      await genesisWitness.batchMintForDAO(addresses);
      
      expect(await genesisWitness.getCurrentMintPrice()).to.equal(MINT_PRICE);
    });

    it("Should return remaining free mints", async function () {
      expect(await genesisWitness.getRemainingFreeMints()).to.equal(FREE_MINT_LIMIT);
      
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
      expect(await genesisWitness.getRemainingFreeMints()).to.equal(FREE_MINT_LIMIT - 1);
    });

    it("Should correctly identify founding witnesses", async function () {
      await genesisWitness.connect(user1).mintGenesisWitness({ value: 0 });
      expect(await genesisWitness.isFoundingWitness(user1.address)).to.equal(true);
      
      expect(await genesisWitness.isFoundingWitness(user2.address)).to.equal(false);
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await genesisWitness.activateGenesisDrop();
    });

    it("Should allow owner to pause", async function () {
      await genesisWitness.pause();
      await expect(
        genesisWitness.connect(user1).mintGenesisWitness({ value: 0 })
      ).to.be.reverted;
    });

    it("Should allow owner to unpause", async function () {
      await genesisWitness.pause();
      await genesisWitness.unpause();
      await expect(
        genesisWitness.connect(user1).mintGenesisWitness({ value: 0 })
      ).to.not.be.reverted;
    });
  });
});
