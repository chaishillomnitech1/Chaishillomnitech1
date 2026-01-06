// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ScrollCommandLogic
 * @notice Enhanced governance command processor for ScrollVerse protocols
 * @dev Implements SGCC governance principles with legacy affirmation
 * @author Supreme King Chais The Great ∞
 * 
 * This contract implements the ScrollCommand framework integrating:
 * - Activation Commands from ScrollSoul legacy
 * - SGCC Governance principles (Guardian amplification, Dragon voting power)
 * - Legacy affirmation mechanisms
 * - Enhanced governance with weighted voting
 * - Temporal synchronization at 11:11 anchors
 * - Multi-frequency resonance tracking (528Hz, 963Hz, 999Hz, 144000Hz)
 */
contract ScrollCommandLogic is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // ============ Constants ============
    
    /// @notice Valid activation commands (Legacy affirmation)
    string public constant COMMAND_I_ACCEPT = "I ACCEPT";
    string public constant COMMAND_I_AM_PRESENT = "I AM PRESENT";
    string public constant COMMAND_I_RESONATE = "I RESONATE";
    string public constant COMMAND_I_MANIFEST = "I MANIFEST";
    string public constant COMMAND_KUN_FAYAKUN = "KUN FAYAKUN";
    
    /// @notice Core frequencies
    uint256 public constant FREQUENCY_528HZ = 528;      // Healing frequency
    uint256 public constant FREQUENCY_963HZ = 963;      // Divine frequency
    uint256 public constant FREQUENCY_999HZ = 999;      // Crown frequency
    uint256 public constant FREQUENCY_144000HZ = 144000; // NŪR Pulse
    
    /// @notice Governance parameters
    uint256 public constant MIN_GUARDIAN_RESONANCE = 500;
    uint256 public constant MAX_DRAGONS = 144;
    uint256 public constant DRAGON_AMPLIFICATION_BASE = 100;
    uint256 public constant PROPOSAL_APPROVAL_THRESHOLD = 66; // 66% approval required
    
    /// @notice Temporal anchor constants
    uint256 public constant TEMPORAL_ANCHOR_HOUR = 11;
    uint256 public constant TEMPORAL_ANCHOR_MINUTE = 11;
    uint256 public constant TEMPORAL_WINDOW_MINUTES = 11;
    
    // ============ Enums ============
    
    enum ProposalStatus { Pending, Active, Passed, Rejected, Executed }
    enum ProposalCategory { CosmicUpgrade, TreasuryAllocation, GuardianManagement, DragonManifestation, BurningProtocol }
    
    // ============ Structs ============
    
    /**
     * @notice Guardian profile with governance rights
     */
    struct Guardian {
        bool isRegistered;
        uint256 resonanceLevel;
        uint256 dragonCount;
        uint256 votingPower;
        uint256 participationCount;
        uint256 registrationTime;
    }
    
    /**
     * @notice Command execution record
     */
    struct CommandExecution {
        string command;
        address executor;
        uint256 timestamp;
        bytes32 intentionHash;
        uint256 frequencyAlignment;
        uint256 timingPrecision;
        bool isValid;
    }
    
    /**
     * @notice Governance proposal
     */
    struct Proposal {
        bytes32 proposalId;
        ProposalCategory category;
        address proposer;
        string description;
        uint256 creationTime;
        uint256 votingStartTime;
        uint256 votingEndTime;
        ProposalStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
    }
    
    /**
     * @notice Dragon NFT metadata for governance
     */
    struct DragonGovernance {
        uint256 dragonId;
        address owner;
        uint256 resonanceBoost;
        bool isRhythmCustodian;
        uint256 votingPowerMultiplier;
    }
    
    // ============ State Variables ============
    
    /// @notice Mapping: Address => Guardian profile
    mapping(address => Guardian) public guardians;
    
    /// @notice Mapping: Proposal ID => Proposal
    mapping(bytes32 => Proposal) public proposals;
    
    /// @notice Mapping: Dragon ID => Dragon governance data
    mapping(uint256 => DragonGovernance) public dragons;
    
    /// @notice Command execution counter
    Counters.Counter private _commandExecutionCounter;
    
    /// @notice Mapping: Execution ID => Command execution
    mapping(uint256 => CommandExecution) public commandExecutions;
    
    /// @notice Array of all proposal IDs
    bytes32[] public proposalHistory;
    
    /// @notice Array of all registered guardians
    address[] public guardianRegistry;
    
    /// @notice Total registered guardians count
    uint256 public totalGuardians;
    
    /// @notice Total active dragons
    uint256 public totalDragons;
    
    /// @notice Protocol active status
    bool public isProtocolActive;
    
    /// @notice Legacy affirmation status
    bool public legacyAffirmed;
    
    // ============ Events ============
    
    event GuardianRegistered(address indexed guardian, uint256 resonanceLevel, uint256 timestamp);
    event GuardianResonanceUpdated(address indexed guardian, uint256 oldResonance, uint256 newResonance);
    event DragonAssigned(address indexed guardian, uint256 dragonId, uint256 votingPowerMultiplier);
    event CommandExecuted(uint256 indexed executionId, address indexed executor, string command, uint256 timestamp);
    event ProposalCreated(bytes32 indexed proposalId, ProposalCategory category, address indexed proposer);
    event VoteCast(bytes32 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event ProposalExecuted(bytes32 indexed proposalId, ProposalStatus finalStatus);
    event LegacyAffirmed(address indexed affirmer, uint256 timestamp);
    event ProtocolStatusChanged(bool isActive, uint256 timestamp);
    
    // ============ Modifiers ============
    
    modifier onlyGuardian() {
        require(guardians[msg.sender].isRegistered, "ScrollCommand: Not a registered Guardian");
        require(guardians[msg.sender].resonanceLevel >= MIN_GUARDIAN_RESONANCE, "ScrollCommand: Insufficient resonance");
        _;
    }
    
    modifier onlyRhythmCustodian() {
        require(hasRhythmCustodianDragon(msg.sender), "ScrollCommand: Not a Rhythm Custodian");
        _;
    }
    
    modifier protocolActive() {
        require(isProtocolActive, "ScrollCommand: Protocol not active");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        isProtocolActive = true;
        legacyAffirmed = false;
    }
    
    // ============ Guardian Management ============
    
    /**
     * @notice Register a new Guardian
     * @param _resonanceLevel Initial resonance level (must be >= 500)
     */
    function registerGuardian(uint256 _resonanceLevel) external nonReentrant {
        require(!guardians[msg.sender].isRegistered, "ScrollCommand: Already registered");
        require(_resonanceLevel >= MIN_GUARDIAN_RESONANCE, "ScrollCommand: Insufficient initial resonance");
        
        guardians[msg.sender] = Guardian({
            isRegistered: true,
            resonanceLevel: _resonanceLevel,
            dragonCount: 0,
            votingPower: calculateVotingPower(msg.sender, _resonanceLevel, 0),
            participationCount: 0,
            registrationTime: block.timestamp
        });
        
        guardianRegistry.push(msg.sender);
        totalGuardians++;
        
        emit GuardianRegistered(msg.sender, _resonanceLevel, block.timestamp);
    }
    
    /**
     * @notice Update Guardian resonance level
     * @param _guardian Guardian address
     * @param _newResonance New resonance level
     */
    function updateGuardianResonance(address _guardian, uint256 _newResonance) external onlyOwner {
        require(guardians[_guardian].isRegistered, "ScrollCommand: Guardian not registered");
        
        uint256 oldResonance = guardians[_guardian].resonanceLevel;
        guardians[_guardian].resonanceLevel = _newResonance;
        guardians[_guardian].votingPower = calculateVotingPower(
            _guardian,
            _newResonance,
            guardians[_guardian].dragonCount
        );
        
        emit GuardianResonanceUpdated(_guardian, oldResonance, _newResonance);
    }
    
    /**
     * @notice Assign Dragon NFT to Guardian
     * @param _guardian Guardian address
     * @param _dragonId Dragon NFT ID
     * @param _isRhythmCustodian Whether dragon is a Rhythm Custodian
     */
    function assignDragon(
        address _guardian,
        uint256 _dragonId,
        bool _isRhythmCustodian
    ) external onlyOwner {
        require(guardians[_guardian].isRegistered, "ScrollCommand: Guardian not registered");
        require(totalDragons < MAX_DRAGONS, "ScrollCommand: Max dragons reached");
        require(dragons[_dragonId].owner == address(0), "ScrollCommand: Dragon already assigned");
        
        uint256 resonanceBoost = _isRhythmCustodian ? 200 : 100;
        uint256 multiplier = guardians[_guardian].resonanceLevel / DRAGON_AMPLIFICATION_BASE;
        
        dragons[_dragonId] = DragonGovernance({
            dragonId: _dragonId,
            owner: _guardian,
            resonanceBoost: resonanceBoost,
            isRhythmCustodian: _isRhythmCustodian,
            votingPowerMultiplier: multiplier
        });
        
        guardians[_guardian].dragonCount++;
        guardians[_guardian].resonanceLevel += resonanceBoost;
        guardians[_guardian].votingPower = calculateVotingPower(
            _guardian,
            guardians[_guardian].resonanceLevel,
            guardians[_guardian].dragonCount
        );
        
        totalDragons++;
        
        emit DragonAssigned(_guardian, _dragonId, multiplier);
    }
    
    // ============ Command Execution ============
    
    /**
     * @notice Execute a scroll command with legacy affirmation
     * @param _command Command string
     * @param _intentionHash Hash of intention
     * @param _targetFrequency Target frequency alignment
     */
    function executeCommand(
        string memory _command,
        bytes32 _intentionHash,
        uint256 _targetFrequency
    ) external onlyGuardian protocolActive nonReentrant {
        require(isValidCommand(_command), "ScrollCommand: Invalid command");
        require(isValidFrequency(_targetFrequency), "ScrollCommand: Invalid frequency");
        
        uint256 timingPrecision = calculateTimingPrecision(block.timestamp);
        
        uint256 executionId = _commandExecutionCounter.current();
        _commandExecutionCounter.increment();
        
        commandExecutions[executionId] = CommandExecution({
            command: _command,
            executor: msg.sender,
            timestamp: block.timestamp,
            intentionHash: _intentionHash,
            frequencyAlignment: _targetFrequency,
            timingPrecision: timingPrecision,
            isValid: true
        });
        
        guardians[msg.sender].participationCount++;
        
        emit CommandExecuted(executionId, msg.sender, _command, block.timestamp);
    }
    
    // ============ Governance Functions ============
    
    /**
     * @notice Create a governance proposal
     * @param _category Proposal category
     * @param _description Proposal description
     */
    function createProposal(
        ProposalCategory _category,
        string memory _description
    ) external onlyGuardian protocolActive nonReentrant returns (bytes32) {
        require(
            hasRhythmCustodianDragon(msg.sender) || guardians[msg.sender].participationCount >= 10,
            "ScrollCommand: Insufficient participation to propose"
        );
        
        bytes32 proposalId = keccak256(abi.encodePacked(
            msg.sender,
            _description,
            block.timestamp
        ));
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.category = _category;
        proposal.proposer = msg.sender;
        proposal.description = _description;
        proposal.creationTime = block.timestamp;
        proposal.votingStartTime = block.timestamp + 3 days; // 3-day initiation period
        proposal.votingEndTime = block.timestamp + 15 days; // Total 15 days (3 init + 7 delib + 5 vote)
        proposal.status = ProposalStatus.Pending;
        
        proposalHistory.push(proposalId);
        
        emit ProposalCreated(proposalId, _category, msg.sender);
        
        return proposalId;
    }
    
    /**
     * @notice Activate proposal for voting
     * @param _proposalId Proposal identifier
     */
    function activateProposal(bytes32 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Pending, "ScrollCommand: Proposal not pending");
        require(block.timestamp >= proposal.votingStartTime, "ScrollCommand: Too early to activate");
        
        proposal.status = ProposalStatus.Active;
    }
    
    /**
     * @notice Cast vote on proposal
     * @param _proposalId Proposal identifier
     * @param _support True for yes, false for no
     */
    function castVote(bytes32 _proposalId, bool _support) external onlyGuardian protocolActive nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "ScrollCommand: Proposal not active");
        require(block.timestamp <= proposal.votingEndTime, "ScrollCommand: Voting period ended");
        require(!proposal.hasVoted[msg.sender], "ScrollCommand: Already voted");
        
        uint256 votingPower = guardians[msg.sender].votingPower;
        
        if (_support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }
        
        proposal.hasVoted[msg.sender] = true;
        guardians[msg.sender].participationCount++;
        
        emit VoteCast(_proposalId, msg.sender, _support, votingPower);
    }
    
    /**
     * @notice Execute proposal after voting period
     * @param _proposalId Proposal identifier
     */
    function executeProposal(bytes32 _proposalId) external onlyRhythmCustodian nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "ScrollCommand: Proposal not active");
        require(block.timestamp > proposal.votingEndTime, "ScrollCommand: Voting still ongoing");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 approvalPercentage = totalVotes > 0 
            ? (proposal.votesFor * 100) / totalVotes 
            : 0;
        
        if (approvalPercentage >= PROPOSAL_APPROVAL_THRESHOLD) {
            proposal.status = ProposalStatus.Passed;
        } else {
            proposal.status = ProposalStatus.Rejected;
        }
        
        emit ProposalExecuted(_proposalId, proposal.status);
    }
    
    // ============ Legacy Affirmation ============
    
    /**
     * @notice Affirm legacy protocols
     */
    function affirmLegacy() external onlyOwner {
        require(!legacyAffirmed, "ScrollCommand: Legacy already affirmed");
        
        legacyAffirmed = true;
        
        emit LegacyAffirmed(msg.sender, block.timestamp);
    }
    
    // ============ Helper Functions ============
    
    /**
     * @notice Validate command string
     * @param _command Command to validate
     * @return isValid True if command is recognized
     */
    function isValidCommand(string memory _command) public pure returns (bool) {
        return (
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_ACCEPT)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_AM_PRESENT)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_RESONATE)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_I_MANIFEST)) ||
            keccak256(bytes(_command)) == keccak256(bytes(COMMAND_KUN_FAYAKUN))
        );
    }
    
    /**
     * @notice Validate frequency
     * @param _frequency Frequency to validate
     * @return isValid True if frequency is recognized
     */
    function isValidFrequency(uint256 _frequency) public pure returns (bool) {
        return (
            _frequency == FREQUENCY_528HZ ||
            _frequency == FREQUENCY_963HZ ||
            _frequency == FREQUENCY_999HZ ||
            _frequency == FREQUENCY_144000HZ
        );
    }
    
    /**
     * @notice Calculate voting power based on resonance and dragon ownership
     * @param _guardian Guardian address
     * @param _resonance Resonance level
     * @param _dragonCount Number of dragons owned
     * @return power Calculated voting power
     */
    function calculateVotingPower(
        address _guardian,
        uint256 _resonance,
        uint256 _dragonCount
    ) internal view returns (uint256) {
        uint256 basePower = 1000; // Base voting power
        
        // Resonance multiplier
        uint256 resonanceMultiplier = (_resonance * 100) / MIN_GUARDIAN_RESONANCE;
        
        // Dragon amplification
        uint256 dragonAmplification = _dragonCount * (_resonance / DRAGON_AMPLIFICATION_BASE);
        
        return basePower + (basePower * resonanceMultiplier / 100) + dragonAmplification;
    }
    
    /**
     * @notice Calculate timing precision relative to 11:11 anchor
     * @param _timestamp Execution timestamp
     * @return precision Precision score (0-1000)
     */
    function calculateTimingPrecision(uint256 _timestamp) internal pure returns (uint256) {
        // Extract hour and minute from timestamp
        uint256 hour = (_timestamp / 3600) % 24;
        uint256 minute = (_timestamp / 60) % 60;
        
        // Calculate distance from 11:11
        int256 hourDiff = int256(hour) - int256(TEMPORAL_ANCHOR_HOUR);
        int256 minuteDiff = int256(minute) - int256(TEMPORAL_ANCHOR_MINUTE);
        
        // Total minutes difference
        int256 totalMinutesDiff = (hourDiff * 60) + minuteDiff;
        if (totalMinutesDiff < 0) totalMinutesDiff = -totalMinutesDiff;
        
        // Within 11-minute window
        if (uint256(totalMinutesDiff) <= TEMPORAL_WINDOW_MINUTES) {
            return 1000 - ((uint256(totalMinutesDiff) * 1000) / TEMPORAL_WINDOW_MINUTES);
        }
        
        return 0;
    }
    
    /**
     * @notice Check if address has Rhythm Custodian dragon
     * @param _guardian Guardian address
     * @return hasCustodian True if owns Rhythm Custodian dragon
     */
    function hasRhythmCustodianDragon(address _guardian) internal view returns (bool) {
        if (!guardians[_guardian].isRegistered) return false;
        
        // Check all dragons for this guardian
        for (uint256 i = 0; i < MAX_DRAGONS; i++) {
            if (dragons[i].owner == _guardian && dragons[i].isRhythmCustodian) {
                return true;
            }
        }
        
        return false;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get Guardian details
     * @param _guardian Guardian address
     * @return Guardian struct
     */
    function getGuardian(address _guardian) external view returns (Guardian memory) {
        return guardians[_guardian];
    }
    
    /**
     * @notice Get proposal details
     * @param _proposalId Proposal identifier
     * @return Basic proposal data (mapping fields excluded)
     */
    function getProposal(bytes32 _proposalId) external view returns (
        bytes32 proposalId,
        ProposalCategory category,
        address proposer,
        string memory description,
        uint256 creationTime,
        uint256 votingStartTime,
        uint256 votingEndTime,
        ProposalStatus status,
        uint256 votesFor,
        uint256 votesAgainst
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.proposalId,
            proposal.category,
            proposal.proposer,
            proposal.description,
            proposal.creationTime,
            proposal.votingStartTime,
            proposal.votingEndTime,
            proposal.status,
            proposal.votesFor,
            proposal.votesAgainst
        );
    }
    
    /**
     * @notice Check if address has voted on proposal
     * @param _proposalId Proposal identifier
     * @param _voter Voter address
     * @return hasVoted True if voted
     */
    function hasVotedOnProposal(bytes32 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
    
    /**
     * @notice Get command execution details
     * @param _executionId Execution identifier
     * @return CommandExecution struct
     */
    function getCommandExecution(uint256 _executionId) external view returns (CommandExecution memory) {
        return commandExecutions[_executionId];
    }
    
    /**
     * @notice Get total command executions
     * @return count Total executions
     */
    function getTotalCommandExecutions() external view returns (uint256) {
        return _commandExecutionCounter.current();
    }
    
    /**
     * @notice Get total proposals
     * @return count Total proposals
     */
    function getTotalProposals() external view returns (uint256) {
        return proposalHistory.length;
    }
    
    /**
     * @notice Get dragon details
     * @param _dragonId Dragon identifier
     * @return DragonGovernance struct
     */
    function getDragon(uint256 _dragonId) external view returns (DragonGovernance memory) {
        return dragons[_dragonId];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set protocol active status
     * @param _isActive New active status
     */
    function setProtocolActive(bool _isActive) external onlyOwner {
        isProtocolActive = _isActive;
        
        emit ProtocolStatusChanged(_isActive, block.timestamp);
    }
    
    /**
     * @notice Emergency pause protocol
     */
    function emergencyPause() external onlyOwner {
        isProtocolActive = false;
        
        emit ProtocolStatusChanged(false, block.timestamp);
    }
}
