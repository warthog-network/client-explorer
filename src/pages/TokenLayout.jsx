import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaCoins } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import { useNode } from '../context/NodeContext';
import CopyableValue from '../components/CopyableValue';
import AssetSocialLinks from '../components/AssetSocialLinks';
import AssetLogo from '../components/AssetLogo';
import useAssetInfo from '../hooks/useAssetInfo';

export default function TokenLayout() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { nodeKey } = useNode();
  const [asset, setAsset] = useState(null);
  const [richlist, setRichlist] = useState(null);
  const [liquidityRichlist, setLiquidityRichlist] = useState(null);
  const [liquidityRichlistLoaded, setLiquidityRichlistLoaded] = useState(false);
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const WART_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  const { info, loading: infoLoading } = useAssetInfo(hash);

  const fetchAssetData = async () => {
    if (!hash) return;
    setLoading(true);
    setError(null);

  if (hash === 'wart' || hash === WART_HASH) {
      setAsset({ name: 'WART', hash: WART_HASH, symbol: 'WART' });
      try {
        const richlistData = await nodeApi.getRichlist('0');
        setRichlist(richlistData);
      } catch (err) {
        console.warn('Failed to fetch WART richlist:', err);
      }
      setLoading(false);
      return;
    }

    try {
      const [assetData, richlistData] = await Promise.all([
        nodeApi.getAsset(hash),
        nodeApi.getRichlist(`asset:${hash}`),
      ]);
      setAsset(assetData);
      setRichlist(richlistData);
    } catch (err) {
      setError(err.message || 'Failed to fetch token');
      setLoading(false);
      return;
    }
    try {
      const marketData = await nodeApi.getMarket(hash);
      setMarket(marketData);
    } catch (marketErr) {
      console.warn('Market data unavailable:', marketErr);
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

  const getTokenDescription = (hash, assetName) => {
    if (hash === 'wart' || hash === WART_HASH || assetName === 'WART') {
      return 'WART is the native token of Warthog. All assets on Warthog are traded against WART.';
    }
    return null;
  };

  useEffect(() => {
    fetchAssetData();
  }, [hash, nodeKey]);

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const subroute = pathParts.length > 2 ? pathParts[2] : '';
    if (subroute === 'liquidity') {
      fetchLiquidityRichlist();
    }
  }, [location.pathname, liquidityRichlistLoaded, hash]);

  if (loading && !asset) {
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
            <button
              onClick={() => navigate('/assets')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
            >
              Browse Assets
            </button>
          </div>
        </div>
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
          onClick={fetchAssetData}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <div className="text-sm font-semibold text-white mb-2">Description</div>
          <p className="text-white/70 text-sm">
            {info?.description || getTokenDescription(hash, asset?.name) || 'Token description not available.'}
          </p>
          <div className="mt-3">
            <AssetSocialLinks info={info} loading={infoLoading} />
          </div>
        </div>

      <div className="flex items-center justify-center gap-1 border-b border-white/20">
        <button
          onClick={() => navigate(`/asset/${hash}/`, { replace: true })}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            location.pathname === `/asset/${hash}` || location.pathname === `/asset/${hash}/`
              ? 'border-primary text-primary'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Asset
        </button>
        <button
          onClick={() => navigate(`/asset/${hash}/liquidity`, { replace: true })}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            location.pathname === `/asset/${hash}/liquidity`
              ? 'border-primary text-primary'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Liquidity
        </button>
        <button
          onClick={() => navigate(`/asset/${hash}/orders`, { replace: true })}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            location.pathname === `/asset/${hash}/orders`
              ? 'border-primary text-primary'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Orders
        </button>
      </div>

      <Outlet context={{ asset, hash, richlist, liquidityRichlist, market }} />
    </div>
  );
}
