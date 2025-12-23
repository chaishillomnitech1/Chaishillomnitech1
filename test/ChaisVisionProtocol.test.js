const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChaisVisionProtocol", function () {
    let chaisVisionProtocol;
    let godCoinToken;
    let owner, user1, user2, aiOracle;
    
    beforeEach(async function () {
        [owner, user1, user2, aiOracle] = await ethers.getSigners();
        
        // Deploy mock GodCoin token
        const MockERC20 = await ethers.getContractFactory("CHXToken");
        godCoinToken = await MockERC20.deploy(owner.address, user1.address, user2.address);
        await godCoinToken.waitForDeployment();
        
        // Deploy ChaisVisionProtocol
        const ChaisVisionProtocol = await ethers.getContractFactory("ChaisVisionProtocol");
        chaisVisionProtocol = await ChaisVisionProtocol.deploy(await godCoinToken.getAddress());
        await chaisVisionProtocol.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await chaisVisionProtocol.owner()).to.equal(owner.address);
        });
        
        it("Should set GodCoin token address", async function () {
            expect(await chaisVisionProtocol.godCoinToken()).to.equal(await godCoinToken.getAddress());
        });
        
        it("Should have correct constants", async function () {
            expect(await chaisVisionProtocol.AI_SYNC_FREQUENCY()).to.equal(144000);
            expect(await chaisVisionProtocol.MIN_GODCOIN_STAKE()).to.equal(ethers.parseEther("1000"));
        });
    });
    
    describe("Quantum Estate Ledger", function () {
        it("Should register a quantum estate", async function () {
            const assetId = ethers.id("estate-001");
            
            await expect(
                chaisVisionProtocol.registerQuantumEstate(
                    assetId,
                    0, // REAL_ESTATE
                    "Test Estate",
                    ethers.parseEther("1000000"),
                    aiOracle.address
                )
            ).to.emit(chaisVisionProtocol, "QuantumEstateRegistered");
            
            expect(await chaisVisionProtocol.totalAssets()).to.equal(1);
            expect(await chaisVisionProtocol.totalEstateValuation()).to.equal(ethers.parseEther("1000000"));
        });
        
        it("Should not allow duplicate asset registration", async function () {
            const assetId = ethers.id("estate-001");
            
            await chaisVisionProtocol.registerQuantumEstate(
                assetId,
                0,
                "Test Estate",
                ethers.parseEther("1000000"),
                aiOracle.address
            );
            
            await expect(
                chaisVisionProtocol.registerQuantumEstate(
                    assetId,
                    0,
                    "Duplicate Estate",
                    ethers.parseEther("500000"),
                    aiOracle.address
                )
            ).to.be.revertedWith("Asset already registered");
        });
        
        it("Should update asset valuation", async function () {
            const assetId = ethers.id("estate-002");
            
            await chaisVisionProtocol.registerQuantumEstate(
                assetId,
                1, // DIGITAL_ASSET
                "Digital Asset",
                ethers.parseEther("100000"),
                aiOracle.address
            );
            
            // Fast forward time to allow update
            await ethers.provider.send("evm_increaseTime", [3601]);
            await ethers.provider.send("evm_mine");
            
            await expect(
                chaisVisionProtocol.connect(aiOracle).updateValuation(
                    assetId,
                    ethers.parseEther("150000")
                )
            ).to.emit(chaisVisionProtocol, "ValuationUpdated");
            
            const entry = await chaisVisionProtocol.getQuantumEstateEntry(assetId);
            expect(entry.currentValuation).to.equal(ethers.parseEther("150000"));
        });
    });
    
    describe("Proof-of-GodCoin", function () {
        let assetId;
        
        beforeEach(async function () {
            assetId = ethers.id("asset-for-control");
            
            await chaisVisionProtocol.registerQuantumEstate(
                assetId,
                3, // MUSIC_CATALOG
                "Music Rights",
                ethers.parseEther("500000"),
                aiOracle.address
            );
            
            // Transfer GodCoin to user1 and approve
            await godCoinToken.transfer(user1.address, ethers.parseEther("2000"));
            await godCoinToken.connect(user1).approve(
                await chaisVisionProtocol.getAddress(),
                ethers.parseEther("2000")
            );
        });
        
        it("Should submit Proof-of-GodCoin", async function () {
            await expect(
                chaisVisionProtocol.connect(user1).submitProofOfGodCoin(
                    assetId,
                    ethers.parseEther("1500")
                )
            ).to.emit(chaisVisionProtocol, "ProofOfGodCoinSubmitted");
            
            expect(await chaisVisionProtocol.totalGodCoinStaked()).to.equal(ethers.parseEther("1500"));
            expect(await chaisVisionProtocol.totalStakedByAddress(user1.address)).to.equal(ethers.parseEther("1500"));
        });
        
        it("Should not allow insufficient stake", async function () {
            await expect(
                chaisVisionProtocol.connect(user1).submitProofOfGodCoin(
                    assetId,
                    ethers.parseEther("500") // Below MIN_GODCOIN_STAKE
                )
            ).to.be.revertedWith("Insufficient stake amount");
        });
        
        it("Should grant asset control", async function () {
            await chaisVisionProtocol.connect(user1).submitProofOfGodCoin(
                assetId,
                ethers.parseEther("1500")
            );
            
            await expect(
                chaisVisionProtocol.grantAssetControl(assetId)
            ).to.emit(chaisVisionProtocol, "AssetControlGranted");
            
            const proof = await chaisVisionProtocol.getProofOfGodCoin(assetId);
            expect(proof.status).to.equal(2); // CONTROLLED
        });
        
        it("Should revoke asset control and return stake", async function () {
            await chaisVisionProtocol.connect(user1).submitProofOfGodCoin(
                assetId,
                ethers.parseEther("1500")
            );
            
            await chaisVisionProtocol.grantAssetControl(assetId);
            
            const balanceBefore = await godCoinToken.balanceOf(user1.address);
            
            await expect(
                chaisVisionProtocol.connect(user1).revokeAssetControl(assetId)
            ).to.emit(chaisVisionProtocol, "AssetControlRevoked");
            
            const balanceAfter = await godCoinToken.balanceOf(user1.address);
            expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1500"));
        });
    });
    
    describe("AI Linkage", function () {
        it("Should configure AI linkage", async function () {
            await chaisVisionProtocol.configureAILinkage(
                aiOracle.address,
                144000
            );
            
            const linkage = await chaisVisionProtocol.getAILinkage();
            expect(linkage.aiServiceAddress).to.equal(aiOracle.address);
            expect(linkage.syncFrequency).to.equal(144000);
            expect(linkage.isActive).to.equal(true);
        });
        
        it("Should synchronize AI linkage", async function () {
            await chaisVisionProtocol.configureAILinkage(
                aiOracle.address,
                144000
            );
            
            const syncData = ethers.toUtf8Bytes("AI sync data");
            
            await expect(
                chaisVisionProtocol.connect(aiOracle).synchronizeAILinkage(syncData)
            ).to.emit(chaisVisionProtocol, "AILinkageSynchronized");
            
            const linkage = await chaisVisionProtocol.getAILinkage();
            expect(linkage.totalSyncs).to.equal(1);
        });
        
        it("Should not allow unauthorized sync", async function () {
            await chaisVisionProtocol.configureAILinkage(
                aiOracle.address,
                144000
            );
            
            const syncData = ethers.toUtf8Bytes("Unauthorized sync");
            
            await expect(
                chaisVisionProtocol.connect(user1).synchronizeAILinkage(syncData)
            ).to.be.revertedWith("Not authorized");
        });
    });
    
    describe("View Functions", function () {
        it("Should return controlled assets", async function () {
            const assetId = ethers.id("controlled-asset");
            
            await chaisVisionProtocol.registerQuantumEstate(
                assetId,
                0,
                "Test Asset",
                ethers.parseEther("1000000"),
                aiOracle.address
            );
            
            await godCoinToken.transfer(user1.address, ethers.parseEther("2000"));
            await godCoinToken.connect(user1).approve(
                await chaisVisionProtocol.getAddress(),
                ethers.parseEther("2000")
            );
            
            await chaisVisionProtocol.connect(user1).submitProofOfGodCoin(
                assetId,
                ethers.parseEther("1500")
            );
            
            await chaisVisionProtocol.grantAssetControl(assetId);
            
            const controlled = await chaisVisionProtocol.getControlledAssets(user1.address);
            expect(controlled.length).to.equal(1);
            expect(controlled[0]).to.equal(assetId);
        });
        
        it("Should return total estate valuation", async function () {
            await chaisVisionProtocol.registerQuantumEstate(
                ethers.id("asset-1"),
                0,
                "Asset 1",
                ethers.parseEther("500000"),
                aiOracle.address
            );
            
            await chaisVisionProtocol.registerQuantumEstate(
                ethers.id("asset-2"),
                1,
                "Asset 2",
                ethers.parseEther("300000"),
                aiOracle.address
            );
            
            expect(await chaisVisionProtocol.getTotalEstateValuation()).to.equal(ethers.parseEther("800000"));
        });
    });
});
