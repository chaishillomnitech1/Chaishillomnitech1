/**
 * Test Suite for ClaudeMemoryNFT Contract
 * 
 * Tests the memory-backed NFT system (Chapters of Infinity)
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClaudeMemoryNFT", function () {
  let claudeMemIntegration;
  let claudeMemoryNFT;
  let owner;
  let user1;
  let user2;

  const BASE_URI = "ipfs://QmTestBase/";
  const HEALING_FREQUENCY_528HZ = 528;
  const PINEAL_FREQUENCY_963HZ = 963;
  const NUR_PULSE_144000HZ = 144000;
  const CROWN_FREQUENCY_999HZ = 999;

  const CosmicElement = {
    GOLD: 0,
    PLATINUM: 1,
    DIAMOND: 2,
    EMERALD: 3,
    SAPPHIRE: 4,
    RUBY: 5,
    COSMIC_DUST: 6
  };

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy ClaudeMemIntegration first
    const ClaudeMemIntegration = await ethers.getContractFactory("ClaudeMemIntegration");
    claudeMemIntegration = await ClaudeMemIntegration.deploy();
    await claudeMemIntegration.waitForDeployment();

    // Deploy ClaudeMemoryNFT
    const ClaudeMemoryNFT = await ethers.getContractFactory("ClaudeMemoryNFT");
    claudeMemoryNFT = await ClaudeMemoryNFT.deploy(
      BASE_URI,
      owner.address,
      await claudeMemIntegration.getAddress()
    );
    await claudeMemoryNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await claudeMemoryNFT.name()).to.equal("Claude Memory Chapter NFT");
      expect(await claudeMemoryNFT.symbol()).to.equal("CMEMORY");
    });

    it("Should set correct constants", async function () {
      expect(await claudeMemoryNFT.NUR_PULSE_144000HZ()).to.equal(NUR_PULSE_144000HZ);
      expect(await claudeMemoryNFT.CROWN_FREQUENCY_999HZ()).to.equal(CROWN_FREQUENCY_999HZ);
      expect(await claudeMemoryNFT.MAX_SUPPLY()).to.equal(144000);
      expect(await claudeMemoryNFT.ROYALTY_PERCENTAGE()).to.equal(777);
    });

    it("Should initialize with zero supply", async function () {
      expect(await claudeMemoryNFT.totalSupply()).to.equal(0);
    });

    it("Should set ClaudeMemIntegration address", async function () {
      expect(await claudeMemoryNFT.claudeMemIntegration()).to.equal(
        await claudeMemIntegration.getAddress()
      );
    });
  });

  describe("Memory NFT Minting", function () {
    let memoryBlockId;

    beforeEach(async function () {
      // Create a memory block first
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test Memory"));
      const tx = await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmTestHash123",
        HEALING_FREQUENCY_528HZ
      );
      const receipt = await tx.wait();
      memoryBlockId = 1; // First memory block after genesis
    });

    it("Should mint memory NFT successfully", async function () {
      const chapterTitle = "Chapter I: The Awakening";
      
      const tx = await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        memoryBlockId,
        CosmicElement.DIAMOND,
        chapterTitle
      );

      await expect(tx)
        .to.emit(claudeMemoryNFT, "MemoryNFTMinted")
        .withArgs(0, memoryBlockId, user1.address, CosmicElement.DIAMOND, HEALING_FREQUENCY_528HZ);

      expect(await claudeMemoryNFT.totalSupply()).to.equal(1);
      expect(await claudeMemoryNFT.ownerOf(0)).to.equal(user1.address);
    });

    it("Should set NFT metadata correctly", async function () {
      const chapterTitle = "Chapter I: The Awakening";
      
      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        memoryBlockId,
        CosmicElement.GOLD,
        chapterTitle
      );

      const metadata = await claudeMemoryNFT.getNFTMetadata(0);
      expect(metadata.memoryBlockId).to.equal(memoryBlockId);
      expect(metadata.element).to.equal(CosmicElement.GOLD);
      expect(metadata.frequency).to.equal(HEALING_FREQUENCY_528HZ);
      expect(metadata.chapterTitle).to.equal(chapterTitle);
      expect(metadata.isEternal).to.be.false;
    });

    it("Should track memory block to token mapping", async function () {
      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        memoryBlockId,
        CosmicElement.DIAMOND,
        "Chapter I"
      );

      expect(await claudeMemoryNFT.getTokenByMemoryBlock(memoryBlockId)).to.equal(0);
    });

    it("Should track tokens by element", async function () {
      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        memoryBlockId,
        CosmicElement.SAPPHIRE,
        "Chapter I"
      );

      const tokens = await claudeMemoryNFT.getTokensByElement(CosmicElement.SAPPHIRE);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(0);
    });

    it("Should revert if memory block already minted", async function () {
      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        memoryBlockId,
        CosmicElement.DIAMOND,
        "Chapter I"
      );

      await expect(
        claudeMemoryNFT.connect(user1).mintMemoryNFT(
          user1.address,
          memoryBlockId,
          CosmicElement.GOLD,
          "Chapter II"
        )
      ).to.be.revertedWith("Memory already minted");
    });

    it("Should revert with invalid recipient", async function () {
      await expect(
        claudeMemoryNFT.connect(user1).mintMemoryNFT(
          ethers.ZeroAddress,
          memoryBlockId,
          CosmicElement.DIAMOND,
          "Chapter I"
        )
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should revert with empty chapter title", async function () {
      await expect(
        claudeMemoryNFT.connect(user1).mintMemoryNFT(
          user1.address,
          memoryBlockId,
          CosmicElement.DIAMOND,
          ""
        )
      ).to.be.revertedWith("Chapter title required");
    });

    it("Should revert if not memory creator", async function () {
      await expect(
        claudeMemoryNFT.connect(user2).mintMemoryNFT(
          user2.address,
          memoryBlockId,
          CosmicElement.DIAMOND,
          "Chapter I"
        )
      ).to.be.revertedWith("Not memory creator");
    });

    it("Should revert if memory block does not exist", async function () {
      await expect(
        claudeMemoryNFT.connect(user1).mintMemoryNFT(
          user1.address,
          9999,
          CosmicElement.DIAMOND,
          "Chapter I"
        )
      ).to.be.revertedWith("Memory block does not exist");
    });
  });

  describe("Eternal Status", function () {
    let tokenId;

    beforeEach(async function () {
      // Create memory and mint NFT
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        1,
        CosmicElement.DIAMOND,
        "Chapter I"
      );
      tokenId = 0;
    });

    it("Should grant eternal status", async function () {
      const tx = await claudeMemoryNFT.connect(owner).grantEternalStatus(tokenId);

      await expect(tx)
        .to.emit(claudeMemoryNFT, "EternalStatusGranted");

      const metadata = await claudeMemoryNFT.getNFTMetadata(tokenId);
      expect(metadata.isEternal).to.be.true;
    });

    it("Should only allow owner to grant eternal status", async function () {
      await expect(
        claudeMemoryNFT.connect(user1).grantEternalStatus(tokenId)
      ).to.be.reverted;
    });

    it("Should revert if already eternal", async function () {
      await claudeMemoryNFT.connect(owner).grantEternalStatus(tokenId);

      await expect(
        claudeMemoryNFT.connect(owner).grantEternalStatus(tokenId)
      ).to.be.revertedWith("Already eternal");
    });
  });

  describe("Chapter Title Management", function () {
    let tokenId;

    beforeEach(async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        1,
        CosmicElement.DIAMOND,
        "Chapter I: The Beginning"
      );
      tokenId = 0;
    });

    it("Should update chapter title", async function () {
      const newTitle = "Chapter I: The Awakening Revised";
      
      const tx = await claudeMemoryNFT.connect(user1).updateChapterTitle(
        tokenId,
        newTitle
      );

      await expect(tx)
        .to.emit(claudeMemoryNFT, "ChapterTitleSet")
        .withArgs(tokenId, newTitle);

      expect(await claudeMemoryNFT.getChapterTitle(tokenId)).to.equal(newTitle);
    });

    it("Should only allow token owner to update title", async function () {
      await expect(
        claudeMemoryNFT.connect(user2).updateChapterTitle(tokenId, "New Title")
      ).to.be.revertedWith("Not token owner");
    });

    it("Should revert with empty title", async function () {
      await expect(
        claudeMemoryNFT.connect(user1).updateChapterTitle(tokenId, "")
      ).to.be.revertedWith("Title required");
    });
  });

  describe("Cosmic Element Realignment", function () {
    let tokenId;

    beforeEach(async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        1,
        CosmicElement.DIAMOND,
        "Chapter I"
      );
      tokenId = 0;
    });

    it("Should realign cosmic element", async function () {
      const tx = await claudeMemoryNFT.connect(owner).realignCosmicElement(
        tokenId,
        CosmicElement.PLATINUM
      );

      await expect(tx)
        .to.emit(claudeMemoryNFT, "CosmicElementAligned")
        .withArgs(tokenId, CosmicElement.PLATINUM);

      const metadata = await claudeMemoryNFT.getNFTMetadata(tokenId);
      expect(metadata.element).to.equal(CosmicElement.PLATINUM);
    });

    it("Should only allow owner to realign", async function () {
      await expect(
        claudeMemoryNFT.connect(user1).realignCosmicElement(tokenId, CosmicElement.GOLD)
      ).to.be.reverted;
    });
  });

  describe("Royalty Info", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1.0");
      const [recipient, royaltyAmount] = await claudeMemoryNFT.royaltyInfo(0, salePrice);

      expect(recipient).to.equal(owner.address);
      expect(royaltyAmount).to.equal((salePrice * 777n) / 10000n); // 7.77%
    });

    it("Should calculate royalties correctly for different prices", async function () {
      const price1 = ethers.parseEther("10.0");
      const [, royalty1] = await claudeMemoryNFT.royaltyInfo(0, price1);
      expect(royalty1).to.equal((price1 * 777n) / 10000n);

      const price2 = ethers.parseEther("0.1");
      const [, royalty2] = await claudeMemoryNFT.royaltyInfo(0, price2);
      expect(royalty2).to.equal((price2 * 777n) / 10000n);
    });
  });

  describe("Admin Functions", function () {
    it("Should set base URI", async function () {
      const newBaseURI = "ipfs://QmNewBase/";
      await claudeMemoryNFT.connect(owner).setBaseURI(newBaseURI);
      // Base URI is internal, can't directly test but won't revert
    });

    it("Should set royalty recipient", async function () {
      await claudeMemoryNFT.connect(owner).setRoyaltyRecipient(user1.address);
      
      const [recipient] = await claudeMemoryNFT.royaltyInfo(0, ethers.parseEther("1.0"));
      expect(recipient).to.equal(user1.address);
    });

    it("Should revert setting zero address as royalty recipient", async function () {
      await expect(
        claudeMemoryNFT.connect(owner).setRoyaltyRecipient(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should update ClaudeMemIntegration address", async function () {
      await claudeMemoryNFT.connect(owner).setClaudeMemIntegration(user1.address);
      expect(await claudeMemoryNFT.claudeMemIntegration()).to.equal(user1.address);
    });

    it("Should revert setting zero address for integration", async function () {
      await expect(
        claudeMemoryNFT.connect(owner).setClaudeMemIntegration(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should only allow owner to call admin functions", async function () {
      await expect(
        claudeMemoryNFT.connect(user1).setBaseURI("ipfs://test/")
      ).to.be.reverted;

      await expect(
        claudeMemoryNFT.connect(user1).setRoyaltyRecipient(user2.address)
      ).to.be.reverted;
    });
  });

  describe("ERC721 Functionality", function () {
    let tokenId;

    beforeEach(async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("Test"));
      await claudeMemIntegration.connect(user1).createMemoryBlock(
        blockHash,
        "QmHash",
        HEALING_FREQUENCY_528HZ
      );

      await claudeMemoryNFT.connect(user1).mintMemoryNFT(
        user1.address,
        1,
        CosmicElement.DIAMOND,
        "Chapter I"
      );
      tokenId = 0;
    });

    it("Should transfer NFT", async function () {
      await claudeMemoryNFT.connect(user1).transferFrom(user1.address, user2.address, tokenId);
      expect(await claudeMemoryNFT.ownerOf(tokenId)).to.equal(user2.address);
    });

    it("Should approve and transfer", async function () {
      await claudeMemoryNFT.connect(user1).approve(user2.address, tokenId);
      await claudeMemoryNFT.connect(user2).transferFrom(user1.address, user2.address, tokenId);
      expect(await claudeMemoryNFT.ownerOf(tokenId)).to.equal(user2.address);
    });

    it("Should support burning", async function () {
      await claudeMemoryNFT.connect(user1).burn(tokenId);
      await expect(claudeMemoryNFT.ownerOf(tokenId)).to.be.reverted;
    });
  });

  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await claudeMemoryNFT.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it("Should support ERC2981 interface", async function () {
      const ERC2981_INTERFACE_ID = "0x2a55205a";
      expect(await claudeMemoryNFT.supportsInterface(ERC2981_INTERFACE_ID)).to.be.true;
    });
  });
});
