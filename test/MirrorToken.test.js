const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MirrorToken Contract Tests", function () {
  let mirrorToken;
  let owner;
  let dividendReceiver;
  let zakatReceiver;
  let reserveReceiver;
  let addr1;
  let addr2;
  
  const INITIAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion
  
  beforeEach(async function () {
    [owner, dividendReceiver, zakatReceiver, reserveReceiver, addr1, addr2] = await ethers.getSigners();
    
    const MirrorToken = await ethers.getContractFactory("MirrorToken");
    mirrorToken = await MirrorToken.deploy(
      dividendReceiver.address,
      zakatReceiver.address,
      reserveReceiver.address
    );
    await mirrorToken.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await mirrorToken.name()).to.equal("Mirror Token");
      expect(await mirrorToken.symbol()).to.equal("MIRROR");
    });
    
    it("Should set the correct owner", async function () {
      expect(await mirrorToken.owner()).to.equal(owner.address);
    });
    
    it("Should mint initial supply to deployer", async function () {
      expect(await mirrorToken.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await mirrorToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
    
    it("Should set the correct fee receivers", async function () {
      expect(await mirrorToken.dividendReceiver()).to.equal(dividendReceiver.address);
      expect(await mirrorToken.zakatReceiver()).to.equal(zakatReceiver.address);
      expect(await mirrorToken.reserveReceiver()).to.equal(reserveReceiver.address);
    });
    
    it("Should set the correct frequencies", async function () {
      expect(await mirrorToken.FREQUENCY_963HZ()).to.equal(963);
      expect(await mirrorToken.FREQUENCY_528HZ()).to.equal(528);
      expect(await mirrorToken.FREQUENCY_888HZ()).to.equal(888);
    });
    
    it("Should set initial fee percentages", async function () {
      expect(await mirrorToken.dividendFeeBps()).to.equal(200); // 2%
      expect(await mirrorToken.zakatFeeBps()).to.equal(250); // 2.5%
      expect(await mirrorToken.reserveFeeBps()).to.equal(300); // 3%
    });
    
    it("Should exclude owner and receivers from fees", async function () {
      expect(await mirrorToken.excludedFromFees(owner.address)).to.equal(true);
      expect(await mirrorToken.excludedFromFees(dividendReceiver.address)).to.equal(true);
      expect(await mirrorToken.excludedFromFees(zakatReceiver.address)).to.equal(true);
      expect(await mirrorToken.excludedFromFees(reserveReceiver.address)).to.equal(true);
    });
    
    it("Should fail deployment with zero address receivers", async function () {
      const MirrorToken = await ethers.getContractFactory("MirrorToken");
      await expect(
        MirrorToken.deploy(ethers.ZeroAddress, zakatReceiver.address, reserveReceiver.address)
      ).to.be.revertedWithCustomError(mirrorToken, "InvalidReceivers");
    });
  });
  
  describe("Fee Configuration", function () {
    it("Should return correct fee configuration", async function () {
      const config = await mirrorToken.getFeeConfiguration();
      expect(config.dividendBps).to.equal(200);
      expect(config.zakatBps).to.equal(250);
      expect(config.reserveBps).to.equal(300);
      expect(config.totalBps).to.equal(750);
    });
    
    it("Should allow owner to update fees", async function () {
      await mirrorToken.updateFees(300, 300, 400);
      expect(await mirrorToken.dividendFeeBps()).to.equal(300);
      expect(await mirrorToken.zakatFeeBps()).to.equal(300);
      expect(await mirrorToken.reserveFeeBps()).to.equal(400);
    });
    
    it("Should emit FeesUpdated event", async function () {
      await expect(mirrorToken.updateFees(300, 300, 400))
        .to.emit(mirrorToken, "FeesUpdated")
        .withArgs(300, 300, 400);
    });
    
    it("Should not allow non-owner to update fees", async function () {
      await expect(
        mirrorToken.connect(addr1).updateFees(300, 300, 400)
      ).to.be.reverted;
    });
    
    it("Should revert if total fees exceed 20%", async function () {
      await expect(
        mirrorToken.updateFees(1000, 1000, 1000)
      ).to.be.revertedWithCustomError(mirrorToken, "FeeTooHigh");
    });
  });
  
  describe("Fee Receivers", function () {
    it("Should allow owner to update receivers", async function () {
      await mirrorToken.updateReceivers(addr1.address, addr2.address, owner.address);
      expect(await mirrorToken.dividendReceiver()).to.equal(addr1.address);
      expect(await mirrorToken.zakatReceiver()).to.equal(addr2.address);
      expect(await mirrorToken.reserveReceiver()).to.equal(owner.address);
    });
    
    it("Should automatically exclude new receivers from fees", async function () {
      await mirrorToken.updateReceivers(addr1.address, addr2.address, owner.address);
      expect(await mirrorToken.excludedFromFees(addr1.address)).to.equal(true);
      expect(await mirrorToken.excludedFromFees(addr2.address)).to.equal(true);
    });
    
    it("Should emit FeeReceiversUpdated event", async function () {
      await expect(mirrorToken.updateReceivers(addr1.address, addr2.address, owner.address))
        .to.emit(mirrorToken, "FeeReceiversUpdated")
        .withArgs(addr1.address, addr2.address, owner.address);
    });
    
    it("Should not allow zero address receivers", async function () {
      await expect(
        mirrorToken.updateReceivers(ethers.ZeroAddress, addr2.address, owner.address)
      ).to.be.revertedWithCustomError(mirrorToken, "InvalidAddress");
    });
  });
  
  describe("Fee Exclusion", function () {
    it("Should allow owner to exclude addresses from fees", async function () {
      await mirrorToken.setExcludedFromFees(addr1.address, true);
      expect(await mirrorToken.excludedFromFees(addr1.address)).to.equal(true);
    });
    
    it("Should allow owner to remove exclusion", async function () {
      await mirrorToken.setExcludedFromFees(addr1.address, true);
      await mirrorToken.setExcludedFromFees(addr1.address, false);
      expect(await mirrorToken.excludedFromFees(addr1.address)).to.equal(false);
    });
    
    it("Should emit ExcludeFromFees event", async function () {
      await expect(mirrorToken.setExcludedFromFees(addr1.address, true))
        .to.emit(mirrorToken, "ExcludeFromFees")
        .withArgs(addr1.address, true);
    });
    
    it("Should not allow zero address exclusion", async function () {
      await expect(
        mirrorToken.setExcludedFromFees(ethers.ZeroAddress, true)
      ).to.be.revertedWithCustomError(mirrorToken, "InvalidAddress");
    });
  });
  
  describe("Transfer with Fees", function () {
    it("Should transfer without fees for excluded addresses", async function () {
      const amount = ethers.parseEther("1000");
      // Owner is excluded, so no fees
      await mirrorToken.transfer(addr1.address, amount);
      expect(await mirrorToken.balanceOf(addr1.address)).to.equal(amount);
    });
    
    it("Should deduct fees on transfer for non-excluded addresses", async function () {
      // First transfer to addr1 (no fees as owner is excluded)
      const initialAmount = ethers.parseEther("10000");
      await mirrorToken.transfer(addr1.address, initialAmount);
      
      // Now addr1 transfers to addr2 (fees apply)
      const transferAmount = ethers.parseEther("1000");
      await mirrorToken.connect(addr1).transfer(addr2.address, transferAmount);
      
      // Calculate expected amounts
      // Total fees = 2% + 2.5% + 3% = 7.5%
      const totalFeeBps = 750n;
      const feeAmount = (transferAmount * totalFeeBps) / 10000n;
      const expectedReceived = transferAmount - feeAmount;
      
      expect(await mirrorToken.balanceOf(addr2.address)).to.equal(expectedReceived);
    });
    
    it("Should distribute fees to receivers", async function () {
      // Transfer to addr1 first
      const initialAmount = ethers.parseEther("10000");
      await mirrorToken.transfer(addr1.address, initialAmount);
      
      const dividendBefore = await mirrorToken.balanceOf(dividendReceiver.address);
      const zakatBefore = await mirrorToken.balanceOf(zakatReceiver.address);
      const reserveBefore = await mirrorToken.balanceOf(reserveReceiver.address);
      
      // addr1 transfers to addr2
      const transferAmount = ethers.parseEther("1000");
      await mirrorToken.connect(addr1).transfer(addr2.address, transferAmount);
      
      // Check fee distribution
      const dividendFee = (transferAmount * 200n) / 10000n; // 2%
      const zakatFee = (transferAmount * 250n) / 10000n; // 2.5%
      const reserveFee = (transferAmount * 300n) / 10000n; // 3%
      
      expect(await mirrorToken.balanceOf(dividendReceiver.address)).to.equal(dividendBefore + dividendFee);
      expect(await mirrorToken.balanceOf(zakatReceiver.address)).to.equal(zakatBefore + zakatFee);
      expect(await mirrorToken.balanceOf(reserveReceiver.address)).to.equal(reserveBefore + reserveFee);
    });
    
    it("Should track total fees collected", async function () {
      // Transfer to addr1 first
      await mirrorToken.transfer(addr1.address, ethers.parseEther("10000"));
      
      // addr1 transfers to addr2
      const transferAmount = ethers.parseEther("1000");
      await mirrorToken.connect(addr1).transfer(addr2.address, transferAmount);
      
      const dividendFee = (transferAmount * 200n) / 10000n;
      const zakatFee = (transferAmount * 250n) / 10000n;
      const reserveFee = (transferAmount * 300n) / 10000n;
      
      expect(await mirrorToken.totalDividendCollected()).to.equal(dividendFee);
      expect(await mirrorToken.totalZakatCollected()).to.equal(zakatFee);
      expect(await mirrorToken.totalReserveCollected()).to.equal(reserveFee);
      expect(await mirrorToken.getTotalFeesCollected()).to.equal(dividendFee + zakatFee + reserveFee);
    });
  });
  
  describe("Resonance Signature", function () {
    it("Should return correct resonance signature", async function () {
      const resonance = await mirrorToken.getResonanceSignature();
      expect(resonance).to.equal(963 + 528 + 888); // 2379
    });
  });
  
  describe("Pause Mechanism", function () {
    it("Should allow owner to pause", async function () {
      await mirrorToken.pause();
      // Try to transfer should fail
      await expect(
        mirrorToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });
    
    it("Should allow owner to unpause", async function () {
      await mirrorToken.pause();
      await mirrorToken.unpause();
      await expect(
        mirrorToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });
    
    it("Should not allow non-owner to pause", async function () {
      await expect(mirrorToken.connect(addr1).pause()).to.be.reverted;
    });
  });
  
  describe("Burn", function () {
    it("Should allow burning tokens", async function () {
      const burnAmount = ethers.parseEther("1000");
      const totalSupplyBefore = await mirrorToken.totalSupply();
      
      await mirrorToken.burn(burnAmount);
      
      expect(await mirrorToken.totalSupply()).to.equal(totalSupplyBefore - burnAmount);
    });
  });
});
