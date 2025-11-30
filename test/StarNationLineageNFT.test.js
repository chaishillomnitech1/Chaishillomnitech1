const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StarNationLineageNFT Contract Tests", function () {
    let nft;
    let owner;
    let royaltyReceiver;
    let addr1;
    let addr2;
    
    const NFT_NAME = "Star Nation Lineage";
    const NFT_SYMBOL = "STARLINEAGE";
    const BASE_URI = "ipfs://QmStarNationCID/";
    
    // StarNation enum values
    const SIRIAN = 0;
    const PLEIADIAN = 1;
    const ARCTURIAN = 2;
    const ANDROMEDAN = 3;
    const MULTI_STAR = 4;
    
    // Tier enum values
    const COSMIC_PIONEER = 0;
    const STAR_GUARDIAN = 1;
    const LINEAGE_KEEPER = 2;
    const TRUTH_SEEKER = 3;
    
    beforeEach(async function () {
        [owner, royaltyReceiver, addr1, addr2] = await ethers.getSigners();
        
        const StarNationLineageNFT = await ethers.getContractFactory("StarNationLineageNFT");
        nft = await StarNationLineageNFT.deploy(
            NFT_NAME,
            NFT_SYMBOL,
            BASE_URI,
            royaltyReceiver.address
        );
        await nft.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await nft.name()).to.equal(NFT_NAME);
            expect(await nft.symbol()).to.equal(NFT_SYMBOL);
        });
        
        it("Should set the correct owner", async function () {
            expect(await nft.owner()).to.equal(owner.address);
        });
        
        it("Should set the correct base URI", async function () {
            expect(await nft.baseURI()).to.equal(BASE_URI);
        });
        
        it("Should have correct frequency constants", async function () {
            expect(await nft.FREQUENCY_528HZ()).to.equal(528);
            expect(await nft.FREQUENCY_963HZ()).to.equal(963);
            expect(await nft.FREQUENCY_888HZ()).to.equal(888);
            expect(await nft.FREQUENCY_999HZ()).to.equal(999);
            expect(await nft.FREQUENCY_144000HZ()).to.equal(144000);
        });
        
        it("Should start with zero total supply", async function () {
            expect(await nft.totalSupply()).to.equal(0);
        });
        
        it("Should have correct max supply", async function () {
            expect(await nft.MAX_SUPPLY()).to.equal(14444);
        });
    });
    
    describe("Minting", function () {
        it("Should mint a new Sirian lineage NFT", async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
            
            expect(await nft.totalSupply()).to.equal(1);
            expect(await nft.ownerOf(0)).to.equal(addr1.address);
        });
        
        it("Should set correct star nation on mint", async function () {
            await nft.mintLineageNFT(addr1.address, PLEIADIAN);
            
            const lineage = await nft.getLineageData(0);
            expect(lineage.primaryNation).to.equal(PLEIADIAN);
        });
        
        it("Should emit LineageNFTMinted event", async function () {
            await expect(nft.mintLineageNFT(addr1.address, SIRIAN))
                .to.emit(nft, "LineageNFTMinted");
        });
        
        it("Should mint with full lineage data", async function () {
            const ipfsHash = ethers.id("lineage-data-hash");
            const origin = "West African - Dogon Tribe";
            
            await nft.mintWithLineage(addr1.address, SIRIAN, ipfsHash, origin);
            
            const lineage = await nft.getLineageData(0);
            expect(lineage.lineageIPFSHash).to.equal(ipfsHash);
            expect(lineage.ancestralOrigin).to.equal(origin);
        });
        
        it("Should not allow minting to zero address", async function () {
            await expect(nft.mintLineageNFT(ethers.ZeroAddress, SIRIAN))
                .to.be.revertedWithCustomError(nft, "InvalidAddress");
        });
        
        it("Should not allow non-owner to mint", async function () {
            await expect(nft.connect(addr1).mintLineageNFT(addr1.address, SIRIAN))
                .to.be.reverted;
        });
        
        it("Should increment token ID correctly", async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
            await nft.mintLineageNFT(addr2.address, PLEIADIAN);
            
            expect(await nft.ownerOf(0)).to.equal(addr1.address);
            expect(await nft.ownerOf(1)).to.equal(addr2.address);
            expect(await nft.totalSupply()).to.equal(2);
        });
    });
    
    describe("Star Nation Frequencies", function () {
        it("Should assign Sirian frequencies (528Hz + 963Hz)", async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
            
            const frequencies = await nft.getResonanceFrequencies(0);
            expect(frequencies.length).to.equal(2);
            expect(frequencies[0]).to.equal(528);
            expect(frequencies[1]).to.equal(963);
        });
        
        it("Should assign Pleiadian frequencies (528Hz + 888Hz)", async function () {
            await nft.mintLineageNFT(addr1.address, PLEIADIAN);
            
            const frequencies = await nft.getResonanceFrequencies(0);
            expect(frequencies.length).to.equal(2);
            expect(frequencies[0]).to.equal(528);
            expect(frequencies[1]).to.equal(888);
        });
        
        it("Should assign Arcturian frequencies (963Hz + 144000Hz)", async function () {
            await nft.mintLineageNFT(addr1.address, ARCTURIAN);
            
            const frequencies = await nft.getResonanceFrequencies(0);
            expect(frequencies.length).to.equal(2);
            expect(frequencies[0]).to.equal(963);
            expect(frequencies[1]).to.equal(144000);
        });
        
        it("Should assign Andromedan frequencies (999Hz + 144000Hz)", async function () {
            await nft.mintLineageNFT(addr1.address, ANDROMEDAN);
            
            const frequencies = await nft.getResonanceFrequencies(0);
            expect(frequencies.length).to.equal(2);
            expect(frequencies[0]).to.equal(999);
            expect(frequencies[1]).to.equal(144000);
        });
        
        it("Should assign Multi-Star full spectrum frequencies", async function () {
            await nft.mintLineageNFT(addr1.address, MULTI_STAR);
            
            const frequencies = await nft.getResonanceFrequencies(0);
            expect(frequencies.length).to.equal(5);
            expect(frequencies[0]).to.equal(528);
            expect(frequencies[1]).to.equal(963);
            expect(frequencies[2]).to.equal(888);
            expect(frequencies[3]).to.equal(999);
            expect(frequencies[4]).to.equal(144000);
        });
    });
    
    describe("Star Code Activation", function () {
        beforeEach(async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
        });
        
        it("Should allow token owner to activate star code", async function () {
            await nft.connect(addr1).activateStarCode(0);
            
            expect(await nft.isStarCodeActivated(0)).to.equal(true);
        });
        
        it("Should emit StarCodeActivated event", async function () {
            await expect(nft.connect(addr1).activateStarCode(0))
                .to.emit(nft, "StarCodeActivated");
        });
        
        it("Should enable frequency resonance on activation", async function () {
            await nft.connect(addr1).activateStarCode(0);
            
            expect(await nft.frequencyResonanceActive(0)).to.equal(true);
        });
        
        it("Should increment total activations", async function () {
            expect(await nft.totalActivations()).to.equal(0);
            
            await nft.connect(addr1).activateStarCode(0);
            
            expect(await nft.totalActivations()).to.equal(1);
        });
        
        it("Should not allow non-owner to activate", async function () {
            await expect(nft.connect(addr2).activateStarCode(0))
                .to.be.revertedWithCustomError(nft, "NotTokenOwner");
        });
        
        it("Should not allow double activation", async function () {
            await nft.connect(addr1).activateStarCode(0);
            
            await expect(nft.connect(addr1).activateStarCode(0))
                .to.be.revertedWithCustomError(nft, "AlreadyActivated");
        });
    });
    
    describe("Frequency Resonance Toggle", function () {
        beforeEach(async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
        });
        
        it("Should toggle frequency resonance", async function () {
            expect(await nft.frequencyResonanceActive(0)).to.equal(false);
            
            await nft.connect(addr1).toggleFrequencyResonance(0);
            expect(await nft.frequencyResonanceActive(0)).to.equal(true);
            
            await nft.connect(addr1).toggleFrequencyResonance(0);
            expect(await nft.frequencyResonanceActive(0)).to.equal(false);
        });
        
        it("Should emit FrequencyResonanceToggled event", async function () {
            await expect(nft.connect(addr1).toggleFrequencyResonance(0))
                .to.emit(nft, "FrequencyResonanceToggled")
                .withArgs(0, true, (state) => state > 0); // Verify timestamp is a positive number
        });
        
        it("Should not allow non-owner to toggle", async function () {
            await expect(nft.connect(addr2).toggleFrequencyResonance(0))
                .to.be.revertedWithCustomError(nft, "NotTokenOwner");
        });
    });
    
    describe("Lineage Registration", function () {
        beforeEach(async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
        });
        
        it("Should register lineage data", async function () {
            const ipfsHash = ethers.id("lineage-ipfs-hash");
            const origin = "Egyptian - Kemet";
            
            await nft.connect(addr1).registerLineage(0, ipfsHash, origin);
            
            const lineage = await nft.getLineageData(0);
            expect(lineage.lineageIPFSHash).to.equal(ipfsHash);
            expect(lineage.ancestralOrigin).to.equal(origin);
        });
        
        it("Should emit LineageRegistered event", async function () {
            const ipfsHash = ethers.id("lineage-ipfs-hash");
            const origin = "Egyptian - Kemet";
            
            await expect(nft.connect(addr1).registerLineage(0, ipfsHash, origin))
                .to.emit(nft, "LineageRegistered");
        });
        
        it("Should not allow non-owner to register", async function () {
            const ipfsHash = ethers.id("lineage-ipfs-hash");
            
            await expect(nft.connect(addr2).registerLineage(0, ipfsHash, "test"))
                .to.be.revertedWithCustomError(nft, "NotTokenOwner");
        });
    });
    
    describe("ScrollChain Hub - Lineage Submissions", function () {
        it("Should submit lineage data", async function () {
            const dataHash = ethers.id("user-lineage-data");
            
            await nft.connect(addr1).submitLineageData(dataHash);
            
            const submissions = await nft.getUserSubmissions(addr1.address);
            expect(submissions.length).to.equal(1);
            expect(submissions[0].dataHash).to.equal(dataHash);
            expect(submissions[0].verified).to.equal(false);
        });
        
        it("Should emit LineageSubmitted event", async function () {
            const dataHash = ethers.id("user-lineage-data");
            
            await expect(nft.connect(addr1).submitLineageData(dataHash))
                .to.emit(nft, "LineageSubmitted");
        });
        
        it("Should increment total submissions", async function () {
            const dataHash = ethers.id("user-lineage-data");
            
            expect(await nft.totalSubmissions()).to.equal(0);
            
            await nft.connect(addr1).submitLineageData(dataHash);
            
            expect(await nft.totalSubmissions()).to.equal(1);
        });
        
        it("Should not allow empty submissions", async function () {
            await expect(nft.connect(addr1).submitLineageData(ethers.ZeroHash))
                .to.be.revertedWithCustomError(nft, "EmptySubmission");
        });
        
        it("Should allow multiple submissions from same user", async function () {
            await nft.connect(addr1).submitLineageData(ethers.id("data1"));
            await nft.connect(addr1).submitLineageData(ethers.id("data2"));
            
            const submissions = await nft.getUserSubmissions(addr1.address);
            expect(submissions.length).to.equal(2);
        });
        
        it("Should allow admin to verify submission", async function () {
            await nft.connect(addr1).submitLineageData(ethers.id("data"));
            
            await nft.verifySubmission(addr1.address, 0);
            
            const submissions = await nft.getUserSubmissions(addr1.address);
            expect(submissions[0].verified).to.equal(true);
        });
    });
    
    describe("Batch Minting", function () {
        it("Should batch mint multiple NFTs", async function () {
            const recipients = [addr1.address, addr2.address, addr1.address];
            const nations = [SIRIAN, PLEIADIAN, ARCTURIAN];
            
            await nft.batchMint(recipients, nations);
            
            expect(await nft.totalSupply()).to.equal(3);
            expect(await nft.ownerOf(0)).to.equal(addr1.address);
            expect(await nft.ownerOf(1)).to.equal(addr2.address);
            expect(await nft.ownerOf(2)).to.equal(addr1.address);
        });
        
        it("Should set correct star nations in batch", async function () {
            const recipients = [addr1.address, addr2.address];
            const nations = [SIRIAN, PLEIADIAN];
            
            await nft.batchMint(recipients, nations);
            
            const lineage0 = await nft.getLineageData(0);
            expect(lineage0.primaryNation).to.equal(SIRIAN);
            
            const lineage1 = await nft.getLineageData(1);
            expect(lineage1.primaryNation).to.equal(PLEIADIAN);
        });
        
        it("Should revert on length mismatch", async function () {
            const recipients = [addr1.address, addr2.address];
            const nations = [SIRIAN];
            
            await expect(nft.batchMint(recipients, nations))
                .to.be.revertedWith("Length mismatch");
        });
    });
    
    describe("Token Tiers", function () {
        it("Should return COSMIC_PIONEER for tokens 0-99", async function () {
            expect(await nft.getTokenTier(0)).to.equal(COSMIC_PIONEER);
            expect(await nft.getTokenTier(99)).to.equal(COSMIC_PIONEER);
        });
        
        it("Should return STAR_GUARDIAN for tokens 100-999", async function () {
            expect(await nft.getTokenTier(100)).to.equal(STAR_GUARDIAN);
            expect(await nft.getTokenTier(999)).to.equal(STAR_GUARDIAN);
        });
        
        it("Should return LINEAGE_KEEPER for tokens 1000-4999", async function () {
            expect(await nft.getTokenTier(1000)).to.equal(LINEAGE_KEEPER);
            expect(await nft.getTokenTier(4999)).to.equal(LINEAGE_KEEPER);
        });
        
        it("Should return TRUTH_SEEKER for tokens 5000+", async function () {
            expect(await nft.getTokenTier(5000)).to.equal(TRUTH_SEEKER);
            expect(await nft.getTokenTier(14443)).to.equal(TRUTH_SEEKER);
        });
    });
    
    describe("Tiered Royalties (ERC2981)", function () {
        const salePrice = ethers.parseEther("1");
        
        it("Should return 17% royalty for COSMIC_PIONEER tier", async function () {
            const [receiver, amount] = await nft.royaltyInfo(0, salePrice);
            
            expect(receiver).to.equal(royaltyReceiver.address);
            expect(amount).to.equal(ethers.parseEther("0.17")); // 17%
        });
        
        it("Should return 15% royalty for STAR_GUARDIAN tier", async function () {
            const [receiver, amount] = await nft.royaltyInfo(100, salePrice);
            
            expect(amount).to.equal(ethers.parseEther("0.15")); // 15%
        });
        
        it("Should return 12% royalty for LINEAGE_KEEPER tier", async function () {
            const [receiver, amount] = await nft.royaltyInfo(1000, salePrice);
            
            expect(amount).to.equal(ethers.parseEther("0.12")); // 12%
        });
        
        it("Should return 10% royalty for TRUTH_SEEKER tier", async function () {
            const [receiver, amount] = await nft.royaltyInfo(5000, salePrice);
            
            expect(amount).to.equal(ethers.parseEther("0.1")); // 10%
        });
        
        it("Should allow owner to update royalty", async function () {
            await nft.updateRoyalty(addr1.address, 500);
            
            await expect(nft.updateRoyalty(addr1.address, 500))
                .to.emit(nft, "RoyaltyUpdated")
                .withArgs(addr1.address, 500);
        });
        
        it("Should not allow royalty above 17%", async function () {
            await expect(nft.updateRoyalty(addr1.address, 1701))
                .to.be.revertedWith("Royalty too high");
        });
        
        it("Should not allow zero address royalty receiver", async function () {
            await expect(nft.updateRoyalty(ethers.ZeroAddress, 500))
                .to.be.revertedWithCustomError(nft, "InvalidRoyaltyReceiver");
        });
    });
    
    describe("Admin Functions", function () {
        it("Should allow owner to update base URI", async function () {
            const newURI = "ipfs://NewStarCID/";
            await nft.setBaseURI(newURI);
            expect(await nft.baseURI()).to.equal(newURI);
        });
        
        it("Should emit BaseURISet event", async function () {
            const newURI = "ipfs://NewStarCID/";
            await expect(nft.setBaseURI(newURI))
                .to.emit(nft, "BaseURISet")
                .withArgs(newURI);
        });
    });
    
    describe("Cosmic Resonance Signature", function () {
        it("Should return correct cosmic resonance signature", async function () {
            const resonance = await nft.getCosmicResonanceSignature();
            // 528 + 963 + 888 + 999 + 144000 = 147378
            expect(resonance).to.equal(147378);
        });
    });
    
    describe("Interface Support", function () {
        it("Should support ERC721 interface", async function () {
            expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
        });
        
        it("Should support ERC2981 interface", async function () {
            expect(await nft.supportsInterface("0x2a55205a")).to.equal(true);
        });
        
        it("Should support ERC165 interface", async function () {
            expect(await nft.supportsInterface("0x01ffc9a7")).to.equal(true);
        });
    });
    
    describe("Token URI", function () {
        beforeEach(async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
        });
        
        it("Should return correct token URI", async function () {
            const uri = await nft.tokenURI(0);
            expect(uri).to.equal(BASE_URI + "0");
        });
        
        it("Should update with new base URI", async function () {
            const newURI = "ipfs://UpdatedCID/";
            await nft.setBaseURI(newURI);
            
            const uri = await nft.tokenURI(0);
            expect(uri).to.equal(newURI + "0");
        });
    });
    
    describe("Burn", function () {
        beforeEach(async function () {
            await nft.mintLineageNFT(addr1.address, SIRIAN);
        });
        
        it("Should allow token owner to burn", async function () {
            await nft.connect(addr1).burn(0);
            
            await expect(nft.ownerOf(0)).to.be.reverted;
        });
    });
});
