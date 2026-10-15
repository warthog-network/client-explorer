import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  getProvider,
  requestAccounts,
  onAccountsChanged,
  onChainChanged,
  disconnect,
} from '../api/walletApi';

export interface WalletState {
  /** Whether the extension is present at all. */
  isInstalled: boolean;
  isConnected: boolean;
  accounts: string[];
  chainId: string | null;
  error: string | null;
  connect: () => Promise<string[]>;
  disconnect: () => Promise<void>;
  primaryAccount: string | null;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = getProvider();
    setIsInstalled(!!provider);

    if (provider) {
      setIsConnected(provider.isConnected());
      provider.request({ method: 'accounts' })
        .then((result) => setAccounts((result as string[]) || []))
        .catch(() => setAccounts([]));

      provider.request({ method: 'chainId' })
        .then((result) => setChainId(result as string))
        .catch(() => setChainId(null));
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return undefined;

    const unsubAccounts = onAccountsChanged((result) => {
      const next = (result as string[]) || [];
      setAccounts(next);
      setIsConnected(next.length > 0);
    });

    const unsubChain = onChainChanged((result) => {
      setChainId(result as string);
    });

    return () => {
      unsubAccounts();
      unsubChain();
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const next = await requestAccounts();
      setAccounts(next || []);
      setIsConnected(next.length > 0);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setAccounts([]);
      setIsConnected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, []);

  const value: WalletState = {
    isInstalled,
    isConnected,
    accounts,
    chainId,
    error,
    connect,
    disconnect: disconnectWallet,
    primaryAccount: accounts[0] ?? null,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext(): WalletState {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

export default WalletContext;