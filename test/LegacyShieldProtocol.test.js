/**
 * @title LegacyShieldProtocol Tests
 * @dev Test suite for LegacyShieldProtocol contract
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LegacyShieldProtocol", function () {
    let LegacyShieldProtocol;
    let shield;
    let owner;
    let user1;
    let user2;
    let insuranceVault;
    let revenueVault;
    let claimsReserveVault;

    const BASIC_TIER = 1;
    const STANDARD_TIER = 2;
    const PREMIUM_TIER = 3;
    const SOVEREIGN_TIER = 4;

    // Asset types
    const PHYSICAL_REAL_ESTATE = 0;
    const DIGITAL_NFT = 4;
    const DIGITAL_TOKEN = 5;

    // Claim types
    const LOSS = 0;
    const THEFT = 1;
    const CYBER_ATTACK = 3;

    beforeEach(async function () {
        [owner, user1, user2, insuranceVault, revenueVault, claimsReserveVault] = await ethers.getSigners();

        LegacyShieldProtocol = await ethers.getContractFactory("LegacyShieldProtocol");
        shield = await LegacyShieldProtocol.deploy(
            insuranceVault.address,
            revenueVault.address,
            claimsReserveVault.address
        );
        await shield.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct vault addresses", async function () {
            expect(await shield.insuranceVault()).to.equal(insuranceVault.address);
            expect(await shield.revenueVault()).to.equal(revenueVault.address);
            expect(await shield.claimsReserveVault()).to.equal(claimsReserveVault.address);
        });

        it("Should grant admin roles to deployer", async function () {
            const SHIELD_ADMIN_ROLE = await shield.SHIELD_ADMIN_ROLE();
            expect(await shield.hasRole(SHIELD_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should initialize revenue streams", async function () {
            const streams = await shield.getAllRevenueStreams();
            expect(streams.length).to.equal(3); // License, Scroll IP, Cloud Defense
        });

        it("Should set tier premiums", async function () {
            expect(await shield.tierPremiums(BASIC_TIER)).to.equal(ethers.parseEther("0.01"));
            expect(await shield.tierPremiums(STANDARD_TIER)).to.equal(ethers.parseEther("0.05"));
            expect(await shield.tierPremiums(PREMIUM_TIER)).to.equal(ethers.parseEther("0.1"));
            expect(await shield.tierPremiums(SOVEREIGN_TIER)).to.equal(ethers.parseEther("0.5"));
        });
    });

    describe("Asset Protection", function () {
        it("Should protect a new asset", async function () {
            const valuation = ethers.parseEther("100");
            const premium = await shield.tierPremiums(BASIC_TIER);
            const duration = 12; // 12 months
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("asset-metadata"));

            const tx = await shield.connect(user1).protectAsset(
                DIGITAL_NFT,
                valuation,
                BASIC_TIER,
                metadataHash,
                duration,
                { value: premium * BigInt(duration) }
            );

            await expect(tx).to.emit(shield, "AssetProtected");
        });

        it("Should calculate correct coverage based on tier", async function () {
            const valuation = ethers.parseEther("100");
            const premium = await shield.tierPremiums(BASIC_TIER);
            const duration = 1;
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("asset-metadata"));

            const tx = await shield.connect(user1).protectAsset(
                DIGITAL_TOKEN,
                valuation,
                BASIC_TIER,
                metadataHash,
                duration,
                { value: premium }
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "AssetProtected"
            );
            const assetId = event.args[0];

            const asset = await shield.getProtectedAsset(assetId);
            // Basic tier = 50% coverage
            expect(asset.coverageAmount).to.equal(valuation / 2n);
        });

        it("Should reject insufficient premium", async function () {
            const valuation = ethers.parseEther("100");
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("asset-metadata"));

            await expect(
                shield.connect(user1).protectAsset(
                    DIGITAL_NFT,
                    valuation,
                    BASIC_TIER,
                    metadataHash,
                    12,
                    { value: ethers.parseEther("0.001") } // Too low
                )
            ).to.be.revertedWith("Insufficient premium");
        });

        it("Should track owner assets", async function () {
            const valuation = ethers.parseEther("50");
            const premium = await shield.tierPremiums(STANDARD_TIER);
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("asset-metadata"));

            await shield.connect(user1).protectAsset(
                PHYSICAL_REAL_ESTATE,
                valuation,
                STANDARD_TIER,
                metadataHash,
                6,
                { value: premium * 6n }
            );

            const ownerAssets = await shield.getOwnerAssets(user1.address);
            expect(ownerAssets.length).to.equal(1);
        });

        it("Should update protocol stats", async function () {
            const valuation = ethers.parseEther("200");
            const premium = await shield.tierPremiums(PREMIUM_TIER);
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("asset-metadata"));

            await shield.connect(user1).protectAsset(
                DIGITAL_NFT,
                valuation,
                PREMIUM_TIER,
                metadataHash,
                3,
                { value: premium * 3n }
            );

            const stats = await shield.getProtocolStats();
            expect(stats._totalProtectedValue).to.equal(valuation);
            expect(stats._totalAssetsProtected).to.equal(1);
        });
    });

    describe("Great Protection Trust", function () {
        it("Should create a protection trust", async function () {
            const trustTier = PREMIUM_TIER;
            const fundAmount = ethers.parseEther("10");

            const tx = await shield.createGreatProtectionTrust(
                user1.address,
                trustTier,
                { value: fundAmount }
            );

            await expect(tx).to.emit(shield, "TrustCreated");

            const trustId = await shield.beneficiaryTrust(user1.address);
            expect(trustId).to.not.equal(ethers.ZeroHash);
        });

        it("Should split funding 60/40 between health and financial", async function () {
            const fundAmount = ethers.parseEther("10");

            const tx = await shield.createGreatProtectionTrust(
                user1.address,
                STANDARD_TIER,
                { value: fundAmount }
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "TrustCreated"
            );
            const trustId = event.args[0];

            const trust = await shield.getProtectionTrust(trustId);
            expect(trust.healthActivationBalance).to.equal(fundAmount * 60n / 100n);
            expect(trust.financialActivationBalance).to.equal(fundAmount * 40n / 100n);
        });

        it("Should trigger health activation", async function () {
            const fundAmount = ethers.parseEther("10");

            await shield.createGreatProtectionTrust(
                user1.address,
                STANDARD_TIER,
                { value: fundAmount }
            );

            const trustId = await shield.beneficiaryTrust(user1.address);
            const activationAmount = ethers.parseEther("1");

            const balanceBefore = await ethers.provider.getBalance(user1.address);

            await shield.triggerHealthActivation(trustId, activationAmount);

            const balanceAfter = await ethers.provider.getBalance(user1.address);
            expect(balanceAfter - balanceBefore).to.equal(activationAmount);
        });

        it("Should trigger financial activation", async function () {
            const fundAmount = ethers.parseEther("10");

            await shield.createGreatProtectionTrust(
                user1.address,
                STANDARD_TIER,
                { value: fundAmount }
            );

            const trustId = await shield.beneficiaryTrust(user1.address);
            const activationAmount = ethers.parseEther("0.5");

            await expect(
                shield.triggerFinancialActivation(trustId, activationAmount)
            ).to.emit(shield, "FinancialActivationTriggered");
        });

        it("Should allow additional funding", async function () {
            const initialFund = ethers.parseEther("5");
            const additionalFund = ethers.parseEther("3");

            await shield.createGreatProtectionTrust(
                user1.address,
                BASIC_TIER,
                { value: initialFund }
            );

            const trustId = await shield.beneficiaryTrust(user1.address);

            await shield.connect(user2).fundTrust(trustId, true, { value: additionalFund });

            const trust = await shield.getProtectionTrust(trustId);
            expect(trust.healthActivationBalance).to.equal(
                (initialFund * 60n / 100n) + additionalFund
            );
        });
    });

    describe("Insurance Claims", function () {
        let assetId;

        beforeEach(async function () {
            const valuation = ethers.parseEther("100");
            const premium = await shield.tierPremiums(PREMIUM_TIER);
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("asset-metadata"));

            const tx = await shield.connect(user1).protectAsset(
                DIGITAL_NFT,
                valuation,
                PREMIUM_TIER,
                metadataHash,
                12,
                { value: premium * 12n }
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "AssetProtected"
            );
            assetId = event.args[0];
        });

        it("Should submit an insurance claim", async function () {
            const claimAmount = ethers.parseEther("50");
            const evidenceHash = "QmTest123";

            await expect(
                shield.connect(user1).submitClaim(assetId, THEFT, claimAmount, evidenceHash)
            ).to.emit(shield, "ClaimSubmitted");
        });

        it("Should process and approve a claim", async function () {
            const claimAmount = ethers.parseEther("50");
            const evidenceHash = "QmTest123";

            const tx = await shield.connect(user1).submitClaim(
                assetId,
                CYBER_ATTACK,
                claimAmount,
                evidenceHash
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "ClaimSubmitted"
            );
            const claimId = event.args[0];

            // Fund claims reserve for payout
            await owner.sendTransaction({
                to: await shield.getAddress(),
                value: ethers.parseEther("100")
            });

            await expect(
                shield.processClaim(claimId, true, claimAmount)
            ).to.emit(shield, "ClaimProcessed");

            const claim = await shield.getInsuranceClaim(claimId);
            expect(claim.isProcessed).to.be.true;
            expect(claim.isApproved).to.be.true;
        });

        it("Should reject claim exceeding coverage", async function () {
            const asset = await shield.getProtectedAsset(assetId);
            const excessiveAmount = asset.coverageAmount + ethers.parseEther("1");

            await expect(
                shield.connect(user1).submitClaim(assetId, LOSS, excessiveAmount, "evidence")
            ).to.be.revertedWith("Claim exceeds coverage");
        });
    });

    describe("Cloud Defense Services", function () {
        it("Should subscribe to cloud defense service", async function () {
            const tier = STANDARD_TIER;
            const duration = 6; // 6 months
            const fee = await shield.tierPremiums(tier);

            await expect(
                shield.connect(user1).subscribeCloudDefense(tier, duration, { value: fee * BigInt(duration) })
            ).to.emit(shield, "CloudDefenseActivated");

            expect(await shield.totalCloudDefenseSubscribers()).to.equal(1);
        });

        it("Should record protected incidents", async function () {
            const tier = PREMIUM_TIER;
            const duration = 3;
            const fee = await shield.tierPremiums(tier);

            const tx = await shield.connect(user1).subscribeCloudDefense(
                tier,
                duration,
                { value: fee * BigInt(duration) }
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "CloudDefenseActivated"
            );
            const serviceId = event.args[0];

            await shield.recordProtectedIncident(serviceId);

            const service = await shield.getCloudDefenseService(serviceId);
            expect(service.incidentsProtected).to.equal(1);
        });
    });

    describe("Admin Functions", function () {
        it("Should update tier premium", async function () {
            const newPremium = ethers.parseEther("0.02");
            await shield.setTierPremium(BASIC_TIER, newPremium);
            
            expect(await shield.tierPremiums(BASIC_TIER)).to.equal(newPremium);
        });

        it("Should pause and unpause contract", async function () {
            await shield.pause();
            
            await expect(
                shield.connect(user1).protectAsset(
                    DIGITAL_NFT,
                    ethers.parseEther("100"),
                    BASIC_TIER,
                    ethers.keccak256(ethers.toUtf8Bytes("test")),
                    1,
                    { value: ethers.parseEther("0.01") }
                )
            ).to.be.revertedWithCustomError(shield, "EnforcedPause");
            
            await shield.unpause();
        });
    });
});
