/**
 * @title PeaceCoin Tests
 * @dev Test suite for PeaceCoin contract
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PeaceCoin", function () {
    let PeaceCoin;
    let peace;
    let owner;
    let user1;
    let user2;
    let feeCollector;

    const INITIAL_MINT = ethers.parseEther("1000000000"); // 1 billion
    const MOBILE_TX_LIMIT = ethers.parseEther("10000");

    beforeEach(async function () {
        [owner, user1, user2, feeCollector] = await ethers.getSigners();

        PeaceCoin = await ethers.getContractFactory("PeaceCoin");
        peace = await PeaceCoin.deploy(feeCollector.address);
        await peace.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should have correct name and symbol", async function () {
            expect(await peace.name()).to.equal("Peace Coin");
            expect(await peace.symbol()).to.equal("PEACE");
        });

        it("Should mint initial supply to deployer", async function () {
            expect(await peace.balanceOf(owner.address)).to.equal(INITIAL_MINT);
        });

        it("Should set correct fee collector", async function () {
            expect(await peace.feeCollector()).to.equal(feeCollector.address);
        });

        it("Should set default transfer fee", async function () {
            expect(await peace.transferFeeBps()).to.equal(50); // 0.5%
        });
    });

    describe("Mobile Wallet Registration", function () {
        it("Should register a mobile wallet", async function () {
            const dailyLimit = ethers.parseEther("5000");
            
            await expect(peace.connect(user1).registerMobileWallet(dailyLimit))
                .to.emit(peace, "MobileWalletRegistered");
            
            const config = await peace.getMobileWalletConfig(user1.address);
            expect(config.isRegistered).to.be.true;
            expect(config.dailyLimit).to.equal(dailyLimit);
        });

        it("Should cap daily limit at mobile tx limit", async function () {
            const excessiveLimit = ethers.parseEther("50000"); // Above 10,000 limit
            
            await peace.connect(user1).registerMobileWallet(excessiveLimit);
            
            const config = await peace.getMobileWalletConfig(user1.address);
            expect(config.dailyLimit).to.equal(MOBILE_TX_LIMIT);
        });

        it("Should reject duplicate registration", async function () {
            await peace.connect(user1).registerMobileWallet(ethers.parseEther("1000"));
            
            await expect(
                peace.connect(user1).registerMobileWallet(ethers.parseEther("2000"))
            ).to.be.revertedWith("Already registered");
        });

        it("Should set frequency alignment to 777Hz", async function () {
            await peace.connect(user1).registerMobileWallet(ethers.parseEther("1000"));
            
            const config = await peace.getMobileWalletConfig(user1.address);
            expect(config.frequencyAlignment).to.equal(777);
        });
    });

    describe("Mobile Wallet Verification", function () {
        beforeEach(async function () {
            await peace.connect(user1).registerMobileWallet(ethers.parseEther("5000"));
        });

        it("Should verify mobile wallet by admin", async function () {
            await expect(peace.verifyMobileWallet(user1.address))
                .to.emit(peace, "MobileWalletVerified");
            
            const config = await peace.getMobileWalletConfig(user1.address);
            expect(config.isVerified).to.be.true;
        });

        it("Should reject verification of unregistered wallet", async function () {
            await expect(
                peace.verifyMobileWallet(user2.address)
            ).to.be.revertedWith("Not registered");
        });

        it("Should reject duplicate verification", async function () {
            await peace.verifyMobileWallet(user1.address);
            
            await expect(
                peace.verifyMobileWallet(user1.address)
            ).to.be.revertedWith("Already verified");
        });
    });

    describe("Mobile Transfer", function () {
        beforeEach(async function () {
            await peace.connect(user1).registerMobileWallet(ethers.parseEther("5000"));
            await peace.verifyMobileWallet(user1.address);
            await peace.transfer(user1.address, ethers.parseEther("10000"));
        });

        it("Should execute mobile transfer with fee", async function () {
            const amount = ethers.parseEther("1000");
            const fee = amount * 50n / 10000n; // 0.5%
            const transferAmount = amount - fee;
            
            await expect(peace.connect(user1).mobileTransfer(user2.address, amount))
                .to.emit(peace, "MobileTransferExecuted");
            
            expect(await peace.balanceOf(user2.address)).to.equal(transferAmount);
            expect(await peace.balanceOf(feeCollector.address)).to.equal(fee);
        });

        it("Should track daily spending", async function () {
            await peace.connect(user1).mobileTransfer(user2.address, ethers.parseEther("1000"));
            
            const config = await peace.getMobileWalletConfig(user1.address);
            expect(config.dailySpent).to.equal(ethers.parseEther("1000"));
        });

        it("Should reject transfer exceeding daily limit", async function () {
            await peace.connect(user1).mobileTransfer(user2.address, ethers.parseEther("4000"));
            
            await expect(
                peace.connect(user1).mobileTransfer(user2.address, ethers.parseEther("2000"))
            ).to.be.revertedWith("Daily limit exceeded");
        });

        it("Should reject transfer from unverified wallet", async function () {
            await peace.connect(user2).registerMobileWallet(ethers.parseEther("1000"));
            await peace.transfer(user2.address, ethers.parseEther("1000"));
            
            await expect(
                peace.connect(user2).mobileTransfer(user1.address, ethers.parseEther("100"))
            ).to.be.revertedWith("Mobile wallet not verified");
        });

        it("Should reject transfer exceeding mobile tx limit", async function () {
            await expect(
                peace.connect(user1).mobileTransfer(user2.address, ethers.parseEther("15000"))
            ).to.be.revertedWith("Exceeds mobile transaction limit");
        });
    });

    describe("Cross-Chain Bridge", function () {
        it("Should configure a bridge", async function () {
            const chainName = "Polygon";
            const bridgeAddress = user2.address;
            const dailyLimit = ethers.parseEther("1000000");
            
            await expect(peace.configureBridge(chainName, bridgeAddress, dailyLimit))
                .to.emit(peace, "BridgeConfigured");
            
            const bridge = await peace.getBridge(chainName);
            expect(bridge.isActive).to.be.true;
            expect(bridge.bridgeAddress).to.equal(bridgeAddress);
        });

        it("Should bridge tokens (burn)", async function () {
            await peace.configureBridge("Polygon", user2.address, ethers.parseEther("1000000"));
            await peace.transfer(user1.address, ethers.parseEther("10000"));
            
            const balanceBefore = await peace.balanceOf(user1.address);
            
            await expect(peace.connect(user1).bridgeTokens("Polygon", ethers.parseEther("5000")))
                .to.emit(peace, "TokensBridged");
            
            const balanceAfter = await peace.balanceOf(user1.address);
            expect(balanceBefore - balanceAfter).to.equal(ethers.parseEther("5000"));
        });

        it("Should mint from bridge", async function () {
            await peace.configureBridge("Polygon", user2.address, ethers.parseEther("1000000"));
            
            const balanceBefore = await peace.balanceOf(user1.address);
            
            // Bridge contract (user2) mints tokens
            await peace.connect(user2).mintFromBridge(user1.address, "Polygon", ethers.parseEther("5000"));
            
            const balanceAfter = await peace.balanceOf(user1.address);
            expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("5000"));
        });
    });

    describe("Minting", function () {
        it("Should mint tokens by minter", async function () {
            const mintAmount = ethers.parseEther("1000000");
            
            await peace.mint(user1.address, mintAmount);
            
            expect(await peace.balanceOf(user1.address)).to.equal(mintAmount);
        });

        it("Should respect daily mint limit", async function () {
            const dailyLimit = ethers.parseEther("100000000"); // 100M
            
            // Mint up to daily limit
            await peace.mint(user1.address, dailyLimit);
            
            // Try to mint more should fail
            await expect(
                peace.mint(user2.address, ethers.parseEther("1"))
            ).to.be.revertedWith("Daily mint limit exceeded");
        });

        it("Should reset daily limit on new day", async function () {
            await peace.mint(user1.address, ethers.parseEther("50000000"));
            
            // Fast forward 1 day
            await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine");
            
            // Should be able to mint again
            await peace.mint(user2.address, ethers.parseEther("50000000"));
        });

        it("Should report remaining daily mint", async function () {
            await peace.mint(user1.address, ethers.parseEther("10000000"));
            
            const remaining = await peace.getRemainingDailyMint();
            expect(remaining).to.equal(ethers.parseEther("90000000")); // 100M - 10M
        });
    });

    describe("Fee Management", function () {
        it("Should update transfer fee", async function () {
            const newFee = 100; // 1%
            
            await expect(peace.setTransferFee(newFee))
                .to.emit(peace, "FeeUpdated");
            
            expect(await peace.transferFeeBps()).to.equal(newFee);
        });

        it("Should reject fee above maximum", async function () {
            await expect(
                peace.setTransferFee(600) // 6%, above 5% max
            ).to.be.revertedWith("Fee too high");
        });

        it("Should update fee collector", async function () {
            await peace.setFeeCollector(user2.address);
            expect(await peace.feeCollector()).to.equal(user2.address);
        });

        it("Should track total fees collected", async function () {
            await peace.connect(user1).registerMobileWallet(ethers.parseEther("5000"));
            await peace.verifyMobileWallet(user1.address);
            await peace.transfer(user1.address, ethers.parseEther("10000"));
            
            await peace.connect(user1).mobileTransfer(user2.address, ethers.parseEther("1000"));
            
            expect(await peace.totalFeesCollected()).to.equal(ethers.parseEther("5")); // 0.5% of 1000
        });
    });

    describe("Admin Functions", function () {
        it("Should pause and unpause contract", async function () {
            await peace.pause();
            
            await expect(
                peace.connect(user1).registerMobileWallet(ethers.parseEther("1000"))
            ).to.be.revertedWithCustomError(peace, "EnforcedPause");
            
            await peace.unpause();
            
            await peace.connect(user1).registerMobileWallet(ethers.parseEther("1000"));
        });

        it("Should get registered mobile wallets", async function () {
            await peace.connect(user1).registerMobileWallet(ethers.parseEther("1000"));
            await peace.connect(user2).registerMobileWallet(ethers.parseEther("2000"));
            
            const wallets = await peace.getRegisteredMobileWallets();
            expect(wallets.length).to.equal(2);
            expect(wallets).to.include(user1.address);
            expect(wallets).to.include(user2.address);
        });

        it("Should get bridge chains", async function () {
            await peace.configureBridge("Polygon", user1.address, ethers.parseEther("1000000"));
            await peace.configureBridge("Arbitrum", user2.address, ethers.parseEther("500000"));
            
            const chains = await peace.getBridgeChains();
            expect(chains.length).to.equal(2);
            expect(chains).to.include("Polygon");
            expect(chains).to.include("Arbitrum");
        });
    });
});
