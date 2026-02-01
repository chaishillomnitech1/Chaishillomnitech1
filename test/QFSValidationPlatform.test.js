/**
 * @title QFS Validation Platform Test Suite
 * @notice Comprehensive tests for QFS Validation Company and Governance Token
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("QFS Validation Platform", function () {
  let qfsgov;
  let qfsValidation;
  let owner;
  let validator1;
  let validator2;
  let addr1;
  let addr2;

  const MINIMUM_STAKE = ethers.utils.parseEther("1000");
  const INITIAL_SUPPLY = ethers.utils.parseEther("10000000");

  beforeEach(async function () {
    [owner, validator1, validator2, addr1, addr2] = await ethers.getSigners();

    // Deploy QFS Governance Token
    const QFSGovernanceToken = await ethers.getContractFactory("QFSGovernanceToken");
    qfsgov = await QFSGovernanceToken.deploy(owner.address);
    await qfsgov.deployed();

    // Deploy QFS Validation Company
    const QFSValidationCompany = await ethers.getContractFactory("QFSValidationCompany");
    qfsValidation = await QFSValidationCompany.deploy(owner.address);
    await qfsValidation.deployed();

    // Configure relationships
    await qfsgov.setValidationCompany(qfsValidation.address);
    await qfsgov.addMinter(qfsValidation.address);

    // Fund rewards pool
    await qfsValidation.fundRewardsPool({ value: ethers.utils.parseEther("100") });
  });

  describe("QFS Governance Token", function () {
    describe("Deployment", function () {
      it("Should set correct initial supply", async function () {
        expect(await qfsgov.totalSupply()).to.equal(INITIAL_SUPPLY);
      });

      it("Should set correct max supply", async function () {
        expect(await qfsgov.MAX_SUPPLY()).to.equal(ethers.utils.parseEther("100000000"));
      });

      it("Should assign initial supply to owner", async function () {
        expect(await qfsgov.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
      });

      it("Should set owner as initial minter", async function () {
        expect(await qfsgov.minters(owner.address)).to.be.true;
      });
    });

    describe("Governance", function () {
      it("Should create proposal with sufficient tokens", async function () {
        const proposalId = await qfsgov.createProposal(
          "Test proposal",
          7 * 24 * 60 * 60 // 7 days
        );
        
        await expect(proposalId).to.emit(qfsgov, "ProposalCreated");
      });

      it("Should not allow proposal creation without sufficient tokens", async function () {
        await expect(
          qfsgov.connect(addr1).createProposal("Test", 7 * 24 * 60 * 60)
        ).to.be.revertedWith("Insufficient tokens to propose");
      });

      it("Should allow voting on proposals", async function () {
        // Transfer tokens to validator
        await qfsgov.transfer(validator1.address, ethers.utils.parseEther("5000"));
        
        // Create proposal
        await qfsgov.createProposal("Test proposal", 7 * 24 * 60 * 60);
        
        // Vote on proposal
        await expect(qfsgov.connect(validator1).vote(1, true))
          .to.emit(qfsgov, "VoteCast");
      });

      it("Should not allow double voting", async function () {
        await qfsgov.transfer(validator1.address, ethers.utils.parseEther("5000"));
        await qfsgov.createProposal("Test proposal", 7 * 24 * 60 * 60);
        
        await qfsgov.connect(validator1).vote(1, true);
        
        await expect(
          qfsgov.connect(validator1).vote(1, true)
        ).to.be.revertedWith("Already voted");
      });
    });

    describe("Delegation", function () {
      it("Should allow voting power delegation", async function () {
        await qfsgov.transfer(validator1.address, ethers.utils.parseEther("5000"));
        
        await expect(qfsgov.connect(validator1).delegate(validator2.address))
          .to.emit(qfsgov, "DelegateChanged");
        
        expect(await qfsgov.getVotingPower(validator2.address)).to.equal(
          ethers.utils.parseEther("5000")
        );
      });

      it("Should not allow self-delegation", async function () {
        await expect(
          qfsgov.connect(validator1).delegate(validator1.address)
        ).to.be.revertedWith("Cannot delegate to self");
      });
    });
  });

  describe("QFS Validation Company", function () {
    describe("Validator Registration", function () {
      it("Should register validator with sufficient stake", async function () {
        await expect(
          qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE })
        ).to.emit(qfsValidation, "ValidatorRegistered");
        
        const validator = await qfsValidation.getValidator(validator1.address);
        expect(validator.isActive).to.be.true;
        expect(validator.stakingAmount).to.equal(MINIMUM_STAKE);
      });

      it("Should not register with insufficient stake", async function () {
        await expect(
          qfsValidation.connect(validator1).registerValidator({ 
            value: ethers.utils.parseEther("500") 
          })
        ).to.be.revertedWith("Insufficient stake");
      });

      it("Should not allow duplicate registration", async function () {
        await qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE });
        
        await expect(
          qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE })
        ).to.be.revertedWith("Already registered");
      });

      it("Should set initial reputation to 500", async function () {
        await qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE });
        
        const validator = await qfsValidation.getValidator(validator1.address);
        expect(validator.reputationScore).to.equal(500);
      });
    });

    describe("Validation Operations", function () {
      beforeEach(async function () {
        // Register validator
        await qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE });
      });

      it("Should record validation successfully", async function () {
        const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("op-001"));
        const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://test"));
        
        await expect(
          qfsValidation.connect(validator1).recordValidation(
            operationId,
            "TRANSACTION_VERIFICATION",
            true,
            metadata
          )
        ).to.emit(qfsValidation, "ValidationRecorded");
        
        const validation = await qfsValidation.getValidation(operationId);
        expect(validation.isValid).to.be.true;
        expect(validation.validator).to.equal(validator1.address);
      });

      it("Should not allow validation with low reputation", async function () {
        // Set low reputation
        await qfsValidation.updateValidatorReputation(validator1.address, 200);
        
        const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("op-002"));
        const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://test"));
        
        await expect(
          qfsValidation.connect(validator1).recordValidation(
            operationId,
            "TRANSACTION_VERIFICATION",
            true,
            metadata
          )
        ).to.be.revertedWith("Reputation too low");
      });

      it("Should not allow duplicate validations", async function () {
        const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("op-003"));
        const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://test"));
        
        await qfsValidation.connect(validator1).recordValidation(
          operationId,
          "TRANSACTION_VERIFICATION",
          true,
          metadata
        );
        
        await expect(
          qfsValidation.connect(validator1).recordValidation(
            operationId,
            "TRANSACTION_VERIFICATION",
            true,
            metadata
          )
        ).to.be.revertedWith("Already validated");
      });

      it("Should update validator statistics", async function () {
        const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("op-004"));
        const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://test"));
        
        await qfsValidation.connect(validator1).recordValidation(
          operationId,
          "TRANSACTION_VERIFICATION",
          true,
          metadata
        );
        
        const validator = await qfsValidation.getValidator(validator1.address);
        expect(validator.totalValidations).to.equal(1);
        expect(validator.successfulValidations).to.equal(1);
      });
    });

    describe("Legal Framework Management", function () {
      it("Should add legal framework", async function () {
        const frameworkId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("USA-001"));
        const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://doc"));
        
        await expect(
          qfsValidation.addLegalFramework(
            frameworkId,
            "United States",
            documentHash
          )
        ).to.emit(qfsValidation, "LegalFrameworkAdded");
      });

      it("Should update legal framework", async function () {
        const frameworkId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("USA-002"));
        const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://doc1"));
        const newDocumentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://doc2"));
        
        await qfsValidation.addLegalFramework(frameworkId, "United States", documentHash);
        await qfsValidation.updateLegalFramework(frameworkId, newDocumentHash);
        
        const framework = await qfsValidation.legalFrameworks(frameworkId);
        expect(framework.documentHash).to.equal(newDocumentHash);
      });
    });

    describe("Intellectual Property Management", function () {
      it("Should register intellectual property", async function () {
        const ipId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("IP-001"));
        const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://ip"));
        const expiration = Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60);
        
        await expect(
          qfsValidation.registerIntellectualProperty(
            ipId,
            "TRADEMARK",
            documentHash,
            "USPTO-12345",
            expiration
          )
        ).to.emit(qfsValidation, "IntellectualPropertyRegistered");
      });

      it("Should validate active IP", async function () {
        const ipId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("IP-002"));
        const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://ip"));
        const expiration = Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60);
        
        await qfsValidation.registerIntellectualProperty(
          ipId,
          "PATENT",
          documentHash,
          "USPTO-67890",
          expiration
        );
        
        expect(await qfsValidation.isIPValid(ipId)).to.be.true;
      });
    });

    describe("Rewards System", function () {
      beforeEach(async function () {
        await qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE });
      });

      it("Should accumulate rewards for validations", async function () {
        const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("op-reward"));
        const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://test"));
        
        await qfsValidation.connect(validator1).recordValidation(
          operationId,
          "TRANSACTION_VERIFICATION",
          true,
          metadata
        );
        
        const rewards = await qfsValidation.validatorRewards(validator1.address);
        expect(rewards).to.be.gt(0);
      });

      it("Should allow claiming rewards", async function () {
        const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("op-claim"));
        const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://test"));
        
        await qfsValidation.connect(validator1).recordValidation(
          operationId,
          "TRANSACTION_VERIFICATION",
          true,
          metadata
        );
        
        const rewardsBefore = await qfsValidation.validatorRewards(validator1.address);
        
        await expect(
          qfsValidation.connect(validator1).claimRewards()
        ).to.emit(qfsValidation, "RewardsDistributed");
        
        const rewardsAfter = await qfsValidation.validatorRewards(validator1.address);
        expect(rewardsAfter).to.equal(0);
      });
    });

    describe("Company Status", function () {
      it("Should track total validations", async function () {
        await qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE });
        
        const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("op-status"));
        const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://test"));
        
        await qfsValidation.connect(validator1).recordValidation(
          operationId,
          "TRANSACTION_VERIFICATION",
          true,
          metadata
        );
        
        expect(await qfsValidation.getTotalValidations()).to.equal(1);
      });

      it("Should return comprehensive company status", async function () {
        const status = await qfsValidation.getCompanyStatus();
        expect(status.totalVals).to.equal(0);
        expect(status.totalValdtrs).to.equal(0);
      });
    });
  });

  describe("Integration Tests", function () {
    it("Should work end-to-end", async function () {
      // 1. Register validator
      await qfsValidation.connect(validator1).registerValidator({ value: MINIMUM_STAKE });
      
      // 2. Perform validation
      const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("integration-test"));
      const metadata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ipfs://integration"));
      
      await qfsValidation.connect(validator1).recordValidation(
        operationId,
        "TRANSACTION_VERIFICATION",
        true,
        metadata
      );
      
      // 3. Verify validation recorded
      expect(await qfsValidation.isOperationValidated(operationId)).to.be.true;
      
      // 4. Check validator stats updated
      const validator = await qfsValidation.getValidator(validator1.address);
      expect(validator.totalValidations).to.equal(1);
      
      // 5. Verify rewards accumulated
      const rewards = await qfsValidation.validatorRewards(validator1.address);
      expect(rewards).to.be.gt(0);
      
      // 6. Claim rewards
      await qfsValidation.connect(validator1).claimRewards();
      expect(await qfsValidation.validatorRewards(validator1.address)).to.equal(0);
    });
  });
});
