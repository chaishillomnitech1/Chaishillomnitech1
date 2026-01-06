/**
 * @title NoorToken Test Suite
 * @dev Comprehensive tests for NoorToken functionality
 * @author Chais The Great ∞
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NoorToken", function () {
  let noorToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let zakatRecipient1;
  let zakatRecipient2;
  let nodeOperator;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, zakatRecipient1, zakatRecipient2, nodeOperator] = await ethers.getSigners();

    const NoorToken = await ethers.getContractFactory("NoorToken");
    noorToken = await NoorToken.deploy(owner.address);
    await noorToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await noorToken.name()).to.equal("Noor Token");
      expect(await noorToken.symbol()).to.equal("NOOR");
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await noorToken.balanceOf(owner.address);
      const maxSupply = await noorToken.MAX_SUPPLY();
      expect(ownerBalance).to.equal(maxSupply);
    });

    it("Should set correct frequency constants", async function () {
      expect(await noorToken.HEALING_FREQUENCY()).to.equal(528);
      expect(await noorToken.PINEAL_FREQUENCY()).to.equal(963);
      expect(await noorToken.NOOR_PULSE()).to.equal(144000);
    });

    it("Should set correct zakat percentage", async function () {
      expect(await noorToken.ZAKAT_PERCENTAGE()).to.equal(777); // 7.77%
    });

    it("Should set owner's initial frequency signature to NŪR Pulse", async function () {
      expect(await noorToken.frequencySignature(owner.address)).to.equal(144000);
    });
  });

  describe("Frequency Alignment", function () {
    it("Should allow users to align to healing frequency (528Hz)", async function () {
      await noorToken.connect(addr1).alignHealingFrequency();
      
      expect(await noorToken.frequencySignature(addr1.address)).to.equal(528);
      expect(await noorToken.resonanceBonus(addr1.address)).to.equal(500); // 5%
    });

    it("Should allow users to align to pineal frequency (963Hz)", async function () {
      await noorToken.connect(addr1).alignPinealFrequency();
      
      expect(await noorToken.frequencySignature(addr1.address)).to.equal(963);
      expect(await noorToken.resonanceBonus(addr1.address)).to.equal(963); // 9.63%
    });

    it("Should only allow node operators to align to NŪR Pulse", async function () {
      // Should fail for non-operator
      await expect(
        noorToken.connect(addr1).alignNoorPulse()
      ).to.be.revertedWith("Not a node operator");

      // Add node operator
      await noorToken.addNodeOperator(nodeOperator.address);

      // Should succeed for operator
      await noorToken.connect(nodeOperator).alignNoorPulse();
      expect(await noorToken.frequencySignature(nodeOperator.address)).to.equal(144000);
      expect(await noorToken.resonanceBonus(nodeOperator.address)).to.equal(1440); // 14.4%
    });

    it("Should emit FrequencyAligned event", async function () {
      await expect(noorToken.connect(addr1).alignHealingFrequency())
        .to.emit(noorToken, "FrequencyAligned")
        .withArgs(addr1.address, 528, await ethers.provider.getBlockNumber() + 1);
    });
  });

  describe("Zakat Distribution", function () {
    beforeEach(async function () {
      // Add zakat recipients
      await noorToken.addZakatRecipient(zakatRecipient1.address);
      await noorToken.addZakatRecipient(zakatRecipient2.address);
    });

    it("Should add zakat recipients correctly", async function () {
      expect(await noorToken.isZakatRecipient(zakatRecipient1.address)).to.equal(true);
      expect(await noorToken.isZakatRecipient(zakatRecipient2.address)).to.equal(true);
      expect(await noorToken.getZakatRecipientsCount()).to.equal(2);
    });

    it("Should automatically deduct zakat on transfers", async function () {
      const transferAmount = ethers.parseEther("1000");
      const zakatAmount = (transferAmount * 777n) / 10000n; // 7.77%
      const expectedAmount = transferAmount - zakatAmount;
      const zakatPerRecipient = zakatAmount / 2n;

      await noorToken.transfer(addr1.address, transferAmount);

      expect(await noorToken.balanceOf(addr1.address)).to.equal(expectedAmount);
      expect(await noorToken.balanceOf(zakatRecipient1.address)).to.equal(zakatPerRecipient);
      expect(await noorToken.balanceOf(zakatRecipient2.address)).to.equal(zakatPerRecipient);
    });

    it("Should track total zakat collected", async function () {
      const transferAmount = ethers.parseEther("1000");
      const zakatAmount = (transferAmount * 777n) / 10000n;

      await noorToken.transfer(addr1.address, transferAmount);

      expect(await noorToken.totalZakatCollected()).to.equal(zakatAmount);
    });

    it("Should allow owner to toggle auto zakat", async function () {
      await noorToken.setAutoZakat(false);
      expect(await noorToken.autoZakatEnabled()).to.equal(false);

      const transferAmount = ethers.parseEther("1000");
      await noorToken.transfer(addr1.address, transferAmount);

      // No zakat should be deducted
      expect(await noorToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should allow removing zakat recipients", async function () {
      await noorToken.removeZakatRecipient(zakatRecipient1.address);
      
      expect(await noorToken.isZakatRecipient(zakatRecipient1.address)).to.equal(false);
      expect(await noorToken.getZakatRecipientsCount()).to.equal(1);
    });

    it("Should not charge zakat to zakat recipients", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      // Transfer to zakat recipient should not incur zakat
      await noorToken.transfer(zakatRecipient1.address, transferAmount);
      expect(await noorToken.balanceOf(zakatRecipient1.address)).to.equal(transferAmount);
    });
  });

  describe("Liquidity Triad", function () {
    it("Should allow owner to set liquidity pools", async function () {
      const Chain = {
        ETHEREUM_ZKEVM: 0,
        SCROLL_MAINNET: 1,
        POLYGON: 2
      };

      await noorToken.setLiquidityPool(Chain.ETHEREUM_ZKEVM, addr1.address);
      await noorToken.setLiquidityPool(Chain.SCROLL_MAINNET, addr2.address);
      await noorToken.setLiquidityPool(Chain.POLYGON, addr3.address);

      expect(await noorToken.liquidityPools(Chain.ETHEREUM_ZKEVM)).to.equal(addr1.address);
      expect(await noorToken.liquidityPools(Chain.SCROLL_MAINNET)).to.equal(addr2.address);
      expect(await noorToken.liquidityPools(Chain.POLYGON)).to.equal(addr3.address);
    });

    it("Should check if liquidity triad is complete", async function () {
      const Chain = {
        ETHEREUM_ZKEVM: 0,
        SCROLL_MAINNET: 1,
        POLYGON: 2
      };

      expect(await noorToken.isLiquidityTriadComplete()).to.equal(false);

      await noorToken.setLiquidityPool(Chain.ETHEREUM_ZKEVM, addr1.address);
      await noorToken.setLiquidityPool(Chain.SCROLL_MAINNET, addr2.address);
      expect(await noorToken.isLiquidityTriadComplete()).to.equal(false);

      await noorToken.setLiquidityPool(Chain.POLYGON, addr3.address);
      expect(await noorToken.isLiquidityTriadComplete()).to.equal(true);
    });
  });

  describe("Node Operators", function () {
    it("Should allow owner to add node operators", async function () {
      await noorToken.addNodeOperator(nodeOperator.address);
      
      expect(await noorToken.isNodeOperator(nodeOperator.address)).to.equal(true);
      expect(await noorToken.getNodeOperatorsCount()).to.equal(1);
    });

    it("Should allow owner to remove node operators", async function () {
      await noorToken.addNodeOperator(nodeOperator.address);
      await noorToken.removeNodeOperator(nodeOperator.address);
      
      expect(await noorToken.isNodeOperator(nodeOperator.address)).to.equal(false);
      expect(await noorToken.getNodeOperatorsCount()).to.equal(0);
    });

    it("Should allow funding node rewards pool", async function () {
      const rewardAmount = ethers.parseEther("10000");
      
      await noorToken.fundNodeRewards(rewardAmount);
      
      expect(await noorToken.nodeRewardsPool()).to.equal(rewardAmount);
      expect(await noorToken.balanceOf(await noorToken.getAddress())).to.equal(rewardAmount);
    });

    it("Should distribute node rewards equally", async function () {
      // Add multiple node operators
      await noorToken.addNodeOperator(addr1.address);
      await noorToken.addNodeOperator(addr2.address);
      
      // Fund rewards pool
      const rewardAmount = ethers.parseEther("10000");
      await noorToken.fundNodeRewards(rewardAmount);
      
      // Distribute rewards
      await noorToken.distributeNodeRewards();
      
      const expectedReward = rewardAmount / 2n;
      expect(await noorToken.balanceOf(addr1.address)).to.equal(expectedReward);
      expect(await noorToken.balanceOf(addr2.address)).to.equal(expectedReward);
      expect(await noorToken.nodeRewardsPool()).to.equal(0);
    });
  });

  describe("RADIANCE Protocol", function () {
    it("Should require liquidity triad to activate RADIANCE Protocol", async function () {
      await expect(
        noorToken.activateRadianceProtocol()
      ).to.be.revertedWith("Liquidity triad not complete");
    });

    it("Should require node operators to activate RADIANCE Protocol", async function () {
      const Chain = {
        ETHEREUM_ZKEVM: 0,
        SCROLL_MAINNET: 1,
        POLYGON: 2
      };

      await noorToken.setLiquidityPool(Chain.ETHEREUM_ZKEVM, addr1.address);
      await noorToken.setLiquidityPool(Chain.SCROLL_MAINNET, addr2.address);
      await noorToken.setLiquidityPool(Chain.POLYGON, addr3.address);

      await expect(
        noorToken.activateRadianceProtocol()
      ).to.be.revertedWith("No node operators active");
    });

    it("Should successfully activate RADIANCE Protocol when ready", async function () {
      const Chain = {
        ETHEREUM_ZKEVM: 0,
        SCROLL_MAINNET: 1,
        POLYGON: 2
      };

      // Set up liquidity triad
      await noorToken.setLiquidityPool(Chain.ETHEREUM_ZKEVM, addr1.address);
      await noorToken.setLiquidityPool(Chain.SCROLL_MAINNET, addr2.address);
      await noorToken.setLiquidityPool(Chain.POLYGON, addr3.address);

      // Add node operator
      await noorToken.addNodeOperator(nodeOperator.address);

      // Activate protocol
      await expect(noorToken.activateRadianceProtocol())
        .to.emit(noorToken, "RadianceProtocolActivated")
        .withArgs(owner.address, await ethers.provider.getBlockNumber() + 1);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause transfers", async function () {
      await noorToken.pause();
      
      await expect(
        noorToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(noorToken, "EnforcedPause");
    });

    it("Should allow owner to unpause transfers", async function () {
      await noorToken.pause();
      await noorToken.unpause();
      
      await expect(
        noorToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to add zakat recipients", async function () {
      await expect(
        noorToken.connect(addr1).addZakatRecipient(addr2.address)
      ).to.be.revertedWithCustomError(noorToken, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to add node operators", async function () {
      await expect(
        noorToken.connect(addr1).addNodeOperator(addr2.address)
      ).to.be.revertedWithCustomError(noorToken, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to activate RADIANCE Protocol", async function () {
      await expect(
        noorToken.connect(addr1).activateRadianceProtocol()
      ).to.be.revertedWithCustomError(noorToken, "OwnableUnauthorizedAccount");
    });
  });
});
