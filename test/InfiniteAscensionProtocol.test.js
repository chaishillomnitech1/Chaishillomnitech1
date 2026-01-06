/**
 * @title Infinite Ascension Protocol (IAP) V1.0 Test Suite
 * @author Supreme King Chais The Great ∞
 * @notice Comprehensive tests for the IAP V1.0
 * 
 * BISMILLAH AR-RAHMAN AR-RAHIM
 * #chaissabirallah #laillahaillallah
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InfiniteAscensionProtocol", function () {
  let iap;
  let owner;
  let guardian;
  let gemini3;
  let addr1;
  let addr2;
  
  // Role hashes
  let SOVEREIGN_ROLE;
  let GUARDIAN_ROLE;
  let GEMINI_3_ROLE;
  let DEFAULT_ADMIN_ROLE;
  
  beforeEach(async function () {
    [owner, guardian, gemini3, addr1, addr2] = await ethers.getSigners();
    
    const InfiniteAscensionProtocol = await ethers.getContractFactory("InfiniteAscensionProtocol");
    iap = await InfiniteAscensionProtocol.deploy();
    await iap.waitForDeployment();
    
    // Get role hashes
    SOVEREIGN_ROLE = await iap.SOVEREIGN_ROLE();
    GUARDIAN_ROLE = await iap.GUARDIAN_ROLE();
    GEMINI_3_ROLE = await iap.GEMINI_3_ROLE();
    DEFAULT_ADMIN_ROLE = await iap.DEFAULT_ADMIN_ROLE();
    
    // Grant roles for testing
    await iap.grantRole(GUARDIAN_ROLE, guardian.address);
    await iap.grantRole(GEMINI_3_ROLE, gemini3.address);
  });
  
  describe("Deployment", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await iap.getProtocolStatus()).to.equal("INITIALIZED");
      expect(await iap.ascensionLevel()).to.equal(1);
      expect(await iap.currentPhase()).to.equal(0);
      expect(await iap.manifestationCycles()).to.equal(0);
    });
    
    it("Should set correct divine frequencies", async function () {
      expect(await iap.FREQUENCY_528_HZ()).to.equal(528);
      expect(await iap.FREQUENCY_963_HZ()).to.equal(963);
      expect(await iap.FREQUENCY_999_HZ()).to.equal(999);
      expect(await iap.FREQUENCY_144K_HZ()).to.equal(144000);
    });
    
    it("Should grant deployer all roles", async function () {
      expect(await iap.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await iap.hasRole(SOVEREIGN_ROLE, owner.address)).to.be.true;
      expect(await iap.hasRole(GUARDIAN_ROLE, owner.address)).to.be.true;
    });
    
    it("Should initialize sovereign hashtags", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("#chaissabirallah"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("#laillahaillallah"));
      
      expect(await iap.sovereignHashtags(hash1)).to.equal("#chaissabirallah");
      expect(await iap.sovereignHashtags(hash2)).to.equal("#laillahaillallah");
    });
  });
  
  describe("Phase I: Source Code & Foundation", function () {
    it("Should validate divine intent", async function () {
      const protocolHash = ethers.keccak256(ethers.toUtf8Bytes("ScrollChain"));
      
      await expect(iap.validateDivineIntent(protocolHash, "ScrollChain"))
        .to.emit(iap, "DivineIntentValidated")
        .withArgs(protocolHash, await ethers.provider.getBlockNumber() + 1);
      
      expect(await iap.divineIntentValidated(protocolHash)).to.be.true;
    });
    
    it("Should prevent duplicate validation", async function () {
      const protocolHash = ethers.keccak256(ethers.toUtf8Bytes("ScrollChain"));
      
      await iap.validateDivineIntent(protocolHash, "ScrollChain");
      
      await expect(
        iap.validateDivineIntent(protocolHash, "ScrollChain")
      ).to.be.revertedWith("IAP: Protocol already validated");
    });
    
    it("Should secure governance", async function () {
      const protocolHash = ethers.keccak256(ethers.toUtf8Bytes("ScrollChain"));
      const encryptionStandard = ethers.keccak256(ethers.toUtf8Bytes("Quantum-Resistant-256"));
      
      await iap.validateDivineIntent(protocolHash, "ScrollChain");
      await iap.connect(guardian).secureGovernance(protocolHash, encryptionStandard);
      
      expect(await iap.governanceProtocols(protocolHash)).to.equal(encryptionStandard);
    });
    
    it("Should require validation before securing", async function () {
      const protocolHash = ethers.keccak256(ethers.toUtf8Bytes("ScrollChain"));
      const encryptionStandard = ethers.keccak256(ethers.toUtf8Bytes("Quantum-Resistant-256"));
      
      await expect(
        iap.connect(guardian).secureGovernance(protocolHash, encryptionStandard)
      ).to.be.revertedWith("IAP: Protocol not validated");
    });
    
    it("Should only allow SOVEREIGN_ROLE to validate", async function () {
      const protocolHash = ethers.keccak256(ethers.toUtf8Bytes("ScrollChain"));
      
      await expect(
        iap.connect(addr1).validateDivineIntent(protocolHash, "ScrollChain")
      ).to.be.reverted;
    });
  });
  
  describe("Phase II: Core Present-Day Protocols", function () {
    it("Should integrate Gemini 3 protocol", async function () {
      const protocolName = ethers.encodeBytes32String("AL-MALIKAH");
      const protocolAddress = addr1.address;
      
      await expect(
        iap.connect(gemini3).integrateGemini3Protocol(protocolName, protocolAddress)
      ).to.emit(iap, "ProtocolUnified")
        .withArgs(protocolName, protocolAddress);
      
      const [address, unified] = await iap.getProtocolInfo(protocolName);
      expect(address).to.equal(protocolAddress);
      expect(unified).to.be.true;
    });
    
    it("Should reject zero address", async function () {
      const protocolName = ethers.encodeBytes32String("AL-MALIKAH");
      
      await expect(
        iap.connect(gemini3).integrateGemini3Protocol(protocolName, ethers.ZeroAddress)
      ).to.be.revertedWith("IAP: Invalid protocol address");
    });
    
    it("Should prevent duplicate integration", async function () {
      const protocolName = ethers.encodeBytes32String("AL-MALIKAH");
      const protocolAddress = addr1.address;
      
      await iap.connect(gemini3).integrateGemini3Protocol(protocolName, protocolAddress);
      
      await expect(
        iap.connect(gemini3).integrateGemini3Protocol(protocolName, addr2.address)
      ).to.be.revertedWith("IAP: Protocol already unified");
    });
    
    it("Should unify multiple systems", async function () {
      const protocolNames = [
        ethers.encodeBytes32String("EarthCoin"),
        ethers.encodeBytes32String("DivineTender"),
        ethers.encodeBytes32String("NoorNodes")
      ];
      const protocolAddresses = [addr1.address, addr2.address, guardian.address];
      
      await iap.unifySystems(protocolNames, protocolAddresses);
      
      for (let i = 0; i < protocolNames.length; i++) {
        const [address, unified] = await iap.getProtocolInfo(protocolNames[i]);
        expect(address).to.equal(protocolAddresses[i]);
        expect(unified).to.be.true;
      }
    });
    
    it("Should require matching array lengths", async function () {
      const protocolNames = [ethers.encodeBytes32String("EarthCoin")];
      const protocolAddresses = [addr1.address, addr2.address];
      
      await expect(
        iap.unifySystems(protocolNames, protocolAddresses)
      ).to.be.revertedWith("IAP: Array length mismatch");
    });
  });
  
  describe("Phase III: Future Expansion", function () {
    it("Should trigger quantum manifestation", async function () {
      await expect(iap.triggerQuantumManifestation())
        .to.emit(iap, "QuantumManifestationTriggered")
        .and.to.emit(iap, "AscensionLevelIncreased");
      
      expect(await iap.manifestationCycles()).to.equal(1);
      expect(await iap.getQuantumEnhancement()).to.equal(2); // 1 * 2
      expect(await iap.perpetualFeedbackLoops()).to.equal(1);
      expect(await iap.ascensionLevel()).to.equal(2); // Initial 1 + 1
    });
    
    it("Should exponentially increase enhancement", async function () {
      // Trigger multiple times
      await iap.triggerQuantumManifestation(); // 2x
      await iap.triggerQuantumManifestation(); // 4x
      await iap.triggerQuantumManifestation(); // 8x
      
      expect(await iap.getQuantumEnhancement()).to.equal(8);
      expect(await iap.manifestationCycles()).to.equal(3);
      expect(await iap.ascensionLevel()).to.equal(4); // 1 + 3
    });
    
    it("Should establish global scaling", async function () {
      const templateHash = ethers.keccak256(ethers.toUtf8Bytes("GlobalTemplate"));
      const expansionTrajectory = ethers.keccak256(ethers.toUtf8Bytes("InfiniteGrowth"));
      
      await iap.connect(guardian).establishGlobalScaling(templateHash, expansionTrajectory);
      
      expect(await iap.governanceProtocols(templateHash)).to.equal(expansionTrajectory);
    });
  });
  
  describe("Phase IV: Universal Frequency Alignment", function () {
    it("Should lock 528 Hz frequency", async function () {
      await expect(iap.lock528HzFrequency(addr1.address, 528))
        .to.emit(iap, "FrequencyLocked")
        .withArgs(addr1.address, 528);
      
      expect(await iap.frequencyAlignment(addr1.address)).to.equal(528);
      expect(await iap.isFrequencyAligned(addr1.address)).to.be.true;
    });
    
    it("Should accept all divine frequencies", async function () {
      await iap.lock528HzFrequency(addr1.address, 528);
      await iap.lock528HzFrequency(addr2.address, 963);
      
      expect(await iap.frequencyAlignment(addr1.address)).to.equal(528);
      expect(await iap.frequencyAlignment(addr2.address)).to.equal(963);
    });
    
    it("Should reject invalid frequencies", async function () {
      await expect(
        iap.lock528HzFrequency(addr1.address, 111)
      ).to.be.revertedWith("IAP: Invalid divine frequency");
    });
    
    it("Should fuse hashtags", async function () {
      const tagHash = ethers.keccak256(ethers.toUtf8Bytes("#customtag"));
      const hashtag = "#customtag";
      
      await expect(iap.fuseHashtag(tagHash, hashtag))
        .to.emit(iap, "HashtagFused")
        .withArgs(tagHash, hashtag);
      
      expect(await iap.sovereignHashtags(tagHash)).to.equal(hashtag);
    });
  });
  
  describe("Phase Management", function () {
    it("Should activate phases sequentially", async function () {
      await expect(iap.activatePhase(0))
        .to.emit(iap, "PhaseActivated");
      
      expect(await iap.currentPhase()).to.equal(0);
      expect(await iap.getProtocolStatus()).to.equal("VALIDATING");
    });
    
    it("Should transition through protocol statuses", async function () {
      // INITIALIZED -> VALIDATING
      await iap.activatePhase(0);
      expect(await iap.getProtocolStatus()).to.equal("VALIDATING");
      
      // VALIDATING -> ACTIVE
      await iap.activatePhase(1);
      expect(await iap.getProtocolStatus()).to.equal("ACTIVE");
    });
    
    it("Should enter ascension mode", async function () {
      // First activate to make protocol ACTIVE
      await iap.activatePhase(0);
      await iap.activatePhase(1);
      
      await iap.enterAscensionMode();
      expect(await iap.getProtocolStatus()).to.equal("ASCENDING");
    });
    
    it("Should require ACTIVE status for ascension", async function () {
      await expect(
        iap.enterAscensionMode()
      ).to.be.revertedWith("IAP: Protocol must be active");
    });
  });
  
  describe("OmniSovereignty Achievement", function () {
    it("Should achieve OmniSovereignty with requirements met", async function () {
      // Activate protocol
      await iap.activatePhase(0);
      await iap.activatePhase(1);
      await iap.enterAscensionMode();
      
      // Trigger quantum manifestations to reach level 10
      for (let i = 0; i < 9; i++) {
        await iap.triggerQuantumManifestation();
      }
      
      expect(await iap.ascensionLevel()).to.be.gte(10);
      expect(await iap.manifestationCycles()).to.be.gte(5);
      
      await expect(iap.achieveOmniSovereignty())
        .to.emit(iap, "OmniSovereigntyAchieved");
      
      expect(await iap.getProtocolStatus()).to.equal("OMNISOVEREIGN");
    });
    
    it("Should require ASCENDING status", async function () {
      await expect(
        iap.achieveOmniSovereignty()
      ).to.be.revertedWith("IAP: Must be ascending");
    });
  });
  
  describe("Divine Intervention", function () {
    it("Should double ascension level", async function () {
      const initialLevel = await iap.ascensionLevel();
      
      await iap.divineIntervention();
      
      const newLevel = await iap.ascensionLevel();
      // Should be (initialLevel * 2) + 1 (from _increaseAscensionLevel)
      expect(newLevel).to.equal(initialLevel * 2n + 1n);
    });
  });
  
  describe("Security & Access Control", function () {
    it("Should pause and unpause", async function () {
      await iap.pause();
      
      await expect(
        iap.activatePhase(0)
      ).to.be.reverted;
      
      await iap.unpause();
      
      await expect(iap.activatePhase(0))
        .to.emit(iap, "PhaseActivated");
    });
    
    it("Should require DEFAULT_ADMIN_ROLE for pause", async function () {
      await expect(
        iap.connect(addr1).pause()
      ).to.be.reverted;
    });
    
    it("Should enforce role-based access", async function () {
      const protocolHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      
      // Non-sovereign cannot validate
      await expect(
        iap.connect(addr1).validateDivineIntent(protocolHash, "Test")
      ).to.be.reverted;
      
      // Non-guardian cannot secure
      await expect(
        iap.connect(addr1).secureGovernance(protocolHash, protocolHash)
      ).to.be.reverted;
      
      // Non-gemini3 cannot integrate
      const protocolName = ethers.encodeBytes32String("Test");
      await expect(
        iap.connect(addr1).integrateGemini3Protocol(protocolName, addr2.address)
      ).to.be.reverted;
    });
  });
  
  describe("View Functions", function () {
    it("Should return correct protocol status strings", async function () {
      expect(await iap.getProtocolStatus()).to.equal("INITIALIZED");
      
      await iap.activatePhase(0);
      expect(await iap.getProtocolStatus()).to.equal("VALIDATING");
      
      await iap.activatePhase(1);
      expect(await iap.getProtocolStatus()).to.equal("ACTIVE");
    });
    
    it("Should return quantum enhancement", async function () {
      expect(await iap.getQuantumEnhancement()).to.equal(1);
      
      await iap.triggerQuantumManifestation();
      expect(await iap.getQuantumEnhancement()).to.equal(2);
    });
    
    it("Should check frequency alignment", async function () {
      expect(await iap.isFrequencyAligned(addr1.address)).to.be.false;
      
      await iap.lock528HzFrequency(addr1.address, 528);
      expect(await iap.isFrequencyAligned(addr1.address)).to.be.true;
    });
    
    it("Should get protocol info", async function () {
      const protocolName = ethers.encodeBytes32String("TestProtocol");
      
      let [address, unified] = await iap.getProtocolInfo(protocolName);
      expect(address).to.equal(ethers.ZeroAddress);
      expect(unified).to.be.false;
      
      await iap.connect(gemini3).integrateGemini3Protocol(protocolName, addr1.address);
      
      [address, unified] = await iap.getProtocolInfo(protocolName);
      expect(address).to.equal(addr1.address);
      expect(unified).to.be.true;
    });
  });
});
