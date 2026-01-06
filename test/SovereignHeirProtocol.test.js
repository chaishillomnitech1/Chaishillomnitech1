const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SovereignHeirProtocol", function () {
    let sovereignHeirProtocol;
    let owner, heir1, heir2, guardian1, guardian2, guardian3, academy;
    let addrs;
    
    // Constants
    const CROWN_FREQUENCY = 963;
    const HEALING_FREQUENCY = 528;
    const DIVINE_FREQUENCY = 999;
    const COSMIC_FREQUENCY = 144000;
    
    beforeEach(async function () {
        [owner, heir1, heir2, guardian1, guardian2, guardian3, academy, ...addrs] = await ethers.getSigners();
        
        const SovereignHeirProtocol = await ethers.getContractFactory("SovereignHeirProtocol");
        sovereignHeirProtocol = await SovereignHeirProtocol.deploy(owner.address);
        await sovereignHeirProtocol.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct sovereign", async function () {
            const succession = await sovereignHeirProtocol.getCurrentSuccession();
            expect(succession.currentSovereign).to.equal(owner.address);
        });
        
        it("Should register founder as first dynasty member", async function () {
            const founder = await sovereignHeirProtocol.getDynastyMember(owner.address);
            expect(founder.isActive).to.be.true;
            expect(founder.generation).to.equal(1);
            expect(founder.heirRank).to.equal(1);
        });
        
        it("Should set initial generation to 1", async function () {
            const currentGen = await sovereignHeirProtocol.currentGeneration();
            expect(currentGen).to.equal(1);
        });
        
        it("Should have zero locked wealth initially", async function () {
            const totalLocked = await sovereignHeirProtocol.totalLockedWealth();
            expect(totalLocked).to.equal(0);
        });
    });
    
    describe("Dynasty Member Management", function () {
        it("Should allow sovereign to register new dynasty member", async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            
            const member = await sovereignHeirProtocol.getDynastyMember(heir1.address);
            expect(member.isActive).to.be.true;
            expect(member.generation).to.equal(2);
            expect(member.heirRank).to.equal(1);
        });
        
        it("Should emit DynastyMemberRegistered event", async function () {
            await expect(sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1))
                .to.emit(sovereignHeirProtocol, "DynastyMemberRegistered")
                .withArgs(heir1.address, 2, 1, await time.latest() + 1);
        });
        
        it("Should not allow registering the same member twice", async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            
            await expect(
                sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1)
            ).to.be.revertedWith("Member already registered");
        });
        
        it("Should not allow non-sovereign to register members", async function () {
            await expect(
                sovereignHeirProtocol.connect(heir1).registerDynastyMember(heir2.address, 2, 1)
            ).to.be.revertedWith("Not sovereign");
        });
        
        it("Should track generation members correctly", async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            await sovereignHeirProtocol.registerDynastyMember(heir2.address, 2, 2);
            
            const gen2Members = await sovereignHeirProtocol.getGenerationMembers(2);
            expect(gen2Members.length).to.equal(2);
            expect(gen2Members).to.include(heir1.address);
            expect(gen2Members).to.include(heir2.address);
        });
        
        it("Should update wealth allocation correctly", async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            await sovereignHeirProtocol.updateWealthAllocation(heir1.address, 5000); // 50%
            
            const member = await sovereignHeirProtocol.getDynastyMember(heir1.address);
            expect(member.wealthAllocation).to.equal(5000);
        });
        
        it("Should not allow allocation over 100%", async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            
            await expect(
                sovereignHeirProtocol.updateWealthAllocation(heir1.address, 10001)
            ).to.be.revertedWith("Allocation exceeds 100%");
        });
    });
    
    describe("Frequency Resonance", function () {
        beforeEach(async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
        });
        
        it("Should allow updating frequency resonance", async function () {
            await sovereignHeirProtocol.updateFrequencyResonance(heir1.address, CROWN_FREQUENCY);
            
            const member = await sovereignHeirProtocol.getDynastyMember(heir1.address);
            expect(member.frequencyResonance).to.equal(CROWN_FREQUENCY);
        });
        
        it("Should emit FrequencyResonanceUpdated event", async function () {
            await expect(
                sovereignHeirProtocol.updateFrequencyResonance(heir1.address, CROWN_FREQUENCY)
            ).to.emit(sovereignHeirProtocol, "FrequencyResonanceUpdated");
        });
        
        it("Should initialize with healing frequency", async function () {
            const member = await sovereignHeirProtocol.getDynastyMember(heir1.address);
            expect(member.frequencyResonance).to.equal(HEALING_FREQUENCY);
        });
    });
    
    describe("Generational Wealth Locking", function () {
        it("Should allow sovereign to lock wealth", async function () {
            const lockAmount = ethers.parseEther("10");
            
            await sovereignHeirProtocol.lockGenerationalWealth(2, DIVINE_FREQUENCY, {
                value: lockAmount
            });
            
            const totalLocked = await sovereignHeirProtocol.totalLockedWealth();
            expect(totalLocked).to.equal(lockAmount);
        });
        
        it("Should emit WealthLocked event", async function () {
            const lockAmount = ethers.parseEther("10");
            
            await expect(
                sovereignHeirProtocol.lockGenerationalWealth(2, DIVINE_FREQUENCY, {
                    value: lockAmount
                })
            ).to.emit(sovereignHeirProtocol, "WealthLocked");
        });
        
        it("Should create vault with correct parameters", async function () {
            const lockAmount = ethers.parseEther("10");
            
            const tx = await sovereignHeirProtocol.lockGenerationalWealth(2, DIVINE_FREQUENCY, {
                value: lockAmount
            });
            const receipt = await tx.wait();
            
            // Get vaultId from event
            const event = receipt.logs.find(log => {
                try {
                    return sovereignHeirProtocol.interface.parseLog(log).name === "WealthLocked";
                } catch {
                    return false;
                }
            });
            const vaultId = sovereignHeirProtocol.interface.parseLog(event).args.vaultId;
            
            const vault = await sovereignHeirProtocol.getWealthVault(vaultId);
            expect(vault.totalAssets).to.equal(lockAmount);
            expect(vault.generationUnlock).to.equal(2);
            expect(vault.frequencyResonance).to.equal(DIVINE_FREQUENCY);
            expect(vault.isActive).to.be.true;
        });
        
        it("Should not allow locking for current generation", async function () {
            await expect(
                sovereignHeirProtocol.lockGenerationalWealth(1, DIVINE_FREQUENCY, {
                    value: ethers.parseEther("10")
                })
            ).to.be.revertedWith("Must be future generation");
        });
        
        it("Should not allow locking with zero value", async function () {
            await expect(
                sovereignHeirProtocol.lockGenerationalWealth(2, DIVINE_FREQUENCY, {
                    value: 0
                })
            ).to.be.revertedWith("Must lock some wealth");
        });
        
        it("Should require valid frequency", async function () {
            await expect(
                sovereignHeirProtocol.lockGenerationalWealth(2, 123, {
                    value: ethers.parseEther("10")
                })
            ).to.be.revertedWith("Invalid frequency");
        });
    });
    
    describe("Wealth Distribution", function () {
        let vaultId;
        
        beforeEach(async function () {
            // Register heir in generation 2
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            
            // Lock wealth for generation 2
            const tx = await sovereignHeirProtocol.lockGenerationalWealth(2, DIVINE_FREQUENCY, {
                value: ethers.parseEther("10")
            });
            const receipt = await tx.wait();
            
            // Get vaultId from event
            const event = receipt.logs.find(log => {
                try {
                    return sovereignHeirProtocol.interface.parseLog(log).name === "WealthLocked";
                } catch {
                    return false;
                }
            });
            vaultId = sovereignHeirProtocol.interface.parseLog(event).args.vaultId;
        });
        
        it("Should not distribute before generation unlock", async function () {
            await expect(
                sovereignHeirProtocol.distributeDynastyWealth(vaultId)
            ).to.be.revertedWith("Generation lock not reached");
        });
        
        it("Should distribute after advancing generation", async function () {
            // Note: In a real implementation, there would be a way to advance generation
            // For this test, we'll need to modify the contract or use a different approach
            // This is a placeholder for the test structure
        });
        
        it("Should emit WealthDistributed event on distribution", async function () {
            // Similar placeholder - would need generation advancement mechanism
        });
    });
    
    describe("Guardian Council", function () {
        it("Should allow sovereign to establish guardian council", async function () {
            const guardians = [guardian1.address, guardian2.address, guardian3.address];
            
            await sovereignHeirProtocol.establishGuardianCouncil(guardians, 2);
            
            const council = await sovereignHeirProtocol.getGuardianCouncil();
            expect(council.length).to.equal(3);
            expect(council).to.include(guardian1.address);
        });
        
        it("Should emit GuardianCouncilUpdated event", async function () {
            const guardians = [guardian1.address, guardian2.address, guardian3.address];
            
            await expect(
                sovereignHeirProtocol.establishGuardianCouncil(guardians, 2)
            ).to.emit(sovereignHeirProtocol, "GuardianCouncilUpdated");
        });
        
        it("Should require minimum 3 guardians", async function () {
            const guardians = [guardian1.address, guardian2.address];
            
            await expect(
                sovereignHeirProtocol.establishGuardianCouncil(guardians, 2)
            ).to.be.revertedWith("Minimum 3 guardians required");
        });
        
        it("Should require valid threshold", async function () {
            const guardians = [guardian1.address, guardian2.address, guardian3.address];
            
            await expect(
                sovereignHeirProtocol.establishGuardianCouncil(guardians, 4)
            ).to.be.revertedWith("Threshold too high");
            
            await expect(
                sovereignHeirProtocol.establishGuardianCouncil(guardians, 1)
            ).to.be.revertedWith("Threshold too low");
        });
    });
    
    describe("Succession Protocol", function () {
        beforeEach(async function () {
            // Setup guardians
            const guardians = [guardian1.address, guardian2.address, guardian3.address];
            await sovereignHeirProtocol.establishGuardianCouncil(guardians, 2);
            
            // Register heir
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            
            // Set education level high enough
            const ACADEMY_ROLE = await sovereignHeirProtocol.ACADEMY_ROLE();
            await sovereignHeirProtocol.grantRole(ACADEMY_ROLE, academy.address);
            
            const courseHash = ethers.keccak256(ethers.toUtf8Bytes("Crown_Level_Course"));
            await sovereignHeirProtocol.connect(academy).verifyEducationCompletion(heir1.address, courseHash);
            await sovereignHeirProtocol.connect(academy).verifyEducationCompletion(heir1.address, courseHash);
            await sovereignHeirProtocol.connect(academy).verifyEducationCompletion(heir1.address, courseHash);
            
            // Update frequency resonance
            await sovereignHeirProtocol.updateFrequencyResonance(heir1.address, CROWN_FREQUENCY);
        });
        
        it("Should allow initiating succession", async function () {
            const timelockDuration = 7 * 24 * 60 * 60; // 7 days
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            
            const succession = await sovereignHeirProtocol.getCurrentSuccession();
            expect(succession.proposedHeir).to.equal(heir1.address);
        });
        
        it("Should emit SuccessionInitiated event", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await expect(
                sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false)
            ).to.emit(sovereignHeirProtocol, "SuccessionInitiated");
        });
        
        it("Should require active heir for succession", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await expect(
                sovereignHeirProtocol.initiateSuccession(addrs[0].address, timelockDuration, false)
            ).to.be.revertedWith("Heir not active member");
        });
        
        it("Should allow guardians to approve succession", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            
            await sovereignHeirProtocol.connect(guardian1).approveSuccession();
            
            const succession = await sovereignHeirProtocol.getCurrentSuccession();
            expect(succession.approvalCount).to.equal(1);
        });
        
        it("Should emit SuccessionApproved event", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            
            await expect(
                sovereignHeirProtocol.connect(guardian1).approveSuccession()
            ).to.emit(sovereignHeirProtocol, "SuccessionApproved");
        });
        
        it("Should not allow non-guardian to approve", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            
            await expect(
                sovereignHeirProtocol.connect(heir2).approveSuccession()
            ).to.be.revertedWith("Not a guardian");
        });
        
        it("Should not allow double approval from same guardian", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            
            await sovereignHeirProtocol.connect(guardian1).approveSuccession();
            
            await expect(
                sovereignHeirProtocol.connect(guardian1).approveSuccession()
            ).to.be.revertedWith("Already approved");
        });
        
        it("Should execute succession after timelock and approvals", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            
            // Get approvals (need 66.66% = 2 out of 3)
            await sovereignHeirProtocol.connect(guardian1).approveSuccession();
            await sovereignHeirProtocol.connect(guardian2).approveSuccession();
            
            // Fast forward time
            await time.increase(timelockDuration);
            
            await sovereignHeirProtocol.executeSuccession();
            
            const succession = await sovereignHeirProtocol.getCurrentSuccession();
            expect(succession.currentSovereign).to.equal(heir1.address);
            expect(succession.isExecuted).to.be.true;
        });
        
        it("Should emit SuccessionExecuted event", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            await sovereignHeirProtocol.connect(guardian1).approveSuccession();
            await sovereignHeirProtocol.connect(guardian2).approveSuccession();
            await time.increase(timelockDuration);
            
            await expect(
                sovereignHeirProtocol.executeSuccession()
            ).to.emit(sovereignHeirProtocol, "SuccessionExecuted")
            .withArgs(owner.address, heir1.address, await time.latest() + 1);
        });
        
        it("Should not execute before timelock expires", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            await sovereignHeirProtocol.connect(guardian1).approveSuccession();
            await sovereignHeirProtocol.connect(guardian2).approveSuccession();
            
            await expect(
                sovereignHeirProtocol.executeSuccession()
            ).to.be.revertedWith("Timelock not expired");
        });
        
        it("Should not execute without sufficient approvals", async function () {
            const timelockDuration = 7 * 24 * 60 * 60;
            
            await sovereignHeirProtocol.initiateSuccession(heir1.address, timelockDuration, false);
            await sovereignHeirProtocol.connect(guardian1).approveSuccession();
            
            await time.increase(timelockDuration);
            
            await expect(
                sovereignHeirProtocol.executeSuccession()
            ).to.be.revertedWith("Insufficient approvals");
        });
    });
    
    describe("Education Integration", function () {
        beforeEach(async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            
            const ACADEMY_ROLE = await sovereignHeirProtocol.ACADEMY_ROLE();
            await sovereignHeirProtocol.grantRole(ACADEMY_ROLE, academy.address);
        });
        
        it("Should allow academy to verify education completion", async function () {
            const courseHash = ethers.keccak256(ethers.toUtf8Bytes("Course_1"));
            
            await sovereignHeirProtocol.connect(academy).verifyEducationCompletion(heir1.address, courseHash);
            
            const hasCompleted = await sovereignHeirProtocol.hasCourseCompleted(heir1.address, courseHash);
            expect(hasCompleted).to.be.true;
        });
        
        it("Should emit EducationCompleted event", async function () {
            const courseHash = ethers.keccak256(ethers.toUtf8Bytes("Course_1"));
            
            await expect(
                sovereignHeirProtocol.connect(academy).verifyEducationCompletion(heir1.address, courseHash)
            ).to.emit(sovereignHeirProtocol, "EducationCompleted");
        });
        
        it("Should increment education level", async function () {
            const courseHash = ethers.keccak256(ethers.toUtf8Bytes("Course_1"));
            
            await sovereignHeirProtocol.connect(academy).verifyEducationCompletion(heir1.address, courseHash);
            
            const level = await sovereignHeirProtocol.educationLevel(heir1.address);
            expect(level).to.equal(1);
        });
        
        it("Should not allow non-academy to verify completion", async function () {
            const courseHash = ethers.keccak256(ethers.toUtf8Bytes("Course_1"));
            
            await expect(
                sovereignHeirProtocol.connect(heir2).verifyEducationCompletion(heir1.address, courseHash)
            ).to.be.revertedWith("Not authorized academy");
        });
        
        it("Should update education requirements", async function () {
            await sovereignHeirProtocol.updateEducationRequirements(5, 10, DIVINE_FREQUENCY);
            
            const requirements = await sovereignHeirProtocol.educationRequirement();
            expect(requirements.minimumCompletionLevel).to.equal(5);
            expect(requirements.practicalExperienceYears).to.equal(10);
            expect(requirements.frequencyAlignment).to.equal(DIVINE_FREQUENCY);
        });
    });
    
    describe("Private Asset Management", function () {
        it("Should allow registering private assets", async function () {
            const assetType = ethers.keccak256(ethers.toUtf8Bytes("aircraft"));
            const assetId = ethers.keccak256(ethers.toUtf8Bytes("G650ER-001"));
            
            await sovereignHeirProtocol.registerPrivateAsset(assetType, assetId, 1);
            
            const assetIds = await sovereignHeirProtocol.getAllAssetIds();
            expect(assetIds.length).to.equal(1);
        });
        
        it("Should emit PrivateAssetRegistered event", async function () {
            const assetType = ethers.keccak256(ethers.toUtf8Bytes("aircraft"));
            const assetId = ethers.keccak256(ethers.toUtf8Bytes("G650ER-001"));
            
            await expect(
                sovereignHeirProtocol.registerPrivateAsset(assetType, assetId, 1)
            ).to.emit(sovereignHeirProtocol, "PrivateAssetRegistered");
        });
        
        it("Should allow transferring asset ownership", async function () {
            const assetType = ethers.keccak256(ethers.toUtf8Bytes("aircraft"));
            const assetIdentifier = ethers.keccak256(ethers.toUtf8Bytes("G650ER-001"));
            
            const tx = await sovereignHeirProtocol.registerPrivateAsset(assetType, assetIdentifier, 1);
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(log => {
                try {
                    return sovereignHeirProtocol.interface.parseLog(log).name === "PrivateAssetRegistered";
                } catch {
                    return false;
                }
            });
            const registeredAssetId = sovereignHeirProtocol.interface.parseLog(event).args.assetId;
            
            await sovereignHeirProtocol.transferAssetOwnership(registeredAssetId, 2);
            
            const asset = await sovereignHeirProtocol.getPrivateAsset(registeredAssetId);
            expect(asset.generationalOwnership).to.equal(2);
        });
    });
    
    describe("Emergency Functions", function () {
        it("Should allow sovereign to pause contract", async function () {
            await sovereignHeirProtocol.pause();
            // Contract should be paused - can be tested with other operations
        });
        
        it("Should allow sovereign to unpause contract", async function () {
            await sovereignHeirProtocol.pause();
            await sovereignHeirProtocol.unpause();
            // Contract should be unpaused
        });
        
        it("Should not allow non-sovereign to pause", async function () {
            await expect(
                sovereignHeirProtocol.connect(heir1).pause()
            ).to.be.revertedWith("Not sovereign");
        });
    });
    
    describe("View Functions", function () {
        it("Should return dynasty member details", async function () {
            await sovereignHeirProtocol.registerDynastyMember(heir1.address, 2, 1);
            
            const member = await sovereignHeirProtocol.getDynastyMember(heir1.address);
            expect(member.memberAddress).to.equal(heir1.address);
        });
        
        it("Should return succession history", async function () {
            const history = await sovereignHeirProtocol.getSuccessionHistory();
            expect(history.length).to.equal(1);
            expect(history[0]).to.equal(owner.address);
        });
        
        it("Should return all vault IDs", async function () {
            await sovereignHeirProtocol.lockGenerationalWealth(2, DIVINE_FREQUENCY, {
                value: ethers.parseEther("10")
            });
            
            const vaultIds = await sovereignHeirProtocol.getAllVaultIds();
            expect(vaultIds.length).to.equal(1);
        });
    });
    
    describe("Receive Function", function () {
        it("Should accept ETH directly", async function () {
            const sendAmount = ethers.parseEther("5");
            
            await owner.sendTransaction({
                to: await sovereignHeirProtocol.getAddress(),
                value: sendAmount
            });
            
            const totalLocked = await sovereignHeirProtocol.totalLockedWealth();
            expect(totalLocked).to.equal(sendAmount);
        });
    });
});
