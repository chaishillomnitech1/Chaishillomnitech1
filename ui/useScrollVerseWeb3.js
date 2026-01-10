import { ethers } from 'ethers';
import { useState, useEffect, useCallback } from 'react';

/**
 * Web3 Integration Hook for ScrollVerse Prosperity Protocol
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 * 
 * Provides web3 connectivity to PharaohRevenueSplitter and ScrollVerseGovernanceDAO
 * 
 * Features:
 * - Wallet connection (MetaMask, WalletConnect)
 * - Contract interaction
 * - Event subscription
 * - Real-time data updates
 * - Transaction management
 * 
 * Usage:
 *   const { connect, contracts, stats, distributeRevenue } = useScrollVerseWeb3();
 */

// Contract ABIs (simplified - import full ABIs in production)
const REVENUE_SPLITTER_ABI = [
  "function distributeRevenue() external",
  "function getGlobalStats() external view returns (uint256 totalRevenue, uint256 totalDistributed, uint256 pending, uint256 totalZakat, uint256 activeBeneficiaries, uint256 totalBeneficiaries)",
  "function getBeneficiary(address account) external view returns (address payable, uint256 share, bool isActive, uint256 totalReceived, uint256 vestingStart, uint256 vestingDuration, uint256 vestingClaimed, uint256 contributionWeight, uint256 lastPaymentTime)",
  "function getAllBeneficiaries() external view returns (address[] memory)",
  "function claimVestedRevenue() external",
  "function getVestedAmount(address account) external view returns (uint256)",
  "function addBeneficiary(address payable account, uint256 share, uint256 vestingDuration, uint256 contributionWeight) external",
  "function totalRevenueReceived() external view returns (uint256)",
  "function totalZakatContributed() external view returns (uint256)",
  "function pendingRevenue() external view returns (uint256)",
  "event RevenueReceived(uint256 amount, uint256 timestamp)",
  "event RevenueDistributed(uint256 totalAmount, uint256 zakatAmount, uint256 timestamp)",
  "event BeneficiaryPaid(address indexed beneficiary, uint256 amount, uint256 timestamp)",
  "event ZakatContributed(uint256 amount, uint256 timestamp)"
];

const DAO_ABI = [
  "function propose(uint8 category, string memory title, string memory description, address target, uint256 value, bytes memory callData) external returns (uint256)",
  "function castVote(uint256 proposalId, uint8 voteType, string memory reason) external",
  "function queue(uint256 proposalId) external",
  "function execute(uint256 proposalId) external payable",
  "function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, address proposer, uint8 category, string title, string description, bytes callData, address target, uint256 value, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, uint8 status, uint256 executionTime, bool executed))",
  "function getProposalState(uint256 proposalId) external view returns (uint8)",
  "function proposalCount() external view returns (uint256)",
  "function getContributionWeight(address account) external view returns (uint256)",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, uint8 category, string title, uint256 startBlock, uint256 endBlock)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 voteType, uint256 weight, string reason)"
];

// Contract addresses (set via environment variables)
const CONTRACT_ADDRESSES = {
  revenueSplitter: process.env.REACT_APP_REVENUE_SPLITTER_ADDRESS,
  dao: process.env.REACT_APP_DAO_ADDRESS,
  pharaohNFT: process.env.REACT_APP_PHARAOH_NFT_ADDRESS
};

// Network configuration
const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2/demo' },
  137: { name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  534352: { name: 'Scroll', rpc: 'https://rpc.scroll.io' },
  534351: { name: 'Scroll Sepolia', rpc: 'https://sepolia-rpc.scroll.io' },
  80001: { name: 'Mumbai', rpc: 'https://rpc-mumbai.maticvigil.com' },
  11155111: { name: 'Sepolia', rpc: 'https://sepolia.infura.io/v3/' }
};

