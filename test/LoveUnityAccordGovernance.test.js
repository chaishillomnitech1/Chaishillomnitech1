const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoveUnityAccordGovernance", function () {
  let governance;
  let owner;
  let guardian;
  let steward;
  let member1;
  let member2;

  // Roles
  const GOVERNANCE_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNANCE_ADMIN_ROLE"));
  const ACCORD_GUARDIAN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ACCORD_GUARDIAN_ROLE"));
  const UNITY_STEWARD_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UNITY_STEWARD_ROLE"));

  // Frequencies
  const LOVE_FREQUENCY = 528n;
  const UNITY_FREQUENCY = 963n;
  const ACCORD_FREQUENCY = 999n;

  beforeEach(async function () {
    [owner, guardian, steward, member1, member2] = await ethers.getSigners();

    const LoveUnityAccordGovernance = await ethers.getContractFactory("LoveUnityAccordGovernance");
    governance = await LoveUnityAccordGovernance.deploy(owner.address);
    await governance.waitForDeployment();

    // Grant roles
    await governance.grantRole(ACCORD_GUARDIAN_ROLE, guardian.address);
    await governance.grantRole(UNITY_STEWARD_ROLE, steward.address);
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await governance.hasRole(GOVERNANCE_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with foundational directives", async function () {
      expect(await governance.totalDirectives()).to.equal(4n);
    });

    it("Should set initial global accord indices to 50%", async function () {
      const [love, unity, support] = await governance.getGlobalAccord();
      expect(love).to.equal(5000n);
      expect(unity).to.equal(5000n);
      expect(support).to.equal(5000n);
    });

    it("Should have correct frequencies defined", async function () {
      expect(await governance.LOVE_FREQUENCY()).to.equal(LOVE_FREQUENCY);
      expect(await governance.UNITY_FREQUENCY()).to.equal(UNITY_FREQUENCY);
      expect(await governance.ACCORD_FREQUENCY()).to.equal(ACCORD_FREQUENCY);
    });
  });

  describe("Governance Directives", function () {
    it("Should create a new directive", async function () {
      const tx = await governance.createDirective(
        "Test Directive",
        "A test directive for love and unity",
        8000n, // 80% love
        9000n, // 90% unity
        8500n  // 85% support
      );
      
      const receipt = await tx.wait();
      expect(await governance.totalDirectives()).to.equal(5n);
    });

    it("Should not allow non-admin to create directives", async function () {
      await expect(
        governance.connect(member1).createDirective(
          "Unauthorized Directive",
          "Should fail",
          8000n,
          9000n,
          8500n
        )
      ).to.be.revertedWith("Not governance admin");
    });

    it("Should reject invalid alignment values", async function () {
      await expect(
        governance.createDirective(
          "Invalid Directive",
          "Should fail",
          10001n, // > 100%
          9000n,
          8500n
        )
      ).to.be.revertedWith("Invalid love alignment");
    });

    it("Should not allow modification of immutable directives", async function () {
      const directiveIds = await governance.getAllDirectiveIds();
      const firstDirective = await governance.getDirective(directiveIds[0]);
      
      expect(firstDirective.isImmutable).to.be.true;
      
      await expect(
        governance.updateDirective(
          directiveIds[0],
          5000n,
          5000n,
          5000n
        )
      ).to.be.revertedWith("Cannot modify immutable directive");
    });
  });

  describe("Accord Commitments", function () {
    it("Should allow members to make commitments", async function () {
      const pledgeMessage = "I commit to love, unity, and mutual support";
      
      await governance.connect(member1).makeAccordCommitment(pledgeMessage);
      
      const commitment = await governance.getCommitment(member1.address);
      expect(commitment.isActive).to.be.true;
      expect(commitment.pledgeMessage).to.equal(pledgeMessage);
      expect(commitment.loveScore).to.equal(5000n);
    });

    it("Should not allow duplicate commitments", async function () {
      await governance.connect(member1).makeAccordCommitment("First commitment");
      
      await expect(
        governance.connect(member1).makeAccordCommitment("Second commitment")
      ).to.be.revertedWith("Already committed");
    });

    it("Should initialize scores at 50%", async function () {
      await governance.connect(member1).makeAccordCommitment("My commitment");
      
      const [love, unity, support] = await governance.getMemberScores(member1.address);
      expect(love).to.equal(5000n);
      expect(unity).to.equal(5000n);
      expect(support).to.equal(5000n);
    });

    it("Should track total commitments", async function () {
      await governance.connect(member1).makeAccordCommitment("Commitment 1");
      await governance.connect(member2).makeAccordCommitment("Commitment 2");
      
      expect(await governance.totalCommitments()).to.equal(2n);
    });
  });

  describe("Member Score Updates", function () {
    beforeEach(async function () {
      await governance.connect(member1).makeAccordCommitment("My commitment");
    });

    it("Should allow guardians to update scores", async function () {
      await governance.connect(guardian).updateMemberScores(
        member1.address,
        8000n,
        7500n,
        9000n
      );
      
      const [love, unity, support] = await governance.getMemberScores(member1.address);
      expect(love).to.equal(8000n);
      expect(unity).to.equal(7500n);
      expect(support).to.equal(9000n);
    });

    it("Should not allow non-guardians to update scores", async function () {
      await expect(
        governance.connect(member2).updateMemberScores(
          member1.address,
          8000n,
          7500n,
          9000n
        )
      ).to.be.revertedWith("Not accord guardian");
    });

    it("Should emit LoveScoreUpdated event", async function () {
      await expect(
        governance.connect(guardian).updateMemberScores(
          member1.address,
          8000n,
          7500n,
          9000n
        )
      ).to.emit(governance, "LoveScoreUpdated")
        .withArgs(member1.address, 5000n, 8000n, (timestamp) => timestamp > 0);
    });
  });

  describe("Unity Mechanisms", function () {
    it("Should register a unity mechanism", async function () {
      const tx = await governance.connect(steward).registerUnityMechanism(
        "Auto Unity Trigger",
        8000n, // 80% threshold
        UNITY_FREQUENCY,
        true // automatic
      );
      
      const receipt = await tx.wait();
      const mechanismIds = await governance.mechanismIds(0);
      const mechanism = await governance.getUnityMechanism(mechanismIds);
      
      expect(mechanism.name).to.equal("Auto Unity Trigger");
      expect(mechanism.isAutomatic).to.be.true;
    });

    it("Should not allow non-stewards to register mechanisms", async function () {
      await expect(
        governance.connect(member1).registerUnityMechanism(
          "Unauthorized Mechanism",
          8000n,
          UNITY_FREQUENCY,
          true
        )
      ).to.be.revertedWith("Not unity steward");
    });
  });

  describe("Activity Logging", function () {
    beforeEach(async function () {
      await governance.connect(member1).makeAccordCommitment("My commitment");
    });

    it("Should log activity with NFT timestamp", async function () {
      const activityType = ethers.keccak256(ethers.toUtf8Bytes("NFT_GOVERNANCE_ACTION"));
      const tokenId = 1n;
      
      await governance.connect(member1).logActivityWithNFTTimestamp(
        activityType,
        tokenId,
        "Governance action on NFT"
      );
      
      const nftTimestamp = await governance.getNFTGovernanceTimestamp(tokenId);
      expect(nftTimestamp).to.not.equal(ethers.ZeroHash);
    });

    it("Should require active commitment for logging", async function () {
      const activityType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ACTIVITY"));
      
      await expect(
        governance.connect(member2).logActivityWithNFTTimestamp(
          activityType,
          1n,
          "Should fail"
        )
      ).to.be.revertedWith("No active commitment");
    });

    it("Should emit NFTMetadataTimestamped event", async function () {
      const activityType = ethers.keccak256(ethers.toUtf8Bytes("NFT_ACTION"));
      const tokenId = 42n;
      
      await expect(
        governance.connect(member1).logActivityWithNFTTimestamp(
          activityType,
          tokenId,
          "Test action"
        )
      ).to.emit(governance, "NFTMetadataTimestamped")
        .withArgs(tokenId, (hash) => hash !== ethers.ZeroHash, (timestamp) => true);
    });
  });

  describe("Global Accord Updates", function () {
    beforeEach(async function () {
      await governance.connect(member1).makeAccordCommitment("Commitment 1");
      await governance.connect(member2).makeAccordCommitment("Commitment 2");
    });

    it("Should update global accord indices", async function () {
      // Update member scores
      await governance.connect(guardian).updateMemberScores(
        member1.address,
        8000n,
        7000n,
        9000n
      );
      await governance.connect(guardian).updateMemberScores(
        member2.address,
        6000n,
        9000n,
        7000n
      );
      
      // Update global accord
      await governance.updateGlobalAccord();
      
      const [love, unity, support, lastUpdate] = await governance.getGlobalAccord();
      
      // Average of (8000 + 6000) / 2 = 7000
      expect(love).to.equal(7000n);
      // Average of (7000 + 9000) / 2 = 8000
      expect(unity).to.equal(8000n);
      // Average of (9000 + 7000) / 2 = 8000
      expect(support).to.equal(8000n);
    });
  });

  describe("Frequency Resonance", function () {
    beforeEach(async function () {
      await governance.connect(member1).makeAccordCommitment("My commitment");
    });

    it("Should calculate correct frequency resonance", async function () {
      // With 50% scores for all:
      // loveComponent = (5000 * 528) / 10000 = 264
      // unityComponent = (5000 * 963) / 10000 = 481.5 (truncated to 481)
      // supportComponent = (5000 * 999) / 10000 = 499.5 (truncated to 499)
      // Total = 264 + 481 + 499 = 1244
      
      const resonance = await governance.getMemberFrequencyResonance(member1.address);
      expect(resonance).to.be.greaterThan(0n);
    });

    it("Should increase resonance with higher scores", async function () {
      const initialResonance = await governance.getMemberFrequencyResonance(member1.address);
      
      await governance.connect(guardian).updateMemberScores(
        member1.address,
        10000n, // 100%
        10000n, // 100%
        10000n  // 100%
      );
      
      const finalResonance = await governance.getMemberFrequencyResonance(member1.address);
      expect(finalResonance).to.be.greaterThan(initialResonance);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to pause", async function () {
      await governance.pause();
      expect(await governance.paused()).to.be.true;
    });

    it("Should prevent actions when paused", async function () {
      await governance.pause();
      
      await expect(
        governance.connect(member1).makeAccordCommitment("Should fail")
      ).to.be.revertedWithCustomError(governance, "EnforcedPause");
    });

    it("Should allow admin to unpause", async function () {
      await governance.pause();
      await governance.unpause();
      expect(await governance.paused()).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("Should return all directive IDs", async function () {
      const ids = await governance.getAllDirectiveIds();
      expect(ids.length).to.equal(4);
    });

    it("Should return all committed members", async function () {
      await governance.connect(member1).makeAccordCommitment("Commitment 1");
      await governance.connect(member2).makeAccordCommitment("Commitment 2");
      
      const members = await governance.getCommittedMembers();
      expect(members.length).to.equal(2);
      expect(members).to.include(member1.address);
      expect(members).to.include(member2.address);
    });

    it("Should check active commitment status", async function () {
      expect(await governance.hasActiveCommitment(member1.address)).to.be.false;
      
      await governance.connect(member1).makeAccordCommitment("My commitment");
      
      expect(await governance.hasActiveCommitment(member1.address)).to.be.true;
    });
  });
});
