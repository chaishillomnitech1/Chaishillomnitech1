const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SacredCertificationNFT Contract Tests", function () {
  let sacredCertNFT;
  let owner;
  let certifier;
  let addr1;
  let addr2;
  
  const BASE_URI = "ipfs://";
  
  // Helper to generate unique hashes for each test
  let hashCounter = 0;
  function getUniqueIPFSHash() {
    hashCounter++;
    return `QmXxYzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abc${hashCounter}`;
  }
  function getUniqueArtifactHash() {
    return ethers.keccak256(ethers.toUtf8Bytes(`sacred-artifact-content-${hashCounter}`));
  }
  
  const ARTIFACT_NAME = "Sacred Protocols Document";
  
  // Geometry pattern enums
  const GeometryPattern = {
    FLOWER_OF_LIFE: 0,
    METATRONS_CUBE: 1,
    SRI_YANTRA: 2,
    SEED_OF_LIFE: 3,
    VESICA_PISCIS: 4,
    TORUS: 5,
    MERKABA: 6
  };
  
  // Certification level enums
  const CertificationLevel = {
    INITIATE: 0,
    ASCENDING: 1,
    SOVEREIGN: 2,
    OMNIVERSAL: 3
  };
  
  // Artifact type enums
  const ArtifactType = {
    DOCUMENT: 0,
    PROTOCOL: 1,
    TRANSMISSION: 2,
    SYMBOL: 3,
    CONTRACT: 4,
    MEDIA: 5
  };
  
  // Frequency constants
  const FREQUENCY_528HZ = 528;
  const FREQUENCY_963HZ = 963;
  const FREQUENCY_999HZ = 999;
  const FREQUENCY_144000HZ = 144000;
  
  // Token IDs start at 1
  const FIRST_TOKEN_ID = 1;
  
  beforeEach(async function () {
    [owner, certifier, addr1, addr2] = await ethers.getSigners();
    hashCounter = 0; // Reset counter for each test
    
    const SacredCertificationNFT = await ethers.getContractFactory("SacredCertificationNFT");
    sacredCertNFT = await SacredCertificationNFT.deploy(BASE_URI, owner.address);
    await sacredCertNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await sacredCertNFT.name()).to.equal("Sacred Certification NFT");
      expect(await sacredCertNFT.symbol()).to.equal("SACREDCERT");
    });
    
    it("Should set the correct owner", async function () {
      expect(await sacredCertNFT.owner()).to.equal(owner.address);
    });
    
    it("Should have zero initial supply", async function () {
      expect(await sacredCertNFT.totalSupply()).to.equal(0);
    });
    
    it("Should set the correct frequencies", async function () {
      expect(await sacredCertNFT.FREQUENCY_528HZ()).to.equal(528);
      expect(await sacredCertNFT.FREQUENCY_963HZ()).to.equal(963);
      expect(await sacredCertNFT.FREQUENCY_999HZ()).to.equal(999);
      expect(await sacredCertNFT.FREQUENCY_144000HZ()).to.equal(144000);
    });
    
    it("Should set the correct max supply", async function () {
      expect(await sacredCertNFT.MAX_SUPPLY()).to.equal(14444);
    });
    
    it("Should set the correct royalty percentage", async function () {
      expect(await sacredCertNFT.ROYALTY_PERCENTAGE()).to.equal(1700); // 17%
    });
    
    it("Should initialize all sacred geometry patterns", async function () {
      // Flower of Life
      const flowerOfLife = await sacredCertNFT.getGeometryMetadata(GeometryPattern.FLOWER_OF_LIFE);
      expect(flowerOfLife.vertices).to.equal(19);
      expect(flowerOfLife.symmetryOrder).to.equal(6);
      expect(flowerOfLife.sacredRatio).to.equal(1618); // Golden ratio * 1000
      expect(flowerOfLife.isActive).to.be.true;
      
      // Metatron's Cube
      const metatronsCube = await sacredCertNFT.getGeometryMetadata(GeometryPattern.METATRONS_CUBE);
      expect(metatronsCube.vertices).to.equal(13);
      expect(metatronsCube.symmetryOrder).to.equal(6);
      
      // Sri Yantra
      const sriYantra = await sacredCertNFT.getGeometryMetadata(GeometryPattern.SRI_YANTRA);
      expect(sriYantra.vertices).to.equal(9);
      expect(sriYantra.symmetryOrder).to.equal(9);
      
      // Merkaba
      const merkaba = await sacredCertNFT.getGeometryMetadata(GeometryPattern.MERKABA);
      expect(merkaba.vertices).to.equal(8);
      expect(merkaba.symbolicMeaning).to.equal("Light Body Ascension");
    });
  });
  
  describe("Certifier Authorization", function () {
    it("Should allow owner to authorize certifiers", async function () {
      await sacredCertNFT.setAuthorizedCertifier(certifier.address, true);
      expect(await sacredCertNFT.authorizedCertifiers(certifier.address)).to.be.true;
    });
    
    it("Should emit event when certifier is authorized", async function () {
      await expect(sacredCertNFT.setAuthorizedCertifier(certifier.address, true))
        .to.emit(sacredCertNFT, "CertifierAuthorized")
        .withArgs(certifier.address, true);
    });
    
    it("Should not allow non-owner to authorize certifiers", async function () {
      await expect(
        sacredCertNFT.connect(addr1).setAuthorizedCertifier(certifier.address, true)
      ).to.be.reverted;
    });
    
    it("Should allow owner to revoke certifier authorization", async function () {
      await sacredCertNFT.setAuthorizedCertifier(certifier.address, true);
      await sacredCertNFT.setAuthorizedCertifier(certifier.address, false);
      expect(await sacredCertNFT.authorizedCertifiers(certifier.address)).to.be.false;
    });
  });
  
  describe("Minting Sacred Certifications", function () {
    it("Should mint a Sacred Certification with valid parameters", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await expect(
        sacredCertNFT.mintSacredCertification(
          addr1.address,
          ipfsHash,
          artifactHash,
          GeometryPattern.FLOWER_OF_LIFE,
          ArtifactType.DOCUMENT,
          ARTIFACT_NAME,
          FREQUENCY_528HZ
        )
      ).to.emit(sacredCertNFT, "SacredCertificationMinted");
      
      expect(await sacredCertNFT.totalSupply()).to.equal(1);
      expect(await sacredCertNFT.ownerOf(FIRST_TOKEN_ID)).to.equal(addr1.address);
    });
    
    it("Should store correct certification data", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        ipfsHash,
        artifactHash,
        GeometryPattern.METATRONS_CUBE,
        ArtifactType.PROTOCOL,
        ARTIFACT_NAME,
        FREQUENCY_963HZ
      );
      
      const cert = await sacredCertNFT.getCertification(FIRST_TOKEN_ID);
      expect(cert.ipfsHash).to.equal(ipfsHash);
      expect(cert.artifactHash).to.equal(artifactHash);
      expect(cert.geometryPattern).to.equal(GeometryPattern.METATRONS_CUBE);
      expect(cert.artifactType).to.equal(ArtifactType.PROTOCOL);
      expect(cert.primaryFrequency).to.equal(FREQUENCY_963HZ);
      expect(cert.verified).to.be.true;
      expect(cert.artifactName).to.equal(ARTIFACT_NAME);
    });
    
    it("Should store correct IPFS reference", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        ipfsHash,
        artifactHash,
        GeometryPattern.SRI_YANTRA,
        ArtifactType.TRANSMISSION,
        ARTIFACT_NAME,
        FREQUENCY_999HZ
      );
      
      const ipfsRef = await sacredCertNFT.getIPFSReference(FIRST_TOKEN_ID);
      expect(ipfsRef.ipfsHash).to.equal(ipfsHash);
      expect(ipfsRef.gateway).to.equal("ipfs.io");
      expect(ipfsRef.isPinned).to.be.true;
    });
    
    it("Should calculate correct certification level based on frequency", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        ipfsHash,
        artifactHash,
        GeometryPattern.FLOWER_OF_LIFE,
        ArtifactType.DOCUMENT,
        ARTIFACT_NAME,
        FREQUENCY_528HZ
      );
      
      const cert = await sacredCertNFT.getCertification(FIRST_TOKEN_ID);
      expect(cert.level).to.equal(CertificationLevel.ASCENDING);
    });
    
    it("Should assign secondary frequency for dual-frequency patterns", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        ipfsHash,
        artifactHash,
        GeometryPattern.FLOWER_OF_LIFE,
        ArtifactType.DOCUMENT,
        ARTIFACT_NAME,
        FREQUENCY_528HZ
      );
      
      const cert = await sacredCertNFT.getCertification(FIRST_TOKEN_ID);
      expect(cert.secondaryFrequency).to.equal(FREQUENCY_963HZ);
    });
    
    it("Should fail to mint with empty IPFS hash", async function () {
      const artifactHash = getUniqueArtifactHash();
      
      await expect(
        sacredCertNFT.mintSacredCertification(
          addr1.address,
          "",
          artifactHash,
          GeometryPattern.FLOWER_OF_LIFE,
          ArtifactType.DOCUMENT,
          ARTIFACT_NAME,
          FREQUENCY_528HZ
        )
      ).to.be.revertedWith("IPFS hash required");
    });
    
    it("Should fail to mint with zero artifact hash", async function () {
      const ipfsHash = getUniqueIPFSHash();
      
      await expect(
        sacredCertNFT.mintSacredCertification(
          addr1.address,
          ipfsHash,
          ethers.ZeroHash,
          GeometryPattern.FLOWER_OF_LIFE,
          ArtifactType.DOCUMENT,
          ARTIFACT_NAME,
          FREQUENCY_528HZ
        )
      ).to.be.revertedWith("Artifact hash required");
    });
    
    it("Should fail to mint duplicate IPFS hash", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash1 = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        ipfsHash,
        artifactHash1,
        GeometryPattern.FLOWER_OF_LIFE,
        ArtifactType.DOCUMENT,
        ARTIFACT_NAME,
        FREQUENCY_528HZ
      );
      
      const artifactHash2 = ethers.keccak256(ethers.toUtf8Bytes("different-content"));
      await expect(
        sacredCertNFT.mintSacredCertification(
          addr2.address,
          ipfsHash,
          artifactHash2,
          GeometryPattern.METATRONS_CUBE,
          ArtifactType.PROTOCOL,
          "Different Artifact",
          FREQUENCY_963HZ
        )
      ).to.be.revertedWith("IPFS hash already certified");
    });
    
    it("Should fail to mint with invalid frequency", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await expect(
        sacredCertNFT.mintSacredCertification(
          addr1.address,
          ipfsHash,
          artifactHash,
          GeometryPattern.FLOWER_OF_LIFE,
          ArtifactType.DOCUMENT,
          ARTIFACT_NAME,
          123
        )
      ).to.be.revertedWith("Invalid frequency");
    });
    
    it("Should only allow authorized certifiers to mint", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await expect(
        sacredCertNFT.connect(addr1).mintSacredCertification(
          addr2.address,
          ipfsHash,
          artifactHash,
          GeometryPattern.FLOWER_OF_LIFE,
          ArtifactType.DOCUMENT,
          ARTIFACT_NAME,
          FREQUENCY_528HZ
        )
      ).to.be.revertedWith("Not authorized certifier");
    });
    
    it("Should allow authorized certifier to mint", async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.setAuthorizedCertifier(certifier.address, true);
      
      await expect(
        sacredCertNFT.connect(certifier).mintSacredCertification(
          addr1.address,
          ipfsHash,
          artifactHash,
          GeometryPattern.FLOWER_OF_LIFE,
          ArtifactType.DOCUMENT,
          ARTIFACT_NAME,
          FREQUENCY_528HZ
        )
      ).to.emit(sacredCertNFT, "SacredCertificationMinted");
    });
  });
  
  describe("IPFS Verification", function () {
    let testIPFSHash;
    let testArtifactHash;
    
    beforeEach(async function () {
      testIPFSHash = getUniqueIPFSHash();
      testArtifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        testIPFSHash,
        testArtifactHash,
        GeometryPattern.FLOWER_OF_LIFE,
        ArtifactType.DOCUMENT,
        ARTIFACT_NAME,
        FREQUENCY_528HZ
      );
    });
    
    it("Should verify artifact by IPFS hash", async function () {
      const [verified, tokenId] = await sacredCertNFT.verifyByIPFSHash(testIPFSHash);
      expect(verified).to.be.true;
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
    });
    
    it("Should verify artifact by artifact hash", async function () {
      const [verified, tokenId] = await sacredCertNFT.verifyArtifactByHash(testArtifactHash);
      expect(verified).to.be.true;
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
    });
    
    it("Should return false for unregistered IPFS hash", async function () {
      const [verified, tokenId] = await sacredCertNFT.verifyByIPFSHash("QmUnknownHash");
      expect(verified).to.be.false;
      expect(tokenId).to.equal(0);
    });
    
    it("Should return correct IPFS URL", async function () {
      const url = await sacredCertNFT.getIPFSUrl(FIRST_TOKEN_ID);
      expect(url).to.equal(`https://ipfs.io/ipfs/${testIPFSHash}`);
    });
  });
  
  describe("Geometry State Management", function () {
    beforeEach(async function () {
      const ipfsHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        ipfsHash,
        artifactHash,
        GeometryPattern.MERKABA,
        ArtifactType.SYMBOL,
        ARTIFACT_NAME,
        FREQUENCY_963HZ
      );
    });
    
    it("Should initialize geometry state on mint", async function () {
      const state = await sacredCertNFT.geometryState(FIRST_TOKEN_ID);
      expect(state).to.be.gt(0);
    });
    
    it("Should allow token owner to update geometry state", async function () {
      const newState = 12345;
      await sacredCertNFT.connect(addr1).updateGeometryState(FIRST_TOKEN_ID, newState);
      expect(await sacredCertNFT.geometryState(FIRST_TOKEN_ID)).to.equal(newState);
    });
    
    it("Should not allow non-owner to update geometry state", async function () {
      await expect(
        sacredCertNFT.connect(addr2).updateGeometryState(FIRST_TOKEN_ID, 12345)
      ).to.be.revertedWith("Not token owner");
    });
    
    it("Should allow token owner to evolve geometry pattern", async function () {
      const initialState = await sacredCertNFT.geometryState(FIRST_TOKEN_ID);
      
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await sacredCertNFT.connect(addr1).evolveGeometryPattern(FIRST_TOKEN_ID);
      
      const newState = await sacredCertNFT.geometryState(FIRST_TOKEN_ID);
      expect(newState).to.not.equal(initialState);
    });
  });
  
  describe("IPFS Reference Management", function () {
    let testIPFSHash;
    
    beforeEach(async function () {
      testIPFSHash = getUniqueIPFSHash();
      const artifactHash = getUniqueArtifactHash();
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        testIPFSHash,
        artifactHash,
        GeometryPattern.FLOWER_OF_LIFE,
        ArtifactType.DOCUMENT,
        ARTIFACT_NAME,
        FREQUENCY_528HZ
      );
    });
    
    it("Should allow owner to update IPFS reference", async function () {
      await sacredCertNFT.updateIPFSReference(FIRST_TOKEN_ID, "gateway.pinata.cloud", true);
      
      const ipfsRef = await sacredCertNFT.getIPFSReference(FIRST_TOKEN_ID);
      expect(ipfsRef.gateway).to.equal("gateway.pinata.cloud");
      expect(ipfsRef.isPinned).to.be.true;
    });
    
    it("Should emit event when IPFS reference is updated", async function () {
      await expect(sacredCertNFT.updateIPFSReference(FIRST_TOKEN_ID, "cloudflare-ipfs.com", true))
        .to.emit(sacredCertNFT, "IPFSReferenceUpdated")
        .withArgs(FIRST_TOKEN_ID, testIPFSHash, "cloudflare-ipfs.com", true);
    });
  });
  
  describe("Counting and Statistics", function () {
    it("Should track certification count by level", async function () {
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        getUniqueIPFSHash(),
        getUniqueArtifactHash(),
        GeometryPattern.FLOWER_OF_LIFE,
        ArtifactType.DOCUMENT,
        "Doc 1",
        FREQUENCY_528HZ
      );
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        getUniqueIPFSHash(),
        getUniqueArtifactHash(),
        GeometryPattern.METATRONS_CUBE,
        ArtifactType.PROTOCOL,
        "Doc 2",
        FREQUENCY_963HZ
      );
      
      expect(await sacredCertNFT.getCertificationCountByLevel(CertificationLevel.ASCENDING)).to.equal(1);
      expect(await sacredCertNFT.getCertificationCountByLevel(CertificationLevel.SOVEREIGN)).to.equal(1);
    });
    
    it("Should track artifact count by type", async function () {
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        getUniqueIPFSHash(),
        getUniqueArtifactHash(),
        GeometryPattern.FLOWER_OF_LIFE,
        ArtifactType.DOCUMENT,
        "Doc 1",
        FREQUENCY_528HZ
      );
      
      await sacredCertNFT.mintSacredCertification(
        addr1.address,
        getUniqueIPFSHash(),
        getUniqueArtifactHash(),
        GeometryPattern.METATRONS_CUBE,
        ArtifactType.DOCUMENT,
        "Doc 2",
        FREQUENCY_963HZ
      );
      
      expect(await sacredCertNFT.getArtifactCountByType(ArtifactType.DOCUMENT)).to.equal(2);
    });
  });
  
  describe("EIP-2981 Royalty", function () {
    it("Should return correct royalty info (17%)", async function () {
      const salePrice = ethers.parseEther("1.0");
      const [recipient, royaltyAmount] = await sacredCertNFT.royaltyInfo(0, salePrice);
      
      expect(recipient).to.equal(owner.address);
      expect(royaltyAmount).to.equal(salePrice * BigInt(1700) / BigInt(10000));
    });
    
    it("Should allow owner to change royalty recipient", async function () {
      await sacredCertNFT.setRoyaltyRecipient(addr1.address);
      const [recipient] = await sacredCertNFT.royaltyInfo(0, ethers.parseEther("1.0"));
      expect(recipient).to.equal(addr1.address);
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to set base URI", async function () {
      const newURI = "ipfs://QmNewBaseURI/";
      await sacredCertNFT.setBaseURI(newURI);
    });
    
    it("Should allow owner to update geometry metadata", async function () {
      await sacredCertNFT.updateGeometryMetadata(
        GeometryPattern.FLOWER_OF_LIFE,
        21,
        7,
        1618,
        "Updated Universal Creation"
      );
      
      const meta = await sacredCertNFT.getGeometryMetadata(GeometryPattern.FLOWER_OF_LIFE);
      expect(meta.vertices).to.equal(21);
      expect(meta.symmetryOrder).to.equal(7);
      expect(meta.symbolicMeaning).to.equal("Updated Universal Creation");
    });
  });
  
  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      expect(await sacredCertNFT.supportsInterface("0x80ac58cd")).to.be.true;
    });
    
    it("Should support ERC2981 royalty interface", async function () {
      expect(await sacredCertNFT.supportsInterface("0x2a55205a")).to.be.true;
    });
  });
});
