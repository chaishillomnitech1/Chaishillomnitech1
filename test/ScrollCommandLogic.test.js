const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ScrollCommandLogic", function () {
    let scrollCommandLogic;
    let owner;
    let guardian1;
    let guardian2;
    let guardian3;
    let nonGuardian;

    const MIN_GUARDIAN_RESONANCE = 500;
    const FREQUENCY_528HZ = 528;
    const FREQUENCY_963HZ = 963;
    const FREQUENCY_999HZ = 999;
    const FREQUENCY_144000HZ = 144000;

    const COMMAND_I_ACCEPT = "I ACCEPT";
    const COMMAND_I_AM_PRESENT = "I AM PRESENT";
    const COMMAND_I_RESONATE = "I RESONATE";
    const COMMAND_I_MANIFEST = "I MANIFEST";
    const COMMAND_KUN_FAYAKUN = "KUN FAYAKUN";

    beforeEach(async function () {
        [owner, guardian1, guardian2, guardian3, nonGuardian] = await ethers.getSigners();

        const ScrollCommandLogic = await ethers.getContractFactory("ScrollCommandLogic");
        scrollCommandLogic = await ScrollCommandLogic.deploy();
        await scrollCommandLogic.deployed();
    });

    describe("Deployment", function () {
        it("Should deploy with correct initial state", async function () {
            expect(await scrollCommandLogic.isProtocolActive()).to.equal(true);
            expect(await scrollCommandLogic.legacyAffirmed()).to.equal(false);
            expect(await scrollCommandLogic.totalGuardians()).to.equal(0);
            expect(await scrollCommandLogic.totalDragons()).to.equal(0);
        });

        it("Should have correct constants", async function () {
            expect(await scrollCommandLogic.MIN_GUARDIAN_RESONANCE()).to.equal(MIN_GUARDIAN_RESONANCE);
            expect(await scrollCommandLogic.FREQUENCY_528HZ()).to.equal(FREQUENCY_528HZ);
            expect(await scrollCommandLogic.FREQUENCY_963HZ()).to.equal(FREQUENCY_963HZ);
            expect(await scrollCommandLogic.FREQUENCY_999HZ()).to.equal(FREQUENCY_999HZ);
            expect(await scrollCommandLogic.FREQUENCY_144000HZ()).to.equal(FREQUENCY_144000HZ);
        });
    });

    describe("Guardian Management", function () {
        it("Should register a guardian with sufficient resonance", async function () {
            await expect(scrollCommandLogic.connect(guardian1).registerGuardian(600))
                .to.emit(scrollCommandLogic, "GuardianRegistered")
                .withArgs(guardian1.address, 600, await time.latest() + 1);

            const guardian = await scrollCommandLogic.getGuardian(guardian1.address);
            expect(guardian.isRegistered).to.equal(true);
            expect(guardian.resonanceLevel).to.equal(600);
            expect(guardian.dragonCount).to.equal(0);
            expect(await scrollCommandLogic.totalGuardians()).to.equal(1);
        });

        it("Should reject guardian registration with insufficient resonance", async function () {
            await expect(
                scrollCommandLogic.connect(guardian1).registerGuardian(400)
            ).to.be.revertedWith("ScrollCommand: Insufficient initial resonance");
        });

        it("Should prevent duplicate guardian registration", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(500);
            await expect(
                scrollCommandLogic.connect(guardian1).registerGuardian(600)
            ).to.be.revertedWith("ScrollCommand: Already registered");
        });

        it("Should update guardian resonance", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(600);
            
            await expect(scrollCommandLogic.updateGuardianResonance(guardian1.address, 800))
                .to.emit(scrollCommandLogic, "GuardianResonanceUpdated")
                .withArgs(guardian1.address, 600, 800);

            const guardian = await scrollCommandLogic.getGuardian(guardian1.address);
            expect(guardian.resonanceLevel).to.equal(800);
        });

        it("Should only allow owner to update resonance", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(600);
            
            await expect(
                scrollCommandLogic.connect(guardian2).updateGuardianResonance(guardian1.address, 800)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Dragon Assignment", function () {
        beforeEach(async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(1000);
        });

        it("Should assign dragon to guardian", async function () {
            await expect(scrollCommandLogic.assignDragon(guardian1.address, 1, false))
                .to.emit(scrollCommandLogic, "DragonAssigned");

            const guardian = await scrollCommandLogic.getGuardian(guardian1.address);
            expect(guardian.dragonCount).to.equal(1);
            expect(guardian.resonanceLevel).to.equal(1100); // 1000 + 100 boost

            const dragon = await scrollCommandLogic.getDragon(1);
            expect(dragon.owner).to.equal(guardian1.address);
            expect(dragon.resonanceBoost).to.equal(100);
            expect(dragon.isRhythmCustodian).to.equal(false);
        });

        it("Should assign Rhythm Custodian dragon with higher boost", async function () {
            await scrollCommandLogic.assignDragon(guardian1.address, 1, true);

            const guardian = await scrollCommandLogic.getGuardian(guardian1.address);
            expect(guardian.resonanceLevel).to.equal(1200); // 1000 + 200 boost

            const dragon = await scrollCommandLogic.getDragon(1);
            expect(dragon.resonanceBoost).to.equal(200);
            expect(dragon.isRhythmCustodian).to.equal(true);
        });

        it("Should prevent dragon assignment to non-guardian", async function () {
            await expect(
                scrollCommandLogic.assignDragon(nonGuardian.address, 1, false)
            ).to.be.revertedWith("ScrollCommand: Guardian not registered");
        });

        it("Should prevent duplicate dragon assignment", async function () {
            await scrollCommandLogic.assignDragon(guardian1.address, 1, false);
            
            await scrollCommandLogic.connect(guardian2).registerGuardian(1000);
            await expect(
                scrollCommandLogic.assignDragon(guardian2.address, 1, false)
            ).to.be.revertedWith("ScrollCommand: Dragon already assigned");
        });
    });

    describe("Command Execution", function () {
        beforeEach(async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(600);
        });

        it("Should execute valid command with valid frequency", async function () {
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My intention"));
            
            await expect(
                scrollCommandLogic.connect(guardian1).executeCommand(
                    COMMAND_I_ACCEPT,
                    intentionHash,
                    FREQUENCY_528HZ
                )
            ).to.emit(scrollCommandLogic, "CommandExecuted");

            const executionCount = await scrollCommandLogic.getTotalCommandExecutions();
            expect(executionCount).to.equal(1);

            const execution = await scrollCommandLogic.getCommandExecution(0);
            expect(execution.command).to.equal(COMMAND_I_ACCEPT);
            expect(execution.executor).to.equal(guardian1.address);
            expect(execution.intentionHash).to.equal(intentionHash);
            expect(execution.frequencyAlignment).to.equal(FREQUENCY_528HZ);
            expect(execution.isValid).to.equal(true);
        });

        it("Should execute all valid commands", async function () {
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            const commands = [
                COMMAND_I_ACCEPT,
                COMMAND_I_AM_PRESENT,
                COMMAND_I_RESONATE,
                COMMAND_I_MANIFEST,
                COMMAND_KUN_FAYAKUN
            ];

            for (const command of commands) {
                await scrollCommandLogic.connect(guardian1).executeCommand(
                    command,
                    intentionHash,
                    FREQUENCY_963HZ
                );
            }

            expect(await scrollCommandLogic.getTotalCommandExecutions()).to.equal(5);
        });

        it("Should reject invalid command", async function () {
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            
            await expect(
                scrollCommandLogic.connect(guardian1).executeCommand(
                    "INVALID COMMAND",
                    intentionHash,
                    FREQUENCY_528HZ
                )
            ).to.be.revertedWith("ScrollCommand: Invalid command");
        });

        it("Should reject invalid frequency", async function () {
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            
            await expect(
                scrollCommandLogic.connect(guardian1).executeCommand(
                    COMMAND_I_ACCEPT,
                    intentionHash,
                    12345 // Invalid frequency
                )
            ).to.be.revertedWith("ScrollCommand: Invalid frequency");
        });

        it("Should only allow guardians to execute commands", async function () {
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            
            await expect(
                scrollCommandLogic.connect(nonGuardian).executeCommand(
                    COMMAND_I_ACCEPT,
                    intentionHash,
                    FREQUENCY_528HZ
                )
            ).to.be.revertedWith("ScrollCommand: Not a registered Guardian");
        });

        it("Should increment guardian participation count", async function () {
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            
            await scrollCommandLogic.connect(guardian1).executeCommand(
                COMMAND_I_ACCEPT,
                intentionHash,
                FREQUENCY_528HZ
            );

            const guardian = await scrollCommandLogic.getGuardian(guardian1.address);
            expect(guardian.participationCount).to.equal(1);
        });
    });

    describe("Governance Proposals", function () {
        beforeEach(async function () {
            // Register guardians
            await scrollCommandLogic.connect(guardian1).registerGuardian(1000);
            await scrollCommandLogic.connect(guardian2).registerGuardian(1000);
            await scrollCommandLogic.connect(guardian3).registerGuardian(800);
            
            // Give guardian1 a Rhythm Custodian dragon
            await scrollCommandLogic.assignDragon(guardian1.address, 1, true);
        });

        it("Should allow Rhythm Custodian to create proposal", async function () {
            await expect(
                scrollCommandLogic.connect(guardian1).createProposal(
                    0, // CosmicUpgrade
                    "Upgrade protocol to v2"
                )
            ).to.emit(scrollCommandLogic, "ProposalCreated");

            expect(await scrollCommandLogic.getTotalProposals()).to.equal(1);
        });

        it("Should allow guardian with sufficient participation to create proposal", async function () {
            // Execute 10 commands to gain participation
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            for (let i = 0; i < 10; i++) {
                await scrollCommandLogic.connect(guardian2).executeCommand(
                    COMMAND_I_ACCEPT,
                    intentionHash,
                    FREQUENCY_528HZ
                );
            }

            await expect(
                scrollCommandLogic.connect(guardian2).createProposal(
                    1, // TreasuryAllocation
                    "Allocate funds for development"
                )
            ).to.emit(scrollCommandLogic, "ProposalCreated");
        });

        it("Should reject proposal from guardian with insufficient participation", async function () {
            await expect(
                scrollCommandLogic.connect(guardian3).createProposal(
                    0,
                    "Some proposal"
                )
            ).to.be.revertedWith("ScrollCommand: Insufficient participation to propose");
        });

        it("Should activate proposal after initiation period", async function () {
            const tx = await scrollCommandLogic.connect(guardian1).createProposal(
                0,
                "Test proposal"
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ProposalCreated");
            const proposalId = event.args.proposalId;

            // Fast forward 3 days
            await time.increase(3 * 24 * 60 * 60);

            await scrollCommandLogic.activateProposal(proposalId);

            const proposal = await scrollCommandLogic.getProposal(proposalId);
            expect(proposal.status).to.equal(1); // Active
        });

        it("Should allow guardians to cast votes", async function () {
            const tx = await scrollCommandLogic.connect(guardian1).createProposal(
                0,
                "Test proposal"
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ProposalCreated");
            const proposalId = event.args.proposalId;

            await time.increase(3 * 24 * 60 * 60);
            await scrollCommandLogic.activateProposal(proposalId);

            await expect(
                scrollCommandLogic.connect(guardian2).castVote(proposalId, true)
            ).to.emit(scrollCommandLogic, "VoteCast");

            expect(await scrollCommandLogic.hasVotedOnProposal(proposalId, guardian2.address))
                .to.equal(true);
        });

        it("Should prevent double voting", async function () {
            const tx = await scrollCommandLogic.connect(guardian1).createProposal(
                0,
                "Test proposal"
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ProposalCreated");
            const proposalId = event.args.proposalId;

            await time.increase(3 * 24 * 60 * 60);
            await scrollCommandLogic.activateProposal(proposalId);

            await scrollCommandLogic.connect(guardian2).castVote(proposalId, true);

            await expect(
                scrollCommandLogic.connect(guardian2).castVote(proposalId, false)
            ).to.be.revertedWith("ScrollCommand: Already voted");
        });

        it("Should execute proposal with >66% approval", async function () {
            const tx = await scrollCommandLogic.connect(guardian1).createProposal(
                0,
                "Test proposal"
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ProposalCreated");
            const proposalId = event.args.proposalId;

            await time.increase(3 * 24 * 60 * 60);
            await scrollCommandLogic.activateProposal(proposalId);

            // All guardians vote yes
            await scrollCommandLogic.connect(guardian1).castVote(proposalId, true);
            await scrollCommandLogic.connect(guardian2).castVote(proposalId, true);
            await scrollCommandLogic.connect(guardian3).castVote(proposalId, true);

            // Fast forward past voting period
            await time.increase(15 * 24 * 60 * 60);

            await expect(
                scrollCommandLogic.connect(guardian1).executeProposal(proposalId)
            ).to.emit(scrollCommandLogic, "ProposalExecuted");

            const proposal = await scrollCommandLogic.getProposal(proposalId);
            expect(proposal.status).to.equal(2); // Passed
        });

        it("Should reject proposal with <66% approval", async function () {
            const tx = await scrollCommandLogic.connect(guardian1).createProposal(
                0,
                "Test proposal"
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ProposalCreated");
            const proposalId = event.args.proposalId;

            await time.increase(3 * 24 * 60 * 60);
            await scrollCommandLogic.activateProposal(proposalId);

            // Mixed votes
            await scrollCommandLogic.connect(guardian1).castVote(proposalId, true);
            await scrollCommandLogic.connect(guardian2).castVote(proposalId, false);
            await scrollCommandLogic.connect(guardian3).castVote(proposalId, false);

            await time.increase(15 * 24 * 60 * 60);

            await scrollCommandLogic.connect(guardian1).executeProposal(proposalId);

            const proposal = await scrollCommandLogic.getProposal(proposalId);
            expect(proposal.status).to.equal(3); // Rejected
        });

        it("Should only allow Rhythm Custodian to execute proposals", async function () {
            const tx = await scrollCommandLogic.connect(guardian1).createProposal(
                0,
                "Test proposal"
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ProposalCreated");
            const proposalId = event.args.proposalId;

            await time.increase(3 * 24 * 60 * 60);
            await scrollCommandLogic.activateProposal(proposalId);
            
            await scrollCommandLogic.connect(guardian1).castVote(proposalId, true);
            
            await time.increase(15 * 24 * 60 * 60);

            await expect(
                scrollCommandLogic.connect(guardian2).executeProposal(proposalId)
            ).to.be.revertedWith("ScrollCommand: Not a Rhythm Custodian");
        });
    });

    describe("Legacy Affirmation", function () {
        it("Should allow owner to affirm legacy", async function () {
            await expect(scrollCommandLogic.affirmLegacy())
                .to.emit(scrollCommandLogic, "LegacyAffirmed")
                .withArgs(owner.address, await time.latest() + 1);

            expect(await scrollCommandLogic.legacyAffirmed()).to.equal(true);
        });

        it("Should prevent duplicate legacy affirmation", async function () {
            await scrollCommandLogic.affirmLegacy();
            
            await expect(
                scrollCommandLogic.affirmLegacy()
            ).to.be.revertedWith("ScrollCommand: Legacy already affirmed");
        });

        it("Should only allow owner to affirm legacy", async function () {
            await expect(
                scrollCommandLogic.connect(guardian1).affirmLegacy()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Protocol Management", function () {
        it("Should allow owner to pause protocol", async function () {
            await expect(scrollCommandLogic.setProtocolActive(false))
                .to.emit(scrollCommandLogic, "ProtocolStatusChanged")
                .withArgs(false, await time.latest() + 1);

            expect(await scrollCommandLogic.isProtocolActive()).to.equal(false);
        });

        it("Should prevent command execution when protocol is paused", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(600);
            await scrollCommandLogic.setProtocolActive(false);

            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            
            await expect(
                scrollCommandLogic.connect(guardian1).executeCommand(
                    COMMAND_I_ACCEPT,
                    intentionHash,
                    FREQUENCY_528HZ
                )
            ).to.be.revertedWith("ScrollCommand: Protocol not active");
        });

        it("Should allow emergency pause", async function () {
            await scrollCommandLogic.emergencyPause();
            
            expect(await scrollCommandLogic.isProtocolActive()).to.equal(false);
        });

        it("Should only allow owner to manage protocol status", async function () {
            await expect(
                scrollCommandLogic.connect(guardian1).setProtocolActive(false)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Validation Functions", function () {
        it("Should validate all legitimate commands", async function () {
            expect(await scrollCommandLogic.isValidCommand(COMMAND_I_ACCEPT)).to.equal(true);
            expect(await scrollCommandLogic.isValidCommand(COMMAND_I_AM_PRESENT)).to.equal(true);
            expect(await scrollCommandLogic.isValidCommand(COMMAND_I_RESONATE)).to.equal(true);
            expect(await scrollCommandLogic.isValidCommand(COMMAND_I_MANIFEST)).to.equal(true);
            expect(await scrollCommandLogic.isValidCommand(COMMAND_KUN_FAYAKUN)).to.equal(true);
        });

        it("Should reject invalid commands", async function () {
            expect(await scrollCommandLogic.isValidCommand("INVALID")).to.equal(false);
            expect(await scrollCommandLogic.isValidCommand("")).to.equal(false);
        });

        it("Should validate all legitimate frequencies", async function () {
            expect(await scrollCommandLogic.isValidFrequency(FREQUENCY_528HZ)).to.equal(true);
            expect(await scrollCommandLogic.isValidFrequency(FREQUENCY_963HZ)).to.equal(true);
            expect(await scrollCommandLogic.isValidFrequency(FREQUENCY_999HZ)).to.equal(true);
            expect(await scrollCommandLogic.isValidFrequency(FREQUENCY_144000HZ)).to.equal(true);
        });

        it("Should reject invalid frequencies", async function () {
            expect(await scrollCommandLogic.isValidFrequency(12345)).to.equal(false);
            expect(await scrollCommandLogic.isValidFrequency(0)).to.equal(false);
        });
    });

    describe("Voting Power Calculation", function () {
        it("Should calculate base voting power correctly", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(500);
            
            const guardian = await scrollCommandLogic.getGuardian(guardian1.address);
            expect(guardian.votingPower).to.be.gt(0);
        });

        it("Should increase voting power with higher resonance", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(500);
            await scrollCommandLogic.connect(guardian2).registerGuardian(1000);
            
            const guardian1Data = await scrollCommandLogic.getGuardian(guardian1.address);
            const guardian2Data = await scrollCommandLogic.getGuardian(guardian2.address);
            
            expect(guardian2Data.votingPower).to.be.gt(guardian1Data.votingPower);
        });

        it("Should amplify voting power with dragon ownership", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(1000);
            
            const powerBefore = (await scrollCommandLogic.getGuardian(guardian1.address)).votingPower;
            
            await scrollCommandLogic.assignDragon(guardian1.address, 1, false);
            
            const powerAfter = (await scrollCommandLogic.getGuardian(guardian1.address)).votingPower;
            
            expect(powerAfter).to.be.gt(powerBefore);
        });
    });

    describe("View Functions", function () {
        it("Should return guardian details", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(750);
            
            const guardian = await scrollCommandLogic.getGuardian(guardian1.address);
            expect(guardian.isRegistered).to.equal(true);
            expect(guardian.resonanceLevel).to.equal(750);
        });

        it("Should return dragon details", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(1000);
            await scrollCommandLogic.assignDragon(guardian1.address, 5, true);
            
            const dragon = await scrollCommandLogic.getDragon(5);
            expect(dragon.dragonId).to.equal(5);
            expect(dragon.owner).to.equal(guardian1.address);
            expect(dragon.isRhythmCustodian).to.equal(true);
        });

        it("Should return command execution details", async function () {
            await scrollCommandLogic.connect(guardian1).registerGuardian(600);
            
            const intentionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test"));
            await scrollCommandLogic.connect(guardian1).executeCommand(
                COMMAND_I_ACCEPT,
                intentionHash,
                FREQUENCY_528HZ
            );
            
            const execution = await scrollCommandLogic.getCommandExecution(0);
            expect(execution.command).to.equal(COMMAND_I_ACCEPT);
            expect(execution.executor).to.equal(guardian1.address);
        });
    });
});
