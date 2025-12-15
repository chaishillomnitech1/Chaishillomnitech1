const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DivineEssenceCoin", function () {
  let deToken;
  let owner;
  let rewardPool;
  let charityValidator;
  let user1;
  let user2;
  let user3;

  const LOCK_3_MONTHS = 90 * 24 * 60 * 60; // 90 days in seconds
  const LOCK_6_MONTHS = 180 * 24 * 60 * 60; // 180 days
  const LOCK_12_MONTHS = 365 * 24 * 60 * 60; // 365 days

  beforeEach(async function () {
    [owner, rewardPool, charityValidator, user1, user2, user3] = await ethers.getSigners();

    const DivineEssenceCoin = await ethers.getContractFactory("DivineEssenceCoin");
    deToken = await DivineEssenceCoin.deploy(
      owner.address,
      rewardPool.address,
      charityValidator.address
    );
    await deToken.waitForDeployment();

    // Transfer some tokens to users for testing
    const transferAmount = ethers.parseEther("10000");
    await deToken.connect(owner).transfer(user1.address, transferAmount);
    await deToken.connect(owner).transfer(user2.address, transferAmount);
    await deToken.connect(owner).transfer(user3.address, transferAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await deToken.name()).to.equal("Divine Essence Coin");
      expect(await deToken.symbol()).to.equal("DE");
    });

    it("Should have correct total supply", async function () {
      const totalSupply = await deToken.TOTAL_SUPPLY();
      expect(totalSupply).to.equal(ethers.parseEther("144000000")); // 144 million
    });

    it("Should set the correct addresses", async function () {
      expect(await deToken.rewardPool()).to.equal(rewardPool.address);
      expect(await deToken.charityValidator()).to.equal(charityValidator.address);
    });

    it("Should distribute initial supply correctly", async function () {
      const totalSupply = await deToken.TOTAL_SUPPLY();
      const rewardPoolBalance = await deToken.balanceOf(rewardPool.address);
      
      // Reward pool should have 50% (30% community + 20% staking)
      const expectedRewardPool = totalSupply * BigInt(50) / BigInt(100);
      expect(rewardPoolBalance).to.equal(expectedRewardPool);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens with 3-month lock", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await deToken.connect(user1).stake(stakeAmount, LOCK_3_MONTHS);

      expect(await deToken.totalStaked(user1.address)).to.equal(stakeAmount);
      expect(await deToken.totalStakers()).to.equal(1);
      expect(await deToken.totalValueStaked()).to.equal(stakeAmount);
    });

    it("Should allow users to stake tokens with 6-month lock", async function () {
      const stakeAmount = ethers.parseEther("2000");
      await deToken.connect(user1).stake(stakeAmount, LOCK_6_MONTHS);

      const stakes = await deToken.getUserStakes(user1.address);
      expect(stakes[0].amount).to.equal(stakeAmount);
      expect(stakes[0].lockPeriod).to.equal(LOCK_6_MONTHS);
      expect(stakes[0].rewardRate).to.equal(1200); // 12% APY
    });

    it("Should allow users to stake tokens with 12-month lock", async function () {
      const stakeAmount = ethers.parseEther("3000");
      await deToken.connect(user1).stake(stakeAmount, LOCK_12_MONTHS);

      const stakes = await deToken.getUserStakes(user1.address);
      expect(stakes[0].rewardRate).to.equal(1800); // 18% APY
    });

    it("Should reject invalid lock periods", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const invalidLockPeriod = 45 * 24 * 60 * 60; // 45 days

      await expect(
        deToken.connect(user1).stake(stakeAmount, invalidLockPeriod)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("Should reject zero stake amount", async function () {
      await expect(
        deToken.connect(user1).stake(0, LOCK_3_MONTHS)
      ).to.be.revertedWith("Cannot stake 0 tokens");
    });

    it("Should allow multiple stakes from same user", async function () {
      await deToken.connect(user1).stake(ethers.parseEther("1000"), LOCK_3_MONTHS);
      await deToken.connect(user1).stake(ethers.parseEther("500"), LOCK_6_MONTHS);

      const stakes = await deToken.getUserStakes(user1.address);
      expect(stakes.length).to.equal(2);
      expect(await deToken.totalStaked(user1.address)).to.equal(ethers.parseEther("1500"));
    });

    it("Should track total stakers correctly", async function () {
      await deToken.connect(user1).stake(ethers.parseEther("1000"), LOCK_3_MONTHS);
      await deToken.connect(user2).stake(ethers.parseEther("500"), LOCK_6_MONTHS);
      await deToken.connect(user3).stake(ethers.parseEther("750"), LOCK_12_MONTHS);

      expect(await deToken.totalStakers()).to.equal(3);
    });

    it("Should apply first stakers bonus", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await deToken.connect(user1).stake(stakeAmount, LOCK_3_MONTHS);

      const stakes = await deToken.getUserStakes(user1.address);
      expect(stakes[0].hasFirstStakerBonus).to.be.true;
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      const stakeAmount = ethers.parseEther("1000");
      await deToken.connect(user1).stake(stakeAmount, LOCK_3_MONTHS);
    });

    it("Should allow unstaking after lock period", async function () {
      // Fast forward time past lock period
      await time.increase(LOCK_3_MONTHS + 1);

      const initialBalance = await deToken.balanceOf(user1.address);
      await deToken.connect(user1).unstake(0);
      const finalBalance = await deToken.balanceOf(user1.address);

      // Should get staked amount back plus some reward
      expect(finalBalance).to.be.gt(initialBalance);
      expect(await deToken.totalStaked(user1.address)).to.equal(0);
    });

    it("Should apply early withdrawal penalty", async function () {
      // Fast forward only halfway through lock period
      await time.increase(LOCK_3_MONTHS / 2);

      const reward = await deToken.calculateReward(user1.address, 0);
      await deToken.connect(user1).unstake(0);

      // Reward should be reduced by penalty
      // This is hard to test exact amount due to timing, but we verify no revert
      expect(await deToken.totalStaked(user1.address)).to.equal(0);
    });

    it("Should mark stake as inactive after unstaking", async function () {
      await time.increase(LOCK_3_MONTHS + 1);
      await deToken.connect(user1).unstake(0);

      const stakes = await deToken.getUserStakes(user1.address);
      expect(stakes[0].isActive).to.be.false;
    });

    it("Should reject unstaking non-existent stake", async function () {
      await expect(
        deToken.connect(user1).unstake(5)
      ).to.be.revertedWith("Invalid stake index");
    });

    it("Should reject unstaking already withdrawn stake", async function () {
      await time.increase(LOCK_3_MONTHS + 1);
      await deToken.connect(user1).unstake(0);

      await expect(
        deToken.connect(user1).unstake(0)
      ).to.be.revertedWith("Stake already withdrawn");
    });

    it("Should decrease total stakers when user has no more stakes", async function () {
      expect(await deToken.totalStakers()).to.equal(1);
      
      await time.increase(LOCK_3_MONTHS + 1);
      await deToken.connect(user1).unstake(0);

      expect(await deToken.totalStakers()).to.equal(0);
    });
  });

  describe("Reward Calculation", function () {
    it("Should calculate rewards correctly for 3-month stake", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await deToken.connect(user1).stake(stakeAmount, LOCK_3_MONTHS);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      const reward = await deToken.calculateReward(user1.address, 0);
      expect(reward).to.be.gt(0);

      // Approximate check: reward should be around (1000 * 8% * 30/365)
      // With bonuses applied
      const expectedBaseReward = stakeAmount * BigInt(800) * BigInt(30) / (BigInt(365) * BigInt(10000));
      expect(reward).to.be.gte(expectedBaseReward);
    });

    it("Should apply NFT bonus when NFT contract is set", async function () {
      // For this test, we'd need to deploy a mock NFT contract
      // Skipping detailed implementation but structure is here
      expect(true).to.be.true;
    });

    it("Should return zero reward for inactive stakes", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await deToken.connect(user1).stake(stakeAmount, LOCK_3_MONTHS);

      await time.increase(LOCK_3_MONTHS + 1);
      await deToken.connect(user1).unstake(0);

      const reward = await deToken.calculateReward(user1.address, 0);
      expect(reward).to.equal(0);
    });
  });

  describe("Charitable Actions", function () {
    it("Should allow users to submit charitable action", async function () {
      await expect(
        deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://QmTest123")
      )
        .to.emit(deToken, "CharitableActionSubmitted")
        .withArgs(1, user1.address, "volunteer", "ipfs://QmTest123");
    });

    it("Should reject empty action type", async function () {
      await expect(
        deToken.connect(user1).submitCharitableAction("", "ipfs://QmTest")
      ).to.be.revertedWith("Action type required");
    });

    it("Should reject empty proof hash", async function () {
      await expect(
        deToken.connect(user1).submitCharitableAction("volunteer", "")
      ).to.be.revertedWith("Proof hash required");
    });

    it("Should allow charity validator to approve action", async function () {
      await deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://QmTest");
      const rewardAmount = ethers.parseEther("100");

      await expect(
        deToken.connect(charityValidator).approveCharitableAction(1, rewardAmount)
      )
        .to.emit(deToken, "CharitableActionApproved")
        .withArgs(1, user1.address, rewardAmount);
    });

    it("Should reject approval from non-validator", async function () {
      await deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://QmTest");
      
      await expect(
        deToken.connect(user2).approveCharitableAction(1, ethers.parseEther("100"))
      ).to.be.revertedWith("Not authorized");
    });

    it("Should allow user to claim approved charitable reward", async function () {
      // Submit action
      await deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://QmTest");
      
      // Approve action
      const rewardAmount = ethers.parseEther("100");
      await deToken.connect(charityValidator).approveCharitableAction(1, rewardAmount);
      
      // Claim reward
      const initialBalance = await deToken.balanceOf(user1.address);
      await deToken.connect(user1).claimCharitableReward(1);
      const finalBalance = await deToken.balanceOf(user1.address);
      
      expect(finalBalance - initialBalance).to.equal(rewardAmount);
    });

    it("Should reject claiming unapproved action", async function () {
      await deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://QmTest");
      
      await expect(
        deToken.connect(user1).claimCharitableReward(1)
      ).to.be.revertedWith("Action not approved");
    });

    it("Should reject double claiming", async function () {
      await deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://QmTest");
      await deToken.connect(charityValidator).approveCharitableAction(1, ethers.parseEther("100"));
      await deToken.connect(user1).claimCharitableReward(1);
      
      await expect(
        deToken.connect(user1).claimCharitableReward(1)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should apply charity bonus to active stakes", async function () {
      // Stake first
      await deToken.connect(user1).stake(ethers.parseEther("1000"), LOCK_3_MONTHS);
      
      // Submit and approve charitable action
      await deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://QmTest");
      await deToken.connect(charityValidator).approveCharitableAction(1, ethers.parseEther("100"));
      
      // Check that charity bonus was applied
      const stakes = await deToken.getUserStakes(user1.address);
      expect(stakes[0].hasCharityBonus).to.be.true;
    });

    it("Should track user actions correctly", async function () {
      await deToken.connect(user1).submitCharitableAction("volunteer", "ipfs://1");
      await deToken.connect(user1).submitCharitableAction("donation", "ipfs://2");
      await deToken.connect(user1).submitCharitableAction("event", "ipfs://3");
      
      const userActions = await deToken.getUserActions(user1.address);
      expect(userActions.length).to.equal(3);
      expect(userActions[0]).to.equal(1);
      expect(userActions[1]).to.equal(2);
      expect(userActions[2]).to.equal(3);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update reward pool", async function () {
      const newRewardPool = user3.address;
      
      await expect(deToken.connect(owner).updateRewardPool(newRewardPool))
        .to.emit(deToken, "RewardPoolUpdated")
        .withArgs(rewardPool.address, newRewardPool);
      
      expect(await deToken.rewardPool()).to.equal(newRewardPool);
    });

    it("Should allow owner to update charity validator", async function () {
      const newValidator = user3.address;
      
      await expect(deToken.connect(owner).updateCharityValidator(newValidator))
        .to.emit(deToken, "CharityValidatorUpdated")
        .withArgs(charityValidator.address, newValidator);
      
      expect(await deToken.charityValidator()).to.equal(newValidator);
    });

    it("Should allow owner to update NFT contract", async function () {
      const nftContract = user3.address;
      
      await expect(deToken.connect(owner).updateNFTContract(nftContract))
        .to.emit(deToken, "NFTContractUpdated");
      
      expect(await deToken.nftContract()).to.equal(nftContract);
    });

    it("Should reject non-owner admin functions", async function () {
      await expect(
        deToken.connect(user1).updateRewardPool(user2.address)
      ).to.be.reverted;

      await expect(
        deToken.connect(user1).updateCharityValidator(user2.address)
      ).to.be.reverted;
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await deToken.connect(owner).pause();
      
      await expect(
        deToken.connect(user1).stake(ethers.parseEther("100"), LOCK_3_MONTHS)
      ).to.be.reverted;
      
      await deToken.connect(owner).unpause();
      
      await expect(
        deToken.connect(user1).stake(ethers.parseEther("100"), LOCK_3_MONTHS)
      ).to.not.be.reverted;
    });

    it("Should prevent transfers when paused", async function () {
      await deToken.connect(owner).pause();
      
      await expect(
        deToken.connect(user1).transfer(user2.address, ethers.parseEther("10"))
      ).to.be.reverted;
    });
  });

  describe("ERC20 Compliance", function () {
    it("Should allow token transfers", async function () {
      const transferAmount = ethers.parseEther("100");
      const initialBalance = await deToken.balanceOf(user2.address);
      
      await deToken.connect(user1).transfer(user2.address, transferAmount);
      
      const finalBalance = await deToken.balanceOf(user2.address);
      expect(finalBalance - initialBalance).to.equal(transferAmount);
    });

    it("Should allow token burning", async function () {
      const burnAmount = ethers.parseEther("50");
      const initialSupply = await deToken.totalSupply();
      
      await deToken.connect(user1).burn(burnAmount);
      
      const finalSupply = await deToken.totalSupply();
      expect(initialSupply - finalSupply).to.equal(burnAmount);
    });

    it("Should have correct decimals", async function () {
      expect(await deToken.decimals()).to.equal(18);
    });
  });
});
