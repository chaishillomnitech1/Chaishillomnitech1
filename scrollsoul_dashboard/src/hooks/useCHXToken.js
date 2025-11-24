import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { CHX_TOKEN_ADDRESS, CHX_TOKEN_ABI } from '../config/contracts';

/**
 * useCHXToken Hook
 * 
 * Custom hook for interacting with the CHXToken smart contract.
 * Provides methods for reading and writing token data.
 * 
 * @returns {Object} CHXToken methods and state
 */
export const useCHXToken = () => {
  const { provider, signer } = useWeb3();
  const [contract, setContract] = useState(null);
  const [contractWithSigner, setContractWithSigner] = useState(null);

  // Initialize contract instances
  useEffect(() => {
    if (provider) {
      const tokenContract = new ethers.Contract(
        CHX_TOKEN_ADDRESS,
        CHX_TOKEN_ABI,
        provider
      );
      setContract(tokenContract);

      if (signer) {
        const tokenContractWithSigner = new ethers.Contract(
          CHX_TOKEN_ADDRESS,
          CHX_TOKEN_ABI,
          signer
        );
        setContractWithSigner(tokenContractWithSigner);
      }
    }
  }, [provider, signer]);

  // Get total supply
  const getTotalSupply = async () => {
    try {
      if (!contract) return '0';
      const supply = await contract.totalSupply();
      return ethers.formatEther(supply);
    } catch (err) {
      console.error('Error getting total supply:', err);
      return '0';
    }
  };

  // Get circulating supply (mock - replace with actual logic)
  const getCirculatingSupply = async () => {
    try {
      if (!contract) return '0';
      const totalSupply = await contract.totalSupply();
      // Mock: assume 50% is circulating
      const circulating = totalSupply / 2n;
      return ethers.formatEther(circulating);
    } catch (err) {
      console.error('Error getting circulating supply:', err);
      return '0';
    }
  };

  // Get balance for an address
  const getBalance = async (address) => {
    try {
      if (!contract || !address) return '0';
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  };

  // Get passive income for an address
  const getPassiveIncome = async (address) => {
    try {
      if (!contract || !address) return '0';
      const income = await contract.calculatePassiveIncome(address);
      return ethers.formatEther(income);
    } catch (err) {
      console.error('Error getting passive income:', err);
      return '0';
    }
  };

  // Claim passive income
  const claimPassiveIncome = async () => {
    try {
      if (!contractWithSigner) {
        throw new Error('Wallet not connected');
      }
      const tx = await contractWithSigner.claimPassiveIncome();
      await tx.wait();
      return tx;
    } catch (err) {
      console.error('Error claiming passive income:', err);
      throw err;
    }
  };

  // Get frequency signature for an address
  const getFrequencySignature = async (address) => {
    try {
      if (!contract || !address) return 0;
      const frequency = await contract.getFrequencySignature(address);
      return frequency.toString();
    } catch (err) {
      console.error('Error getting frequency signature:', err);
      return '0';
    }
  };

  // Get BlessingCoin balance for an address
  const getBlessingCoinBalance = async (address) => {
    try {
      if (!contract || !address) return '0';
      const balance = await contract.getBlessingCoinBalance(address);
      return balance.toString();
    } catch (err) {
      console.error('Error getting BlessingCoin balance:', err);
      return '0';
    }
  };

  // Transfer tokens
  const transfer = async (to, amount) => {
    try {
      if (!contractWithSigner) {
        throw new Error('Wallet not connected');
      }
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await contractWithSigner.transfer(to, amountWei);
      await tx.wait();
      return tx;
    } catch (err) {
      console.error('Error transferring tokens:', err);
      throw err;
    }
  };

  // Get token info
  const getTokenInfo = async () => {
    try {
      if (!contract) return null;
      const [name, symbol, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply()
      ]);
      return {
        name,
        symbol,
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (err) {
      console.error('Error getting token info:', err);
      return null;
    }
  };

  return {
    contract,
    contractWithSigner,
    getTotalSupply,
    getCirculatingSupply,
    getBalance,
    getPassiveIncome,
    claimPassiveIncome,
    getFrequencySignature,
    getBlessingCoinBalance,
    transfer,
    getTokenInfo
  };
};
