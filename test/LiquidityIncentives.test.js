const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * LiquidityIncentives Contract Test Suite
 * 
 * Tests for liquidity mining incentive functionality
 * Frequencies: 528Hz + 963Hz + 888Hz + 777Hz
 */

describe("LiquidityIncentives", function () {
    let incentives;
    let rewardToken;
    let lpToken;
    let owner;
    let sabirAllahFund;
    let user1;
    let user2;

    const REWARD_PER_BLOCK = ethers.parseEther("1");

    beforeEach(async function () {
        [owner, sabirAllahFund, user1, user2] = await ethers.getSigners();

        // Deploy mock tokens for testing
        const MockToken = await ethers.getContractFactory("NoorToken");
        rewardToken = await MockToken.deploy(owner.address, owner.address);
        await rewardToken.waitForDeployment();

        lpToken = await MockToken.deploy(owner.address, owner.address);
        await lpToken.waitForDeployment();

        // Deploy LiquidityIncentives
        const LiquidityIncentives = await ethers.getContractFactory("LiquidityIncentives");
        incentives = await LiquidityIncentives.deploy(
            sabirAllahFund.address,
            ethers.ZeroAddress, // No citizen registry
            REWARD_PER_BLOCK,
            0 // Start from current block
        );
        await incentives.waitForDeployment();

        // Transfer some LP tokens to users
        await lpToken.transfer(user1.address, ethers.parseEther("10000"));
        await lpToken.transfer(user2.address, ethers.parseEther("10000"));
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await incentives.owner()).to.equal(owner.address);
        });

        it("Should set the correct Sabir Allah Honor Fund", async function () {
            expect(await incentives.sabirAllahHonorFund()).to.equal(sabirAllahFund.address);
        });

        it("Should set the correct reward per block", async function () {
            expect(await incentives.rewardPerBlock()).to.equal(REWARD_PER_BLOCK);
        });

        it("Should have correct zakat percentage", async function () {
            expect(await incentives.ZAKAT_PERCENTAGE()).to.equal(777);
        });

        it("Should have correct basis points", async function () {
            expect(await incentives.BASIS_POINTS()).to.equal(10000);
        });

        it("Should have correct frequency constants", async function () {
            expect(await incentives.FREQUENCY_528HZ()).to.equal(528);
            expect(await incentives.FREQUENCY_963HZ()).to.equal(963);
            expect(await incentives.FREQUENCY_888HZ()).to.equal(888);
            expect(await incentives.FREQUENCY_777HZ()).to.equal(777);
        });

        it("Should return correct resonance signature", async function () {
            const resonance = await incentives.getResonanceSignature();
            expect(resonance).to.equal(528 + 963 + 888 + 777);
        });

        it("Should start with zero pools", async function () {
            expect(await incentives.poolLength()).to.equal(0);
        });
    });

    describe("Pool Management", function () {
        it("Should allow owner to add a pool", async function () {
            await expect(
                incentives.addPool(lpToken.target, rewardToken.target, 1000)
            ).to.emit(incentives, "PoolAdded")
                .withArgs(0, lpToken.target, rewardToken.target, 1000);

            expect(await incentives.poolLength()).to.equal(1);
        });

        it("Should revert when non-owner tries to add pool", async function () {
            await expect(
                incentives.connect(user1).addPool(lpToken.target, rewardToken.target, 1000)
            ).to.be.reverted;
        });

        it("Should revert when adding pool with zero address", async function () {
            await expect(
                incentives.addPool(ethers.ZeroAddress, rewardToken.target, 1000)
            ).to.be.revertedWithCustomError(incentives, "InvalidAddress");
        });

        it("Should allow owner to set pool allocation points", async function () {
            await incentives.addPool(lpToken.target, rewardToken.target, 1000);
            await incentives.setPoolAllocPoint(0, 2000);

            const poolInfo = await incentives.getPoolInfo(0);
            expect(poolInfo.allocPoint).to.equal(2000);
        });

        it("Should allow owner to deactivate pool", async function () {
            await incentives.addPool(lpToken.target, rewardToken.target, 1000);
            await incentives.setPoolActive(0, false);

            const poolInfo = await incentives.getPoolInfo(0);
            expect(poolInfo.isActive).to.be.false;
        });
    });

    describe("Staking", function () {
        beforeEach(async function () {
            // Add a pool
            await incentives.addPool(lpToken.target, rewardToken.target, 1000);
        });

        it("Should allow user to stake LP tokens", async function () {
            const stakeAmount = ethers.parseEther("1000");
            
            await lpToken.connect(user1).approve(incentives.target, stakeAmount);
            
            await expect(
                incentives.connect(user1).stake(0, stakeAmount, 1) // Tier 1
            ).to.emit(incentives, "Staked");

            const userInfo = await incentives.getUserInfo(0, user1.address);
            expect(userInfo.amount).to.equal(stakeAmount);
            expect(userInfo.lockTier).to.equal(1);
        });

        it("Should revert when staking zero amount", async function () {
            await expect(
                incentives.connect(user1).stake(0, 0, 1)
            ).to.be.revertedWithCustomError(incentives, "InvalidAmount");
        });

        it("Should revert when staking to invalid pool", async function () {
            const stakeAmount = ethers.parseEther("1000");
            await lpToken.connect(user1).approve(incentives.target, stakeAmount);

            await expect(
                incentives.connect(user1).stake(999, stakeAmount, 1)
            ).to.be.revertedWithCustomError(incentives, "InvalidPool");
        });

        it("Should revert when staking to inactive pool", async function () {
            await incentives.setPoolActive(0, false);

            const stakeAmount = ethers.parseEther("1000");
            await lpToken.connect(user1).approve(incentives.target, stakeAmount);

            await expect(
                incentives.connect(user1).stake(0, stakeAmount, 1)
            ).to.be.revertedWithCustomError(incentives, "PoolNotActive");
        });
    });

    describe("Unstaking", function () {
        beforeEach(async function () {
            // Add a pool and stake
            await incentives.addPool(lpToken.target, rewardToken.target, 1000);
            
            const stakeAmount = ethers.parseEther("1000");
            await lpToken.connect(user1).approve(incentives.target, stakeAmount);
            await incentives.connect(user1).stake(0, stakeAmount, 0); // Tier 0 = no lock
        });

        it("Should allow user to unstake after lock expires", async function () {
            const unstakeAmount = ethers.parseEther("500");

            await expect(
                incentives.connect(user1).unstake(0, unstakeAmount)
            ).to.emit(incentives, "Unstaked")
                .withArgs(user1.address, 0, unstakeAmount);

            const userInfo = await incentives.getUserInfo(0, user1.address);
            expect(userInfo.amount).to.equal(ethers.parseEther("500"));
        });

        it("Should revert when unstaking more than staked", async function () {
            const unstakeAmount = ethers.parseEther("2000");

            await expect(
                incentives.connect(user1).unstake(0, unstakeAmount)
            ).to.be.revertedWithCustomError(incentives, "InsufficientBalance");
        });

        it("Should revert when unstaking zero amount", async function () {
            await expect(
                incentives.connect(user1).unstake(0, 0)
            ).to.be.revertedWithCustomError(incentives, "InvalidAmount");
        });
    });

    describe("Emergency Withdraw", function () {
        beforeEach(async function () {
            await incentives.addPool(lpToken.target, rewardToken.target, 1000);
            
            const stakeAmount = ethers.parseEther("1000");
            await lpToken.connect(user1).approve(incentives.target, stakeAmount);
            await incentives.connect(user1).stake(0, stakeAmount, 5); // Tier 5 = 1 year lock
        });

        it("Should allow emergency withdraw ignoring lock", async function () {
            await expect(
                incentives.connect(user1).emergencyWithdraw(0)
            ).to.emit(incentives, "EmergencyWithdraw")
                .withArgs(user1.address, 0, ethers.parseEther("1000"));

            const userInfo = await incentives.getUserInfo(0, user1.address);
            expect(userInfo.amount).to.equal(0);
        });

        it("Should reset user info after emergency withdraw", async function () {
            await incentives.connect(user1).emergencyWithdraw(0);

            const userInfo = await incentives.getUserInfo(0, user1.address);
            expect(userInfo.amount).to.equal(0);
            expect(userInfo.rewardDebt).to.equal(0);
            expect(userInfo.pendingRewards).to.equal(0);
            expect(userInfo.lockEndTime).to.equal(0);
            expect(userInfo.lockTier).to.equal(0);
        });
    });

    describe("Tier Info", function () {
        it("Should return correct tier 1 info", async function () {
            const [duration, multiplier] = await incentives.getTierInfo(1);
            expect(duration).to.equal(7 * 24 * 60 * 60); // 7 days
            expect(multiplier).to.equal(10000); // 1.0x
        });

        it("Should return correct tier 2 info", async function () {
            const [duration, multiplier] = await incentives.getTierInfo(2);
            expect(duration).to.equal(30 * 24 * 60 * 60); // 30 days
            expect(multiplier).to.equal(15000); // 1.5x
        });

        it("Should return correct tier 3 info", async function () {
            const [duration, multiplier] = await incentives.getTierInfo(3);
            expect(duration).to.equal(90 * 24 * 60 * 60); // 90 days
            expect(multiplier).to.equal(20000); // 2.0x
        });

        it("Should return correct tier 4 info", async function () {
            const [duration, multiplier] = await incentives.getTierInfo(4);
            expect(duration).to.equal(180 * 24 * 60 * 60); // 180 days
            expect(multiplier).to.equal(25000); // 2.5x
        });

        it("Should return correct tier 5 info", async function () {
            const [duration, multiplier] = await incentives.getTierInfo(5);
            expect(duration).to.equal(365 * 24 * 60 * 60); // 365 days
            expect(multiplier).to.equal(30000); // 3.0x
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update Sabir Allah Fund", async function () {
            await incentives.updateSabirAllahFund(user2.address);
            expect(await incentives.sabirAllahHonorFund()).to.equal(user2.address);
        });

        it("Should revert when setting zero address for Sabir Allah Fund", async function () {
            await expect(
                incentives.updateSabirAllahFund(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(incentives, "InvalidAddress");
        });

        it("Should allow owner to update reward per block", async function () {
            const newReward = ethers.parseEther("2");
            await incentives.setRewardPerBlock(newReward);
            expect(await incentives.rewardPerBlock()).to.equal(newReward);
        });

        it("Should allow owner to pause", async function () {
            await incentives.pause();
            expect(await incentives.paused()).to.be.true;
        });

        it("Should allow owner to unpause", async function () {
            await incentives.pause();
            await incentives.unpause();
            expect(await incentives.paused()).to.be.false;
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await incentives.addPool(lpToken.target, rewardToken.target, 1000);
        });

        it("Should return correct pool info", async function () {
            const poolInfo = await incentives.getPoolInfo(0);
            expect(poolInfo.lpToken).to.equal(lpToken.target);
            expect(poolInfo.rewardToken).to.equal(rewardToken.target);
            expect(poolInfo.allocPoint).to.equal(1000);
            expect(poolInfo.isActive).to.be.true;
        });

        it("Should return zero pending reward for non-staker", async function () {
            const pending = await incentives.pendingReward(0, user1.address);
            expect(pending).to.equal(0);
        });
    });
});
