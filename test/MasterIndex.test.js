/**
 * @title Master Index Test Suite
 * @notice Comprehensive testing for the MasterIndex smart contract
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MasterIndex", function () {
    let masterIndex;
    let owner;
    let archivist1;
    let archivist2;
    let user;
    
    beforeEach(async function () {
        [owner, archivist1, archivist2, user] = await ethers.getSigners();
        
        const MasterIndex = await ethers.getContractFactory("MasterIndex");
        masterIndex = await MasterIndex.deploy(owner.address);
        await masterIndex.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await masterIndex.owner()).to.equal(owner.address);
        });
        
        it("Should set owner as initial archivist", async function () {
            expect(await masterIndex.archivists(owner.address)).to.be.true;
        });
        
        it("Should initialize with zero documents", async function () {
            expect(await masterIndex.documentCount()).to.equal(0);
        });
        
        it("Should initialize with zero categories", async function () {
            expect(await masterIndex.categoryCount()).to.equal(0);
        });
    });
    
    describe("Archivist Management", function () {
        it("Should allow owner to add archivist", async function () {
            await expect(masterIndex.addArchivist(archivist1.address))
                .to.emit(masterIndex, "ArchivistAdded")
                .withArgs(archivist1.address);
            
            expect(await masterIndex.archivists(archivist1.address)).to.be.true;
        });
        
        it("Should allow owner to remove archivist", async function () {
            await masterIndex.addArchivist(archivist1.address);
            
            await expect(masterIndex.removeArchivist(archivist1.address))
                .to.emit(masterIndex, "ArchivistRemoved")
                .withArgs(archivist1.address);
            
            expect(await masterIndex.archivists(archivist1.address)).to.be.false;
        });
        
        it("Should prevent non-owner from adding archivist", async function () {
            await expect(
                masterIndex.connect(user).addArchivist(archivist1.address)
            ).to.be.reverted;
        });
    });
    
    describe("Document Indexing", function () {
        beforeEach(async function () {
            await masterIndex.addArchivist(archivist1.address);
        });
        
        it("Should index a new document", async function () {
            const tx = await masterIndex.connect(archivist1).indexDocument(
                "Sacred Protocol",
                "Core divine protocols",
                "QmXxxx1234",
                "ipfs_archive/sacred_protocols.md",
                0, // PROTOCOL
                4, // GOD_FREQ
                1, // SOVEREIGN
                ["sacred", "protocol"],
                ["scrollverse", "divine"]
            );
            
            await expect(tx)
                .to.emit(masterIndex, "DocumentIndexed")
                .withArgs(1, "Sacred Protocol", "QmXxxx1234", 0, 4, archivist1.address);
            
            expect(await masterIndex.documentCount()).to.equal(1);
        });
        
        it("Should store document with correct metadata", async function () {
            await masterIndex.connect(archivist1).indexDocument(
                "Test Document",
                "Test description",
                "QmTest123",
                "test/document.md",
                1, // TRANSMISSION
                8, // DNA_HEALING
                0, // PUBLIC
                ["test", "doc"],
                ["testing", "vault"]
            );
            
            const doc = await masterIndex.getDocument(1);
            
            expect(doc.title).to.equal("Test Document");
            expect(doc.description).to.equal("Test description");
            expect(doc.ipfsHash).to.equal("QmTest123");
            expect(doc.filePath).to.equal("test/document.md");
            expect(doc.docType).to.equal(1);
            expect(doc.frequency).to.equal(8);
            expect(doc.accessLevel).to.equal(0);
            expect(doc.archivist).to.equal(archivist1.address);
            expect(doc.sealed).to.be.false;
            expect(doc.version).to.equal(1);
        });
        
        it("Should prevent non-archivist from indexing", async function () {
            await expect(
                masterIndex.connect(user).indexDocument(
                    "Test",
                    "Test",
                    "QmTest",
                    "test.md",
                    0, 0, 0,
                    [],
                    []
                )
            ).to.be.revertedWith("Not an archivist");
        });
    });
    
    describe("Document Updates", function () {
        beforeEach(async function () {
            await masterIndex.addArchivist(archivist1.address);
            await masterIndex.connect(archivist1).indexDocument(
                "Original Title",
                "Original description",
                "QmOriginal",
                "test.md",
                0, 0, 0,
                [],
                []
            );
        });
        
        it("Should update document metadata", async function () {
            await expect(
                masterIndex.connect(archivist1).updateDocument(
                    1,
                    "Updated Title",
                    "Updated description",
                    "QmUpdated"
                )
            ).to.emit(masterIndex, "DocumentUpdated")
            .withArgs(1, 2, archivist1.address);
            
            const doc = await masterIndex.getDocument(1);
            expect(doc.title).to.equal("Updated Title");
            expect(doc.description).to.equal("Updated description");
            expect(doc.ipfsHash).to.equal("QmUpdated");
            expect(doc.version).to.equal(2);
        });
        
        it("Should prevent updating sealed document", async function () {
            await masterIndex.connect(archivist1).sealDocument(1);
            
            await expect(
                masterIndex.connect(archivist1).updateDocument(
                    1,
                    "New Title",
                    "New description",
                    "QmNew"
                )
            ).to.be.revertedWith("Document is sealed");
        });
    });
    
    describe("Document Sealing", function () {
        beforeEach(async function () {
            await masterIndex.addArchivist(archivist1.address);
            await masterIndex.connect(archivist1).indexDocument(
                "Test",
                "Test",
                "QmTest",
                "test.md",
                0, 0, 0,
                [],
                []
            );
        });
        
        it("Should seal document", async function () {
            await expect(masterIndex.connect(archivist1).sealDocument(1))
                .to.emit(masterIndex, "DocumentSealed")
                .withArgs(1, archivist1.address);
            
            const doc = await masterIndex.getDocument(1);
            expect(doc.sealed).to.be.true;
        });
        
        it("Should prevent sealing already sealed document", async function () {
            await masterIndex.connect(archivist1).sealDocument(1);
            
            await expect(
                masterIndex.connect(archivist1).sealDocument(1)
            ).to.be.revertedWith("Already sealed");
        });
    });
    
    describe("Category Management", function () {
        beforeEach(async function () {
            await masterIndex.addArchivist(archivist1.address);
        });
        
        it("Should create category", async function () {
            await expect(
                masterIndex.connect(archivist1).createCategory(
                    "Sacred Protocols",
                    "Divine operating procedures"
                )
            ).to.emit(masterIndex, "CategoryCreated")
            .withArgs(1, "Sacred Protocols");
            
            expect(await masterIndex.categoryCount()).to.equal(1);
        });
        
        it("Should add document to category", async function () {
            await masterIndex.connect(archivist1).createCategory(
                "Test Category",
                "Test description"
            );
            
            await masterIndex.connect(archivist1).indexDocument(
                "Test Doc",
                "Test",
                "QmTest",
                "test.md",
                0, 0, 0,
                [],
                []
            );
            
            await masterIndex.connect(archivist1).addToCategory(1, 1);
            
            const docs = await masterIndex.getCategoryDocuments(1);
            expect(docs.length).to.equal(1);
            expect(docs[0]).to.equal(1);
        });
    });
    
    describe("Search Functions", function () {
        beforeEach(async function () {
            await masterIndex.addArchivist(archivist1.address);
            
            // Index multiple documents
            await masterIndex.connect(archivist1).indexDocument(
                "NFT Contract",
                "ERC-721 implementation",
                "QmNFT1",
                "contracts/NFT.sol",
                3, // CONTRACT
                8, // DNA_HEALING
                0, // PUBLIC
                ["nft", "blockchain"],
                ["token", "erc721"]
            );
            
            await masterIndex.connect(archivist1).indexDocument(
                "Token Contract",
                "ERC-20 implementation",
                "QmToken1",
                "contracts/Token.sol",
                3, // CONTRACT
                4, // GOD_FREQ
                0, // PUBLIC
                ["token", "blockchain"],
                ["erc20", "token"]
            );
            
            await masterIndex.connect(archivist1).indexDocument(
                "Protocol Doc",
                "Sacred protocol",
                "QmProto1",
                "docs/protocol.md",
                0, // PROTOCOL
                8, // DNA_HEALING
                1, // SOVEREIGN
                ["sacred", "protocol"],
                ["divine", "sacred"]
            );
        });
        
        it("Should search by tag", async function () {
            const results = await masterIndex.searchByTag("blockchain");
            expect(results.length).to.equal(2);
        });
        
        it("Should search by keyword", async function () {
            const results = await masterIndex.searchByKeyword("token");
            expect(results.length).to.equal(2);
        });
        
        it("Should get by IPFS hash", async function () {
            const results = await masterIndex.getByIPFSHash("QmNFT1");
            expect(results.length).to.equal(1);
            expect(results[0]).to.equal(1);
        });
        
        it("Should get documents by type", async function () {
            const contracts = await masterIndex.getDocumentsByType(3); // CONTRACT
            expect(contracts.length).to.equal(2);
            
            const protocols = await masterIndex.getDocumentsByType(0); // PROTOCOL
            expect(protocols.length).to.equal(1);
        });
        
        it("Should get documents by frequency", async function () {
            const dnaHealing = await masterIndex.getDocumentsByFrequency(8); // DNA_HEALING
            expect(dnaHealing.length).to.equal(2);
            
            const godFreq = await masterIndex.getDocumentsByFrequency(4); // GOD_FREQ
            expect(godFreq.length).to.equal(1);
        });
    });
    
    describe("Pause Functionality", function () {
        it("Should allow owner to pause", async function () {
            await masterIndex.pause();
            expect(await masterIndex.paused()).to.be.true;
        });
        
        it("Should prevent indexing when paused", async function () {
            await masterIndex.pause();
            
            await expect(
                masterIndex.indexDocument(
                    "Test",
                    "Test",
                    "QmTest",
                    "test.md",
                    0, 0, 0,
                    [],
                    []
                )
            ).to.be.revertedWithCustomError(masterIndex, "EnforcedPause");
        });
        
        it("Should allow unpause", async function () {
            await masterIndex.pause();
            await masterIndex.unpause();
            expect(await masterIndex.paused()).to.be.false;
        });
    });
});
