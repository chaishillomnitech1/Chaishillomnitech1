const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Test suite for Psyche16DigitalMirrorTwin NFT contract
 */
describe("Psyche16DigitalMirrorTwin", function () {
  let psyche16;
  let owner;
  let addr1;
  let addr2;
  
  const BASE_URI = "ipfs://QmPsyche16Test/";
  const UNIVERSAL_FREQUENCY = 963;
  const MAX_SUPPLY = 144;
  const GENESIS_SIZE = 12;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const Psyche16DMT = await ethers.getContractFactory("Psyche16DigitalMirrorTwin");
    psyche16 = await Psyche16DMT.deploy(owner.address, BASE_URI);
    await psyche16.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await psyche16.owner()).to.equal(owner.address);
    });
    
    it("Should have correct name and symbol", async function () {
      expect(await psyche16.name()).to.equal("Psyche16 Digital Mirror Twin");
      expect(await psyche16.symbol()).to.equal("P16DMT");
    });
    
    it("Should set correct base URI", async function () {
      const tokenId = 1;
      await psyche16.mintDigitalMirrorTwin(
        addr1.address,
        "CORE-ALPHA-001",
        1000,
        10,
        "0.0°N",
        "0.0°E"
      );
      expect(await psyche16.tokenURI(tokenId)).to.include(BASE_URI);
    });
    
    it("Should have correct constants", async function () {
      expect(await psyche16.UNIVERSAL_FREQUENCY()).to.equal(UNIVERSAL_FREQUENCY);
      expect(await psyche16.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await psyche16.GENESIS_SIZE()).to.equal(GENESIS_SIZE);
    });
  });
  
  describe("Minting", function () {
    it("Should mint Digital Mirror Twin successfully", async function () {
      await expect(
        psyche16.mintDigitalMirrorTwin(
          addr1.address,
          "CORE-ALPHA-001",
          1000,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.emit(psyche16, "DigitalMirrorTwinMinted")
        .withArgs(1, addr1.address, "CORE-ALPHA-001", 1000, 10);
      
      expect(await psyche16.ownerOf(1)).to.equal(addr1.address);
      expect(await psyche16.totalMinted()).to.equal(1);
    });
    
    it("Should emit FrequencyAligned event", async function () {
      await expect(
        psyche16.mintDigitalMirrorTwin(
          addr1.address,
          "CORE-ALPHA-001",
          1000,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.emit(psyche16, "FrequencyAligned")
        .withArgs(1, UNIVERSAL_FREQUENCY);
    });
    
    it("Should store planetary jurisdiction details", async function () {
      await psyche16.mintDigitalMirrorTwin(
        addr1.address,
        "CORE-ALPHA-001",
        1000,
        10,
        "0.0°N",
        "0.0°E"
      );
      
      const details = await psyche16.getDigitalMirrorTwinDetails(1);
      expect(details.jurisdiction).to.equal("CORE-ALPHA-001");
      expect(details.claimKg).to.equal(1000);
      expect(details.areaKm2).to.equal(10);
      expect(details.lat).to.equal("0.0°N");
      expect(details.long).to.equal("0.0°E");
      expect(details.frequency).to.equal(UNIVERSAL_FREQUENCY);
    });
    
    it("Should only allow owner to mint", async function () {
      await expect(
        psyche16.connect(addr1).mintDigitalMirrorTwin(
          addr2.address,
          "CORE-ALPHA-001",
          1000,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.be.revertedWithCustomError(psyche16, "OwnableUnauthorizedAccount");
    });
    
    it("Should reject minting to zero address", async function () {
      await expect(
        psyche16.mintDigitalMirrorTwin(
          ethers.ZeroAddress,
          "CORE-ALPHA-001",
          1000,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.be.revertedWith("Cannot mint to zero address");
    });
    
    it("Should reject minting with empty jurisdiction", async function () {
      await expect(
        psyche16.mintDigitalMirrorTwin(
          addr1.address,
          "",
          1000,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.be.revertedWith("Jurisdiction zone required");
    });
    
    it("Should reject minting with zero claim weight", async function () {
      await expect(
        psyche16.mintDigitalMirrorTwin(
          addr1.address,
          "CORE-ALPHA-001",
          0,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.be.revertedWith("Claim weight must be positive");
    });
    
    it("Should enforce max supply", async function () {
      // Mint max supply
      for (let i = 0; i < MAX_SUPPLY; i++) {
        await psyche16.mintDigitalMirrorTwin(
          addr1.address,
          `SECTOR-${i}`,
          1000,
          10,
          "0.0°N",
          "0.0°E"
        );
      }
      
      // Try to mint one more
      await expect(
        psyche16.mintDigitalMirrorTwin(
          addr1.address,
          "EXTRA-SECTOR",
          1000,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.be.revertedWith("Max supply reached");
    });
  });
  
  describe("Batch Minting", function () {
    it("Should batch mint multiple tokens", async function () {
      const recipients = [addr1.address, addr1.address, addr1.address];
      const zones = ["CORE-ALPHA-001", "CORE-ALPHA-002", "CORE-ALPHA-003"];
      const weights = [1000, 1000, 1000];
      const areas = [10, 10, 10];
      const lats = ["0.0°N", "10.0°N", "20.0°N"];
      const longs = ["0.0°E", "10.0°E", "20.0°E"];
      
      await psyche16.batchMintDigitalMirrorTwins(
        recipients,
        zones,
        weights,
        areas,
        lats,
        longs
      );
      
      expect(await psyche16.totalMinted()).to.equal(3);
      expect(await psyche16.ownerOf(1)).to.equal(addr1.address);
      expect(await psyche16.ownerOf(2)).to.equal(addr1.address);
      expect(await psyche16.ownerOf(3)).to.equal(addr1.address);
    });
    
    it("Should reject batch mint with mismatched array lengths", async function () {
      const recipients = [addr1.address, addr1.address];
      const zones = ["CORE-ALPHA-001"]; // Wrong length
      const weights = [1000, 1000];
      const areas = [10, 10];
      const lats = ["0.0°N", "10.0°N"];
      const longs = ["0.0°E", "10.0°E"];
      
      await expect(
        psyche16.batchMintDigitalMirrorTwins(
          recipients,
          zones,
          weights,
          areas,
          lats,
          longs
        )
      ).to.be.revertedWith("Array lengths must match");
    });
  });
  
  describe("Genesis Collection", function () {
    it("Should identify Genesis tokens correctly", async function () {
      expect(await psyche16.isGenesisToken(1)).to.be.true;
      expect(await psyche16.isGenesisToken(12)).to.be.true;
      expect(await psyche16.isGenesisToken(13)).to.be.false;
      expect(await psyche16.isGenesisToken(144)).to.be.false;
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to update base URI", async function () {
      const newURI = "ipfs://QmNewHash/";
      await psyche16.setBaseURI(newURI);
      
      await psyche16.mintDigitalMirrorTwin(
        addr1.address,
        "CORE-ALPHA-001",
        1000,
        10,
        "0.0°N",
        "0.0°E"
      );
      
      expect(await psyche16.tokenURI(1)).to.include(newURI);
    });
    
    it("Should allow owner to update jurisdiction", async function () {
      await psyche16.mintDigitalMirrorTwin(
        addr1.address,
        "CORE-ALPHA-001",
        1000,
        10,
        "0.0°N",
        "0.0°E"
      );
      
      await expect(
        psyche16.updateJurisdiction(1, "CORE-BETA-001")
      ).to.emit(psyche16, "JurisdictionUpdated")
        .withArgs(1, "CORE-BETA-001");
      
      const details = await psyche16.getDigitalMirrorTwinDetails(1);
      expect(details.jurisdiction).to.equal("CORE-BETA-001");
    });
    
    it("Should allow owner to pause and unpause", async function () {
      await psyche16.pause();
      
      await expect(
        psyche16.mintDigitalMirrorTwin(
          addr1.address,
          "CORE-ALPHA-001",
          1000,
          10,
          "0.0°N",
          "0.0°E"
        )
      ).to.be.revertedWithCustomError(psyche16, "EnforcedPause");
      
      await psyche16.unpause();
      
      await psyche16.mintDigitalMirrorTwin(
        addr1.address,
        "CORE-ALPHA-001",
        1000,
        10,
        "0.0°N",
        "0.0°E"
      );
      
      expect(await psyche16.totalMinted()).to.equal(1);
    });
  });
  
  describe("View Functions", function () {
    it("Should return correct total minted", async function () {
      expect(await psyche16.totalMinted()).to.equal(0);
      
      await psyche16.mintDigitalMirrorTwin(
        addr1.address,
        "CORE-ALPHA-001",
        1000,
        10,
        "0.0°N",
        "0.0°E"
      );
      
      expect(await psyche16.totalMinted()).to.equal(1);
    });
    
    it("Should revert when querying non-existent token", async function () {
      await expect(
        psyche16.getDigitalMirrorTwinDetails(999)
      ).to.be.revertedWith("Token does not exist");
    });
  });
});
