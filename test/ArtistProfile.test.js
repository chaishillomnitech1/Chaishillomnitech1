const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * @title ArtistProfile Contract Tests
 * @dev Comprehensive test suite for ArtistProfile contract
 * 
 * Frequency: 528Hz + 963Hz + 999Hz + 144000Hz
 * 
 * ALLĀHU AKBAR! 🕋✨💎🌌
 */

describe("ArtistProfile", function () {
    // Fixture for contract deployment
    async function deployArtistProfileFixture() {
        const [owner, artist1, artist2, revenueDistributor] = await ethers.getSigners();

        const ArtistProfile = await ethers.getContractFactory("ArtistProfile");
        const artistProfile = await ArtistProfile.deploy(owner.address);

        // Grant roles
        const REVENUE_DISTRIBUTOR_ROLE = await artistProfile.REVENUE_DISTRIBUTOR_ROLE();
        await artistProfile.grantRole(REVENUE_DISTRIBUTOR_ROLE, revenueDistributor.address);

        return { artistProfile, owner, artist1, artist2, revenueDistributor };
    }

    describe("Deployment", function () {
        it("Should deploy with correct owner", async function () {
            const { artistProfile, owner } = await loadFixture(deployArtistProfileFixture);
            const DEFAULT_ADMIN_ROLE = await artistProfile.DEFAULT_ADMIN_ROLE();
            expect(await artistProfile.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should initialize with zero artists", async function () {
            const { artistProfile } = await loadFixture(deployArtistProfileFixture);
            expect(await artistProfile.totalArtists()).to.equal(0);
        });

        it("Should initialize with zero artworks", async function () {
            const { artistProfile } = await loadFixture(deployArtistProfileFixture);
            expect(await artistProfile.totalArtworks()).to.equal(0);
        });
    });

    describe("Profile Management", function () {
        it("Should create artist profile", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Divine Creator",
                "Creating sacred art",
                "ipfs://profile",
                "https://artist.com"
            );

            const profile = await artistProfile.getProfile(artist1.address);
            expect(profile.name).to.equal("Divine Creator");
            expect(profile.bio).to.equal("Creating sacred art");
            expect(profile.isActive).to.be.true;
            expect(await artistProfile.totalArtists()).to.equal(1);
        });

        it("Should not allow duplicate profiles", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist One",
                "Bio one",
                "ipfs://1",
                "https://1.com"
            );

            await expect(
                artistProfile.connect(artist1).createProfile(
                    "Artist Two",
                    "Bio two",
                    "ipfs://2",
                    "https://2.com"
                )
            ).to.be.revertedWith("Profile already exists");
        });

        it("Should update profile", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Original Name",
                "Original Bio",
                "ipfs://old",
                "https://old.com"
            );

            await artistProfile.connect(artist1).updateProfile(
                "Updated Name",
                "Updated Bio",
                "ipfs://new",
                "https://new.com"
            );

            const profile = await artistProfile.getProfile(artist1.address);
            expect(profile.name).to.equal("Updated Name");
            expect(profile.bio).to.equal("Updated Bio");
        });

        it("Should emit ProfileCreated event", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await expect(
                artistProfile.connect(artist1).createProfile(
                    "Test Artist",
                    "Test Bio",
                    "ipfs://test",
                    "https://test.com"
                )
            ).to.emit(artistProfile, "ProfileCreated")
                .withArgs(artist1.address, "Test Artist", await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });
    });

    describe("Artwork Management", function () {
        it("Should add artwork to portfolio", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const tx = await artistProfile.connect(artist1).addArtwork(
                "Cosmic Art #1",
                "963Hz visualization",
                "ipfs://artwork",
                "ipfs://metadata",
                ethers.parseEther("1.0"),
                1000 // 10% royalty
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    return artistProfile.interface.parseLog(log).name === 'ArtworkAdded';
                } catch (e) {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            expect(await artistProfile.totalArtworks()).to.equal(1);
        });

        it("Should publish artwork", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const tx = await artistProfile.connect(artist1).addArtwork(
                "Art",
                "Description",
                "ipfs://art",
                "ipfs://meta",
                ethers.parseEther("1.0"),
                1000
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    return artistProfile.interface.parseLog(log).name === 'ArtworkAdded';
                } catch (e) {
                    return false;
                }
            });
            const artworkId = artistProfile.interface.parseLog(event).args.artworkId;

            await artistProfile.connect(artist1).publishArtwork(artworkId);

            const artwork = await artistProfile.getArtwork(artworkId);
            expect(artwork.status).to.equal(1); // PUBLISHED
        });

        it("Should track artwork metrics", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const tx = await artistProfile.connect(artist1).addArtwork(
                "Art",
                "Description",
                "ipfs://art",
                "ipfs://meta",
                ethers.parseEther("1.0"),
                1000
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    return artistProfile.interface.parseLog(log).name === 'ArtworkAdded';
                } catch (e) {
                    return false;
                }
            });
            const artworkId = artistProfile.interface.parseLog(event).args.artworkId;

            await artistProfile.incrementViews(artworkId);
            await artistProfile.incrementLikes(artworkId);

            const artwork = await artistProfile.getArtwork(artworkId);
            expect(artwork.views).to.equal(1);
            expect(artwork.likes).to.equal(1);
        });
    });

    describe("Artist Tiers", function () {
        it("Should start as COMMUNITY tier", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const profile = await artistProfile.getProfile(artist1.address);
            expect(profile.tier).to.equal(0); // COMMUNITY
        });

        it("Should upgrade to CREATOR tier with 100 artworks", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            // Add 100 artworks
            for (let i = 0; i < 100; i++) {
                await artistProfile.connect(artist1).addArtwork(
                    `Art ${i}`,
                    "Description",
                    "ipfs://art",
                    "ipfs://meta",
                    ethers.parseEther("1.0"),
                    1000
                );
            }

            const profile = await artistProfile.getProfile(artist1.address);
            expect(profile.tier).to.equal(1); // CREATOR
        });
    });

    describe("Revenue Tracking", function () {
        it("Should record revenue", async function () {
            const { artistProfile, artist1, revenueDistributor } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const tx = await artistProfile.connect(artist1).addArtwork(
                "Art",
                "Description",
                "ipfs://art",
                "ipfs://meta",
                ethers.parseEther("1.0"),
                1000
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    return artistProfile.interface.parseLog(log).name === 'ArtworkAdded';
                } catch (e) {
                    return false;
                }
            });
            const artworkId = artistProfile.interface.parseLog(event).args.artworkId;

            const amount = ethers.parseEther("1.0");
            await artistProfile.connect(revenueDistributor).recordRevenue(
                artist1.address,
                artworkId,
                amount
            );

            const metrics = await artistProfile.getRevenueMetrics(artist1.address);
            expect(metrics.totalEarned).to.equal(amount);
            expect(metrics.totalSales).to.equal(1);
        });

        it("Should record royalties", async function () {
            const { artistProfile, artist1, revenueDistributor } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const tx = await artistProfile.connect(artist1).addArtwork(
                "Art",
                "Description",
                "ipfs://art",
                "ipfs://meta",
                ethers.parseEther("1.0"),
                1000
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    return artistProfile.interface.parseLog(log).name === 'ArtworkAdded';
                } catch (e) {
                    return false;
                }
            });
            const artworkId = artistProfile.interface.parseLog(event).args.artworkId;

            const royaltyAmount = ethers.parseEther("0.1");
            await artistProfile.connect(revenueDistributor).recordRoyalty(
                artist1.address,
                artworkId,
                royaltyAmount
            );

            const profile = await artistProfile.getProfile(artist1.address);
            expect(profile.totalRoyalties).to.equal(royaltyAmount);
        });
    });

    describe("Staking", function () {
        it("Should allow staking", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const stakeAmount = ethers.parseEther("10.0");
            const lockPeriod = 90 * 24 * 60 * 60; // 90 days

            await artistProfile.connect(artist1).stake(lockPeriod, { value: stakeAmount });

            const stakingInfo = await artistProfile.getStakingInfo(artist1.address);
            expect(stakingInfo.amount).to.equal(stakeAmount);
            expect(stakingInfo.isActive).to.be.true;
        });

        it("Should calculate staking rewards", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            const stakeAmount = ethers.parseEther("10.0");
            const lockPeriod = 90 * 24 * 60 * 60;

            await artistProfile.connect(artist1).stake(lockPeriod, { value: stakeAmount });

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 days
            await ethers.provider.send("evm_mine");

            const pendingRewards = await artistProfile.getPendingRewards(artist1.address);
            expect(pendingRewards).to.be.gt(0);
        });
    });

    describe("Access Control", function () {
        it("Should restrict revenue recording to authorized role", async function () {
            const { artistProfile, artist1, artist2 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            await expect(
                artistProfile.connect(artist2).recordRevenue(
                    artist1.address,
                    1,
                    ethers.parseEther("1.0")
                )
            ).to.be.reverted;
        });

        it("Should allow admin to verify artists", async function () {
            const { artistProfile, owner, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            await artistProfile.connect(owner).verifyArtist(artist1.address);

            const profile = await artistProfile.getProfile(artist1.address);
            expect(profile.isVerified).to.be.true;
        });
    });

    describe("Edge Cases", function () {
        it("Should require name for profile creation", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await expect(
                artistProfile.connect(artist1).createProfile(
                    "",
                    "Bio",
                    "ipfs://profile",
                    "https://artist.com"
                )
            ).to.be.revertedWith("Name required");
        });

        it("Should enforce minimum staking amount", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            await expect(
                artistProfile.connect(artist1).stake(90 * 24 * 60 * 60, { 
                    value: ethers.parseEther("0.5") 
                })
            ).to.be.revertedWith("Insufficient stake");
        });

        it("Should enforce minimum lock period", async function () {
            const { artistProfile, artist1 } = await loadFixture(deployArtistProfileFixture);

            await artistProfile.connect(artist1).createProfile(
                "Artist",
                "Bio",
                "ipfs://profile",
                "https://artist.com"
            );

            await expect(
                artistProfile.connect(artist1).stake(1 * 24 * 60 * 60, { 
                    value: ethers.parseEther("10.0") 
                })
            ).to.be.revertedWith("Lock period too short");
        });
    });
});
