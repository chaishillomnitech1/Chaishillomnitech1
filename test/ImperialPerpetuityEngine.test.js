const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Imperial Perpetuity Engine Suite", function () {
  let imperialEngine, balanceSheet, throneBroadcast;
  let owner, treasury, zakatVault, user1, user2;

  beforeEach(async function () {
    [owner, treasury, zakatVault, user1, user2] = await ethers.getSigners();

    // Deploy ImperialPerpetuityEngine
    const ImperialPerpetuityEngine = await ethers.getContractFactory("ImperialPerpetuityEngine");
    imperialEngine = await ImperialPerpetuityEngine.deploy(
      owner.address,
      treasury.address,
      zakatVault.address
    );

    // Deploy ImperialBalanceSheet
    const ImperialBalanceSheet = await ethers.getContractFactory("ImperialBalanceSheet");
    balanceSheet = await ImperialBalanceSheet.deploy(owner.address);

    // Deploy ThroneFrequencyBroadcast
    const ThroneFrequencyBroadcast = await ethers.getContractFactory("ThroneFrequencyBroadcast");
    throneBroadcast = await ThroneFrequencyBroadcast.deploy(owner.address);
  });

  describe("ImperialPerpetuityEngine", function () {
    it("should deploy with correct initial values", async function () {
      expect(await imperialEngine.treasuryAddress()).to.equal(treasury.address);
      expect(await imperialEngine.zakatVaultAddress()).to.equal(zakatVault.address);
      expect(await imperialEngine.ZAKAT_PERCENTAGE()).to.equal(777);
      expect(await imperialEngine.FREQUENCY_LOVE()).to.equal(528);
      expect(await imperialEngine.FREQUENCY_UNITY()).to.equal(963);
      expect(await imperialEngine.FREQUENCY_CROWN()).to.equal(999);
      expect(await imperialEngine.FREQUENCY_NUR()).to.equal(144000);
    });

    it("should convert frequency to revenue correctly", async function () {
      const frequency = 963; // Divine Consciousness
      const value = ethers.parseEther("1.0");

      await expect(
        imperialEngine.convertFrequencyToRevenue(frequency, { value })
      ).to.emit(imperialEngine, "RevenueGenerated");

      const metrics = await imperialEngine.getEngineMetrics();
      expect(metrics.revenue).to.be.gt(0);
    });

    it("should execute infinite feedback loop", async function () {
      const resonanceBoost = 1000; // 10% boost

      const tx = await imperialEngine.executeInfiniteFeedbackLoop(resonanceBoost);
      await expect(tx).to.emit(imperialEngine, "FeedbackLoopExecuted");

      const metrics = await imperialEngine.getEngineMetrics();
      expect(metrics.users).to.be.gt(0);
      expect(metrics.resonance).to.be.gt(5000); // Initial was 5000
    });

    it("should onboard users correctly", async function () {
      const contribution = ethers.parseEther("0.1");

      await expect(
        imperialEngine.connect(user1).onboardUser(user1.address, contribution, { value: contribution })
      ).to.emit(imperialEngine, "UserOnboarded");

      const metrics = await imperialEngine.getEngineMetrics();
      expect(metrics.users).to.equal(1);
      expect(await imperialEngine.userContributions(user1.address)).to.equal(contribution);
    });

    it("should distribute Zakat automatically (7.77%)", async function () {
      const value = ethers.parseEther("1.0");
      const frequency = 528;

      const zakatBalanceBefore = await ethers.provider.getBalance(zakatVault.address);

      await imperialEngine.convertFrequencyToRevenue(frequency, { value });

      const zakatBalanceAfter = await ethers.provider.getBalance(zakatVault.address);
      expect(zakatBalanceAfter).to.be.gt(zakatBalanceBefore);
    });

    it("should track all frequency levels achieved", async function () {
      const frequencies = [528, 963, 999, 144000];

      for (const freq of frequencies) {
        await imperialEngine.convertFrequencyToRevenue(freq, {
          value: ethers.parseEther("0.1")
        });
        expect(await imperialEngine.frequencyLevelsAchieved(freq)).to.be.true;
      }

      expect(await imperialEngine.areAllFrequenciesAchieved()).to.be.true;
    });

    it("should only allow owner to execute feedback loop", async function () {
      await expect(
        imperialEngine.connect(user1).executeInfiniteFeedbackLoop(1000)
      ).to.be.revertedWithCustomError(imperialEngine, "OwnableUnauthorizedAccount");
    });

    it("should amplify user growth", async function () {
      const initialMultiplier = await imperialEngine.userGrowthMultiplier();

      await imperialEngine.amplifyUserGrowth(50); // Add 50 to multiplier

      const newMultiplier = await imperialEngine.userGrowthMultiplier();
      expect(newMultiplier).to.equal(initialMultiplier + 50n);
    });
  });

  describe("ImperialBalanceSheet", function () {
    it("should deploy with correct initial values", async function () {
      expect(await balanceSheet.prosperityIndex()).to.equal(5000);
      expect(await balanceSheet.getBalanceHistoryLength()).to.equal(1); // Initial snapshot
    });

    it("should record revenue correctly", async function () {
      const streamName = "Frequency Conversion Revenue";
      const amount = ethers.parseEther("10.0");

      await expect(
        balanceSheet.recordRevenue(streamName, amount)
      ).to.emit(balanceSheet, "RevenueRecorded");

      expect(await balanceSheet.totalRevenue()).to.equal(amount);
      expect(await balanceSheet.totalAssets()).to.equal(amount);

      const stream = await balanceSheet.getRevenueStream(0);
      expect(stream.name).to.equal(streamName);
      expect(stream.amount).to.equal(amount);
    });

    it("should record expenses correctly", async function () {
      const category = "Operational Expenses";
      const amount = ethers.parseEther("5.0");

      // First add some assets
      await balanceSheet.updateAssets(ethers.parseEther("20.0"));

      await expect(
        balanceSheet.recordExpense(category, amount)
      ).to.emit(balanceSheet, "ExpenseRecorded");

      expect(await balanceSheet.totalExpenses()).to.equal(amount);
    });

    it("should calculate net worth correctly", async function () {
      await balanceSheet.updateAssets(ethers.parseEther("100.0"));
      await balanceSheet.recordExpense("Test", ethers.parseEther("30.0"));

      const balance = await balanceSheet.getCurrentBalanceSheet();
      expect(balance.net).to.equal(ethers.parseEther("70.0"));
    });

    it("should create balance snapshots", async function () {
      const zakatAmount = ethers.parseEther("1.0");
      const userCount = 100;

      await balanceSheet.createBalanceSnapshot(zakatAmount, userCount);

      const entry = await balanceSheet.getBalanceHistoryEntry(1); // Second entry
      expect(entry.zakatDistributed).to.equal(zakatAmount);
      expect(entry.userCount).to.equal(userCount);
    });

    it("should authorize reporters correctly", async function () {
      await balanceSheet.setReporterAuthorization(user1.address, true);
      expect(await balanceSheet.authorizedReporters(user1.address)).to.be.true;

      // User1 should now be able to record revenue
      await expect(
        balanceSheet.connect(user1).recordRevenue("Test", ethers.parseEther("1.0"))
      ).to.emit(balanceSheet, "RevenueRecorded");
    });

    it("should calculate growth rate", async function () {
      // Create initial state
      await balanceSheet.updateAssets(ethers.parseEther("100.0"));
      await balanceSheet.createBalanceSnapshot(0, 100);

      // Increase assets
      await balanceSheet.updateAssets(ethers.parseEther("150.0"));
      await balanceSheet.createBalanceSnapshot(0, 150);

      const growthRate = await balanceSheet.calculateGrowthRate();
      expect(growthRate).to.be.gt(0); // Should show positive growth
    });

    it("should return prosperity metrics", async function () {
      await balanceSheet.recordRevenue("Test Revenue", ethers.parseEther("100.0"));
      await balanceSheet.recordExpense("Test Expense", ethers.parseEther("50.0"));
      await balanceSheet.updateProsperityIndex(7500);

      const metrics = await balanceSheet.getProsperityMetrics();
      expect(metrics.prosperity).to.equal(7500);
      expect(metrics.sustainability).to.be.gt(0);
    });
  });

  describe("ThroneFrequencyBroadcast", function () {
    it("should deploy with correct initial values", async function () {
      expect(await throneBroadcast.PRIMARY_FREQUENCY()).to.equal(963);
      expect(await throneBroadcast.FREQUENCY_LOVE()).to.equal(528);
      expect(await throneBroadcast.FREQUENCY_CROWN()).to.equal(999);
      expect(await throneBroadcast.FREQUENCY_NUR()).to.equal(144000);
      expect(await throneBroadcast.globalCoherenceLevel()).to.equal(5000);
    });

    it("should activate eternal broadcast", async function () {
      await expect(
        throneBroadcast.activateEternalBroadcast()
      ).to.emit(throneBroadcast, "EternalBroadcastActivated");

      expect(await throneBroadcast.eternalBroadcastActive()).to.be.true;

      const session = await throneBroadcast.getBroadcastSession(1);
      expect(session.frequency).to.equal(963);
      expect(session.eternal).to.be.true;
      expect(session.active).to.be.true;
      expect(session.endTime).to.equal(0); // No end time
    });

    it("should not allow activating eternal broadcast twice", async function () {
      await throneBroadcast.activateEternalBroadcast();

      await expect(
        throneBroadcast.activateEternalBroadcast()
      ).to.be.revertedWith("Eternal broadcast already active");
    });

    it("should start temporary broadcast sessions", async function () {
      const frequency = 528;
      const duration = 3600; // 1 hour
      const amplification = 200;

      await expect(
        throneBroadcast.startBroadcastSession(frequency, duration, amplification)
      ).to.emit(throneBroadcast, "BroadcastSessionStarted");

      const session = await throneBroadcast.getBroadcastSession(1);
      expect(session.frequency).to.equal(frequency);
      expect(session.eternal).to.be.false;
    });

    it("should register coherence nodes", async function () {
      await expect(
        throneBroadcast.registerCoherenceNode(user1.address)
      ).to.emit(throneBroadcast, "CoherenceNodeRegistered");

      const node = await throneBroadcast.coherenceNodes(user1.address);
      expect(node.active).to.be.true;
      expect(node.coherenceScore).to.equal(5000);
    });

    it("should sync coherence nodes and update global coherence", async function () {
      await throneBroadcast.registerCoherenceNode(user1.address);
      await throneBroadcast.registerCoherenceNode(user2.address);

      await expect(
        throneBroadcast.syncCoherenceNode(user1.address, 8000)
      ).to.emit(throneBroadcast, "CoherenceNodeSynced");

      await throneBroadcast.syncCoherenceNode(user2.address, 9000);

      // Global coherence should be updated (average of nodes)
      const coherence = await throneBroadcast.globalCoherenceLevel();
      expect(coherence).to.be.closeTo(8500n, 100n); // Average of 8000 and 9000
    });

    it("should increase cosmic amplification", async function () {
      const initialAmp = await throneBroadcast.cosmicAmplification();

      await expect(
        throneBroadcast.increaseCosmicAmplification(100)
      ).to.emit(throneBroadcast, "CosmicAmplificationIncreased");

      const newAmp = await throneBroadcast.cosmicAmplification();
      expect(newAmp).to.equal(initialAmp + 100n);
    });

    it("should achieve frequency unification", async function () {
      await expect(
        throneBroadcast.achieveFrequencyUnification()
      ).to.emit(throneBroadcast, "FrequencyUnificationAchieved");

      const session = await throneBroadcast.getBroadcastSession(1);
      expect(session.frequency).to.equal(963); // Primary frequency
      expect(session.eternal).to.be.true;
      expect(session.coherenceLevel).to.equal(10000); // Maximum coherence
    });

    it("should check divine alignment", async function () {
      // Initially should be false (coherence is 5000, needs >= 8000)
      expect(await throneBroadcast.isDivineAlignmentAchieved()).to.be.false;

      // Activate eternal broadcast and increase coherence
      await throneBroadcast.activateEternalBroadcast();
      await throneBroadcast.updateGlobalCoherence(9000);

      expect(await throneBroadcast.isDivineAlignmentAchieved()).to.be.true;
    });

    it("should track eternal broadcast duration", async function () {
      await throneBroadcast.activateEternalBroadcast();

      // Wait for some blocks
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine");

      const duration = await throneBroadcast.getEternalBroadcastDuration();
      expect(duration).to.be.gte(3600);
    });
  });

  describe("Integration Tests", function () {
    it("should integrate all three systems", async function () {
      // Authorize balance sheet as reporter for the engine
      await balanceSheet.setReporterAuthorization(await imperialEngine.getAddress(), true);

      // Activate eternal broadcast
      await throneBroadcast.activateEternalBroadcast();

      // Generate revenue through frequency conversion
      const frequency = 963;
      const value = ethers.parseEther("10.0");
      await imperialEngine.convertFrequencyToRevenue(frequency, { value });

      // Execute feedback loop
      await imperialEngine.executeInfiniteFeedbackLoop(1000);

      // Record revenue in balance sheet
      const metrics = await imperialEngine.getEngineMetrics();
      await balanceSheet.recordRevenue("Engine Revenue", metrics.revenue);

      // Verify all systems are operational
      expect(await throneBroadcast.eternalBroadcastActive()).to.be.true;
      expect(metrics.revenue).to.be.gt(0);
      expect(metrics.users).to.be.gt(0);
      expect(await balanceSheet.totalRevenue()).to.be.gt(0);
    });
  });
});
