/**
 * @title OmniSovereignWallet Tests
 * @dev Test suite for OmniSovereignWallet contract
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OmniSovereignWallet", function () {
    let OmniSovereignWallet;
    let wallet;
    let owner;
    let user1;
    let user2;
    let treasuryVault;

    const HEALING_FREQUENCY_528HZ = 528;
    const PINEAL_FREQUENCY_963HZ = 963;
    const COSMIC_FREQUENCY_144KHZ = 144000;

    beforeEach(async function () {
        [owner, user1, user2, treasuryVault] = await ethers.getSigners();

        OmniSovereignWallet = await ethers.getContractFactory("OmniSovereignWallet");
        wallet = await OmniSovereignWallet.deploy(treasuryVault.address);
        await wallet.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct treasury vault", async function () {
            expect(await wallet.treasuryVault()).to.equal(treasuryVault.address);
        });

        it("Should grant admin roles to deployer", async function () {
            const DEFAULT_ADMIN_ROLE = await wallet.DEFAULT_ADMIN_ROLE();
            const WALLET_ADMIN_ROLE = await wallet.WALLET_ADMIN_ROLE();
            
            expect(await wallet.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
            expect(await wallet.hasRole(WALLET_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should initialize with zero registered wallets", async function () {
            expect(await wallet.totalRegisteredWallets()).to.equal(0);
        });
    });

    describe("Wallet Registration", function () {
        it("Should register a new mobile wallet", async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            
            const profile = await wallet.getWalletProfile(user1.address);
            expect(profile.walletAddress).to.equal(user1.address);
            expect(profile.frequencyAlignment).to.equal(HEALING_FREQUENCY_528HZ);
            expect(profile.isMobileEnabled).to.be.true;
            expect(profile.isVerified).to.be.false;
        });

        it("Should emit WalletRegistered event", async function () {
            await expect(wallet.connect(user1).registerWallet(PINEAL_FREQUENCY_963HZ, true))
                .to.emit(wallet, "WalletRegistered");
        });

        it("Should reject invalid frequency alignment", async function () {
            await expect(
                wallet.connect(user1).registerWallet(999, true)
            ).to.be.revertedWith("Invalid frequency alignment");
        });

        it("Should reject duplicate registration", async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            
            await expect(
                wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true)
            ).to.be.revertedWith("Wallet already registered");
        });

        it("Should increment total registered wallets", async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            expect(await wallet.totalRegisteredWallets()).to.equal(1);
            
            await wallet.connect(user2).registerWallet(COSMIC_FREQUENCY_144KHZ, false);
            expect(await wallet.totalRegisteredWallets()).to.equal(2);
        });
    });

    describe("Shahada Identity Verification", function () {
        beforeEach(async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
        });

        it("Should verify identity by authorized verifier", async function () {
            const shahadaProof = ethers.keccak256(ethers.toUtf8Bytes("La ilaha illallah"));
            
            await wallet.verifyShahadaIdentity(user1.address, shahadaProof);
            
            const profile = await wallet.getWalletProfile(user1.address);
            expect(profile.isVerified).to.be.true;
        });

        it("Should emit ShahadaVerified event", async function () {
            const shahadaProof = ethers.keccak256(ethers.toUtf8Bytes("La ilaha illallah"));
            
            await expect(wallet.verifyShahadaIdentity(user1.address, shahadaProof))
                .to.emit(wallet, "ShahadaVerified");
        });

        it("Should allow self-verification", async function () {
            const shahadaDeclaration = ethers.keccak256(ethers.toUtf8Bytes("Shahada declaration"));
            
            await wallet.connect(user1).selfVerifyShadaha(shahadaDeclaration);
            
            expect(await wallet.isWalletVerified(user1.address)).to.be.true;
        });

        it("Should reject duplicate proof usage", async function () {
            const shahadaProof = ethers.keccak256(ethers.toUtf8Bytes("La ilaha illallah"));
            
            await wallet.verifyShahadaIdentity(user1.address, shahadaProof);
            
            // Try to use same proof for another user
            await wallet.connect(user2).registerWallet(HEALING_FREQUENCY_528HZ, true);
            
            await expect(
                wallet.verifyShahadaIdentity(user2.address, shahadaProof)
            ).to.be.revertedWith("Proof already used");
        });
    });

    describe("Mobile Session Management", function () {
        beforeEach(async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            const shahadaDeclaration = ethers.keccak256(ethers.toUtf8Bytes("Shahada"));
            await wallet.connect(user1).selfVerifyShadaha(shahadaDeclaration);
        });

        it("Should create mobile session for verified wallet", async function () {
            const tx = await wallet.connect(user1).createMobileSession();
            await expect(tx).to.emit(wallet, "MobileSessionCreated");
        });

        it("Should reject session creation for non-mobile wallets", async function () {
            await wallet.connect(user2).registerWallet(HEALING_FREQUENCY_528HZ, false);
            const shahadaDeclaration = ethers.keccak256(ethers.toUtf8Bytes("Shahada2"));
            await wallet.connect(user2).selfVerifyShadaha(shahadaDeclaration);
            
            await expect(
                wallet.connect(user2).createMobileSession()
            ).to.be.revertedWith("Mobile not enabled");
        });
    });

    describe("DAO Governance", function () {
        it("Should create governance proposal", async function () {
            await expect(
                wallet.createProposal("Test Proposal", 0) // ROYALTY_ADJUSTMENT
            ).to.emit(wallet, "ProposalCreated");
            
            expect(await wallet.proposalCount()).to.equal(1);
        });

        it("Should allow verified users to vote", async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            const shahadaDeclaration = ethers.keccak256(ethers.toUtf8Bytes("Shahada"));
            await wallet.connect(user1).selfVerifyShadaha(shahadaDeclaration);
            
            await wallet.createProposal("Test Proposal", 0);
            
            await expect(wallet.connect(user1).vote(1, true))
                .to.emit(wallet, "VoteCast");
        });

        it("Should reject voting from unverified wallets", async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            await wallet.createProposal("Test Proposal", 0);
            
            await expect(
                wallet.connect(user1).vote(1, true)
            ).to.be.revertedWith("Identity not verified");
        });
    });

    describe("Token Operations", function () {
        beforeEach(async function () {
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            const shahadaDeclaration = ethers.keccak256(ethers.toUtf8Bytes("Shahada"));
            await wallet.connect(user1).selfVerifyShadaha(shahadaDeclaration);
        });

        it("Should deposit CODEX tokens", async function () {
            await wallet.connect(user1).depositCodex(ethers.parseEther("1000"));
            
            const profile = await wallet.getWalletProfile(user1.address);
            expect(profile.codexBalance).to.equal(ethers.parseEther("1000"));
        });

        it("Should deposit BlessingCoin tokens", async function () {
            await wallet.connect(user1).depositBlessingCoin(ethers.parseEther("500"));
            
            const profile = await wallet.getWalletProfile(user1.address);
            expect(profile.blessingCoinBalance).to.equal(ethers.parseEther("500"));
        });

        it("Should deposit PeaceCoin tokens", async function () {
            await wallet.connect(user1).depositPeaceCoin(ethers.parseEther("2000"));
            
            const profile = await wallet.getWalletProfile(user1.address);
            expect(profile.peaceCoinBalance).to.equal(ethers.parseEther("2000"));
        });
    });

    describe("Admin Functions", function () {
        it("Should update voting period", async function () {
            const newPeriod = 14 * 24 * 60 * 60; // 14 days
            await wallet.setVotingPeriod(newPeriod);
            
            expect(await wallet.votingPeriod()).to.equal(newPeriod);
        });

        it("Should update session duration", async function () {
            const newDuration = 48 * 60 * 60; // 48 hours
            await wallet.setSessionDuration(newDuration);
            
            expect(await wallet.sessionDuration()).to.equal(newDuration);
        });

        it("Should pause and unpause contract", async function () {
            await wallet.pause();
            
            await expect(
                wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true)
            ).to.be.revertedWithCustomError(wallet, "EnforcedPause");
            
            await wallet.unpause();
            
            await wallet.connect(user1).registerWallet(HEALING_FREQUENCY_528HZ, true);
            expect(await wallet.totalRegisteredWallets()).to.equal(1);
        });
    });
});
