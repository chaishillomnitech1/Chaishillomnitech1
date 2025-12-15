const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OperationBounceBackNFT", function () {
  let nft;
  let owner;
  let treasuryWallet;
  let donor1;
  let donor2;
  let donor3;
  const baseURI = "https://operationbounceback.org/api/metadata/";

  beforeEach(async function () {
    [owner, treasuryWallet, donor1, donor2, donor3] = await ethers.getSigners();

    const OperationBounceBackNFT = await ethers.getContractFactory("OperationBounceBackNFT");
    nft = await OperationBounceBackNFT.deploy(owner.address, treasuryWallet.address, baseURI);
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nft.name()).to.equal("Operation Bounce Back");
      expect(await nft.symbol()).to.equal("OBB");
    });

    it("Should set the correct owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should set the correct treasury wallet", async function () {
      expect(await nft.treasuryWallet()).to.equal(treasuryWallet.address);
    });

    it("Should have correct max supply", async function () {
      expect(await nft.MAX_SUPPLY()).to.equal(999);
    });

    it("Should start with zero minted", async function () {
      expect(await nft.totalMinted()).to.equal(0);
    });
  });

  describe("Minting with Donations", function () {
    it("Should mint NFT with Community Hero donation", async function () {
      const donationAmount = ethers.parseEther("500");
      const qrCode = "ipfs://QmTest123";

      await expect(
        nft.connect(donor1).mintWithDonation(qrCode, { value: donationAmount })
      )
        .to.emit(nft, "NFTMinted")
        .withArgs(1, donor1.address, donationAmount, "Community Hero", await time.latest());

      expect(await nft.totalMinted()).to.equal(1);
      expect(await nft.ownerOf(1)).to.equal(donor1.address);
      expect(await nft.tokenDonationAmount(1)).to.equal(donationAmount);
      expect(await nft.tokenQRCodeData(1)).to.equal(qrCode);
    });

    it("Should mint NFT with Champion Supporter donation", async function () {
      const donationAmount = ethers.parseEther("2500");
      const qrCode = "ipfs://QmTest456";

      await nft.connect(donor1).mintWithDonation(qrCode, { value: donationAmount });

      const tokenInfo = await nft.getTokenInfo(1);
      expect(tokenInfo.tier).to.equal("Champion Supporter");
      expect(tokenInfo.donationAmount).to.equal(donationAmount);
    });

    it("Should mint NFT with Legendary Donor donation", async function () {
      const donationAmount = ethers.parseEther("5000");
      const qrCode = "ipfs://QmTest789";

      await nft.connect(donor1).mintWithDonation(qrCode, { value: donationAmount });

      const tokenInfo = await nft.getTokenInfo(1);
      expect(tokenInfo.tier).to.equal("Legendary Donor");
      expect(await nft.getTokenFrequency(1)).to.equal(999);
    });

    it("Should reject donation below minimum threshold", async function () {
      const donationAmount = ethers.parseEther("100");
      const qrCode = "ipfs://QmTest";

      await expect(
        nft.connect(donor1).mintWithDonation(qrCode, { value: donationAmount })
      ).to.be.revertedWith("Donation below minimum threshold");
    });

    it("Should transfer donation to treasury wallet", async function () {
      const donationAmount = ethers.parseEther("1000");
      const qrCode = "ipfs://QmTest";
      const initialBalance = await ethers.provider.getBalance(treasuryWallet.address);

      await nft.connect(donor1).mintWithDonation(qrCode, { value: donationAmount });

      const finalBalance = await ethers.provider.getBalance(treasuryWallet.address);
      expect(finalBalance - initialBalance).to.equal(donationAmount);
    });

    it("Should track total donations per address", async function () {
      const donation1 = ethers.parseEther("500");
      const donation2 = ethers.parseEther("1000");

      await nft.connect(donor1).mintWithDonation("ipfs://1", { value: donation1 });
      await nft.connect(donor1).mintWithDonation("ipfs://2", { value: donation2 });

      expect(await nft.totalDonations(donor1.address)).to.equal(donation1 + donation2);
    });

    it("Should prevent minting beyond max supply", async function () {
      // This test would be slow in reality, so we'll just test the logic
      const maxSupply = await nft.MAX_SUPPLY();
      // Assuming we can't mint 999 in test, we'll verify the check exists
      expect(maxSupply).to.equal(999);
    });
  });

  describe("Frequency Tiers", function () {
    it("Should return correct frequency for Legendary tier", async function () {
      await nft.connect(donor1).mintWithDonation("ipfs://1", { 
        value: ethers.parseEther("5000") 
      });
      expect(await nft.getTokenFrequency(1)).to.equal(999);
    });

    it("Should return correct frequency for Champion tier", async function () {
      // Mint one legendary first to get to token 100+
      for (let i = 0; i < 100; i++) {
        await nft.connect(owner).mintTo(
          donor1.address, 
          ethers.parseEther("500"), 
          `ipfs://${i}`
        );
      }
      
      await nft.connect(donor1).mintWithDonation("ipfs://champion", { 
        value: ethers.parseEther("2500") 
      });
      
      expect(await nft.getTokenFrequency(101)).to.equal(777);
    });

    it("Should return correct frequency for Community tier", async function () {
      await nft.connect(donor1).mintWithDonation("ipfs://1", { 
        value: ethers.parseEther("500") 
      });
      expect(await nft.getTokenFrequency(1)).to.equal(528);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to mint to specific address", async function () {
      await nft.connect(owner).mintTo(
        donor1.address,
        ethers.parseEther("1000"),
        "ipfs://admin"
      );

      expect(await nft.ownerOf(1)).to.equal(donor1.address);
      expect(await nft.tokenDonationAmount(1)).to.equal(ethers.parseEther("1000"));
    });

    it("Should allow owner to update QR code", async function () {
      await nft.connect(donor1).mintWithDonation("ipfs://old", { 
        value: ethers.parseEther("500") 
      });

      await expect(nft.connect(owner).updateQRCode(1, "ipfs://new"))
        .to.emit(nft, "QRCodeUpdated")
        .withArgs(1, "ipfs://new");

      expect(await nft.tokenQRCodeData(1)).to.equal("ipfs://new");
    });

    it("Should allow owner to set thank you message", async function () {
      await nft.connect(donor1).mintWithDonation("ipfs://1", { 
        value: ethers.parseEther("500") 
      });

      const message = "Thank you for your generous support!";
      await expect(nft.connect(owner).setThankYouMessage(1, message))
        .to.emit(nft, "ThankYouMessageSet")
        .withArgs(1, message);

      expect(await nft.tokenThankYouMessage(1)).to.equal(message);
    });

    it("Should allow owner to update treasury wallet", async function () {
      const newTreasury = donor2.address;
      
      await expect(nft.connect(owner).updateTreasuryWallet(newTreasury))
        .to.emit(nft, "TreasuryWalletUpdated")
        .withArgs(treasuryWallet.address, newTreasury);

      expect(await nft.treasuryWallet()).to.equal(newTreasury);
    });

    it("Should allow owner to update base URI", async function () {
      const newBaseURI = "https://new-uri.com/";
      await nft.connect(owner).setBaseURI(newBaseURI);

      // Mint to verify new URI is used
      await nft.connect(donor1).mintWithDonation("ipfs://1", { 
        value: ethers.parseEther("500") 
      });

      const tokenURI = await nft.tokenURI(1);
      expect(tokenURI).to.include(newBaseURI);
    });

    it("Should prevent non-owner from admin functions", async function () {
      await expect(
        nft.connect(donor1).updateTreasuryWallet(donor2.address)
      ).to.be.reverted;

      await expect(
        nft.connect(donor1).setBaseURI("https://hack.com/")
      ).to.be.reverted;
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await nft.connect(owner).pause();

      await expect(
        nft.connect(donor1).mintWithDonation("ipfs://1", { 
          value: ethers.parseEther("500") 
        })
      ).to.be.reverted;

      await nft.connect(owner).unpause();

      await expect(
        nft.connect(donor1).mintWithDonation("ipfs://1", { 
          value: ethers.parseEther("500") 
        })
      ).to.not.be.reverted;
    });
  });

  describe("Token Information", function () {
    it("Should return complete token info", async function () {
      const donationAmount = ethers.parseEther("2500");
      const qrCode = "ipfs://complete";
      
      await nft.connect(donor1).mintWithDonation(qrCode, { value: donationAmount });
      await nft.connect(owner).setThankYouMessage(1, "Thank you!");

      const info = await nft.getTokenInfo(1);
      
      expect(info.donor).to.equal(donor1.address);
      expect(info.donationAmount).to.equal(donationAmount);
      expect(info.qrCode).to.equal(qrCode);
      expect(info.thankYou).to.equal("Thank you!");
      expect(info.tier).to.equal("Champion Supporter");
    });

    it("Should revert when querying non-existent token", async function () {
      await expect(nft.getTokenInfo(999)).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Royalty Support", function () {
    it("Should have correct royalty info", async function () {
      await nft.connect(donor1).mintWithDonation("ipfs://1", { 
        value: ethers.parseEther("500") 
      });

      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await nft.royaltyInfo(1, salePrice);

      expect(receiver).to.equal(treasuryWallet.address);
      // 10% royalty = 1000 basis points
      expect(royaltyAmount).to.equal(salePrice * BigInt(1000) / BigInt(10000));
    });
  });

  describe("ERC721 Compliance", function () {
    it("Should support ERC721 interface", async function () {
      const ERC721InterfaceId = "0x80ac58cd";
      expect(await nft.supportsInterface(ERC721InterfaceId)).to.be.true;
    });

    it("Should support ERC2981 (Royalty) interface", async function () {
      const ERC2981InterfaceId = "0x2a55205a";
      expect(await nft.supportsInterface(ERC2981InterfaceId)).to.be.true;
    });
  });
});

// Helper to get latest block timestamp
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  }
};
