const WARTHOG_ERRORS = {
  USER_REJECTED: { code: 4001, message: 'User rejected the request' },
  UNAUTHORIZED: { code: 4100, message: 'Unauthorized - please connect first' },
  CHAIN_NOT_FOUND: { code: 4900, message: 'Chain not found' },
  INTERNAL_ERROR: { code: -32603, message: 'Internal error' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
};

export function getProvider() {
  return window.warthog;
}

export function isWalletConnected() {
  const provider = getProvider();
  return provider?.isConnected() ?? false;
}

export async function requestAccounts() {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({ method: 'requestAccounts' });
}

export async function getAccounts() {
  const provider = getProvider();
  if (!provider) {
    return [];
  }
  return provider.request({ method: 'accounts' });
}

export async function getChainId() {
  const provider = getProvider();
  if (!provider) {
    return null;
  }
  return provider.request({ method: 'chainId' });
}

export async function transferWart(to, amount) {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({
    method: 'transferWart',
    params: { to, amount },
  });
}

export async function sendTransaction(to, amount) {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({
    method: 'sendTransaction',
    params: { to, amount },
  });
}

export async function openSendPage(to) {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({
    method: 'openSendPage',
    params: { to },
  });
}

export function onAccountsChanged(callback) {
  const provider = getProvider();
  if (!provider) {
    return () => {};
  }
  return provider.on('accountsChanged', callback);
}

export function onChainChanged(callback) {
  const provider = getProvider();
  if (!provider) {
    return () => {};
  }
  return provider.on('chainChanged', callback);
}

export async function disconnect() {
  const provider = getProvider();
  if (!provider) {
    return;
  }
  return provider.disconnect();
}

export { WARTHOG_ERRORS };
