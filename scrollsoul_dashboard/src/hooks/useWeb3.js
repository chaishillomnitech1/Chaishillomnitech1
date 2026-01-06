import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

/**
 * useWeb3 Hook
 * 
 * Custom hook for Web3 integration and wallet connection.
 * Handles connection to MetaMask and other Web3 providers.
 * 
 * @returns {Object} Web3 connection state and methods
 */
export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Web3 connection
  useEffect(() => {
    const init = async () => {
      try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          // Check if already connected
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            const connectedSigner = await web3Provider.getSigner();
            const address = await connectedSigner.getAddress();
            const network = await web3Provider.getNetwork();
            
            setAccount(address);
            setSigner(connectedSigner);
            setChainId(network.chainId.toString());
            setConnected(true);
          }

          // Listen for account changes
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', handleChainChanged);
        } else {
          setError('MetaMask is not installed. Please install MetaMask to use this portal.');
        }
      } catch (err) {
        console.error('Error initializing Web3:', err);
        setError('Failed to initialize Web3 connection');
      }
    };

    init();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setConnected(false);
      setSigner(null);
    } else {
      // User switched account
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const connectedSigner = await web3Provider.getSigner();
      const address = await connectedSigner.getAddress();
      
      setAccount(address);
      setSigner(connectedSigner);
      setConnected(true);
    }
  };

  // Handle chain changes
  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
    // Reload the page on chain change (recommended by MetaMask)
    window.location.reload();
  };

  // Connect wallet
  const connect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const connectedSigner = await web3Provider.getSigner();
      const address = await connectedSigner.getAddress();
      const network = await web3Provider.getNetwork();
      
      setProvider(web3Provider);
      setAccount(address);
      setSigner(connectedSigner);
      setChainId(network.chainId.toString());
      setConnected(true);
      setError(null);
      
      return address;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setConnected(false);
    setSigner(null);
  };

  // Switch chain
  const switchChain = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(targetChainId).toString(16)}` }],
      });
    } catch (err) {
      console.error('Error switching chain:', err);
      throw err;
    }
  };

  return {
    account,
    connected,
    provider,
    signer,
    chainId,
    error,
    connect,
    disconnect,
    switchChain
  };
};
