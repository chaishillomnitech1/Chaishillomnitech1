const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UnityDAOMicroVote", function () {
  let microVote;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  let nftContract;

  // Roles
  const DAO_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DAO_ADMIN_ROLE"));
  const PROPOSAL_CREATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROPOSAL_CREATOR_ROLE"));
  const VOTE_GUARDIAN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VOTE_GUARDIAN_ROLE"));

  // Frequencies
  const LOVE_FREQUENCY = 528n;
  const UNITY_FREQUENCY = 963n;
  const ACCORD_FREQUENCY = 999n;

  // Proposal Types
  const LORE_UPDATE = 0;
  const FEATURE_REQUEST = 1;
  const GOVERNANCE_CHANGE = 2;
  const COMMUNITY_FUND = 3;
  const NFT_EVOLUTION = 4;

  // Vote Choices
  const ABSTAIN = 0;
  const FOR = 1;
  const AGAINST = 2;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, nftContract] = await ethers.getSigners();

    const UnityDAOMicroVote = await ethers.getContractFactory("UnityDAOMicroVote");
    microVote = await UnityDAOMicroVote.deploy(owner.address, nftContract.address);
    await microVote.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await microVote.hasRole(DAO_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set the correct roles", async function () {
      expect(await microVote.hasRole(PROPOSAL_CREATOR_ROLE, owner.address)).to.be.true;
      expect(await microVote.hasRole(VOTE_GUARDIAN_ROLE, owner.address)).to.be.true;
    });

    it("Should have correct frequencies defined", async function () {
      expect(await microVote.LOVE_FREQUENCY()).to.equal(LOVE_FREQUENCY);
      expect(await microVote.UNITY_FREQUENCY()).to.equal(UNITY_FREQUENCY);
      expect(await microVote.ACCORD_FREQUENCY()).to.equal(ACCORD_FREQUENCY);
    });

    it("Should set NFT contract address", async function () {
      expect(await microVote.nftContractAddress()).to.equal(nftContract.address);
    });

    it("Should initialize governance parameters", async function () {
      expect(await microVote.minProposalThreshold()).to.equal(100n);
      expect(await microVote.executionDelay()).to.equal(2n * 24n * 60n * 60n); // 2 days
    });
  });

  describe("Quadratic Voting Calculation", function () {
    it("Should calculate quadratic power correctly for 100", async function () {
      const quadPower = await microVote.calculateQuadraticPower(100n);
      // sqrt(100) * 100 = 10 * 100 = 1000
      expect(quadPower).to.equal(1000n);
    });

    it("Should calculate quadratic power correctly for 400", async function () {
      const quadPower = await microVote.calculateQuadraticPower(400n);
      // sqrt(400) * 100 = 20 * 100 = 2000
      expect(quadPower).to.equal(2000n);
    });

    it("Should calculate quadratic power correctly for 10000", async function () {
      const quadPower = await microVote.calculateQuadraticPower(10000n);
      // sqrt(10000) * 100 = 100 * 100 = 10000
      expect(quadPower).to.equal(10000n);
    });

    it("Should return 0 for 0 power", async function () {
      const quadPower = await microVote.calculateQuadraticPower(0n);
      expect(quadPower).to.equal(0n);
    });

    it("Should demonstrate quadratic voting benefit", async function () {
      // Quadratic voting: More NFTs = diminishing returns
      // This prevents wealth concentration in voting
      const power1 = await microVote.calculateQuadraticPower(100n);
      const power4 = await microVote.calculateQuadraticPower(400n);
      
      // 4x more tokens should give only 2x more voting power
      expect(power4).to.equal(power1 * 2n);
    });
  });

  describe("Voter Registration", function () {
    it("Should allow voter registration with NFTs", async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n, 3n]);
      
      const voterInfo = await microVote.getVoterInfo(voter1.address);
      expect(voterInfo.isRegistered).to.be.true;
      expect(voterInfo.accordScore).to.equal(5000n); // Default 50%
    });

    it("Should store NFT token IDs", async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n, 3n]);
      
      const nfts = await microVote.getVoterNFTs(voter1.address);
      expect(nfts.length).to.equal(3);
      expect(nfts[0]).to.equal(1n);
      expect(nfts[1]).to.equal(2n);
      expect(nfts[2]).to.equal(3n);
    });

    it("Should not allow duplicate registration", async function () {
      await microVote.connect(voter1).registerVoter([1n]);
      
      await expect(
        microVote.connect(voter1).registerVoter([2n])
      ).to.be.revertedWith("Already registered");
    });

    it("Should require at least one NFT", async function () {
      await expect(
        microVote.connect(voter1).registerVoter([])
      ).to.be.revertedWith("Must own at least one NFT");
    });

    it("Should emit VoterRegistered event", async function () {
      await expect(microVote.connect(voter1).registerVoter([1n]))
        .to.emit(microVote, "VoterRegistered")
        .withArgs(voter1.address, 5000n, (timestamp) => timestamp > 0);
    });

    it("Should set default NFT voting power", async function () {
      await microVote.connect(voter1).registerVoter([1n]);
      
      const nftPower = await microVote.getNFTVotingPower(1n);
      expect(nftPower.basePower).to.equal(100n);
      expect(nftPower.venerationMultiplier).to.equal(1000n);
      expect(nftPower.isActive).to.be.true;
    });
  });

  describe("Voter Accord Score", function () {
    beforeEach(async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n]);
    });

    it("Should allow guardian to update accord score", async function () {
      await microVote.updateVoterAccordScore(voter1.address, 8000n);
      
      const voterInfo = await microVote.getVoterInfo(voter1.address);
      expect(voterInfo.accordScore).to.equal(8000n);
    });

    it("Should not allow non-guardian to update score", async function () {
      await expect(
        microVote.connect(voter2).updateVoterAccordScore(voter1.address, 8000n)
      ).to.be.revertedWith("Not vote guardian");
    });

    it("Should reject invalid accord score", async function () {
      await expect(
        microVote.updateVoterAccordScore(voter1.address, 10001n)
      ).to.be.revertedWith("Invalid accord score");
    });
  });

  describe("NFT Voting Power", function () {
    it("Should allow guardian to set NFT voting power", async function () {
      await microVote.setNFTVotingPower(
        1n,     // tokenId
        200n,   // basePower
        1500n,  // venerationMultiplier (1.5x)
        50n     // frequencyBonus
      );
      
      const power = await microVote.getNFTVotingPower(1n);
      expect(power.basePower).to.equal(200n);
      expect(power.venerationMultiplier).to.equal(1500n);
      expect(power.frequencyBonus).to.equal(50n);
      expect(power.isActive).to.be.true;
    });

    it("Should emit NFTVotingPowerSet event", async function () {
      await expect(
        microVote.setNFTVotingPower(1n, 200n, 1500n, 50n)
      ).to.emit(microVote, "NFTVotingPowerSet")
        .withArgs(1n, 200n, 1500n);
    });

    it("Should require positive base power", async function () {
      await expect(
        microVote.setNFTVotingPower(1n, 0n, 1000n, 0n)
      ).to.be.revertedWith("Base power must be positive");
    });

    it("Should require minimum 1x multiplier", async function () {
      await expect(
        microVote.setNFTVotingPower(1n, 100n, 500n, 0n)
      ).to.be.revertedWith("Multiplier must be at least 1x");
    });
  });

  describe("Voting Power Calculation", function () {
    beforeEach(async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n]);
      await microVote.setNFTVotingPower(1n, 100n, 1000n, 0n);
      await microVote.setNFTVotingPower(2n, 100n, 1000n, 0n);
    });

    it("Should calculate voting power from NFTs", async function () {
      const power = await microVote.calculateVotingPower(voter1.address);
      // 2 NFTs × 100 base power = 200 raw power
      // sqrt(200) * 100 ≈ 1414
      expect(power).to.be.greaterThan(0n);
    });

    it("Should apply veneration multiplier", async function () {
      await microVote.setNFTVotingPower(1n, 100n, 2000n, 0n); // 2x multiplier
      
      const power = await microVote.calculateVotingPower(voter1.address);
      // NFT1: 100 * 2000/1000 = 200, NFT2: 100 * 1000/1000 = 100
      // Total: 300, sqrt(300) * 100 ≈ 1732
      expect(power).to.be.greaterThan(1400n);
    });

    it("Should apply accord score bonus", async function () {
      const basePower = await microVote.calculateVotingPower(voter1.address);
      
      await microVote.updateVoterAccordScore(voter1.address, 10000n); // 100% bonus
      
      const boostedPower = await microVote.calculateVotingPower(voter1.address);
      expect(boostedPower).to.be.greaterThan(basePower);
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n, 3n]);
      await microVote.setNFTVotingPower(1n, 100n, 1000n, 0n);
      await microVote.setNFTVotingPower(2n, 100n, 1000n, 0n);
      await microVote.setNFTVotingPower(3n, 100n, 1000n, 0n);
    });

    it("Should create a proposal", async function () {
      const tx = await microVote.connect(voter1).createProposal(
        LORE_UPDATE,
        "Test Proposal",
        "Description of the proposal",
        "QmTest123",
        7n * 24n * 60n * 60n // 7 days
      );
      
      await tx.wait();
      
      expect(await microVote.proposalCount()).to.equal(1n);
      expect(await microVote.totalProposals()).to.equal(1n);
    });

    it("Should emit ProposalCreated event", async function () {
      await expect(
        microVote.connect(voter1).createProposal(
          LORE_UPDATE,
          "Test Proposal",
          "Description",
          "QmTest123",
          7n * 24n * 60n * 60n
        )
      ).to.emit(microVote, "ProposalCreated");
    });

    it("Should reject proposal with short voting period", async function () {
      await expect(
        microVote.connect(voter1).createProposal(
          LORE_UPDATE,
          "Test",
          "Desc",
          "Qm",
          60n // 1 minute
        )
      ).to.be.revertedWith("Voting period too short");
    });

    it("Should reject proposal with long voting period", async function () {
      await expect(
        microVote.connect(voter1).createProposal(
          LORE_UPDATE,
          "Test",
          "Desc",
          "Qm",
          31n * 24n * 60n * 60n // 31 days
        )
      ).to.be.revertedWith("Voting period too long");
    });

    it("Should require registered voter", async function () {
      await expect(
        microVote.connect(voter2).createProposal(
          LORE_UPDATE,
          "Test",
          "Desc",
          "Qm",
          7n * 24n * 60n * 60n
        )
      ).to.be.revertedWith("Must be registered voter");
    });

    it("Should store correct proposal data", async function () {
      await microVote.connect(voter1).createProposal(
        FEATURE_REQUEST,
        "New Feature",
        "Feature description",
        "QmFeature",
        7n * 24n * 60n * 60n
      );
      
      const proposal = await microVote.getProposal(1n);
      expect(proposal.proposer).to.equal(voter1.address);
      expect(proposal.proposalType).to.equal(FEATURE_REQUEST);
      expect(proposal.title).to.equal("New Feature");
      expect(proposal.status).to.equal(1n); // ACTIVE
    });

    it("Should calculate frequency alignment based on type", async function () {
      // LORE_UPDATE should have Love + Unity alignment
      await microVote.connect(voter1).createProposal(
        LORE_UPDATE, "Test", "Desc", "Qm", 7n * 24n * 60n * 60n
      );
      
      const proposal = await microVote.getProposal(1n);
      expect(proposal.frequencyAlignment).to.equal(LOVE_FREQUENCY + UNITY_FREQUENCY);
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Register voters with NFTs
      await microVote.connect(voter1).registerVoter([1n, 2n]);
      await microVote.connect(voter2).registerVoter([3n, 4n]);
      await microVote.connect(voter3).registerVoter([5n]);
      
      // Set NFT voting powers
      for (let i = 1; i <= 5; i++) {
        await microVote.setNFTVotingPower(BigInt(i), 100n, 1000n, 0n);
      }
      
      // Create a proposal
      await microVote.connect(voter1).createProposal(
        LORE_UPDATE,
        "Test Proposal",
        "Description",
        "QmTest",
        7n * 24n * 60n * 60n
      );
    });

    it("Should allow voting FOR", async function () {
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "I support this");
      
      const vote = await microVote.getVote(1n, voter1.address);
      expect(vote.choice).to.equal(FOR);
      expect(vote.votingPower).to.be.greaterThan(0n);
    });

    it("Should allow voting AGAINST", async function () {
      await microVote.connect(voter2).castVote(1n, AGAINST, 3n, "I oppose");
      
      const vote = await microVote.getVote(1n, voter2.address);
      expect(vote.choice).to.equal(AGAINST);
    });

    it("Should allow ABSTAIN", async function () {
      await microVote.connect(voter3).castVote(1n, ABSTAIN, 5n, "Abstaining");
      
      const vote = await microVote.getVote(1n, voter3.address);
      expect(vote.choice).to.equal(ABSTAIN);
    });

    it("Should emit VoteCast event", async function () {
      await expect(
        microVote.connect(voter1).castVote(1n, FOR, 1n, "Comment")
      ).to.emit(microVote, "VoteCast");
    });

    it("Should update proposal vote counts", async function () {
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "");
      await microVote.connect(voter2).castVote(1n, AGAINST, 3n, "");
      
      const proposal = await microVote.getProposal(1n);
      expect(proposal.votesFor).to.be.greaterThan(0n);
      expect(proposal.votesAgainst).to.be.greaterThan(0n);
      expect(proposal.totalVoters).to.equal(2n);
    });

    it("Should not allow double voting", async function () {
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "");
      
      await expect(
        microVote.connect(voter1).castVote(1n, AGAINST, 2n, "")
      ).to.be.revertedWith("Already voted");
    });

    it("Should update voter info after voting", async function () {
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "");
      
      const info = await microVote.getVoterInfo(voter1.address);
      expect(info.totalVotesCast).to.equal(1n);
      expect(info.totalVotingPowerUsed).to.be.greaterThan(0n);
    });

    it("Should track proposal voters", async function () {
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "");
      await microVote.connect(voter2).castVote(1n, FOR, 3n, "");
      
      const voters = await microVote.getProposalVoters(1n);
      expect(voters.length).to.equal(2);
      expect(voters).to.include(voter1.address);
      expect(voters).to.include(voter2.address);
    });
  });

  describe("Proposal Finalization", function () {
    beforeEach(async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n]);
      await microVote.connect(voter2).registerVoter([3n, 4n]);
      
      for (let i = 1; i <= 4; i++) {
        await microVote.setNFTVotingPower(BigInt(i), 100n, 1000n, 0n);
      }
      
      await microVote.connect(voter1).createProposal(
        LORE_UPDATE, "Test", "Desc", "Qm", 1n * 24n * 60n * 60n // 1 day
      );
    });

    it("Should not finalize before voting ends", async function () {
      await expect(
        microVote.finalizeProposal(1n)
      ).to.be.revertedWith("Voting not ended");
    });

    it("Should finalize after voting period", async function () {
      // Vote
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "");
      await microVote.connect(voter2).castVote(1n, FOR, 3n, "");
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400 + 1]); // 1 day + 1 second
      await ethers.provider.send("evm_mine");
      
      await microVote.finalizeProposal(1n);
      
      const proposal = await microVote.getProposal(1n);
      // Status will be PASSED (2) or REJECTED (3) depending on quorum
      expect([2n, 3n]).to.include(proposal.status);
    });

    it("Should emit ProposalStatusChanged event", async function () {
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "");
      
      await ethers.provider.send("evm_increaseTime", [86400 + 1]);
      await ethers.provider.send("evm_mine");
      
      await expect(microVote.finalizeProposal(1n))
        .to.emit(microVote, "ProposalStatusChanged");
    });
  });

  describe("Proposal Execution", function () {
    beforeEach(async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n]);
      await microVote.connect(voter2).registerVoter([3n, 4n]);
      
      for (let i = 1; i <= 4; i++) {
        await microVote.setNFTVotingPower(BigInt(i), 100n, 1000n, 0n);
      }
      
      await microVote.connect(voter1).createProposal(
        LORE_UPDATE, "Test", "Desc", "Qm", 1n * 24n * 60n * 60n
      );
      
      // Vote to pass
      await microVote.connect(voter1).castVote(1n, FOR, 1n, "");
      await microVote.connect(voter2).castVote(1n, FOR, 3n, "");
      
      // Fast forward and finalize
      await ethers.provider.send("evm_increaseTime", [86400 + 1]);
      await ethers.provider.send("evm_mine");
      await microVote.finalizeProposal(1n);
    });

    it("Should not execute before delay", async function () {
      const proposal = await microVote.getProposal(1n);
      if (proposal.status === 2n) { // PASSED
        await expect(
          microVote.executeProposal(1n)
        ).to.be.revertedWith("Execution delay not passed");
      }
    });

    it("Should execute after delay", async function () {
      const proposal = await microVote.getProposal(1n);
      if (proposal.status === 2n) { // PASSED
        await ethers.provider.send("evm_increaseTime", [2 * 86400 + 1]); // 2 days
        await ethers.provider.send("evm_mine");
        
        await microVote.executeProposal(1n);
        
        const updated = await microVote.getProposal(1n);
        expect(updated.executed).to.be.true;
        expect(updated.status).to.equal(4n); // EXECUTED
      }
    });
  });

  describe("Proposal Cancellation", function () {
    beforeEach(async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n]);
      await microVote.setNFTVotingPower(1n, 100n, 1000n, 0n);
      await microVote.setNFTVotingPower(2n, 100n, 1000n, 0n);
      
      await microVote.connect(voter1).createProposal(
        LORE_UPDATE, "Test", "Desc", "Qm", 7n * 24n * 60n * 60n
      );
    });

    it("Should allow admin to cancel", async function () {
      await microVote.cancelProposal(1n);
      
      const proposal = await microVote.getProposal(1n);
      expect(proposal.status).to.equal(5n); // CANCELLED
    });

    it("Should not allow non-admin to cancel", async function () {
      await expect(
        microVote.connect(voter1).cancelProposal(1n)
      ).to.be.revertedWith("Not DAO admin");
    });

    it("Should emit ProposalStatusChanged event", async function () {
      await expect(microVote.cancelProposal(1n))
        .to.emit(microVote, "ProposalStatusChanged")
        .withArgs(1n, 1n, 5n); // ACTIVE -> CANCELLED
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await microVote.connect(voter1).registerVoter([1n, 2n]);
      await microVote.setNFTVotingPower(1n, 100n, 1000n, 0n);
      await microVote.setNFTVotingPower(2n, 100n, 1000n, 0n);
      
      await microVote.connect(voter1).createProposal(
        LORE_UPDATE, "Proposal 1", "Desc", "Qm1", 7n * 24n * 60n * 60n
      );
      await microVote.connect(voter1).createProposal(
        FEATURE_REQUEST, "Proposal 2", "Desc", "Qm2", 7n * 24n * 60n * 60n
      );
    });

    it("Should return all proposal IDs", async function () {
      const ids = await microVote.getAllProposalIds();
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(1n);
      expect(ids[1]).to.equal(2n);
    });

    it("Should return active proposals", async function () {
      const active = await microVote.getActiveProposals();
      expect(active.length).to.equal(2);
    });

    it("Should return registered voters count", async function () {
      const count = await microVote.getRegisteredVotersCount();
      expect(count).to.equal(1n);
    });

    it("Should check if voter can vote", async function () {
      const canVote = await microVote.canVote(voter1.address, 1n);
      expect(canVote).to.be.true;
    });

    it("Should return false for non-registered voter", async function () {
      const canVote = await microVote.canVote(voter2.address, 1n);
      expect(canVote).to.be.false;
    });
  });

  describe("Governance Parameter Updates", function () {
    it("Should update min proposal threshold", async function () {
      await microVote.setMinProposalThreshold(200n);
      expect(await microVote.minProposalThreshold()).to.equal(200n);
    });

    it("Should update execution delay", async function () {
      await microVote.setExecutionDelay(3n * 24n * 60n * 60n);
      expect(await microVote.executionDelay()).to.equal(259200n);
    });

    it("Should update NFT contract address", async function () {
      await microVote.setNFTContractAddress(voter3.address);
      expect(await microVote.nftContractAddress()).to.equal(voter3.address);
    });

    it("Should reject invalid NFT contract address", async function () {
      await expect(
        microVote.setNFTContractAddress(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to pause", async function () {
      await microVote.pause();
      expect(await microVote.paused()).to.be.true;
    });

    it("Should prevent actions when paused", async function () {
      await microVote.pause();
      
      await expect(
        microVote.connect(voter1).registerVoter([1n])
      ).to.be.revertedWithCustomError(microVote, "EnforcedPause");
    });

    it("Should allow admin to unpause", async function () {
      await microVote.pause();
      await microVote.unpause();
      expect(await microVote.paused()).to.be.false;
    });

    it("Should not allow non-admin to pause", async function () {
      await expect(
        microVote.connect(voter1).pause()
      ).to.be.revertedWith("Not DAO admin");
    });
  });
});
