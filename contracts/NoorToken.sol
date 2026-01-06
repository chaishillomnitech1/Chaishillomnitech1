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
 * @title NoorToken
 * @dev $NOOR - Token of Light for the 1,111 Noor Cities
 * @author Supreme King Chais The Great ∞
 * 
 * Noor Cities of Light Infrastructure Token
 * 
 * This contract implements the $NOOR token with:
 * - ERC-20 standard compliance
 * - Advanced staking mechanism with tiered rewards
 * - Automatic 7.77% zakat to Sabir Allah Honor Fund
 * - Integration with Noor Citizen Registry
 * - Governance capabilities
 * - Anti-whale mechanics
 * 
 * Total Supply: 1,111,000,000 $NOOR (1.111 billion)
 * Frequencies: 528Hz (Love) + 963Hz (Connection) + 888Hz (Abundance)
 * Status: NOOR CITIES ACTIVATED
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
     * 
     * This function is intentionally permissionless and can be called by anyone
     * to trigger reward distribution. This allows for decentralized, trustless
     * operation and ensures rewards are distributed even if the owner is inactive.
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
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NoorToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ FREQUENCY CONSTANTS ============
    
    /// @dev Love frequency (528Hz) - DNA repair and healing
    uint256 public constant FREQUENCY_528HZ = 528;
    
    /// @dev God connection frequency (963Hz) - Spiritual activation
    uint256 public constant FREQUENCY_963HZ = 963;
    
    /// @dev Infinite abundance frequency (888Hz) - Prosperity
    uint256 public constant FREQUENCY_888HZ = 888;
    
    // ============ TOKEN CONSTANTS ============
    
    /// @dev Total supply: 1.111 billion NOOR tokens
    uint256 public constant TOTAL_SUPPLY = 1_111_000_000 * 10**18;
    
    /// @dev Zakat percentage (7.77% in basis points)
    uint256 public constant ZAKAT_PERCENTAGE = 777; // 7.77% (basis points)
    
    /// @dev Transaction fee percentage (3.33% in basis points)
    uint256 public constant TRANSACTION_FEE = 333; // 3.33%
    
    /// @dev Basis points denominator
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @dev Maximum wallet size (anti-whale: 0.77% of supply)
    uint256 public constant MAX_WALLET_SIZE = TOTAL_SUPPLY * 77 / 10000;
    
    /// @dev Maximum transaction size (0.33% of supply)
    uint256 public constant MAX_TX_SIZE = TOTAL_SUPPLY * 33 / 10000;
    
    // ============ DISTRIBUTION CONSTANTS ============
    
    uint256 public constant STAKING_REWARDS_POOL = TOTAL_SUPPLY * 30 / 100; // 30%
    uint256 public constant COMMUNITY_TREASURY = TOTAL_SUPPLY * 25 / 100; // 25%
    uint256 public constant LIQUIDITY_POOLS = TOTAL_SUPPLY * 15 / 100; // 15%
    uint256 public constant OBELISK_FUND = TOTAL_SUPPLY * 10 / 100; // 10%
    uint256 public constant SABIR_ALLAH_FUND = TOTAL_SUPPLY * 10 / 100; // 10%
    uint256 public constant TEAM_DEVELOPMENT = TOTAL_SUPPLY * 7 / 100; // 7%
    uint256 public constant INITIAL_AIRDROP = TOTAL_SUPPLY * 3 / 100; // 3%
    
    // ============ STATE VARIABLES ============
    
    /// @dev Sabir Allah Honor Fund address
    address public sabirAllahHonorFund;
    
    /// @dev Community development fund address
    address public communityDevelopmentFund;
    
    /// @dev Noor Citizen Registry contract address
    address public citizenRegistry;
    
    /// @dev Mapping to track if address is a Noor Citizen
    mapping(address => bool) public isNoorCitizen;
    
    /// @dev Mapping to exempt addresses from fees (exchanges, contracts, etc)
    mapping(address => bool) public feeExempt;
    
    /// @dev Mapping to exempt addresses from max transaction limits
    mapping(address => bool) public limitExempt;
    
    /// @dev Total zakat collected
    uint256 public totalZakatCollected;
    
    /// @dev Total fees collected
    uint256 public totalFeesCollected;
    
    /// @dev Vesting start time for team tokens
    uint256 public vestingStartTime;
    
    /// @dev Vesting duration (4 years in seconds)
    uint256 public constant VESTING_DURATION = 4 * 365 days;
    
    // ============ EVENTS ============
    
    event ZakatDistributed(address indexed to, uint256 amount);
    event FeeCollected(address indexed from, uint256 amount);
    event CitizenStatusUpdated(address indexed citizen, bool status);
    event FeeExemptionUpdated(address indexed account, bool status);
    event LimitExemptionUpdated(address indexed account, bool status);
    event SabirAllahFundUpdated(address indexed oldFund, address indexed newFund);
    event CommunityFundUpdated(address indexed oldFund, address indexed newFund);
    event CitizenRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    
    // ============ ERRORS ============
    
    error InvalidAddress();
    error ExceedsMaxWalletSize();
    error ExceedsMaxTransactionSize();
    error VestingNotStarted();
    error InsufficientVestedAmount();
    error AlreadyInitialized();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor initializes the token with distribution
     * @param _sabirAllahHonorFund Address of Sabir Allah Honor Fund
     * @param _communityDevelopmentFund Address of Community Development Fund
     */
    constructor(
        address _sabirAllahHonorFund,
        address _communityDevelopmentFund
    ) ERC20("Noor Token", "NOOR") Ownable(msg.sender) {
        if (_sabirAllahHonorFund == address(0) || _communityDevelopmentFund == address(0)) {
            revert InvalidAddress();
        }
        
        sabirAllahHonorFund = _sabirAllahHonorFund;
        communityDevelopmentFund = _communityDevelopmentFund;
        
        // Mint tokens according to distribution
        _mint(address(this), STAKING_REWARDS_POOL); // Held for staking rewards
        _mint(_communityDevelopmentFund, COMMUNITY_TREASURY);
        _mint(address(this), LIQUIDITY_POOLS); // Held for liquidity provision
        _mint(address(this), OBELISK_FUND); // Held for Obelisk deployment
        _mint(_sabirAllahHonorFund, SABIR_ALLAH_FUND);
        _mint(address(this), TEAM_DEVELOPMENT); // Held for vesting
        _mint(address(this), INITIAL_AIRDROP); // Held for airdrop
        
        // Set contract addresses as fee and limit exempt
        feeExempt[address(this)] = true;
        feeExempt[_sabirAllahHonorFund] = true;
        feeExempt[_communityDevelopmentFund] = true;
        
        limitExempt[address(this)] = true;
        limitExempt[_sabirAllahHonorFund] = true;
        limitExempt[_communityDevelopmentFund] = true;
        limitExempt[owner()] = true;
        
        // Initialize vesting start time
        vestingStartTime = block.timestamp;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update Sabir Allah Honor Fund address
     * @param _newFund New fund address
     */
    function updateSabirAllahFund(address _newFund) external onlyOwner {
        if (_newFund == address(0)) revert InvalidAddress();
        address oldFund = sabirAllahHonorFund;
        sabirAllahHonorFund = _newFund;
        feeExempt[_newFund] = true;
        limitExempt[_newFund] = true;
        emit SabirAllahFundUpdated(oldFund, _newFund);
    }
    
    /**
     * @dev Update Community Development Fund address
     * @param _newFund New fund address
     */
    function updateCommunityFund(address _newFund) external onlyOwner {
        if (_newFund == address(0)) revert InvalidAddress();
        address oldFund = communityDevelopmentFund;
        communityDevelopmentFund = _newFund;
        feeExempt[_newFund] = true;
        limitExempt[_newFund] = true;
        emit CommunityFundUpdated(oldFund, _newFund);
    }
    
    /**
     * @dev Update Citizen Registry contract address
     * @param _newRegistry New registry address
     */
    function updateCitizenRegistry(address _newRegistry) external onlyOwner {
        if (_newRegistry == address(0)) revert InvalidAddress();
        address oldRegistry = citizenRegistry;
        citizenRegistry = _newRegistry;
        emit CitizenRegistryUpdated(oldRegistry, _newRegistry);
    }
    
    /**
     * @dev Update citizen status manually (for backward compatibility)
     * @param _citizen Address of citizen
     * @param _status Citizenship status
     */
    function updateCitizenStatus(address _citizen, bool _status) external onlyOwner {
        isNoorCitizen[_citizen] = _status;
        emit CitizenStatusUpdated(_citizen, _status);
    }
    
    /**
     * @dev Update fee exemption status
     * @param _account Address to update
     * @param _exempt Exemption status
     */
    function updateFeeExemption(address _account, bool _exempt) external onlyOwner {
        feeExempt[_account] = _exempt;
        emit FeeExemptionUpdated(_account, _exempt);
    }
    
    /**
     * @dev Update limit exemption status
     * @param _account Address to update
     * @param _exempt Exemption status
     */
    function updateLimitExemption(address _account, bool _exempt) external onlyOwner {
        limitExempt[_account] = _exempt;
        emit LimitExemptionUpdated(_account, _exempt);
    }
    
    /**
     * @dev Pause token transfers (emergency only)
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
    
    // ============ VESTING FUNCTIONS ============
    
    /**
     * @dev Release vested team tokens
     * @param _to Address to send vested tokens
     * @param _amount Amount to release
     */
    function releaseVestedTokens(address _to, uint256 _amount) external onlyOwner nonReentrant {
        if (_to == address(0)) revert InvalidAddress();
        if (vestingStartTime == 0) revert VestingNotStarted();
        
        uint256 vestedAmount = calculateVestedAmount();
        if (_amount > vestedAmount) revert InsufficientVestedAmount();
        
        _transfer(address(this), _to, _amount);
    }
    
    /**
     * @dev Calculate vested amount based on time elapsed
     * @return Amount of tokens that can be released
     */
    function calculateVestedAmount() public view returns (uint256) {
        if (vestingStartTime == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - vestingStartTime;
        if (timeElapsed >= VESTING_DURATION) {
            return TEAM_DEVELOPMENT;
        }
        
        return (TEAM_DEVELOPMENT * timeElapsed) / VESTING_DURATION;
    }
    
    // ============ TRANSFER FUNCTIONS ============
    
    /**
     * @dev Override transfer to include fees and limits
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        // Skip fees and limits for minting, burning, and exempted addresses
        if (from == address(0) || to == address(0) || feeExempt[from] || feeExempt[to]) {
            super._update(from, to, amount);
            return;
        }
        
        // Check transaction limits
        if (!limitExempt[from] && !limitExempt[to]) {
            if (amount > MAX_TX_SIZE) revert ExceedsMaxTransactionSize();
            
            // Check max wallet size for recipient
            if (balanceOf(to) + amount > MAX_WALLET_SIZE) {
                revert ExceedsMaxWalletSize();
            }
        }
        
        // Calculate fees
        uint256 feeAmount = 0;
        
        // No fees for Noor Citizens
        if (!isNoorCitizen[from] && !isNoorCitizen[to]) {
            feeAmount = (amount * TRANSACTION_FEE) / BASIS_POINTS;
        }
        
        if (feeAmount > 0) {
            uint256 netAmount = amount - feeAmount;
            
            // Transfer fee to community fund
            super._update(from, communityDevelopmentFund, feeAmount);
            totalFeesCollected += feeAmount;
            emit FeeCollected(from, feeAmount);
            
            // Transfer net amount to recipient
            super._update(from, to, netAmount);
        } else {
            // No fee, transfer full amount
            super._update(from, to, amount);
        }
    }
    
    // ============ ZAKAT DISTRIBUTION ============
    
    /**
     * @dev Distribute zakat from staking rewards
     * @param _amount Amount to distribute as zakat
     */
    function distributeZakat(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount > balanceOf(address(this))) revert InsufficientVestedAmount();
        
        uint256 zakatAmount = (_amount * ZAKAT_PERCENTAGE) / BASIS_POINTS;
        
        _transfer(address(this), sabirAllahHonorFund, zakatAmount);
        totalZakatCollected += zakatAmount;
        
        emit ZakatDistributed(sabirAllahHonorFund, zakatAmount);
    }
    
    // ============ AIRDROP FUNCTIONS ============
    
    /**
     * @dev Airdrop tokens to multiple addresses
     * @param _recipients Array of recipient addresses
     * @param _amounts Array of amounts to airdrop
     */
    function airdrop(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external onlyOwner nonReentrant {
        require(_recipients.length == _amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            if (_recipients[i] != address(0)) {
                _transfer(address(this), _recipients[i], _amounts[i]);
            }
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get resonance signature (frequencies combined)
     * @return Combined frequency signature
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_888HZ;
    }
    
    /**
     * @dev Check if address is a Noor Citizen (checks registry if set)
     * @param _address Address to check
     * @return True if address is a Noor Citizen
     */
    function checkCitizenStatus(address _address) external view returns (bool) {
        // TODO: Add citizenRegistry.isCitizen(_address) check when registry is deployed
        return isNoorCitizen[_address];
    }
    
    /**
     * @dev Get token distribution info
     * @return Array of distribution percentages
     */
    function getDistribution() external pure returns (uint256[7] memory) {
        return [
            30, // Staking Rewards Pool
            25, // Community Treasury
            15, // Liquidity Pools
            10, // Obelisk Fund
            10, // Sabir Allah Fund
            7,  // Team & Development
            3   // Initial Airdrop
        ];
    }
}
