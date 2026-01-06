const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AeonicHubIndexing", function () {
    let aeonicHubIndexing;
    let owner, user1, user2, fan1, fan2;
    
    beforeEach(async function () {
        [owner, user1, user2, fan1, fan2] = await ethers.getSigners();
        
        const AeonicHubIndexing = await ethers.getContractFactory("AeonicHubIndexing");
        aeonicHubIndexing = await AeonicHubIndexing.deploy();
        await aeonicHubIndexing.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await aeonicHubIndexing.owner()).to.equal(owner.address);
        });
        
        it("Should have correct constants", async function () {
            expect(await aeonicHubIndexing.MAX_REALMS_PER_INDEX()).to.equal(13);
            expect(await aeonicHubIndexing.INDEXING_FREQUENCY()).to.equal(144000);
        });
    });
    
    describe("Realm Creation", function () {
        it("Should create a realm", async function () {
            const realmId = ethers.id("music-realm");
            
            await expect(
                aeonicHubIndexing.createRealm(
                    realmId,
                    0, // MUSIC_REALM
                    "Music Realm",
                    "XLVIII Blocks music universe",
                    user1.address
                )
            ).to.emit(aeonicHubIndexing, "RealmCreated");
            
            expect(await aeonicHubIndexing.totalRealms()).to.equal(1);
        });
        
        it("Should not allow duplicate realm", async function () {
            const realmId = ethers.id("duplicate-realm");
            
            await aeonicHubIndexing.createRealm(
                realmId,
                0,
                "First Realm",
                "Description",
                user1.address
            );
            
            await expect(
                aeonicHubIndexing.createRealm(
                    realmId,
                    1,
                    "Second Realm",
                    "Description",
                    user2.address
                )
            ).to.be.revertedWith("Realm already exists");
        });
        
        it("Should link realms", async function () {
            const realm1 = ethers.id("realm-1");
            const realm2 = ethers.id("realm-2");
            
            await aeonicHubIndexing.createRealm(
                realm1,
                0, // MUSIC_REALM
                "Music Realm",
                "Music",
                user1.address
            );
            
            await aeonicHubIndexing.createRealm(
                realm2,
                2, // NFT_REALM
                "NFT Realm",
                "NFT",
                user2.address
            );
            
            await aeonicHubIndexing.linkRealms(realm1, realm2);
            
            const realmData = await aeonicHubIndexing.getRealm(realm1);
            expect(realmData.linkedRealms.length).to.equal(1);
        });
    });
    
    describe("Content Indexing", function () {
        let realmId;
        
        beforeEach(async function () {
            realmId = ethers.id("test-realm");
            await aeonicHubIndexing.createRealm(
                realmId,
                1, // COMEDY_REALM
                "Comedy Realm",
                "ScrollVerse comedy",
                user1.address
            );
        });
        
        it("Should index content", async function () {
            const contentId = ethers.id("content-001");
            const tags = ["comedy", "sketch", "viral"];
            
            await expect(
                aeonicHubIndexing.indexContent(
                    contentId,
                    realmId,
                    "ipfs://QmTest123",
                    tags,
                    0 // INITIATE tier
                )
            ).to.emit(aeonicHubIndexing, "ContentIndexed");
            
            expect(await aeonicHubIndexing.totalContentIndexed()).to.equal(1);
        });
        
        it("Should not index duplicate content", async function () {
            const contentId = ethers.id("duplicate-content");
            
            await aeonicHubIndexing.indexContent(
                contentId,
                realmId,
                "ipfs://QmTest123",
                ["tag1"],
                0
            );
            
            await expect(
                aeonicHubIndexing.indexContent(
                    contentId,
                    realmId,
                    "ipfs://QmTest456",
                    ["tag2"],
                    0
                )
            ).to.be.revertedWith("Content already indexed");
        });
        
        it("Should track content by realm", async function () {
            const content1 = ethers.id("content-1");
            const content2 = ethers.id("content-2");
            
            await aeonicHubIndexing.indexContent(
                content1,
                realmId,
                "ipfs://QmTest1",
                ["tag1"],
                0
            );
            
            await aeonicHubIndexing.indexContent(
                content2,
                realmId,
                "ipfs://QmTest2",
                ["tag2"],
                0
            );
            
            const contentByRealm = await aeonicHubIndexing.getContentByRealm(realmId);
            expect(contentByRealm.length).to.equal(2);
        });
        
        it("Should track content by tag", async function () {
            const content1 = ethers.id("content-1");
            const content2 = ethers.id("content-2");
            
            await aeonicHubIndexing.indexContent(
                content1,
                realmId,
                "ipfs://QmTest1",
                ["viral"],
                0
            );
            
            await aeonicHubIndexing.indexContent(
                content2,
                realmId,
                "ipfs://QmTest2",
                ["viral", "trending"],
                0
            );
            
            const contentByTag = await aeonicHubIndexing.getContentByTag("viral");
            expect(contentByTag.length).to.equal(2);
        });
    });
    
    describe("Cross-Realm Linking", function () {
        let realm1, realm2, content1, content2;
        
        beforeEach(async function () {
            realm1 = ethers.id("realm-1");
            realm2 = ethers.id("realm-2");
            content1 = ethers.id("content-1");
            content2 = ethers.id("content-2");
            
            await aeonicHubIndexing.createRealm(
                realm1,
                0, // MUSIC_REALM
                "Music",
                "Music content",
                user1.address
            );
            
            await aeonicHubIndexing.createRealm(
                realm2,
                3, // MERCH_REALM
                "Merchandise",
                "Merch content",
                user2.address
            );
            
            await aeonicHubIndexing.indexContent(
                content1,
                realm1,
                "ipfs://music1",
                ["music"],
                0
            );
            
            await aeonicHubIndexing.indexContent(
                content2,
                realm2,
                "ipfs://merch1",
                ["merch"],
                0
            );
        });
        
        it("Should create cross-realm link", async function () {
            await expect(
                aeonicHubIndexing.createCrossRealmLink(
                    content1,
                    content2,
                    "merchandise"
                )
            ).to.emit(aeonicHubIndexing, "CrossRealmLinked");
            
            expect(await aeonicHubIndexing.totalCrossRealmLinks()).to.equal(1);
        });
        
        it("Should not link non-existent content", async function () {
            const fakeContent = ethers.id("fake-content");
            
            await expect(
                aeonicHubIndexing.createCrossRealmLink(
                    content1,
                    fakeContent,
                    "invalid"
                )
            ).to.be.revertedWith("Target content not indexed");
        });
    });
    
    describe("Fan Access", function () {
        let realmId;
        
        beforeEach(async function () {
            realmId = ethers.id("fan-realm");
            await aeonicHubIndexing.createRealm(
                realmId,
                0,
                "Test Realm",
                "Description",
                user1.address
            );
        });
        
        it("Should grant fan access", async function () {
            const accessibleRealms = [realmId];
            
            await expect(
                aeonicHubIndexing.grantFanAccess(
                    fan1.address,
                    1, // ASCENDING tier
                    accessibleRealms
                )
            ).to.emit(aeonicHubIndexing, "FanAccessGranted");
            
            expect(await aeonicHubIndexing.totalFans()).to.equal(1);
        });
        
        it("Should upgrade fan access tier", async function () {
            const accessibleRealms = [realmId];
            
            await aeonicHubIndexing.grantFanAccess(
                fan1.address,
                0, // INITIATE tier
                accessibleRealms
            );
            
            await expect(
                aeonicHubIndexing.upgradeFanAccess(
                    fan1.address,
                    3 // OMNIVERSAL tier
                )
            ).to.emit(aeonicHubIndexing, "FanAccessUpgraded");
            
            const [accessTier] = await aeonicHubIndexing.getFanAccess(fan1.address);
            expect(accessTier).to.equal(3);
        });
        
        it("Should allow content access with sufficient tier", async function () {
            const contentId = ethers.id("premium-content");
            
            await aeonicHubIndexing.indexContent(
                contentId,
                realmId,
                "ipfs://premium",
                ["premium"],
                1 // ASCENDING tier required
            );
            
            await aeonicHubIndexing.grantFanAccess(
                fan1.address,
                2, // SOVEREIGN tier (higher than required)
                [realmId]
            );
            
            await expect(
                aeonicHubIndexing.connect(fan1).accessContent(contentId)
            ).to.emit(aeonicHubIndexing, "ContentAccessed");
        });
        
        it("Should reject content access with insufficient tier", async function () {
            const contentId = ethers.id("premium-content");
            
            await aeonicHubIndexing.indexContent(
                contentId,
                realmId,
                "ipfs://premium",
                ["premium"],
                2 // SOVEREIGN tier required
            );
            
            await aeonicHubIndexing.grantFanAccess(
                fan1.address,
                0, // INITIATE tier
                [realmId]
            );
            
            await expect(
                aeonicHubIndexing.connect(fan1).accessContent(contentId)
            ).to.be.revertedWith("Insufficient access tier");
        });
        
        it("Should reject access without realm access", async function () {
            const realm2 = ethers.id("other-realm");
            await aeonicHubIndexing.createRealm(
                realm2,
                1,
                "Other Realm",
                "Description",
                user2.address
            );
            
            const contentId = ethers.id("restricted-content");
            await aeonicHubIndexing.indexContent(
                contentId,
                realm2,
                "ipfs://restricted",
                ["exclusive"],
                0
            );
            
            // Grant access to first realm only
            await aeonicHubIndexing.grantFanAccess(
                fan1.address,
                3,
                [realmId]
            );
            
            await expect(
                aeonicHubIndexing.connect(fan1).accessContent(contentId)
            ).to.be.revertedWith("No access to this realm");
        });
    });
    
    describe("View Functions", function () {
        it("Should return all realms", async function () {
            const realm1 = ethers.id("realm-1");
            const realm2 = ethers.id("realm-2");
            
            await aeonicHubIndexing.createRealm(
                realm1,
                0,
                "Realm 1",
                "Description 1",
                user1.address
            );
            
            await aeonicHubIndexing.createRealm(
                realm2,
                1,
                "Realm 2",
                "Description 2",
                user2.address
            );
            
            const allRealms = await aeonicHubIndexing.getAllRealms();
            expect(allRealms.length).to.equal(2);
        });
        
        it("Should check realm access for fan", async function () {
            const realmId = ethers.id("access-check-realm");
            
            await aeonicHubIndexing.createRealm(
                realmId,
                0,
                "Test Realm",
                "Description",
                user1.address
            );
            
            await aeonicHubIndexing.grantFanAccess(
                fan1.address,
                1,
                [realmId]
            );
            
            expect(await aeonicHubIndexing.hasRealmAccess(fan1.address, realmId)).to.equal(true);
            expect(await aeonicHubIndexing.hasRealmAccess(fan2.address, realmId)).to.equal(false);
        });
    });
});
