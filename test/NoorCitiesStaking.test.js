const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NoorCitiesStaking", function () {
    let stakingContract;
    let mockToken;
    let owner;
    let user1;
    let user2;
    let zakatRecipient;

    const INITIAL_SUPPLY = ethers.parseEther("1000000");
    const STAKE_AMOUNT = ethers.parseEther("1000");
    const REWARD_RATE = 100; // 1% per second (in basis points)

    beforeEach(async function () {
        [owner, user1, user2, zakatRecipient] = await ethers.getSigners();

        // Deploy mock ERC20 token
        const MockToken = await ethers.getContractFactory("CHXToken");
        mockToken = await MockToken.deploy(
            owner.address,
            owner.address,
            owner.address
        );
        await mockToken.waitForDeployment();

        // Deploy staking contract
        const NoorCitiesStaking = await ethers.getContractFactory("NoorCitiesStaking");
        stakingContract = await NoorCitiesStaking.deploy();
        await stakingContract.waitForDeployment();

        // Transfer tokens to users
        await mockToken.transfer(user1.address, INITIAL_SUPPLY / 2n);
        await mockToken.transfer(user2.address, INITIAL_SUPPLY / 2n);

        // Configure token in staking contract
        await stakingContract.configureToken(
            await mockToken.getAddress(),
            true,
            REWARD_RATE,
            zakatRecipient.address
        );

        // Transfer some tokens to staking contract for rewards
        await mockToken.transfer(await stakingContract.getAddress(), ethers.parseEther("100000"));
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(await stakingContract.getAddress()).to.be.properAddress;
        });

        it("Should have correct constants", async function () {
            expect(await stakingContract.ZAKAT_PERCENTAGE()).to.equal(777);
            expect(await stakingContract.BASIS_POINTS()).to.equal(10000);
            expect(await stakingContract.PINEAL_FREQUENCY()).to.equal(963);
            expect(await stakingContract.HEALING_FREQUENCY()).to.equal(528);
        });
    });

    describe("Token Configuration", function () {
        it("Should configure token correctly", async function () {
            const config = await stakingContract.getTokenConfig(await mockToken.getAddress());
            expect(config.enabled).to.be.true;
            expect(config.rewardRate).to.equal(REWARD_RATE);
            expect(config.zakatRecipient).to.equal(zakatRecipient.address);
        });

        it("Should add token to supported tokens list", async function () {
            const supportedTokens = await stakingContract.getSupportedTokens();
            expect(supportedTokens.length).to.equal(1);
            expect(supportedTokens[0]).to.equal(await mockToken.getAddress());
        });

        it("Should revert if non-owner tries to configure token", async function () {
            await expect(
                stakingContract.connect(user1).configureToken(
                    await mockToken.getAddress(),
                    true,
                    REWARD_RATE,
                    zakatRecipient.address
                )
            ).to.be.reverted;
        });
    });

    describe("Staking", function () {
        it("Should stake tokens successfully", async function () {
            await mockToken.connect(user1).approve(await stakingContract.getAddress(), STAKE_AMOUNT);
            
            const tx = await stakingContract.connect(user1).stake(await mockToken.getAddress(), STAKE_AMOUNT);
            await expect(tx).to.emit(stakingContract, "Staked");

            const stakeInfo = await stakingContract.getStakeInfo(user1.address, await mockToken.getAddress());
            
            // Calculate expected stake after zakat
            const zakatAmount = (STAKE_AMOUNT * 777n) / 10000n;
            const expectedStake = STAKE_AMOUNT - zakatAmount;
            
            expect(stakeInfo.amount).to.equal(expectedStake);
        });

        it("Should forward zakat correctly", async function () {
            const initialBalance = await mockToken.balanceOf(zakatRecipient.address);
            
            await mockToken.connect(user1).approve(await stakingContract.getAddress(), STAKE_AMOUNT);
            await stakingContract.connect(user1).stake(await mockToken.getAddress(), STAKE_AMOUNT);
            
            const finalBalance = await mockToken.balanceOf(zakatRecipient.address);
            const zakatAmount = (STAKE_AMOUNT * 777n) / 10000n;
            
            expect(finalBalance - initialBalance).to.equal(zakatAmount);
        });

        it("Should update total staked correctly", async function () {
            await mockToken.connect(user1).approve(await stakingContract.getAddress(), STAKE_AMOUNT);
            await stakingContract.connect(user1).stake(await mockToken.getAddress(), STAKE_AMOUNT);
            
            const config = await stakingContract.getTokenConfig(await mockToken.getAddress());
            const zakatAmount = (STAKE_AMOUNT * 777n) / 10000n;
            const expectedStake = STAKE_AMOUNT - zakatAmount;
            
            expect(config.totalStaked).to.equal(expectedStake);
        });

        it("Should revert if staking disabled token", async function () {
            const disabledToken = await mockToken.getAddress();
            await stakingContract.configureToken(disabledToken, false, REWARD_RATE, zakatRecipient.address);
            
            await expect(
                stakingContract.connect(user1).stake(disabledToken, STAKE_AMOUNT)
            ).to.be.revertedWith("Token not enabled");
        });

        it("Should revert if staking zero amount", async function () {
            await expect(
                stakingContract.connect(user1).stake(await mockToken.getAddress(), 0)
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Unstaking", function () {
        beforeEach(async function () {
            await mockToken.connect(user1).approve(await stakingContract.getAddress(), STAKE_AMOUNT);
            await stakingContract.connect(user1).stake(await mockToken.getAddress(), STAKE_AMOUNT);
        });

        it("Should revert if unstaking before minimum period", async function () {
            const zakatAmount = (STAKE_AMOUNT * 777n) / 10000n;
            const stakeAmount = STAKE_AMOUNT - zakatAmount;
            
            await expect(
                stakingContract.connect(user1).unstake(await mockToken.getAddress(), stakeAmount)
            ).to.be.revertedWith("Minimum staking period not met");
        });

        it("Should unstake successfully after minimum period", async function () {
            // Fast forward 7 days
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");
            
            const zakatAmount = (STAKE_AMOUNT * 777n) / 10000n;
            const stakeAmount = STAKE_AMOUNT - zakatAmount;
            
            const initialBalance = await mockToken.balanceOf(user1.address);
            await stakingContract.connect(user1).unstake(await mockToken.getAddress(), stakeAmount);
            const finalBalance = await mockToken.balanceOf(user1.address);
            
            expect(finalBalance - initialBalance).to.equal(stakeAmount);
        });

        it("Should revert if unstaking more than staked", async function () {
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");
            
            const tooMuch = ethers.parseEther("10000");
            await expect(
                stakingContract.connect(user1).unstake(await mockToken.getAddress(), tooMuch)
            ).to.be.revertedWith("Insufficient stake");
        });
    });

    describe("Delegation", function () {
        it("Should set delegation correctly", async function () {
            await stakingContract.connect(user1).setDelegation(user2.address);
            
            const delegationInfo = await stakingContract.getDelegationInfo(user1.address);
            expect(delegationInfo.isDelegating).to.be.true;
            expect(delegationInfo.delegatee).to.equal(user2.address);
        });

        it("Should remove delegation correctly", async function () {
            await stakingContract.connect(user1).setDelegation(user2.address);
            await stakingContract.connect(user1).removeDelegation();
            
            const delegationInfo = await stakingContract.getDelegationInfo(user1.address);
            expect(delegationInfo.isDelegating).to.be.false;
        });

        it("Should revert if delegating to self", async function () {
            await expect(
                stakingContract.connect(user1).setDelegation(user1.address)
            ).to.be.revertedWith("Cannot delegate to self");
        });

        it("Should revert if removing non-existent delegation", async function () {
            await expect(
                stakingContract.connect(user1).removeDelegation()
            ).to.be.revertedWith("No delegation set");
        });
    });

    describe("Pause/Unpause", function () {
        it("Should pause staking operations", async function () {
            await stakingContract.pause();
            
            await mockToken.connect(user1).approve(await stakingContract.getAddress(), STAKE_AMOUNT);
            await expect(
                stakingContract.connect(user1).stake(await mockToken.getAddress(), STAKE_AMOUNT)
            ).to.be.reverted;
        });

        it("Should unpause staking operations", async function () {
            await stakingContract.pause();
            await stakingContract.unpause();
            
            await mockToken.connect(user1).approve(await stakingContract.getAddress(), STAKE_AMOUNT);
            await expect(
                stakingContract.connect(user1).stake(await mockToken.getAddress(), STAKE_AMOUNT)
            ).to.not.be.reverted;
        });

        it("Should revert if non-owner tries to pause", async function () {
            await expect(
                stakingContract.connect(user1).pause()
            ).to.be.reverted;
        });
    });
});
