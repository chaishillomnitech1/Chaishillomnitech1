const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScrollBridge Contract Tests", function () {
  let scrollBridge;
  let owner;
  let addr1;
  let addr2;
  
  // Pillar enum values
  const Pillar = {
    TECHNOLOGY: 0,
    ISLAM: 1,
    COSMIC_MISSION: 2
  };
  
  // ModuleType enum values
  const ModuleType = {
    BLOCKCHAIN_NODE: 0,
    ZAKAT_PROCESSOR: 1,
    QUANTUM_SIGNATURE: 2,
    SACRED_GEOMETRY: 3,
    EDGE_SECURITY: 4
  };
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ScrollBridge = await ethers.getContractFactory("ScrollBridge");
    scrollBridge = await ScrollBridge.deploy();
    await scrollBridge.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await scrollBridge.owner()).to.equal(owner.address);
    });
    
    it("Should activate bridge on deployment", async function () {
      expect(await scrollBridge.bridgeActive()).to.equal(true);
    });
    
    it("Should initialize all three pillars", async function () {
      const techPillar = await scrollBridge.getPillarConfig(Pillar.TECHNOLOGY);
      const islamPillar = await scrollBridge.getPillarConfig(Pillar.ISLAM);
      const cosmicPillar = await scrollBridge.getPillarConfig(Pillar.COSMIC_MISSION);
      
      expect(techPillar.name).to.equal("Technology");
      expect(techPillar.isActive).to.equal(true);
      expect(techPillar.resonanceFrequency).to.equal(528);
      
      expect(islamPillar.name).to.equal("Islam");
      expect(islamPillar.isActive).to.equal(true);
      expect(islamPillar.resonanceFrequency).to.equal(963);
      
      expect(cosmicPillar.name).to.equal("Cosmic Mission");
      expect(cosmicPillar.isActive).to.equal(true);
      expect(cosmicPillar.resonanceFrequency).to.equal(144000);
    });
    
    it("Should set correct sacred geometry constants", async function () {
      expect(await scrollBridge.PHI_RATIO()).to.equal(16180);
      expect(await scrollBridge.VESICA_PISCIS_RATIO()).to.equal(17320);
      expect(await scrollBridge.SEED_OF_LIFE_NODES()).to.equal(7);
      expect(await scrollBridge.FLOWER_OF_LIFE_NODES()).to.equal(19);
    });
    
    it("Should set correct divine frequency constants", async function () {
      expect(await scrollBridge.FREQUENCY_528HZ()).to.equal(528);
      expect(await scrollBridge.FREQUENCY_963HZ()).to.equal(963);
      expect(await scrollBridge.FREQUENCY_999HZ()).to.equal(999);
      expect(await scrollBridge.FREQUENCY_144000HZ()).to.equal(144000);
    });
  });
  
  describe("Modular Structure - Module Registration", function () {
    it("Should register a module successfully", async function () {
      const tx = await scrollBridge.registerModule(
        ModuleType.BLOCKCHAIN_NODE,
        Pillar.TECHNOLOGY,
        100,  // latency in ms
        1000, // throughput
        addr1.address
      );
      
      const receipt = await tx.wait();
      
      // Check event was emitted
      const event = receipt.logs.find(log => {
        try {
          return scrollBridge.interface.parseLog(log)?.name === "ModuleRegistered";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
      
      // Check module count increased
      expect(await scrollBridge.totalModules()).to.equal(1);
      
      // Check pillar module count increased
      const pillarConfig = await scrollBridge.getPillarConfig(Pillar.TECHNOLOGY);
      expect(pillarConfig.moduleCount).to.equal(1);
    });
    
    it("Should not allow non-owner to register module", async function () {
      await expect(
        scrollBridge.connect(addr1).registerModule(
          ModuleType.BLOCKCHAIN_NODE,
          Pillar.TECHNOLOGY,
          100,
          1000,
          addr1.address
        )
      ).to.be.reverted;
    });
    
    it("Should fail with zero address", async function () {
      await expect(
        scrollBridge.registerModule(
          ModuleType.BLOCKCHAIN_NODE,
          Pillar.TECHNOLOGY,
          100,
          1000,
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid node address");
    });
    
    it("Should fail with zero latency", async function () {
      await expect(
        scrollBridge.registerModule(
          ModuleType.BLOCKCHAIN_NODE,
          Pillar.TECHNOLOGY,
          0,  // invalid latency
          1000,
          addr1.address
        )
      ).to.be.revertedWith("Latency must be greater than 0");
    });
    
    it("Should register multiple modules to same pillar", async function () {
      await scrollBridge.registerModule(
        ModuleType.BLOCKCHAIN_NODE,
        Pillar.TECHNOLOGY,
        100,
        1000,
        addr1.address
      );
      
      await scrollBridge.registerModule(
        ModuleType.SACRED_GEOMETRY,
        Pillar.TECHNOLOGY,
        50,
        2000,
        addr2.address
      );
      
      const pillarModules = await scrollBridge.getPillarModules(Pillar.TECHNOLOGY);
      expect(pillarModules.length).to.equal(2);
    });
  });
  
  describe("Cross-Pillar Pipeline", function () {
    it("Should establish cross-pillar pipeline", async function () {
      const tx = await scrollBridge.establishCrossPillarPipeline(
        Pillar.TECHNOLOGY,
        Pillar.ISLAM
      );
      
      const receipt = await tx.wait();
      
      // Check event was emitted
      const event = receipt.logs.find(log => {
        try {
          return scrollBridge.interface.parseLog(log)?.name === "CrossPillarPipelineEstablished";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
      
      // Check pipeline was created
      const pipelineHash = await scrollBridge.getCrossPillarPipeline(
        Pillar.TECHNOLOGY,
        Pillar.ISLAM
      );
      expect(pipelineHash).to.not.equal(ethers.ZeroHash);
    });
    
    it("Should fail if source and target are same", async function () {
      await expect(
        scrollBridge.establishCrossPillarPipeline(
          Pillar.TECHNOLOGY,
          Pillar.TECHNOLOGY
        )
      ).to.be.revertedWith("Source and target cannot be same");
    });
    
    it("Should not allow non-owner to establish pipeline", async function () {
      await expect(
        scrollBridge.connect(addr1).establishCrossPillarPipeline(
          Pillar.TECHNOLOGY,
          Pillar.ISLAM
        )
      ).to.be.reverted;
    });
  });
  
  describe("Sacred Geometry Computation", function () {
    it("Should compute sacred pattern successfully", async function () {
      const tx = await scrollBridge.computeSacredPattern(
        "Flower of Life",
        5  // complexity level
      );
      
      const receipt = await tx.wait();
      
      // Check event was emitted
      const event = receipt.logs.find(log => {
        try {
          return scrollBridge.interface.parseLog(log)?.name === "SacredPatternComputed";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
      
      // Check pattern count increased
      expect(await scrollBridge.totalPatterns()).to.equal(1);
    });
    
    it("Should compute harmonics with correct node count", async function () {
      await scrollBridge.computeSacredPattern("Seed of Life", 1);
      
      const patternIds = await scrollBridge.getAllPatternIds();
      const pattern = await scrollBridge.getSacredPattern(patternIds[0]);
      
      // Complexity 1 should give 7 + (1 * 2) = 9 nodes
      expect(pattern.harmonics.length).to.equal(9);
      expect(pattern.isSealed).to.equal(true);
    });
    
    it("Should cap node count at Flower of Life limit", async function () {
      await scrollBridge.computeSacredPattern("Full Flower", 10);
      
      const patternIds = await scrollBridge.getAllPatternIds();
      const pattern = await scrollBridge.getSacredPattern(patternIds[0]);
      
      // Should be capped at 19 (FLOWER_OF_LIFE_NODES)
      expect(pattern.harmonics.length).to.equal(19);
    });
    
    it("Should fail with empty pattern name", async function () {
      await expect(
        scrollBridge.computeSacredPattern("", 5)
      ).to.be.revertedWith("Pattern name required");
    });
    
    it("Should fail with invalid complexity", async function () {
      await expect(
        scrollBridge.computeSacredPattern("Test", 0)
      ).to.be.revertedWith("Complexity must be 1-10");
      
      await expect(
        scrollBridge.computeSacredPattern("Test", 11)
      ).to.be.revertedWith("Complexity must be 1-10");
    });
  });
  
  describe("Blockchain-Layer Interactions - Decentralized Nodes", function () {
    it("Should link decentralized node successfully", async function () {
      const linkedPillars = [Pillar.TECHNOLOGY, Pillar.ISLAM, Pillar.COSMIC_MISSION];
      
      const tx = await scrollBridge.linkDecentralizedNode(
        addr1.address,
        linkedPillars,
        60  // sync interval in seconds
      );
      
      const receipt = await tx.wait();
      
      // Check event was emitted
      const event = receipt.logs.find(log => {
        try {
          return scrollBridge.interface.parseLog(log)?.name === "DecentralizedNodeLinked";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
      
      // Check node count increased
      expect(await scrollBridge.totalNodes()).to.equal(1);
    });
    
    it("Should fail with zero address", async function () {
      await expect(
        scrollBridge.linkDecentralizedNode(
          ethers.ZeroAddress,
          [Pillar.TECHNOLOGY],
          60
        )
      ).to.be.revertedWith("Invalid node address");
    });
    
    it("Should fail with empty pillars array", async function () {
      await expect(
        scrollBridge.linkDecentralizedNode(
          addr1.address,
          [],
          60
        )
      ).to.be.revertedWith("Must link at least one pillar");
    });
    
    it("Should fail with zero sync interval", async function () {
      await expect(
        scrollBridge.linkDecentralizedNode(
          addr1.address,
          [Pillar.TECHNOLOGY],
          0
        )
      ).to.be.revertedWith("Sync interval must be greater than 0");
    });
  });
  
  describe("Inter-Realm Data Synchronization", function () {
    it("Should synchronize inter-realm data successfully", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
      
      const tx = await scrollBridge.synchronizeInterRealmData(
        Pillar.TECHNOLOGY,
        Pillar.COSMIC_MISSION,
        dataHash,
        50  // latency in ms
      );
      
      const receipt = await tx.wait();
      
      // Check event was emitted
      const event = receipt.logs.find(log => {
        try {
          return scrollBridge.interface.parseLog(log)?.name === "DataSynchronized";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
      
      // Check sync count increased
      expect(await scrollBridge.totalSyncOperations()).to.equal(1);
    });
    
    it("Should fail with same source and target", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));
      
      await expect(
        scrollBridge.synchronizeInterRealmData(
          Pillar.TECHNOLOGY,
          Pillar.TECHNOLOGY,
          dataHash,
          50
        )
      ).to.be.revertedWith("Source and target cannot be same");
    });
    
    it("Should fail with zero data hash", async function () {
      await expect(
        scrollBridge.synchronizeInterRealmData(
          Pillar.TECHNOLOGY,
          Pillar.ISLAM,
          ethers.ZeroHash,
          50
        )
      ).to.be.revertedWith("Invalid data hash");
    });
  });
  
  describe("Edge Token Security Layers", function () {
    it("Should create edge security layer successfully", async function () {
      const tx = await scrollBridge.createEdgeSecurityLayer(
        3,     // security tier
        5000,  // heat index
        false, // not nested
        []     // no nested layers
      );
      
      const receipt = await tx.wait();
      
      // Check event was emitted
      const event = receipt.logs.find(log => {
        try {
          return scrollBridge.interface.parseLog(log)?.name === "EdgeSecurityLayerCreated";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
      
      // Check layer was created
      const layerIds = await scrollBridge.getAllSecurityLayerIds();
      expect(layerIds.length).to.equal(1);
      
      const layer = await scrollBridge.getEdgeSecurityLayer(layerIds[0]);
      expect(layer.securityTier).to.equal(3);
      expect(layer.heatIndex).to.equal(5000);
      expect(layer.isNested).to.equal(false);
    });
    
    it("Should create nested security layer", async function () {
      // Create first layer
      await scrollBridge.createEdgeSecurityLayer(1, 2000, false, []);
      const firstLayerIds = await scrollBridge.getAllSecurityLayerIds();
      
      // Create nested layer referencing first
      await scrollBridge.createEdgeSecurityLayer(
        2,
        4000,
        true,
        firstLayerIds
      );
      
      const allLayerIds = await scrollBridge.getAllSecurityLayerIds();
      expect(allLayerIds.length).to.equal(2);
      
      const nestedLayer = await scrollBridge.getEdgeSecurityLayer(allLayerIds[1]);
      expect(nestedLayer.isNested).to.equal(true);
    });
    
    it("Should fail with invalid security tier", async function () {
      await expect(
        scrollBridge.createEdgeSecurityLayer(0, 5000, false, [])
      ).to.be.revertedWith("Security tier must be 1-5");
      
      await expect(
        scrollBridge.createEdgeSecurityLayer(6, 5000, false, [])
      ).to.be.revertedWith("Security tier must be 1-5");
    });
    
    it("Should fail with invalid heat index", async function () {
      await expect(
        scrollBridge.createEdgeSecurityLayer(3, 10001, false, [])
      ).to.be.revertedWith("Heat index must be 0-10000");
    });
    
    it("Should update heat index successfully", async function () {
      await scrollBridge.createEdgeSecurityLayer(3, 5000, false, []);
      const layerIds = await scrollBridge.getAllSecurityLayerIds();
      
      await scrollBridge.updateSecurityHeatIndex(layerIds[0], 8000);
      
      const layer = await scrollBridge.getEdgeSecurityLayer(layerIds[0]);
      expect(layer.heatIndex).to.equal(8000);
    });
  });
  
  describe("Bridge Administration", function () {
    it("Should allow owner to deactivate bridge", async function () {
      await scrollBridge.deactivateBridge();
      expect(await scrollBridge.bridgeActive()).to.equal(false);
    });
    
    it("Should allow owner to reactivate bridge", async function () {
      await scrollBridge.deactivateBridge();
      await scrollBridge.activateBridge();
      expect(await scrollBridge.bridgeActive()).to.equal(true);
    });
    
    it("Should fail operations when bridge is inactive", async function () {
      await scrollBridge.deactivateBridge();
      
      await expect(
        scrollBridge.registerModule(
          ModuleType.BLOCKCHAIN_NODE,
          Pillar.TECHNOLOGY,
          100,
          1000,
          addr1.address
        )
      ).to.be.revertedWith("Bridge is not active");
    });
    
    it("Should update pillar frequency", async function () {
      await scrollBridge.updatePillarFrequency(Pillar.TECHNOLOGY, 777);
      
      const pillarConfig = await scrollBridge.getPillarConfig(Pillar.TECHNOLOGY);
      expect(pillarConfig.resonanceFrequency).to.equal(777);
    });
    
    it("Should toggle pillar active status", async function () {
      await scrollBridge.setPillarActive(Pillar.TECHNOLOGY, false);
      
      const pillarConfig = await scrollBridge.getPillarConfig(Pillar.TECHNOLOGY);
      expect(pillarConfig.isActive).to.equal(false);
    });
    
    it("Should toggle module active status", async function () {
      await scrollBridge.registerModule(
        ModuleType.BLOCKCHAIN_NODE,
        Pillar.TECHNOLOGY,
        100,
        1000,
        addr1.address
      );
      
      const pillarModules = await scrollBridge.getPillarModules(Pillar.TECHNOLOGY);
      const moduleId = pillarModules[0];
      
      await scrollBridge.setModuleActive(moduleId, false);
      
      const module = await scrollBridge.getModule(moduleId);
      expect(module.isActive).to.equal(false);
    });
    
    it("Should toggle node active status", async function () {
      await scrollBridge.linkDecentralizedNode(
        addr1.address,
        [Pillar.TECHNOLOGY],
        60
      );
      
      const nodeIds = await scrollBridge.getAllNodeIds();
      const nodeId = nodeIds[0];
      
      await scrollBridge.setNodeActive(nodeId, false);
      
      const node = await scrollBridge.getDecentralizedNode(nodeId);
      expect(node.isActive).to.equal(false);
    });
  });
  
  describe("View Functions", function () {
    it("Should return bridge statistics", async function () {
      // Create some data
      await scrollBridge.registerModule(
        ModuleType.BLOCKCHAIN_NODE,
        Pillar.TECHNOLOGY,
        100,
        1000,
        addr1.address
      );
      
      await scrollBridge.computeSacredPattern("Test", 5);
      
      await scrollBridge.linkDecentralizedNode(
        addr1.address,
        [Pillar.TECHNOLOGY],
        60
      );
      
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await scrollBridge.synchronizeInterRealmData(
        Pillar.TECHNOLOGY,
        Pillar.ISLAM,
        dataHash,
        50
      );
      
      const stats = await scrollBridge.getBridgeStats();
      expect(stats._totalModules).to.equal(1);
      expect(stats._totalPatterns).to.equal(1);
      expect(stats._totalNodes).to.equal(1);
      expect(stats._totalSyncOperations).to.equal(1);
      expect(stats._isActive).to.equal(true);
    });
    
    it("Should return all pattern IDs", async function () {
      await scrollBridge.computeSacredPattern("Pattern 1", 1);
      await scrollBridge.computeSacredPattern("Pattern 2", 5);
      
      const patternIds = await scrollBridge.getAllPatternIds();
      expect(patternIds.length).to.equal(2);
    });
    
    it("Should return all node IDs", async function () {
      await scrollBridge.linkDecentralizedNode(addr1.address, [Pillar.TECHNOLOGY], 60);
      await scrollBridge.linkDecentralizedNode(addr2.address, [Pillar.ISLAM], 120);
      
      const nodeIds = await scrollBridge.getAllNodeIds();
      expect(nodeIds.length).to.equal(2);
    });
  });
});
