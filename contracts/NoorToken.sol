// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NoorToken ($NOOR)
 * @dev Sacred Light Token with liquidity triad compatibility across Ethereum zkEVM and Scroll mainnet
 * @author Chais The Great ∞
 * 
 * This contract implements the $NOOR token with:
 * - 528Hz DNA healing frequency resonance
 * - 963Hz pineal gland activation frequency
 * - Automatic z(a.kat) distribution (7.77%)
 * - Liquidity triad compatibility (Ethereum zkEVM + Scroll mainnet + Polygon)
 * - Noor Ring of Light node integration
 * - Omni-Loop RADIANCE Protocol support
 * 
 * Frequency: 528Hz + 963Hz + 144000Hz NŪR Pulse
 * Status: OMNISOVEREIGN
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NoorToken is ERC20, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    
    // ============ SACRED FREQUENCY CONSTANTS ============
    
    /// @dev Healing frequency - DNA repair and transformation
    uint256 public constant HEALING_FREQUENCY = 528; // Hz
    
    /// @dev Pineal activation frequency - spiritual awakening
    uint256 public constant PINEAL_FREQUENCY = 963; // Hz
    
    /// @dev NŪR Pulse - Divine light frequency
    uint256 public constant NOOR_PULSE = 144000; // Hz
    
    /// @dev Zakat percentage (7.77%)
    uint256 public constant ZAKAT_PERCENTAGE = 777; // Basis points (7.77%)
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @dev Maximum supply - aligned with divine numbers
    uint256 public constant MAX_SUPPLY = 144000000 * 10**18; // 144M tokens
    
    // ============ LIQUIDITY TRIAD STATE ============
    
    /// @dev Supported chains for liquidity triad
    enum Chain { ETHEREUM_ZKEVM, SCROLL_MAINNET, POLYGON }
    
    /// @dev Liquidity pool tracking per chain
    mapping(Chain => address) public liquidityPools;
    mapping(Chain => bool) public chainActive;
    
    // ============ FREQUENCY MECHANISM STATE ============
    
    /**
     * @dev Frequency signature for each holder.
     * NOTE: This mapping is intended for off-chain tracking and analytics only.
     * It is not used by any on-chain contract logic, but is exposed via a public getter
     * for external systems (e.g., indexers, dApps) to read and correlate with events.
     */
    mapping(address => uint256) public frequencySignature;
    
    /**
     * @dev Last frequency alignment timestamp.
     * NOTE: This mapping is intended for off-chain tracking and analytics only.
     * It is not used by any on-chain contract logic, but is exposed via a public getter
     * for external systems (e.g., indexers, dApps) to read and correlate with events.
     */
    mapping(address => uint256) public lastFrequencyAlignment;
    
    // ============ ZAKAT DISTRIBUTION STATE ============
    
    /// @dev Total zakat collected
    uint256 public totalZakatCollected;
    
    /// @dev Zakat recipient addresses
    address[] public zakatRecipients;
    mapping(address => bool) public isZakatRecipient;
    mapping(address => uint256) public zakatDistributed;
    
    /// @dev Automatic zakat distribution enabled
    bool public autoZakatEnabled = true;
    
    // ============ NOOR RING OF LIGHT STATE ============
    
    /// @dev Node operator addresses
    mapping(address => bool) public isNodeOperator;
    address[] public nodeOperators;
    
    /// @dev Node rewards pool
    uint256 public nodeRewardsPool;
    
    // ============ EVENTS ============
    
    event FrequencyAligned(address indexed account, uint256 frequency, uint256 timestamp);
    event ZakatDistributed(address indexed recipient, uint256 amount, uint256 timestamp);
    event LiquidityPoolSet(Chain indexed chain, address poolAddress);
    event NodeOperatorAdded(address indexed operator);
    event NodeOperatorRemoved(address indexed operator);
    event ResonanceBonusApplied(address indexed account, uint256 bonus);
    event RadianceProtocolActivated(address indexed initiator, uint256 timestamp);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address initialOwner
    ) ERC20("Noor Token", "NOOR") Ownable(initialOwner) {
        // Mint initial supply to owner
        _mint(initialOwner, MAX_SUPPLY);
        
        // Set initial frequency signature for owner
        frequencySignature[initialOwner] = NOOR_PULSE;
        lastFrequencyAlignment[initialOwner] = block.timestamp;
        
        emit FrequencyAligned(initialOwner, NOOR_PULSE, block.timestamp);
    }
    
    // ============ FREQUENCY MECHANISM FUNCTIONS ============
    
    /**
     * @dev Align address to healing frequency (528Hz)
     */
    function alignHealingFrequency() external {
        frequencySignature[msg.sender] = HEALING_FREQUENCY;
        lastFrequencyAlignment[msg.sender] = block.timestamp;
        
        // Apply resonance bonus (5% for 528Hz alignment)
        resonanceBonus[msg.sender] = 500; // 5%
        
        emit FrequencyAligned(msg.sender, HEALING_FREQUENCY, block.timestamp);
        emit ResonanceBonusApplied(msg.sender, 500);
    }
    
    /**
     * @dev Align address to pineal activation frequency (963Hz)
     */
    function alignPinealFrequency() external {
        frequencySignature[msg.sender] = PINEAL_FREQUENCY;
        lastFrequencyAlignment[msg.sender] = block.timestamp;
        
        // Apply higher resonance bonus (9.63% for 963Hz alignment)
        resonanceBonus[msg.sender] = 963; // 9.63%
        
        emit FrequencyAligned(msg.sender, PINEAL_FREQUENCY, block.timestamp);
        emit ResonanceBonusApplied(msg.sender, 963);
    }
    
    /**
     * @dev Align address to full NŪR Pulse (144,000Hz)
     * @notice Only available to node operators
     */
    function alignNoorPulse() external {
        require(isNodeOperator[msg.sender], "Not a node operator");
        
        frequencySignature[msg.sender] = NOOR_PULSE;
        lastFrequencyAlignment[msg.sender] = block.timestamp;
        
        // Apply maximum resonance bonus (14.4% for NŪR Pulse)
        resonanceBonus[msg.sender] = 1440; // 14.4%
        
        emit FrequencyAligned(msg.sender, NOOR_PULSE, block.timestamp);
        emit ResonanceBonusApplied(msg.sender, 1440);
    }
    
    // ============ ZAKAT DISTRIBUTION FUNCTIONS ============
    
    /**
     * @dev Override transfer to apply automatic zakat distribution
     */
    function _update(address from, address to, uint256 amount) internal override whenNotPaused {
        if (from != address(0) && to != address(0) && autoZakatEnabled && !isZakatRecipient[to]) {
            // Calculate zakat amount (7.77%)
            uint256 zakatAmount = (amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
            uint256 transferAmount = amount - zakatAmount;
            
            // Distribute zakat
            if (zakatAmount > 0) {
                _distributeZakat(from, zakatAmount);
            }
            
            // Execute transfer
            super._update(from, to, transferAmount);
        } else {
            super._update(from, to, amount);
        }
    }
    
    /**
     * @dev Internal function to distribute zakat
     */
    function _distributeZakat(address from, uint256 amount) internal {
        require(zakatRecipients.length > 0, "No zakat recipients configured");
        
        totalZakatCollected += amount;
        uint256 amountPerRecipient = amount / zakatRecipients.length;
        
        for (uint256 i = 0; i < zakatRecipients.length; i++) {
            address recipient = zakatRecipients[i];
            uint256 toSend = (i == zakatRecipients.length - 1)
                ? amount - (amountPerRecipient * (zakatRecipients.length - 1))
                : amountPerRecipient;
            super._update(from, recipient, toSend);
            zakatDistributed[recipient] += toSend;
            
            emit ZakatDistributed(recipient, toSend, block.timestamp);
        }
    }
    
    /**
     * @dev Add zakat recipient
     */
    function addZakatRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(!isZakatRecipient[recipient], "Already a recipient");
        
        zakatRecipients.push(recipient);
        isZakatRecipient[recipient] = true;
    }
    
    /**
     * @dev Remove zakat recipient
     */
    function removeZakatRecipient(address recipient) external onlyOwner {
        require(isZakatRecipient[recipient], "Not a recipient");
        
        isZakatRecipient[recipient] = false;
        
        // Remove from array
        for (uint256 i = 0; i < zakatRecipients.length; i++) {
            if (zakatRecipients[i] == recipient) {
                zakatRecipients[i] = zakatRecipients[zakatRecipients.length - 1];
                zakatRecipients.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Toggle automatic zakat distribution
     */
    function setAutoZakat(bool enabled) external onlyOwner {
        autoZakatEnabled = enabled;
    }
    
    // ============ LIQUIDITY TRIAD FUNCTIONS ============
    
    /**
     * @dev Set liquidity pool for a specific chain
     */
    function setLiquidityPool(Chain chain, address poolAddress) external onlyOwner {
        require(poolAddress != address(0), "Invalid pool address");
        
        liquidityPools[chain] = poolAddress;
        chainActive[chain] = true;
        
        emit LiquidityPoolSet(chain, poolAddress);
    }
    
    /**
     * @dev Check if liquidity triad is complete
     */
    function isLiquidityTriadComplete() external view returns (bool) {
        return chainActive[Chain.ETHEREUM_ZKEVM] && 
               chainActive[Chain.SCROLL_MAINNET] && 
               chainActive[Chain.POLYGON];
    }
    
    // ============ NOOR RING OF LIGHT FUNCTIONS ============
    
    /**
     * @dev Add node operator
     */
    function addNodeOperator(address operator) external onlyOwner {
        require(operator != address(0), "Invalid operator");
        require(!isNodeOperator[operator], "Already a node operator");
        
        isNodeOperator[operator] = true;
        nodeOperators.push(operator);
        
        emit NodeOperatorAdded(operator);
    }
    
    /**
     * @dev Remove node operator
     */
    function removeNodeOperator(address operator) external onlyOwner {
        require(isNodeOperator[operator], "Not a node operator");
        
        isNodeOperator[operator] = false;
        
        // Remove from array
        for (uint256 i = 0; i < nodeOperators.length; i++) {
            if (nodeOperators[i] == operator) {
                nodeOperators[i] = nodeOperators[nodeOperators.length - 1];
                nodeOperators.pop();
                break;
            }
        }
        
        emit NodeOperatorRemoved(operator);
    }
    
    /**
     * @dev Distribute rewards to node operators
     */
    function distributeNodeRewards() external nonReentrant {
        require(nodeOperators.length > 0, "No node operators");
        require(nodeRewardsPool > 0, "No rewards available");
        
        uint256 rewardPerOperator = nodeRewardsPool / nodeOperators.length;
        uint256 remainder = nodeRewardsPool % nodeOperators.length;
        
        for (uint256 i = 0; i < nodeOperators.length; i++) {
            uint256 reward = rewardPerOperator;
            if (i < remainder) {
                reward += 1;
            }
            _update(address(this), nodeOperators[i], reward);
        }
        
        nodeRewardsPool = 0;
    }
    
    /**
     * @dev Fund node rewards pool
     */
    function fundNodeRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        _update(msg.sender, address(this), amount);
        nodeRewardsPool += amount;
    }
    
    // ============ OMNI-LOOP RADIANCE PROTOCOL ============
    
    /**
     * @dev Activate Omni-Loop RADIANCE Protocol
     * @notice Broadcasts cultural resonance across all interconnected loops
     */
    function activateRadianceProtocol() external onlyOwner {
        // Ensure liquidity triad is complete
        require(
            chainActive[Chain.ETHEREUM_ZKEVM] && 
            chainActive[Chain.SCROLL_MAINNET] && 
            chainActive[Chain.POLYGON],
            "Liquidity triad not complete"
        );
        
        // Ensure node operators are active
        require(nodeOperators.length > 0, "No node operators active");
        
        emit RadianceProtocolActivated(msg.sender, block.timestamp);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pause token transfers
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
    
    /**
     * @dev Get number of zakat recipients
     */
    function getZakatRecipientsCount() external view returns (uint256) {
        return zakatRecipients.length;
    }
    
    /**
     * @dev Get number of node operators
     */
    function getNodeOperatorsCount() external view returns (uint256) {
        return nodeOperators.length;
    }
}
