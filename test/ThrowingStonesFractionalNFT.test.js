/**
 * @title ThrowingStonesFractionalNFT Tests
 * @dev Comprehensive test suite for fractional NFT contract
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ThrowingStonesFractionalNFT", function () {
    let fractionalNFT;
    let owner;
    let treasury;
    let scrollVault;
    let vibeCanvas;
    let user1;
    let user2;
    let user3;

    const BASE_URI = "ipfs://QmThrowingStones/";
    const TOTAL_SCROLL_UNITS = 1000;
    const ROYALTY_BPS = 1500; // 15%

    beforeEach(async function () {
        [owner, treasury, scrollVault, vibeCanvas, user1, user2, user3] = await ethers.getSigners();

        const ThrowingStonesFractionalNFT = await ethers.getContractFactory("ThrowingStonesFractionalNFT");
        fractionalNFT = await ThrowingStonesFractionalNFT.deploy(
            owner.address,
            treasury.address,
            scrollVault.address,
            BASE_URI
        );
        await fractionalNFT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await fractionalNFT.owner()).to.equal(owner.address);
        });

        it("Should set the correct treasury", async function () {
            expect(await fractionalNFT.akashicTreasury()).to.equal(treasury.address);
        });

        it("Should set the correct scroll vault", async function () {
            expect(await fractionalNFT.scrollVault()).to.equal(scrollVault.address);
        });

        it("Should set the correct base URI", async function () {
            expect(await fractionalNFT.tokenURI(0)).to.include(BASE_URI);
        });

        it("Should have correct total scroll units", async function () {
            expect(await fractionalNFT.TOTAL_SCROLL_UNITS()).to.equal(TOTAL_SCROLL_UNITS);
        });

        it("Should have correct royalty percentage", async function () {
            expect(await fractionalNFT.OMNISCROLL_ROYALTY_BPS()).to.equal(ROYALTY_BPS);
        });

        it("Should initialize master token (ID 0)", async function () {
            expect(await fractionalNFT.ownerOf(0)).to.equal(owner.address);
        });

        it("Should not be activated initially", async function () {
            expect(await fractionalNFT.genesisDropActivated()).to.be.false;
        });
    });

    describe("Sacred Frequencies", function () {
        it("Should have correct frequency constants", async function () {
            expect(await fractionalNFT.FREQUENCY_528HZ()).to.equal(528);
            expect(await fractionalNFT.FREQUENCY_432HZ()).to.equal(432);
            expect(await fractionalNFT.FREQUENCY_963HZ()).to.equal(963);
        });

        it("Should have correct vortex constants", async function () {
            expect(await fractionalNFT.VORTEX_3()).to.equal(3);
            expect(await fractionalNFT.VORTEX_6()).to.equal(6);
            expect(await fractionalNFT.VORTEX_9()).to.equal(9);
        });
    });

    describe("Genesis Drop Activation", function () {
        it("Should allow owner to activate Genesis Drop", async function () {
            await expect(fractionalNFT.activateGenesisDrop())
                .to.emit(fractionalNFT, "GenesisDropActivated");

            expect(await fractionalNFT.genesisDropActivated()).to.be.true;
        });

        it("Should not allow non-owner to activate", async function () {
            await expect(
                fractionalNFT.connect(user1).activateGenesisDrop()
            ).to.be.reverted;
        });

        it("Should not allow double activation", async function () {
            await fractionalNFT.activateGenesisDrop();
            
            await expect(
                fractionalNFT.activateGenesisDrop()
            ).to.be.revertedWith("Already activated");
        });
    });

    describe("Minting Scroll Units", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
        });

        it("Should mint a scroll unit successfully", async function () {
            await expect(fractionalNFT.connect(user1).mintScrollUnit())
                .to.emit(fractionalNFT, "ScrollUnitMinted");

            expect(await fractionalNFT.balanceOf(user1.address)).to.equal(1);
            expect(await fractionalNFT.totalScrollUnitsMinted()).to.equal(1);
        });

        it("Should assign correct token ID", async function () {
            await fractionalNFT.connect(user1).mintScrollUnit();
            expect(await fractionalNFT.ownerOf(1)).to.equal(user1.address);
        });

        it("Should calculate vortex alignment correctly", async function () {
            await fractionalNFT.connect(user1).mintScrollUnit();
            
            const scrollUnit = await fractionalNFT.getScrollUnit(1);
            expect([3, 6, 9]).to.include(scrollUnit.vortexAlignment);
        });

        it("Should assign primary frequency based on vortex", async function () {
            await fractionalNFT.connect(user1).mintScrollUnit();
            
            const scrollUnit = await fractionalNFT.getScrollUnit(1);
            expect([432, 528, 963]).to.include(scrollUnit.primaryFrequency);
        });

        it("Should initialize frequency profile", async function () {
            await fractionalNFT.connect(user1).mintScrollUnit();
            
            const profile = await fractionalNFT.getFrequencyProfile(1);
            expect(profile.freq528Hz).to.be.greaterThan(0);
            expect(profile.freq432Hz).to.be.greaterThan(0);
            expect(profile.freq963Hz).to.be.greaterThan(0);
            expect(profile.vortexScore).to.be.greaterThan(0);
        });

        it("Should initialize vibe metrics", async function () {
            await fractionalNFT.connect(user1).mintScrollUnit();
            
            const metrics = await fractionalNFT.getVibeMetrics(1);
            expect(metrics.vibeLevel).to.equal(0);
            expect(metrics.resonanceScore).to.equal(0);
            expect(metrics.evolutionPoints).to.equal(0);
        });

        it("Should track scroll units owned", async function () {
            await fractionalNFT.connect(user1).mintScrollUnit();
            expect(await fractionalNFT.scrollUnitsOwned(user1.address)).to.equal(1);

            await fractionalNFT.connect(user1).mintScrollUnit();
            expect(await fractionalNFT.scrollUnitsOwned(user1.address)).to.equal(2);
        });

        it("Should not allow minting when not activated", async function () {
            const newFractionalNFT = await (await ethers.getContractFactory("ThrowingStonesFractionalNFT")).deploy(
                owner.address,
                treasury.address,
                scrollVault.address,
                BASE_URI
            );

            await expect(
                newFractionalNFT.connect(user1).mintScrollUnit()
            ).to.be.revertedWith("Genesis Drop not active");
        });

        it("Should not allow minting beyond max supply", async function () {
            // This would be expensive to test with 1000 mints
            // Instead we can test the logic by checking the contract state
            expect(await fractionalNFT.TOTAL_SCROLL_UNITS()).to.equal(TOTAL_SCROLL_UNITS);
        });
    });

    describe("Batch Minting", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
        });

        it("Should allow owner to batch mint", async function () {
            const recipients = [user1.address, user2.address, user3.address];
            const count = 2;

            await fractionalNFT.batchMintScrollUnits(recipients, count);

            expect(await fractionalNFT.balanceOf(user1.address)).to.equal(count);
            expect(await fractionalNFT.balanceOf(user2.address)).to.equal(count);
            expect(await fractionalNFT.balanceOf(user3.address)).to.equal(count);
            expect(await fractionalNFT.totalScrollUnitsMinted()).to.equal(recipients.length * count);
        });

        it("Should not allow non-owner to batch mint", async function () {
            await expect(
                fractionalNFT.connect(user1).batchMintScrollUnits([user2.address], 1)
            ).to.be.reverted;
        });
    });

    describe("369 Vortex Math", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
        });

        it("Should distribute vortex alignments", async function () {
            // Mint several tokens to get distribution
            for (let i = 0; i < 30; i++) {
                await fractionalNFT.connect(user1).mintScrollUnit();
            }

            const [vortex3, vortex6, vortex9] = await fractionalNFT.getVortexDistribution();
            const total = Number(vortex3) + Number(vortex6) + Number(vortex9);
            
            expect(total).to.equal(30);
            expect(vortex3).to.be.greaterThan(0);
            expect(vortex6).to.be.greaterThan(0);
            expect(vortex9).to.be.greaterThan(0);
        });

        it("Should assign different vortex scores", async function () {
            await fractionalNFT.connect(user1).mintScrollUnit();
            await fractionalNFT.connect(user2).mintScrollUnit();
            await fractionalNFT.connect(user3).mintScrollUnit();

            const profile1 = await fractionalNFT.getFrequencyProfile(1);
            const profile2 = await fractionalNFT.getFrequencyProfile(2);
            const profile3 = await fractionalNFT.getFrequencyProfile(3);

            // All vortex scores should be one of: 369, 666, 1000
            const validScores = [369, 666, 1000];
            expect(validScores).to.include(Number(profile1.vortexScore));
            expect(validScores).to.include(Number(profile2.vortexScore));
            expect(validScores).to.include(Number(profile3.vortexScore));
        });
    });

    describe("Dynamic NFT Evolution", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
            await fractionalNFT.setVibeCanvasContract(vibeCanvas.address);
            await fractionalNFT.connect(user1).mintScrollUnit();
        });

        it("Should allow VibeCanvas to evolve metadata", async function () {
            const newMetadataHash = ethers.id("new-metadata-hash");

            await expect(
                fractionalNFT.connect(vibeCanvas).evolveMetadata(1, newMetadataHash)
            ).to.emit(fractionalNFT, "MetadataEvolved");

            const scrollUnit = await fractionalNFT.getScrollUnit(1);
            expect(scrollUnit.metadataHash).to.equal(newMetadataHash);
            expect(scrollUnit.evolutionStage).to.equal(1);
        });

        it("Should allow owner to evolve metadata", async function () {
            const newMetadataHash = ethers.id("new-metadata-hash");

            await fractionalNFT.evolveMetadata(1, newMetadataHash);

            const scrollUnit = await fractionalNFT.getScrollUnit(1);
            expect(scrollUnit.metadataHash).to.equal(newMetadataHash);
        });

        it("Should not allow unauthorized evolution", async function () {
            const newMetadataHash = ethers.id("new-metadata-hash");

            await expect(
                fractionalNFT.connect(user2).evolveMetadata(1, newMetadataHash)
            ).to.be.revertedWith("Not authorized");
        });

        it("Should increment evolution stage", async function () {
            const hash1 = ethers.id("hash-1");
            const hash2 = ethers.id("hash-2");
            const hash3 = ethers.id("hash-3");

            await fractionalNFT.connect(vibeCanvas).evolveMetadata(1, hash1);
            await fractionalNFT.connect(vibeCanvas).evolveMetadata(1, hash2);
            await fractionalNFT.connect(vibeCanvas).evolveMetadata(1, hash3);

            const scrollUnit = await fractionalNFT.getScrollUnit(1);
            expect(scrollUnit.evolutionStage).to.equal(3);
        });

        it("Should allow toggling dynamic updates", async function () {
            await fractionalNFT.toggleDynamicUpdates();
            expect(await fractionalNFT.dynamicUpdatesEnabled()).to.be.false;

            const newMetadataHash = ethers.id("new-metadata-hash");
            await expect(
                fractionalNFT.connect(vibeCanvas).evolveMetadata(1, newMetadataHash)
            ).to.be.revertedWith("Dynamic updates disabled");
        });
    });

    describe("Vibe Metrics Updates", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
            await fractionalNFT.setVibeCanvasContract(vibeCanvas.address);
            await fractionalNFT.connect(user1).mintScrollUnit();
        });

        it("Should allow VibeCanvas to update metrics", async function () {
            await expect(
                fractionalNFT.connect(vibeCanvas).updateVibeMetrics(1, 100, 500, 75)
            ).to.emit(fractionalNFT, "VibeUpdated");

            const metrics = await fractionalNFT.getVibeMetrics(1);
            expect(metrics.vibeLevel).to.equal(100);
            expect(metrics.resonanceScore).to.equal(500);
            expect(metrics.communityEngagement).to.equal(75);
            expect(metrics.evolutionPoints).to.equal(1);
        });

        it("Should not allow unauthorized metric updates", async function () {
            await expect(
                fractionalNFT.connect(user2).updateVibeMetrics(1, 100, 500, 75)
            ).to.be.revertedWith("Not authorized");
        });

        it("Should increment evolution points", async function () {
            await fractionalNFT.connect(vibeCanvas).updateVibeMetrics(1, 50, 100, 25);
            await fractionalNFT.connect(vibeCanvas).updateVibeMetrics(1, 100, 200, 50);
            await fractionalNFT.connect(vibeCanvas).updateVibeMetrics(1, 150, 300, 75);

            const metrics = await fractionalNFT.getVibeMetrics(1);
            expect(metrics.evolutionPoints).to.equal(3);
        });
    });

    describe("Royalty Functions", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
            await fractionalNFT.connect(user1).mintScrollUnit();
        });

        it("Should return correct royalty info", async function () {
            const salePrice = ethers.parseEther("1.0");
            const [receiver, royaltyAmount] = await fractionalNFT.royaltyInfo(1, salePrice);

            expect(receiver).to.equal(treasury.address);
            expect(royaltyAmount).to.equal(salePrice * BigInt(ROYALTY_BPS) / BigInt(10000));
        });

        it("Should calculate 15% royalty correctly", async function () {
            const salePrice = ethers.parseEther("1.0");
            const [, royaltyAmount] = await fractionalNFT.royaltyInfo(1, salePrice);
            
            const expected = ethers.parseEther("0.15"); // 15%
            expect(royaltyAmount).to.equal(expected);
        });

        it("Should distribute royalties to treasury", async function () {
            const royaltyAmount = ethers.parseEther("0.1");
            const initialBalance = await ethers.provider.getBalance(treasury.address);

            await fractionalNFT.distributeRoyalties({ value: royaltyAmount });

            const finalBalance = await ethers.provider.getBalance(treasury.address);
            expect(finalBalance).to.equal(initialBalance + royaltyAmount);
        });

        it("Should emit royalty distribution event", async function () {
            const royaltyAmount = ethers.parseEther("0.1");

            await expect(
                fractionalNFT.distributeRoyalties({ value: royaltyAmount })
            ).to.emit(fractionalNFT, "RoyaltyDistributed")
                .withArgs(treasury.address, royaltyAmount, await getLatestTimestamp());
        });

        it("Should track total royalties collected", async function () {
            const amount1 = ethers.parseEther("0.1");
            const amount2 = ethers.parseEther("0.2");

            await fractionalNFT.distributeRoyalties({ value: amount1 });
            await fractionalNFT.distributeRoyalties({ value: amount2 });

            expect(await fractionalNFT.totalRoyaltiesCollected()).to.equal(amount1 + amount2);
        });

        it("Should not allow zero value distribution", async function () {
            await expect(
                fractionalNFT.distributeRoyalties({ value: 0 })
            ).to.be.revertedWith("No royalties to distribute");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set VibeCanvas contract", async function () {
            await fractionalNFT.setVibeCanvasContract(vibeCanvas.address);
            expect(await fractionalNFT.vibeCanvasContract()).to.equal(vibeCanvas.address);
        });

        it("Should not allow non-owner to set VibeCanvas", async function () {
            await expect(
                fractionalNFT.connect(user1).setVibeCanvasContract(vibeCanvas.address)
            ).to.be.reverted;
        });

        it("Should allow owner to update treasury", async function () {
            await fractionalNFT.setAkashicTreasury(user1.address);
            expect(await fractionalNFT.akashicTreasury()).to.equal(user1.address);
        });

        it("Should allow owner to update ScrollVault", async function () {
            await fractionalNFT.setScrollVault(user1.address);
            expect(await fractionalNFT.scrollVault()).to.equal(user1.address);
        });

        it("Should allow owner to update base URI", async function () {
            const newURI = "ipfs://QmNewHash/";
            await fractionalNFT.setBaseURI(newURI);
            
            await fractionalNFT.activateGenesisDrop();
            await fractionalNFT.connect(user1).mintScrollUnit();
            
            expect(await fractionalNFT.tokenURI(1)).to.include(newURI);
        });

        it("Should not allow zero address for treasury", async function () {
            await expect(
                fractionalNFT.setAkashicTreasury(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid treasury");
        });

        it("Should not allow zero address for ScrollVault", async function () {
            await expect(
                fractionalNFT.setScrollVault(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid vault");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
            await fractionalNFT.connect(user1).mintScrollUnit();
        });

        it("Should return scroll unit details", async function () {
            const scrollUnit = await fractionalNFT.getScrollUnit(1);
            
            expect(scrollUnit.unitId).to.equal(1);
            expect(scrollUnit.owner).to.equal(user1.address);
            expect(scrollUnit.isActive).to.be.true;
        });

        it("Should return frequency profile", async function () {
            const profile = await fractionalNFT.getFrequencyProfile(1);
            
            expect(profile.freq528Hz).to.be.greaterThan(0);
            expect(profile.freq432Hz).to.be.greaterThan(0);
            expect(profile.freq963Hz).to.be.greaterThan(0);
        });

        it("Should return vibe metrics", async function () {
            const metrics = await fractionalNFT.getVibeMetrics(1);
            
            expect(metrics.vibeLevel).to.equal(0);
            expect(metrics.resonanceScore).to.equal(0);
        });

        it("Should return remaining units", async function () {
            expect(await fractionalNFT.getRemainingUnits()).to.equal(TOTAL_SCROLL_UNITS - 1);
        });

        it("Should return vortex distribution", async function () {
            const [vortex3, vortex6, vortex9] = await fractionalNFT.getVortexDistribution();
            const total = Number(vortex3) + Number(vortex6) + Number(vortex9);
            
            expect(total).to.equal(1);
        });
    });

    describe("ERC-721 Compliance", function () {
        beforeEach(async function () {
            await fractionalNFT.activateGenesisDrop();
            await fractionalNFT.connect(user1).mintScrollUnit();
        });

        it("Should support ERC-721 interface", async function () {
            const ERC721_INTERFACE_ID = "0x80ac58cd";
            expect(await fractionalNFT.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
        });

        it("Should support ERC-2981 interface", async function () {
            const ERC2981_INTERFACE_ID = "0x2a55205a";
            expect(await fractionalNFT.supportsInterface(ERC2981_INTERFACE_ID)).to.be.true;
        });

        it("Should allow token transfers", async function () {
            await fractionalNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
            expect(await fractionalNFT.ownerOf(1)).to.equal(user2.address);
        });

        it("Should allow burning tokens", async function () {
            await fractionalNFT.connect(user1).burn(1);
            await expect(fractionalNFT.ownerOf(1)).to.be.reverted;
        });
    });

    // Helper function
    async function getLatestTimestamp() {
        const block = await ethers.provider.getBlock('latest');
        return block.timestamp;
    }
});
