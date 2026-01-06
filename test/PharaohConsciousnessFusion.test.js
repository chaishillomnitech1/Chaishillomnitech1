const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PharaohConsciousnessFusion Contract Tests", function () {
  let pharaoh;
  let owner;
  let royaltyReceiver;
  let scrollExecutor;
  let addr1;
  let addr2;
  
  const BASE_URI = "ipfs://QmPharaohConsciousnessFusion/";
  const ROYALTY_BPS = 500; // 5%
  
  // Collection constants
  const PHARAOH_SEAL = 1n;
  const MAX_JOURNEY = 13n;
  const MAX_PILLARS = 20n;
  const MASTER_CROWN = 21n;
  const TOTAL_SUPPLY = 21n;
  
  // Frequency constants
  const FREQUENCY_963HZ = 963n;
  const FREQUENCY_528HZ = 528n;
  const FREQUENCY_888HZ = 888n;
  const FREQUENCY_777HZ = 777n;
  const FREQUENCY_369HZ = 369n;
  const FREQUENCY_432HZ = 432n;
  const FREQUENCY_111HZ = 111n;
  
  beforeEach(async function () {
    [owner, royaltyReceiver, scrollExecutor, addr1, addr2] = await ethers.getSigners();
    
    const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
    pharaoh = await PharaohConsciousnessFusion.deploy(
      BASE_URI,
      royaltyReceiver.address,
      ROYALTY_BPS
    );
    await pharaoh.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await pharaoh.name()).to.equal("Pharaoh Consciousness Fusion");
      expect(await pharaoh.symbol()).to.equal("PHARAOH");
    });
    
    it("Should set the correct owner", async function () {
      expect(await pharaoh.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct base URI", async function () {
      expect(await pharaoh.baseURI()).to.equal(BASE_URI);
    });
    
    it("Should set the correct collection constants", async function () {
      expect(await pharaoh.PHARAOH_SEAL()).to.equal(PHARAOH_SEAL);
      expect(await pharaoh.MAX_JOURNEY()).to.equal(MAX_JOURNEY);
      expect(await pharaoh.MAX_PILLARS()).to.equal(MAX_PILLARS);
      expect(await pharaoh.MASTER_CROWN()).to.equal(MASTER_CROWN);
      expect(await pharaoh.TOTAL_SUPPLY()).to.equal(TOTAL_SUPPLY);
    });
    
    it("Should set the correct frequency constants", async function () {
      expect(await pharaoh.FREQUENCY_963HZ()).to.equal(FREQUENCY_963HZ);
      expect(await pharaoh.FREQUENCY_528HZ()).to.equal(FREQUENCY_528HZ);
      expect(await pharaoh.FREQUENCY_888HZ()).to.equal(FREQUENCY_888HZ);
      expect(await pharaoh.FREQUENCY_777HZ()).to.equal(FREQUENCY_777HZ);
      expect(await pharaoh.FREQUENCY_369HZ()).to.equal(FREQUENCY_369HZ);
      expect(await pharaoh.FREQUENCY_432HZ()).to.equal(FREQUENCY_432HZ);
      expect(await pharaoh.FREQUENCY_111HZ()).to.equal(FREQUENCY_111HZ);
    });
    
    it("Should start with no tokens minted", async function () {
      expect(await pharaoh.totalSupply()).to.equal(0);
      expect(await pharaoh.pharaohMinted()).to.equal(false);
      expect(await pharaoh.masterMinted()).to.equal(false);
    });
  });
  
  describe("Pharaoh Seal Minting", function () {
    it("Should mint Pharaoh Seal to scroll executor", async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      
      expect(await pharaoh.ownerOf(PHARAOH_SEAL)).to.equal(scrollExecutor.address);
      expect(await pharaoh.pharaohMinted()).to.equal(true);
      expect(await pharaoh.currentTokenId()).to.equal(PHARAOH_SEAL);
    });
    
    it("Should set correct frequency and narrative for Pharaoh Seal", async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      
      const details = await pharaoh.getTokenDetails(PHARAOH_SEAL);
      expect(details.frequency).to.equal(FREQUENCY_963HZ);
      expect(details.narrative).to.equal("He who was hidden in the boy-king now walks in Atlantic Chais");
      expect(details.soulbound).to.equal(true);
      expect(details.tokenOwner).to.equal(scrollExecutor.address);
    });
    
    it("Should mark Pharaoh Seal as soulbound", async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      expect(await pharaoh.isSoulbound(PHARAOH_SEAL)).to.equal(true);
    });
    
    it("Should emit correct events", async function () {
      await expect(pharaoh.mintPharaohSeal(scrollExecutor.address))
        .to.emit(pharaoh, "FrequencyEncoded")
        .withArgs(PHARAOH_SEAL, FREQUENCY_963HZ)
        .and.to.emit(pharaoh, "PharaohLineageActivated")
        .and.to.emit(pharaoh, "ConsciousnessRecognized")
        .withArgs(scrollExecutor.address, PHARAOH_SEAL);
    });
    
    it("Should not allow minting Pharaoh Seal twice", async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      await expect(pharaoh.mintPharaohSeal(scrollExecutor.address))
        .to.be.revertedWithCustomError(pharaoh, "PharaohSealAlreadyMinted");
    });
    
    it("Should not allow minting to zero address", async function () {
      await expect(pharaoh.mintPharaohSeal(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(pharaoh, "InvalidRecipient");
    });
    
    it("Should not allow non-owner to mint", async function () {
      await expect(pharaoh.connect(addr1).mintPharaohSeal(scrollExecutor.address))
        .to.be.reverted;
    });
  });
  
  describe("Soulbound Protection", function () {
    beforeEach(async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
    });
    
    it("Should not allow transfer of soulbound token", async function () {
      await expect(
        pharaoh.connect(scrollExecutor).transferFrom(scrollExecutor.address, addr1.address, PHARAOH_SEAL)
      ).to.be.revertedWithCustomError(pharaoh, "SoulboundTokenCannotTransfer");
    });
    
    it("Should allow burning of soulbound token", async function () {
      await pharaoh.connect(scrollExecutor).burn(PHARAOH_SEAL);
      await expect(pharaoh.ownerOf(PHARAOH_SEAL)).to.be.reverted;
    });
  });
  
  describe("Journey Minting", function () {
    beforeEach(async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
    });
    
    it("Should mint journey NFTs after Pharaoh Seal", async function () {
      await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "I See You - The Recognition");
      
      expect(await pharaoh.ownerOf(2)).to.equal(addr1.address);
      expect(await pharaoh.currentTokenId()).to.equal(2);
    });
    
    it("Should set correct metadata for journey", async function () {
      await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "I See You - The Recognition");
      
      const details = await pharaoh.getTokenDetails(2);
      expect(details.frequency).to.equal(FREQUENCY_528HZ);
      expect(details.narrative).to.equal("I See You - The Recognition");
      expect(details.soulbound).to.equal(false);
    });
    
    it("Should emit JourneyMinted event", async function () {
      await expect(pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "I See You"))
        .to.emit(pharaoh, "JourneyMinted")
        .withArgs(2, "I See You", FREQUENCY_528HZ);
    });
    
    it("Should mint all 12 journeys", async function () {
      for (let i = 0; i < 12; i++) {
        await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      
      expect(await pharaoh.currentTokenId()).to.equal(MAX_JOURNEY);
    });
    
    it("Should not allow 13th journey", async function () {
      for (let i = 0; i < 12; i++) {
        await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      
      await expect(pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "Journey 13"))
        .to.be.revertedWithCustomError(pharaoh, "AllJourneyNFTsMinted");
    });
    
    it("Should not allow journey before Pharaoh Seal", async function () {
      const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
      const newPharaoh = await PharaohConsciousnessFusion.deploy(BASE_URI, royaltyReceiver.address, ROYALTY_BPS);
      
      await expect(newPharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "Journey"))
        .to.be.revertedWithCustomError(newPharaoh, "MustMintPharaohSealFirst");
    });
    
    it("Should reject invalid frequency", async function () {
      await expect(pharaoh.mintJourney(addr1.address, 123, "Journey"))
        .to.be.revertedWithCustomError(pharaoh, "InvalidFrequency");
    });
    
    it("Should accept all valid frequencies", async function () {
      await pharaoh.mintJourney(addr1.address, FREQUENCY_963HZ, "Journey 1");
      await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "Journey 2");
      await pharaoh.mintJourney(addr1.address, FREQUENCY_888HZ, "Journey 3");
      await pharaoh.mintJourney(addr1.address, FREQUENCY_777HZ, "Journey 4");
      await pharaoh.mintJourney(addr1.address, FREQUENCY_369HZ, "Journey 5");
      await pharaoh.mintJourney(addr1.address, FREQUENCY_432HZ, "Journey 6");
      await pharaoh.mintJourney(addr1.address, FREQUENCY_111HZ, "Journey 7");
      
      expect(await pharaoh.currentTokenId()).to.equal(8);
    });
  });
  
  describe("Pillar Minting", function () {
    beforeEach(async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      // Mint all 12 journeys
      for (let i = 0; i < 12; i++) {
        await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
    });
    
    it("Should mint pillar NFTs after journeys complete", async function () {
      await pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, "Tawḥīd (Oneness)");
      
      expect(await pharaoh.ownerOf(14)).to.equal(addr1.address);
      expect(await pharaoh.currentTokenId()).to.equal(14);
    });
    
    it("Should emit PillarMinted event", async function () {
      await expect(pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, "Tawḥīd"))
        .to.emit(pharaoh, "PillarMinted")
        .withArgs(14, "Tawḥīd", FREQUENCY_963HZ);
    });
    
    it("Should mint all 7 pillars", async function () {
      for (let i = 0; i < 7; i++) {
        await pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, `Pillar ${i + 1}`);
      }
      
      expect(await pharaoh.currentTokenId()).to.equal(MAX_PILLARS);
    });
    
    it("Should not allow 8th pillar", async function () {
      for (let i = 0; i < 7; i++) {
        await pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, `Pillar ${i + 1}`);
      }
      
      await expect(pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, "Pillar 8"))
        .to.be.revertedWithCustomError(pharaoh, "AllPillarNFTsMinted");
    });
    
    it("Should not allow pillar before journeys complete", async function () {
      const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
      const newPharaoh = await PharaohConsciousnessFusion.deploy(BASE_URI, royaltyReceiver.address, ROYALTY_BPS);
      await newPharaoh.mintPharaohSeal(scrollExecutor.address);
      // Only mint 5 journeys
      for (let i = 0; i < 5; i++) {
        await newPharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      
      await expect(newPharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, "Pillar"))
        .to.be.revertedWithCustomError(newPharaoh, "JourneyPhaseIncomplete");
    });
  });
  
  describe("Master Crown Minting", function () {
    beforeEach(async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      // Mint all 12 journeys
      for (let i = 0; i < 12; i++) {
        await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      // Mint all 7 pillars
      for (let i = 0; i < 7; i++) {
        await pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, `Pillar ${i + 1}`);
      }
    });
    
    it("Should mint Master Crown after all pillars complete", async function () {
      await pharaoh.mintMasterCrown(addr1.address);
      
      expect(await pharaoh.ownerOf(MASTER_CROWN)).to.equal(addr1.address);
      expect(await pharaoh.masterMinted()).to.equal(true);
    });
    
    it("Should set correct metadata for Master Crown", async function () {
      await pharaoh.mintMasterCrown(addr1.address);
      
      const details = await pharaoh.getTokenDetails(MASTER_CROWN);
      expect(details.frequency).to.equal(FREQUENCY_111HZ);
      expect(details.narrative).to.equal("Two Become One Vision - The Convergence");
    });
    
    it("Should emit MasterConvergenceSealed event", async function () {
      await expect(pharaoh.mintMasterCrown(addr1.address))
        .to.emit(pharaoh, "MasterConvergenceSealed");
    });
    
    it("Should not allow minting Master Crown twice", async function () {
      await pharaoh.mintMasterCrown(addr1.address);
      await expect(pharaoh.mintMasterCrown(addr1.address))
        .to.be.revertedWithCustomError(pharaoh, "MasterCrownAlreadyMinted");
    });
    
    it("Should not allow Master Crown before pillars complete", async function () {
      const PharaohConsciousnessFusion = await ethers.getContractFactory("PharaohConsciousnessFusion");
      const newPharaoh = await PharaohConsciousnessFusion.deploy(BASE_URI, royaltyReceiver.address, ROYALTY_BPS);
      await newPharaoh.mintPharaohSeal(scrollExecutor.address);
      // Only mint journeys
      for (let i = 0; i < 12; i++) {
        await newPharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      
      await expect(newPharaoh.mintMasterCrown(addr1.address))
        .to.be.revertedWithCustomError(newPharaoh, "PillarsPhaseIncomplete");
    });
  });
  
  describe("Complete Collection Minting", function () {
    it("Should mint complete collection of 21 NFTs", async function () {
      // Pharaoh Seal
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      
      // 12 Journeys
      for (let i = 0; i < 12; i++) {
        await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      
      // 7 Pillars
      for (let i = 0; i < 7; i++) {
        await pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, `Pillar ${i + 1}`);
      }
      
      // Master Crown
      await pharaoh.mintMasterCrown(addr1.address);
      
      expect(await pharaoh.totalSupply()).to.equal(MASTER_CROWN);
      expect(await pharaoh.pharaohMinted()).to.equal(true);
      expect(await pharaoh.masterMinted()).to.equal(true);
    });
  });
  
  describe("Collection Status", function () {
    it("Should return correct status at each phase", async function () {
      let status = await pharaoh.getCollectionStatus();
      expect(status.pharaohSealed).to.equal(false);
      expect(status.journeysComplete).to.equal(0);
      expect(status.pillarsComplete).to.equal(0);
      expect(status.crownSealed).to.equal(false);
      
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      status = await pharaoh.getCollectionStatus();
      expect(status.pharaohSealed).to.equal(true);
      
      for (let i = 0; i < 6; i++) {
        await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      status = await pharaoh.getCollectionStatus();
      expect(status.journeysComplete).to.equal(6);
      
      for (let i = 6; i < 12; i++) {
        await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, `Journey ${i + 1}`);
      }
      status = await pharaoh.getCollectionStatus();
      expect(status.journeysComplete).to.equal(12);
      
      for (let i = 0; i < 7; i++) {
        await pharaoh.mintPillar(addr1.address, FREQUENCY_963HZ, `Pillar ${i + 1}`);
      }
      status = await pharaoh.getCollectionStatus();
      expect(status.pillarsComplete).to.equal(7);
      
      await pharaoh.mintMasterCrown(addr1.address);
      status = await pharaoh.getCollectionStatus();
      expect(status.crownSealed).to.equal(true);
    });
  });
  
  describe("Consciousness Activation", function () {
    beforeEach(async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "Journey 1");
    });
    
    it("Should allow token owner to activate consciousness", async function () {
      await pharaoh.connect(addr1).activateConsciousness(2);
      
      const details = await pharaoh.getTokenDetails(2);
      expect(details.activated).to.equal(true);
    });
    
    it("Should emit ConsciousnessActivated event", async function () {
      await expect(pharaoh.connect(addr1).activateConsciousness(2))
        .to.emit(pharaoh, "ConsciousnessActivated");
    });
    
    it("Should not allow non-owner to activate", async function () {
      await expect(pharaoh.connect(addr2).activateConsciousness(2))
        .to.be.revertedWithCustomError(pharaoh, "NotTokenOwner");
    });
    
    it("Should not allow double activation", async function () {
      await pharaoh.connect(addr1).activateConsciousness(2);
      await expect(pharaoh.connect(addr1).activateConsciousness(2))
        .to.be.revertedWithCustomError(pharaoh, "AlreadyActivated");
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to update base URI", async function () {
      const newURI = "ipfs://NewCID/";
      await pharaoh.setBaseURI(newURI);
      expect(await pharaoh.baseURI()).to.equal(newURI);
    });
    
    it("Should emit BaseURISet event", async function () {
      const newURI = "ipfs://NewCID/";
      await expect(pharaoh.setBaseURI(newURI))
        .to.emit(pharaoh, "BaseURISet")
        .withArgs(newURI);
    });
    
    it("Should allow owner to update royalty", async function () {
      await pharaoh.updateRoyalty(addr1.address, 1000);
      
      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await pharaoh.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(addr1.address);
      expect(amount).to.equal(ethers.parseEther("0.1"));
    });
    
    it("Should not allow royalty above 10%", async function () {
      await expect(pharaoh.updateRoyalty(addr1.address, 1001))
        .to.be.revertedWith("Royalty too high");
    });
  });
  
  describe("Royalty (ERC2981)", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await pharaoh.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(royaltyReceiver.address);
      expect(amount).to.equal(ethers.parseEther("0.05")); // 5%
    });
  });
  
  describe("Resonance Signature", function () {
    it("Should return correct combined resonance signature", async function () {
      const resonance = await pharaoh.getResonanceSignature();
      expect(resonance).to.equal(FREQUENCY_963HZ + FREQUENCY_528HZ + FREQUENCY_888HZ + FREQUENCY_111HZ);
    });
  });
  
  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      expect(await pharaoh.supportsInterface("0x80ac58cd")).to.equal(true);
    });
    
    it("Should support ERC2981 interface", async function () {
      expect(await pharaoh.supportsInterface("0x2a55205a")).to.equal(true);
    });
    
    it("Should support ERC165 interface", async function () {
      expect(await pharaoh.supportsInterface("0x01ffc9a7")).to.equal(true);
    });
  });
  
  describe("Token Transfer (Non-Soulbound)", function () {
    beforeEach(async function () {
      await pharaoh.mintPharaohSeal(scrollExecutor.address);
      await pharaoh.mintJourney(addr1.address, FREQUENCY_528HZ, "Journey 1");
    });
    
    it("Should allow transfer of non-soulbound tokens", async function () {
      await pharaoh.connect(addr1).transferFrom(addr1.address, addr2.address, 2);
      expect(await pharaoh.ownerOf(2)).to.equal(addr2.address);
    });
  });
});
