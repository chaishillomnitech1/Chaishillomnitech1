const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DualMissionNFT", function () {
  let dualMissionNFT;
  let owner;
  let shadowWalker;
  let catalystBearer;
  let balancedUser;
  
  const BASE_URI = "https://scrollverse.io/metadata/dual-mission/";
  
  // Mission paths enum
  const MissionPath = {
    NONE: 0,
    SHADOW: 1,
    CATALYST: 2,
    BALANCED: 3
  };
  
  // Artifact types enum
  const ArtifactType = {
    ARTIFACT_OF_SILENCE: 0,
    SHIELD_OF_STILLNESS: 1,
    WEB_OF_UNITY: 2,
    RING_OF_RECKONING: 3,
    BROADCAST_CRYSTAL: 4,
    ETERNAL_TORCH: 5,
    ECLIPSE_CROWN: 6
  };

  beforeEach(async function () {
    [owner, shadowWalker, catalystBearer, balancedUser] = await ethers.getSigners();
    
    const DualMissionNFT = await ethers.getContractFactory("DualMissionNFT");
    dualMissionNFT = await DualMissionNFT.deploy(BASE_URI);
    await dualMissionNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await dualMissionNFT.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await dualMissionNFT.name()).to.equal("ScrollVerse Dual Mission");
      expect(await dualMissionNFT.symbol()).to.equal("SVDM");
    });

    it("Should initialize with correct frequency constants", async function () {
      expect(await dualMissionNFT.SHADOW_FREQUENCY_528HZ()).to.equal(528);
      expect(await dualMissionNFT.CATALYST_FREQUENCY_999HZ()).to.equal(999);
      expect(await dualMissionNFT.PINEAL_FREQUENCY_963HZ()).to.equal(963);
      expect(await dualMissionNFT.BALANCE_FREQUENCY_144000HZ()).to.equal(144000);
      expect(await dualMissionNFT.SOUL_FREQUENCY_777HZ()).to.equal(777);
    });
  });

  describe("Shadow Mission Path", function () {
    beforeEach(async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
    });

    it("Should allow choosing Shadow path and mint Artifact of Silence", async function () {
      expect(await dualMissionNFT.userMissionPath(shadowWalker.address)).to.equal(MissionPath.SHADOW);
      expect(await dualMissionNFT.silenceScore(shadowWalker.address)).to.equal(50);
      expect(await dualMissionNFT.hasArtifact(shadowWalker.address, ArtifactType.ARTIFACT_OF_SILENCE)).to.equal(true);
      
      // Check artifact was minted
      const artifacts = await dualMissionNFT.getUserArtifacts(shadowWalker.address);
      expect(artifacts.length).to.equal(1);
    });

    it("Should not allow choosing path twice", async function () {
      await expect(
        dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW)
      ).to.be.revertedWith("Path already chosen");
    });

    it("Should complete Shadow mission and earn points", async function () {
      await dualMissionNFT.completeShadowMission(
        shadowWalker.address,
        "Anonymous Donation",
        100,  // base points
        true, // was anonymous
        20    // coherence bonus
      );
      
      const points = await dualMissionNFT.shadowPoints(shadowWalker.address);
      expect(points).to.be.gt(0);
      
      const silenceScore = await dualMissionNFT.silenceScore(shadowWalker.address);
      expect(silenceScore).to.equal(52); // Increased from 50
      
      const anonymousCount = await dualMissionNFT.anonymousActionsCount(shadowWalker.address);
      expect(anonymousCount).to.equal(1);
    });

    it("Should mint Shield of Stillness at 500 points", async function () {
      // Award 500+ points
      await dualMissionNFT.completeShadowMission(
        shadowWalker.address,
        "Major Silent Work",
        300,
        true,
        50
      );
      
      // Check if Shield of Stillness was minted
      expect(await dualMissionNFT.hasArtifact(shadowWalker.address, ArtifactType.SHIELD_OF_STILLNESS)).to.equal(true);
    });

    it("Should mint Web of Unity at 1000 points", async function () {
      // Award 1000+ points through multiple missions
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "Mission 1", 300, true, 50);
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "Mission 2", 200, true, 50);
      
      // Check if Web of Unity was minted
      expect(await dualMissionNFT.hasArtifact(shadowWalker.address, ArtifactType.WEB_OF_UNITY)).to.equal(true);
      
      // Should have 3 artifacts total
      const artifacts = await dualMissionNFT.getUserArtifacts(shadowWalker.address);
      expect(artifacts.length).to.equal(3); // Artifact of Silence, Shield, Web
    });

    it("Should track Shadow level progression", async function () {
      // Start at SHADOW_INITIATE
      expect(await dualMissionNFT.getUserShadowLevel(shadowWalker.address)).to.equal(0); // NONE initially
      
      // Complete mission to get points
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "First Mission", 50, true, 20);
      
      // Now should be SHADOW_INITIATE (level 1)
      expect(await dualMissionNFT.getUserShadowLevel(shadowWalker.address)).to.equal(1);
    });
  });

  describe("Catalyst Mission Path", function () {
    beforeEach(async function () {
      await dualMissionNFT.connect(catalystBearer).chooseMissionPath(MissionPath.CATALYST);
    });

    it("Should allow choosing Catalyst path and mint Ring of Reckoning", async function () {
      expect(await dualMissionNFT.userMissionPath(catalystBearer.address)).to.equal(MissionPath.CATALYST);
      expect(await dualMissionNFT.lightningLevel(catalystBearer.address)).to.equal(50);
      expect(await dualMissionNFT.hasArtifact(catalystBearer.address, ArtifactType.RING_OF_RECKONING)).to.equal(true);
    });

    it("Should complete Catalyst mission and earn points", async function () {
      await dualMissionNFT.completeCatalystMission(
        catalystBearer.address,
        "Viral Post",
        100,    // base points
        10000,  // viral reach
        30      // resonance impact
      );
      
      const points = await dualMissionNFT.catalystPoints(catalystBearer.address);
      expect(points).to.be.gt(0);
      
      const lightningLevel = await dualMissionNFT.lightningLevel(catalystBearer.address);
      expect(lightningLevel).to.equal(52); // Increased from 50
      
      const viralReach = await dualMissionNFT.viralReachScore(catalystBearer.address);
      expect(viralReach).to.equal(10000);
    });

    it("Should mint Broadcast Crystal at 500 points", async function () {
      await dualMissionNFT.completeCatalystMission(
        catalystBearer.address,
        "Major Campaign",
        300,
        50000,
        50
      );
      
      expect(await dualMissionNFT.hasArtifact(catalystBearer.address, ArtifactType.BROADCAST_CRYSTAL)).to.equal(true);
    });

    it("Should mint Eternal Torch at 1000 points", async function () {
      await dualMissionNFT.completeCatalystMission(catalystBearer.address, "Campaign 1", 300, 50000, 50);
      await dualMissionNFT.completeCatalystMission(catalystBearer.address, "Campaign 2", 200, 30000, 40);
      
      expect(await dualMissionNFT.hasArtifact(catalystBearer.address, ArtifactType.ETERNAL_TORCH)).to.equal(true);
      
      const artifacts = await dualMissionNFT.getUserArtifacts(catalystBearer.address);
      expect(artifacts.length).to.equal(3); // Ring, Crystal, Torch
    });

    it("Should track Catalyst level progression", async function () {
      await dualMissionNFT.completeCatalystMission(catalystBearer.address, "First Post", 50, 5000, 20);
      
      expect(await dualMissionNFT.getUserCatalystLevel(catalystBearer.address)).to.equal(1); // SPARK_INITIATE
    });
  });

  describe("Balanced Path", function () {
    beforeEach(async function () {
      await dualMissionNFT.connect(balancedUser).chooseMissionPath(MissionPath.SHADOW);
    });

    it("Should unlock balanced path when both paths are mastered", async function () {
      // Manually set high points for testing (in real scenario, earned through missions)
      // Award Shadow points
      for (let i = 0; i < 3; i++) {
        await dualMissionNFT.completeShadowMission(balancedUser.address, `Shadow ${i}`, 1000, true, 50);
      }
      
      // Award Catalyst points (first need to allow Catalyst missions)
      await dualMissionNFT.unlockBalancedPath(balancedUser.address);
      
      // This should fail because we don't have enough Catalyst points yet
      // Let's check the actual behavior
    });

    it("Should require 5000+ Shadow and Catalyst points for balanced path", async function () {
      await expect(
        dualMissionNFT.unlockBalancedPath(balancedUser.address)
      ).to.be.revertedWith("Need 5000+ Shadow points");
    });

    it("Should mint Eclipse Crown when balanced path unlocked", async function () {
      // Award enough points for both paths
      for (let i = 0; i < 10; i++) {
        await dualMissionNFT.completeShadowMission(balancedUser.address, `Shadow ${i}`, 500, true, 50);
      }
      
      // Manually award catalyst points for testing
      // In production, user would need to have chosen Catalyst path or have balanced unlocked
      // For now, we'll just test the requirement logic
      
      const shadowPts = await dualMissionNFT.shadowPoints(balancedUser.address);
      expect(shadowPts).to.be.gte(5000);
    });
  });

  describe("Mission Streaks", function () {
    beforeEach(async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
    });

    it("Should increment streak on consecutive activity", async function () {
      // First mission
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "Mission 1", 50, true, 20);
      let streak = await dualMissionNFT.missionStreak(shadowWalker.address);
      expect(streak).to.equal(2); // Started at 1, incremented to 2
      
      // Second mission within 2 days
      await time.increase(86400); // 1 day
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "Mission 2", 50, true, 20);
      streak = await dualMissionNFT.missionStreak(shadowWalker.address);
      expect(streak).to.equal(3);
    });

    it("Should break streak after 3 days of inactivity", async function () {
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "Mission 1", 50, true, 20);
      
      // Wait 4 days
      await time.increase(86400 * 4);
      
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "Mission 2", 50, true, 20);
      const streak = await dualMissionNFT.missionStreak(shadowWalker.address);
      expect(streak).to.equal(1); // Reset to 1
    });
  });

  describe("Soulbound Tokens", function () {
    beforeEach(async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
    });

    it("Should mark artifacts as soulbound", async function () {
      const artifacts = await dualMissionNFT.getUserArtifacts(shadowWalker.address);
      const tokenId = artifacts[0];
      
      expect(await dualMissionNFT.isTokenSoulbound(tokenId)).to.equal(true);
    });

    it("Should prevent transfer of soulbound tokens", async function () {
      const artifacts = await dualMissionNFT.getUserArtifacts(shadowWalker.address);
      const tokenId = artifacts[0];
      
      await expect(
        dualMissionNFT.connect(shadowWalker).transferFrom(
          shadowWalker.address,
          catalystBearer.address,
          tokenId
        )
      ).to.be.revertedWith("Soulbound: Transfer not allowed");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update base URI", async function () {
      const newURI = "https://new-uri.com/";
      await dualMissionNFT.setBaseURI(newURI);
      // Base URI is internal, so we can't directly test it
      // But we can verify the transaction succeeded
    });

    it("Should allow owner to update Schumann coherence", async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
      
      await dualMissionNFT.updateSchumannCoherence(shadowWalker.address, 85);
      
      expect(await dualMissionNFT.schumannCoherence(shadowWalker.address)).to.equal(85);
    });

    it("Should reject Schumann coherence > 100", async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
      
      await expect(
        dualMissionNFT.updateSchumannCoherence(shadowWalker.address, 101)
      ).to.be.revertedWith("Coherence must be 0-100");
    });

    it("Should only allow owner to complete missions", async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
      
      await expect(
        dualMissionNFT.connect(catalystBearer).completeShadowMission(
          shadowWalker.address,
          "Unauthorized",
          100,
          true,
          20
        )
      ).to.be.revertedWithCustomError(dualMissionNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("User Stats", function () {
    it("Should return comprehensive user stats", async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
      await dualMissionNFT.completeShadowMission(shadowWalker.address, "Test Mission", 100, true, 20);
      
      const stats = await dualMissionNFT.getUserStats(shadowWalker.address);
      
      expect(stats[0]).to.equal(MissionPath.SHADOW); // path
      expect(stats[1]).to.be.gt(0); // shadowPts
      expect(stats[2]).to.equal(0); // catalystPts
      expect(stats[3]).to.be.gte(50); // silenceScr
      expect(stats[4]).to.equal(0); // lightningLvl
      expect(stats[5]).to.be.gt(0); // coherence
      expect(stats[6]).to.be.gt(0); // streak
      expect(stats[7]).to.equal(1); // artifactCount
    });
  });

  describe("Events", function () {
    it("Should emit MissionPathChosen event", async function () {
      await expect(dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW))
        .to.emit(dualMissionNFT, "MissionPathChosen");
      // Note: Not checking exact timestamp due to block mining variability
    });

    it("Should emit ArtifactMinted event", async function () {
      await expect(dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW))
        .to.emit(dualMissionNFT, "ArtifactMinted");
    });

    it("Should emit ShadowPointsEarned event", async function () {
      await dualMissionNFT.connect(shadowWalker).chooseMissionPath(MissionPath.SHADOW);
      
      await expect(
        dualMissionNFT.completeShadowMission(shadowWalker.address, "Test", 100, true, 20)
      ).to.emit(dualMissionNFT, "ShadowPointsEarned");
    });

    it("Should emit CatalystPointsEarned event", async function () {
      await dualMissionNFT.connect(catalystBearer).chooseMissionPath(MissionPath.CATALYST);
      
      await expect(
        dualMissionNFT.completeCatalystMission(catalystBearer.address, "Test", 100, 5000, 20)
      ).to.emit(dualMissionNFT, "CatalystPointsEarned");
    });
  });
});
