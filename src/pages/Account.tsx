import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaHistory, FaSearch, FaChevronDown, FaPaperPlane } from 'react-icons/fa';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import nodeApi from '../api/nodeApi';
import TransactionRow from '../components/TransactionRow';
import { formatNumber, formatAddress } from '../utils/format';
import { useNode } from '../context/NodeContext';
import CopyableAddress from '../components/CopyableAddress';
import BalanceRow from '../components/BalanceRow';
import { useWallet, openSendPage } from '../wallet-sdk';
import type {
  DisplayTransaction,
  NodeActionsByBlock,
  NodeAssetDetail,
  NodeBlock,
  NodeBlockBody,
  NodeHistoryEntry,
  NodeTokenBalanceLookup,
  NodeWartBalanceResult,
} from '../types/node';

const RECENT_TOKENS_KEY = 'recent_tokens';
const MAX_RECENT = 5;

/** A token selection: either native WART or an issued asset by hash. */
interface SelectedToken {
  spec: string;
  name: string;
  hash: string | null;
}

const WART_TOKEN: SelectedToken = { spec: 'WART', name: 'WART', hash: null };

/** Either balance shape: WART carries `E8`, an asset carries `u64`. */
type AnyBalanceResult = NodeWartBalanceResult | NodeTokenBalanceLookup;

type ArrayBodyKey = Exclude<keyof NodeBlockBody, 'reward'>;

const HISTORY_GROUPS: Array<{ key: ArrayBodyKey; label: string }> = [
  { key: 'wartTransfer', label: 'WART Transfer' },
  { key: 'tokenTransfer', label: 'Token Transfer' },
  { key: 'limitSwap', label: 'Limit Order' },
  { key: 'match', label: 'DEX Match' },
  { key: 'liquidityDeposit', label: 'Liquidity Deposit' },
  { key: 'liquidityWithdrawal', label: 'Liquidity Withdrawal' },
  { key: 'assetCreation', label: 'Asset Creation' },
  { key: 'cancelation', label: 'Cancelation' },
];

/** A block's transactions, flattened for TransactionRow. */
interface FlatTx {
  tx: DisplayTransaction;
  type: string;
  height?: number;
  confirmations?: number;
}

/** `reward` is a single nullable object; every other group is an array. */
function flattenBlock(
  body: NodeBlockBody,
  height?: number,
  confirmations?: number,
): FlatTx[] {
  const out: FlatTx[] = [];
  if (body.reward) {
    out.push({ tx: body.reward as DisplayTransaction, type: 'reward', height, confirmations });
  }
  for (const { key } of HISTORY_GROUPS) {
    const entries = (body[key] ?? []) as NodeHistoryEntry[];
    for (const tx of entries) {
      out.push({ tx, type: key, height, confirmations });
    }
  }
  return out;
}

function getRecentTokens(): SelectedToken[] {
  const saved = localStorage.getItem(RECENT_TOKENS_KEY);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as SelectedToken[]) : [];
  } catch {
    return [];
  }
}

/** Push a token to the front of the recent list, de-duplicating by hash. */
function rememberToken(token: SelectedToken): SelectedToken[] {
  const filtered = getRecentTokens().filter((t) => t.hash !== token.hash);
  return [token, ...filtered].slice(0, MAX_RECENT);
}

