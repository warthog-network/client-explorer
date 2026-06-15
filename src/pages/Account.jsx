import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaWallet, FaHistory, FaSearch, FaChevronDown, FaTimes, FaPaperPlane } from 'react-icons/fa';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import nodeApi from '../api/nodeApi';
import TransactionRow from '../components/TransactionRow';
import { formatWart, formatNumber, formatAddress } from '../utils/format';
import { useNode } from '../context/NodeContext';
import CopyableAddress from '../components/CopyableAddress';
import CopyableValue from '../components/CopyableValue';
import BalanceRow from '../components/BalanceRow';
import { useWallet, openSendPage, isWalletConnected } from '../wallet-sdk';

const RECENT_TOKENS_KEY = 'recent_tokens';
const MAX_RECENT = 5;

function TokenSelector({ selectedToken, onSelect, recentTokens }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [byName, byHash] = await Promise.all([
          nodeApi.getAssets(searchQuery, ''),
          nodeApi.getAssets('', searchQuery),
        ]);
        const merged = [...(byName.matches || []), ...(byHash.matches || [])];
        const unique = merged.filter((t, i, a) => a.findIndex(x => x.hash === t.hash) === i);
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

  const handleSelect = (token) => {
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
                  onClick={() => handleSelect({ spec: 'asset', name: token.name, hash: token.hash })}
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
                onClick={() => handleSelect({ spec: 'WART', name: 'WART', hash: null })}
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
  const { address, tokenspec } = useParams();
  const navigate = useNavigate();
  const { nodeKey } = useNode();
  const { isConnected, accounts } = useWallet();
  const [balance, setBalance] = useState(null);
  const [liquidityBalance, setLiquidityBalance] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState({ spec: 'WART', name: 'WART', hash: null });
  const [recentTokens, setRecentTokens] = useState([]);

  const isOwnAccount = accounts.includes(address);

  const addressToSeed = (addr) => parseInt(addr.slice(0, 8), 16);

  const handleSend = () => {
    openSendPage(address);
  };

  const parseTokenSpec = (spec, recentList) => {
    if (!spec || spec === 'WART') return { spec: 'WART', name: 'WART', hash: null };
    const parts = spec.split(':');
    if (parts.length >= 2) {
      const hash = parts[1];
      const recent = recentList.find(t => t.hash === hash);
      if (recent) {
        return { spec: parts[0], name: recent.name, hash };
      }
      return { spec: parts[0], name: hash.substring(0, 12) + '...', hash };
    }
    return { spec: 'WART', name: 'WART', hash: null };
  };

  const getRecentTokens = () => {
    const saved = localStorage.getItem(RECENT_TOKENS_KEY);
    return saved ? JSON.parse(saved) : [];
  };

  const fetchBalance = async (token) => {
    const tokenSpec = token.hash ? `${token.spec}:${token.hash}` : 'WART';
    try {
      const balanceData = await nodeApi.getAccountTokenBalance(address, tokenSpec);
      setBalance(balanceData);

      if (token.hash) {
        const recent = JSON.parse(localStorage.getItem(RECENT_TOKENS_KEY) || '[]');
        const filtered = recent.filter(t => t.hash !== token.hash);
        const updated = [token, ...filtered].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_TOKENS_KEY, JSON.stringify(updated));
        setRecentTokens(updated);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const fetchData = async (tokenToFetch) => {
    setLoading(true);
    setError(null);
    try {
      const tokenSpec = tokenToFetch.hash ? `${tokenToFetch.spec}:${tokenToFetch.hash}` : 'WART';
      const isNonWart = tokenToFetch.hash !== null;

      const wartBalanceResult = await nodeApi.getAccountWartBalance(address);
      const accountExists = !!wartBalanceResult.account;

      const fetchPromises = [
        nodeApi.getAccountTokenBalance(address, tokenSpec),
      ];
      if (accountExists) {
        fetchPromises.push(nodeApi.getAccountHistory(address));
      }
      if (isNonWart) {
        fetchPromises.push(nodeApi.getAccountTokenBalance(address, `liquidity:${tokenToFetch.hash}`));
      }
      const results = await Promise.all(fetchPromises);
      setBalance(results[0]);
      setHistory(accountExists ? results[1] : []);
      if (isNonWart) {
        setLiquidityBalance(results[2]);
      } else {
        setLiquidityBalance(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch account data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenspec) {
      const parsed = parseTokenSpec(tokenspec, getRecentTokens());
      setSelectedToken(parsed);
      fetchData(parsed);
    } else {
      const defaultToken = { spec: 'WART', name: 'WART', hash: null };
      setSelectedToken(defaultToken);
      fetchData(defaultToken);
    }
  }, [address, tokenspec, nodeKey]);

  useEffect(() => {
    setRecentTokens(getRecentTokens());
  }, []);

  const handleTokenSelect = (token) => {
    if (token.hash) {
      const recent = JSON.parse(localStorage.getItem(RECENT_TOKENS_KEY) || '[]');
      const filtered = recent.filter(t => t.hash !== token.hash);
      const updated = [token, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_TOKENS_KEY, JSON.stringify(updated));
      setRecentTokens(updated);
    }
    const newPath = token.hash ? `/address/${address}/${token.spec}:${token.hash}` : `/address/${address}`;
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
  const { account, wart } = balance;
  const tokenBalance = isWart ? wart : balance.balance;
  const tokenName = isWart ? 'WART' : selectedToken.name;
  const unitDisplay = isWart ? 'WART' : selectedToken.name;

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
          <Jazzicon diameter={32} seed={addressToSeed(address)} />
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
          onClick={fetchData}
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
          {history?.perBlock?.map((blockData) => {
            const { header, body, height, confirmations } = blockData;

            const txTypes = [
              { key: 'wartTransfer', label: 'WART Transfer' },
              { key: 'tokenTransfer', label: 'Token Transfer' },
              { key: 'limitSwap', label: 'Limit Order' },
              { key: 'match', label: 'DEX Match' },
              { key: 'liquidityDeposit', label: 'Liquidity Deposit' },
              { key: 'liquidityWithdrawal', label: 'Liquidity Withdrawal' },
              { key: 'assetCreation', label: 'Asset Creation' },
              { key: 'cancelation', label: 'Cancelation' },
            ];

            const allTxs = [];
            if (body.reward) {
              allTxs.push({ tx: body.reward, type: 'reward', height, confirmations });
            }
            txTypes.forEach(({ key }) => {
              const txs = body[key];
              if (txs && txs.length > 0) {
                txs.forEach((tx) => {
                  allTxs.push({ tx, type: key, height, confirmations });
                });
              }
            });

            return allTxs.map(({ tx, type }, idx) => (
              <TransactionRow
                key={tx.transaction?.hash || tx.hash || `${height}-${idx}`}
                tx={tx}
                type={type}
                showBlockLink={true}
                blockHeight={height}
                confirmations={confirmations}
              />
            ));
          })}
        </div>

        {history?.fromId > 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                try {
                  const moreHistory = await nodeApi.getAccountHistory(address, history.fromId);
                  setHistory((prev) => ({
                    ...prev,
                    perBlock: [...prev.perBlock, ...moreHistory.perBlock],
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