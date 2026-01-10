const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * PHARAOH REVENUE SPLITTER TEST SUITE
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 * 
 * Tests the complete Shared Prosperity Protocol:
 * - 2.5% Zakat contributions (immutable)
 * - Multi-beneficiary revenue splits
 * - Multi-signature governance
 * - Time-locked operations
 * - Vesting schedules
 * - Contribution weight tracking
 * - Sovereign override mechanism
 * 
 * Frequencies: 963Hz + 528Hz + 999Hz + ∞
 * Author: Supreme King Chais The Great ∞
 */

describe("PharaohRevenueSplitter - Shared Prosperity Protocol Tests", function () {
  let splitter;
  let owner;
  let zakatTreasury;
  let beneficiary1;
  let beneficiary2;
  let beneficiary3;
  let approver1;
  let approver2;
  let approver3;
  let addr1;
  
  const ZAKAT_BPS = 250n; // 2.5%
  const BASIS_POINTS = 10000n;
  const REQUIRED_APPROVALS = 2;
  const TIMELOCK_DELAY = 48 * 60 * 60; // 48 hours
  
  beforeEach(async function () {
    [owner, zakatTreasury, beneficiary1, beneficiary2, beneficiary3, approver1, approver2, approver3, addr1] = 
      await ethers.getSigners();
    
    const PharaohRevenueSplitter = await ethers.getContractFactory("PharaohRevenueSplitter");
    splitter = await PharaohRevenueSplitter.deploy(
      owner.address,
      zakatTreasury.address,
      REQUIRED_APPROVALS,
      TIMELOCK_DELAY
    );
    await splitter.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await splitter.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct Zakat treasury", async function () {
      expect(await splitter.zakatTreasury()).to.equal(zakatTreasury.address);
    });
    
    it("Should set the correct required approvals", async function () {
      expect(await splitter.requiredApprovals()).to.equal(REQUIRED_APPROVALS);
    });
    
    it("Should set the correct timelock delay", async function () {
      expect(await splitter.timeLockDelay()).to.equal(TIMELOCK_DELAY);
    });
    
    it("Should enable sovereign override by default", async function () {
      expect(await splitter.sovereignOverrideEnabled()).to.equal(true);
    });
    
    it("Should add owner as first approver", async function () {
      expect(await splitter.isApprover(owner.address)).to.equal(true);
    });
    
    it("Should initialize with zero total shares", async function () {
      expect(await splitter.totalShares()).to.equal(0);
    });
    
    it("Should have correct Zakat percentage constant", async function () {
      expect(await splitter.ZAKAT_BPS()).to.equal(ZAKAT_BPS);
    });
  });
  
  describe("Beneficiary Management", function () {
    it("Should add a beneficiary without vesting", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 5000, 0, 100);
      
      const beneficiary = await splitter.getBeneficiary(beneficiary1.address);
      expect(beneficiary.beneficiaryAccount).to.equal(beneficiary1.address);
      expect(beneficiary.share).to.equal(5000);
      expect(beneficiary.isActive).to.equal(true);
      expect(beneficiary.contributionWeight).to.equal(100);
      expect(beneficiary.vestingDuration).to.equal(0);
    });
    
    it("Should add a beneficiary with vesting", async function () {
      const vestingDuration = 365 * 24 * 60 * 60; // 1 year
      await splitter.addBeneficiary(beneficiary1.address, 3000, vestingDuration, 50);
      
      const beneficiary = await splitter.getBeneficiary(beneficiary1.address);
      expect(beneficiary.vestingDuration).to.equal(vestingDuration);
      expect(beneficiary.vestingStart).to.be.gt(0);
    });
    
    it("Should track total shares correctly", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100);
      expect(await splitter.totalShares()).to.equal(3000);
      
      await splitter.addBeneficiary(beneficiary2.address, 2000, 0, 75);
      expect(await splitter.totalShares()).to.equal(5000);
    });
    
    it("Should prevent adding duplicate beneficiary", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100);
      await expect(
        splitter.addBeneficiary(beneficiary1.address, 2000, 0, 50)
      ).to.be.revertedWithCustomError(splitter, "BeneficiaryAlreadyExists");
    });
    
    it("Should prevent exceeding total shares limit", async function () {
      // Maximum is BASIS_POINTS - ZAKAT_BPS = 9750
      await splitter.addBeneficiary(beneficiary1.address, 9000, 0, 100);
      
      await expect(
        splitter.addBeneficiary(beneficiary2.address, 1000, 0, 50)
      ).to.be.revertedWithCustomError(splitter, "InvalidShareExceedsMaximum");
    });
    
    it("Should update beneficiary share", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100);
      await splitter.updateBeneficiaryShare(beneficiary1.address, 4000);
      
      const beneficiary = await splitter.getBeneficiary(beneficiary1.address);
      expect(beneficiary.share).to.equal(4000);
      expect(await splitter.totalShares()).to.equal(4000);
    });
    
    it("Should update contribution weight", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100);
      await splitter.updateContributionWeight(beneficiary1.address, 150);
      
      const beneficiary = await splitter.getBeneficiary(beneficiary1.address);
      expect(beneficiary.contributionWeight).to.equal(150);
    });
    
    it("Should remove beneficiary", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100);
      await splitter.removeBeneficiary(beneficiary1.address);
      
      const beneficiary = await splitter.getBeneficiary(beneficiary1.address);
      expect(beneficiary.isActive).to.equal(false);
      expect(await splitter.totalShares()).to.equal(0);
    });
    
    it("Should emit events for beneficiary operations", async function () {
      await expect(splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100))
        .to.emit(splitter, "BeneficiaryAdded")
        .withArgs(beneficiary1.address, 3000, 100);
      
      await expect(splitter.updateBeneficiaryShare(beneficiary1.address, 4000))
        .to.emit(splitter, "BeneficiaryShareUpdated")
        .withArgs(beneficiary1.address, 3000, 4000);
      
      await expect(splitter.removeBeneficiary(beneficiary1.address))
        .to.emit(splitter, "BeneficiaryRemoved")
        .withArgs(beneficiary1.address);
    });
  });
  
  describe("Revenue Distribution & Zakat", function () {
    beforeEach(async function () {
      // Add beneficiaries with different shares
      // Total: 60% (leaving 40% for potential other beneficiaries)
      await splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100); // 30%
      await splitter.addBeneficiary(beneficiary2.address, 2000, 0, 75);  // 20%
      await splitter.addBeneficiary(beneficiary3.address, 1000, 0, 50);  // 10%
    });
    
    it("Should receive revenue via receive function", async function () {
      const amount = ethers.parseEther("10");
      
      await expect(
        owner.sendTransaction({ to: await splitter.getAddress(), value: amount })
      ).to.emit(splitter, "RevenueReceived")
        .withArgs(amount, await time.latest() + 1);
      
      expect(await splitter.pendingRevenue()).to.equal(amount);
      expect(await splitter.totalRevenueReceived()).to.equal(amount);
    });
    
    it("Should distribute revenue with correct Zakat (2.5%)", async function () {
      const amount = ethers.parseEther("100");
      
      // Send revenue
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      
      const zakatBefore = await ethers.provider.getBalance(zakatTreasury.address);
      
      // Distribute
      await splitter.distributeRevenue();
      
      const zakatAfter = await ethers.provider.getBalance(zakatTreasury.address);
      const zakatReceived = zakatAfter - zakatBefore;
      
      // Zakat should be 2.5% of total
      const expectedZakat = (amount * ZAKAT_BPS) / BASIS_POINTS;
      expect(zakatReceived).to.equal(expectedZakat);
      
      expect(await splitter.totalZakatContributed()).to.equal(expectedZakat);
    });
    
    it("Should distribute revenue to beneficiaries with correct shares", async function () {
      const amount = ethers.parseEther("100");
      
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      
      const b1Before = await ethers.provider.getBalance(beneficiary1.address);
      const b2Before = await ethers.provider.getBalance(beneficiary2.address);
      const b3Before = await ethers.provider.getBalance(beneficiary3.address);
      
      await splitter.distributeRevenue();
      
      const b1After = await ethers.provider.getBalance(beneficiary1.address);
      const b2After = await ethers.provider.getBalance(beneficiary2.address);
      const b3After = await ethers.provider.getBalance(beneficiary3.address);
      
      // After 2.5% Zakat, remaining is 97.5 ETH
      // This is distributed according to shares out of total shares (6000)
      // B1: 30% of (100 - 2.5) * (3000/6000) = 48.75 * 0.5 = 24.375 but needs adjustment
      
      // Actually: remaining = 97.5 ETH
      // B1 share: 3000 / (10000 - 250) = 3000/9750
      const remaining = amount - (amount * ZAKAT_BPS) / BASIS_POINTS;
      const b1Expected = (remaining * 3000n) / (BASIS_POINTS - ZAKAT_BPS);
      const b2Expected = (remaining * 2000n) / (BASIS_POINTS - ZAKAT_BPS);
      const b3Expected = (remaining * 1000n) / (BASIS_POINTS - ZAKAT_BPS);
      
      expect(b1After - b1Before).to.equal(b1Expected);
      expect(b2After - b2Before).to.equal(b2Expected);
      expect(b3After - b3Before).to.equal(b3Expected);
    });
    
    it("Should emit distribution events", async function () {
      const amount = ethers.parseEther("10");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      
      const zakatAmount = (amount * ZAKAT_BPS) / BASIS_POINTS;
      
      await expect(splitter.distributeRevenue())
        .to.emit(splitter, "ZakatContributed")
        .withArgs(zakatAmount, await time.latest() + 1)
        .and.to.emit(splitter, "RevenueDistributed");
    });
    
    it("Should track total revenue distributed", async function () {
      const amount1 = ethers.parseEther("50");
      const amount2 = ethers.parseEther("30");
      
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount1 });
      await splitter.distributeRevenue();
      
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount2 });
      await splitter.distributeRevenue();
      
      expect(await splitter.totalRevenueDistributed()).to.equal(amount1 + amount2);
    });
    
    it("Should prevent distribution when no pending revenue", async function () {
      await expect(
        splitter.distributeRevenue()
      ).to.be.revertedWithCustomError(splitter, "NoRevenueToDistribute");
    });
    
    it("Should record distribution history", async function () {
      const amount = ethers.parseEther("10");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      await splitter.distributeRevenue();
      
      expect(await splitter.getDistributionCount()).to.equal(1);
      
      const history = await splitter.getDistributionHistory(0, 10);
      expect(history.length).to.equal(1);
      expect(history[0].totalAmount).to.equal(amount);
      expect(history[0].beneficiaryCount).to.equal(3);
    });
  });
  
  describe("Vesting Schedules", function () {
    it("Should calculate vested amount correctly during vesting period", async function () {
      const vestingDuration = 365 * 24 * 60 * 60; // 1 year
      await splitter.addBeneficiary(beneficiary1.address, 3000, vestingDuration, 100);
      
      // Send and distribute revenue
      const amount = ethers.parseEther("100");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      await splitter.distributeRevenue();
      
      // Initially, no time has passed, so vested amount should be minimal
      let vestedAmount = await splitter.getVestedAmount(beneficiary1.address);
      expect(vestedAmount).to.be.lt(ethers.parseEther("1")); // Very small
      
      // Advance time by 6 months (50% of vesting period)
      await time.increase(vestingDuration / 2);
      
      vestedAmount = await splitter.getVestedAmount(beneficiary1.address);
      const beneficiary = await splitter.getBeneficiary(beneficiary1.address);
      const expectedVested = beneficiary.totalReceived / 2n; // 50% vested
      
      // Allow for small rounding differences
      expect(vestedAmount).to.be.closeTo(expectedVested, ethers.parseEther("0.01"));
    });
    
    it("Should allow full claim after vesting period", async function () {
      const vestingDuration = 100; // 100 seconds for testing
      await splitter.addBeneficiary(beneficiary1.address, 3000, vestingDuration, 100);
      
      const amount = ethers.parseEther("10");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      await splitter.distributeRevenue();
      
      // Advance past vesting period
      await time.increase(vestingDuration + 1);
      
      const beneficiary = await splitter.getBeneficiary(beneficiary1.address);
      const vestedAmount = await splitter.getVestedAmount(beneficiary1.address);
      
      expect(vestedAmount).to.equal(beneficiary.totalReceived);
    });
    
    it("Should allow beneficiary to claim vested revenue", async function () {
      const vestingDuration = 100;
      await splitter.addBeneficiary(beneficiary1.address, 3000, vestingDuration, 100);
      
      const amount = ethers.parseEther("10");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      await splitter.distributeRevenue();
      
      // Advance to 50% vesting
      await time.increase(vestingDuration / 2);
      
      const balanceBefore = await ethers.provider.getBalance(beneficiary1.address);
      const vestedAmount = await splitter.getVestedAmount(beneficiary1.address);
      
      await splitter.connect(beneficiary1).claimVestedRevenue();
      
      const balanceAfter = await ethers.provider.getBalance(beneficiary1.address);
      
      // Account for gas costs - balance increase should be close to vested amount
      expect(balanceAfter - balanceBefore).to.be.closeTo(vestedAmount, ethers.parseEther("0.001"));
    });
    
    it("Should emit VestingClaimed event", async function () {
      const vestingDuration = 100;
      await splitter.addBeneficiary(beneficiary1.address, 3000, vestingDuration, 100);
      
      const amount = ethers.parseEther("10");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      await splitter.distributeRevenue();
      
      await time.increase(vestingDuration + 1);
      
      await expect(splitter.connect(beneficiary1).claimVestedRevenue())
        .to.emit(splitter, "VestingClaimed");
    });
    
    it("Should prevent claiming when no vested amount available", async function () {
      const vestingDuration = 365 * 24 * 60 * 60;
      await splitter.addBeneficiary(beneficiary1.address, 3000, vestingDuration, 100);
      
      await expect(
        splitter.connect(beneficiary1).claimVestedRevenue()
      ).to.be.revertedWithCustomError(splitter, "NoVestedAmount");
    });
  });
  
  describe("Multi-Signature Governance", function () {
    beforeEach(async function () {
      // Add additional approvers
      await splitter.addApprover(approver1.address);
      await splitter.addApprover(approver2.address);
    });
    
    it("Should add approvers", async function () {
      expect(await splitter.isApprover(approver1.address)).to.equal(true);
      expect(await splitter.isApprover(approver2.address)).to.equal(true);
    });
    
    it("Should track approver list", async function () {
      const approvers = await splitter.getAllApprovers();
      expect(approvers.length).to.equal(3); // owner + 2 added
      expect(approvers).to.include(owner.address);
      expect(approvers).to.include(approver1.address);
      expect(approvers).to.include(approver2.address);
    });
    
    it("Should allow approvers to approve operations", async function () {
      const operationHash = ethers.keccak256(ethers.toUtf8Bytes("test-operation"));
      
      await splitter.connect(approver1).approveOperation(operationHash);
      expect(await splitter.operationApprovalCount(operationHash)).to.equal(1);
      
      await splitter.connect(approver2).approveOperation(operationHash);
      expect(await splitter.operationApprovalCount(operationHash)).to.equal(2);
    });
    
    it("Should prevent double approval from same approver", async function () {
      const operationHash = ethers.keccak256(ethers.toUtf8Bytes("test-operation"));
      
      await splitter.connect(approver1).approveOperation(operationHash);
      
      await expect(
        splitter.connect(approver1).approveOperation(operationHash)
      ).to.be.revertedWithCustomError(splitter, "AlreadyApproved");
    });
    
    it("Should allow owner to update required approvals", async function () {
      await splitter.updateRequiredApprovals(3);
      expect(await splitter.requiredApprovals()).to.equal(3);
    });
    
    it("Should prevent invalid approval threshold", async function () {
      await expect(
        splitter.updateRequiredApprovals(0)
      ).to.be.revertedWithCustomError(splitter, "InvalidApprovalThreshold");
      
      await expect(
        splitter.updateRequiredApprovals(10) // More than approvers
      ).to.be.revertedWithCustomError(splitter, "InvalidApprovalThreshold");
    });
    
    it("Should remove approvers", async function () {
      await splitter.removeApprover(approver1.address);
      expect(await splitter.isApprover(approver1.address)).to.equal(false);
    });
  });
  
  describe("Time-Lock Operations", function () {
    it("Should create time-locked operation", async function () {
      const operationHash = ethers.keccak256(ethers.toUtf8Bytes("test-op"));
      const data = ethers.toUtf8Bytes("test data");
      const description = "Test operation";
      
      await splitter.createTimeLock(operationHash, data, description);
      
      const timeLock = await splitter.timeLocks(operationHash);
      expect(timeLock.executed).to.equal(false);
      expect(timeLock.cancelled).to.equal(false);
      expect(timeLock.description).to.equal(description);
    });
    
    it("Should enforce timelock delay", async function () {
      const operationHash = ethers.keccak256(ethers.toUtf8Bytes("test-op"));
      
      // Add approvers and get approvals
      await splitter.addApprover(approver1.address);
      await splitter.connect(owner).approveOperation(operationHash);
      await splitter.connect(approver1).approveOperation(operationHash);
      
      await splitter.createTimeLock(operationHash, "0x", "Test");
      
      // Try to execute immediately - should fail
      await expect(
        splitter.executeTimeLock(operationHash)
      ).to.be.revertedWithCustomError(splitter, "TimeLockNotReady");
    });
    
    it("Should allow execution after delay", async function () {
      const operationHash = ethers.keccak256(ethers.toUtf8Bytes("test-op"));
      
      await splitter.addApprover(approver1.address);
      await splitter.connect(owner).approveOperation(operationHash);
      await splitter.connect(approver1).approveOperation(operationHash);
      
      await splitter.createTimeLock(operationHash, "0x", "Test");
      
      // Advance time past delay
      await time.increase(TIMELOCK_DELAY + 1);
      
      await expect(splitter.executeTimeLock(operationHash))
        .to.emit(splitter, "TimeLockExecuted")
        .withArgs(operationHash);
    });
    
    it("Should allow owner to cancel timelock", async function () {
      const operationHash = ethers.keccak256(ethers.toUtf8Bytes("test-op"));
      
      await splitter.createTimeLock(operationHash, "0x", "Test");
      
      await expect(splitter.cancelTimeLock(operationHash))
        .to.emit(splitter, "TimeLockCancelled")
        .withArgs(operationHash);
      
      const timeLock = await splitter.timeLocks(operationHash);
      expect(timeLock.cancelled).to.equal(true);
    });
    
    it("Should update timelock delay", async function () {
      const newDelay = 24 * 60 * 60; // 24 hours
      await splitter.updateTimeLockDelay(newDelay);
      expect(await splitter.timeLockDelay()).to.equal(newDelay);
    });
  });
  
  describe("Sovereign Override", function () {
    it("Should have sovereign override enabled by default", async function () {
      expect(await splitter.sovereignOverrideEnabled()).to.equal(true);
    });
    
    it("Should allow owner to toggle sovereign override", async function () {
      await splitter.toggleSovereignOverride();
      expect(await splitter.sovereignOverrideEnabled()).to.equal(false);
      
      await splitter.toggleSovereignOverride();
      expect(await splitter.sovereignOverrideEnabled()).to.equal(true);
    });
    
    it("Should emit SovereignOverrideToggled event", async function () {
      await expect(splitter.toggleSovereignOverride())
        .to.emit(splitter, "SovereignOverrideToggled")
        .withArgs(false);
    });
  });
  
  describe("Admin Functions", function () {
    it("Should update Zakat treasury", async function () {
      const newTreasury = addr1.address;
      
      await expect(splitter.updateZakatTreasury(newTreasury))
        .to.emit(splitter, "ZakatTreasuryUpdated")
        .withArgs(zakatTreasury.address, newTreasury);
      
      expect(await splitter.zakatTreasury()).to.equal(newTreasury);
    });
    
    it("Should prevent zero address for Zakat treasury", async function () {
      await expect(
        splitter.updateZakatTreasury(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(splitter, "InvalidZakatTreasury");
    });
    
    it("Should pause and unpause contract", async function () {
      await splitter.pause();
      expect(await splitter.paused()).to.equal(true);
      
      await splitter.unpause();
      expect(await splitter.paused()).to.equal(false);
    });
    
    it("Should prevent operations when paused", async function () {
      await splitter.pause();
      
      await expect(
        splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100)
      ).to.be.reverted;
    });
  });
  
  describe("Analytics & Reporting", function () {
    beforeEach(async function () {
      await splitter.addBeneficiary(beneficiary1.address, 3000, 0, 100);
      await splitter.addBeneficiary(beneficiary2.address, 2000, 0, 75);
    });
    
    it("Should return correct global stats", async function () {
      const amount = ethers.parseEther("100");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      await splitter.distributeRevenue();
      
      const stats = await splitter.getGlobalStats();
      expect(stats.totalRevenue).to.equal(amount);
      expect(stats.totalDistributed).to.equal(amount);
      expect(stats.activeBeneficiaries).to.equal(2);
      expect(stats.totalBeneficiaries).to.equal(2);
    });
    
    it("Should return correct beneficiary stats", async function () {
      const amount = ethers.parseEther("100");
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      await splitter.distributeRevenue();
      
      const stats = await splitter.getBeneficiaryStats(beneficiary1.address);
      expect(stats.currentShare).to.equal(3000);
      expect(stats.active).to.equal(true);
      expect(stats.totalReceived).to.be.gt(0);
    });
    
    it("Should return all beneficiaries", async function () {
      const allBeneficiaries = await splitter.getAllBeneficiaries();
      expect(allBeneficiaries.length).to.equal(2);
      expect(allBeneficiaries).to.include(beneficiary1.address);
      expect(allBeneficiaries).to.include(beneficiary2.address);
    });
    
    it("Should track audit log", async function () {
      const initialCount = await splitter.getAuditLogCount();
      
      await splitter.addBeneficiary(beneficiary3.address, 1000, 0, 50);
      
      const newCount = await splitter.getAuditLogCount();
      expect(newCount).to.be.gt(initialCount);
    });
  });
  
  describe("Access Control", function () {
    it("Should restrict beneficiary management to owner", async function () {
      await expect(
        splitter.connect(addr1).addBeneficiary(beneficiary1.address, 3000, 0, 100)
      ).to.be.reverted;
    });
    
    it("Should restrict admin functions to owner", async function () {
      await expect(
        splitter.connect(addr1).pause()
      ).to.be.reverted;
      
      await expect(
        splitter.connect(addr1).updateZakatTreasury(addr1.address)
      ).to.be.reverted;
    });
    
    it("Should allow only approvers or owner to approve operations", async function () {
      const operationHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      
      await expect(
        splitter.connect(addr1).approveOperation(operationHash)
      ).to.be.revertedWithCustomError(splitter, "NotApprover");
    });
  });
  
  describe("Edge Cases", function () {
    it("Should handle zero revenue distribution gracefully", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 5000, 0, 100);
      
      await expect(
        splitter.distributeRevenue()
      ).to.be.revertedWithCustomError(splitter, "NoRevenueToDistribute");
    });
    
    it("Should handle very small revenue amounts", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 5000, 0, 100);
      
      const amount = 1000n; // Very small amount (1000 wei)
      await owner.sendTransaction({ to: await splitter.getAddress(), value: amount });
      
      await expect(splitter.distributeRevenue()).to.not.be.reverted;
    });
    
    it("Should handle distribution history pagination", async function () {
      await splitter.addBeneficiary(beneficiary1.address, 5000, 0, 100);
      
      // Create multiple distributions
      for (let i = 0; i < 5; i++) {
        await owner.sendTransaction({ 
          to: await splitter.getAddress(), 
          value: ethers.parseEther("1") 
        });
        await splitter.distributeRevenue();
      }
      
      const history1 = await splitter.getDistributionHistory(0, 2);
      expect(history1.length).to.equal(2);
      
      const history2 = await splitter.getDistributionHistory(2, 3);
      expect(history2.length).to.equal(3);
    });
  });
});
