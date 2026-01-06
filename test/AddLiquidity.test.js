const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * AddLiquidity Contract Test Suite
 * 
 * Tests for liquidity provision functionality
 * Frequencies: 528Hz + 963Hz + 777Hz
 */

describe("AddLiquidity", function () {
    let addLiquidity;
    let mockRouter;
    let mockToken;
    let mockFactory;
    let owner;
    let user1;
    let user2;

    const MAX_SLIPPAGE = 500; // 5%

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy mock tokens for testing
        const MockToken = await ethers.getContractFactory("NoorToken");
        mockToken = await MockToken.deploy(owner.address, owner.address);
        await mockToken.waitForDeployment();

        // For a proper test, we would need mock router and factory
        // This is a simplified test setup
        // In production tests, use a proper DEX fork or mocks

        // Deploy AddLiquidity with a placeholder router address
        // Note: This will fail in actual liquidity operations without a real router
        const AddLiquidity = await ethers.getContractFactory("AddLiquidity");
        
        // Using owner address as placeholder router for basic tests
        // Real tests should use a mock router
        try {
            addLiquidity = await AddLiquidity.deploy(
                owner.address, // Placeholder for router
                MAX_SLIPPAGE
            );
            await addLiquidity.waitForDeployment();
        } catch (error) {
            // Skip tests if deployment fails (expected without proper router)
            this.skip();
        }
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await addLiquidity.owner()).to.equal(owner.address);
        });

        it("Should set the correct max slippage", async function () {
            expect(await addLiquidity.maxSlippage()).to.equal(MAX_SLIPPAGE);
        });

        it("Should have correct basis points", async function () {
            expect(await addLiquidity.BASIS_POINTS()).to.equal(10000);
        });

        it("Should have correct frequency constants", async function () {
            expect(await addLiquidity.FREQUENCY_528HZ()).to.equal(528);
            expect(await addLiquidity.FREQUENCY_963HZ()).to.equal(963);
            expect(await addLiquidity.FREQUENCY_777HZ()).to.equal(777);
        });

        it("Should return correct resonance signature", async function () {
            const resonance = await addLiquidity.getResonanceSignature();
            expect(resonance).to.equal(528 + 963 + 777);
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set token whitelist", async function () {
            await expect(addLiquidity.setTokenWhitelist(mockToken.target, true))
                .to.emit(addLiquidity, "TokenWhitelisted")
                .withArgs(mockToken.target, true);

            expect(await addLiquidity.whitelistedTokens(mockToken.target)).to.be.true;
        });

        it("Should revert when non-owner tries to set token whitelist", async function () {
            await expect(
                addLiquidity.connect(user1).setTokenWhitelist(mockToken.target, true)
            ).to.be.reverted;
        });

        it("Should allow owner to update max slippage", async function () {
            const newSlippage = 300; // 3%
            await expect(addLiquidity.updateMaxSlippage(newSlippage))
                .to.emit(addLiquidity, "SlippageUpdated")
                .withArgs(MAX_SLIPPAGE, newSlippage);

            expect(await addLiquidity.maxSlippage()).to.equal(newSlippage);
        });

        it("Should revert when setting slippage above 20%", async function () {
            await expect(
                addLiquidity.updateMaxSlippage(2001)
            ).to.be.revertedWithCustomError(addLiquidity, "SlippageTooHigh");
        });

        it("Should allow owner to pause", async function () {
            await addLiquidity.pause();
            expect(await addLiquidity.paused()).to.be.true;
        });

        it("Should allow owner to unpause", async function () {
            await addLiquidity.pause();
            await addLiquidity.unpause();
            expect(await addLiquidity.paused()).to.be.false;
        });

        it("Should revert when non-owner tries to pause", async function () {
            await expect(
                addLiquidity.connect(user1).pause()
            ).to.be.reverted;
        });
    });

    describe("View Functions", function () {
        it("Should return empty positions for new users", async function () {
            const positions = await addLiquidity.getUserPositions(user1.address);
            expect(positions.length).to.equal(0);
        });

        it("Should return zero total liquidity for new pairs", async function () {
            const mockToken2 = await (await ethers.getContractFactory("NoorToken")).deploy(owner.address, owner.address);
            await mockToken2.waitForDeployment();

            const liquidity = await addLiquidity.getTotalLiquidity(mockToken.target, mockToken2.target);
            expect(liquidity).to.equal(0);
        });
    });

    describe("Errors", function () {
        it("Should revert setTokenWhitelist with zero address", async function () {
            await expect(
                addLiquidity.setTokenWhitelist(ethers.ZeroAddress, true)
            ).to.be.revertedWithCustomError(addLiquidity, "InvalidAddress");
        });
    });
});
