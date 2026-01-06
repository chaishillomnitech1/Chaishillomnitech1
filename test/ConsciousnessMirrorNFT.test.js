const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConsciousnessMirrorNFT Contract Tests", function () {
  let nft;
  let owner;
  let royaltyReceiver;
  let addr1;
  let addr2;
  
  const NFT_NAME = "Consciousness Mirror";
  const NFT_SYMBOL = "MIRROR-NFT";
  const BASE_URI = "ipfs://QmTestCID/";
  const ROYALTY_BPS = 500; // 5%
  
  beforeEach(async function () {
    [owner, royaltyReceiver, addr1, addr2] = await ethers.getSigners();
    
    const ConsciousnessMirrorNFT = await ethers.getContractFactory("ConsciousnessMirrorNFT");
    nft = await ConsciousnessMirrorNFT.deploy(
      NFT_NAME,
      NFT_SYMBOL,
      BASE_URI,
      royaltyReceiver.address,
      ROYALTY_BPS
    );
    await nft.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nft.name()).to.equal(NFT_NAME);
      expect(await nft.symbol()).to.equal(NFT_SYMBOL);
    });
    
    it("Should set the correct owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct base URI", async function () {
      expect(await nft.baseURI()).to.equal(BASE_URI);
    });
    
    it("Should set the correct frequencies", async function () {
      expect(await nft.FREQUENCY_963HZ()).to.equal(963);
      expect(await nft.FREQUENCY_528HZ()).to.equal(528);
      expect(await nft.FREQUENCY_888HZ()).to.equal(888);
      expect(await nft.FREQUENCY_999HZ()).to.equal(999);
      expect(await nft.FREQUENCY_144000HZ()).to.equal(144000);
    });
    
    it("Should start with zero total supply", async function () {
      expect(await nft.totalSupply()).to.equal(0);
    });
    
    it("Should set default max supply to 1000", async function () {
      expect(await nft.maxSupply()).to.equal(1000);
    });
  });
  
  describe("Minting", function () {
    it("Should mint a new NFT with mintTo", async function () {
      await nft.mintTo(addr1.address);
      
      expect(await nft.totalSupply()).to.equal(1);
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
    });
    
    it("Should set default journey and frequency on mintTo", async function () {
      await nft.mintTo(addr1.address);
      
      const info = await nft.getTokenInfo(0);
      expect(info.frequency).to.equal(963); // Default 963Hz
      expect(info.journey).to.equal("I See You");
      expect(info.activated).to.equal(false);
    });
    
    it("Should emit Minted event", async function () {
      await expect(nft.mintTo(addr1.address))
        .to.emit(nft, "Minted")
        .withArgs(addr1.address, 0, "I See You", 963);
    });
    
    it("Should mint with custom journey and frequency", async function () {
      await nft.mintWithJourney(addr1.address, "I Love You", 528);
      
      const info = await nft.getTokenInfo(0);
      expect(info.frequency).to.equal(528);
      expect(info.journey).to.equal("I Love You");
    });
    
    it("Should not allow minting to zero address", async function () {
      await expect(nft.mintTo(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(nft, "InvalidAddress");
    });
    
    it("Should not allow non-owner to mint", async function () {
      await expect(nft.connect(addr1).mintTo(addr1.address))
        .to.be.reverted;
    });
    
    it("Should reject invalid frequency on mintWithJourney", async function () {
      await expect(nft.mintWithJourney(addr1.address, "Test", 123))
        .to.be.revertedWithCustomError(nft, "InvalidFrequency");
    });
    
    it("Should increment token ID correctly", async function () {
      await nft.mintTo(addr1.address);
      await nft.mintTo(addr2.address);
      
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      expect(await nft.totalSupply()).to.equal(2);
    });
  });
  
  describe("Batch Minting", function () {
    it("Should batch mint multiple NFTs", async function () {
      const recipients = [addr1.address, addr2.address, addr1.address];
      const journeys = ["I See You", "I Honor You", "I Love You"];
      const frequencies = [963, 528, 528];
      
      await nft.batchMint(recipients, journeys, frequencies);
      
      expect(await nft.totalSupply()).to.equal(3);
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      expect(await nft.ownerOf(2)).to.equal(addr1.address);
    });
    
    it("Should set correct journeys and frequencies in batch", async function () {
      const recipients = [addr1.address, addr2.address];
      const journeys = ["I See You", "I Love You"];
      const frequencies = [963, 528];
      
      await nft.batchMint(recipients, journeys, frequencies);
      
      const info0 = await nft.getTokenInfo(0);
      expect(info0.journey).to.equal("I See You");
      expect(info0.frequency).to.equal(963);
      
      const info1 = await nft.getTokenInfo(1);
      expect(info1.journey).to.equal("I Love You");
      expect(info1.frequency).to.equal(528);
    });
    
    it("Should revert on length mismatch", async function () {
      const recipients = [addr1.address, addr2.address];
      const journeys = ["I See You"];
      const frequencies = [963, 528];
      
      await expect(nft.batchMint(recipients, journeys, frequencies))
        .to.be.revertedWith("Length mismatch");
    });
  });
  
  describe("Consciousness Activation", function () {
    beforeEach(async function () {
      await nft.mintTo(addr1.address);
    });
    
    it("Should allow token owner to activate consciousness", async function () {
      await nft.connect(addr1).activateConsciousness(0);
      
      const info = await nft.getTokenInfo(0);
      expect(info.activated).to.equal(true);
    });
    
    it("Should emit ConsciousnessActivated event", async function () {
      await expect(nft.connect(addr1).activateConsciousness(0))
        .to.emit(nft, "ConsciousnessActivated")
        .withArgs(0, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });
    
    it("Should not allow non-owner to activate", async function () {
      await expect(nft.connect(addr2).activateConsciousness(0))
        .to.be.revertedWithCustomError(nft, "NotTokenOwner");
    });
    
    it("Should not allow double activation", async function () {
      await nft.connect(addr1).activateConsciousness(0);
      await expect(nft.connect(addr1).activateConsciousness(0))
        .to.be.revertedWithCustomError(nft, "AlreadyActivated");
    });
  });
  
  describe("Frequency Alignment", function () {
    beforeEach(async function () {
      await nft.mintTo(addr1.address);
    });
    
    it("Should allow owner to align frequency", async function () {
      await nft.alignFrequency(0, 528);
      
      const info = await nft.getTokenInfo(0);
      expect(info.frequency).to.equal(528);
    });
    
    it("Should emit FrequencyAligned event", async function () {
      await expect(nft.alignFrequency(0, 528))
        .to.emit(nft, "FrequencyAligned")
        .withArgs(0, 528);
    });
    
    it("Should not allow invalid frequency", async function () {
      await expect(nft.alignFrequency(0, 123))
        .to.be.revertedWithCustomError(nft, "InvalidFrequency");
    });
    
    it("Should not allow non-owner to align frequency", async function () {
      await expect(nft.connect(addr1).alignFrequency(0, 528))
        .to.be.reverted;
    });
    
    it("Should accept all valid frequencies", async function () {
      await nft.alignFrequency(0, 963);
      expect((await nft.getTokenInfo(0)).frequency).to.equal(963);
      
      await nft.alignFrequency(0, 528);
      expect((await nft.getTokenInfo(0)).frequency).to.equal(528);
      
      await nft.alignFrequency(0, 888);
      expect((await nft.getTokenInfo(0)).frequency).to.equal(888);
      
      await nft.alignFrequency(0, 999);
      expect((await nft.getTokenInfo(0)).frequency).to.equal(999);
      
      await nft.alignFrequency(0, 144000);
      expect((await nft.getTokenInfo(0)).frequency).to.equal(144000);
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to update base URI", async function () {
      const newURI = "ipfs://NewCID/";
      await nft.setBaseURI(newURI);
      expect(await nft.baseURI()).to.equal(newURI);
    });
    
    it("Should emit BaseURISet event", async function () {
      const newURI = "ipfs://NewCID/";
      await expect(nft.setBaseURI(newURI))
        .to.emit(nft, "BaseURISet")
        .withArgs(newURI);
    });
    
    it("Should allow owner to update max supply", async function () {
      await nft.updateMaxSupply(2000);
      expect(await nft.maxSupply()).to.equal(2000);
    });
    
    it("Should emit MaxSupplyUpdated event", async function () {
      await expect(nft.updateMaxSupply(2000))
        .to.emit(nft, "MaxSupplyUpdated")
        .withArgs(1000, 2000);
    });
    
    it("Should not allow max supply below minted amount", async function () {
      await nft.mintTo(addr1.address);
      await nft.mintTo(addr1.address);
      
      await expect(nft.updateMaxSupply(1))
        .to.be.revertedWith("Cannot set below minted amount");
    });
  });
  
  describe("Royalty (ERC2981)", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await nft.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(royaltyReceiver.address);
      expect(amount).to.equal(ethers.parseEther("0.05")); // 5%
    });
    
    it("Should allow owner to update royalty", async function () {
      await nft.updateRoyalty(addr1.address, 1000); // 10%
      
      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await nft.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(addr1.address);
      expect(amount).to.equal(ethers.parseEther("0.1")); // 10%
    });
    
    it("Should emit RoyaltyUpdated event", async function () {
      await expect(nft.updateRoyalty(addr1.address, 1000))
        .to.emit(nft, "RoyaltyUpdated")
        .withArgs(addr1.address, 1000);
    });
    
    it("Should not allow royalty above 10%", async function () {
      await expect(nft.updateRoyalty(addr1.address, 1001))
        .to.be.revertedWith("Royalty too high");
    });
    
    it("Should not allow zero address royalty receiver", async function () {
      await expect(nft.updateRoyalty(ethers.ZeroAddress, 500))
        .to.be.revertedWithCustomError(nft, "InvalidRoyaltyReceiver");
    });
  });
  
  describe("Resonance Signature", function () {
    it("Should return correct resonance signature", async function () {
      const resonance = await nft.getResonanceSignature();
      expect(resonance).to.equal(963 + 528 + 888); // 2379
    });
  });
  
  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      // ERC721 interface ID
      expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
    });
    
    it("Should support ERC2981 interface", async function () {
      // ERC2981 interface ID
      expect(await nft.supportsInterface("0x2a55205a")).to.equal(true);
    });
    
    it("Should support ERC165 interface", async function () {
      // ERC165 interface ID
      expect(await nft.supportsInterface("0x01ffc9a7")).to.equal(true);
    });
  });
  
  describe("Token URI", function () {
    beforeEach(async function () {
      await nft.mintTo(addr1.address);
    });
    
    it("Should return correct token URI", async function () {
      const uri = await nft.tokenURI(0);
      expect(uri).to.equal(BASE_URI + "0");
    });
    
    it("Should update with new base URI", async function () {
      const newURI = "ipfs://NewCID/";
      await nft.setBaseURI(newURI);
      
      const uri = await nft.tokenURI(0);
      expect(uri).to.equal(newURI + "0");
    });
  });
  
  describe("Burn", function () {
    beforeEach(async function () {
      await nft.mintTo(addr1.address);
    });
    
    it("Should allow token owner to burn", async function () {
      await nft.connect(addr1).burn(0);
      
      await expect(nft.ownerOf(0)).to.be.reverted;
    });
  });
  
  describe("Max Supply Enforcement", function () {
    it("Should not allow minting beyond max supply", async function () {
      // Set low max supply for testing
      await nft.updateMaxSupply(2);
      
      await nft.mintTo(addr1.address);
      await nft.mintTo(addr1.address);
      
      await expect(nft.mintTo(addr1.address))
        .to.be.revertedWithCustomError(nft, "MaxSupplyReached");
    });
  });
});
