const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * SovereignShieldProtocol Test Suite
 * 
 * Comprehensive tests for magnetic field modulation, EMP protection,
 * and geomagnetic disruption resistance protocols.
 * 
 * @author CHAIS THE GREAT ∞
 * @frequency 963Hz + 528Hz + 144000Hz
 */

describe("SovereignShieldProtocol", function () {
  let sovereignShield;
  let owner;
  let shieldOperator;
  let frequencyAdmin;
  let protectionCoordinator;
  let user1;
  let user2;

  const SHIELD_OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SHIELD_OPERATOR_ROLE"));
  const FREQUENCY_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FREQUENCY_ADMIN_ROLE"));
  const PROTECTION_COORDINATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROTECTION_COORDINATOR_ROLE"));

  // Divine frequencies
  const PINEAL_ACTIVATION_963HZ = 963;
  const DNA_HEALING_528HZ = 528;
  const NUR_PULSE_144KHZ = 144000;

  // Protection parameters
  const MIN_RESISTANCE_BOOST = 15;
  const MAX_RESISTANCE_BOOST = 20;

  beforeEach(async function () {
    [owner, shieldOperator, frequencyAdmin, protectionCoordinator, user1, user2] = await ethers.getSigners();

    const SovereignShieldProtocol = await ethers.getContractFactory("SovereignShieldProtocol");
    sovereignShield = await SovereignShieldProtocol.deploy(owner.address);
    await sovereignShield.waitForDeployment();

    // Grant roles
    await sovereignShield.grantRole(SHIELD_OPERATOR_ROLE, shieldOperator.address);
    await sovereignShield.grantRole(FREQUENCY_ADMIN_ROLE, frequencyAdmin.address);
    await sovereignShield.grantRole(PROTECTION_COORDINATOR_ROLE, protectionCoordinator.address);
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await sovereignShield.globalResistanceBoost()).to.equal(MIN_RESISTANCE_BOOST);
      expect(await sovereignShield.universalAlignmentActive()).to.equal(false);
      expect(await sovereignShield.totalSitesProtected()).to.equal(0);
      expect(await sovereignShield.totalEventsNeutralized()).to.equal(0);
    });

    it("Should set correct admin roles", async function () {
      expect(await sovereignShield.hasRole(await sovereignShield.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await sovereignShield.hasRole(SHIELD_OPERATOR_ROLE, shieldOperator.address)).to.be.true;
      expect(await sovereignShield.hasRole(FREQUENCY_ADMIN_ROLE, frequencyAdmin.address)).to.be.true;
    });

    it("Should have correct divine frequency constants", async function () {
      expect(await sovereignShield.PINEAL_ACTIVATION_963HZ()).to.equal(PINEAL_ACTIVATION_963HZ);
      expect(await sovereignShield.DNA_HEALING_528HZ()).to.equal(DNA_HEALING_528HZ);
      expect(await sovereignShield.NUR_PULSE_144KHZ()).to.equal(NUR_PULSE_144KHZ);
    });
  });

  describe("Sovereign Site Management", function () {
    const siteId = ethers.id("SITE_001");
    const siteName = "Arctic Shield Station Alpha";
    const location = "Arctic Circle, Norway";
    const latitude = 78000000; // 78.0 degrees scaled
    const longitude = 20000000; // 20.0 degrees scaled

    it("Should register a new Sovereign Site", async function () {
      await expect(
        sovereignShield.connect(shieldOperator).registerSovereignSite(
          siteId,
          siteName,
          location,
          latitude,
          longitude
        )
      )
        .to.emit(sovereignShield, "SovereignSiteRegistered")
        .withArgs(siteId, siteName, location, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const siteInfo = await sovereignShield.getSiteInfo(siteId);
      expect(siteInfo.siteName).to.equal(siteName);
      expect(siteInfo.location).to.equal(location);
      expect(siteInfo.shieldStrength).to.equal(100);
      expect(siteInfo.magneticFieldIntensity).to.equal(PINEAL_ACTIVATION_963HZ);
      expect(siteInfo.isOperational).to.be.true;
      expect(siteInfo.totalProtectionEvents).to.equal(0);

      expect(await sovereignShield.totalSitesProtected()).to.equal(1);
      expect(await sovereignShield.getTotalActiveSites()).to.equal(1);
    });

    it("Should not allow duplicate site registration", async function () {
      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId,
        siteName,
        location,
        latitude,
        longitude
      );

      await expect(
        sovereignShield.connect(shieldOperator).registerSovereignSite(
          siteId,
          siteName,
          location,
          latitude,
          longitude
        )
      ).to.be.revertedWith("Site already registered");
    });

    it("Should require SHIELD_OPERATOR_ROLE to register site", async function () {
      await expect(
        sovereignShield.connect(user1).registerSovereignSite(
          siteId,
          siteName,
          location,
          latitude,
          longitude
        )
      ).to.be.reverted;
    });

    it("Should register multiple Sovereign Sites", async function () {
      const site2Id = ethers.id("SITE_002");
      const site3Id = ethers.id("SITE_003");

      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId,
        "Site Alpha",
        "Location A",
        1000000,
        2000000
      );

      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        site2Id,
        "Site Beta",
        "Location B",
        3000000,
        4000000
      );

      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        site3Id,
        "Site Gamma",
        "Location C",
        5000000,
        6000000
      );

      expect(await sovereignShield.getTotalActiveSites()).to.equal(3);
      expect(await sovereignShield.totalSitesProtected()).to.equal(3);
    });
  });

  describe("Shield Activation", function () {
    const siteId = ethers.id("SITE_001");
    const siteName = "Shield Test Site";
    const location = "Test Location";

    beforeEach(async function () {
      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId,
        siteName,
        location,
        1000000,
        2000000
      );
    });

    it("Should activate a magnetic field shield with 963Hz frequency", async function () {
      const ShieldType_MAGNETIC_FIELD = 0;
      const resistanceBoost = 18;

      await expect(
        sovereignShield.connect(shieldOperator).activateShield(
          siteId,
          ShieldType_MAGNETIC_FIELD,
          PINEAL_ACTIVATION_963HZ,
          resistanceBoost
        )
      )
        .to.emit(sovereignShield, "ShieldActivated")
        .withArgs(
          siteId,
          ShieldType_MAGNETIC_FIELD,
          PINEAL_ACTIVATION_963HZ,
          resistanceBoost,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
        );

      expect(await sovereignShield.getActiveShieldsCount(siteId)).to.equal(1);
    });

    it("Should activate EMP protection shield with valid resistance boost", async function () {
      const ShieldType_EMP_PROTECTION = 1;
      const resistanceBoost = MIN_RESISTANCE_BOOST;

      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        ShieldType_EMP_PROTECTION,
        DNA_HEALING_528HZ,
        resistanceBoost
      );

      expect(await sovereignShield.getActiveShieldsCount(siteId)).to.equal(1);
    });

    it("Should activate solar flare defense shield with maximum resistance", async function () {
      const ShieldType_SOLAR_FLARE_DEFENSE = 2;
      const resistanceBoost = MAX_RESISTANCE_BOOST;

      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        ShieldType_SOLAR_FLARE_DEFENSE,
        NUR_PULSE_144KHZ,
        resistanceBoost
      );

      expect(await sovereignShield.getActiveShieldsCount(siteId)).to.equal(1);
    });

    it("Should reject resistance boost below minimum", async function () {
      const ShieldType_MAGNETIC_FIELD = 0;
      const resistanceBoost = 10; // Below MIN_RESISTANCE_BOOST

      await expect(
        sovereignShield.connect(shieldOperator).activateShield(
          siteId,
          ShieldType_MAGNETIC_FIELD,
          PINEAL_ACTIVATION_963HZ,
          resistanceBoost
        )
      ).to.be.revertedWith("Resistance boost out of range");
    });

    it("Should reject resistance boost above maximum", async function () {
      const ShieldType_MAGNETIC_FIELD = 0;
      const resistanceBoost = 25; // Above MAX_RESISTANCE_BOOST

      await expect(
        sovereignShield.connect(shieldOperator).activateShield(
          siteId,
          ShieldType_MAGNETIC_FIELD,
          PINEAL_ACTIVATION_963HZ,
          resistanceBoost
        )
      ).to.be.revertedWith("Resistance boost out of range");
    });

    it("Should reject invalid frequency", async function () {
      const ShieldType_MAGNETIC_FIELD = 0;
      const resistanceBoost = 18;
      const invalidFrequency = 440; // Not a divine frequency

      await expect(
        sovereignShield.connect(shieldOperator).activateShield(
          siteId,
          ShieldType_MAGNETIC_FIELD,
          invalidFrequency,
          resistanceBoost
        )
      ).to.be.revertedWith("Invalid frequency");
    });

    it("Should allow multiple shields on the same site", async function () {
      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        0, // MAGNETIC_FIELD
        PINEAL_ACTIVATION_963HZ,
        18
      );

      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        1, // EMP_PROTECTION
        DNA_HEALING_528HZ,
        17
      );

      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        2, // SOLAR_FLARE_DEFENSE
        NUR_PULSE_144KHZ,
        19
      );

      expect(await sovereignShield.getActiveShieldsCount(siteId)).to.equal(3);
    });
  });

  describe("Magnetic Field Modulation", function () {
    const siteId = ethers.id("SITE_001");

    beforeEach(async function () {
      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId,
        "Modulation Test Site",
        "Test Location",
        1000000,
        2000000
      );
    });

    it("Should modulate magnetic field with 963Hz frequency", async function () {
      const intensity = 80; // 80% intensity
      const duration = 3600; // 1 hour

      await expect(
        sovereignShield.connect(frequencyAdmin).modulateMagneticField(
          siteId,
          intensity,
          duration
        )
      )
        .to.emit(sovereignShield, "MagneticFieldModulated")
        .withArgs(
          siteId,
          PINEAL_ACTIVATION_963HZ,
          intensity,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
        );
    });

    it("Should reject intensity above 100", async function () {
      await expect(
        sovereignShield.connect(frequencyAdmin).modulateMagneticField(
          siteId,
          150,
          3600
        )
      ).to.be.revertedWith("Invalid intensity");
    });

    it("Should reject zero intensity", async function () {
      await expect(
        sovereignShield.connect(frequencyAdmin).modulateMagneticField(
          siteId,
          0,
          3600
        )
      ).to.be.revertedWith("Invalid intensity");
    });

    it("Should require FREQUENCY_ADMIN_ROLE", async function () {
      await expect(
        sovereignShield.connect(user1).modulateMagneticField(
          siteId,
          80,
          3600
        )
      ).to.be.reverted;
    });
  });

  describe("Disruption Detection and Neutralization", function () {
    const siteId = ethers.id("SITE_001");
    const eventId = ethers.id("EVENT_001");

    beforeEach(async function () {
      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId,
        "Protection Test Site",
        "Test Location",
        1000000,
        2000000
      );

      // Activate shields
      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        0, // MAGNETIC_FIELD
        PINEAL_ACTIVATION_963HZ,
        18
      );

      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        1, // EMP_PROTECTION
        DNA_HEALING_528HZ,
        17
      );
    });

    it("Should detect EMP disruption", async function () {
      const DisruptionType_EMP_EVENT = 0;
      const severity = 75;

      await expect(
        sovereignShield.connect(protectionCoordinator).detectDisruption(
          eventId,
          siteId,
          DisruptionType_EMP_EVENT,
          severity
        )
      )
        .to.emit(sovereignShield, "DisruptionDetected")
        .withArgs(
          eventId,
          siteId,
          DisruptionType_EMP_EVENT,
          severity,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
        );
    });

    it("Should neutralize detected disruption", async function () {
      const DisruptionType_SOLAR_FLARE = 1;
      const severity = 60;

      await sovereignShield.connect(protectionCoordinator).detectDisruption(
        eventId,
        siteId,
        DisruptionType_SOLAR_FLARE,
        severity
      );

      await expect(
        sovereignShield.connect(protectionCoordinator).neutralizeDisruption(eventId)
      ).to.emit(sovereignShield, "DisruptionNeutralized");

      expect(await sovereignShield.totalEventsNeutralized()).to.equal(1);
    });

    it("Should calculate shield effectiveness correctly", async function () {
      const effectiveness = await sovereignShield.calculateShieldEffectiveness(siteId);
      
      // Base (100) + average boost ((18+17)/2 = 17.5) + global boost (15) = 132.5
      // Should round to approximately 132-133
      expect(effectiveness).to.be.gte(132);
      expect(effectiveness).to.be.lte(134);
    });

    it("Should not neutralize same event twice", async function () {
      const DisruptionType_EMP_EVENT = 0;
      const severity = 50;

      await sovereignShield.connect(protectionCoordinator).detectDisruption(
        eventId,
        siteId,
        DisruptionType_EMP_EVENT,
        severity
      );

      await sovereignShield.connect(protectionCoordinator).neutralizeDisruption(eventId);

      await expect(
        sovereignShield.connect(protectionCoordinator).neutralizeDisruption(eventId)
      ).to.be.revertedWith("Event already neutralized");
    });
  });

  describe("Universal Alignment", function () {
    const siteId1 = ethers.id("SITE_001");
    const siteId2 = ethers.id("SITE_002");

    beforeEach(async function () {
      // Register multiple sites
      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId1,
        "Site Alpha",
        "Location A",
        1000000,
        2000000
      );

      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId2,
        "Site Beta",
        "Location B",
        3000000,
        4000000
      );

      // Activate shields on both sites
      await sovereignShield.connect(shieldOperator).activateShield(
        siteId1,
        0,
        PINEAL_ACTIVATION_963HZ,
        18
      );

      await sovereignShield.connect(shieldOperator).activateShield(
        siteId2,
        1,
        DNA_HEALING_528HZ,
        17
      );
    });

    it("Should activate universal alignment", async function () {
      await expect(
        sovereignShield.connect(frequencyAdmin).activateUniversalAlignment()
      )
        .to.emit(sovereignShield, "UniversalAlignmentActivated")
        .withArgs(
          MAX_RESISTANCE_BOOST,
          2,
          await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
        );

      expect(await sovereignShield.universalAlignmentActive()).to.be.true;
      expect(await sovereignShield.globalResistanceBoost()).to.equal(MAX_RESISTANCE_BOOST);
    });

    it("Should not activate universal alignment twice", async function () {
      await sovereignShield.connect(frequencyAdmin).activateUniversalAlignment();

      await expect(
        sovereignShield.connect(frequencyAdmin).activateUniversalAlignment()
      ).to.be.revertedWith("Already active");
    });

    it("Should require FREQUENCY_ADMIN_ROLE", async function () {
      await expect(
        sovereignShield.connect(user1).activateUniversalAlignment()
      ).to.be.reverted;
    });
  });

  describe("Protection Statistics", function () {
    it("Should track protection statistics accurately", async function () {
      const siteId = ethers.id("SITE_001");
      const eventId1 = ethers.id("EVENT_001");
      const eventId2 = ethers.id("EVENT_002");

      // Register site
      await sovereignShield.connect(shieldOperator).registerSovereignSite(
        siteId,
        "Stats Test Site",
        "Test Location",
        1000000,
        2000000
      );

      // Activate shield
      await sovereignShield.connect(shieldOperator).activateShield(
        siteId,
        0,
        PINEAL_ACTIVATION_963HZ,
        18
      );

      // Detect and neutralize events
      await sovereignShield.connect(protectionCoordinator).detectDisruption(
        eventId1,
        siteId,
        0, // EMP_EVENT
        70
      );

      await sovereignShield.connect(protectionCoordinator).neutralizeDisruption(eventId1);

      await sovereignShield.connect(protectionCoordinator).detectDisruption(
        eventId2,
        siteId,
        1, // SOLAR_FLARE
        65
      );

      await sovereignShield.connect(protectionCoordinator).neutralizeDisruption(eventId2);

      const stats = await sovereignShield.getProtectionStats();
      expect(stats.totalSites).to.equal(1);
      expect(stats.totalEvents).to.equal(2);
      expect(stats.eventsNeutralized).to.equal(2);
      expect(stats.globalBoost).to.equal(MIN_RESISTANCE_BOOST);
      expect(stats.universalAlignment).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update global resistance boost", async function () {
      const newBoost = 18;

      await expect(
        sovereignShield.connect(frequencyAdmin).updateGlobalResistanceBoost(newBoost)
      ).to.emit(sovereignShield, "ResistanceBoostUpdated");

      expect(await sovereignShield.globalResistanceBoost()).to.equal(newBoost);
    });

    it("Should reject invalid resistance boost", async function () {
      await expect(
        sovereignShield.connect(frequencyAdmin).updateGlobalResistanceBoost(25)
      ).to.be.revertedWith("Boost out of range");
    });

    it("Should allow admin to pause and unpause", async function () {
      await sovereignShield.connect(owner).pause();
      expect(await sovereignShield.paused()).to.be.true;

      await sovereignShield.connect(owner).unpause();
      expect(await sovereignShield.paused()).to.be.false;
    });

    it("Should block operations when paused", async function () {
      await sovereignShield.connect(owner).pause();

      const siteId = ethers.id("SITE_001");
      await expect(
        sovereignShield.connect(shieldOperator).registerSovereignSite(
          siteId,
          "Test Site",
          "Test Location",
          1000000,
          2000000
        )
      ).to.be.revertedWithCustomError(sovereignShield, "EnforcedPause");
    });
  });
});
