const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultKeyIntegration", function () {
    let vaultKeyIntegration;
    let owner, treasury, creator, user1, user2;
    
    beforeEach(async function () {
        [owner, treasury, creator, user1, user2] = await ethers.getSigners();
        
        const VaultKeyIntegration = await ethers.getContractFactory("VaultKeyIntegration");
        vaultKeyIntegration = await VaultKeyIntegration.deploy(treasury.address);
        await vaultKeyIntegration.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await vaultKeyIntegration.owner()).to.equal(owner.address);
        });
        
        it("Should set platform treasury", async function () {
            expect(await vaultKeyIntegration.platformTreasury()).to.equal(treasury.address);
        });
        
        it("Should have correct constants", async function () {
            expect(await vaultKeyIntegration.GOD_FLOW_FREQUENCY()).to.equal(999);
            expect(await vaultKeyIntegration.WEALTH_SOVEREIGNTY_FREQUENCY()).to.equal(144000);
            expect(await vaultKeyIntegration.PLATFORM_FEE()).to.equal(250);
        });
    });
    
    describe("VaultKey Creation", function () {
        it("Should create a VaultKey", async function () {
            await expect(
                vaultKeyIntegration.createVaultKey(user1.address, false)
            ).to.emit(vaultKeyIntegration, "VaultKeyCreated");
            
            const vaultKeyId = await vaultKeyIntegration.addressToVaultKey(user1.address);
            expect(vaultKeyId).to.not.equal(ethers.ZeroHash);
        });
        
        it("Should create VaultKey with absolute sovereignty", async function () {
            await vaultKeyIntegration.createVaultKey(user1.address, true);
            
            const vaultKeyId = await vaultKeyIntegration.addressToVaultKey(user1.address);
            const [, status, , hasAbsoluteSovereignty] = await vaultKeyIntegration.getVaultKey(vaultKeyId);
            
            expect(hasAbsoluteSovereignty).to.equal(true);
            expect(status).to.equal(1); // ACTIVE
        });
        
        it("Should not create duplicate VaultKey", async function () {
            await vaultKeyIntegration.createVaultKey(user1.address, false);
            
            await expect(
                vaultKeyIntegration.createVaultKey(user1.address, false)
            ).to.be.revertedWith("VaultKey already exists");
        });
        
        it("Should grant absolute sovereignty to existing VaultKey", async function () {
            await vaultKeyIntegration.createVaultKey(user1.address, false);
            const vaultKeyId = await vaultKeyIntegration.addressToVaultKey(user1.address);
            
            await expect(
                vaultKeyIntegration.grantAbsoluteSovereignty(vaultKeyId)
            ).to.emit(vaultKeyIntegration, "SovereigntyGranted");
            
            const [, status, , hasAbsoluteSovereignty] = await vaultKeyIntegration.getVaultKey(vaultKeyId);
            expect(hasAbsoluteSovereignty).to.equal(true);
            expect(status).to.equal(4); // ETERNAL
        });
    });
    
    describe("Transactions", function () {
        beforeEach(async function () {
            // Create VaultKeys for users
            await vaultKeyIntegration.createVaultKey(user1.address, true);
            await vaultKeyIntegration.createVaultKey(user2.address, false);
        });
        
        it("Should initiate a transaction", async function () {
            const amount = ethers.parseEther("1.0");
            
            await expect(
                vaultKeyIntegration.connect(user1).initiateTransaction(
                    0, // MERCH_PURCHASE
                    user2.address,
                    "Test purchase",
                    { value: amount }
                )
            ).to.emit(vaultKeyIntegration, "TransactionInitiated");
            
            expect(await vaultKeyIntegration.totalTransactions()).to.equal(1);
        });
        
        it("Should calculate platform fee correctly", async function () {
            const amount = ethers.parseEther("1.0");
            
            const txId = await vaultKeyIntegration.connect(user1).initiateTransaction.staticCall(
                0,
                user2.address,
                "Test",
                { value: amount }
            );
            
            await vaultKeyIntegration.connect(user1).initiateTransaction(
                0,
                user2.address,
                "Test",
                { value: amount }
            );
            
            const tx = await vaultKeyIntegration.getTransaction(txId);
            
            // Platform fee = 1.0 * 250 / 10000 = 0.025 ETH
            expect(tx.platformFee).to.equal(ethers.parseEther("0.025"));
        });
        
        it("Should complete transaction and distribute funds", async function () {
            const amount = ethers.parseEther("1.0");
            
            const txId = await vaultKeyIntegration.connect(user1).initiateTransaction.staticCall(
                0,
                user2.address,
                "Test",
                { value: amount }
            );
            
            await vaultKeyIntegration.connect(user1).initiateTransaction(
                0,
                user2.address,
                "Test",
                { value: amount }
            );
            
            const user2BalanceBefore = await ethers.provider.getBalance(user2.address);
            const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);
            
            await vaultKeyIntegration.completeTransaction(txId);
            
            const user2BalanceAfter = await ethers.provider.getBalance(user2.address);
            const treasuryBalanceAfter = await ethers.provider.getBalance(treasury.address);
            
            // User2 should receive amount minus platform fee
            expect(user2BalanceAfter - user2BalanceBefore).to.equal(ethers.parseEther("0.975"));
            
            // Treasury should receive platform fee
            expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(ethers.parseEther("0.025"));
        });
        
        it("Should require VaultKey for transaction", async function () {
            const amount = ethers.parseEther("1.0");
            const noVaultKeyUser = ethers.Wallet.createRandom().connect(ethers.provider);
            
            // Fund the user
            await owner.sendTransaction({
                to: noVaultKeyUser.address,
                value: ethers.parseEther("2.0")
            });
            
            await expect(
                vaultKeyIntegration.connect(noVaultKeyUser).initiateTransaction(
                    0,
                    user2.address,
                    "Test",
                    { value: amount }
                )
            ).to.be.revertedWith("No VaultKey found");
        });
    });
    
    describe("Creator Registration", function () {
        it("Should register as creator", async function () {
            await expect(
                vaultKeyIntegration.connect(creator).registerCreator(1500) // 15% royalty
            ).to.emit(vaultKeyIntegration, "CreatorRegistered");
            
            expect(await vaultKeyIntegration.totalCreators()).to.equal(1);
        });
        
        it("Should create VaultKey during creator registration", async function () {
            await vaultKeyIntegration.connect(creator).registerCreator(1000);
            
            const creatorData = await vaultKeyIntegration.getCreator(creator.address);
            expect(creatorData.isVerified).to.equal(true);
            expect(creatorData.hasAbsoluteSovereignty).to.equal(true);
            expect(creatorData.royaltyRate).to.equal(1000);
        });
        
        it("Should not allow excessive royalty rate", async function () {
            await expect(
                vaultKeyIntegration.connect(creator).registerCreator(6000) // 60%
            ).to.be.revertedWith("Royalty rate too high");
        });
        
        it("Should not register duplicate creator", async function () {
            await vaultKeyIntegration.connect(creator).registerCreator(1000);
            
            await expect(
                vaultKeyIntegration.connect(creator).registerCreator(1500)
            ).to.be.revertedWith("Already registered");
        });
    });
    
    describe("Creator Earnings", function () {
        beforeEach(async function () {
            // Register creator
            await vaultKeyIntegration.connect(creator).registerCreator(1000); // 10% royalty
            
            // Create VaultKey for user
            await vaultKeyIntegration.createVaultKey(user1.address, false);
        });
        
        it("Should accumulate creator earnings from transactions", async function () {
            const amount = ethers.parseEther("1.0");
            
            const txId = await vaultKeyIntegration.connect(user1).initiateTransaction.staticCall(
                1, // DESIGN_COMMISSION
                creator.address,
                "Commission",
                { value: amount }
            );
            
            await vaultKeyIntegration.connect(user1).initiateTransaction(
                1,
                creator.address,
                "Commission",
                { value: amount }
            );
            
            await vaultKeyIntegration.completeTransaction(txId);
            
            const creatorData = await vaultKeyIntegration.getCreator(creator.address);
            
            // Creator royalty = 1.0 * 1000 / 10000 = 0.1 ETH
            expect(creatorData.pendingEarnings).to.equal(ethers.parseEther("0.1"));
            expect(creatorData.totalEarnings).to.equal(ethers.parseEther("0.1"));
        });
        
        it("Should allow creator to withdraw earnings", async function () {
            const amount = ethers.parseEther("1.0");
            
            const txId = await vaultKeyIntegration.connect(user1).initiateTransaction.staticCall(
                1,
                creator.address,
                "Commission",
                { value: amount }
            );
            
            await vaultKeyIntegration.connect(user1).initiateTransaction(
                1,
                creator.address,
                "Commission",
                { value: amount }
            );
            
            await vaultKeyIntegration.completeTransaction(txId);
            
            const balanceBefore = await ethers.provider.getBalance(creator.address);
            
            await expect(
                vaultKeyIntegration.connect(creator).withdrawEarnings()
            ).to.emit(vaultKeyIntegration, "EarningsPaidOut");
            
            const balanceAfter = await ethers.provider.getBalance(creator.address);
            
            // Balance should increase (minus gas)
            expect(balanceAfter).to.be.gt(balanceBefore);
            
            const creatorData = await vaultKeyIntegration.getCreator(creator.address);
            expect(creatorData.pendingEarnings).to.equal(0);
        });
    });
    
    describe("Escrow", function () {
        beforeEach(async function () {
            await vaultKeyIntegration.createVaultKey(user1.address, false);
        });
        
        it("Should create escrow", async function () {
            const amount = ethers.parseEther("1.0");
            const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            
            await expect(
                vaultKeyIntegration.connect(user1).createEscrow(
                    user2.address,
                    futureTime,
                    "Payment for services",
                    { value: amount }
                )
            ).to.emit(vaultKeyIntegration, "EscrowCreated");
            
            expect(await vaultKeyIntegration.totalEscrows()).to.equal(1);
        });
        
        it("Should release escrow after time", async function () {
            const amount = ethers.parseEther("1.0");
            const releaseTime = Math.floor(Date.now() / 1000) + 10; // 10 seconds
            
            const escrowId = await vaultKeyIntegration.connect(user1).createEscrow.staticCall(
                user2.address,
                releaseTime,
                "Test escrow",
                { value: amount }
            );
            
            await vaultKeyIntegration.connect(user1).createEscrow(
                user2.address,
                releaseTime,
                "Test escrow",
                { value: amount }
            );
            
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [11]);
            await ethers.provider.send("evm_mine");
            
            const balanceBefore = await ethers.provider.getBalance(user2.address);
            
            await expect(
                vaultKeyIntegration.connect(user1).releaseEscrow(escrowId)
            ).to.emit(vaultKeyIntegration, "EscrowReleased");
            
            const balanceAfter = await ethers.provider.getBalance(user2.address);
            expect(balanceAfter - balanceBefore).to.equal(amount);
        });
        
        it("Should not release escrow before time", async function () {
            const amount = ethers.parseEther("1.0");
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            
            const escrowId = await vaultKeyIntegration.connect(user1).createEscrow.staticCall(
                user2.address,
                futureTime,
                "Test escrow",
                { value: amount }
            );
            
            await vaultKeyIntegration.connect(user1).createEscrow(
                user2.address,
                futureTime,
                "Test escrow",
                { value: amount }
            );
            
            await expect(
                vaultKeyIntegration.connect(user1).releaseEscrow(escrowId)
            ).to.be.revertedWith("Release time not reached");
        });
    });
    
    describe("View Functions", function () {
        it("Should return VaultKey for address", async function () {
            await vaultKeyIntegration.createVaultKey(user1.address, true);
            
            const vaultKeyId = await vaultKeyIntegration.getVaultKeyForAddress(user1.address);
            expect(vaultKeyId).to.not.equal(ethers.ZeroHash);
        });
        
        it("Should return transaction details", async function () {
            await vaultKeyIntegration.createVaultKey(user1.address, false);
            
            const amount = ethers.parseEther("1.0");
            const txId = await vaultKeyIntegration.connect(user1).initiateTransaction.staticCall(
                0,
                user2.address,
                "Test",
                { value: amount }
            );
            
            await vaultKeyIntegration.connect(user1).initiateTransaction(
                0,
                user2.address,
                "Test",
                { value: amount }
            );
            
            const tx = await vaultKeyIntegration.getTransaction(txId);
            expect(tx.sender).to.equal(user1.address);
            expect(tx.recipient).to.equal(user2.address);
            expect(tx.amount).to.equal(amount);
        });
    });
    
    describe("Admin Functions", function () {
        it("Should update platform treasury", async function () {
            const newTreasury = user1.address;
            
            await vaultKeyIntegration.updatePlatformTreasury(newTreasury);
            expect(await vaultKeyIntegration.platformTreasury()).to.equal(newTreasury);
        });
        
        it("Should not allow non-owner to update treasury", async function () {
            await expect(
                vaultKeyIntegration.connect(user1).updatePlatformTreasury(user2.address)
            ).to.be.revertedWithCustomError(vaultKeyIntegration, "OwnableUnauthorizedAccount");
        });
    });
});
