const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EternalContractSealing", function () {
    let eternalContractSealing;
    let owner, user1, user2, recipient1, recipient2;
    let mockContract;
    
    beforeEach(async function () {
        [owner, user1, user2, recipient1, recipient2] = await ethers.getSigners();
        
        const EternalContractSealing = await ethers.getContractFactory("EternalContractSealing");
        eternalContractSealing = await EternalContractSealing.deploy();
        await eternalContractSealing.waitForDeployment();
        
        // Deploy a mock contract for testing
        const MockERC20 = await ethers.getContractFactory("CHXToken");
        mockContract = await MockERC20.deploy(owner.address, user1.address, user2.address);
        await mockContract.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await eternalContractSealing.owner()).to.equal(owner.address);
        });
        
        it("Should have correct constants", async function () {
            expect(await eternalContractSealing.MAX_ROYALTY_PERCENTAGE()).to.equal(5000);
            expect(await eternalContractSealing.MIN_ROYALTY_PERCENTAGE()).to.equal(100);
            expect(await eternalContractSealing.MAX_GENERATIONS()).to.equal(ethers.MaxUint256);
        });
    });
    
    describe("Contract Sealing", function () {
        it("Should seal a contract", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address, recipient2.address];
            const shares = [7000, 3000]; // 70% and 30%
            
            await expect(
                eternalContractSealing.sealContract(
                    contractAddress,
                    0, // NFT_CONTRACT
                    immutabilityHash,
                    recipients,
                    shares
                )
            ).to.emit(eternalContractSealing, "ContractSealed");
            
            expect(await eternalContractSealing.totalSealedContracts()).to.equal(1);
        });
        
        it("Should not allow invalid royalty shares", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address, recipient2.address];
            const shares = [6000, 3000]; // Doesn't equal 10000
            
            await expect(
                eternalContractSealing.sealContract(
                    contractAddress,
                    0,
                    immutabilityHash,
                    recipients,
                    shares
                )
            ).to.be.revertedWith("Total shares must equal 10000 basis points");
        });
        
        it("Should not seal already sealed contract", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address];
            const shares = [10000];
            
            await eternalContractSealing.sealContract(
                contractAddress,
                0,
                immutabilityHash,
                recipients,
                shares
            );
            
            await expect(
                eternalContractSealing.sealContract(
                    contractAddress,
                    0,
                    immutabilityHash,
                    recipients,
                    shares
                )
            ).to.be.revertedWith("Contract already sealed");
        });
    });
    
    describe("Eternal Covenant", function () {
        it("Should forge eternal covenant", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address];
            const shares = [10000];
            
            await eternalContractSealing.sealContract(
                contractAddress,
                1, // TOKEN_CONTRACT
                immutabilityHash,
                recipients,
                shares
            );
            
            await expect(
                eternalContractSealing.forgeEternalCovenant(contractAddress)
            ).to.emit(eternalContractSealing, "EternalCovenantForged");
            
            const [, , sealStatus] = await eternalContractSealing.getEternalSeal(contractAddress);
            expect(sealStatus).to.equal(3); // ETERNAL_SEALED
        });
    });
    
    describe("Infinite Royalty", function () {
        let contractAddress;
        
        beforeEach(async function () {
            contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address, recipient2.address];
            const shares = [6000, 4000];
            
            await eternalContractSealing.sealContract(
                contractAddress,
                0,
                immutabilityHash,
                recipients,
                shares
            );
        });
        
        it("Should enable infinite royalty", async function () {
            await expect(
                eternalContractSealing.enableInfiniteRoyalty(
                    contractAddress,
                    1500, // 15% base royalty
                    100   // 1% per generation multiplier
                )
            ).to.emit(eternalContractSealing, "InfiniteRoyaltyEnabled");
            
            const [, , hasInfiniteRoyalty] = await eternalContractSealing.getEternalSeal(contractAddress);
            expect(hasInfiniteRoyalty).to.equal(true);
        });
        
        it("Should not allow invalid royalty rate", async function () {
            await expect(
                eternalContractSealing.enableInfiniteRoyalty(
                    contractAddress,
                    6000, // Above MAX_ROYALTY_PERCENTAGE
                    100
                )
            ).to.be.revertedWith("Invalid royalty rate");
        });
        
        it("Should distribute royalties", async function () {
            await eternalContractSealing.enableInfiniteRoyalty(
                contractAddress,
                1500,
                100
            );
            
            const amount = ethers.parseEther("1.0");
            
            await expect(
                eternalContractSealing.distributeRoyalties(
                    contractAddress,
                    1, // Generation 1
                    amount,
                    { value: amount }
                )
            ).to.emit(eternalContractSealing, "RoyaltyDistributed");
            
            const [, , , totalCollected] = await eternalContractSealing.getInfiniteRoyalty(contractAddress);
            expect(totalCollected).to.equal(amount);
        });
        
        it("Should advance generation", async function () {
            await eternalContractSealing.enableInfiniteRoyalty(
                contractAddress,
                1500,
                100
            );
            
            const [, , , , , , , generationBefore] = await eternalContractSealing.getEternalSeal(contractAddress);
            expect(generationBefore).to.equal(1);
            
            await expect(
                eternalContractSealing.advanceGeneration(contractAddress)
            ).to.emit(eternalContractSealing, "GenerationAdvanced");
            
            const [, , , , , , , generationAfter] = await eternalContractSealing.getEternalSeal(contractAddress);
            expect(generationAfter).to.equal(2);
        });
    });
    
    describe("Immutability Verification", function () {
        it("Should verify immutability", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address];
            const shares = [10000];
            
            await eternalContractSealing.sealContract(
                contractAddress,
                0,
                immutabilityHash,
                recipients,
                shares
            );
            
            const codeHash = ethers.id("contract-code");
            const storageHash = ethers.id("storage-layout");
            
            await expect(
                eternalContractSealing.connect(user1).verifyImmutability(
                    contractAddress,
                    codeHash,
                    storageHash
                )
            ).to.emit(eternalContractSealing, "ImmutabilityVerified");
            
            const proof = await eternalContractSealing.getImmutabilityProof(contractAddress);
            expect(proof.codeHash).to.equal(codeHash);
            expect(proof.isVerified).to.equal(true);
        });
    });
    
    describe("View Functions", function () {
        it("Should return eternal seal details", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address];
            const shares = [10000];
            
            await eternalContractSealing.sealContract(
                contractAddress,
                2, // ROYALTY_SPLITTER
                immutabilityHash,
                recipients,
                shares
            );
            
            const [address, contractType, sealStatus, , , , hasInfiniteRoyalty, generation] = 
                await eternalContractSealing.getEternalSeal(contractAddress);
            
            expect(address).to.equal(contractAddress);
            expect(contractType).to.equal(2);
            expect(sealStatus).to.equal(2); // SEALED
            expect(hasInfiniteRoyalty).to.equal(false);
            expect(generation).to.equal(1);
        });
        
        it("Should return royalty recipients", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address, recipient2.address];
            const shares = [7000, 3000];
            
            await eternalContractSealing.sealContract(
                contractAddress,
                0,
                immutabilityHash,
                recipients,
                shares
            );
            
            const [returnedRecipients, returnedShares] = 
                await eternalContractSealing.getRoyaltyRecipients(contractAddress);
            
            expect(returnedRecipients.length).to.equal(2);
            expect(returnedRecipients[0]).to.equal(recipient1.address);
            expect(returnedShares[0]).to.equal(7000);
        });
        
        it("Should return all sealed contracts", async function () {
            const contractAddress = await mockContract.getAddress();
            const immutabilityHash = ethers.id("immutability-proof");
            const recipients = [recipient1.address];
            const shares = [10000];
            
            await eternalContractSealing.sealContract(
                contractAddress,
                0,
                immutabilityHash,
                recipients,
                shares
            );
            
            const allSealed = await eternalContractSealing.getAllSealedContracts();
            expect(allSealed.length).to.equal(1);
            expect(allSealed[0]).to.equal(contractAddress);
        });
    });
});
