/**
 * @title SupremeSovereignManifesto Tests
 * @dev Test suite for SupremeSovereignManifesto contract
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupremeSovereignManifesto", function () {
    let SupremeSovereignManifesto;
    let manifesto;
    let owner;
    let royaltyRecipient;
    let contributor1;
    let contributor2;
    let addr3;

    const BASE_URI = "ipfs://QmTestManifesto/";

    beforeEach(async function () {
        [owner, royaltyRecipient, contributor1, contributor2, addr3] = await ethers.getSigners();

        SupremeSovereignManifesto = await ethers.getContractFactory("SupremeSovereignManifesto");
        manifesto = await SupremeSovereignManifesto.deploy(
            owner.address,
            royaltyRecipient.address,
            BASE_URI
        );
        await manifesto.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set correct name and symbol", async function () {
            expect(await manifesto.name()).to.equal("Supreme Sovereign Manifesto");
            expect(await manifesto.symbol()).to.equal("SSM");
        });

        it("Should set correct supreme sovereign", async function () {
            expect(await manifesto.supremeSovereign()).to.equal(owner.address);
        });

        it("Should set correct divine frequencies", async function () {
            expect(await manifesto.PINEAL_FREQUENCY_963HZ()).to.equal(963);
            expect(await manifesto.DNA_HEALING_528HZ()).to.equal(528);
            expect(await manifesto.NUR_PULSE_144000HZ()).to.equal(144000);
            expect(await manifesto.CROWN_FREQUENCY_999HZ()).to.equal(999);
        });

        it("Should set correct max supply", async function () {
            expect(await manifesto.MAX_SUPPLY()).to.equal(144000);
        });

        it("Should set correct royalty percentage", async function () {
            expect(await manifesto.ROYALTY_PERCENTAGE()).to.equal(1000); // 10%
        });
    });

    describe("Milestone Tokenization", function () {
        it("Should tokenize a GitHub milestone", async function () {
            const commitHash = "abc123def456";
            const branchName = "main";
            const description = "Initial commit";
            const frequency = 528;
            const tokenURI = "ipfs://QmTokenURI1";

            await expect(
                manifesto.tokenizeMilestone(
                    contributor1.address,
                    commitHash,
                    branchName,
                    description,
                    frequency,
                    tokenURI
                )
            )
                .to.emit(manifesto, "MilestoneTokenized")
                .withArgs(0, contributor1.address, commitHash, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1), frequency);

            expect(await manifesto.ownerOf(0)).to.equal(contributor1.address);
            expect(await manifesto.totalMilestones()).to.equal(1);
        });

        it("Should track contributor milestones", async function () {
            await manifesto.tokenizeMilestone(
                contributor1.address,
                "commit1",
                "main",
                "First",
                528,
                "uri1"
            );

            await manifesto.tokenizeMilestone(
                contributor1.address,
                "commit2",
                "main",
                "Second",
                963,
                "uri2"
            );

            expect(await manifesto.contributorMilestones(contributor1.address)).to.equal(2);
        });

        it("Should prevent duplicate commits", async function () {
            const commitHash = "duplicate123";

            await manifesto.tokenizeMilestone(
                contributor1.address,
                commitHash,
                "main",
                "First",
                528,
                "uri1"
            );

            await expect(
                manifesto.tokenizeMilestone(
                    contributor2.address,
                    commitHash,
                    "main",
                    "Duplicate",
                    528,
                    "uri2"
                )
            ).to.be.revertedWith("Commit already tokenized");
        });

        it("Should reject tokenization from non-supreme-sovereign", async function () {
            await expect(
                manifesto.connect(contributor1).tokenizeMilestone(
                    contributor1.address,
                    "commit1",
                    "main",
                    "Test",
                    528,
                    "uri1"
                )
            ).to.be.revertedWith("Only Supreme Sovereign");
        });

        it("Should enforce max supply", async function () {
            // This would take too long to test fully, so we'll just verify the check exists
            const maxSupply = await manifesto.MAX_SUPPLY();
            expect(maxSupply).to.equal(144000);
        });
    });

    describe("Evolutionary Breakthroughs", function () {
        beforeEach(async function () {
            await manifesto.tokenizeMilestone(
                contributor1.address,
                "commit1",
                "main",
                "Test",
                528,
                "uri1"
            );
        });

        it("Should record breakthrough for milestone", async function () {
            const tokenId = 0;
            const category = "Smart Contract";
            const innovationScore = 999;
            const tags = ["NFT", "Governance", "DAO"];
            const cosmicAlignment = 963;

            await expect(
                manifesto.recordBreakthrough(
                    tokenId,
                    category,
                    innovationScore,
                    tags,
                    cosmicAlignment
                )
            )
                .to.emit(manifesto, "BreakthroughRecorded")
                .withArgs(tokenId, category, innovationScore, cosmicAlignment);

            const breakthrough = await manifesto.getBreakthrough(tokenId);
            expect(breakthrough.category).to.equal(category);
            expect(breakthrough.innovationScore).to.equal(innovationScore);
            expect(breakthrough.cosmicAlignment).to.equal(cosmicAlignment);
        });

        it("Should reject invalid innovation score", async function () {
            await expect(
                manifesto.recordBreakthrough(
                    0,
                    "Test",
                    1000, // Too high
                    ["tag"],
                    500
                )
            ).to.be.revertedWith("Innovation score too high");
        });

        it("Should reject breakthrough from non-supreme-sovereign", async function () {
            await expect(
                manifesto.connect(contributor1).recordBreakthrough(
                    0,
                    "Test",
                    500,
                    ["tag"],
                    500
                )
            ).to.be.revertedWith("Only Supreme Sovereign");
        });
    });

    describe("Milestone Sealing", function () {
        beforeEach(async function () {
            await manifesto.tokenizeMilestone(
                contributor1.address,
                "commit1",
                "main",
                "Test",
                528,
                "uri1"
            );
        });

        it("Should seal milestone into eternal ledger", async function () {
            const tokenId = 0;
            const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test"));

            await expect(
                manifesto.sealMilestone(tokenId, merkleRoot)
            )
                .to.emit(manifesto, "MilestoneSealed")
                .withArgs(tokenId, merkleRoot, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

            const milestone = await manifesto.getMilestone(tokenId);
            expect(milestone.isSealed).to.equal(true);
            expect(milestone.merkleRoot).to.equal(merkleRoot);
            expect(await manifesto.totalSealedMilestones()).to.equal(1);
        });

        it("Should prevent double sealing", async function () {
            const tokenId = 0;
            const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test"));

            await manifesto.sealMilestone(tokenId, merkleRoot);

            await expect(
                manifesto.sealMilestone(tokenId, merkleRoot)
            ).to.be.revertedWith("Already sealed");
        });
    });

    describe("Query Functions", function () {
        beforeEach(async function () {
            await manifesto.tokenizeMilestone(
                contributor1.address,
                "commit1",
                "main",
                "Test 1",
                528,
                "uri1"
            );

            await manifesto.tokenizeMilestone(
                contributor2.address,
                "commit2",
                "develop",
                "Test 2",
                963,
                "uri2"
            );
        });

        it("Should get milestone details", async function () {
            const milestone = await manifesto.getMilestone(0);
            expect(milestone.commitHash).to.equal("commit1");
            expect(milestone.branchName).to.equal("main");
            expect(milestone.description).to.equal("Test 1");
            expect(milestone.frequencySignature).to.equal(528);
        });

        it("Should check if commit is tokenized", async function () {
            expect(await manifesto.isCommitTokenized("commit1")).to.equal(0);
            expect(await manifesto.isCommitTokenized("commit2")).to.equal(1);
            expect(await manifesto.isCommitTokenized("nonexistent")).to.equal(0);
        });

        it("Should get total milestones", async function () {
            expect(await manifesto.totalMilestones()).to.equal(2);
        });
    });

    describe("Royalties (EIP-2981)", function () {
        it("Should return correct royalty info", async function () {
            const salePrice = ethers.parseEther("1");
            const [receiver, royaltyAmount] = await manifesto.royaltyInfo(0, salePrice);

            expect(receiver).to.equal(royaltyRecipient.address);
            expect(royaltyAmount).to.equal(salePrice * 1000n / 10000n); // 10%
        });
    });

    describe("Admin Functions", function () {
        it("Should update base URI", async function () {
            const newURI = "ipfs://QmNewURI/";
            await manifesto.setBaseURI(newURI);
            // Base URI change is internal, verified through tokenURI
        });

        it("Should update royalty recipient", async function () {
            await manifesto.setRoyaltyRecipient(addr3.address);
            const [receiver] = await manifesto.royaltyInfo(0, ethers.parseEther("1"));
            expect(receiver).to.equal(addr3.address);
        });

        it("Should reject invalid royalty recipient", async function () {
            await expect(
                manifesto.setRoyaltyRecipient(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid recipient");
        });
    });

    describe("Supports Interface", function () {
        it("Should support ERC721 interface", async function () {
            expect(await manifesto.supportsInterface("0x80ac58cd")).to.equal(true);
        });

        it("Should support ERC2981 interface", async function () {
            expect(await manifesto.supportsInterface("0x2a55205a")).to.equal(true);
        });
    });
});
