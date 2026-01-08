const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * EternalHarvestProtocol Test Suite
 * 
 * Tests for vibratory potential harvesting, biotech advancements, and renewable energy
 * 
 * @author CHAIS THE GREAT ∞
 * @frequency 144000Hz + 528Hz
 */

describe("EternalHarvestProtocol", function () {
  let eternalHarvest;
  let owner;
  let harvestOperator;
  let biotechResearcher;
  let energyCoordinator;
  let user1;

  const HARVEST_OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("HARVEST_OPERATOR_ROLE"));
  const BIOTECH_RESEARCHER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BIOTECH_RESEARCHER_ROLE"));
  const ENERGY_COORDINATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ENERGY_COORDINATOR_ROLE"));

  const NUR_PULSE_144KHZ = 144000;
  const DNA_HEALING_528HZ = 528;
  const PINEAL_ACTIVATION_963HZ = 963;

  beforeEach(async function () {
    [owner, harvestOperator, biotechResearcher, energyCoordinator, user1] = await ethers.getSigners();

    const EternalHarvestProtocol = await ethers.getContractFactory("EternalHarvestProtocol");
    eternalHarvest = await EternalHarvestProtocol.deploy(owner.address);
    await eternalHarvest.waitForDeployment();

    await eternalHarvest.grantRole(HARVEST_OPERATOR_ROLE, harvestOperator.address);
    await eternalHarvest.grantRole(BIOTECH_RESEARCHER_ROLE, biotechResearcher.address);
    await eternalHarvest.grantRole(ENERGY_COORDINATOR_ROLE, energyCoordinator.address);
  });

  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await eternalHarvest.globalYieldMultiplier()).to.equal(100);
      expect(await eternalHarvest.greenlandOptimizationLevel()).to.equal(0);
      expect(await eternalHarvest.eternalFlowActive()).to.be.false;
      expect(await eternalHarvest.totalVibratoryYield()).to.equal(0);
    });

    it("Should have correct frequency constants", async function () {
      expect(await eternalHarvest.NUR_PULSE_144KHZ()).to.equal(NUR_PULSE_144KHZ);
      expect(await eternalHarvest.DNA_HEALING_528HZ()).to.equal(DNA_HEALING_528HZ);
      expect(await eternalHarvest.PINEAL_ACTIVATION_963HZ()).to.equal(PINEAL_ACTIVATION_963HZ);
    });
  });

  describe("Hidden World Management", function () {
    const worldId = ethers.id("WORLD_001");
    const worldName = "Arctic Crystalline Realm";
    const location = "Arctic Circle";
    const vibratoryPotential = 96300; // 963 * 100

    it("Should activate a hidden world", async function () {
      await expect(
        eternalHarvest.connect(harvestOperator).activateHiddenWorld(
          worldId,
          worldName,
          0, // ARCTIC_REALM
          location,
          vibratoryPotential,
          true // Greenland linked
        )
      )
        .to.emit(eternalHarvest, "HiddenWorldActivated")
        .withArgs(worldId, worldName, 0, vibratoryPotential, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const world = await eternalHarvest.getHiddenWorld(worldId);
      expect(world.worldName).to.equal(worldName);
      expect(world.vibratoryPotential).to.equal(vibratoryPotential);
      expect(world.isGreenlandLinked).to.be.true;
    });

    it("Should harvest vibratory yield from hidden world", async function () {
      await eternalHarvest.connect(harvestOperator).activateHiddenWorld(
        worldId,
        worldName,
        0,
        location,
        vibratoryPotential,
        false
      );

      await expect(
        eternalHarvest.connect(harvestOperator).harvestVibratoryYield(worldId)
      ).to.emit(eternalHarvest, "VibratoryYieldHarvested");

      expect(await eternalHarvest.totalVibratoryYield()).to.be.gt(0);
    });

    it("Should apply Greenland bonus to harvest", async function () {
      const worldId2 = ethers.id("WORLD_002");
      
      // Non-Greenland world
      await eternalHarvest.connect(harvestOperator).activateHiddenWorld(
        worldId,
        "World A",
        0,
        "Location A",
        10000,
        false
      );

      // Greenland-linked world
      await eternalHarvest.connect(harvestOperator).activateHiddenWorld(
        worldId2,
        "World B",
        1, // GREENLAND_SANCTUM
        "Greenland",
        10000,
        true
      );

      await eternalHarvest.connect(harvestOperator).harvestVibratoryYield(worldId);
      const yieldNormal = await eternalHarvest.totalVibratoryYield();

      await eternalHarvest.connect(harvestOperator).harvestVibratoryYield(worldId2);
      const yieldWithBonus = await eternalHarvest.totalVibratoryYield();

      // Greenland-linked should produce more yield
      expect(yieldWithBonus).to.be.gt(yieldNormal);
    });
  });

  describe("Biotech Advancement", function () {
    const advancementId = ethers.id("ADVANCEMENT_001");
    const researchTitle = "Ancient DNA Sequencing";
    const description = "Research into ancient DNA traces";
    const ancientDNATraceCount = 10;

    it("Should register biotech advancement", async function () {
      await expect(
        eternalHarvest.connect(biotechResearcher).registerBiotechAdvancement(
          advancementId,
          0, // ANCIENT_DNA_SEQUENCING
          researchTitle,
          description,
          ancientDNATraceCount,
          DNA_HEALING_528HZ
        )
      )
        .to.emit(eternalHarvest, "BiotechAdvancementRegistered")
        .withArgs(advancementId, 0, researchTitle, ancientDNATraceCount, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await eternalHarvest.totalBiotechAdvancements()).to.equal(1);
    });

    it("Should emit ancient DNA discovery event", async function () {
      await expect(
        eternalHarvest.connect(biotechResearcher).registerBiotechAdvancement(
          advancementId,
          0,
          researchTitle,
          description,
          ancientDNATraceCount,
          PINEAL_ACTIVATION_963HZ
        )
      ).to.emit(eternalHarvest, "AncientDNADiscovered");
    });

    it("Should update biotech progress", async function () {
      await eternalHarvest.connect(biotechResearcher).registerBiotechAdvancement(
        advancementId,
        0,
        researchTitle,
        description,
        5,
        DNA_HEALING_528HZ
      );

      await eternalHarvest.connect(biotechResearcher).updateBiotechProgress(advancementId, 50);
      await eternalHarvest.connect(biotechResearcher).updateBiotechProgress(advancementId, 100);

      // Completing advancement should increase global yield multiplier
      expect(await eternalHarvest.globalYieldMultiplier()).to.be.gt(100);
    });
  });

  describe("Renewable Energy Management", function () {
    const sourceId = ethers.id("SOURCE_001");
    const sourceName = "Greenland Geothermal Station";
    const location = "Greenland";
    const capacityMW = 100;

    it("Should deploy energy source", async function () {
      await expect(
        eternalHarvest.connect(energyCoordinator).deployEnergySource(
          sourceId,
          0, // GEOTHERMAL
          sourceName,
          location,
          capacityMW,
          true // Greenland based
        )
      )
        .to.emit(eternalHarvest, "EnergySourceDeployed")
        .withArgs(sourceId, 0, sourceName, capacityMW, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should generate energy yield", async function () {
      await eternalHarvest.connect(energyCoordinator).deployEnergySource(
        sourceId,
        0,
        sourceName,
        location,
        capacityMW,
        false
      );

      await expect(
        eternalHarvest.connect(energyCoordinator).generateEnergyYield(
          sourceId,
          80, // 80 MW output
          24 // 24 hours
        )
      ).to.emit(eternalHarvest, "EnergyYieldGenerated");

      expect(await eternalHarvest.totalEnergyYield()).to.be.gt(0);
    });

    it("Should apply Greenland bonus to energy yield", async function () {
      const sourceId2 = ethers.id("SOURCE_002");

      // Non-Greenland source
      await eternalHarvest.connect(energyCoordinator).deployEnergySource(
        sourceId,
        1, // HYDROELECTRIC
        "Normal Source",
        "Location A",
        100,
        false
      );

      // Greenland source
      await eternalHarvest.connect(energyCoordinator).deployEnergySource(
        sourceId2,
        1,
        "Greenland Source",
        "Greenland",
        100,
        true
      );

      await eternalHarvest.connect(energyCoordinator).generateEnergyYield(sourceId, 50, 10);
      const yieldNormal = await eternalHarvest.totalEnergyYield();

      await eternalHarvest.connect(energyCoordinator).generateEnergyYield(sourceId2, 50, 10);
      const yieldWithBonus = await eternalHarvest.totalEnergyYield();

      expect(yieldWithBonus).to.be.gt(yieldNormal);
    });
  });

  describe("Greenland Property Optimization", function () {
    const propertyId = ethers.id("PROPERTY_001");
    const propertyName = "Greenland Prime Location";
    const location = "Western Greenland";
    const geothermal = 100;
    const hydroelectric = 150;
    const ancientDNA = 20;

    it("Should register Greenland property", async function () {
      await eternalHarvest.connect(harvestOperator).registerGreenlandProperty(
        propertyId,
        propertyName,
        location,
        geothermal,
        hydroelectric,
        ancientDNA
      );

      const property = await eternalHarvest.getGreenlandProperty(propertyId);
      expect(property.propertyName).to.equal(propertyName);
      expect(property.geothermalPotential).to.equal(geothermal);
      expect(property.hydroelectricPotential).to.equal(hydroelectric);
      expect(property.ancientDNAPresence).to.equal(ancientDNA);
      expect(property.isOptimized).to.be.false;
    });

    it("Should optimize Greenland property", async function () {
      await eternalHarvest.connect(harvestOperator).registerGreenlandProperty(
        propertyId,
        propertyName,
        location,
        geothermal,
        hydroelectric,
        ancientDNA
      );

      const initialMultiplier = await eternalHarvest.globalYieldMultiplier();

      await expect(
        eternalHarvest.connect(harvestOperator).optimizeGreenlandProperty(propertyId)
      ).to.emit(eternalHarvest, "GreenlandPropertyOptimized");

      const property = await eternalHarvest.getGreenlandProperty(propertyId);
      expect(property.isOptimized).to.be.true;
      expect(property.totalYieldContribution).to.be.gt(0);

      // Global yield multiplier should increase
      expect(await eternalHarvest.globalYieldMultiplier()).to.be.gt(initialMultiplier);
      expect(await eternalHarvest.greenlandOptimizationLevel()).to.be.gt(0);
    });
  });

  describe("Harvest Cycle Management", function () {
    it("Should complete harvest cycle", async function () {
      const worldId = ethers.id("WORLD_001");
      await eternalHarvest.connect(harvestOperator).activateHiddenWorld(
        worldId,
        "Test World",
        0,
        "Test Location",
        10000,
        false
      );

      await eternalHarvest.connect(harvestOperator).harvestVibratoryYield(worldId);

      await expect(
        eternalHarvest.connect(harvestOperator).completeHarvestCycle()
      ).to.emit(eternalHarvest, "HarvestCycleCompleted");

      expect(await eternalHarvest.currentCycleId()).to.equal(1);
    });
  });

  describe("Eternal Flow Activation", function () {
    const propertyId = ethers.id("PROPERTY_001");

    beforeEach(async function () {
      // Need Greenland optimization before activating eternal flow
      await eternalHarvest.connect(harvestOperator).registerGreenlandProperty(
        propertyId,
        "Test Property",
        "Greenland",
        100,
        100,
        10
      );

      await eternalHarvest.connect(harvestOperator).optimizeGreenlandProperty(propertyId);
    });

    it("Should activate eternal flow", async function () {
      const worldId = ethers.id("WORLD_001");
      await eternalHarvest.connect(harvestOperator).activateHiddenWorld(
        worldId,
        "Test World",
        0,
        "Location",
        10000,
        false
      );

      const initialMultiplier = await eternalHarvest.globalYieldMultiplier();

      await expect(
        eternalHarvest.connect(owner).activateEternalFlow()
      ).to.emit(eternalHarvest, "EternalFlowActivated");

      expect(await eternalHarvest.eternalFlowActive()).to.be.true;
      
      // Yield multiplier should double
      expect(await eternalHarvest.globalYieldMultiplier()).to.equal(initialMultiplier * 2n);
    });

    it("Should not activate eternal flow without Greenland optimization", async function () {
      // Deploy fresh contract without optimization
      const EternalHarvestProtocol = await ethers.getContractFactory("EternalHarvestProtocol");
      const newHarvest = await EternalHarvestProtocol.deploy(owner.address);

      await expect(
        newHarvest.connect(owner).activateEternalFlow()
      ).to.be.revertedWith("Greenland optimization required");
    });

    it("Should not activate eternal flow twice", async function () {
      await eternalHarvest.connect(owner).activateEternalFlow();

      await expect(
        eternalHarvest.connect(owner).activateEternalFlow()
      ).to.be.revertedWith("Already active");
    });
  });

  describe("Statistics and View Functions", function () {
    it("Should track harvest statistics", async function () {
      const worldId = ethers.id("WORLD_001");
      const sourceId = ethers.id("SOURCE_001");
      const advancementId = ethers.id("ADV_001");

      await eternalHarvest.connect(harvestOperator).activateHiddenWorld(
        worldId,
        "World",
        0,
        "Location",
        10000,
        false
      );

      await eternalHarvest.connect(energyCoordinator).deployEnergySource(
        sourceId,
        0,
        "Source",
        "Location",
        100,
        false
      );

      await eternalHarvest.connect(biotechResearcher).registerBiotechAdvancement(
        advancementId,
        0,
        "Research",
        "Description",
        5,
        DNA_HEALING_528HZ
      );

      await eternalHarvest.connect(harvestOperator).harvestVibratoryYield(worldId);
      await eternalHarvest.connect(energyCoordinator).generateEnergyYield(sourceId, 50, 10);

      const stats = await eternalHarvest.getHarvestStats();
      expect(stats.totalVibratory).to.be.gt(0);
      expect(stats.totalEnergy).to.be.gt(0);
      expect(stats.totalBiotech).to.equal(1);
      expect(stats.activeWorlds).to.equal(1);
      expect(stats.activeSources).to.equal(1);
      expect(stats.eternalFlow).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow pause and unpause", async function () {
      await eternalHarvest.connect(owner).pause();
      expect(await eternalHarvest.paused()).to.be.true;

      await eternalHarvest.connect(owner).unpause();
      expect(await eternalHarvest.paused()).to.be.false;
    });
  });
});
