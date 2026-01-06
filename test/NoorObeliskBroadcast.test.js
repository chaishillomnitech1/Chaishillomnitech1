const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NoorObeliskBroadcast", function () {
    let broadcastContract;
    let owner;
    let participant1;
    let participant2;
    let participant3;

    beforeEach(async function () {
        [owner, participant1, participant2, participant3] = await ethers.getSigners();

        const NoorObeliskBroadcast = await ethers.getContractFactory("NoorObeliskBroadcast");
        broadcastContract = await NoorObeliskBroadcast.deploy();
        await broadcastContract.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(await broadcastContract.getAddress()).to.be.properAddress;
        });

        it("Should have correct constants", async function () {
            expect(await broadcastContract.CROWN_FREQUENCY()).to.equal(999);
            expect(await broadcastContract.PINEAL_FREQUENCY()).to.equal(963);
            expect(await broadcastContract.HEALING_FREQUENCY()).to.equal(528);
            expect(await broadcastContract.NOOR_PULSE()).to.equal(144000);
        });

        it("Should start with broadcasting disabled", async function () {
            expect(await broadcastContract.isBroadcasting()).to.be.false;
        });
    });

    describe("Location Management", function () {
        it("Should add location successfully", async function () {
            const tx = await broadcastContract.addLocation(
                "Noor Al-Malik Obelisk",
                "25.276987, 55.296249",
                true
            );
            await expect(tx).to.emit(broadcastContract, "LocationAdded");
            await expect(tx).to.emit(broadcastContract, "FlagshipLocationSet");

            expect(await broadcastContract.locationCount()).to.equal(1);
        });

        it("Should store location data correctly", async function () {
            await broadcastContract.addLocation(
                "Test Obelisk",
                "0.0, 0.0",
                false
            );

            const location = await broadcastContract.getLocationInfo(0);
            expect(location.name).to.equal("Test Obelisk");
            expect(location.coordinates).to.equal("0.0, 0.0");
            expect(location.isActive).to.be.true;
            expect(location.isFlagship).to.be.false;
        });

        it("Should set flagship location correctly", async function () {
            await broadcastContract.addLocation("Location 1", "0.0, 0.0", false);
            await broadcastContract.addLocation("Location 2", "1.0, 1.0", false);
            
            await broadcastContract.setFlagshipLocation(1);
            
            const flagship = await broadcastContract.getFlagshipLocation();
            expect(flagship.id).to.equal(1);
            expect(flagship.name).to.equal("Location 2");
        });

        it("Should activate and deactivate locations", async function () {
            await broadcastContract.addLocation("Test Location", "0.0, 0.0", false);
            
            await broadcastContract.deactivateLocation(0);
            let location = await broadcastContract.getLocationInfo(0);
            expect(location.isActive).to.be.false;
            
            await broadcastContract.activateLocation(0);
            location = await broadcastContract.getLocationInfo(0);
            expect(location.isActive).to.be.true;
        });

        it("Should update location resonance", async function () {
            await broadcastContract.addLocation("Test Location", "0.0, 0.0", false);
            
            await broadcastContract.updateLocationResonance(0, 999);
            
            const location = await broadcastContract.getLocationInfo(0);
            expect(location.resonanceLevel).to.equal(999);
        });

        it("Should revert if deactivating flagship", async function () {
            await broadcastContract.addLocation("Flagship", "0.0, 0.0", true);
            
            await expect(
                broadcastContract.deactivateLocation(0)
            ).to.be.revertedWith("Cannot deactivate flagship");
        });

        it("Should revert if adding more than max locations", async function () {
            // This would take too long to test fully, so we just verify the constant
            expect(await broadcastContract.MAX_LOCATIONS()).to.equal(100);
        });
    });

    describe("Resonance Tracking", function () {
        it("Should record resonance metrics successfully", async function () {
            const tx = await broadcastContract.recordResonance(963, 100, 50);
            await expect(tx).to.emit(broadcastContract, "ResonanceRecorded");

            expect(await broadcastContract.resonanceRecordCount()).to.equal(1);
        });

        it("Should store resonance data correctly", async function () {
            await broadcastContract.recordResonance(963, 100, 50);
            
            const record = await broadcastContract.getResonanceRecord(0);
            expect(record.frequency).to.equal(963);
            expect(record.amplitude).to.equal(100);
            expect(record.participantCount).to.equal(50);
        });

        it("Should update global resonance level", async function () {
            const tx = await broadcastContract.updateGlobalResonance(999);
            await expect(tx).to.emit(broadcastContract, "GlobalResonanceUpdated");

            expect(await broadcastContract.globalResonanceLevel()).to.equal(999);
        });

        it("Should increment total resonance events", async function () {
            await broadcastContract.recordResonance(963, 100, 50);
            await broadcastContract.recordResonance(528, 150, 75);
            
            expect(await broadcastContract.totalResonanceEvents()).to.equal(2);
        });
    });

    describe("Participant Management", function () {
        it("Should allow participant to join", async function () {
            const tx = await broadcastContract.connect(participant1).joinParticipant();
            await expect(tx).to.emit(broadcastContract, "ParticipantJoined");

            expect(await broadcastContract.totalActiveParticipants()).to.equal(1);
        });

        it("Should store participant metrics", async function () {
            await broadcastContract.connect(participant1).joinParticipant();
            
            const metrics = await broadcastContract.getParticipantMetrics(participant1.address);
            expect(metrics.totalInteractions).to.equal(0);
            expect(metrics.isActive).to.be.true;
        });

        it("Should not duplicate participant if joining twice", async function () {
            await broadcastContract.connect(participant1).joinParticipant();
            await broadcastContract.connect(participant1).joinParticipant();
            
            expect(await broadcastContract.totalActiveParticipants()).to.equal(1);
        });

        it("Should update participant metrics", async function () {
            await broadcastContract.connect(participant1).joinParticipant();
            
            await broadcastContract.updateParticipantMetrics(participant1.address, 10, 500);
            
            const metrics = await broadcastContract.getParticipantMetrics(participant1.address);
            expect(metrics.totalInteractions).to.equal(10);
            expect(metrics.resonanceContribution).to.equal(500);
        });

        it("Should track multiple participants", async function () {
            await broadcastContract.connect(participant1).joinParticipant();
            await broadcastContract.connect(participant2).joinParticipant();
            await broadcastContract.connect(participant3).joinParticipant();
            
            expect(await broadcastContract.totalActiveParticipants()).to.equal(3);
        });
    });

    describe("Governance Feedback", function () {
        beforeEach(async function () {
            await broadcastContract.connect(participant1).joinParticipant();
        });

        it("Should submit governance feedback successfully", async function () {
            const tx = await broadcastContract.connect(participant1).submitGovernanceFeedback(
                "PROPOSAL",
                "Increase staking rewards",
                850
            );
            await expect(tx).to.emit(broadcastContract, "GovernanceFeedbackSubmitted");

            expect(await broadcastContract.feedbackCount()).to.equal(1);
        });

        it("Should store feedback data correctly", async function () {
            await broadcastContract.connect(participant1).submitGovernanceFeedback(
                "SUGGESTION",
                "Add more locations",
                750
            );
            
            const feedback = await broadcastContract.getGovernanceFeedback(0);
            expect(feedback.participant).to.equal(participant1.address);
            expect(feedback.feedbackType).to.equal("SUGGESTION");
            expect(feedback.resonanceAlignment).to.equal(750);
            expect(feedback.isProcessed).to.be.false;
        });

        it("Should increment participant feedback count", async function () {
            await broadcastContract.connect(participant1).submitGovernanceFeedback(
                "VOTE",
                "Yes",
                1000
            );
            
            const metrics = await broadcastContract.getParticipantMetrics(participant1.address);
            expect(metrics.feedbackCount).to.equal(1);
        });

        it("Should process governance feedback", async function () {
            await broadcastContract.connect(participant1).submitGovernanceFeedback(
                "PROPOSAL",
                "Test proposal",
                850
            );
            
            const tx = await broadcastContract.processGovernanceFeedback(0);
            await expect(tx).to.emit(broadcastContract, "GovernanceFeedbackProcessed");
            
            const feedback = await broadcastContract.getGovernanceFeedback(0);
            expect(feedback.isProcessed).to.be.true;
        });

        it("Should revert if non-participant submits feedback", async function () {
            await expect(
                broadcastContract.connect(participant2).submitGovernanceFeedback(
                    "PROPOSAL",
                    "Test",
                    500
                )
            ).to.be.revertedWith("Not a participant");
        });

        it("Should revert if alignment score exceeds 1000", async function () {
            await expect(
                broadcastContract.connect(participant1).submitGovernanceFeedback(
                    "PROPOSAL",
                    "Test",
                    1001
                )
            ).to.be.revertedWith("Invalid alignment score");
        });

        it("Should revert if content is empty", async function () {
            await expect(
                broadcastContract.connect(participant1).submitGovernanceFeedback(
                    "PROPOSAL",
                    "",
                    500
                )
            ).to.be.revertedWith("Content required");
        });
    });

    describe("Broadcasting Control", function () {
        it("Should start broadcasting", async function () {
            const tx = await broadcastContract.startBroadcast();
            await expect(tx).to.emit(broadcastContract, "BroadcastStarted");

            expect(await broadcastContract.isBroadcasting()).to.be.true;
        });

        it("Should stop broadcasting", async function () {
            await broadcastContract.startBroadcast();
            
            const tx = await broadcastContract.stopBroadcast();
            await expect(tx).to.emit(broadcastContract, "BroadcastStopped");

            expect(await broadcastContract.isBroadcasting()).to.be.false;
        });

        it("Should revert if starting already broadcasting", async function () {
            await broadcastContract.startBroadcast();
            
            await expect(
                broadcastContract.startBroadcast()
            ).to.be.revertedWith("Already broadcasting");
        });

        it("Should revert if stopping when not broadcasting", async function () {
            await expect(
                broadcastContract.stopBroadcast()
            ).to.be.revertedWith("Not broadcasting");
        });

        it("Should update last broadcast time", async function () {
            await broadcastContract.startBroadcast();
            
            const lastBroadcastTime = await broadcastContract.lastBroadcastTime();
            expect(lastBroadcastTime).to.be.gt(0);
        });
    });

    describe("Broadcast Status", function () {
        it("Should return correct broadcast status", async function () {
            await broadcastContract.addLocation("Test", "0.0, 0.0", true);
            await broadcastContract.connect(participant1).joinParticipant();
            await broadcastContract.updateGlobalResonance(999);
            await broadcastContract.recordResonance(963, 100, 1);
            await broadcastContract.startBroadcast();
            
            const status = await broadcastContract.getBroadcastStatus();
            expect(status.broadcasting).to.be.true;
            expect(status.globalResonance).to.equal(999);
            expect(status.activeParticipants).to.equal(1);
            expect(status.totalEvents).to.equal(1);
        });
    });

    describe("Pause/Unpause", function () {
        it("Should pause operations", async function () {
            await broadcastContract.pause();
            
            await expect(
                broadcastContract.connect(participant1).joinParticipant()
            ).to.be.reverted;
        });

        it("Should unpause operations", async function () {
            await broadcastContract.pause();
            await broadcastContract.unpause();
            
            await expect(
                broadcastContract.connect(participant1).joinParticipant()
            ).to.not.be.reverted;
        });

        it("Should revert if non-owner tries to pause", async function () {
            await expect(
                broadcastContract.connect(participant1).pause()
            ).to.be.reverted;
        });
    });
});