export const useScrollVerseWeb3 = () => {
  // State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contracts, setContracts] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Revenue splitter state
  const [stats, setStats] = useState({
    totalRevenue: '0',
    totalDistributed: '0',
    pending: '0',
    totalZakat: '0',
    activeBeneficiaries: 0,
    totalBeneficiaries: 0
  });
  
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [userBeneficiary, setUserBeneficiary] = useState(null);
  
  // DAO state
  const [proposals, setProposals] = useState([]);
  const [userVotingPower, setUserVotingPower] = useState(0);
  
  // ========== CONNECTION ==========
  
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();
      
      // Check network support
      if (!SUPPORTED_NETWORKS[Number(network.chainId)]) {
        throw new Error(`Unsupported network. Please switch to ${Object.values(SUPPORTED_NETWORKS).map(n => n.name).join(', ')}`);
      }
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      // Initialize contracts
      await initializeContracts(web3Signer);
      
      console.log('✅ Connected to', SUPPORTED_NETWORKS[Number(network.chainId)].name);
      console.log('👤 Account:', accounts[0]);
      
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);
  
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setContracts({});
    setIsConnected(false);
    setStats({
      totalRevenue: '0',
      totalDistributed: '0',
      pending: '0',
      totalZakat: '0',
      activeBeneficiaries: 0,
      totalBeneficiaries: 0
    });
  }, []);
  
  // ========== CONTRACT INITIALIZATION ==========
  
  const initializeContracts = useCallback(async (web3Signer) => {
    try {
      const contractInstances = {};
      
      // Revenue Splitter
      if (CONTRACT_ADDRESSES.revenueSplitter) {
        contractInstances.revenueSplitter = new ethers.Contract(
          CONTRACT_ADDRESSES.revenueSplitter,
          REVENUE_SPLITTER_ABI,
          web3Signer
        );
      }
      
      // DAO
      if (CONTRACT_ADDRESSES.dao) {
        contractInstances.dao = new ethers.Contract(
          CONTRACT_ADDRESSES.dao,
          DAO_ABI,
          web3Signer
        );
      }
      
      setContracts(contractInstances);
      
      // Subscribe to events
      subscribeToEvents(contractInstances);
      
      // Load initial data
      await loadInitialData(contractInstances, web3Signer);
      
    } catch (err) {
      console.error('Contract initialization error:', err);
      setError(err.message);
    }
  }, []);
  
  // ========== DATA LOADING ==========
  
  const loadInitialData = useCallback(async (contractInstances, web3Signer) => {
    try {
      const userAddress = await web3Signer.getAddress();
      
      // Load revenue splitter data
      if (contractInstances.revenueSplitter) {
        await loadRevenueSplitterData(contractInstances.revenueSplitter, userAddress);
      }
      
      // Load DAO data
      if (contractInstances.dao) {
        await loadDAOData(contractInstances.dao, userAddress);
      }
      
    } catch (err) {
      console.error('Data loading error:', err);
    }
  }, []);
  
  const loadRevenueSplitterData = useCallback(async (contract, userAddress) => {
    try {
      // Get global stats
      const globalStats = await contract.getGlobalStats();
      setStats({
        totalRevenue: ethers.formatEther(globalStats.totalRevenue),
        totalDistributed: ethers.formatEther(globalStats.totalDistributed),
        pending: ethers.formatEther(globalStats.pending),
        totalZakat: ethers.formatEther(globalStats.totalZakat),
        activeBeneficiaries: Number(globalStats.activeBeneficiaries),
        totalBeneficiaries: Number(globalStats.totalBeneficiaries)
      });
      
      // Get all beneficiaries
      const beneficiaryAddresses = await contract.getAllBeneficiaries();
      const beneficiaryData = [];
      
      for (const address of beneficiaryAddresses) {
        const beneficiary = await contract.getBeneficiary(address);
        if (beneficiary.isActive) {
          beneficiaryData.push({
            address,
            share: Number(beneficiary.share),
            totalReceived: ethers.formatEther(beneficiary.totalReceived),
            contributionWeight: Number(beneficiary.contributionWeight),
            vestingDuration: Number(beneficiary.vestingDuration),
            isVesting: beneficiary.vestingDuration > 0
          });
        }
      }
      
      setBeneficiaries(beneficiaryData);
      
      // Get user's beneficiary info
      try {
        const userBenef = await contract.getBeneficiary(userAddress);
        if (userBenef.isActive) {
          const vestedAmount = await contract.getVestedAmount(userAddress);
          setUserBeneficiary({
            share: Number(userBenef.share),
            totalReceived: ethers.formatEther(userBenef.totalReceived),
            contributionWeight: Number(userBenef.contributionWeight),
            vestedAmount: ethers.formatEther(vestedAmount),
            canClaim: vestedAmount > 0
          });
        }
      } catch (err) {
        // User is not a beneficiary
        setUserBeneficiary(null);
      }
      
    } catch (err) {
      console.error('Revenue splitter data loading error:', err);
    }
  }, []);
  
  const loadDAOData = useCallback(async (contract, userAddress) => {
    try {
      // Get user's voting power
      const votingPower = await contract.getContributionWeight(userAddress);
      setUserVotingPower(Number(votingPower));
      
      // Get proposal count and load recent proposals
      const count = await contract.proposalCount();
      const proposalData = [];
      
      // Load last 10 proposals
      const start = Math.max(1, Number(count) - 9);
      for (let i = Number(count); i >= start; i--) {
        try {
          const proposal = await contract.getProposal(i);
          const state = await contract.getProposalState(i);
          
          proposalData.push({
            id: Number(proposal.id),
            title: proposal.title,
            proposer: proposal.proposer,
            category: Number(proposal.category),
            forVotes: Number(proposal.forVotes),
            againstVotes: Number(proposal.againstVotes),
            abstainVotes: Number(proposal.abstainVotes),
            status: Number(state),
            startBlock: Number(proposal.startBlock),
            endBlock: Number(proposal.endBlock)
          });
        } catch (err) {
          console.error(`Error loading proposal ${i}:`, err);
        }
      }
      
      setProposals(proposalData.reverse());
      
    } catch (err) {
      console.error('DAO data loading error:', err);
    }
  }, []);
  
  // ========== EVENT SUBSCRIPTIONS ==========
  
  const subscribeToEvents = useCallback((contractInstances) => {
    if (contractInstances.revenueSplitter) {
      // Revenue received
      contractInstances.revenueSplitter.on('RevenueReceived', (amount, timestamp) => {
        console.log('💰 Revenue received:', ethers.formatEther(amount), 'ETH');
        loadRevenueSplitterData(contractInstances.revenueSplitter, account);
      });
      
      // Revenue distributed
      contractInstances.revenueSplitter.on('RevenueDistributed', (totalAmount, zakatAmount, timestamp) => {
        console.log('📊 Revenue distributed:', ethers.formatEther(totalAmount), 'ETH');
        console.log('🕋 Zakat:', ethers.formatEther(zakatAmount), 'ETH');
        loadRevenueSplitterData(contractInstances.revenueSplitter, account);
      });
    }
    
    if (contractInstances.dao) {
      // Proposal created
      contractInstances.dao.on('ProposalCreated', (proposalId, proposer, category, title) => {
        console.log('📋 New proposal:', title);
        loadDAOData(contractInstances.dao, account);
      });
      
      // Vote cast
      contractInstances.dao.on('VoteCast', (voter, proposalId, voteType, weight) => {
        console.log('🗳️  Vote cast on proposal', Number(proposalId));
        loadDAOData(contractInstances.dao, account);
      });
    }
  }, [account]);
  
  // ========== REVENUE SPLITTER FUNCTIONS ==========
  
  const distributeRevenue = useCallback(async () => {
    if (!contracts.revenueSplitter) throw new Error('Contract not initialized');
    
    try {
      const tx = await contracts.revenueSplitter.distributeRevenue();
      console.log('⏳ Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('✅ Revenue distributed');
      await loadRevenueSplitterData(contracts.revenueSplitter, account);
      return tx;
    } catch (err) {
      console.error('Distribution error:', err);
      throw err;
    }
  }, [contracts, account]);
  
  const claimVestedRevenue = useCallback(async () => {
    if (!contracts.revenueSplitter) throw new Error('Contract not initialized');
    
    try {
      const tx = await contracts.revenueSplitter.claimVestedRevenue();
      console.log('⏳ Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('✅ Vested revenue claimed');
      await loadRevenueSplitterData(contracts.revenueSplitter, account);
      return tx;
    } catch (err) {
      console.error('Claim error:', err);
      throw err;
    }
  }, [contracts, account]);
  
  // ========== DAO FUNCTIONS ==========
  
  const createProposal = useCallback(async (category, title, description, target = ethers.ZeroAddress, value = 0, callData = '0x') => {
    if (!contracts.dao) throw new Error('DAO contract not initialized');
    
    try {
      const tx = await contracts.dao.propose(category, title, description, target, value, callData);
      console.log('⏳ Transaction submitted:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Proposal created');
      await loadDAOData(contracts.dao, account);
      return receipt;
    } catch (err) {
      console.error('Proposal creation error:', err);
      throw err;
    }
  }, [contracts, account]);
  
  const vote = useCallback(async (proposalId, voteType, reason = '') => {
    if (!contracts.dao) throw new Error('DAO contract not initialized');
    
    try {
      const tx = await contracts.dao.castVote(proposalId, voteType, reason);
      console.log('⏳ Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('✅ Vote cast');
      await loadDAOData(contracts.dao, account);
      return tx;
    } catch (err) {
      console.error('Voting error:', err);
      throw err;
    }
  }, [contracts, account]);
  
  // ========== ACCOUNT CHANGE LISTENERS ==========
  
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          if (contracts.revenueSplitter) {
            loadRevenueSplitterData(contracts.revenueSplitter, accounts[0]);
          }
          if (contracts.dao) {
            loadDAOData(contracts.dao, accounts[0]);
          }
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [contracts, disconnect]);
  
  // ========== RETURN ==========
  
  return {
    // Connection
    connect,
    disconnect,
    isConnected,
    isConnecting,
    account,
    chainId,
    error,
    
    // Contracts
    contracts,
    
    // Revenue Splitter
    stats,
    beneficiaries,
    userBeneficiary,
    distributeRevenue,
    claimVestedRevenue,
    
    // DAO
    proposals,
    userVotingPower,
    createProposal,
    vote,
    
    // Utilities
    provider,
    signer
  };
};

export default useScrollVerseWeb3;
