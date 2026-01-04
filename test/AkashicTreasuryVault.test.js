const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AkashicTreasuryVault", function () {
  let akashicLabel;
  let treasuryVault;
  let owner;
  let artist1;
  let artist2;
  let zakatRecipient;
  let operationsAddress;
  let addrs;

  const ARTIST_ALLOCATION_BPS = 7000;      // 70%
  const TREASURY_ALLOCATION_BPS = 1500;    // 15%
  const ZAKAT_ALLOCATION_BPS = 777;        // 7.77%
  const OPERATIONS_ALLOCATION_BPS = 723;   // 7.23%
  const BASIS_POINTS = 10000;

  beforeEach(async function () {
    [owner, artist1, artist2, zakatRecipient, operationsAddress, ...addrs] = await ethers.getSigners();

    // Deploy AkashicRecordsLabel
    const AkashicRecordsLabel = await ethers.getContractFactory("AkashicRecordsLabel");
    akashicLabel = await AkashicRecordsLabel.deploy(
      "ipfs://QmTest/",
      owner.address,
      owner.address
    );
    await akashicLabel.waitForDeployment();

    // Deploy AkashicTreasuryVault
    const AkashicTreasuryVault = await ethers.getContractFactory("AkashicTreasuryVault");
    treasuryVault = await AkashicTreasuryVault.deploy(
      await akashicLabel.getAddress(),
      zakatRecipient.address,
      operationsAddress.address
    );
    await treasuryVault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct label contract", async function () {
      expect(await treasuryVault.akashicLabel()).to.equal(await akashicLabel.getAddress());
    });

    it("Should set the correct Zakat recipient", async function () {
      expect(await treasuryVault.zakatRecipient()).to.equal(zakatRecipient.address);
    });

    it("Should set the correct operations address", async function () {
      expect(await treasuryVault.operationsAddress()).to.equal(operationsAddress.address);
    });

    it("Should have correct frequency constants", async function () {
      expect(await treasuryVault.LOVE_FREQUENCY()).to.equal(528);
      expect(await treasuryVault.DIVINE_WISDOM_FREQUENCY()).to.equal(777);
      expect(await treasuryVault.CROWN_FREQUENCY()).to.equal(999);
    });

    it("Should have correct allocation percentages", async function () {
      expect(await treasuryVault.ARTIST_ALLOCATION_BPS()).to.equal(ARTIST_ALLOCATION_BPS);
      expect(await treasuryVault.TREASURY_ALLOCATION_BPS()).to.equal(TREASURY_ALLOCATION_BPS);
      expect(await treasuryVault.ZAKAT_ALLOCATION_BPS()).to.equal(ZAKAT_ALLOCATION_BPS);
      expect(await treasuryVault.OPERATIONS_ALLOCATION_BPS()).to.equal(OPERATIONS_ALLOCATION_BPS);
    });

    it("Should grant roles correctly", async function () {
      const DEFAULT_ADMIN_ROLE = await treasuryVault.DEFAULT_ADMIN_ROLE();
      const TREASURY_ADMIN_ROLE = await treasuryVault.TREASURY_ADMIN_ROLE();
      const DISTRIBUTOR_ROLE = await treasuryVault.DISTRIBUTOR_ROLE();

      expect(await treasuryVault.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await treasuryVault.hasRole(TREASURY_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await treasuryVault.hasRole(DISTRIBUTOR_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Revenue Allocation", function () {
    it("Should correctly allocate revenue", async function () {
      const depositAmount = ethers.parseEther("10");

      const tx = await treasuryVault.depositRevenue({ value: depositAmount });
      await tx.wait();

      const expectedArtistAmount = (depositAmount * BigInt(ARTIST_ALLOCATION_BPS)) / BigInt(BASIS_POINTS);
      const expectedTreasuryAmount = (depositAmount * BigInt(TREASURY_ALLOCATION_BPS)) / BigInt(BASIS_POINTS);
      const expectedZakatAmount = (depositAmount * BigInt(ZAKAT_ALLOCATION_BPS)) / BigInt(BASIS_POINTS);
      const expectedOperationsAmount = (depositAmount * BigInt(OPERATIONS_ALLOCATION_BPS)) / BigInt(BASIS_POINTS);

      expect(await treasuryVault.totalRevenue()).to.equal(depositAmount);
      expect(await treasuryVault.treasuryBalance()).to.be.closeTo(expectedTreasuryAmount, ethers.parseEther("0.001"));
      expect(await treasuryVault.zakatBalance()).to.be.closeTo(expectedZakatAmount, ethers.parseEther("0.001"));
      expect(await treasuryVault.operationsBalance()).to.be.closeTo(expectedOperationsAmount, ethers.parseEther("0.001"));
    });

    it("Should emit RevenueReceived event", async function () {
      const depositAmount = ethers.parseEther("10");

      await expect(treasuryVault.depositRevenue({ value: depositAmount }))
        .to.emit(treasuryVault, "RevenueReceived");
    });

    it("Should handle receive() function", async function () {
      const depositAmount = ethers.parseEther("5");

      await owner.sendTransaction({
        to: await treasuryVault.getAddress(),
        value: depositAmount
      });

      expect(await treasuryVault.totalRevenue()).to.equal(depositAmount);
    });

    it("Should store revenue history", async function () {
      const depositAmount = ethers.parseEther("10");

      await treasuryVault.depositRevenue({ value: depositAmount });

      expect(await treasuryVault.getRevenueHistoryCount()).to.equal(1);

      const allocation = await treasuryVault.getRevenueAllocation(0);
      expect(allocation.totalAmount).to.equal(depositAmount);
    });
  });

  describe("Artist Management", function () {
    let tokenId;

    beforeEach(async function () {
      // Mint a track
      const tx = await akashicLabel.mintTrackChain(
        artist1.address,
        "Test Track",
        "Test Artist",
        "spotify:test",
        "vydia:test",
        "ipfs://QmTest/0.json"
      );
      const receipt = await tx.wait();

      // Get token ID from events
      const event = receipt.logs.find(log => {
        try {
          const parsed = akashicLabel.interface.parseLog(log);
          return parsed && parsed.name === "TrackChainMinted";
        } catch (e) {
          return false;
        }
      });

      tokenId = event ? akashicLabel.interface.parseLog(event).args.tokenId : 0n;
    });

    it("Should register track artist", async function () {
      await treasuryVault.registerTrackArtist(tokenId, artist1.address);

      expect(await treasuryVault.trackArtists(tokenId)).to.equal(artist1.address);
    });

    it("Should emit TrackArtistRegistered event", async function () {
      await expect(treasuryVault.registerTrackArtist(tokenId, artist1.address))
        .to.emit(treasuryVault, "TrackArtistRegistered")
        .withArgs(tokenId, artist1.address, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
    });

    it("Should not allow duplicate artist registration", async function () {
      await treasuryVault.registerTrackArtist(tokenId, artist1.address);

      await expect(
        treasuryVault.registerTrackArtist(tokenId, artist2.address)
      ).to.be.revertedWith("Artist already registered");
    });

    it("Should batch register artists", async function () {
      // Mint more tracks
      const tx1 = await akashicLabel.mintTrackChain(
        artist2.address,
        "Test Track 2",
        "Test Artist 2",
        "spotify:test2",
        "vydia:test2",
        "ipfs://QmTest/1.json"
      );
      await tx1.wait();

      const tokenIds = [tokenId, tokenId + 1n];
      const artists = [artist1.address, artist2.address];

      await treasuryVault.batchRegisterTrackArtists(tokenIds, artists);

      expect(await treasuryVault.trackArtists(tokenId)).to.equal(artist1.address);
      expect(await treasuryVault.trackArtists(tokenId + 1n)).to.equal(artist2.address);
    });

    it("Should allocate royalty to artist", async function () {
      await treasuryVault.registerTrackArtist(tokenId, artist1.address);

      const royaltyAmount = ethers.parseEther("1");
      await treasuryVault.allocateRoyalty(tokenId, royaltyAmount);

      expect(await treasuryVault.trackRoyalties(tokenId)).to.equal(royaltyAmount);
      expect(await treasuryVault.artistEarnings(artist1.address)).to.equal(royaltyAmount);
      expect(await treasuryVault.pendingWithdrawals(artist1.address)).to.equal(royaltyAmount);
    });

    it("Should allow artist to withdraw earnings", async function () {
      await treasuryVault.registerTrackArtist(tokenId, artist1.address);

      const royaltyAmount = ethers.parseEther("1");
      
      // Fund the vault
      await treasuryVault.depositRevenue({ value: ethers.parseEther("10") });
      
      // Allocate royalty
      await treasuryVault.allocateRoyalty(tokenId, royaltyAmount);

      const initialBalance = await ethers.provider.getBalance(artist1.address);

      // Artist withdraws
      const tx = await treasuryVault.connect(artist1).artistWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(artist1.address);

      expect(finalBalance).to.equal(initialBalance + royaltyAmount - gasUsed);
      expect(await treasuryVault.pendingWithdrawals(artist1.address)).to.equal(0);
    });
  });

  describe("Zakat Distribution", function () {
    it("Should auto-distribute Zakat when balance exceeds threshold", async function () {
      const depositAmount = ethers.parseEther("15"); // Will create > 1 ETH Zakat

      const initialBalance = await ethers.provider.getBalance(zakatRecipient.address);

      await treasuryVault.depositRevenue({ value: depositAmount });

      const finalBalance = await ethers.provider.getBalance(zakatRecipient.address);

      expect(finalBalance).to.be.gt(initialBalance);
      expect(await treasuryVault.zakatBalance()).to.equal(0);
      expect(await treasuryVault.totalZakatDistributed()).to.be.gt(0);
    });

    it("Should emit ZakatDistributed event", async function () {
      const depositAmount = ethers.parseEther("15");

      await expect(treasuryVault.depositRevenue({ value: depositAmount }))
        .to.emit(treasuryVault, "ZakatDistributed");
    });

    it("Should allow manual Zakat distribution", async function () {
      const depositAmount = ethers.parseEther("5");

      await treasuryVault.depositRevenue({ value: depositAmount });

      const zakatBalanceBefore = await treasuryVault.zakatBalance();
      expect(zakatBalanceBefore).to.be.gt(0);

      await treasuryVault.distributeZakat();

      expect(await treasuryVault.zakatBalance()).to.equal(0);
    });

    it("Should update Zakat recipient", async function () {
      const newRecipient = addrs[0].address;

      await treasuryVault.updateZakatRecipient(newRecipient);

      expect(await treasuryVault.zakatRecipient()).to.equal(newRecipient);
    });
  });

  describe("Treasury Management", function () {
    it("Should withdraw from treasury", async function () {
      const depositAmount = ethers.parseEther("10");
      await treasuryVault.depositRevenue({ value: depositAmount });

      const treasuryBalanceBefore = await treasuryVault.treasuryBalance();
      const withdrawAmount = ethers.parseEther("0.5");

      const recipientBalanceBefore = await ethers.provider.getBalance(addrs[0].address);

      await treasuryVault.withdrawTreasury(addrs[0].address, withdrawAmount, 1);

      const recipientBalanceAfter = await ethers.provider.getBalance(addrs[0].address);

      expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + withdrawAmount);
      expect(await treasuryVault.treasuryBalance()).to.equal(treasuryBalanceBefore - withdrawAmount);
    });

    it("Should withdraw from operations", async function () {
      const depositAmount = ethers.parseEther("10");
      await treasuryVault.depositRevenue({ value: depositAmount });

      const operationsBalanceBefore = await treasuryVault.operationsBalance();
      const withdrawAmount = ethers.parseEther("0.3");

      const recipientBalanceBefore = await ethers.provider.getBalance(addrs[0].address);

      await treasuryVault.withdrawOperations(addrs[0].address, withdrawAmount);

      const recipientBalanceAfter = await ethers.provider.getBalance(addrs[0].address);

      expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + withdrawAmount);
      expect(await treasuryVault.operationsBalance()).to.equal(operationsBalanceBefore - withdrawAmount);
    });

    it("Should get treasury metrics", async function () {
      const depositAmount = ethers.parseEther("10");
      await treasuryVault.depositRevenue({ value: depositAmount });

      const metrics = await treasuryVault.getTreasuryMetrics();

      expect(metrics.totalRevenue).to.equal(depositAmount);
      expect(metrics.treasuryBalance).to.be.gt(0);
      expect(metrics.operationsBalance).to.be.gt(0);
    });
  });

  describe("Access Control", function () {
    it("Should only allow TREASURY_ADMIN_ROLE to register artists", async function () {
      await expect(
        treasuryVault.connect(artist1).registerTrackArtist(0, artist1.address)
      ).to.be.reverted;
    });

    it("Should only allow DISTRIBUTOR_ROLE to allocate royalties", async function () {
      await expect(
        treasuryVault.connect(artist1).allocateRoyalty(0, ethers.parseEther("1"))
      ).to.be.reverted;
    });

    it("Should only allow TREASURY_ADMIN_ROLE to withdraw treasury", async function () {
      await expect(
        treasuryVault.connect(artist1).withdrawTreasury(artist1.address, ethers.parseEther("1"), 1)
      ).to.be.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause", async function () {
      await treasuryVault.pause();
      expect(await treasuryVault.paused()).to.be.true;

      await treasuryVault.unpause();
      expect(await treasuryVault.paused()).to.be.false;
    });

    it("Should not allow artist withdrawal when paused", async function () {
      await treasuryVault.pause();

      await expect(
        treasuryVault.connect(artist1).artistWithdraw()
      ).to.be.reverted;
    });
  });
});
