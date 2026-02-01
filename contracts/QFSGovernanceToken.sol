// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title QFS Governance Token
 * @notice Governance token for the QFS Validation Company ecosystem
 * @dev ERC20 token with governance features, staking rewards, and participation incentives
 * @author Supreme King Chais The Great ∞
 * 
 * This token serves as:
 * - Governance voting power for QFS protocol decisions
 * - Staking mechanism for validator participation
 * - Incentive rewards for validation and verification activities
 * - Access control for premium QFS features
 */
contract QFSGovernanceToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    
    // ============ Constants ============
    
    /// @notice Maximum total supply (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /// @notice Token decimals
    uint8 private constant DECIMALS = 18;
    
    // ============ State Variables ============
    
    /// @notice Staking contract address
    address public stakingContract;
    
    /// @notice Validation company contract address
    address public validationCompany;
    
    /// @notice Minter addresses mapping
    mapping(address => bool) public minters;
    
    /// @notice Total tokens minted
    uint256 public totalMinted;
    
    /// @notice Governance proposal count
    uint256 public proposalCount;
    
    /// @notice Vote delegation mapping
    mapping(address => address) public delegates;
    
    /// @notice Voting power by address
    mapping(address => uint256) public votingPower;
    
    // ============ Structs ============
    
    /**
     * @notice Governance proposal structure
     * @param proposalId Unique proposal ID
     * @param proposer Address of proposer
     * @param description Proposal description
     * @param votesFor Votes in favor
     * @param votesAgainst Votes against
     * @param startTime Voting start time
     * @param endTime Voting end time
     * @param executed Whether proposal is executed
     * @param passed Whether proposal passed
     */
    struct Proposal {
        uint256 proposalId;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool passed;
    }
    
    /// @notice Proposals mapping
    mapping(uint256 => Proposal) public proposals;
    
    /// @notice Vote tracking
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // ============ Events ============
    
    event MinterAdded(address indexed minter, uint256 timestamp);
    event MinterRemoved(address indexed minter, uint256 timestamp);
    event StakingContractUpdated(address indexed newContract, uint256 timestamp);
    event ValidationCompanyUpdated(address indexed newCompany, uint256 timestamp);
    event TokensMinted(address indexed to, uint256 amount, uint256 timestamp);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize QFS Governance Token
     * @param initialOwner Address of the initial owner
     */
    constructor(address initialOwner)
        ERC20("QFS Governance Token", "QFSGOV")
        Ownable(initialOwner)
    {
        // Mint initial supply to owner (10 million tokens)
        uint256 initialSupply = 10_000_000 * 10**18;
        _mint(initialOwner, initialSupply);
        totalMinted = initialSupply;
        
        // Set owner as initial minter
        minters[initialOwner] = true;
        
        // Initialize voting power
        votingPower[initialOwner] = initialSupply;
    }
    
    // ============ Minting Functions ============
    
    /**
     * @notice Mint new tokens (only by authorized minters)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        totalMinted += amount;
        votingPower[to] += amount;
        
        emit TokensMinted(to, amount, block.timestamp);
    }
    
    /**
     * @notice Add minter address (only owner)
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid address");
        require(!minters[minter], "Already a minter");
        
        minters[minter] = true;
        
        emit MinterAdded(minter, block.timestamp);
    }
    
    /**
     * @notice Remove minter address (only owner)
     * @param minter Address to remove from minters
     */
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Not a minter");
        
        minters[minter] = false;
        
        emit MinterRemoved(minter, block.timestamp);
    }
    
    // ============ Governance Functions ============
    
    /**
     * @notice Create a governance proposal
     * @param description Proposal description
     * @param votingPeriod Voting period in seconds
     */
    function createProposal(
        string calldata description,
        uint256 votingPeriod
    ) external returns (uint256) {
        require(balanceOf(msg.sender) >= 1000 * 10**18, "Insufficient tokens to propose");
        require(votingPeriod >= 1 days && votingPeriod <= 30 days, "Invalid voting period");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            proposer: msg.sender,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            executed: false,
            passed: false
        });
        
        emit ProposalCreated(proposalId, msg.sender, description);
        
        return proposalId;
    }
    
    /**
     * @notice Vote on a proposal
     * @param proposalId Proposal ID to vote on
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        uint256 votes = getVotingPower(msg.sender);
        require(votes > 0, "No voting power");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposal.votesFor += votes;
        } else {
            proposal.votesAgainst += votes;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votes);
    }
    
    /**
     * @notice Execute a proposal after voting ends
     * @param proposalId Proposal ID to execute
     */
    function executeProposal(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        proposal.passed = proposal.votesFor > proposal.votesAgainst;
        
        emit ProposalExecuted(proposalId, proposal.passed);
    }
    
    /**
     * @notice Delegate voting power to another address
     * @param delegatee Address to delegate to
     */
    function delegate(address delegatee) external {
        require(delegatee != address(0), "Invalid delegatee");
        require(delegatee != msg.sender, "Cannot delegate to self");
        
        address currentDelegate = delegates[msg.sender];
        delegates[msg.sender] = delegatee;
        
        // Update voting power
        uint256 amount = balanceOf(msg.sender);
        if (currentDelegate != address(0)) {
            votingPower[currentDelegate] -= amount;
        } else {
            votingPower[msg.sender] -= amount;
        }
        votingPower[delegatee] += amount;
        
        emit DelegateChanged(msg.sender, currentDelegate, delegatee);
    }
    
    /**
     * @notice Get effective voting power of an address
     * @param account Address to query
     * @return uint256 Voting power
     */
    function getVotingPower(address account) public view returns (uint256) {
        if (delegates[account] != address(0)) {
            return 0; // Delegated away
        }
        return votingPower[account];
    }
    
    /**
     * @notice Get proposal details
     * @param proposalId Proposal ID
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        return proposals[proposalId];
    }
    
    // ============ Configuration Functions ============
    
    /**
     * @notice Set staking contract address
     * @param _stakingContract New staking contract address
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid address");
        stakingContract = _stakingContract;
        
        emit StakingContractUpdated(_stakingContract, block.timestamp);
    }
    
    /**
     * @notice Set validation company contract address
     * @param _validationCompany New validation company address
     */
    function setValidationCompany(address _validationCompany) external onlyOwner {
        require(_validationCompany != address(0), "Invalid address");
        validationCompany = _validationCompany;
        
        emit ValidationCompanyUpdated(_validationCompany, block.timestamp);
    }
    
    // ============ Pause Functions ============
    
    /**
     * @notice Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ Override Functions ============
    
    /**
     * @notice Override transfer to update voting power
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
        
        // Update voting power on transfers
        if (from != address(0) && delegates[from] == address(0)) {
            votingPower[from] -= value;
        }
        if (to != address(0) && delegates[to] == address(0)) {
            votingPower[to] += value;
        }
    }
    
    /**
     * @notice Returns token decimals
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}
