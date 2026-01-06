/**
 * @title ScrollDrop Fortification Test Suite
 * @dev Comprehensive tests for ScrollDrop Fortification with Chainlink Oracle Integration
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ScrollDrop Fortification", function () {
  let scrollDrop;
  let mockToken;
  let owner;
  let recipient1;
  let recipient2;
  let recipient3;

  beforeEach(async function () {
    [owner, recipient1, recipient2, recipient3] = await ethers.getSigners();

    // Deploy ScrollDrop Fortification
    const ScrollDropFortification = await ethers.getContractFactory("ScrollDropFortification");
    scrollDrop = await ScrollDropFortification.deploy();
    await scrollDrop.waitForDeployment();

    // Deploy mock ERC20 token for testing
    const MockToken = await ethers.getContractFactory("CHXToken");
    mockToken = await MockToken.deploy(
      owner.address,
      owner.address,
      owner.address
    );
    await mockToken.waitForDeployment();

    // Transfer tokens to ScrollDrop contract
    const transferAmount = ethers.parseEther("1000000");
    await mockToken.transfer(await scrollDrop.getAddress(), transferAmount);
  });

  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await scrollDrop.owner()).to.equal(owner.address);
      expect(await scrollDrop.totalBlessingCoins()).to.equal(0);
    });

    it("Should have correct frequency constants", async function () {
      expect(await scrollDrop.FREQUENCY_528HZ()).to.equal(528);
      expect(await scrollDrop.FREQUENCY_963HZ()).to.equal(963);
      expect(await scrollDrop.FREQUENCY_999HZ()).to.equal(999);
      expect(await scrollDrop.FREQUENCY_144000HZ()).to.equal(144000);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create campaign with correct parameters", async function () {
      const startTime = (await time.latest()) + 3600; // 1 hour from now
      const endTime = startTime + 86400; // 24 hours after start

      await expect(
        scrollDrop.createCampaign(
          "Divine Inheritance Q1",
          await mockToken.getAddress(),
          true, // isERC20
          ethers.parseEther("100000"),
          startTime,
          endTime,
          0 // InheritanceTrigger.MANUAL
        )
      ).to.emit(scrollDrop, "CampaignCreated");

      const campaign = await scrollDrop.getCampaign(0);
      expect(campaign.name).to.equal("Divine Inheritance Q1");
      expect(campaign.totalAmount).to.equal(ethers.parseEther("100000"));
      expect(campaign.status).to.equal(0); // AirdropStatus.PENDING
    });

    it("Should revert with invalid parameters", async function () {
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime + 86400;

      await expect(
        scrollDrop.createCampaign(
          "Test",
          ethers.ZeroAddress,
          true,
          ethers.parseEther("1000"),
          startTime,
          endTime,
          0
        )
      ).to.be.revertedWith("Invalid token address");

      await expect(
        scrollDrop.createCampaign(
          "Test",
          await mockToken.getAddress(),
          true,
          0,
          startTime,
          endTime,
          0
        )
      ).to.be.revertedWith("Invalid total amount");
    });
  });

  describe("Recipient Allocation", function () {
    let campaignId;
    let startTime;
    let endTime;

    beforeEach(async function () {
      startTime = (await time.latest()) + 3600;
      endTime = startTime + 86400;

      const tx = await scrollDrop.createCampaign(
        "Test Campaign",
        await mockToken.getAddress(),
        true,
        ethers.parseEther("100000"),
        startTime,
        endTime,
        0
      );
      const receipt = await tx.wait();
      campaignId = 0;
    });

    it("Should add recipients with allocations", async function () {
      const recipients = [recipient1.address, recipient2.address, recipient3.address];
      const amounts = [
        ethers.parseEther("1000"),
        ethers.parseEther("2000"),
        ethers.parseEther("3000")
      ];

      await scrollDrop.addRecipients(campaignId, recipients, amounts);

      const allocation1 = await scrollDrop.getAllocation(campaignId, recipient1.address);
      expect(allocation1.amount).to.equal(amounts[0]);
      expect(allocation1.claimed).to.be.false;

      const campaign = await scrollDrop.getCampaign(campaignId);
      expect(campaign.recipientCount).to.equal(3);
    });

    it("Should revert with mismatched array lengths", async function () {
      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther("1000")];

      await expect(
        scrollDrop.addRecipients(campaignId, recipients, amounts)
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Integrity Gates", function () {
    let campaignId;

    beforeEach(async function () {
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime + 86400;

      await scrollDrop.createCampaign(
        "Test Campaign",
        await mockToken.getAddress(),
        true,
        ethers.parseEther("100000"),
        startTime,
        endTime,
        0
      );
      campaignId = 0;
    });

    it("Should add integrity gate", async function () {
      await scrollDrop.addIntegrityGate(
        campaignId,
        "Temporal Validation",
        0 // ResonanceDimension.TEMPORAL
      );

      const gates = await scrollDrop.getIntegrityGates(campaignId);
      expect(gates.length).to.equal(1);
      expect(gates[0].name).to.equal("Temporal Validation");
      expect(gates[0].isPassed).to.be.false;
    });

    it("Should pass integrity gate", async function () {
      await scrollDrop.addIntegrityGate(campaignId, "Test Gate", 0);

      await expect(
        scrollDrop.passIntegrityGate(campaignId, 0)
      ).to.emit(scrollDrop, "IntegrityGatePassed");

      const gates = await scrollDrop.getIntegrityGates(campaignId);
      expect(gates[0].isPassed).to.be.true;
    });

    it("Should revert if gate already passed", async function () {
      await scrollDrop.addIntegrityGate(campaignId, "Test Gate", 0);
      await scrollDrop.passIntegrityGate(campaignId, 0);

      await expect(
        scrollDrop.passIntegrityGate(campaignId, 0)
      ).to.be.revertedWith("Gate already passed");
    });
  });

  describe("Divine Inheritance Trigger", function () {
    let campaignId;
    let startTime;

    beforeEach(async function () {
      startTime = (await time.latest()) + 100; // Start soon
      const endTime = startTime + 86400;

      await scrollDrop.createCampaign(
        "Test Campaign",
        await mockToken.getAddress(),
        true,
        ethers.parseEther("100000"),
        startTime,
        endTime,
        0
      );
      campaignId = 0;

      // Add recipients
      await scrollDrop.addRecipients(
        campaignId,
        [recipient1.address],
        [ethers.parseEther("1000")]
      );
    });

    it("Should trigger Divine Inheritance", async function () {
      // Fast forward to start time
      await time.increaseTo(startTime);

      await expect(
        scrollDrop.triggerDivineInheritance(campaignId)
      ).to.emit(scrollDrop, "DivineInheritanceTriggered");

      const campaign = await scrollDrop.getCampaign(campaignId);
      expect(campaign.status).to.equal(1); // AirdropStatus.ACTIVE
    });

    it("Should revert if campaign not started", async function () {
      await expect(
        scrollDrop.triggerDivineInheritance(campaignId)
      ).to.be.revertedWith("Campaign not started");
    });

    it("Should revert if campaign not pending", async function () {
      await time.increaseTo(startTime);
      await scrollDrop.triggerDivineInheritance(campaignId);

      await expect(
        scrollDrop.triggerDivineInheritance(campaignId)
      ).to.be.revertedWith("Campaign not pending");
    });
  });

  describe("Frequency Alignment", function () {
    it("Should align frequency for address", async function () {
      await expect(
        scrollDrop.alignFrequency(recipient1.address, 528)
      ).to.emit(scrollDrop, "FrequencyAligned");

      const frequency = await scrollDrop.addressFrequencySignature(recipient1.address);
      expect(frequency).to.equal(528);
    });

    it("Should revert with invalid frequency", async function () {
      await expect(
        scrollDrop.alignFrequency(recipient1.address, 123)
      ).to.be.revertedWith("Invalid frequency");
    });

    it("Should accept all valid frequencies", async function () {
      await scrollDrop.alignFrequency(recipient1.address, 528);
      await scrollDrop.alignFrequency(recipient2.address, 963);
      await scrollDrop.alignFrequency(recipient3.address, 999);

      expect(await scrollDrop.addressFrequencySignature(recipient1.address)).to.equal(528);
      expect(await scrollDrop.addressFrequencySignature(recipient2.address)).to.equal(963);
      expect(await scrollDrop.addressFrequencySignature(recipient3.address)).to.equal(999);
    });
  });

  describe("BlessingCoin Alignment", function () {
    it("Should align BlessingCoin for recipient", async function () {
      const amount = ethers.parseEther("100");

      await expect(
        scrollDrop.alignBlessingCoin(recipient1.address, amount)
      ).to.emit(scrollDrop, "BlessingCoinAligned");

      const balance = await scrollDrop.blessingCoinBalance(recipient1.address);
      expect(balance).to.equal(amount);

      const totalCoins = await scrollDrop.totalBlessingCoins();
      expect(totalCoins).to.equal(amount);
    });

    it("Should accumulate BlessingCoins", async function () {
      await scrollDrop.alignBlessingCoin(recipient1.address, ethers.parseEther("100"));
      await scrollDrop.alignBlessingCoin(recipient1.address, ethers.parseEther("50"));

      const balance = await scrollDrop.blessingCoinBalance(recipient1.address);
      expect(balance).to.equal(ethers.parseEther("150"));
    });
  });

  describe("Legacy Echo Resistance", function () {
    it("Should enable legacy echo resistance", async function () {
      await scrollDrop.enableLegacyEchoResistance(recipient1.address);

      const isResistant = await scrollDrop.legacyEchoResistance(recipient1.address);
      expect(isResistant).to.be.true;
    });

    it("Should blacklist address", async function () {
      await expect(
        scrollDrop.blacklistAddress(recipient1.address)
      ).to.emit(scrollDrop, "LegacyEchoBlocked");

      const isBlacklisted = await scrollDrop.blacklistedAddresses(recipient1.address);
      expect(isBlacklisted).to.be.true;
    });

    it("Should whitelist address", async function () {
      await scrollDrop.whitelistAddress(recipient1.address);

      const isWhitelisted = await scrollDrop.whitelistedAddresses(recipient1.address);
      expect(isWhitelisted).to.be.true;
    });
  });

  describe("Claim Allocation", function () {
    let campaignId;
    let startTime;
    let endTime;

    beforeEach(async function () {
      startTime = (await time.latest()) + 100;
      endTime = startTime + 86400;

      await scrollDrop.createCampaign(
        "Test Campaign",
        await mockToken.getAddress(),
        true,
        ethers.parseEther("100000"),
        startTime,
        endTime,
        0
      );
      campaignId = 0;

      // Add recipient
      await scrollDrop.addRecipients(
        campaignId,
        [recipient1.address],
        [ethers.parseEther("1000")]
      );

      // Enable legacy echo resistance
      await scrollDrop.enableLegacyEchoResistance(recipient1.address);

      // Trigger Divine Inheritance
      await time.increaseTo(startTime);
      await scrollDrop.triggerDivineInheritance(campaignId);
    });

    it("Should allow recipient to claim allocation", async function () {
      const balanceBefore = await mockToken.balanceOf(recipient1.address);

      await expect(
        scrollDrop.connect(recipient1).claimAllocation(campaignId)
      ).to.emit(scrollDrop, "AllocationClaimed");

      const balanceAfter = await mockToken.balanceOf(recipient1.address);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1000"));

      const allocation = await scrollDrop.getAllocation(campaignId, recipient1.address);
      expect(allocation.claimed).to.be.true;
    });

    it("Should revert if already claimed", async function () {
      await scrollDrop.connect(recipient1).claimAllocation(campaignId);

      await expect(
        scrollDrop.connect(recipient1).claimAllocation(campaignId)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should revert if blacklisted", async function () {
      await scrollDrop.blacklistAddress(recipient1.address);

      await expect(
        scrollDrop.connect(recipient1).claimAllocation(campaignId)
      ).to.be.revertedWith("Address is blacklisted");
    });

    it("Should revert if campaign ended", async function () {
      await time.increaseTo(endTime + 1);

      await expect(
        scrollDrop.connect(recipient1).claimAllocation(campaignId)
      ).to.be.revertedWith("Campaign ended");
    });
  });

  describe("Campaign Configuration", function () {
    let campaignId;

    beforeEach(async function () {
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime + 86400;

      await scrollDrop.createCampaign(
        "Test Campaign",
        await mockToken.getAddress(),
        true,
        ethers.parseEther("100000"),
        startTime,
        endTime,
        0
      );
      campaignId = 0;
    });

    it("Should set frequency requirements", async function () {
      await scrollDrop.setFrequencyRequirements(campaignId, true, 528);

      const campaign = await scrollDrop.getCampaign(campaignId);
      expect(campaign.requiresFrequencyAlignment).to.be.true;
      expect(campaign.minFrequency).to.equal(528);
    });

    it("Should set BlessingCoin requirement", async function () {
      await scrollDrop.setBlessingCoinRequirement(campaignId, true);

      const campaign = await scrollDrop.getCampaign(campaignId);
      expect(campaign.requiresBlessingCoin).to.be.true;
    });

    it("Should set oracle configuration", async function () {
      const oracleFeed = recipient1.address; // Mock address
      const threshold = ethers.parseUnits("2", 8);

      await scrollDrop.setOracleConfig(campaignId, oracleFeed, threshold);

      const campaign = await scrollDrop.getCampaign(campaignId);
      expect(campaign.oracleFeed).to.equal(oracleFeed);
      expect(campaign.oracleThreshold).to.equal(threshold);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause", async function () {
      await scrollDrop.pause();
      expect(await scrollDrop.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await scrollDrop.pause();
      await scrollDrop.unpause();
      expect(await scrollDrop.paused()).to.be.false;
    });

    it("Should prevent claiming when paused", async function () {
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 86400;

      await scrollDrop.createCampaign(
        "Test",
        await mockToken.getAddress(),
        true,
        ethers.parseEther("1000"),
        startTime,
        endTime,
        0
      );

      await scrollDrop.addRecipients(0, [recipient1.address], [ethers.parseEther("100")]);
      await scrollDrop.enableLegacyEchoResistance(recipient1.address);
      
      await time.increaseTo(startTime);
      await scrollDrop.triggerDivineInheritance(0);

      await scrollDrop.pause();

      await expect(
        scrollDrop.connect(recipient1).claimAllocation(0)
      ).to.be.revertedWithCustomError(scrollDrop, "EnforcedPause");
    });

    it("Should allow emergency withdraw", async function () {
      const amount = ethers.parseEther("1000");
      const balanceBefore = await mockToken.balanceOf(owner.address);

      await scrollDrop.emergencyWithdraw(await mockToken.getAddress(), amount);

      const balanceAfter = await mockToken.balanceOf(owner.address);
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });
  });

  describe("Access Control", function () {
    it("Should revert if non-owner tries admin functions", async function () {
      await expect(
        scrollDrop.connect(recipient1).alignFrequency(recipient2.address, 528)
      ).to.be.reverted;

      await expect(
        scrollDrop.connect(recipient1).alignBlessingCoin(recipient2.address, 100)
      ).to.be.reverted;

      await expect(
        scrollDrop.connect(recipient1).pause()
      ).to.be.reverted;
    });
  });
});
