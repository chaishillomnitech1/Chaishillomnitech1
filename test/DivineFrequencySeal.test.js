const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DivineFrequencySeal", function () {
    let divineFrequencySeal;
    let owner, user1, user2;
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const DivineFrequencySeal = await ethers.getContractFactory("DivineFrequencySeal");
        divineFrequencySeal = await DivineFrequencySeal.deploy();
        await divineFrequencySeal.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await divineFrequencySeal.owner()).to.equal(owner.address);
        });
        
        it("Should have correct frequency constants", async function () {
            expect(await divineFrequencySeal.FREQUENCY_528HZ()).to.equal(528);
            expect(await divineFrequencySeal.FREQUENCY_963HZ()).to.equal(963);
            expect(await divineFrequencySeal.FREQUENCY_999HZ()).to.equal(999);
            expect(await divineFrequencySeal.FREQUENCY_144000HZ()).to.equal(144000);
        });
    });
    
    describe("Frequency Seal Creation", function () {
        it("Should create a frequency seal", async function () {
            const contentHash = ethers.id("test-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await expect(
                divineFrequencySeal.createFrequencySeal(
                    contentHash,
                    0, // SCROLL_TV
                    0, // STANDARD
                    cryptographicShield
                )
            ).to.emit(divineFrequencySeal, "FrequencySealCreated");
            
            expect(await divineFrequencySeal.totalSealsCreated()).to.equal(1);
        });
        
        it("Should not allow duplicate seals", async function () {
            const contentHash = ethers.id("test-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await divineFrequencySeal.createFrequencySeal(
                contentHash,
                0, // SCROLL_TV
                0, // STANDARD
                cryptographicShield
            );
            
            await expect(
                divineFrequencySeal.createFrequencySeal(
                    contentHash,
                    0,
                    0,
                    cryptographicShield
                )
            ).to.be.revertedWith("Seal already exists");
        });
        
        it("Should create seal with ETERNAL protection level", async function () {
            const contentHash = ethers.id("eternal-content");
            const cryptographicShield = ethers.id("eternal-shield");
            
            await divineFrequencySeal.createFrequencySeal(
                contentHash,
                1, // NFT_METADATA
                3, // ETERNAL
                cryptographicShield
            );
            
            const seal = await divineFrequencySeal.frequencySeals(contentHash);
            expect(seal.isActive).to.equal(true);
            expect(seal.protectionLevel).to.equal(3); // ETERNAL
        });
    });
    
    describe("Frequency Seal Verification", function () {
        it("Should verify frequency seal correctly", async function () {
            const contentHash = ethers.id("verifiable-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await divineFrequencySeal.createFrequencySeal(
                contentHash,
                0,
                0,
                cryptographicShield
            );
            
            const [isValid, frequencyMatch] = await divineFrequencySeal.verifyFrequencySeal(
                contentHash,
                cryptographicShield
            );
            
            expect(isValid).to.equal(true);
            expect(frequencyMatch).to.equal(10000);
            expect(await divineFrequencySeal.totalVerifications()).to.equal(1);
        });
        
        it("Should reject invalid shield", async function () {
            const contentHash = ethers.id("verifiable-content");
            const cryptographicShield = ethers.id("shield-data");
            const wrongShield = ethers.id("wrong-shield");
            
            await divineFrequencySeal.createFrequencySeal(
                contentHash,
                0,
                0,
                cryptographicShield
            );
            
            const [isValid, frequencyMatch] = await divineFrequencySeal.verifyFrequencySeal(
                contentHash,
                wrongShield
            );
            
            expect(isValid).to.equal(false);
            expect(frequencyMatch).to.equal(0);
        });
    });
    
    describe("Piracy Detection", function () {
        it("Should detect piracy", async function () {
            const originalHash = ethers.id("original-content");
            const piracyHash = ethers.id("pirated-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await divineFrequencySeal.createFrequencySeal(
                originalHash,
                2, // MUSIC_SCROLL
                1, // ENHANCED
                cryptographicShield
            );
            
            const isPiracy = await divineFrequencySeal.detectPiracy(
                originalHash,
                piracyHash
            );
            
            expect(isPiracy).to.equal(true);
        });
        
        it("Should not flag original content as piracy", async function () {
            const originalHash = ethers.id("original-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await divineFrequencySeal.createFrequencySeal(
                originalHash,
                2,
                1,
                cryptographicShield
            );
            
            const isPiracy = await divineFrequencySeal.detectPiracy(
                originalHash,
                originalHash
            );
            
            expect(isPiracy).to.equal(false);
        });
    });
    
    describe("Seal Revocation", function () {
        it("Should revoke a seal", async function () {
            const contentHash = ethers.id("revokable-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await divineFrequencySeal.createFrequencySeal(
                contentHash,
                0,
                0,
                cryptographicShield
            );
            
            await expect(
                divineFrequencySeal.revokeFrequencySeal(contentHash)
            ).to.emit(divineFrequencySeal, "FrequencySealRevoked");
            
            const seal = await divineFrequencySeal.frequencySeals(contentHash);
            expect(seal.isActive).to.equal(false);
        });
        
        it("Should not allow non-owners to revoke", async function () {
            const contentHash = ethers.id("protected-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await divineFrequencySeal.createFrequencySeal(
                contentHash,
                0,
                0,
                cryptographicShield
            );
            
            await expect(
                divineFrequencySeal.connect(user1).revokeFrequencySeal(contentHash)
            ).to.be.revertedWithCustomError(divineFrequencySeal, "OwnableUnauthorizedAccount");
        });
    });
    
    describe("View Functions", function () {
        it("Should return frequency seal details", async function () {
            const contentHash = ethers.id("detailed-content");
            const cryptographicShield = ethers.id("shield-data");
            
            await divineFrequencySeal.createFrequencySeal(
                contentHash,
                1, // NFT_METADATA
                2, // SOVEREIGN
                cryptographicShield
            );
            
            const seal = await divineFrequencySeal.getFrequencySeal(contentHash);
            expect(seal.contentHash).to.equal(contentHash);
            expect(seal.contentType).to.equal(1);
            expect(seal.protectionLevel).to.equal(2);
            expect(seal.isActive).to.equal(true);
        });
        
        it("Should return total seals", async function () {
            expect(await divineFrequencySeal.getTotalSeals()).to.equal(0);
            
            await divineFrequencySeal.createFrequencySeal(
                ethers.id("content-1"),
                0,
                0,
                ethers.id("shield-1")
            );
            
            expect(await divineFrequencySeal.getTotalSeals()).to.equal(1);
        });
    });
    
    describe("Anti-Piracy Threshold", function () {
        it("Should set anti-piracy threshold", async function () {
            await divineFrequencySeal.setAntiPiracyThreshold(8000);
            expect(await divineFrequencySeal.antiPiracyThreshold()).to.equal(8000);
        });
        
        it("Should not allow threshold above 10000", async function () {
            await expect(
                divineFrequencySeal.setAntiPiracyThreshold(10001)
            ).to.be.revertedWith("Invalid threshold");
        });
    });
});
