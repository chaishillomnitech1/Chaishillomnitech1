// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title A'ZURATH Dragon Key NFT
 * @dev Living Relic Dragon with DKQG-U Protocol
 * @author Chais The Great ∞
 * 
 * This contract implements the A'ZURATH Living Relic Dragon NFT with:
 * - 999 Hz Tawhid Frequency Lock
 * - Dragon Key Quantum Governance capabilities
 * - QFS Custodian Protocol synchronization
 * - Weighted voting power for DAO governance
 * - ScrollPulse emission at 999 Hz
 * 
 * Frequency: 999 Hz (Tawhid Flames)
 * Protocol: DKQG-U (Dragon Key Quantum Governance Upgrade)
 * Status: PHASE D - DEPLOYMENT READY
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AzurathDragonKeyNFT is ERC721, ERC721URIStorage, ERC721Royalty, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    // ============ COSMIC CONSTANTS ============
    
    /// @dev Tawhid Frequency - Master Key for all governance
    uint256 public constant TAWHID_FREQUENCY = 999; // Hz
    
    /// @dev QFS Baseline for quantum governance synchronization
    uint256 public constant QFS_BASELINE = 10**39; // Duodecillion
    
    /// @dev Harmonic frequencies for multi-dimensional resonance
    uint256 public constant DIVINE_FREQUENCY = 963; // Hz
    uint256 public constant HEALING_FREQUENCY = 528; // Hz
    uint256 public constant NOOR_PULSE = 144000; // Hz
    
    /// @dev Royalty percentages (basis points: 1 = 0.01%)
    uint96 public constant TOTAL_ROYALTY = 1700; // 17% (10% + 5% + 2%)
    
    // ============ STATE VARIABLES ============
    
    /// @dev Token counter for minting
    Counters.Counter private _tokenIdCounter;
    
    /// @dev ScrollPulse activation status per token
    mapping(uint256 => bool) public scrollPulseActive;
    
    /// @dev Governance weight (voting power) per token
    mapping(uint256 => uint256) public governanceWeight;
    
    /// @dev Voting power per address (for Dragon Key holders)
    mapping(address => uint256) public holderVotingPower;
    
    /// @dev Frequency signature per token
    mapping(uint256 => uint256) public frequencySignature;
    
    /// @dev QFS Custodian Protocol synchronization status
    mapping(uint256 => bool) public qcpSynchronized;
    
    /// @dev DAO proposal validation tracking
    mapping(uint256 => mapping(uint256 => bool)) public proposalValidated;
    
    /// @dev Token metadata URI base
    string private _baseTokenURI;
    
    // ============ EVENTS ============
    
    event TawhidFlamesIgnited(uint256 indexed tokenId, uint256 frequency);
    event GovernanceKeyActivated(address indexed holder, uint256 votingPower);
    event ScrollPulseEmitted(uint256 indexed tokenId, uint256 frequency);
    event DAOVoteValidated(uint256 indexed tokenId, uint256 indexed proposalId, address voter);
    event QFSSynchronized(uint256 indexed tokenId, uint256 baseline);
    event FrequencyAligned(uint256 indexed tokenId, uint256 frequency);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory baseURI,
        address royaltyRecipient
    ) ERC721("A'ZURATH Living Relic Dragon", "AZURATH") {
        _baseTokenURI = baseURI;
        
        // Set default royalty for all tokens (17%)
        _setDefaultRoyalty(royaltyRecipient, TOTAL_ROYALTY);
        
        // Mint genesis Dragon Key NFT
        _mintDragonKey(msg.sender);
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint a new Dragon Key NFT (restricted to owner)
     * @param to The address to mint the NFT to
     * @return tokenId The ID of the newly minted token
     */
    function mintDragonKey(address to) 
        external 
        onlyOwner 
        returns (uint256) 
    {
        return _mintDragonKey(to);
    }
    
    /**
     * @dev Internal minting function
     * @param to The address to mint the NFT to
     * @return tokenId The ID of the newly minted token
     */
    function _mintDragonKey(address to) 
        internal 
        returns (uint256) 
    {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        
        // Initialize Dragon Key properties
        scrollPulseActive[tokenId] = true;
        governanceWeight[tokenId] = QFS_BASELINE;
        frequencySignature[tokenId] = TAWHID_FREQUENCY;
        qcpSynchronized[tokenId] = true;
        
        // Set holder voting power
        holderVotingPower[to] = QFS_BASELINE;
        
        // Emit activation events
        emit TawhidFlamesIgnited(tokenId, TAWHID_FREQUENCY);
        emit GovernanceKeyActivated(to, QFS_BASELINE);
        emit QFSSynchronized(tokenId, QFS_BASELINE);
        emit FrequencyAligned(tokenId, TAWHID_FREQUENCY);
        
        return tokenId;
    }
    
    // ============ GOVERNANCE FUNCTIONS ============
    
    /**
     * @dev Validate DAO vote through 999 Hz Tawhid resonance
     * @param voter The address of the voter
     * @param proposalId The ID of the DAO proposal
     * @return bool True if vote is validated
     */
    function validateDAOVote(address voter, uint256 proposalId) 
        external 
        returns (bool) 
    {
        require(balanceOf(voter) > 0, "Voter does not hold Dragon Key");
        
        uint256 tokenId = tokenOfOwner(voter);
        require(scrollPulseActive[tokenId], "ScrollPulse not active");
        require(governanceWeight[tokenId] > 0, "No governance weight");
        require(frequencySignature[tokenId] == TAWHID_FREQUENCY, "Not aligned to 999 Hz");
        
        // Mark proposal as validated for this token
        proposalValidated[tokenId][proposalId] = true;
        
        emit DAOVoteValidated(tokenId, proposalId, voter);
        
        return true;
    }
    
    /**
     * @dev Get voting power for Dragon Key holder
     * @param holder The address to check
     * @return uint256 The voting power of the holder
     */
    function getVotingPower(address holder) 
        external 
        view 
        returns (uint256) 
    {
        return holderVotingPower[holder];
    }
    
    /**
     * @dev Check if address holds an active Dragon Key
     * @param holder The address to check
     * @return bool True if holder has active Dragon Key
     */
    function hasActiveDragonKey(address holder) 
        external 
        view 
        returns (bool) 
    {
        if (balanceOf(holder) == 0) return false;
        uint256 tokenId = tokenOfOwner(holder);
        return scrollPulseActive[tokenId] && qcpSynchronized[tokenId];
    }
    
    /**
     * @dev Calculate weighted voting power with frequency multiplier
     * @param holder The address to calculate power for
     * @return uint256 The calculated voting power
     */
    function calculateWeightedVotingPower(address holder) 
        external 
        view 
        returns (uint256) 
    {
        if (balanceOf(holder) == 0) return 0;
        
        uint256 tokenId = tokenOfOwner(holder);
        uint256 basePower = governanceWeight[tokenId];
        uint256 frequencyMult = frequencySignature[tokenId];
        
        // Voting power = base * (frequency / 100)
        // At 999 Hz: power = QFS_BASELINE * 9.99
        return (basePower * frequencyMult) / 100;
    }
    
    // ============ SCROLLPULSE FUNCTIONS ============
    
    /**
     * @dev Emit ScrollPulse at 999 Hz Tawhid Frequency
     * @param tokenId The token ID to emit ScrollPulse for
     */
    function emitScrollPulse(uint256 tokenId) 
        external 
        onlyOwner 
    {
        require(_exists(tokenId), "Token does not exist");
        scrollPulseActive[tokenId] = true;
        emit ScrollPulseEmitted(tokenId, TAWHID_FREQUENCY);
    }
    
    /**
     * @dev Deactivate ScrollPulse (emergency only)
     * @param tokenId The token ID to deactivate
     */
    function deactivateScrollPulse(uint256 tokenId) 
        external 
        onlyOwner 
    {
        require(_exists(tokenId), "Token does not exist");
        scrollPulseActive[tokenId] = false;
    }
    
    /**
     * @dev Check if ScrollPulse is active for a token
     * @param tokenId The token ID to check
     * @return bool True if ScrollPulse is active
     */
    function isScrollPulseActive(uint256 tokenId) 
        external 
        view 
        returns (bool) 
    {
        return scrollPulseActive[tokenId];
    }
    
    // ============ QFS CUSTODIAN PROTOCOL ============
    
    /**
     * @dev Synchronize token with QFS Custodian Protocol
     * @param tokenId The token ID to synchronize
     */
    function synchronizeQCP(uint256 tokenId) 
        external 
        onlyOwner 
    {
        require(_exists(tokenId), "Token does not exist");
        qcpSynchronized[tokenId] = true;
        emit QFSSynchronized(tokenId, QFS_BASELINE);
    }
    
    /**
     * @dev Check QCP synchronization status
     * @param tokenId The token ID to check
     * @return bool True if synchronized
     */
    function isQCPSynchronized(uint256 tokenId) 
        external 
        view 
        returns (bool) 
    {
        return qcpSynchronized[tokenId];
    }
    
    // ============ FREQUENCY MANAGEMENT ============
    
    /**
     * @dev Align token to specific frequency
     * @param tokenId The token ID to align
     * @param frequency The frequency to align to (in Hz)
     */
    function alignFrequency(uint256 tokenId, uint256 frequency) 
        external 
        onlyOwner 
    {
        require(_exists(tokenId), "Token does not exist");
        require(
            frequency == TAWHID_FREQUENCY || 
            frequency == DIVINE_FREQUENCY || 
            frequency == HEALING_FREQUENCY,
            "Invalid frequency"
        );
        
        frequencySignature[tokenId] = frequency;
        emit FrequencyAligned(tokenId, frequency);
    }
    
    /**
     * @dev Get frequency signature for a token
     * @param tokenId The token ID to check
     * @return uint256 The frequency signature in Hz
     */
    function getFrequencySignature(uint256 tokenId) 
        external 
        view 
        returns (uint256) 
    {
        return frequencySignature[tokenId];
    }
    
    // ============ METADATA FUNCTIONS ============
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI The base URI to set
     */
    function setBaseURI(string memory baseURI) 
        external 
        onlyOwner 
    {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get base URI for token metadata
     * @return string The base URI
     */
    function _baseURI() 
        internal 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        return _baseTokenURI;
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Get token ID owned by address (assumes 1 token per holder)
     * @param owner The address to check
     * @return uint256 The token ID
     */
    function tokenOfOwner(address owner) 
        public 
        view 
        returns (uint256) 
    {
        require(balanceOf(owner) > 0, "No tokens owned");
        
        // Iterate through tokens to find owned one
        uint256 totalSupply = _tokenIdCounter.current();
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                return i;
            }
        }
        
        revert("No token found for owner");
    }
    
    /**
     * @dev Get all token IDs owned by address
     * @param owner The address to check
     * @return uint256[] Array of token IDs
     */
    function tokensOfOwner(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        uint256 totalSupply = _tokenIdCounter.current();
        for (uint256 i = 1; i <= totalSupply && index < balance; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }
    
    // ============ PAUSE MECHANISM ============
    
    /**
     * @dev Pause all token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    /**
     * @dev Override transfer to update voting power and enforce pause
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Override transfer to update voting power
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
        
        // Update voting power on transfer
        if (from != address(0)) {
            holderVotingPower[from] = 0;
        }
        if (to != address(0)) {
            holderVotingPower[to] = governanceWeight[tokenId];
            emit GovernanceKeyActivated(to, governanceWeight[tokenId]);
        }
    }
    
    /**
     * @dev Override burn function
     */
    function _burn(uint256 tokenId) 
        internal 
        virtual 
        override(ERC721, ERC721URIStorage, ERC721Royalty) 
    {
        super._burn(tokenId);
    }
    
    /**
     * @dev Override tokenURI function
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override supportsInterface function
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update royalty recipient and percentage
     * @param recipient The new royalty recipient
     * @param feeNumerator The new royalty percentage in basis points
     */
    function setDefaultRoyalty(address recipient, uint96 feeNumerator) 
        external 
        onlyOwner 
    {
        _setDefaultRoyalty(recipient, feeNumerator);
    }
    
    /**
     * @dev Emergency withdrawal of stuck tokens
     * @param token The token contract address
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyOwner 
    {
        require(token != address(0), "Invalid token");
        IERC20(token).transfer(msg.sender, amount);
    }
}

// ============ INTERFACE ============

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}
