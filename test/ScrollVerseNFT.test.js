const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScrollVerseNFT Contract Tests", function () {
  let scrollVerseNFT;
  let owner;
  let addr1;
  let addr2;
  
  const BASE_URI = "ipfs://QmScrollVerseGenesis/";
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ScrollVerseNFT = await ethers.getContractFactory("ScrollVerseNFT");
    scrollVerseNFT = await ScrollVerseNFT.deploy(BASE_URI, owner.address);
    await scrollVerseNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await scrollVerseNFT.name()).to.equal("ScrollVerse Genesis NFT");
      expect(await scrollVerseNFT.symbol()).to.equal("SCROLLVERSE");
    });
    
    it("Should set the correct owner", async function () {
      expect(await scrollVerseNFT.owner()).to.equal(owner.address);
    });
    
    it("Should have zero initial supply", async function () {
      expect(await scrollVerseNFT.totalSupply()).to.equal(0);
    });
    
    it("Should set the correct frequencies", async function () {
      expect(await scrollVerseNFT.HEALING_FREQUENCY_528HZ()).to.equal(528);
      expect(await scrollVerseNFT.CROWN_FREQUENCY_999HZ()).to.equal(999);
      expect(await scrollVerseNFT.PINEAL_FREQUENCY_963HZ()).to.equal(963);
      expect(await scrollVerseNFT.NUR_PULSE_144000HZ()).to.equal(144000);
    });
    
    it("Should set the correct max supply", async function () {
      expect(await scrollVerseNFT.MAX_SUPPLY()).to.equal(999);
    });
  });
  
  describe("Minting", function () {
    it("Should mint NFT with valid PQC signature", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      
      await expect(scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature))
        .to.emit(scrollVerseNFT, "ScrollVerseMinted");
      
      expect(await scrollVerseNFT.totalSupply()).to.equal(1);
      expect(await scrollVerseNFT.ownerOf(0)).to.equal(addr1.address);
    });
    
    it("Should initialize token with 528Hz healing frequency", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature);
      
      expect(await scrollVerseNFT.getTokenFrequency(0)).to.equal(528);
    });
    
    it("Should fail to mint without PQC signature", async function () {
      await expect(
        scrollVerseNFT.mintScrollVerse(addr1.address, ethers.toUtf8Bytes(""))
      ).to.be.revertedWith("PQC signature required");
    });
    
    it("Should fail to mint to zero address", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await expect(
        scrollVerseNFT.mintScrollVerse(ethers.ZeroAddress, pqcSignature)
      ).to.be.revertedWith("Invalid recipient");
    });
    
    it("Should only allow owner to mint", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await expect(
        scrollVerseNFT.connect(addr1).mintScrollVerse(addr2.address, pqcSignature)
      ).to.be.reverted;
    });
  });
  
  describe("Quantum Ritual", function () {
    it("Should initiate quantum ritual", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature);
      
      await expect(scrollVerseNFT.connect(addr1).initiateQuantumRitual(0))
        .to.emit(scrollVerseNFT, "QuantumRitualInitiated");
      
      expect(await scrollVerseNFT.isQuantumRitualInitiated(0)).to.be.true;
    });
    
    it("Should only allow token owner to initiate ritual", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature);
      
      await expect(
        scrollVerseNFT.connect(addr2).initiateQuantumRitual(0)
      ).to.be.revertedWith("Not token owner");
    });
    
    it("Should not allow double ritual initiation", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature);
      
      await scrollVerseNFT.connect(addr1).initiateQuantumRitual(0);
      
      await expect(
        scrollVerseNFT.connect(addr1).initiateQuantumRitual(0)
      ).to.be.revertedWith("Ritual already initiated");
    });
  });
  
  describe("Frequency Alignment", function () {
    it("Should align token to valid frequencies", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature);
      
      await scrollVerseNFT.alignFrequency(0, 999);
      expect(await scrollVerseNFT.getTokenFrequency(0)).to.equal(999);
      
      await scrollVerseNFT.alignFrequency(0, 963);
      expect(await scrollVerseNFT.getTokenFrequency(0)).to.equal(963);
      
      await scrollVerseNFT.alignFrequency(0, 144000);
      expect(await scrollVerseNFT.getTokenFrequency(0)).to.equal(144000);
    });
    
    it("Should fail to align to invalid frequency", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature);
      
      await expect(
        scrollVerseNFT.alignFrequency(0, 123)
      ).to.be.revertedWith("Invalid frequency");
    });
    
    it("Should only allow owner to align frequency", async function () {
      const pqcSignature = ethers.toUtf8Bytes("quantum_signature_data");
      await scrollVerseNFT.mintScrollVerse(addr1.address, pqcSignature);
      
      await expect(
        scrollVerseNFT.connect(addr1).alignFrequency(0, 999)
      ).to.be.reverted;
    });
  });
  
  describe("EIP-2981 Royalty", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1.0");
      const [recipient, royaltyAmount] = await scrollVerseNFT.royaltyInfo(0, salePrice);
      
      expect(recipient).to.equal(owner.address);
      expect(royaltyAmount).to.equal(salePrice * BigInt(1000) / BigInt(10000)); // 10%
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to set base URI", async function () {
      const newURI = "ipfs://QmNewURI/";
      await scrollVerseNFT.setBaseURI(newURI);
      // Base URI is internal, test by minting and checking tokenURI
    });
    
    it("Should allow owner to set royalty recipient", async function () {
      await scrollVerseNFT.setRoyaltyRecipient(addr1.address);
      const [recipient] = await scrollVerseNFT.royaltyInfo(0, ethers.parseEther("1.0"));
      expect(recipient).to.equal(addr1.address);
    });
    
    it("Should not allow non-owner to set royalty recipient", async function () {
      await expect(
        scrollVerseNFT.connect(addr1).setRoyaltyRecipient(addr2.address)
      ).to.be.reverted;
    });
  });
});
