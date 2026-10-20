import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaCoins, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import Jazzicon from '../components/Jazzicon';
import nodeApi from '../api/nodeApi';
import { useNode } from '../context/NodeContext';
import { formatAddress } from '../utils/format';
import AddressWithTag from '../components/AddressWithTag';
import CopyableValue from '../components/CopyableValue';
import AssetLogo from '../components/AssetLogo';
import type {
  NodeAssetDetail,
  NodeMarketDetails,
  NodeRichlistResult,
} from '../types/node';

/**
 * WART is native rather than issued, so the node has no AssetDetail for it.
 * This stand-in carries the fields the WART branch reads.
 */
const SYNTHETIC_WART: NodeAssetDetail = {
  name: 'WART',
  hash: '0000000000000000000000000000000000000000000000000000000000000000',
};

export default function Token() {
  const { hash } = useParams<{ hash?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { nodeKey } = useNode();
  const [asset, setAsset] = useState<NodeAssetDetail | null>(null);
  const [richlist, setRichlist] = useState<NodeRichlistResult | null>(null);
  const [liquidityRichlist, setLiquidityRichlist] = useState<NodeRichlistResult | null>(null);
  const [liquidityRichlistLoaded, setLiquidityRichlistLoaded] = useState(false);
  const [market, setMarket] = useState<NodeMarketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const WART_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  const isWart = !hash || hash === 'wart' || hash === WART_HASH;

  const pathParts = location.pathname.split('/').filter(Boolean);
  const subroute = pathParts.length > 2 ? pathParts[2] : '';
  const isLiquidity = subroute === 'liquidity';
  const isOrders = subroute === 'orders';


  const addressToSeed = (addr: string) => parseInt(addr.slice(0, 8), 16);

  const getTokenDescription = (assetHash: string | undefined, assetName: string | undefined) => {
    if (assetHash === 'wart' || assetHash === WART_HASH || assetName === 'WART') {
      return 'WART is the native token of Warthog. All assets on Warthog are traded against WART.';
    }
    return 'Token description not available.';
  };

  useEffect(() => {
    if (location.pathname === '/asset/wart') {
      fetchWartData();
    } else if (hash) {
      fetchData();
    }
  }, [hash, nodeKey, location.pathname]);

  const fetchWartData = async () => {
    setLoading(true);
    setError(null);
    setAsset(SYNTHETIC_WART);
    try {
      const richlistData = await nodeApi.getRichlist('0');
      setRichlist(richlistData);
    } catch (err) {
      console.warn('Failed to fetch WART richlist:', err);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    if (!hash) {
      setError('Invalid token');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [assetData, richlistData] = await Promise.all([
        nodeApi.getAsset(hash),
        nodeApi.getRichlist(`asset:${hash}`),
      ]);
      setAsset(assetData);
      setRichlist(richlistData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token');
      setLoading(false);
      return;
    }

    try {
      const marketData = await nodeApi.getMarket(hash);
      setMarket(marketData);
    } catch (marketErr) {
      console.warn('Market data unavailable:', marketErr);
      setMarket(null);
    }

    setLoading(false);
  };

  const fetchLiquidityRichlist = async () => {
    if (liquidityRichlistLoaded || !hash) return;
    try {
      const data = await nodeApi.getRichlist(`liquidity:${hash}`);
      setLiquidityRichlist(data);
      setLiquidityRichlistLoaded(true);
    } catch (err) {
      console.warn('Failed to fetch liquidity richlist:', err);
    }
  };

  useEffect(() => {
    if (isLiquidity && !liquidityRichlistLoaded) {
      fetchLiquidityRichlist();
    }
  }, [isLiquidity, liquidityRichlistLoaded, hash]);

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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-6">
        <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
            <FaCoins className="text-error" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Token Not Found</h2>
          <p className="text-white/60 mb-4">
            {error || 'The token you are looking for does not exist or could not be found.'}
          </p>
          {hash && (
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-white/50 mb-1">Searched Token</div>
              <div className="text-white font-mono text-sm break-all">{hash}</div>
            </div>
          )}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <FaArrowLeft /> Go Back
            </button>
            <Link
              to="/assets"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
            >
              Browse Assets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sellOrders = market?.assetToWartSwaps ?? [];
  const buyOrders = market?.wartToAssetSwaps ?? [];

  if (isWart) {
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
            <AssetLogo
              hash={hash}
              name="WART"
              className="h-12 w-12"
            />
            WART
          </h1>
          <button
            onClick={fetchWartData}
            className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Refresh"
          >
            <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <div className="text-sm font-semibold text-white mb-2">Description</div>
          <p className="text-white/70 text-sm">{getTokenDescription(hash, asset?.name)}</p>
        </div>

        {richlist && richlist.richlist && richlist.richlist.length > 0 && (
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-4">Rich List</h3>
            <div className="space-y-2">
              {richlist.richlist.map((entry, idx) => (
                <div key={entry.address} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <Jazzicon diameter={24} seed={addressToSeed(entry.address ?? '')} />
                    <span className="text-white/50 text-sm w-6">{idx + 1}.</span>
                    <AddressWithTag address={entry.address} showFull={true} className="text-primary text-sm" />
                  </div>
                  <CopyableValue value={entry.balance?.str} className="text-white font-mono text-sm" />
                </div>
              ))}
            </div>
          </div>
        )}
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
          <AssetLogo
            hash={hash}
            name={asset?.name}
            className="h-12 w-12"
          />
          <CopyableValue value={asset.name} className="text-white" />
          <span className="text-white/50">(</span>
          <CopyableValue value={hash} className="text-white font-mono" />
          <span className="text-white/50">)</span>
        </h1>
        <button
          onClick={fetchData}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <p className="text-white/70 text-sm">{getTokenDescription(hash, asset?.name)}</p>
      </div>

      <div className="flex items-center justify-center gap-1 border-b border-white/20">
        <button
          onClick={() => navigate(`/asset/${hash}/`, { replace: true })}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            !isLiquidity && !isOrders
              ? 'border-primary text-primary'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Asset
        </button>
        <button
          onClick={() => navigate(`/asset/${hash}/liquidity`, { replace: true })}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            isLiquidity
              ? 'border-primary text-primary'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Liquidity
        </button>
        <button
          onClick={() => navigate(`/asset/${hash}/orders`, { replace: true })}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            isOrders
              ? 'border-primary text-primary'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Orders
        </button>
      </div>

      {!isLiquidity && !isOrders && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-white/50 mb-1">Name</div>
                <CopyableValue value={asset.name} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">ID</div>
                <CopyableValue value={String(asset.id)} className="text-white" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-white/50 mb-1">Token Spec</div>
                <CopyableValue value={`asset:${hash}`} className="text-white font-mono" />
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
                <CopyableValue value={asset.totalSupply?.str} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Decimals</div>
                <CopyableValue value={String(asset.decimals)} className="text-white" />
              </div>
            </div>

            {asset.ownerAccountId && (
              <div>
                <div className="text-xs text-white/50 mb-1">Owner Account ID</div>
                <CopyableValue value={String(asset.ownerAccountId)} className="text-white" />
              </div>
            )}

            <div>
              <div className="text-xs text-white/50 mb-1">Height</div>
              <CopyableValue value={String(asset.height)} className="text-white" />
            </div>
          </div>
        </div>
      )}

      {isLiquidity && market?.liquidityPool && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">Liquidity Pool</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Asset Pool</div>
              <div className="flex items-center gap-1">
                <CopyableValue value={market.liquidityPool.asset?.str} className="text-white font-mono" />
                <Link to={`/asset/${hash}/`} className="text-primary hover:underline font-mono text-sm">{asset.name}</Link>
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">WART Pool</div>
              <div className="flex items-center gap-1">
                <CopyableValue value={market.liquidityPool.wart?.str} className="text-white font-mono" />
                <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Total Shares</div>
              <div className="flex items-center gap-1">
                <CopyableValue value={market.liquidityPool.shares?.str} className="text-white font-mono" />
                <Link to={`/asset/${hash}/liquidity`} className="text-primary hover:underline font-mono text-sm">{asset.name}-Liquidity</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOrders && market && (
        <div className="space-y-4">
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
            {sellOrders.length > 0 ? (
              <div className="space-y-1">
                {sellOrders.slice(0, 20).map((order, idx) => (
                  <div
                    key={order.txHash}
                    className={`flex items-center justify-between py-2 px-3 rounded ${
                      idx === 0 ? 'bg-red-500/10 border-l-2 border-red-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-red-400 font-mono text-sm">
                      {(order.limit?.doubleAdjusted ?? 0).toFixed(6)} WART/{asset.name}
                    </span>
                    <span className="text-white/70 font-mono text-sm">{order.amount?.str}</span>
                    <span className="text-white/50 font-mono text-sm">{order.filled?.str}</span>
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
            {buyOrders.length > 0 ? (
              <div className="space-y-1">
                {buyOrders.slice(0, 20).map((order, idx) => (
                  <div
                    key={order.txHash}
                    className={`flex items-center justify-between py-2 px-3 rounded ${
                      idx === 0 ? 'bg-green-500/10 border-l-2 border-green-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-green-400 font-mono text-sm">
                      {(order.limit?.doubleAdjusted ?? 0).toFixed(6)} WART/{asset.name}
                    </span>
                    <span className="text-white/70 font-mono text-sm">{order.amount?.str}</span>
                    <span className="text-white/50 font-mono text-sm">{order.filled?.str}</span>
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
        </div>
      )}

      {isLiquidity && liquidityRichlist && liquidityRichlist.richlist && liquidityRichlist.richlist.length > 0 && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">
            Liquidity Rich List
          </h3>
          <div className="space-y-2">
            {liquidityRichlist.richlist.map((entry, idx) => (
              <div key={entry.address} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <Jazzicon diameter={24} seed={addressToSeed(entry.address ?? '')} />
                  <span className="text-white/50 text-sm w-6">{idx + 1}.</span>
                  <AddressWithTag address={entry.address} showFull={true} className="text-primary text-sm" />
                </div>
                <CopyableValue value={entry.balance?.str} className="text-white font-mono text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLiquidity && !isOrders && richlist && richlist.richlist && richlist.richlist.length > 0 && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">
            Asset Rich List
          </h3>
          <div className="space-y-2">
            {richlist.richlist.map((entry, idx) => (
              <div key={entry.address} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <Jazzicon diameter={24} seed={addressToSeed(entry.address ?? '')} />
                  <span className="text-white/50 text-sm w-6">{idx + 1}.</span>
                  <AddressWithTag address={entry.address} showFull={true} className="text-primary text-sm" />
                </div>
                <CopyableValue value={entry.balance?.str} className="text-white font-mono text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
