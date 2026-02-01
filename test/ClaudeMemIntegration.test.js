/**
 * Test Suite for ClaudeMemIntegration Contract
 * 
 * Tests the eternal AI memory system for ScrollVerse
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClaudeMemIntegration", function () {
  let claudeMemIntegration;
  let owner;
  let user1;
  let user2;

  const HEALING_FREQUENCY_528HZ = 528;
  const PINEAL_FREQUENCY_963HZ = 963;
  const NUR_PULSE_144000HZ = 144000;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ClaudeMemIntegration = await ethers.getContractFactory("ClaudeMemIntegration");
    claudeMemIntegration = await ClaudeMemIntegration.deploy();
    await claudeMemIntegration.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with genesis block", async function () {
      expect(await claudeMemIntegration.getTotalMemoryBlocks()).to.equal(1);
      expect(await claudeMemIntegration.permanentBlockCount()).to.equal(1);
    });

    it("Should set correct frequency constants", async function () {
      expect(await claudeMemIntegration.HEALING_FREQUENCY_528HZ()).to.equal(HEALING_FREQUENCY_528HZ);
      expect(await claudeMemIntegration.PINEAL_FREQUENCY_963HZ()).to.equal(PINEAL_FREQUENCY_963HZ);
      expect(await claudeMemIntegration.NUR_PULSE_144000HZ()).to.equal(NUR_PULSE_144000HZ);
    });

    it("Should create valid genesis block", async function () {
      const genesisBlock = await claudeMemIntegration.getMemoryBlock(0);
      expect(genesisBlock.blockHash).to.not.equal(ethers.ZeroHash);
      expect(genesisBlock.frequency).to.equal(PINEAL_FREQUENCY_963HZ);
      expect(genesisBlock.isPermanent).to.be.true;
      expect(genesisBlock.creator).to.equal(owner.address);
    });
  });

  describe("Memory Block Creation", function () {
    it("Should create memory block with valid parameters", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test Memory"));
      const ipfsHash = "QmTestHash123";
      const frequency = HEALING_FREQUENCY_528HZ;

      const tx = await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        ipfsHash,
        frequency
      );

      await expect(tx)
        .to.emit(claudeMemIntegration, "MemoryBlockCreated")
        .withArgs(1, user1.address, blockHash, frequency, ipfsHash);

      expect(await claudeMemIntegration.getTotalMemoryBlocks()).to.equal(2);
    });

    it("Should revert with invalid block hash", async function () {
      await expect(
        claudeMemIntegration.connect(user1).createMemoryBlock(
          ethers.ZeroHash,
          "QmTestHash",
          HEALING_FREQUENCY_528HZ
        )
      ).to.be.revertedWith("Invalid block hash");
    });

    it("Should revert with empty IPFS hash", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await expect(
        claudeMemIntegration.connect(user1).createMemoryBlock(
          blockHash,
          "",
          HEALING_FREQUENCY_528HZ
        )
      ).to.be.revertedWith("IPFS hash required");
    });

    it("Should revert with invalid frequency", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await expect(
        claudeMemIntegration.connect(user1).createMemoryBlock(
          blockHash,
          "QmTestHash",
          999 // Invalid frequency
        )
      ).to.be.revertedWith("Invalid frequency");
    });

    it("Should allow all valid frequencies", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      
      // 528Hz
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash1",
        HEALING_FREQUENCY_528HZ
      );

      // 963Hz
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash2",
        PINEAL_FREQUENCY_963HZ
      );

      // 144000Hz
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash3",
        NUR_PULSE_144000HZ
      );

      expect(await claudeMemIntegration.getTotalMemoryBlocks()).to.equal(4);
    });
  });

  describe("Session Management", function () {
    it("Should initiate session", async function () {
      const tx = await claudeMemIntegration.connect(user1).initiateSession();
      
      await expect(tx)
        .to.emit(claudeMemIntegration, "SessionInitiated");

      expect(await claudeMemIntegration.getTotalSessions()).to.equal(1);
    });

    it("Should track creator sessions", async function () {
      await claudeMemIntegration.connect(user1).initiateSession();
      await claudeMemIntegration.connect(user1).initiateSession();
      
      const sessions = await claudeMemIntegration.getCreatorSessions(user1.address);
      expect(sessions.length).to.equal(2);
    });

    it("Should link memory to session", async function () {
      // Create memory block
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      // Create session
      await claudeMemIntegration.connect(user1).initiateSession();

      // Link memory to session
      const tx = await claudeMemIntegration.connect(user1).linkMemoryToSession(0, 1);
      
      await expect(tx)
        .to.emit(claudeMemIntegration, "MemoryBlockLinked")
        .withArgs(0, 1);
    });

    it("Should revert linking to inactive session", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await expect(
        claudeMemIntegration.connect(user1).linkMemoryToSession(999, 1)
      ).to.be.revertedWith("Session not active");
    });

    it("Should revert linking if not block creator", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await claudeMemIntegration.connect(user2).initiateSession();

      await expect(
        claudeMemIntegration.connect(user2).linkMemoryToSession(0, 1)
      ).to.be.revertedWith("Not block creator");
    });
  });

  describe("ScrollVerse Synchronization", function () {
    it("Should synchronize memory with ScrollVerse NFT", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      const scrollVerseTokenId = 42;
      const tx = await claudeMemIntegration.connect(owner).synchronizeWithScrollVerse(
        scrollVerseTokenId,
        1
      );

      await expect(tx)
        .to.emit(claudeMemIntegration, "ScrollVerseSynchronized")
        .withArgs(scrollVerseTokenId, 1);

      const memories = await claudeMemIntegration.getScrollVerseMemories(scrollVerseTokenId);
      expect(memories.length).to.equal(1);
      expect(memories[0]).to.equal(1);
    });

    it("Should only allow owner to synchronize", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await expect(
        claudeMemIntegration.connect(user1).synchronizeWithScrollVerse(42, 1)
      ).to.be.reverted;
    });
  });

  describe("Eternal Seal", function () {
    it("Should apply eternal seal to memory block", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      const initialCount = await claudeMemIntegration.permanentBlockCount();
      
      const tx = await claudeMemIntegration.connect(user1).applyEternalSeal(1);
      
      await expect(tx)
        .to.emit(claudeMemIntegration, "EternalSealApplied")
        .withArgs(1);

      const block = await claudeMemIntegration.getMemoryBlock(1);
      expect(block.isPermanent).to.be.true;
      expect(await claudeMemIntegration.permanentBlockCount()).to.equal(initialCount + 1n);
    });

    it("Should revert if not block creator", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await expect(
        claudeMemIntegration.connect(user2).applyEternalSeal(1)
      ).to.be.revertedWith("Not block creator");
    });

    it("Should revert if already permanent", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await claudeMemIntegration.connect(user1).applyEternalSeal(1);

      await expect(
        claudeMemIntegration.connect(user1).applyEternalSeal(1)
      ).to.be.revertedWith("Already permanent");
    });
  });

  describe("Memory Compression", function () {
    it("Should compress memory block", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      const compressionKey = ethers.keccak256(ethers.toUtf8Bytes("CompressionKey"));
      const tx = await claudeMemIntegration.connect(user1).compressMemory(1, compressionKey);

      await expect(tx)
        .to.emit(claudeMemIntegration, "MemoryCompressed")
        .withArgs(1, compressionKey);
    });

    it("Should revert if not block creator", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      const compressionKey = ethers.keccak256(ethers.toUtf8Bytes("CompressionKey"));
      await expect(
        claudeMemIntegration.connect(user2).compressMemory(1, compressionKey)
      ).to.be.revertedWith("Not block creator");
    });

    it("Should revert with invalid compression key", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await expect(
        claudeMemIntegration.connect(user1).compressMemory(1, ethers.ZeroHash)
      ).to.be.revertedWith("Invalid compression key");
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause", async function () {
      await claudeMemIntegration.connect(owner).pause();
      expect(await claudeMemIntegration.paused()).to.be.true;

      await claudeMemIntegration.connect(owner).unpause();
      expect(await claudeMemIntegration.paused()).to.be.false;
    });

    it("Should prevent operations when paused", async function () {
      await claudeMemIntegration.connect(owner).pause();

      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await expect(
        claudeMemIntegration.connect(user1).createMemoryBlock(
          blockHash,
          "QmHash",
          HEALING_FREQUENCY_528HZ
        )
      ).to.be.reverted;
    });

    it("Should only allow owner to pause", async function () {
      await expect(
        claudeMemIntegration.connect(user1).pause()
      ).to.be.reverted;
    });
  });
});
