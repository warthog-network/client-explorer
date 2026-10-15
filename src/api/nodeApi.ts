import { NODES } from '../config/nodes';
import type {
  NodeActionsByBlock,
  NodeAssetDetail,
  NodeAssetSearchResult,
  NodeBlock,
  NodeCandle,
  NodeChainHead,
  NodeChainHeadSynced,
  NodeHashrateInfo,
  NodeHashrateTimeChart,
  NodeInfoResult,
  NodeMarketDetails,
  NodeMempoolEntry,
  NodeRichlistResult,
  NodeTokenBalanceLookup,
  NodeTrade,
  NodeTransactionDetails,
  NodeWartBalanceResult,
} from '../types/node.js';

const DEFAULT_NODE = NODES[0]?.url.replace(/^https?:\/\//, '') ?? 'localhost:3101';

function getNodeUrl(): string {
  return localStorage.getItem('explorer_node') || DEFAULT_NODE;
}

function setNodeUrl(url: string): void {
  localStorage.setItem('explorer_node', url);
}

function normalizeUrl(input: string | null | undefined): string {
  if (!input) return DEFAULT_NODE;
  input = input.trim();
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input.replace(/^https?:\/\//, '');
  }
  return input;
}

/**
 * The envelope every endpoint wraps its payload in.
 *
 * The failure field is `error`, not `message`. Verified against a live node:
 * `GET /account/notanaddress/wart_balance` returns
 * `{"code":94,"error":"Invalid API arguments"}`.
 */
type NodeJson<T> = {
  code: number;
  data?: T;
  error?: string;
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  const json = (await response.json()) as NodeJson<T>;

  if (json.code !== 0) {
    throw new Error(json.error || `API Error (code ${json.code})`);
  }

  return json.data as T;
}

/**
 * `/chain/head` flattened: the head fields inline, plus `synced`.
 *
 * `synced` is optional because the schema registry declares no `required`
 * fields. The node does send it on every response; see the optionality note in
 * `types/node.ts`.
 */
export type NodeChainHeadFlattened = NodeChainHead & { synced?: boolean };

export const nodeApi = {
  getNodeUrl,
  setNodeUrl,
  normalizeUrl,
  DEFAULT_NODE,

  getChainHead: (): Promise<NodeChainHeadFlattened> =>
    apiRequest<NodeChainHeadSynced>('/chain/head')
      .then((data) => ({ ...data.chainHead, synced: data.synced })),

  getBlock: (id: number | string): Promise<NodeBlock> =>
    apiRequest(`/chain/block/${id}`),

  getHashrate: (window = 100): Promise<NodeHashrateInfo> =>
    apiRequest(`/chain/hashrate/${window}`),

  getHashrateChart: (from: number, to: number, interval = 3600): Promise<NodeHashrateTimeChart> =>
    apiRequest(`/chart/hashrate/time/${from}/${to}/${interval}`),

  getTrades: (asset: string, n = 1): Promise<NodeTrade[]> =>
    apiRequest(`/chart/trades/${asset}?n=${n}`),

  getCandles: (asset: string, interval = '1h', n = 100): Promise<NodeCandle[]> =>
    apiRequest(`/chart/candles/${asset}/${interval}?n=${n}`),

  getCandlesInRange: (asset: string, interval: string, from: number, to: number): Promise<NodeCandle[]> =>
    apiRequest(`/chart/candles/${asset}/${interval}?from=${from}&to=${to}`),

  getCandlesBefore: (asset: string, interval: string, beforeBound: number, n = 200): Promise<NodeCandle[]> =>
    apiRequest(`/chart/candles/${asset}/${interval}?to=${beforeBound}&n=${n}`),

  getCandlesAfter: (asset: string, interval: string, afterBound: number, n = 200): Promise<NodeCandle[]> =>
    apiRequest(`/chart/candles/${asset}/${interval}?from=${afterBound}&n=${n}`),

  getTransaction: (txid: string): Promise<NodeTransactionDetails> =>
    apiRequest(`/transaction/lookup/${txid}`),

  getMempool: (): Promise<NodeMempoolEntry[]> =>
    apiRequest('/transaction/mempool'),

  getAccountWartBalance: (account: string): Promise<NodeWartBalanceResult> =>
    apiRequest(`/account/${account}/wart_balance`),

  /**
   * `beforeId` defaults to the top of the history table. Each response's
   * `fromId` is the lowest id on the page and is the correct cursor for the
   * next call, since the node filters on `h.id < beforeId`.
   */
  getAccountHistory: (account: string, beforeId = Number.MAX_SAFE_INTEGER): Promise<NodeActionsByBlock> =>
    apiRequest(`/account/${account}/history/${beforeId}`),

  getAsset: (asset: string): Promise<NodeAssetDetail> =>
    apiRequest(`/asset/lookup/${asset}`),

  getAssets: (namePrefix = '', hashPrefix = ''): Promise<NodeAssetSearchResult> => {
    const params = new URLSearchParams();
    if (namePrefix) params.append('namePrefix', namePrefix);
    if (hashPrefix) params.append('hashPrefix', hashPrefix);
    const query = params.toString();
    return apiRequest(`/asset/complete${query ? `?${query}` : ''}`);
  },

  getRichlist: (tokenspec: string): Promise<NodeRichlistResult> =>
    apiRequest(`/account/richlist/${tokenspec}`),

  getMarket: (asset: string): Promise<NodeMarketDetails> =>
    apiRequest(`/dex/market/${asset}`),

  getAccountTokenBalance: (account: string, tokenspec: string): Promise<NodeWartBalanceResult | NodeTokenBalanceLookup> => {
    if (tokenspec === 'WART') {
      return apiRequest(`/account/${account}/wart_balance`);
    }
    return apiRequest(`/account/${account}/balance/${tokenspec}`);
  },

  getNodeInfo: (): Promise<NodeInfoResult> =>
    apiRequest('/tools/info'),
};

export default nodeApi;