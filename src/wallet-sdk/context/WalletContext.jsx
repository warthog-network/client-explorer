import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getProvider,
  isWalletConnected,
  requestAccounts,
  getAccounts,
  onAccountsChanged,
  onChainChanged,
  disconnect,
} from '../api/walletApi';

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const provider = getProvider();
    setIsInstalled(!!provider);

    if (provider) {
      setIsConnected(provider.isConnected());
      provider.request({ method: 'accounts' })
        .then((accounts) => setAccounts(accounts || []))
        .catch(() => setAccounts([]));

      provider.request({ method: 'chainId' })
        .then((chainId) => setChainId(chainId))
        .catch(() => setChainId(null));
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const unsubAccounts = onAccountsChanged((accounts) => {
      setAccounts(accounts || []);
      setIsConnected(accounts && accounts.length > 0);
    });

    const unsubChain = onChainChanged((chainId) => {
      setChainId(chainId);
    });

    return () => {
      unsubAccounts();
      unsubChain();
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const accounts = await requestAccounts();
      setAccounts(accounts || []);
      setIsConnected(accounts && accounts.length > 0);
      return accounts;
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setAccounts([]);
      setIsConnected(false);
    } catch (err) {
      setError(err.message || 'Failed to disconnect');
    }
  }, []);

  const value = {
    isInstalled,
    isConnected,
    accounts,
    chainId,
    error,
    connect,
    disconnect: disconnectWallet,
    primaryAccount: accounts[0] || null,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

export default WalletContext;
