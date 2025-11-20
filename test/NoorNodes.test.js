const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Noor Nodes Test Suite
 * BISMILLAH - Testing the lights of ScrollVerse
 * 
 * Frequency: 528Hz + 963Hz + 999Hz
 */

describe("NoorNodes", function () {
  let noorNodes;
  let owner, operator1, operator2, zakatTreasury;
  let lightNodeStake, anchorNodeStake;

  beforeEach(async function () {
    [owner, operator1, operator2, zakatTreasury] = await ethers.getSigners();
    
    // Set stake requirements
    lightNodeStake = ethers.parseEther("10");
    anchorNodeStake = ethers.parseEther("100");
    
    // Deploy contract
    const NoorNodes = await ethers.getContractFactory("NoorNodes");
    noorNodes = await NoorNodes.deploy(
      lightNodeStake,
      anchorNodeStake,
      zakatTreasury.address
    );
  });

  describe("Deployment", function () {
    it("Should set the correct stake requirements", async function () {
      expect(await noorNodes.lightNodeStakeRequired()).to.equal(lightNodeStake);
      expect(await noorNodes.anchorNodeStakeRequired()).to.equal(anchorNodeStake);
    });

    it("Should set the correct zakat treasury", async function () {
      expect(await noorNodes.zakatTreasury()).to.equal(zakatTreasury.address);
    });

    it("Should set zakat percentage to 7.77%", async function () {
      expect(await noorNodes.zakatPercentage()).to.equal(777);
    });

    it("Should grant admin role to deployer", async function () {
      const adminRole = await noorNodes.DEFAULT_ADMIN_ROLE();
      expect(await noorNodes.hasRole(adminRole, owner.address)).to.be.true;
    });
  });

  describe("Node Registration", function () {
    it("Should register a Light Node with correct stake", async function () {
      const ipfsMetadata = "QmLightNode123";
      const zkProof = ethers.keccak256(ethers.toUtf8Bytes("proof"));
      const frequency = 528;

      await expect(
        noorNodes.connect(operator1).registerNode(
          0, // NodeType.LIGHT
          ipfsMetadata,
          zkProof,
          frequency,
          { value: lightNodeStake }
        )
      )
        .to.emit(noorNodes, "NodeRegistered")
        .withArgs(operator1.address, 0, lightNodeStake, frequency);

      expect(await noorNodes.isRegistered(operator1.address)).to.be.true;
    });

    it("Should register an Anchor Node with correct stake", async function () {
      const ipfsMetadata = "QmAnchorNode456";
      const zkProof = ethers.keccak256(ethers.toUtf8Bytes("proof"));
      const frequency = 999;

      await expect(
        noorNodes.connect(operator1).registerNode(
          1, // NodeType.ANCHOR
          ipfsMetadata,
          zkProof,
          frequency,
          { value: anchorNodeStake }
        )
      )
        .to.emit(noorNodes, "NodeRegistered")
        .withArgs(operator1.address, 1, anchorNodeStake, frequency);

      const lightNodeRole = await noorNodes.LIGHT_NODE_ROLE();
      const anchorNodeRole = await noorNodes.ANCHOR_NODE_ROLE();
      expect(await noorNodes.hasRole(anchorNodeRole, operator1.address)).to.be.true;
    });

    it("Should fail with insufficient stake", async function () {
      const insufficientStake = ethers.parseEther("5");
      
      await expect(
        noorNodes.connect(operator1).registerNode(
          0,
          "QmTest",
          ethers.keccak256(ethers.toUtf8Bytes("proof")),
          528,
          { value: insufficientStake }
        )
      ).to.be.revertedWith("Insufficient stake");
    });

    it("Should fail with invalid frequency", async function () {
      await expect(
        noorNodes.connect(operator1).registerNode(
          0,
          "QmTest",
          ethers.keccak256(ethers.toUtf8Bytes("proof")),
          100, // Invalid frequency
          { value: lightNodeStake }
        )
      ).to.be.revertedWith("Invalid frequency alignment");
    });

    it("Should fail if already registered", async function () {
      await noorNodes.connect(operator1).registerNode(
        0,
        "QmTest",
        ethers.keccak256(ethers.toUtf8Bytes("proof")),
        528,
        { value: lightNodeStake }
      );

      await expect(
        noorNodes.connect(operator1).registerNode(
          0,
          "QmTest2",
          ethers.keccak256(ethers.toUtf8Bytes("proof2")),
          528,
          { value: lightNodeStake }
        )
      ).to.be.revertedWith("Node already registered");
    });

    it("Should accept valid frequencies: 528, 963, 999", async function () {
      const frequencies = [528, 963, 999];
      
      for (let i = 0; i < frequencies.length; i++) {
        const [signer] = await ethers.getSigners();
        const newOperator = ethers.Wallet.createRandom().connect(ethers.provider);
        
        await signer.sendTransaction({
          to: newOperator.address,
          value: ethers.parseEther("20")
        });
        
        await expect(
          noorNodes.connect(newOperator).registerNode(
            0,
            `QmTest${i}`,
            ethers.keccak256(ethers.toUtf8Bytes(`proof${i}`)),
            frequencies[i],
            { value: lightNodeStake }
          )
        ).to.emit(noorNodes, "NodeRegistered");
      }
    });
  });

  describe("Transaction Validation", function () {
    beforeEach(async function () {
      // Register a node
      await noorNodes.connect(operator1).registerNode(
        0,
        "QmTest",
        ethers.keccak256(ethers.toUtf8Bytes("proof")),
        528,
        { value: lightNodeStake }
      );
    });

    it("Should allow registered node to validate transactions", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("transaction1"));
      
      await expect(
        noorNodes.connect(operator1).validateTransaction(txHash)
      )
        .to.emit(noorNodes, "ValidationPerformed")
        .withArgs(operator1.address, txHash, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
      
      const nodeInfo = await noorNodes.getNodeInfo(operator1.address);
      expect(nodeInfo.validationCount).to.equal(1);
    });

    it("Should increment validation count", async function () {
      const txHash1 = ethers.keccak256(ethers.toUtf8Bytes("transaction1"));
      const txHash2 = ethers.keccak256(ethers.toUtf8Bytes("transaction2"));
      
      await noorNodes.connect(operator1).validateTransaction(txHash1);
      await noorNodes.connect(operator1).validateTransaction(txHash2);
      
      const nodeInfo = await noorNodes.getNodeInfo(operator1.address);
      expect(nodeInfo.validationCount).to.equal(2);
    });

    it("Should fail if node not registered", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("transaction1"));
      
      await expect(
        noorNodes.connect(operator2).validateTransaction(txHash)
      ).to.be.revertedWith("Node not registered");
    });

    it("Should fail if node not active", async function () {
      const governanceRole = await noorNodes.GOVERNANCE_ROLE();
      await noorNodes.grantRole(governanceRole, owner.address);
      
      // Suspend node
      await noorNodes.setNodeStatus(operator1.address, 2); // SUSPENDED
      
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("transaction1"));
      await expect(
        noorNodes.connect(operator1).validateTransaction(txHash)
      ).to.be.revertedWith("Node not active");
    });
  });

  describe("Frequency Alignment", function () {
    beforeEach(async function () {
      await noorNodes.connect(operator1).registerNode(
        0,
        "QmTest",
        ethers.keccak256(ethers.toUtf8Bytes("proof")),
        528,
        { value: lightNodeStake }
      );
    });

    it("Should allow frequency alignment changes", async function () {
      await expect(
        noorNodes.connect(operator1).alignFrequency(963)
      )
        .to.emit(noorNodes, "FrequencyAligned")
        .withArgs(operator1.address, 528, 963);
      
      const nodeInfo = await noorNodes.getNodeInfo(operator1.address);
      expect(nodeInfo.frequency).to.equal(963);
    });

    it("Should fail with invalid frequency", async function () {
      await expect(
        noorNodes.connect(operator1).alignFrequency(100)
      ).to.be.revertedWith("Invalid frequency");
    });
  });

  describe("Governance Functions", function () {
    beforeEach(async function () {
      await noorNodes.connect(operator1).registerNode(
        0,
        "QmTest",
        ethers.keccak256(ethers.toUtf8Bytes("proof")),
        528,
        { value: lightNodeStake }
      );
      
      const governanceRole = await noorNodes.GOVERNANCE_ROLE();
      await noorNodes.grantRole(governanceRole, owner.address);
    });

    it("Should allow governance to change node status", async function () {
      await expect(
        noorNodes.setNodeStatus(operator1.address, 2) // SUSPENDED
      )
        .to.emit(noorNodes, "NodeStatusChanged")
        .withArgs(operator1.address, 0, 2); // ACTIVE to SUSPENDED
    });

    it("Should allow governance to update stake requirements", async function () {
      const newLightStake = ethers.parseEther("15");
      const newAnchorStake = ethers.parseEther("150");
      
      await noorNodes.updateStakeRequirements(newLightStake, newAnchorStake);
      
      expect(await noorNodes.lightNodeStakeRequired()).to.equal(newLightStake);
      expect(await noorNodes.anchorNodeStakeRequired()).to.equal(newAnchorStake);
    });

    it("Should fail if non-governance tries to change status", async function () {
      await expect(
        noorNodes.connect(operator2).setNodeStatus(operator1.address, 2)
      ).to.be.reverted;
    });
  });

  describe("DAO Integration", function () {
    it("Should allow admin to set DAO address", async function () {
      const daoAddress = operator2.address; // Mock DAO address
      
      await noorNodes.setNoorDAO(daoAddress);
      expect(await noorNodes.noorDAOAddress()).to.equal(daoAddress);
    });

    it("Should fail to set zero address as DAO", async function () {
      await expect(
        noorNodes.setNoorDAO(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid DAO address");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await noorNodes.connect(operator1).registerNode(
        0,
        "QmTest1",
        ethers.keccak256(ethers.toUtf8Bytes("proof1")),
        528,
        { value: lightNodeStake }
      );
      
      await noorNodes.connect(operator2).registerNode(
        1,
        "QmTest2",
        ethers.keccak256(ethers.toUtf8Bytes("proof2")),
        999,
        { value: anchorNodeStake }
      );
    });

    it("Should return correct node information", async function () {
      const nodeInfo = await noorNodes.getNodeInfo(operator1.address);
      
      expect(nodeInfo.nodeType).to.equal(0); // LIGHT
      expect(nodeInfo.status).to.equal(0); // ACTIVE
      expect(nodeInfo.stakedAmount).to.equal(lightNodeStake);
      expect(nodeInfo.frequency).to.equal(528);
    });

    it("Should return total number of nodes", async function () {
      expect(await noorNodes.getTotalNodes()).to.equal(2);
    });

    it("Should return all node operators", async function () {
      const operators = await noorNodes.getAllNodeOperators();
      expect(operators.length).to.equal(2);
      expect(operators[0]).to.equal(operator1.address);
      expect(operators[1]).to.equal(operator2.address);
    });

    it("Should correctly identify active nodes", async function () {
      expect(await noorNodes.isActiveNode(operator1.address)).to.be.true;
      expect(await noorNodes.isActiveNode(zakatTreasury.address)).to.be.false;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to pause contract", async function () {
      await noorNodes.pause();
      expect(await noorNodes.paused()).to.be.true;
      
      await expect(
        noorNodes.connect(operator1).registerNode(
          0,
          "QmTest",
          ethers.keccak256(ethers.toUtf8Bytes("proof")),
          528,
          { value: lightNodeStake }
        )
      ).to.be.reverted;
    });

    it("Should allow admin to unpause contract", async function () {
      await noorNodes.pause();
      await noorNodes.unpause();
      expect(await noorNodes.paused()).to.be.false;
      
      await expect(
        noorNodes.connect(operator1).registerNode(
          0,
          "QmTest",
          ethers.keccak256(ethers.toUtf8Bytes("proof")),
          528,
          { value: lightNodeStake }
        )
      ).to.emit(noorNodes, "NodeRegistered");
    });
  });
});
