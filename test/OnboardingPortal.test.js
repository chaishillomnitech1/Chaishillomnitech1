const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OnboardingPortal", function () {
    let onboardingPortal;
    let owner;
    let citizen1;
    let citizen2;
    let citizen3;

    const Language = {
        ENGLISH: 0,
        ARABIC: 1,
        SPANISH: 2,
        FRENCH: 3,
        MANDARIN: 4,
        HINDI: 5,
        PORTUGUESE: 6,
        RUSSIAN: 7,
        JAPANESE: 8,
        GERMAN: 9
    };

    beforeEach(async function () {
        [owner, citizen1, citizen2, citizen3] = await ethers.getSigners();

        const OnboardingPortal = await ethers.getContractFactory("OnboardingPortal");
        onboardingPortal = await OnboardingPortal.deploy();
        await onboardingPortal.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(await onboardingPortal.getAddress()).to.be.properAddress;
        });

        it("Should have correct constants", async function () {
            expect(await onboardingPortal.TARGET_CITIZEN_COUNT()).to.equal(11111);
            expect(await onboardingPortal.PINEAL_FREQUENCY()).to.equal(963);
            expect(await onboardingPortal.HEALING_FREQUENCY()).to.equal(528);
        });

        it("Should start with zero citizens", async function () {
            expect(await onboardingPortal.citizenCount()).to.equal(0);
        });
    });

    describe("Registration", function () {
        it("Should register citizen successfully", async function () {
            const tx = await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            await expect(tx).to.emit(onboardingPortal, "CitizenRegistered");

            expect(await onboardingPortal.isCitizen(citizen1.address)).to.be.true;
            expect(await onboardingPortal.citizenCount()).to.equal(1);
        });

        it("Should store citizen info correctly", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);

            const citizenInfo = await onboardingPortal.getCitizenInfo(citizen1.address);
            expect(citizenInfo.username).to.equal("Citizen1");
            expect(citizenInfo.language).to.equal(Language.ENGLISH);
            expect(citizenInfo.isActive).to.be.true;
            expect(citizenInfo.totalStaked).to.equal(0);
            expect(citizenInfo.totalRewardsEarned).to.equal(0);
        });

        it("Should update language distribution", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            await onboardingPortal.connect(citizen2).register("Citizen2", Language.ARABIC);
            await onboardingPortal.connect(citizen3).register("Citizen3", Language.ENGLISH);

            expect(await onboardingPortal.getLanguageDistribution(Language.ENGLISH)).to.equal(2);
            expect(await onboardingPortal.getLanguageDistribution(Language.ARABIC)).to.equal(1);
        });

        it("Should revert if already registered", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            
            await expect(
                onboardingPortal.connect(citizen1).register("NewName", Language.SPANISH)
            ).to.be.revertedWith("Already registered");
        });

        it("Should revert if username is taken", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            
            await expect(
                onboardingPortal.connect(citizen2).register("Citizen1", Language.SPANISH)
            ).to.be.revertedWith("Username taken");
        });

        it("Should revert if username is empty", async function () {
            await expect(
                onboardingPortal.connect(citizen1).register("", Language.ENGLISH)
            ).to.be.revertedWith("Invalid username length");
        });

        it("Should revert if username is too long", async function () {
            const longUsername = "a".repeat(33);
            await expect(
                onboardingPortal.connect(citizen1).register(longUsername, Language.ENGLISH)
            ).to.be.revertedWith("Invalid username length");
        });
    });

    describe("Profile Updates", function () {
        beforeEach(async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
        });

        it("Should update username successfully", async function () {
            await onboardingPortal.connect(citizen1).updateProfile("NewUsername", Language.ENGLISH);
            
            const citizenInfo = await onboardingPortal.getCitizenInfo(citizen1.address);
            expect(citizenInfo.username).to.equal("NewUsername");
        });

        it("Should update language successfully", async function () {
            await onboardingPortal.connect(citizen1).updateProfile("Citizen1", Language.SPANISH);
            
            const citizenInfo = await onboardingPortal.getCitizenInfo(citizen1.address);
            expect(citizenInfo.language).to.equal(Language.SPANISH);
        });

        it("Should emit LanguageChanged event when language changes", async function () {
            await expect(
                onboardingPortal.connect(citizen1).updateProfile("Citizen1", Language.SPANISH)
            ).to.emit(onboardingPortal, "LanguageChanged");
        });

        it("Should revert if non-citizen tries to update profile", async function () {
            await expect(
                onboardingPortal.connect(citizen2).updateProfile("NewName", Language.ENGLISH)
            ).to.be.revertedWith("Not a citizen");
        });

        it("Should revert if new username is taken", async function () {
            await onboardingPortal.connect(citizen2).register("Citizen2", Language.ARABIC);
            
            await expect(
                onboardingPortal.connect(citizen1).updateProfile("Citizen2", Language.ENGLISH)
            ).to.be.revertedWith("Username taken");
        });
    });

    describe("Staking Rewards", function () {
        beforeEach(async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
        });

        it("Should update staking rewards correctly", async function () {
            const noorRewards = ethers.parseEther("100");
            const earthCoinRewards = ethers.parseEther("50");
            const blessingCoinRewards = ethers.parseEther("25");

            await onboardingPortal.updateStakingRewards(
                citizen1.address,
                noorRewards,
                earthCoinRewards,
                blessingCoinRewards
            );

            const breakdown = await onboardingPortal.getStakingRewardsBreakdown(citizen1.address);
            expect(breakdown.noorRewards).to.equal(noorRewards);
            expect(breakdown.earthCoinRewards).to.equal(earthCoinRewards);
            expect(breakdown.blessingCoinRewards).to.equal(blessingCoinRewards);
            expect(breakdown.totalRewards).to.equal(noorRewards + earthCoinRewards + blessingCoinRewards);
        });

        it("Should update citizen's total rewards earned", async function () {
            const noorRewards = ethers.parseEther("100");
            const earthCoinRewards = ethers.parseEther("50");
            const blessingCoinRewards = ethers.parseEther("25");

            await onboardingPortal.updateStakingRewards(
                citizen1.address,
                noorRewards,
                earthCoinRewards,
                blessingCoinRewards
            );

            const citizenInfo = await onboardingPortal.getCitizenInfo(citizen1.address);
            expect(citizenInfo.totalRewardsEarned).to.equal(noorRewards + earthCoinRewards + blessingCoinRewards);
        });

        it("Should revert if non-owner tries to update rewards", async function () {
            await expect(
                onboardingPortal.connect(citizen1).updateStakingRewards(
                    citizen1.address,
                    ethers.parseEther("100"),
                    ethers.parseEther("50"),
                    ethers.parseEther("25")
                )
            ).to.be.reverted;
        });
    });

    describe("Obelisk Insights", function () {
        it("Should add Obelisk insight successfully", async function () {
            const tx = await onboardingPortal.addObeliskInsight(
                "First Insight",
                "This is the first insight",
                963
            );
            await expect(tx).to.emit(onboardingPortal, "ObeliskInsightAdded");

            expect(await onboardingPortal.insightCount()).to.equal(1);
        });

        it("Should store insight data correctly", async function () {
            await onboardingPortal.addObeliskInsight(
                "Test Insight",
                "Test Description",
                528
            );

            const insight = await onboardingPortal.getObeliskInsight(0);
            expect(insight.title).to.equal("Test Insight");
            expect(insight.description).to.equal("Test Description");
            expect(insight.frequency).to.equal(528);
            expect(insight.isActive).to.be.true;
        });

        it("Should allow citizen to access insight", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            await onboardingPortal.addObeliskInsight("Insight", "Description", 963);

            const tx = await onboardingPortal.connect(citizen1).accessObeliskInsight(0);
            await expect(tx).to.emit(onboardingPortal, "ObeliskInsightAccessed");

            const citizenInfo = await onboardingPortal.getCitizenInfo(citizen1.address);
            expect(citizenInfo.totalRewardsEarned).to.equal(0); // No rewards yet
        });

        it("Should revert if non-citizen tries to access insight", async function () {
            await onboardingPortal.addObeliskInsight("Insight", "Description", 963);
            
            await expect(
                onboardingPortal.connect(citizen1).accessObeliskInsight(0)
            ).to.be.revertedWith("Not a citizen");
        });

        it("Should revert if accessing invalid insight ID", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            
            await expect(
                onboardingPortal.connect(citizen1).accessObeliskInsight(999)
            ).to.be.revertedWith("Invalid insight ID");
        });

        it("Should deactivate insight correctly", async function () {
            await onboardingPortal.addObeliskInsight("Insight", "Description", 963);
            await onboardingPortal.deactivateObeliskInsight(0);

            const insight = await onboardingPortal.getObeliskInsight(0);
            expect(insight.isActive).to.be.false;
        });
    });

    describe("Registration Progress", function () {
        it("Should return correct registration progress", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            await onboardingPortal.connect(citizen2).register("Citizen2", Language.ARABIC);

            const progress = await onboardingPortal.getRegistrationProgress();
            expect(progress.current).to.equal(2);
            expect(progress.target).to.equal(11111);
            expect(progress.percentage).to.equal(0); // 2/11111 * 100 = 0 (integer division)
        });
    });

    describe("Citizen Enumeration", function () {
        it("Should enumerate citizens correctly", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            await onboardingPortal.connect(citizen2).register("Citizen2", Language.ARABIC);
            await onboardingPortal.connect(citizen3).register("Citizen3", Language.SPANISH);

            const citizens = await onboardingPortal.getCitizens(0, 10);
            expect(citizens.length).to.equal(3);
            expect(citizens[0]).to.equal(citizen1.address);
            expect(citizens[1]).to.equal(citizen2.address);
            expect(citizens[2]).to.equal(citizen3.address);
        });

        it("Should handle pagination correctly", async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
            await onboardingPortal.connect(citizen2).register("Citizen2", Language.ARABIC);
            await onboardingPortal.connect(citizen3).register("Citizen3", Language.SPANISH);

            const citizens = await onboardingPortal.getCitizens(1, 2);
            expect(citizens.length).to.equal(2);
            expect(citizens[0]).to.equal(citizen2.address);
            expect(citizens[1]).to.equal(citizen3.address);
        });
    });

    describe("Admin Functions", function () {
        beforeEach(async function () {
            await onboardingPortal.connect(citizen1).register("Citizen1", Language.ENGLISH);
        });

        it("Should pause registration", async function () {
            await onboardingPortal.pause();
            
            await expect(
                onboardingPortal.connect(citizen2).register("Citizen2", Language.ENGLISH)
            ).to.be.reverted;
        });

        it("Should unpause registration", async function () {
            await onboardingPortal.pause();
            await onboardingPortal.unpause();
            
            await expect(
                onboardingPortal.connect(citizen2).register("Citizen2", Language.ENGLISH)
            ).to.not.be.reverted;
        });

        it("Should deactivate citizen", async function () {
            await onboardingPortal.deactivateCitizen(citizen1.address);
            
            const citizenInfo = await onboardingPortal.getCitizenInfo(citizen1.address);
            expect(citizenInfo.isActive).to.be.false;
        });

        it("Should reactivate citizen", async function () {
            await onboardingPortal.deactivateCitizen(citizen1.address);
            await onboardingPortal.reactivateCitizen(citizen1.address);
            
            const citizenInfo = await onboardingPortal.getCitizenInfo(citizen1.address);
            expect(citizenInfo.isActive).to.be.true;
        });
    });
});
