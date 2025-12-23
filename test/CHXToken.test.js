const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CHXToken Contract Tests", function () {
  let chxToken;
  let owner;
  let creatorVault;
  let ambassadorVault;
  let daoVault;
  let addr1;
  
  beforeEach(async function () {
    [owner, creatorVault, ambassadorVault, daoVault, addr1] = await ethers.getSigners();
    
    const CHXToken = await ethers.getContractFactory("CHXToken");
    chxToken = await CHXToken.deploy(
      creatorVault.address,
      ambassadorVault.address,
      daoVault.address
    );
    await chxToken.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await chxToken.name()).to.equal("CHXToken");
      expect(await chxToken.symbol()).to.equal("CHX");
    });
    
    it("Should set the correct owner", async function () {
      expect(await chxToken.owner()).to.equal(owner.address);
    });
    
    it("Should mint cosmic reserve to deployer", async function () {
      const cosmicReserve = await chxToken.COSMIC_RESERVE();
      expect(await chxToken.totalSupply()).to.equal(cosmicReserve);
      expect(await chxToken.balanceOf(owner.address)).to.equal(cosmicReserve);
    });
    
    it("Should set the correct vault addresses", async function () {
      expect(await chxToken.creatorVault()).to.equal(creatorVault.address);
      expect(await chxToken.ambassadorVault()).to.equal(ambassadorVault.address);
      expect(await chxToken.daoVault()).to.equal(daoVault.address);
    });
    
    it("Should set the correct frequencies", async function () {
      expect(await chxToken.DIVINE_FREQUENCY()).to.equal(144000);
      expect(await chxToken.HEALING_FREQUENCY()).to.equal(528);
      expect(await chxToken.SOUL_FREQUENCY()).to.equal(777);
    });
    
    it("Should initialize deployer with divine frequency", async function () {
      expect(await chxToken.getFrequencySignature(owner.address)).to.equal(144000);
    });
  });
  
  describe("Frequency Alignment", function () {
    it("Should allow owner to align frequency", async function () {
      await chxToken.alignFrequency(addr1.address, 528);
      expect(await chxToken.getFrequencySignature(addr1.address)).to.equal(528);
    });
    
    it("Should emit FrequencyAligned event", async function () {
      await expect(chxToken.alignFrequency(addr1.address, 777))
        .to.emit(chxToken, "FrequencyAligned")
        .withArgs(addr1.address, 777);
    });
    
    it("Should not allow non-owner to align frequency", async function () {
      await expect(
        chxToken.connect(addr1).alignFrequency(addr1.address, 528)
      ).to.be.reverted;
    });
    
    it("Should fail with invalid address", async function () {
      await expect(
        chxToken.alignFrequency(ethers.ZeroAddress, 528)
      ).to.be.revertedWith("Invalid account");
    });
    
    it("Should fail with invalid frequency", async function () {
      await expect(
        chxToken.alignFrequency(addr1.address, 0)
      ).to.be.revertedWith("Invalid frequency");
    });
  });
  
  describe("Passive Income", function () {
    it("Should calculate passive income correctly", async function () {
      // Transfer tokens to addr1
      const amount = ethers.parseEther("1000000");
      await chxToken.transfer(addr1.address, amount);
      
      // Fast forward time by 1 day
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      const passiveIncome = await chxToken.calculatePassiveIncome(addr1.address);
      expect(passiveIncome).to.be.gt(0);
    });
    
    it("Should return zero passive income for zero balance", async function () {
      const passiveIncome = await chxToken.calculatePassiveIncome(addr1.address);
      expect(passiveIncome).to.equal(0);
    });
  });
  
  describe("BlessingCoin", function () {
    it("Should mint BlessingCoin", async function () {
      const amount = 100;
      await chxToken.mintBlessingCoin(addr1.address, amount);
      
      expect(await chxToken.getBlessingCoinBalance(addr1.address)).to.equal(amount);
      expect(await chxToken.totalBlessingCoins()).to.equal(amount);
    });
    
    it("Should emit BlessingCoinMinted event", async function () {
      await expect(chxToken.mintBlessingCoin(addr1.address, 100))
        .to.emit(chxToken, "BlessingCoinMinted")
        .withArgs(addr1.address, 100);
    });
    
    it("Should only allow owner to mint BlessingCoin", async function () {
      await expect(
        chxToken.connect(addr1).mintBlessingCoin(addr1.address, 100)
      ).to.be.reverted;
    });
    
    it("Should fail with invalid address", async function () {
      await expect(
        chxToken.mintBlessingCoin(ethers.ZeroAddress, 100)
      ).to.be.revertedWith("Invalid account");
    });
    
    it("Should fail with zero amount", async function () {
      await expect(
        chxToken.mintBlessingCoin(addr1.address, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });
  
  describe("Pause Mechanism", function () {
    it("Should allow owner to pause", async function () {
      await chxToken.pause();
      // Paused state is checked in transfers
    });
    
    it("Should allow owner to unpause", async function () {
      await chxToken.pause();
      await chxToken.unpause();
    });
    
    it("Should prevent transfers when paused", async function () {
      await chxToken.pause();
      await expect(
        chxToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });
    
    it("Should allow transfers when unpaused", async function () {
      await chxToken.pause();
      await chxToken.unpause();
      await expect(
        chxToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to update creator vault", async function () {
      await chxToken.setCreatorVault(addr1.address);
      expect(await chxToken.creatorVault()).to.equal(addr1.address);
    });
    
    it("Should allow owner to update ambassador vault", async function () {
      await chxToken.setAmbassadorVault(addr1.address);
      expect(await chxToken.ambassadorVault()).to.equal(addr1.address);
    });
    
    it("Should allow owner to update DAO vault", async function () {
      await chxToken.setDaoVault(addr1.address);
      expect(await chxToken.daoVault()).to.equal(addr1.address);
    });
    
    it("Should not allow non-owner to update vaults", async function () {
      await expect(
        chxToken.connect(addr1).setCreatorVault(addr1.address)
      ).to.be.reverted;
    });
    
    it("Should fail with zero address for vaults", async function () {
      await expect(
        chxToken.setCreatorVault(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid vault");
    });
  });
  
  describe("Royalty Constants", function () {
    it("Should have correct royalty percentages", async function () {
      expect(await chxToken.CREATOR_ROYALTY()).to.equal(1000); // 10%
      expect(await chxToken.AMBASSADOR_ROYALTY()).to.equal(500); // 5%
      expect(await chxToken.DAO_ROYALTY()).to.equal(200); // 2%
    });
  });
  
  describe("Transfer", function () {
    it("Should transfer tokens correctly", async function () {
      const amount = ethers.parseEther("1000");
      await chxToken.transfer(addr1.address, amount);
      expect(await chxToken.balanceOf(addr1.address)).to.equal(amount);
    });
    
    it("Should burn tokens correctly", async function () {
      const amount = ethers.parseEther("1000");
      const totalSupplyBefore = await chxToken.totalSupply();
      await chxToken.burn(amount);
      expect(await chxToken.totalSupply()).to.equal(totalSupplyBefore - amount);
    });
  });
});
