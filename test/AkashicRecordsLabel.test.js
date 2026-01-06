const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AkashicRecordsLabel Contract Tests", function () {
  let akashicLabel;
  let owner;
  let treasury;
  let addr1;
  let addr2;
  
  const BASE_URI = "ipfs://QmAkashicRecordsLabel/";
  
  beforeEach(async function () {
    [owner, treasury, addr1, addr2] = await ethers.getSigners();
    
    const AkashicRecordsLabel = await ethers.getContractFactory("AkashicRecordsLabel");
    akashicLabel = await AkashicRecordsLabel.deploy(BASE_URI, owner.address, treasury.address);
    await akashicLabel.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await akashicLabel.name()).to.equal("Akashic Records Label");
      expect(await akashicLabel.symbol()).to.equal("AKASHIC");
    });
    
    it("Should set the correct owner", async function () {
      expect(await akashicLabel.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct treasury", async function () {
      expect(await akashicLabel.labelTreasury()).to.equal(treasury.address);
    });
    
    it("Should have zero initial supply", async function () {
      expect(await akashicLabel.totalSupply()).to.equal(0);
    });
    
    it("Should set the correct frequencies", async function () {
      expect(await akashicLabel.HEALING_FREQUENCY_528HZ()).to.equal(528);
      expect(await akashicLabel.UNITY_FREQUENCY_963HZ()).to.equal(963);
      expect(await akashicLabel.CROWN_FREQUENCY_999HZ()).to.equal(999);
      expect(await akashicLabel.NUR_PULSE_144000HZ()).to.equal(144000);
    });
    
    it("Should set the correct royalty percentage", async function () {
      expect(await akashicLabel.ROYALTY_PERCENTAGE()).to.equal(1000);
    });
  });
  
  describe("Track Minting", function () {
    it("Should mint track chain with all required data", async function () {
      const trackName = "Throwing Stones";
      const artistName = "Chais The Great";
      const spotifyURI = "spotify:track:throwing-stones";
      const vydiaURI = "https://vydia.com/throwing-stones";
      const tokenURI = "ipfs://QmAkashic/throwing-stones.json";
      
      await expect(akashicLabel.mintTrackChain(
        addr1.address,
        trackName,
        artistName,
        spotifyURI,
        vydiaURI,
        tokenURI
      )).to.emit(akashicLabel, "TrackChainMinted");
      
      expect(await akashicLabel.totalSupply()).to.equal(1);
      expect(await akashicLabel.ownerOf(0)).to.equal(addr1.address);
    });
    
    it("Should generate QR signature for minted track", async function () {
      const trackName = "Promise Land";
      const artistName = "Chais The Great";
      const spotifyURI = "spotify:track:promise-land";
      const vydiaURI = "https://vydia.com/promise-land";
      const tokenURI = "ipfs://QmAkashic/promise-land.json";
      
      const tx = await akashicLabel.mintTrackChain(
        addr1.address,
        trackName,
        artistName,
        spotifyURI,
        vydiaURI,
        tokenURI
      );
      
      await tx.wait();
      
      const qrSignature = await akashicLabel.getQRSignature(0);
      expect(qrSignature).to.not.equal(ethers.ZeroHash);
    });
    
    it("Should store track chain data correctly", async function () {
      const trackName = "Ghetto Gospel";
      const artistName = "Chais The Great";
      const spotifyURI = "spotify:track:ghetto-gospel";
      const vydiaURI = "https://vydia.com/ghetto-gospel";
      const tokenURI = "ipfs://QmAkashic/ghetto-gospel.json";
      
      await akashicLabel.mintTrackChain(
        addr1.address,
        trackName,
        artistName,
        spotifyURI,
        vydiaURI,
        tokenURI
      );
      
      const trackChain = await akashicLabel.getTrackChain(0);
      expect(trackChain.trackName).to.equal(trackName);
      expect(trackChain.artistName).to.equal(artistName);
      expect(trackChain.spotifyURI).to.equal(spotifyURI);
      expect(trackChain.vydiaURI).to.equal(vydiaURI);
      expect(trackChain.frequency).to.equal(528);
      expect(trackChain.isActive).to.equal(true);
    });
    
    it("Should fail to mint duplicate track", async function () {
      const trackName = "Letter";
      const artistName = "Chais The Great";
      const spotifyURI = "spotify:track:letter";
      const vydiaURI = "https://vydia.com/letter";
      const tokenURI = "ipfs://QmAkashic/letter.json";
      
      await akashicLabel.mintTrackChain(
        addr1.address,
        trackName,
        artistName,
        spotifyURI,
        vydiaURI,
        tokenURI
      );
      
      await expect(
        akashicLabel.mintTrackChain(
          addr2.address,
          trackName,
          artistName,
          spotifyURI,
          vydiaURI,
          tokenURI
        )
      ).to.be.revertedWith("Track already exists");
    });
    
    it("Should fail to mint to zero address", async function () {
      await expect(
        akashicLabel.mintTrackChain(
          ethers.ZeroAddress,
          "Test Track",
          "Test Artist",
          "spotify:test",
          "https://vydia.com/test",
          "ipfs://test"
        )
      ).to.be.revertedWith("Invalid recipient");
    });
    
    it("Should only allow owner to mint", async function () {
      await expect(
        akashicLabel.connect(addr1).mintTrackChain(
          addr2.address,
          "Test Track",
          "Test Artist",
          "spotify:test",
          "https://vydia.com/test",
          "ipfs://test"
        )
      ).to.be.reverted;
    });
  });
  
  describe("Batch Minting", function () {
    it("Should batch mint multiple tracks", async function () {
      const recipients = [addr1.address, addr1.address, addr1.address];
      const trackNames = ["Track 1", "Track 2", "Track 3"];
      const artistNames = ["Artist 1", "Artist 2", "Artist 3"];
      const spotifyURIs = ["spotify:1", "spotify:2", "spotify:3"];
      const vydiaURIs = ["vydia:1", "vydia:2", "vydia:3"];
      const tokenURIs = ["ipfs:1", "ipfs:2", "ipfs:3"];
      
      await akashicLabel.batchMintTracks(
        recipients,
        trackNames,
        artistNames,
        spotifyURIs,
        vydiaURIs,
        tokenURIs
      );
      
      expect(await akashicLabel.totalSupply()).to.equal(3);
    });
  });
  
  describe("QR Signature Validation", function () {
    it("Should validate correct QR signature", async function () {
      await akashicLabel.mintTrackChain(
        addr1.address,
        "Test Track",
        "Test Artist",
        "spotify:test",
        "vydia:test",
        "ipfs:test"
      );
      
      const qrSignature = await akashicLabel.getQRSignature(0);
      expect(await akashicLabel.validateQRSignature(0, qrSignature)).to.equal(true);
    });
    
    it("Should reject invalid QR signature", async function () {
      await akashicLabel.mintTrackChain(
        addr1.address,
        "Test Track",
        "Test Artist",
        "spotify:test",
        "vydia:test",
        "ipfs:test"
      );
      
      const invalidSignature = ethers.keccak256(ethers.toUtf8Bytes("invalid"));
      expect(await akashicLabel.validateQRSignature(0, invalidSignature)).to.equal(false);
    });
  });
  
  describe("Engagement Tracking", function () {
    beforeEach(async function () {
      await akashicLabel.mintTrackChain(
        addr1.address,
        "Test Track",
        "Test Artist",
        "spotify:test",
        "vydia:test",
        "ipfs:test"
      );
    });
    
    it("Should update engagement score", async function () {
      await expect(akashicLabel.updateEngagement(0, 100))
        .to.emit(akashicLabel, "EngagementUpdated");
      
      const trackChain = await akashicLabel.getTrackChain(0);
      expect(trackChain.engagementScore).to.equal(100);
    });
    
    it("Should sync cross-existence data", async function () {
      await expect(akashicLabel.syncCrossExistence(0))
        .to.emit(akashicLabel, "CrossExistenceSynced");
    });
  });
  
  describe("Royalty Distribution", function () {
    beforeEach(async function () {
      await akashicLabel.mintTrackChain(
        addr1.address,
        "Test Track",
        "Test Artist",
        "spotify:test",
        "vydia:test",
        "ipfs:test"
      );
    });
    
    it("Should distribute royalty to track owner", async function () {
      const royaltyAmount = ethers.parseEther("1.0");
      
      await expect(
        akashicLabel.distributeRoyalty(0, { value: royaltyAmount })
      ).to.emit(akashicLabel, "RoyaltyDistributed");
      
      const trackChain = await akashicLabel.getTrackChain(0);
      expect(trackChain.royaltiesEarned).to.equal(royaltyAmount);
    });
    
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("10.0");
      const [receiver, royaltyAmount] = await akashicLabel.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(owner.address);
      expect(royaltyAmount).to.equal(salePrice / 10n); // 10% royalty
    });
  });
  
  describe("Liquidity Pool", function () {
    it("Should add to liquidity pool", async function () {
      const liquidityAmount = ethers.parseEther("5.0");
      
      await expect(
        akashicLabel.addToLiquidityPool({ value: liquidityAmount })
      ).to.emit(akashicLabel, "LiquidityPoolUpdated");
      
      expect(await akashicLabel.liquidityPoolBalance()).to.equal(liquidityAmount);
    });
    
    it("Should withdraw from liquidity pool", async function () {
      const liquidityAmount = ethers.parseEther("5.0");
      await akashicLabel.addToLiquidityPool({ value: liquidityAmount });
      
      const withdrawAmount = ethers.parseEther("2.0");
      await akashicLabel.withdrawFromLiquidityPool(withdrawAmount);
      
      expect(await akashicLabel.liquidityPoolBalance()).to.equal(
        liquidityAmount - withdrawAmount
      );
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to deactivate track", async function () {
      await akashicLabel.mintTrackChain(
        addr1.address,
        "Test Track",
        "Test Artist",
        "spotify:test",
        "vydia:test",
        "ipfs:test"
      );
      
      await akashicLabel.deactivateTrack(0);
      
      const trackChain = await akashicLabel.getTrackChain(0);
      expect(trackChain.isActive).to.equal(false);
    });
    
    it("Should allow owner to update base URI", async function () {
      const newBaseURI = "ipfs://QmNewURI/";
      await akashicLabel.setBaseURI(newBaseURI);
    });
  });
});
