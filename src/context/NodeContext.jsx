import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import nodeApi from '../api/nodeApi';

const NodeContext = createContext(null);

export function NodeProvider({ children }) {
  const [nodeUrl, setNodeUrlState] = useState(nodeApi.getNodeUrl());
  const [error, setError] = useState(null);

  const setNodeUrl = useCallback((url) => {
    const normalized = nodeApi.normalizeUrl(url);
    nodeApi.setNodeUrl(normalized);
    setNodeUrlState(normalized);
    setError(null);
  }, []);

  const testConnection = useCallback(async (url) => {
    const normalized = nodeApi.normalizeUrl(url);
    try {
      await nodeApi.getChainHead();
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to connect');
      return false;
    }
  }, []);

  useEffect(() => {
    nodeApi.setNodeUrl(nodeUrl);
  }, [nodeUrl]);

  const value = {
    nodeUrl,
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

export function useNode() {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error('useNode must be used within a NodeProvider');
  }
  return context;
}

export default NodeContext;