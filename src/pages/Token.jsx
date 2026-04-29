import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaCoins, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import { useNode } from '../context/NodeContext';
import { formatAddress } from '../utils/format';

export default function Token() {
  const { tokenspec } = useParams();
  const navigate = useNavigate();
  const { nodeKey } = useNode();
  const [asset, setAsset] = useState(null);
  const [richlist, setRichlist] = useState(null);
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseTokenSpec = (spec) => {
    if (!spec) return { specifier: 'asset', hash: '' };
    const parts = spec.split(':');
    if (parts.length >= 2) {
      const hash = parts.slice(1).join(':');
      return { specifier: parts[0], hash };
    }
    return { specifier: 'asset', hash: spec };
  };

  const { specifier, hash } = parseTokenSpec(tokenspec);
  const isLiquidity = specifier === 'liquidity';

  const toggleSpec = () => {
    const newSpecifier = isLiquidity ? 'asset' : 'liquidity';
    navigate(`/token/${newSpecifier}:${hash}`);
  };

  const fetchData = async () => {
    if (!hash) {
      setError('Invalid token spec');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [assetData, richlistData] = await Promise.all([
        nodeApi.getAsset(hash),
        nodeApi.getRichlist(tokenspec),
      ]);
      setAsset(assetData);
      setRichlist(richlistData);
    } catch (err) {
      setError(err.message || 'Failed to fetch token');
      setLoading(false);
      return;
    }

    if (!isLiquidity) {
      try {
        const marketData = await nodeApi.getMarket(hash);
        setMarket(marketData);
      } catch (marketErr) {
        console.warn('Market data unavailable:', marketErr);
        setMarket(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tokenspec, nodeKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading token...</span>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4">
        <div className="text-error text-center">
          <p>{error || 'Token not found'}</p>
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
          <FaCoins className="text-primary" />
          Token
        </h1>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isLiquidity ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
          {isLiquidity ? 'Liquidity' : 'Asset'}
        </span>
        <button
          onClick={fetchData}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleSpec}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
            isLiquidity
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Asset
        </button>
        <button
          onClick={toggleSpec}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
            !isLiquidity
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Liquidity
        </button>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Name</div>
              <div className="text-white">{asset.name}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">ID</div>
              <div className="text-white">{asset.id}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Token Spec</div>
              <div className="text-sm text-white font-mono">{tokenspec}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Creation:</span>
              <Link to={`/tx/${hash}`} className="text-xs text-primary hover:underline">
                View Transaction
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Total Supply</div>
              <div className="text-white">{asset.totalSupply?.str}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Decimals</div>
              <div className="text-white">{asset.decimals}</div>
            </div>
          </div>

          {asset.ownerAccountId && (
            <div>
              <div className="text-xs text-white/50 mb-1">Owner Account ID</div>
              <div className="text-white">{asset.ownerAccountId}</div>
            </div>
          )}

          <div>
            <div className="text-xs text-white/50 mb-1">Height</div>
            <div className="text-white">{asset.height}</div>
          </div>
        </div>
      </div>

      {market?.liquidityPool && !isLiquidity && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">Liquidity Pool</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Asset Pool</div>
              <div className="text-white font-mono">{market.liquidityPool.asset.str} {asset.name}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">WART Pool</div>
              <div className="text-white font-mono">{market.liquidityPool.wart.str} WART</div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Total Shares</div>
              <div className="text-white font-mono">{market.liquidityPool.shares.str}</div>
            </div>
          </div>
        </div>
      )}

      {market && !isLiquidity && (
        <div className="space-y-4">
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <FaArrowDown className="text-green-400" />
              <h3 className="text-sm font-semibold text-white">Buy Orders</h3>
              <span className="text-xs text-white/50">({market.wartToAssetSwaps?.length || 0} orders)</span>
            </div>
            <div className="flex items-center justify-between px-3 mb-2 text-xs text-white/40 uppercase tracking-wider">
              <span>Price</span>
              <span>Amount</span>
              <span>Filled</span>
              <span>Status</span>
              <span>Tx</span>
            </div>
            {market.wartToAssetSwaps?.length > 0 ? (
              <div className="space-y-1">
                {market.wartToAssetSwaps.slice(0, 20).map((order, idx) => (
                  <div
                    key={order.txHash}
                    className={`flex items-center justify-between py-2 px-3 rounded ${
                      idx === 0 ? 'bg-green-500/10 border-l-2 border-green-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-green-400 font-mono text-sm">
                      {order.limit.doubleAdjusted.toFixed(6)} WART/{asset.name}
                    </span>
                    <span className="text-white/70 font-mono text-sm">{order.amount.str}</span>
                    <span className="text-white/50 font-mono text-sm">{order.filled.str}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${order.inMempool ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {order.inMempool ? 'Mempool' : 'Confirmed'}
                    </span>
                    <Link to={`/tx/${order.txHash}`} className="text-primary hover:underline font-mono text-xs">
                      {formatAddress(order.txHash, 6)}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/50 text-sm py-2">No buy orders</div>
            )}
          </div>

          <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <FaArrowUp className="text-red-400" />
              <h3 className="text-sm font-semibold text-white">Sell Orders</h3>
              <span className="text-xs text-white/50">({market.assetToWartSwaps?.length || 0} orders)</span>
            </div>
            <div className="flex items-center justify-between px-3 mb-2 text-xs text-white/40 uppercase tracking-wider">
              <span>Price</span>
              <span>Amount</span>
              <span>Filled</span>
              <span>Status</span>
              <span>Tx</span>
            </div>
            {market.assetToWartSwaps?.length > 0 ? (
              <div className="space-y-1">
                {market.assetToWartSwaps.slice(0, 20).map((order, idx) => (
                  <div
                    key={order.txHash}
                    className={`flex items-center justify-between py-2 px-3 rounded ${
                      idx === 0 ? 'bg-red-500/10 border-l-2 border-red-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-red-400 font-mono text-sm">
                      {order.limit.doubleAdjusted.toFixed(6)} WART/{asset.name}
                    </span>
                    <span className="text-white/70 font-mono text-sm">{order.amount.str}</span>
                    <span className="text-white/50 font-mono text-sm">{order.filled.str}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${order.inMempool ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {order.inMempool ? 'Mempool' : 'Confirmed'}
                    </span>
                    <Link to={`/tx/${order.txHash}`} className="text-primary hover:underline font-mono text-xs">
                      {formatAddress(order.txHash, 6)}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/50 text-sm py-2">No sell orders</div>
            )}
          </div>
        </div>
      )}

      {richlist && richlist.richlist && richlist.richlist.length > 0 && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">
            {isLiquidity ? 'Liquidity' : 'Asset'} Rich List
          </h3>
          <div className="space-y-2">
            {richlist.richlist.map((entry, idx) => (
              <div key={entry.address} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-sm w-6">{idx + 1}.</span>
                  <Link to={`/address/${entry.address}`} className="text-primary hover:underline font-mono text-sm">
                    {formatAddress(entry.address, 8)}
                  </Link>
                </div>
                <span className="text-white font-mono text-sm">{entry.balance.str}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}