function TokenSelector({
  selectedToken,
  onSelect,
  recentTokens,
}: {
  selectedToken: SelectedToken;
  onSelect: (token: SelectedToken) => void;
  recentTokens: SelectedToken[];
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NodeAssetDetail[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [byName, byHash] = await Promise.all([
          nodeApi.getAssets(searchQuery, ''),
          nodeApi.getAssets('', searchQuery),
        ]);
        const merged = [...(byName.matches || []), ...(byHash.matches || [])];
        const unique = merged.filter((t, i, a) => a.findIndex((x) => x.hash === t.hash) === i);
        setSearchResults(unique.slice(0, 20));
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (token: SelectedToken) => {
    onSelect(token);
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const displayName = selectedToken.hash
    ? `${selectedToken.name} (${formatAddress(selectedToken.hash, 8)})`
    : 'WART';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-left flex items-center justify-between hover:bg-white/15 transition-colors"
      >
        <span className="text-primary font-medium">{displayName}</span>
        <FaChevronDown className={`text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/20 rounded-xl overflow-hidden z-50 backdrop-blur-md">
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {!searchQuery && recentTokens.length > 0 && (
              <div>
                <div className="px-3 py-1 text-xs text-white/40 uppercase tracking-wider">Recent</div>
                {recentTokens.map((token) => (
                  <button
                    key={token.hash || 'wart'}
                    onClick={() => handleSelect(token)}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2"
                  >
                    <span className={token.hash ? 'text-primary' : 'text-yellow-400'}>
                      {token.name}
                    </span>
                    {token.hash && (
                      <span className="text-white/40 text-xs font-mono">
                        ({formatAddress(token.hash, 6)})
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-white/10 mt-1" />
              </div>
            )}

            <div>
              <div className="px-3 py-1 text-xs text-white/40 uppercase tracking-wider">Search Results</div>
              {searchLoading && (
                <div className="px-3 py-2 text-white/50 text-sm">Searching...</div>
              )}
              {!searchLoading && searchResults.length === 0 && searchQuery && (
                <div className="px-3 py-2 text-white/50 text-sm">No tokens found</div>
              )}
              {!searchLoading && searchResults.map((token) => (
                <button
                  key={token.hash}
                  onClick={() => handleSelect({ spec: 'asset', name: token.name ?? '', hash: token.hash ?? null })}
                  className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2"
                >
                  <span className="text-primary">{token.name}</span>
                  <span className="text-white/40 text-xs font-mono">
                    ({formatAddress(token.hash, 6)})
                  </span>
                </button>
              ))}
            </div>

            {!searchQuery && (
              <button
                onClick={() => handleSelect(WART_TOKEN)}
                className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 border-t border-white/10"
              >
                <span className="text-yellow-400 font-semibold">WART</span>
                <span className="text-white/40 text-xs">(native currency)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Account() {
  const { address, tokenspec } = useParams<{ address: string; tokenspec?: string }>();
  const navigate = useNavigate();
  const { nodeKey } = useNode();
  const { isConnected, accounts } = useWallet();
  const [balance, setBalance] = useState<AnyBalanceResult | null>(null);
  const [liquidityBalance, setLiquidityBalance] = useState<NodeTokenBalanceLookup | null>(null);
  const [history, setHistory] = useState<NodeActionsByBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<SelectedToken>(WART_TOKEN);
  const [recentTokens, setRecentTokens] = useState<SelectedToken[]>([]);

  const isOwnAccount = accounts.includes(address ?? '');

  const addressToSeed = (addr: string) => parseInt(addr.slice(0, 8), 16);

  const handleSend = () => {
    openSendPage(address ?? '');
  };

  /** Turn a `spec:hash` route segment into a selection, preferring a known name. */
  const parseTokenSpec = (spec: string | undefined, recentList: SelectedToken[]): SelectedToken => {
    if (!spec || spec === 'WART') return WART_TOKEN;
    const parts = spec.split(':');
    if (parts.length >= 2) {
      const hash = parts[1] as string;
      const recent = recentList.find((t) => t.hash === hash);
      if (recent) {
        return { spec: parts[0] as string, name: recent.name, hash };
      }
      return { spec: parts[0] as string, name: `${hash.substring(0, 12)}...`, hash };
    }
    return WART_TOKEN;
  };

  const fetchData = async (tokenToFetch: SelectedToken) => {
    setLoading(true);
    setError(null);
    try {
      const addr = address ?? '';
      const tokenSpec = tokenToFetch.hash ? `${tokenToFetch.spec}:${tokenToFetch.hash}` : 'WART';
      const isNonWart = tokenToFetch.hash !== null;

      const wartBalanceResult = await nodeApi.getAccountWartBalance(addr);
      const accountExists = !!wartBalanceResult.account;

      const fetchPromises: Array<Promise<unknown>> = [
        nodeApi.getAccountTokenBalance(addr, tokenSpec),
      ];
      if (accountExists) {
        fetchPromises.push(nodeApi.getAccountHistory(addr));
      }
      if (isNonWart) {
        fetchPromises.push(nodeApi.getAccountTokenBalance(addr, `liquidity:${tokenToFetch.hash}`));
      }
      const results = await Promise.all(fetchPromises);
      setBalance(results[0] as AnyBalanceResult);
      // A non-existent account has no history. That is an empty page, not a
      // list: the previous `[]` left `perBlock` undefined, so the "no
      // transactions" message never rendered for exactly the case it exists for.
      setHistory(accountExists ? results[1] as NodeActionsByBlock : { perBlock: [], fromId: 0 });
      setLiquidityBalance(isNonWart ? results[2] as NodeTokenBalanceLookup : null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const parsed = parseTokenSpec(tokenspec, getRecentTokens());
    setSelectedToken(parsed);
    fetchData(parsed);
  }, [address, tokenspec, nodeKey]);

  useEffect(() => {
    setRecentTokens(getRecentTokens());
  }, []);

  const handleTokenSelect = (token: SelectedToken) => {
    if (token.hash) {
      const updated = rememberToken(token);
      localStorage.setItem(RECENT_TOKENS_KEY, JSON.stringify(updated));
      setRecentTokens(updated);
    }
    const newPath = token.hash
      ? `/address/${address}/${token.spec}:${token.hash}`
      : `/address/${address}`;
    navigate(newPath, { replace: true });
  };

  if (loading && !balance) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading account...</span>
        </div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-error text-center">
          <p>{error || 'Account not found'}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Back
        </button>
      </div>
    );
  }

  const isWart = selectedToken.hash === null;
  const wartBalance = (balance as NodeWartBalanceResult).wart;
  const assetBalance = (balance as NodeTokenBalanceLookup).balance;
  const tokenBalance = isWart ? wartBalance : assetBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-white/70" size={20} />
        </button>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Jazzicon diameter={32} seed={addressToSeed(address ?? '')} />
          Account
          <CopyableAddress address={address} />
        </h1>
        {!isOwnAccount && (
          isConnected ? (
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors"
            >
              <FaPaperPlane size={14} />
              Send
            </button>
          ) : (
            <span className="text-white/40 text-sm">Connect wallet to send</span>
          )
        )}
        <button
          onClick={() => fetchData(selectedToken)}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="mb-4">
          <TokenSelector selectedToken={selectedToken} onSelect={handleTokenSelect} recentTokens={recentTokens} />
        </div>

        <div className="text-xs text-white/40 uppercase tracking-wider mb-2 px-1">Balances</div>

        {isWart ? (
          <div className="space-y-2">
            <div className="flex items-center text-xs text-white/40 uppercase tracking-wider px-1">
              <span className="w-20">Type</span>
              <span className="flex-1">WART</span>
            </div>
            <BalanceRow label="Total" value={tokenBalance?.total} unit="WART" unitLink="/asset/wart" color="text-primary" />
            <BalanceRow label="Locked" value={tokenBalance?.locked} unit="WART" unitLink="/asset/wart" color="text-primary" />
            <BalanceRow label="Mempool" value={tokenBalance?.mempool} unit="WART" unitLink="/asset/wart" color="text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center text-xs text-white/40 uppercase tracking-wider px-1">
              <span className="w-20">Type</span>
              <span className="flex-1">Asset</span>
              <span className="flex-1">Liquidity</span>
            </div>
            <BalanceRow label="Total" value={tokenBalance?.total} unit={selectedToken.name} unitLink={`/asset/${selectedToken.hash}/`} liqValue={liquidityBalance?.balance?.total} liqUnit="LP" liqUnitLink={`/asset/${selectedToken.hash}/liquidity`} color="text-primary" />
            <BalanceRow label="Locked" value={tokenBalance?.locked} unit={selectedToken.name} unitLink={`/asset/${selectedToken.hash}/`} liqValue={liquidityBalance?.balance?.locked} liqUnit="LP" liqUnitLink={`/asset/${selectedToken.hash}/liquidity`} color="text-white" />
            <BalanceRow label="Mempool" value={tokenBalance?.mempool} unit={selectedToken.name} unitLink={`/asset/${selectedToken.hash}/`} liqValue={liquidityBalance?.balance?.mempool} liqUnit="LP" liqUnitLink={`/asset/${selectedToken.hash}/liquidity`} color="text-primary" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FaHistory className="text-primary" />
          Transaction History
        </h3>

        {history?.perBlock?.length === 0 && (
          <div className="text-center text-white/50 py-8">No transactions found</div>
        )}

        <div className="space-y-3">
          {history?.perBlock?.map((blockData) => (
            <FlatBlockRows key={blockData.height ?? formatNumber(blockData.height)} blockData={blockData} />
          ))}
        </div>

        {(history?.fromId ?? 0) > 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                try {
                  const moreHistory = await nodeApi.getAccountHistory(address ?? '', history?.fromId);
                  setHistory((prev) => ({
                    ...(prev ?? { perBlock: [], fromId: 0 }),
                    perBlock: [...(prev?.perBlock ?? []), ...(moreHistory.perBlock ?? [])],
                    fromId: moreHistory.fromId,
                  }));
                } catch (err) {
                  console.error('Failed to load more:', err);
                }
              }}
              className="px-6 py-2 bg-primary text-black font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** The transaction hash, whether the entry wraps a transaction or is one. */
function txHashOf(tx: DisplayTransaction): string | undefined {
  if ('transaction' in tx) return tx.transaction?.hash;
  return 'hash' in tx ? tx.hash : undefined;
}

/** Renders every transaction in one history block. */
function FlatBlockRows({ blockData }: { blockData: NodeBlock }) {
  const { body, height, confirmations } = blockData;
  if (!body) return null;
  return (
    <>
      {flattenBlock(body, height, confirmations).map(({ tx, type }, idx) => (
        <TransactionRow
          key={txHashOf(tx) || `${height}-${idx}`}
          tx={tx}
          type={type}
          showBlockLink={true}
          blockHeight={height}
          confirmations={confirmations}
        />
      ))}
    </>
  );
}