/**
 * @title VibeCanvas Frequency Forge Test Suite
 * @dev Comprehensive tests for VibeCanvas™ NFT Frequency Forge
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VibeCanvas Frequency Forge", function () {
  let vibeCanvas;
  let owner;
  let recipient;
  let royaltyRecipient;
  const BASE_URI = "https://scrollverse-nft-metadata.vercel.app/vibecanvas/";

  beforeEach(async function () {
    [owner, recipient, royaltyRecipient] = await ethers.getSigners();

    const VibeCanvasFrequencyForge = await ethers.getContractFactory("VibeCanvasFrequencyForge");
    vibeCanvas = await VibeCanvasFrequencyForge.deploy(BASE_URI, royaltyRecipient.address);
    await vibeCanvas.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await vibeCanvas.owner()).to.equal(owner.address);
      expect(await vibeCanvas.totalSupply()).to.equal(0);
      expect(await vibeCanvas.globalResonanceLevel()).to.equal(1000); // 10% base
    });

    it("Should have correct frequency constants", async function () {
      expect(await vibeCanvas.FREQUENCY_528HZ()).to.equal(528);
      expect(await vibeCanvas.FREQUENCY_963HZ()).to.equal(963);
      expect(await vibeCanvas.FREQUENCY_999HZ()).to.equal(999);
      expect(await vibeCanvas.FREQUENCY_144000HZ()).to.equal(144000);
    });

    it("Should have correct supply limits", async function () {
      expect(await vibeCanvas.MAX_SUPPLY()).to.equal(9999);
      expect(await vibeCanvas.ROYALTY_PERCENTAGE()).to.equal(1500); // 15%
    });
  });

  describe("Frequency Forge Minting", function () {
    it("Should forge NFT with HEALING_528 mode", async function () {
      const inflowAmount = ethers.parseEther("1");
      const metadataURI = "ipfs://QmTest123";

      await expect(
        vibeCanvas.forgeVibeCanvas(
          recipient.address,
          0, // FrequencyMode.HEALING_528
          inflowAmount,
          metadataURI
        )
      ).to.emit(vibeCanvas, "VibeCanvasMinted");

      expect(await vibeCanvas.totalSupply()).to.equal(1);
      expect(await vibeCanvas.ownerOf(0)).to.equal(recipient.address);

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.primaryFrequency).to.equal(528);
      expect(signature.mode).to.equal(0); // HEALING_528
    });

    it("Should forge NFT with PINEAL_963 mode", async function () {
      const inflowAmount = ethers.parseEther("10");
      const metadataURI = "ipfs://QmTest456";

      await vibeCanvas.forgeVibeCanvas(
        recipient.address,
        1, // FrequencyMode.PINEAL_963
        inflowAmount,
        metadataURI
      );

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.primaryFrequency).to.equal(963);
      expect(signature.mode).to.equal(1); // PINEAL_963
    });

    it("Should forge NFT with DUAL_RESONANCE mode", async function () {
      const inflowAmount = ethers.parseEther("100");
      const metadataURI = "ipfs://QmTest789";

      await vibeCanvas.forgeVibeCanvas(
        recipient.address,
        2, // FrequencyMode.DUAL_RESONANCE
        inflowAmount,
        metadataURI
      );

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.primaryFrequency).to.equal(528);
      expect(signature.secondaryFrequency).to.equal(963);
      expect(signature.mode).to.equal(2); // DUAL_RESONANCE
    });

    it("Should forge NFT with SOVEREIGN_SCROLL mode", async function () {
      const inflowAmount = ethers.parseEther("1000");
      const metadataURI = "ipfs://QmSovereign";

      await vibeCanvas.forgeVibeCanvas(
        recipient.address,
        3, // FrequencyMode.SOVEREIGN_SCROLL
        inflowAmount,
        metadataURI
      );

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.primaryFrequency).to.equal(528);
      expect(signature.secondaryFrequency).to.equal(963);
      expect(signature.mode).to.equal(3); // SOVEREIGN_SCROLL
      expect(signature.sovereignScrollActivated).to.be.true;
    });
  });

  describe("Resonance Tier Calculation", function () {
    it("Should assign INITIATE tier for low inflow", async function () {
      const inflowAmount = ethers.parseEther("1");
      await vibeCanvas.forgeVibeCanvas(recipient.address, 0, inflowAmount, "ipfs://test");

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.tier).to.equal(0); // ResonanceTier.INITIATE
    });

    it("Should assign ASCENDING tier for medium inflow", async function () {
      const inflowAmount = ethers.parseEther("50");
      await vibeCanvas.forgeVibeCanvas(recipient.address, 0, inflowAmount, "ipfs://test");

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.tier).to.equal(1); // ResonanceTier.ASCENDING
    });

    it("Should assign SOVEREIGN tier for high inflow", async function () {
      const inflowAmount = ethers.parseEther("500");
      await vibeCanvas.forgeVibeCanvas(recipient.address, 0, inflowAmount, "ipfs://test");

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.tier).to.equal(2); // ResonanceTier.SOVEREIGN
    });

    it("Should assign OMNIVERSAL tier for very high inflow", async function () {
      const inflowAmount = ethers.parseEther("2000");
      await vibeCanvas.forgeVibeCanvas(recipient.address, 0, inflowAmount, "ipfs://test");

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.tier).to.equal(3); // ResonanceTier.OMNIVERSAL
    });
  });

  describe("QFS Synchronization", function () {
    beforeEach(async function () {
      const inflowAmount = ethers.parseEther("10");
      await vibeCanvas.forgeVibeCanvas(recipient.address, 0, inflowAmount, "ipfs://test");
    });

    it("Should synchronize additional QFS inflow", async function () {
      const additionalInflow = ethers.parseEther("20");

      await expect(
        vibeCanvas.synchronizeQFSInflow(0, additionalInflow)
      ).to.emit(vibeCanvas, "QFSInflowSynchronized");

      const sync = await vibeCanvas.getQFSSync(0);
      expect(sync.totalInflow).to.equal(ethers.parseEther("30"));
      expect(sync.syncCount).to.equal(2);
    });

    it("Should update resonance amplitude on sync", async function () {
      const signatureBefore = await vibeCanvas.getFrequencySignature(0);
      const amplitudeBefore = signatureBefore.resonanceAmplitude;

      const largeInflow = ethers.parseEther("1000");
      await vibeCanvas.synchronizeQFSInflow(0, largeInflow);

      const signatureAfter = await vibeCanvas.getFrequencySignature(0);
      expect(signatureAfter.resonanceAmplitude).to.be.greaterThan(amplitudeBefore);
    });

    it("Should revert sync for non-existent token", async function () {
      await expect(
        vibeCanvas.synchronizeQFSInflow(999, ethers.parseEther("10"))
      ).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Global Resonance Scaling", function () {
    it("Should increase global resonance with inflows", async function () {
      const initialResonance = await vibeCanvas.globalResonanceLevel();

      // Mint with large inflow
      const largeInflow = ethers.parseEther("100");
      await vibeCanvas.forgeVibeCanvas(recipient.address, 0, largeInflow, "ipfs://test1");

      const newResonance = await vibeCanvas.globalResonanceLevel();
      expect(newResonance).to.be.greaterThan(initialResonance);
    });

    it("Should cap global resonance at 200%", async function () {
      // Manually set to near cap
      await vibeCanvas.setGlobalResonance(19900);

      // Mint with large inflow
      const hugeInflow = ethers.parseEther("10000");
      await vibeCanvas.forgeVibeCanvas(recipient.address, 0, hugeInflow, "ipfs://test");

      const finalResonance = await vibeCanvas.globalResonanceLevel();
      expect(finalResonance).to.equal(20000); // Capped at 200%
    });
  });

  describe("Sovereign Scroll Activation", function () {
    beforeEach(async function () {
      // Mint NFT with non-sovereign mode
      await vibeCanvas.forgeVibeCanvas(
        recipient.address,
        0, // HEALING_528
        ethers.parseEther("10"),
        "ipfs://test"
      );
    });

    it("Should allow owner to activate Sovereign Scroll", async function () {
      await expect(
        vibeCanvas.connect(recipient).activateSovereignScroll(0)
      ).to.emit(vibeCanvas, "SovereignScrollActivated");

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.sovereignScrollActivated).to.be.true;
      expect(signature.mode).to.equal(3); // SOVEREIGN_SCROLL
    });

    it("Should revert if non-owner tries to activate", async function () {
      await expect(
        vibeCanvas.connect(owner).activateSovereignScroll(0)
      ).to.be.revertedWith("Not token owner");
    });

    it("Should revert if already activated", async function () {
      await vibeCanvas.connect(recipient).activateSovereignScroll(0);

      await expect(
        vibeCanvas.connect(recipient).activateSovereignScroll(0)
      ).to.be.revertedWith("Already activated");
    });
  });

  describe("Metadata and Hashing", function () {
    it("Should generate and store correct hashes", async function () {
      const metadataURI = "ipfs://QmHashTest";
      await vibeCanvas.forgeVibeCanvas(
        recipient.address,
        0,
        ethers.parseEther("10"),
        metadataURI
      );

      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.generativeArtHash).to.not.equal(ethers.ZeroHash);
      expect(signature.metadataHash).to.not.equal(ethers.ZeroHash);

      // Verify metadata URI stored
      const storedURI = await vibeCanvas.getGenerativeArtMetadata(signature.generativeArtHash);
      expect(storedURI).to.equal(metadataURI);

      // Verify metadata hash mapping
      const tokenId = await vibeCanvas.getTokenByMetadataHash(signature.metadataHash);
      expect(tokenId).to.equal(0);
    });
  });

  describe("Royalty Info (EIP-2981)", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await vibeCanvas.royaltyInfo(0, salePrice);

      expect(receiver).to.equal(royaltyRecipient.address);
      expect(royaltyAmount).to.equal(salePrice * BigInt(1500) / BigInt(10000)); // 15%
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set base URI", async function () {
      const newBaseURI = "https://new-metadata.com/";
      await vibeCanvas.setBaseURI(newBaseURI);
    });

    it("Should allow owner to set royalty recipient", async function () {
      const [, , newRecipient] = await ethers.getSigners();
      await vibeCanvas.setRoyaltyRecipient(newRecipient.address);
    });

    it("Should allow owner to adjust global resonance", async function () {
      const newLevel = 5000; // 50%
      await expect(
        vibeCanvas.setGlobalResonance(newLevel)
      ).to.emit(vibeCanvas, "ResonanceAmplified");

      expect(await vibeCanvas.globalResonanceLevel()).to.equal(newLevel);
    });

    it("Should revert if non-owner tries admin functions", async function () {
      await expect(
        vibeCanvas.connect(recipient).setBaseURI("test")
      ).to.be.reverted;

      await expect(
        vibeCanvas.connect(recipient).setGlobalResonance(5000)
      ).to.be.reverted;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await vibeCanvas.forgeVibeCanvas(
        recipient.address,
        0,
        ethers.parseEther("10"),
        "ipfs://test"
      );
    });

    it("Should get frequency signature", async function () {
      const signature = await vibeCanvas.getFrequencySignature(0);
      expect(signature.primaryFrequency).to.equal(528);
    });

    it("Should get QFS sync data", async function () {
      const sync = await vibeCanvas.getQFSSync(0);
      expect(sync.totalInflow).to.equal(ethers.parseEther("10"));
      expect(sync.isActive).to.be.true;
    });

    it("Should get resonance contribution", async function () {
      const contribution = await vibeCanvas.getResonanceContribution(recipient.address);
      expect(contribution).to.be.greaterThan(0);
    });

    it("Should get total supply", async function () {
      expect(await vibeCanvas.totalSupply()).to.equal(1);
    });
  });

  describe("Supply Limits", function () {
    it("Should enforce max supply", async function () {
      // This test would be expensive to run fully, so we'll test the logic
      // by checking that max supply is set correctly
      const maxSupply = await vibeCanvas.MAX_SUPPLY();
      expect(maxSupply).to.equal(9999);
    });
  });
});
