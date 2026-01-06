/**
 * @title CodexToken Tests
 * @dev Test suite for CodexToken contract
 * @author Supreme King Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CodexToken", function () {
    let CodexToken;
    let codex;
    let owner;
    let user1;
    let user2;
    let creatorVault;
    let daoTreasury;
    let stakingRewardsVault;
    let royaltyPool;

    const INITIAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion
    const MIN_STAKE_AMOUNT = ethers.parseEther("1000");

    beforeEach(async function () {
        [owner, user1, user2, creatorVault, daoTreasury, stakingRewardsVault, royaltyPool] = await ethers.getSigners();

        CodexToken = await ethers.getContractFactory("CodexToken");
        codex = await CodexToken.deploy(
            creatorVault.address,
            daoTreasury.address,
            stakingRewardsVault.address,
            royaltyPool.address
        );
        await codex.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should have correct name and symbol", async function () {
            expect(await codex.name()).to.equal("Codex Token");
            expect(await codex.symbol()).to.equal("CODEX");
        });

        it("Should mint initial supply", async function () {
            const totalSupply = await codex.totalSupply();
            expect(totalSupply).to.equal(INITIAL_SUPPLY);
        });

        it("Should set correct vault addresses", async function () {
            expect(await codex.creatorVault()).to.equal(creatorVault.address);
            expect(await codex.daoTreasury()).to.equal(daoTreasury.address);
            expect(await codex.stakingRewardsVault()).to.equal(stakingRewardsVault.address);
            expect(await codex.royaltyPool()).to.equal(royaltyPool.address);
        });

        it("Should allocate tokens to vaults correctly", async function () {
            const royaltyPoolBalance = await codex.balanceOf(royaltyPool.address);
            const daoTreasuryBalance = await codex.balanceOf(daoTreasury.address);
            const stakingVaultBalance = await codex.balanceOf(stakingRewardsVault.address);

            expect(royaltyPoolBalance).to.equal(ethers.parseEther("100000000")); // 100M
            expect(daoTreasuryBalance).to.equal(ethers.parseEther("200000000")); // 200M
            expect(stakingVaultBalance).to.equal(ethers.parseEther("150000000")); // 150M
        });
    });

    describe("Staking", function () {
        beforeEach(async function () {
            // Transfer tokens to user1 for staking
            await codex.transfer(user1.address, ethers.parseEther("10000"));
        });

        it("Should stake tokens", async function () {
            const stakeAmount = ethers.parseEther("5000");
            
            await codex.connect(user1).stake(stakeAmount);
            
            const stakeInfo = await codex.getStakeInfo(user1.address);
            expect(stakeInfo.amount).to.equal(stakeAmount);
            expect(stakeInfo.isActive).to.be.true;
        });

        it("Should emit TokensStaked event", async function () {
            const stakeAmount = ethers.parseEther("2000");
            
            await expect(codex.connect(user1).stake(stakeAmount))
                .to.emit(codex, "TokensStaked");
        });

        it("Should reject stake below minimum", async function () {
            const lowAmount = ethers.parseEther("100"); // Below 1000 minimum
            
            await expect(
                codex.connect(user1).stake(lowAmount)
            ).to.be.revertedWith("Below minimum stake amount");
        });

        it("Should update governance weight on stake", async function () {
            const stakeAmount = ethers.parseEther("5000");
            
            await codex.connect(user1).stake(stakeAmount);
            
            const weight = await codex.getVotingWeight(user1.address);
            expect(weight).to.be.gt(0);
        });

        it("Should track total staked", async function () {
            await codex.connect(user1).stake(ethers.parseEther("3000"));
            
            expect(await codex.totalStaked()).to.equal(ethers.parseEther("3000"));
        });

        it("Should allow additional staking", async function () {
            await codex.connect(user1).stake(ethers.parseEther("2000"));
            await codex.connect(user1).stake(ethers.parseEther("1500"));
            
            const stakeInfo = await codex.getStakeInfo(user1.address);
            expect(stakeInfo.amount).to.equal(ethers.parseEther("3500"));
        });
    });

    describe("Unstaking", function () {
        beforeEach(async function () {
            await codex.transfer(user1.address, ethers.parseEther("10000"));
            await codex.connect(user1).stake(ethers.parseEther("5000"));
        });

        it("Should reject unstake during lock period", async function () {
            await expect(
                codex.connect(user1).unstake(ethers.parseEther("1000"))
            ).to.be.revertedWith("Still in lock period");
        });

        it("Should allow unstake after lock period", async function () {
            // Fast forward 30 days
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine");
            
            const balanceBefore = await codex.balanceOf(user1.address);
            await codex.connect(user1).unstake(ethers.parseEther("2000"));
            const balanceAfter = await codex.balanceOf(user1.address);
            
            expect(balanceAfter - balanceBefore).to.be.gte(ethers.parseEther("2000"));
        });
    });

    describe("Staking Rewards", function () {
        beforeEach(async function () {
            await codex.transfer(user1.address, ethers.parseEther("10000"));
            await codex.connect(user1).stake(ethers.parseEther("5000"));
        });

        it("Should calculate pending rewards", async function () {
            // Fast forward 1 day
            await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
            await ethers.provider.send("evm_mine");
            
            const pendingRewards = await codex.calculatePendingRewards(user1.address);
            expect(pendingRewards).to.be.gt(0);
        });

        it("Should claim staking rewards", async function () {
            // Fast forward 7 days
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");
            
            const balanceBefore = await codex.balanceOf(user1.address);
            await codex.connect(user1).claimStakingRewards();
            const balanceAfter = await codex.balanceOf(user1.address);
            
            expect(balanceAfter).to.be.gt(balanceBefore);
        });

        it("Should emit StakingRewardsClaimed event", async function () {
            await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
            await ethers.provider.send("evm_mine");
            
            await expect(codex.connect(user1).claimStakingRewards())
                .to.emit(codex, "StakingRewardsClaimed");
        });
    });

    describe("Royalty Distribution", function () {
        beforeEach(async function () {
            await codex.transfer(user1.address, ethers.parseEther("10000"));
            await codex.connect(user1).stake(ethers.parseEther("5000"));
        });

        it("Should distribute royalties", async function () {
            const distributionAmount = ethers.parseEther("10000");
            
            await expect(codex.distributeRoyalties(distributionAmount))
                .to.emit(codex, "RoyaltyDistributed");
        });

        it("Should allocate holder share proportionally", async function () {
            await codex.distributeRoyalties(ethers.parseEther("10000"));
            
            const claimable = await codex.getClaimableRoyalties(user1.address);
            expect(claimable).to.be.gt(0);
        });

        it("Should claim royalties", async function () {
            await codex.distributeRoyalties(ethers.parseEther("10000"));
            
            const claimable = await codex.getClaimableRoyalties(user1.address);
            
            if (claimable > 0) {
                const balanceBefore = await codex.balanceOf(user1.address);
                await codex.connect(user1).claimRoyalties();
                const balanceAfter = await codex.balanceOf(user1.address);
                
                expect(balanceAfter).to.be.gt(balanceBefore);
            }
        });
    });

    describe("Governance", function () {
        beforeEach(async function () {
            await codex.transfer(user1.address, ethers.parseEther("10000"));
            await codex.connect(user1).stake(ethers.parseEther("5000"));
        });

        it("Should report voting weight", async function () {
            const weight = await codex.getVotingWeight(user1.address);
            expect(weight).to.equal(5000); // 5000 tokens = 5000 weight
        });

        it("Should check minimum governance weight", async function () {
            expect(await codex.hasMinimumGovernanceWeight(user1.address, 1000)).to.be.true;
            expect(await codex.hasMinimumGovernanceWeight(user1.address, 10000)).to.be.false;
        });
    });

    describe("Protocol Stats", function () {
        it("Should return protocol statistics", async function () {
            await codex.transfer(user1.address, ethers.parseEther("10000"));
            await codex.connect(user1).stake(ethers.parseEther("5000"));
            
            const stats = await codex.getProtocolStats();
            
            expect(stats._totalStaked).to.equal(ethers.parseEther("5000"));
            expect(stats._totalGovernanceWeight).to.be.gt(0);
            expect(stats._stakingRewardsRemaining).to.equal(ethers.parseEther("150000000"));
        });
    });

    describe("Admin Functions", function () {
        it("Should update royalty distribution interval", async function () {
            const newInterval = 14 * 24 * 60 * 60; // 14 days
            await codex.setRoyaltyDistributionInterval(newInterval);
            
            expect(await codex.royaltyDistributionInterval()).to.equal(newInterval);
        });

        it("Should pause and unpause contract", async function () {
            await codex.pause();
            
            await expect(
                codex.transfer(user1.address, ethers.parseEther("100"))
            ).to.be.revertedWithCustomError(codex, "EnforcedPause");
            
            await codex.unpause();
            
            await codex.transfer(user1.address, ethers.parseEther("100"));
        });
    });
});
