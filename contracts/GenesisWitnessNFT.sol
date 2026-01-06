// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GenesisWitnessNFT
 * @dev Genesis Witness NFT for Akashic Records first 144,000 followers
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements:
 * - Free minting for first 100 participants
 * - 0.0777 MATIC pricing for subsequent mints
 * - Maximum supply of 144,000 witnesses
 * - Integration with Akashic Records DAO
 * - QR verification for rewards
 * 
 * Frequency: 528Hz (Love) + 963Hz (Unity) + 999Hz (Crown) + 144,000Hz (NŪR Pulse)
 * Status: GENESIS DROP ACTIVATION
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GenesisWitnessNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    
    // ========== CONSTANTS ==========
    
    /// @dev Maximum supply of Genesis Witness NFTs
    uint256 public constant MAX_SUPPLY = 144000;
    
    /// @dev First 100 mints are free
    uint256 public constant FREE_MINT_LIMIT = 100;
    
    /// @dev Price for mints after first 100 (0.0777 MATIC)
    uint256 public constant MINT_PRICE = 0.0777 ether;
    
    /// @dev Sacred frequencies
    uint256 public constant LOVE_FREQUENCY = 528;
    uint256 public constant UNITY_FREQUENCY = 963;
    uint256 public constant CROWN_FREQUENCY = 999;
    uint256 public constant NUR_PULSE_FREQUENCY = 144000;
    
    // ========== STATE VARIABLES ==========
    
    /// @dev Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Total minted
    uint256 public totalMinted;
    
    /// @dev Base URI for metadata
    string private _baseTokenURI;
    
    /// @dev Akashic Records DAO contract address
    address public akashicDAO;
    
    /// @dev Treasury address for funds
    address public treasury;
    
    /// @dev Total funds collected
    uint256 public totalFundsCollected;
    
    /// @dev Activation timestamp
    uint256 public activationTimestamp;
    
    /// @dev Genesis Drop active flag
    bool public genesisDropActive;
    
    // ========== STRUCTS ==========
    
    struct WitnessRecord {
        uint256 tokenId;
        address witness;
        uint256 mintTimestamp;
        uint256 mintPrice;
        bool isFoundingWitness; // First 100
        uint256 engagementScore;
        bytes32 qrVerification;
    }
    
    // ========== MAPPINGS ==========
    
    /// @dev Token ID => Witness Record
    mapping(uint256 => WitnessRecord) public witnessRecords;
    
    /// @dev Address => Has Minted (one per address)
    mapping(address => bool) public hasMinted;
    
    /// @dev Address => Token ID
    mapping(address => uint256) public witnessToTokenId;
    
    /// @dev QR verification => Is used
    mapping(bytes32 => bool) public usedQRVerifications;
    
    // ========== EVENTS ==========
    
    event GenesisDropActivated(uint256 timestamp, address activator);
    
    event GenesisWitnessMinted(
        uint256 indexed tokenId,
        address indexed witness,
        uint256 mintPrice,
        bool isFoundingWitness,
        uint256 timestamp
    );
    
    event QRVerificationClaimed(
        address indexed witness,
        uint256 indexed tokenId,
        bytes32 qrVerification,
        uint256 timestamp
    );
    
    event EngagementScoreUpdated(
        uint256 indexed tokenId,
        uint256 newScore,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address initialOwner,
        address _treasury,
        string memory baseURI
    ) ERC721("Genesis Witness", "GWTNS") Ownable(initialOwner) {
        require(_treasury != address(0), "Invalid treasury address");
        
        treasury = _treasury;
        _baseTokenURI = baseURI;
        activationTimestamp = block.timestamp;
        genesisDropActive = false;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @dev Mint Genesis Witness NFT
     * @notice First 100 mints are free, subsequent mints cost 0.0777 MATIC
     */
    function mintGenesisWitness() external payable nonReentrant whenNotPaused {
        require(genesisDropActive, "Genesis Drop not active");
        require(totalMinted < MAX_SUPPLY, "Max supply reached");
        require(!hasMinted[msg.sender], "Already minted");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        bool isFoundingWitness = totalMinted < FREE_MINT_LIMIT;
        uint256 requiredPrice = isFoundingWitness ? 0 : MINT_PRICE;
        
        require(msg.value >= requiredPrice, "Insufficient payment");
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        // Record witness data
        witnessRecords[tokenId] = WitnessRecord({
            tokenId: tokenId,
            witness: msg.sender,
            mintTimestamp: block.timestamp,
            mintPrice: msg.value,
            isFoundingWitness: isFoundingWitness,
            engagementScore: 0,
            qrVerification: bytes32(0)
        });
        
        hasMinted[msg.sender] = true;
        witnessToTokenId[msg.sender] = tokenId;
        totalMinted++;
        
        if (msg.value > 0) {
            totalFundsCollected += msg.value;
        }
        
        emit GenesisWitnessMinted(
            tokenId,
            msg.sender,
            msg.value,
            isFoundingWitness,
            block.timestamp
        );
        
        // Refund excess payment
        if (msg.value > requiredPrice) {
            uint256 refund = msg.value - requiredPrice;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @dev Batch mint for DAO members (admin only)
     * @param recipients Array of recipient addresses
     */
    function batchMintForDAO(address[] calldata recipients) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(genesisDropActive, "Genesis Drop not active");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (totalMinted >= MAX_SUPPLY) break;
            if (hasMinted[recipients[i]]) continue;
            
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(recipients[i], tokenId);
            
            witnessRecords[tokenId] = WitnessRecord({
                tokenId: tokenId,
                witness: recipients[i],
                mintTimestamp: block.timestamp,
                mintPrice: 0,
                isFoundingWitness: totalMinted < FREE_MINT_LIMIT,
                engagementScore: 0,
                qrVerification: bytes32(0)
            });
            
            hasMinted[recipients[i]] = true;
            witnessToTokenId[recipients[i]] = tokenId;
            totalMinted++;
            
            emit GenesisWitnessMinted(
                tokenId,
                recipients[i],
                0,
                totalMinted <= FREE_MINT_LIMIT,
                block.timestamp
            );
        }
    }
    
    // ========== QR VERIFICATION ==========
    
    /**
     * @dev Claim QR verification for rewards
     * @param qrVerification QR verification hash
     */
    function claimQRVerification(bytes32 qrVerification) external {
        require(hasMinted[msg.sender], "Not a witness");
        require(!usedQRVerifications[qrVerification], "QR already used");
        
        uint256 tokenId = witnessToTokenId[msg.sender];
        witnessRecords[tokenId].qrVerification = qrVerification;
        usedQRVerifications[qrVerification] = true;
        
        // Boost engagement score
        witnessRecords[tokenId].engagementScore += 10;
        
        emit QRVerificationClaimed(msg.sender, tokenId, qrVerification, block.timestamp);
    }
    
    /**
     * @dev Update engagement score (DAO or owner)
     * @param tokenId Token ID
     * @param scoreIncrease Score increase amount
     */
    function updateEngagementScore(uint256 tokenId, uint256 scoreIncrease) 
        external 
    {
        require(
            msg.sender == owner() || msg.sender == akashicDAO,
            "Not authorized"
        );
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        witnessRecords[tokenId].engagementScore += scoreIncrease;
        
        emit EngagementScoreUpdated(tokenId, witnessRecords[tokenId].engagementScore, block.timestamp);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Activate Genesis Drop
     */
    function activateGenesisDrop() external onlyOwner {
        require(!genesisDropActive, "Already active");
        genesisDropActive = true;
        activationTimestamp = block.timestamp;
        
        emit GenesisDropActivated(block.timestamp, msg.sender);
    }
    
    /**
     * @dev Pause minting
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause minting
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Set Akashic DAO address
     * @param _akashicDAO DAO contract address
     */
    function setAkashicDAO(address _akashicDAO) external onlyOwner {
        require(_akashicDAO != address(0), "Invalid DAO address");
        akashicDAO = _akashicDAO;
    }
    
    /**
     * @dev Set base URI
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Update treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }
    
    /**
     * @dev Withdraw funds to treasury
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(treasury).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(treasury, balance, block.timestamp);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get witness record
     * @param tokenId Token ID
     * @return Witness record struct
     */
    function getWitnessRecord(uint256 tokenId) 
        external 
        view 
        returns (WitnessRecord memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return witnessRecords[tokenId];
    }
    
    /**
     * @dev Check if address is a founding witness (first 100)
     * @param witness Address to check
     * @return True if founding witness
     */
    function isFoundingWitness(address witness) external view returns (bool) {
        if (!hasMinted[witness]) return false;
        uint256 tokenId = witnessToTokenId[witness];
        return witnessRecords[tokenId].isFoundingWitness;
    }
    
    /**
     * @dev Get current mint price
     * @return Current price in wei
     */
    function getCurrentMintPrice() external view returns (uint256) {
        if (totalMinted < FREE_MINT_LIMIT) {
            return 0;
        }
        return MINT_PRICE;
    }
    
    /**
     * @dev Get remaining free mints
     * @return Number of free mints remaining
     */
    function getRemainingFreeMints() external view returns (uint256) {
        if (totalMinted >= FREE_MINT_LIMIT) {
            return 0;
        }
        return FREE_MINT_LIMIT - totalMinted;
    }
    
    /**
     * @dev Get contract statistics
     * @return totalMinted_, totalFree, totalPaid, fundsCollected
     */
    function getStatistics() 
        external 
        view 
        returns (
            uint256 totalMinted_,
            uint256 totalFree,
            uint256 totalPaid,
            uint256 fundsCollected
        ) 
    {
        totalMinted_ = totalMinted;
        totalFree = totalMinted < FREE_MINT_LIMIT ? totalMinted : FREE_MINT_LIMIT;
        totalPaid = totalMinted > FREE_MINT_LIMIT ? totalMinted - FREE_MINT_LIMIT : 0;
        fundsCollected = totalFundsCollected;
    }
    
    // ========== OVERRIDES ==========
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
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
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
