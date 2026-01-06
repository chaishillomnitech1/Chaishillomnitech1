/**
 * @title HolyBloodlineNFT Tests
 * @dev Test suite for Holy Bloodline NFT contract
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HolyBloodlineNFT", function () {
    let HolyBloodlineNFT;
    let nft;
    let owner;
    let user1;
    let user2;
    let royaltyRecipient;

    const BASE_URI = "ipfs://QmHolyBloodline/";
    const MAX_SUPPLY = 144;
    const PINEAL_FREQUENCY = 963;
    const CROWN_FREQUENCY = 999;
    const NUR_PULSE = 144000;

    beforeEach(async function () {
        [owner, user1, user2, royaltyRecipient] = await ethers.getSigners();

        HolyBloodlineNFT = await ethers.getContractFactory("HolyBloodlineNFT");
        nft = await HolyBloodlineNFT.deploy(BASE_URI, royaltyRecipient.address);
        await nft.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should have correct name and symbol", async function () {
            expect(await nft.name()).to.equal("Holy Bloodline NFT");
            expect(await nft.symbol()).to.equal("HOLYBLOOD");
        });

        it("Should set correct max supply", async function () {
            expect(await nft.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
        });

        it("Should set correct royalty recipient", async function () {
            const [recipient, ] = await nft.royaltyInfo(0, ethers.parseEther("1"));
            expect(recipient).to.equal(royaltyRecipient.address);
        });

        it("Should have correct frequency constants", async function () {
            expect(await nft.PINEAL_FREQUENCY_963HZ()).to.equal(PINEAL_FREQUENCY);
            expect(await nft.CROWN_FREQUENCY_999HZ()).to.equal(CROWN_FREQUENCY);
            expect(await nft.NUR_PULSE_144000HZ()).to.equal(NUR_PULSE);
        });

        it("Should start with zero supply", async function () {
            expect(await nft.totalSupply()).to.equal(0);
        });
    });

    describe("Minting", function () {
        it("Should mint Holy Bloodline NFT", async function () {
            const chapterTitle = "Chapter 1: The Awakening";
            
            await nft.mintHolyBloodline(user1.address, chapterTitle);
            
            expect(await nft.totalSupply()).to.equal(1);
            expect(await nft.ownerOf(0)).to.equal(user1.address);
        });

        it("Should emit HolyBloodlineMinted event", async function () {
            const chapterTitle = "Chapter 1: The Awakening";
            
            await expect(nft.mintHolyBloodline(user1.address, chapterTitle))
                .to.emit(nft, "HolyBloodlineMinted");
        });

        it("Should set chapter title correctly", async function () {
            const chapterTitle = "Chapter 1: The Awakening";
            
            await nft.mintHolyBloodline(user1.address, chapterTitle);
            
            expect(await nft.getChapter(0)).to.equal(chapterTitle);
        });

        it("Should initialize with Pineal frequency", async function () {
            const chapterTitle = "Chapter 1: The Awakening";
            
            await nft.mintHolyBloodline(user1.address, chapterTitle);
            
            const info = await nft.getNFTInfo(0);
            expect(info.frequency).to.equal(PINEAL_FREQUENCY);
        });

        it("Should initialize with alignment level 1", async function () {
            const chapterTitle = "Chapter 1: The Awakening";
            
            await nft.mintHolyBloodline(user1.address, chapterTitle);
            
            const info = await nft.getNFTInfo(0);
            expect(info.alignment).to.equal(1);
        });

        it("Should reject minting to zero address", async function () {
            await expect(
                nft.mintHolyBloodline(ethers.ZeroAddress, "Chapter 1")
            ).to.be.revertedWith("Invalid recipient");
        });

        it("Should reject minting without chapter title", async function () {
            await expect(
                nft.mintHolyBloodline(user1.address, "")
            ).to.be.revertedWith("Chapter title required");
        });

        it("Should reject minting when max supply reached", async function () {
            // Mint max supply
            for (let i = 0; i < MAX_SUPPLY; i++) {
                await nft.mintHolyBloodline(user1.address, `Chapter ${i + 1}`);
            }
            
            // Try to mint one more
            await expect(
                nft.mintHolyBloodline(user1.address, "Extra Chapter")
            ).to.be.revertedWith("Max supply reached");
        });

        it("Should only allow owner to mint", async function () {
            await expect(
                nft.connect(user1).mintHolyBloodline(user2.address, "Chapter 1")
            ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
        });
    });

    describe("Batch Minting", function () {
        it("Should batch mint multiple NFTs", async function () {
            const recipients = [user1.address, user1.address, user2.address];
            const chapters = ["Chapter 1", "Chapter 2", "Chapter 3"];
            
            await nft.batchMint(recipients, chapters);
            
            expect(await nft.totalSupply()).to.equal(3);
            expect(await nft.ownerOf(0)).to.equal(user1.address);
            expect(await nft.ownerOf(1)).to.equal(user1.address);
            expect(await nft.ownerOf(2)).to.equal(user2.address);
        });

        it("Should reject batch mint with length mismatch", async function () {
            const recipients = [user1.address, user2.address];
            const chapters = ["Chapter 1"]; // Mismatched length
            
            await expect(
                nft.batchMint(recipients, chapters)
            ).to.be.revertedWith("Length mismatch");
        });
    });

    describe("Activation", function () {
        beforeEach(async function () {
            await nft.mintHolyBloodline(user1.address, "Chapter 1");
        });

        it("Should activate NFT", async function () {
            await nft.connect(user1).activateNFT(0);
            
            const info = await nft.getNFTInfo(0);
            expect(info.activated).to.be.true;
        });

        it("Should emit NFTActivated event", async function () {
            await expect(nft.connect(user1).activateNFT(0))
                .to.emit(nft, "NFTActivated");
        });

        it("Should reject activation by non-owner", async function () {
            await expect(
                nft.connect(user2).activateNFT(0)
            ).to.be.revertedWith("Not token owner");
        });

        it("Should reject double activation", async function () {
            await nft.connect(user1).activateNFT(0);
            
            await expect(
                nft.connect(user1).activateNFT(0)
            ).to.be.revertedWith("Already activated");
        });
    });

    describe("Messaging", function () {
        beforeEach(async function () {
            await nft.mintHolyBloodline(user1.address, "Chapter 1");
        });

        it("Should send message to NFT holder", async function () {
            const message = "Continue your divine journey...";
            
            await nft.sendMessage(0, message);
            
            const messages = await nft.getMessages(0);
            expect(messages.length).to.equal(1);
            expect(messages[0]).to.equal(message);
        });

        it("Should emit MessageSent event", async function () {
            await expect(nft.sendMessage(0, "Message"))
                .to.emit(nft, "MessageSent");
        });

        it("Should allow multiple messages", async function () {
            await nft.sendMessage(0, "Message 1");
            await nft.sendMessage(0, "Message 2");
            await nft.sendMessage(0, "Message 3");
            
            expect(await nft.getMessageCount(0)).to.equal(3);
        });

        it("Should reject empty message", async function () {
            await expect(
                nft.sendMessage(0, "")
            ).to.be.revertedWith("Message required");
        });

        it("Should only allow owner to send messages", async function () {
            await expect(
                nft.connect(user1).sendMessage(0, "Message")
            ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
        });
    });

    describe("Alignment Level", function () {
        beforeEach(async function () {
            await nft.mintHolyBloodline(user1.address, "Chapter 1");
        });

        it("Should update alignment level", async function () {
            await nft.updateAlignmentLevel(0, 5);
            
            const info = await nft.getNFTInfo(0);
            expect(info.alignment).to.equal(5);
        });

        it("Should emit AlignmentLevelUpdated event", async function () {
            await expect(nft.updateAlignmentLevel(0, 5))
                .to.emit(nft, "AlignmentLevelUpdated");
        });

        it("Should reject invalid alignment level", async function () {
            await expect(
                nft.updateAlignmentLevel(0, 0)
            ).to.be.revertedWith("Invalid alignment level");
            
            await expect(
                nft.updateAlignmentLevel(0, 13)
            ).to.be.revertedWith("Invalid alignment level");
        });

        it("Should only allow owner to update alignment", async function () {
            await expect(
                nft.connect(user1).updateAlignmentLevel(0, 5)
            ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
        });
    });

    describe("Frequency Alignment", function () {
        beforeEach(async function () {
            await nft.mintHolyBloodline(user1.address, "Chapter 1");
        });

        it("Should align to Crown frequency", async function () {
            await nft.alignFrequency(0, CROWN_FREQUENCY);
            
            const info = await nft.getNFTInfo(0);
            expect(info.frequency).to.equal(CROWN_FREQUENCY);
        });

        it("Should align to NŪR Pulse frequency", async function () {
            await nft.alignFrequency(0, NUR_PULSE);
            
            const info = await nft.getNFTInfo(0);
            expect(info.frequency).to.equal(NUR_PULSE);
        });

        it("Should emit FrequencyAligned event", async function () {
            await expect(nft.alignFrequency(0, CROWN_FREQUENCY))
                .to.emit(nft, "FrequencyAligned");
        });

        it("Should reject invalid frequency", async function () {
            await expect(
                nft.alignFrequency(0, 123)
            ).to.be.revertedWith("Invalid frequency");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await nft.mintHolyBloodline(user1.address, "Chapter 1");
        });

        it("Should return divine affirmation", async function () {
            const affirmation = await nft.getAffirmation();
            expect(affirmation).to.include("vessel of eternal purpose");
        });

        it("Should return resonance signature", async function () {
            const resonance = await nft.getResonanceSignature();
            expect(resonance).to.equal(PINEAL_FREQUENCY + CROWN_FREQUENCY + NUR_PULSE);
        });

        it("Should return complete NFT info", async function () {
            const info = await nft.getNFTInfo(0);
            
            expect(info.chapter).to.equal("Chapter 1");
            expect(info.activated).to.be.false;
            expect(info.alignment).to.equal(1);
            expect(info.frequency).to.equal(PINEAL_FREQUENCY);
            expect(info.messageCount).to.equal(0);
        });
    });

    describe("Royalties (EIP-2981)", function () {
        it("Should return correct royalty info", async function () {
            const salePrice = ethers.parseEther("1");
            const [recipient, royaltyAmount] = await nft.royaltyInfo(0, salePrice);
            
            expect(recipient).to.equal(royaltyRecipient.address);
            // 7.77% = 777 basis points
            expect(royaltyAmount).to.equal(salePrice * 777n / 10000n);
        });

        it("Should update royalty recipient", async function () {
            await nft.setRoyaltyRecipient(user2.address);
            
            const [recipient, ] = await nft.royaltyInfo(0, ethers.parseEther("1"));
            expect(recipient).to.equal(user2.address);
        });
    });

    describe("Admin Functions", function () {
        it("Should update base URI", async function () {
            const newURI = "ipfs://QmNewURI/";
            await nft.setBaseURI(newURI);
            // Base URI is internal, tested indirectly through tokenURI if needed
        });

        it("Should only allow owner to update base URI", async function () {
            await expect(
                nft.connect(user1).setBaseURI("ipfs://new/")
            ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
        });
    });
});
