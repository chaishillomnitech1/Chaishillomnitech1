// Test suite for AkashicTreasuryVault
// Tests royalty distribution, Zakat routing, and treasury management

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AkashicTreasuryVault", function () {
  let treasuryVault;
  let owner;
  let artistVault;
  let treasuryOps;
  let zakatVault;
  let reserveVault;
  let artist1;
  let artist2;

  beforeEach(async function () {
    [owner, artistVault, treasuryOps, zakatVault, reserveVault, artist1, artist2] = await ethers.getSigners();

    const AkashicTreasuryVault = await ethers.getContractFactory("AkashicTreasuryVault");
    treasuryVault = await AkashicTreasuryVault.deploy(
      artistVault.address,
      treasuryOps.address,
      zakatVault.address,
      reserveVault.address
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
    it("Should set the correct vault addresses", async function () {
      const vaults = await treasuryVault.getVaults();
      expect(vaults.artist).to.equal(artistVault.address);
      expect(vaults.treasury).to.equal(treasuryOps.address);
      expect(vaults.zakat).to.equal(zakatVault.address);
      expect(vaults.reserve).to.equal(reserveVault.address);
    });

    it("Should set correct distribution percentages", async function () {
      const percentages = await treasuryVault.getDistributionPercentages();
      expect(percentages.artist).to.equal(7000); // 70%
      expect(percentages.treasury).to.equal(1500); // 15%
      expect(percentages.zakat).to.equal(777); // 7.77%
      expect(percentages.reserve).to.equal(723); // 7.23%
    });

    it("Should set the owner correctly", async function () {
      expect(await treasuryVault.owner()).to.equal(owner.address);
    });

    it("Should revert if any vault address is zero", async function () {
      const AkashicTreasuryVault = await ethers.getContractFactory("AkashicTreasuryVault");
      
      await expect(
        AkashicTreasuryVault.deploy(
          ethers.ZeroAddress,
          treasuryOps.address,
          zakatVault.address,
          reserveVault.address
        )
      ).to.be.revertedWith("Invalid artist vault");
    });
  });

  describe("Royalty Distribution", function () {
    it("Should distribute royalties according to percentages", async function () {
      const royaltyAmount = ethers.parseEther("10"); // 10 MATIC
      
      const artistBalanceBefore = await ethers.provider.getBalance(artist1.address);
      const artistVaultBalanceBefore = await ethers.provider.getBalance(artistVault.address);
      const treasuryBalanceBefore = await ethers.provider.getBalance(treasuryOps.address);
      const zakatBalanceBefore = await ethers.provider.getBalance(zakatVault.address);
      const reserveBalanceBefore = await ethers.provider.getBalance(reserveVault.address);

      await treasuryVault.distributeRoyalties(artist1.address, { value: royaltyAmount });

      const artistVaultBalanceAfter = await ethers.provider.getBalance(artistVault.address);
      const treasuryBalanceAfter = await ethers.provider.getBalance(treasuryOps.address);
      const zakatBalanceAfter = await ethers.provider.getBalance(zakatVault.address);
      const reserveBalanceAfter = await ethers.provider.getBalance(reserveVault.address);

      // Artist gets 70% routed to artist vault (not directly to artist1)
      expect(artistVaultBalanceAfter - artistVaultBalanceBefore).to.equal(ethers.parseEther("7")); // 70%
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(ethers.parseEther("1.5")); // 15%
      expect(zakatBalanceAfter - zakatBalanceBefore).to.equal(ethers.parseEther("0.777")); // 7.77%
      expect(reserveBalanceAfter - reserveBalanceBefore).to.equal(ethers.parseEther("0.723")); // 7.23%
    });

    it("Should update tracking variables", async function () {
      const royaltyAmount = ethers.parseEther("10");
      
      await treasuryVault.distributeRoyalties(artist1.address, { value: royaltyAmount });

      const stats = await treasuryVault.getStatistics();
      expect(stats.totalRoyalties).to.equal(royaltyAmount);
      expect(stats.totalZakat).to.equal(ethers.parseEther("0.777"));

      const artistRoyalties = await treasuryVault.artistRoyalties(artist1.address);
      expect(artistRoyalties).to.equal(ethers.parseEther("7")); // 70% tracked
    });

    it("Should emit RoyaltyDistributed event", async function () {
      const royaltyAmount = ethers.parseEther("10");
      
      await expect(treasuryVault.distributeRoyalties(artist1.address, { value: royaltyAmount }))
        .to.emit(treasuryVault, "RoyaltyDistributed")
        .withArgs(
          artist1.address,
          ethers.parseEther("7"),
          ethers.parseEther("1.5"),
          ethers.parseEther("0.777"),
          ethers.parseEther("0.723"),
          await ethers.provider.getBlockNumber() + 1
        );
    });

    it("Should revert if royalty amount is zero", async function () {
      await expect(
        treasuryVault.distributeRoyalties(artist1.address, { value: 0 })
      ).to.be.revertedWith("No royalty amount");
    });

    it("Should revert if artist address is zero", async function () {
      await expect(
        treasuryVault.distributeRoyalties(ethers.ZeroAddress, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Invalid artist address");
    });
  });

  describe("Batch Royalty Distribution", function () {
    it("Should distribute to multiple artists", async function () {
      const artists = [artist1.address, artist2.address];
      const amounts = [ethers.parseEther("5"), ethers.parseEther("3")];
      const totalAmount = ethers.parseEther("8");

      const artistVaultBalanceBefore = await ethers.provider.getBalance(artistVault.address);
      
      await treasuryVault.batchDistributeRoyalties(artists, amounts, { value: totalAmount });

      const artistVaultBalanceAfter = await ethers.provider.getBalance(artistVault.address);
      
      // 70% of 8 = 5.6
      expect(artistVaultBalanceAfter - artistVaultBalanceBefore).to.equal(ethers.parseEther("5.6"));

      // Check individual tracking
      const artist1Royalties = await treasuryVault.artistRoyalties(artist1.address);
      const artist2Royalties = await treasuryVault.artistRoyalties(artist2.address);
      expect(artist1Royalties).to.equal(ethers.parseEther("3.5")); // 70% of 5
      expect(artist2Royalties).to.equal(ethers.parseEther("2.1")); // 70% of 3
    });

    it("Should revert if arrays have mismatched lengths", async function () {
      const artists = [artist1.address, artist2.address];
      const amounts = [ethers.parseEther("5")];

      await expect(
        treasuryVault.batchDistributeRoyalties(artists, amounts, { value: ethers.parseEther("5") })
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should revert if payment is insufficient", async function () {
      const artists = [artist1.address];
      const amounts = [ethers.parseEther("5")];

      await expect(
        treasuryVault.batchDistributeRoyalties(artists, amounts, { value: ethers.parseEther("3") })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Vault Management", function () {
    it("Should allow owner to update artist vault", async function () {
      const newVault = artist2.address;
      
      await expect(treasuryVault.setArtistVault(newVault))
        .to.emit(treasuryVault, "VaultUpdated")
        .withArgs("Artist", artistVault.address, newVault, await ethers.provider.getBlockNumber() + 1);

      const vaults = await treasuryVault.getVaults();
      expect(vaults.artist).to.equal(newVault);
    });

    it("Should allow owner to update treasury vault", async function () {
      const newVault = artist2.address;
      
      await treasuryVault.setTreasuryVault(newVault);
      
      const vaults = await treasuryVault.getVaults();
      expect(vaults.treasury).to.equal(newVault);
    });

    it("Should allow owner to update zakat vault", async function () {
      const newVault = artist2.address;
      
      await treasuryVault.setZakatVault(newVault);
      
      const vaults = await treasuryVault.getVaults();
      expect(vaults.zakat).to.equal(newVault);
    });

    it("Should allow owner to update reserve vault", async function () {
      const newVault = artist2.address;
      
      await treasuryVault.setReserveVault(newVault);
      
      const vaults = await treasuryVault.getVaults();
      expect(vaults.reserve).to.equal(newVault);
    });

    it("Should revert if non-owner tries to update vaults", async function () {
      await expect(
        treasuryVault.connect(artist1).setArtistVault(artist2.address)
      ).to.be.reverted;
    });

    it("Should revert if new vault address is zero", async function () {
      await expect(
        treasuryVault.setArtistVault(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid vault address");
    });
  });

  describe("Zakat Management", function () {
    it("Should emit event for Zakat disbursement tracking", async function () {
      const recipient = artist1.address;
      const amount = ethers.parseEther("1");
      const purpose = "Community support program";

      await expect(treasuryVault.disburseZakat(recipient, amount, purpose))
        .to.emit(treasuryVault, "ZakatDisbursed")
        .withArgs(recipient, amount, purpose, await ethers.provider.getBlockNumber() + 1);
    });

    it("Should revert if purpose is empty", async function () {
      await expect(
        treasuryVault.disburseZakat(artist1.address, ethers.parseEther("1"), "")
      ).to.be.revertedWith("Purpose required");
    });

    it("Should only allow owner to disburse Zakat", async function () {
      await expect(
        treasuryVault.connect(artist1).disburseZakat(
          artist2.address,
          ethers.parseEther("1"),
          "Test purpose"
        )
      ).to.be.reverted;
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause", async function () {
      await treasuryVault.pause();
      expect(await treasuryVault.paused()).to.be.true;
    });

    it("Should prevent distributions when paused", async function () {
      await treasuryVault.pause();
      
      await expect(
        treasuryVault.distributeRoyalties(artist1.address, { value: ethers.parseEther("1") })
      ).to.be.reverted;
    });

    it("Should allow owner to unpause", async function () {
      await treasuryVault.pause();
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
        .to.emit(treasuryVault, "TrackArtistRegistered");
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

    it("Should allow emergency withdrawal when paused", async function () {
      // First, add funds to contract
      await owner.sendTransaction({
        to: await treasuryVault.getAddress(),
        value: ethers.parseEther("10")
      });

      await treasuryVault.pause();
      
      const balanceBefore = await ethers.provider.getBalance(artist1.address);
      
      await treasuryVault.emergencyWithdraw(
        artist1.address,
        ethers.parseEther("5"),
        "Emergency situation"
      );

      const balanceAfter = await ethers.provider.getBalance(artist1.address);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("5"));
    });

    it("Should revert emergency withdrawal when not paused", async function () {
      await expect(
        treasuryVault.emergencyWithdraw(
          artist1.address,
          ethers.parseEther("1"),
          "Emergency"
        )
      ).to.be.reverted;
    });
  });

  describe("Receive Function", function () {
    it("Should accept direct payments", async function () {
      const amount = ethers.parseEther("5");
      
      await owner.sendTransaction({
        to: await treasuryVault.getAddress(),
        value: amount
      });

      const balance = await ethers.provider.getBalance(await treasuryVault.getAddress());
      expect(balance).to.equal(amount);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for single distribution", async function () {
      const tx = await treasuryVault.distributeRoyalties(
        artist1.address,
        { value: ethers.parseEther("10") }
      );
      const receipt = await tx.wait();
      
      // Gas should be reasonable (under 200k for distribution)
      expect(receipt.gasUsed).to.be.lessThan(200000);
    });
  });
    it("Should not allow artist withdrawal when paused", async function () {
      await treasuryVault.pause();

      await expect(
        treasuryVault.connect(artist1).artistWithdraw()
      ).to.be.reverted;
    });
  });
});
