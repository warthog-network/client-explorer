const DEFAULT_NODE = 'localhost:3101';

function getNodeUrl() {
  return localStorage.getItem('explorer_node') || DEFAULT_NODE;
}

function setNodeUrl(url) {
  localStorage.setItem('explorer_node', url);
}

function normalizeUrl(input) {
  if (!input) return DEFAULT_NODE;
  input = input.trim();
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input.replace(/^https?:\/\//, '');
  }
  return input;
}

async function apiRequest(endpoint, options = {}) {
  const baseUrl = getNodeUrl();
  const url = `http://${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  if (json.code !== 0) {
    throw new Error(json.message || 'API Error');
  }

  return json.data;
}

export const nodeApi = {
  getNodeUrl,
  setNodeUrl,
  normalizeUrl,
  DEFAULT_NODE,

  getChainHead: () => apiRequest('/chain/head').then(data => ({ ...data.chainHead, synced: data.synced })),

  getBlock: (id) => apiRequest(`/chain/block/${id}`),

  getHashrate: (window = 100) => apiRequest(`/chain/hashrate/${window}`),

  getHashrateChart: (from, to, interval = 3600) =>
    apiRequest(`/chart/hashrate/time/${from}/${to}/${interval}`),

  getTransaction: (txid) => apiRequest(`/transaction/lookup/${txid}`),

  getMempool: () => apiRequest('/transaction/mempool'),

  getAccountWartBalance: (account) => apiRequest(`/account/${account}/wart_balance`),

  getAccountHistory: (account, beforeId = Number.MAX_SAFE_INTEGER) =>
    apiRequest(`/account/${account}/history/${beforeId}`),

  getAsset: (asset) => apiRequest(`/asset/lookup/${asset}`),

  getAssets: (namePrefix = '', hashPrefix = '') => {
    const params = new URLSearchParams();
    if (namePrefix) params.append('namePrefix', namePrefix);
    if (hashPrefix) params.append('hashPrefix', hashPrefix);
    const query = params.toString();
    return apiRequest(`/asset/complete${query ? `?${query}` : ''}`);
  },

  getRichlist: (tokenspec) => apiRequest(`/account/richlist/${tokenspec}`),

  getNodeInfo: () => apiRequest('/tools/info'),
};

export default nodeApi;