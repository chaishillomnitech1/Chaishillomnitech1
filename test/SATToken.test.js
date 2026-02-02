const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SATToken", function () {
  let satToken;
  let owner;
  let zakatWallet;
  let user1;
  let user2;
  let qfsContract;

  const NISAB_THRESHOLD = ethers.parseEther("5100");
  const GENESIS_MINT_AMOUNT = ethers.parseEther("100000000");
  const MAX_SUPPLY = ethers.parseEther("1000000000");
  const ZAKAT_RATE = 250; // 2.5%
  const ZAKAT_INTERVAL = 354 * 24 * 60 * 60; // 354 days in seconds

  beforeEach(async function () {
    [owner, zakatWallet, user1, user2, qfsContract] = await ethers.getSigners();

    const SATToken = await ethers.getContractFactory("SATToken");
    satToken = await SATToken.deploy(
      owner.address,
      zakatWallet.address,
      NISAB_THRESHOLD
    );
    await satToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await satToken.name()).to.equal("ScrollVerse Asset Token");
      expect(await satToken.symbol()).to.equal("SAT");
    });

    it("Should set the correct owner", async function () {
      expect(await satToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct Zakat wallet", async function () {
      expect(await satToken.zakatWallet()).to.equal(zakatWallet.address);
    });

    it("Should set the correct Nisab threshold", async function () {
      expect(await satToken.nisabThreshold()).to.equal(NISAB_THRESHOLD);
    });

    it("Should exempt owner and Zakat wallet from Zakat", async function () {
      expect(await satToken.zakatExempt(owner.address)).to.be.true;
      expect(await satToken.zakatExempt(zakatWallet.address)).to.be.true;
    });

    it("Should have correct constants", async function () {
      expect(await satToken.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await satToken.GENESIS_MINT_AMOUNT()).to.equal(GENESIS_MINT_AMOUNT);
      expect(await satToken.ZAKAT_RATE()).to.equal(ZAKAT_RATE);
    });
  });

  describe("Genesis Mint", function () {
    it("Should execute Genesis Mint successfully", async function () {
      await expect(satToken.executeGenesisMint(user1.address))
        .to.emit(satToken, "GenesisMintCompleted")
        .withArgs(user1.address, GENESIS_MINT_AMOUNT, await time.latest() + 1);

      expect(await satToken.totalSupply()).to.equal(GENESIS_MINT_AMOUNT);
      expect(await satToken.balanceOf(user1.address)).to.equal(GENESIS_MINT_AMOUNT);
      expect(await satToken.genesisMintCompleted()).to.be.true;
    });

    it("Should only allow owner to execute Genesis Mint", async function () {
      await expect(
        satToken.connect(user1).executeGenesisMint(user1.address)
      ).to.be.revertedWithCustomError(satToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow Genesis Mint twice", async function () {
      await satToken.executeGenesisMint(user1.address);
      
      await expect(
        satToken.executeGenesisMint(user2.address)
      ).to.be.revertedWith("Genesis mint already completed");
    });

    it("Should reject zero address as recipient", async function () {
      await expect(
        satToken.executeGenesisMint(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await satToken.executeGenesisMint(owner.address);
    });

    it("Should mint tokens within MAX_SUPPLY", async function () {
      const mintAmount = ethers.parseEther("1000000");
      await satToken.mint(user1.address, mintAmount);
      
      expect(await satToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not exceed MAX_SUPPLY", async function () {
      const exceedAmount = MAX_SUPPLY;
      
      await expect(
        satToken.mint(user1.address, exceedAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("Should only allow owner to mint", async function () {
      await expect(
        satToken.connect(user1).mint(user1.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(satToken, "OwnableUnauthorizedAccount");
    });

    it("Should not mint when paused", async function () {
      await satToken.pause();
      
      await expect(
        satToken.mint(user1.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(satToken, "EnforcedPause");
    });
  });

  describe("Zakat Framework", function () {
    it("Should calculate Zakat correctly", async function () {
      const balance = ethers.parseEther("10000");
      const expectedZakat = (balance * BigInt(ZAKAT_RATE)) / BigInt(10000);
      
      expect(await satToken.calculateZakat(balance)).to.equal(expectedZakat);
    });

    it("Should allow manual Zakat contribution", async function () {
      await satToken.executeGenesisMint(owner.address);
      await satToken.transfer(user1.address, ethers.parseEther("100000"));

      const zakatAmount = ethers.parseEther("2500");
      await expect(satToken.connect(user1).contributeZakat(zakatAmount))
        .to.emit(satToken, "ZakatCollected")
        .withArgs(user1.address, zakatAmount, await time.latest() + 1);

      expect(await satToken.balanceOf(zakatWallet.address)).to.equal(zakatAmount);
      expect(await satToken.totalZakatCollected()).to.equal(zakatAmount);
    });

    it("Should reject Zakat contribution with insufficient balance", async function () {
      await expect(
        satToken.connect(user1).contributeZakat(ethers.parseEther("100"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not collect Zakat before interval", async function () {
      await expect(
        satToken.collectZakat()
      ).to.be.revertedWith("Zakat interval not reached");
    });

    it("Should allow Zakat collection after interval", async function () {
      await time.increase(ZAKAT_INTERVAL);
      
      await expect(satToken.collectZakat())
        .to.emit(satToken, "ZakatDistributed");
    });
  });

  describe("QFS Integration", function () {
    it("Should set QFS integration contract", async function () {
      await expect(satToken.setQFSIntegration(qfsContract.address))
        .to.emit(satToken, "QFSIntegrationUpdated")
        .withArgs(ethers.ZeroAddress, qfsContract.address);

      expect(await satToken.qfsIntegrationContract()).to.equal(qfsContract.address);
    });

    it("Should only allow owner to set QFS contract", async function () {
      await expect(
        satToken.connect(user1).setQFSIntegration(qfsContract.address)
      ).to.be.revertedWithCustomError(satToken, "OwnableUnauthorizedAccount");
    });

    it("Should reject zero address for QFS contract", async function () {
      await expect(
        satToken.setQFSIntegration(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid QFS contract");
    });

    it("Should only allow QFS contract to sync", async function () {
      await satToken.setQFSIntegration(qfsContract.address);
      
      await satToken.connect(qfsContract).syncWithQFS(user1.address);
      
      await expect(
        satToken.connect(user1).syncWithQFS(user1.address)
      ).to.be.revertedWith("Only QFS contract");
    });
  });

  describe("Admin Functions", function () {
    it("Should update Zakat wallet", async function () {
      await expect(satToken.setZakatWallet(user1.address))
        .to.emit(satToken, "ZakatWalletUpdated")
        .withArgs(zakatWallet.address, user1.address);

      expect(await satToken.zakatWallet()).to.equal(user1.address);
      expect(await satToken.zakatExempt(user1.address)).to.be.true;
    });

    it("Should update Nisab threshold", async function () {
      const newThreshold = ethers.parseEther("6000");
      
      await expect(satToken.setNisabThreshold(newThreshold))
        .to.emit(satToken, "NisabThresholdUpdated")
        .withArgs(NISAB_THRESHOLD, newThreshold);

      expect(await satToken.nisabThreshold()).to.equal(newThreshold);
    });

    it("Should set Zakat exemption", async function () {
      await expect(satToken.setZakatExemption(user1.address, true))
        .to.emit(satToken, "ZakatExemptionUpdated")
        .withArgs(user1.address, true);

      expect(await satToken.zakatExempt(user1.address)).to.be.true;
    });

    it("Should pause and unpause", async function () {
      await satToken.pause();
      expect(await satToken.paused()).to.be.true;

      await satToken.unpause();
      expect(await satToken.paused()).to.be.false;
    });

    it("Should only allow owner to pause", async function () {
      await expect(
        satToken.connect(user1).pause()
      ).to.be.revertedWithCustomError(satToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Transfers", function () {
    beforeEach(async function () {
      await satToken.executeGenesisMint(owner.address);
    });

    it("Should transfer tokens successfully", async function () {
      const transferAmount = ethers.parseEther("1000");
      await satToken.transfer(user1.address, transferAmount);
      
      expect(await satToken.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should not transfer when paused", async function () {
      await satToken.pause();
      
      await expect(
        satToken.transfer(user1.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(satToken, "EnforcedPause");
    });

    it("Should allow transfers after unpause", async function () {
      await satToken.pause();
      await satToken.unpause();
      
      const transferAmount = ethers.parseEther("1000");
      await satToken.transfer(user1.address, transferAmount);
      
      expect(await satToken.balanceOf(user1.address)).to.equal(transferAmount);
    });
  });
});
