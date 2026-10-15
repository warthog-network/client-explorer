import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import nodeApi from '../api/nodeApi';

export interface NodeState {
  nodeUrl: string;
  /** Bumped on every node change, so consumers can key off it to refetch. */
  nodeKey: number;
  error: string | null;
  setNodeUrl: (url: string) => void;
  testConnection: (url: string) => Promise<boolean>;
  clearError: () => void;
}

const NodeContext = createContext<NodeState | null>(null);

export function NodeProvider({ children }: { children: ReactNode }) {
  const [nodeUrl, setNodeUrlState] = useState(nodeApi.getNodeUrl());
  const [nodeKey, setNodeKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const setNodeUrl = useCallback((url: string) => {
    const normalized = nodeApi.normalizeUrl(url);
    nodeApi.setNodeUrl(normalized);
    setNodeUrlState(normalized);
    setNodeKey((k) => k + 1);
    setError(null);
  }, []);

  const testConnection = useCallback(async (url: string) => {
    nodeApi.normalizeUrl(url);
    try {
      await nodeApi.getChainHead();
      setError(null);
      return true;
    } catch {
      setError('Failed to connect');
      return false;
    }
  }, []);

  useEffect(() => {
    nodeApi.setNodeUrl(nodeUrl);
  }, [nodeUrl]);

  const value: NodeState = {
    nodeUrl,
    nodeKey,
    setNodeUrl,
    testConnection,
    error,
    clearError: () => setError(null),
  };

  return (
    <NodeContext.Provider value={value}>
      {children}
    </NodeContext.Provider>
  );
}

export function useNode(): NodeState {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error('useNode must be used within a NodeProvider');
  }
  return context;
}

export default NodeContext;