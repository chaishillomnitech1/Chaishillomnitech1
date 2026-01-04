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
});
