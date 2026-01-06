// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title OperationBounceBackNFT
 * @notice NFT collection for Operation Bounce Back charitable initiative
 * @dev Features include embedded QR codes, donation tracking, and thank-you messages from Chef Andre Murphy
 * 
 * Collection Structure:
 * - Legendary Donors (1-99): 999 Hz frequency, $5,000+ donations
 * - Champion Supporters (100-299): 777 Hz frequency, $2,500+ donations  
 * - Community Heroes (300-999): 528 Hz frequency, $500+ donations
 */
contract OperationBounceBackNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Royalty,
    Ownable, 
    ReentrancyGuard,
    Pausable 
{
    using Strings for uint256;

    // Collection constants
    uint256 public constant MAX_SUPPLY = 999;
    uint256 public constant LEGENDARY_MAX = 99;
    uint256 public constant CHAMPION_MAX = 299;
    
    // Tier thresholds (in wei, assuming 1 wei = 1 USD for simplicity, adjust for actual implementation)
    uint256 public constant LEGENDARY_THRESHOLD = 5000 ether;
    uint256 public constant CHAMPION_THRESHOLD = 2500 ether;
    uint256 public constant COMMUNITY_THRESHOLD = 500 ether;

    // State variables
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    address public treasuryWallet;
    
    // Mapping from token ID to donation amount
    mapping(uint256 => uint256) public tokenDonationAmount;
    
    // Mapping from token ID to donor address
    mapping(uint256 => address) public tokenDonor;
    
    // Mapping from token ID to donation timestamp
    mapping(uint256 => uint256) public tokenDonationTimestamp;
    
    // Mapping from token ID to QR code data (URL or hash)
    mapping(uint256 => string) public tokenQRCodeData;
    
    // Mapping from token ID to thank you message from Chef Murphy
    mapping(uint256 => string) public tokenThankYouMessage;
    
    // Mapping to track total donations per address
    mapping(address => uint256) public totalDonations;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed donor,
        uint256 donationAmount,
        string tier,
        uint256 timestamp
    );
    
    event DonationRecorded(
        uint256 indexed tokenId,
        uint256 amount,
        uint256 timestamp
    );
    
    event QRCodeUpdated(
        uint256 indexed tokenId,
        string qrCodeData
    );
    
    event ThankYouMessageSet(
        uint256 indexed tokenId,
        string message
    );
    
    event TreasuryWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );

    /**
     * @dev Constructor initializes the NFT collection
     * @param initialOwner Address of the contract owner
     * @param _treasuryWallet Address where donations will be sent
     * @param baseURI Base URI for token metadata
     */
    constructor(
        address initialOwner,
        address _treasuryWallet,
        string memory baseURI
    ) ERC721("Operation Bounce Back", "OBB") Ownable(initialOwner) {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        treasuryWallet = _treasuryWallet;
        _baseTokenURI = baseURI;
        _nextTokenId = 1;
        
        // Set default royalty to 10% (1000 basis points)
        _setDefaultRoyalty(treasuryWallet, 1000);
    }

    /**
     * @notice Mint an NFT with a donation
     * @dev Automatically assigns tier based on donation amount
     * @param qrCodeData URL or hash linking to donation record
     * @return tokenId The ID of the minted NFT
     */
    function mintWithDonation(
        string memory qrCodeData
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= COMMUNITY_THRESHOLD, "Donation below minimum threshold");

        uint256 tokenId = _nextTokenId++;
        
        // Record donation data
        tokenDonationAmount[tokenId] = msg.value;
        tokenDonor[tokenId] = msg.sender;
        tokenDonationTimestamp[tokenId] = block.timestamp;
        tokenQRCodeData[tokenId] = qrCodeData;
        totalDonations[msg.sender] += msg.value;

        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        
        // Transfer donation to treasury
        (bool success, ) = treasuryWallet.call{value: msg.value}("");
        require(success, "Donation transfer failed");

        // Determine tier for event emission
        string memory tier = _determineTier(tokenId);
        
        emit NFTMinted(tokenId, msg.sender, msg.value, tier, block.timestamp);
        emit DonationRecorded(tokenId, msg.value, block.timestamp);
        emit QRCodeUpdated(tokenId, qrCodeData);

        return tokenId;
    }

    /**
     * @notice Mint NFT to specific address (owner only, for special cases)
     * @param to Address to mint to
     * @param donationAmount Amount of donation associated with this NFT
     * @param qrCodeData QR code data for the NFT
     * @return tokenId The ID of the minted NFT
     */
    function mintTo(
        address to,
        uint256 donationAmount,
        string memory qrCodeData
    ) external onlyOwner returns (uint256) {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(donationAmount >= COMMUNITY_THRESHOLD, "Donation below minimum threshold");

        uint256 tokenId = _nextTokenId++;
        
        // Record donation data
        tokenDonationAmount[tokenId] = donationAmount;
        tokenDonor[tokenId] = to;
        tokenDonationTimestamp[tokenId] = block.timestamp;
        tokenQRCodeData[tokenId] = qrCodeData;
        totalDonations[to] += donationAmount;

        // Mint the NFT
        _safeMint(to, tokenId);
        
        string memory tier = _determineTier(tokenId);
        emit NFTMinted(tokenId, to, donationAmount, tier, block.timestamp);
        emit DonationRecorded(tokenId, donationAmount, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Update QR code data for a token (owner only)
     * @param tokenId Token ID to update
     * @param qrCodeData New QR code data
     */
    function updateQRCode(uint256 tokenId, string memory qrCodeData) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        tokenQRCodeData[tokenId] = qrCodeData;
        emit QRCodeUpdated(tokenId, qrCodeData);
    }

    /**
     * @notice Set thank you message from Chef Murphy for a token (owner only)
     * @param tokenId Token ID to set message for
     * @param message Thank you message
     */
    function setThankYouMessage(uint256 tokenId, string memory message) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        tokenThankYouMessage[tokenId] = message;
        emit ThankYouMessageSet(tokenId, message);
    }

    /**
     * @notice Get complete token information
     * @param tokenId Token ID to query
     * @return donor Address of the original donor
     * @return donationAmount Amount donated
     * @return timestamp When donation was made
     * @return qrCode QR code data
     * @return thankYou Thank you message from Chef Murphy
     * @return tier Donation tier (Legendary, Champion, Community)
     */
    function getTokenInfo(uint256 tokenId) external view returns (
        address donor,
        uint256 donationAmount,
        uint256 timestamp,
        string memory qrCode,
        string memory thankYou,
        string memory tier
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        return (
            tokenDonor[tokenId],
            tokenDonationAmount[tokenId],
            tokenDonationTimestamp[tokenId],
            tokenQRCodeData[tokenId],
            tokenThankYouMessage[tokenId],
            _determineTier(tokenId)
        );
    }

    /**
     * @dev Determine tier based on token ID and donation amount
     * @param tokenId Token ID to check
     * @return tier String representing the tier
     */
    function _determineTier(uint256 tokenId) internal view returns (string memory) {
        uint256 amount = tokenDonationAmount[tokenId];
        
        if (amount >= LEGENDARY_THRESHOLD && tokenId <= LEGENDARY_MAX) {
            return "Legendary Donor";
        } else if (amount >= CHAMPION_THRESHOLD && tokenId <= CHAMPION_MAX) {
            return "Champion Supporter";
        } else {
            return "Community Hero";
        }
    }

    /**
     * @notice Get the frequency associated with a token's tier
     * @param tokenId Token ID to check
     * @return frequency The frequency in Hz (999, 777, or 528)
     */
    function getTokenFrequency(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 amount = tokenDonationAmount[tokenId];
        
        if (amount >= LEGENDARY_THRESHOLD && tokenId <= LEGENDARY_MAX) {
            return 999; // Crown Chakra
        } else if (amount >= CHAMPION_THRESHOLD && tokenId <= CHAMPION_MAX) {
            return 777; // Divine Abundance
        } else {
            return 528; // Love & Healing
        }
    }

    /**
     * @notice Update treasury wallet address (owner only)
     * @param newTreasuryWallet New treasury wallet address
     */
    function updateTreasuryWallet(address newTreasuryWallet) external onlyOwner {
        require(newTreasuryWallet != address(0), "Invalid treasury wallet");
        address oldWallet = treasuryWallet;
        treasuryWallet = newTreasuryWallet;
        
        // Update default royalty recipient
        _setDefaultRoyalty(newTreasuryWallet, 1000);
        
        emit TreasuryWalletUpdated(oldWallet, newTreasuryWallet);
    }

    /**
     * @notice Set base URI for token metadata (owner only)
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get total number of NFTs minted
     * @return Total minted count
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Base URI for computing tokenURI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Required overrides for multiple inheritance

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721)
    {
        super._increaseBalance(account, value);
    }
}
