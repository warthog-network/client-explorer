import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSync, FaCoins, FaSearch } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import { useNode } from '../context/NodeContext';
import { formatAddress, formatCompact, formatPrice } from '../utils/format';
import { tradePrice, tradeCloses } from '../utils/trades';
import AssetLogo from '../components/AssetLogo';
import Sparkline from '../components/Sparkline';

export default function Tokens() {
  const { nodeKey } = useNode();
  const [assets, setAssets] = useState([]);
  const [priceMap, setPriceMap] = useState({});
  const [sparklineMap, setSparklineMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nodeApi.getAssets(search, '');
      const matches = data.matches || [];
      setAssets(matches);
      setPriceMap({});
      setSparklineMap({});

      Promise.allSettled(
        matches.map((a) =>
          nodeApi.getTrades(a.hash, 1).then((trades) => [a.hash, tradePrice(trades?.[0])])
        )
      ).then((results) => {
        const map = {};
        results.forEach((r) => {
          if (r.status === 'fulfilled' && r.value[1] != null) map[r.value[0]] = r.value[1];
        });
        setPriceMap(map);
      });

      Promise.allSettled(
        matches.map((a) =>
          nodeApi.getTrades(a.hash, 24).then((trades) => [a.hash, tradeCloses(trades)])
        )
      ).then((results) => {
        const map = {};
        results.forEach((r) => {
          if (r.status === 'fulfilled' && r.value[1].length >= 2) map[r.value[0]] = r.value[1];
        });
        setSparklineMap(map);
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search, nodeKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <FaCoins className="text-primary" />
          Assets
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={fetchAssets}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Refresh"
          >
            <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && assets.length === 0 ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="flex items-center gap-3 text-white/70">
            <FaSync className="animate-spin" size={24} />
            <span>Loading assets...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4">
          <div className="text-error text-center">
            <p>{error}</p>
          </div>
          <button
            onClick={fetchAssets}
            className="px-6 py-2 bg-primary text-black font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Name</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Hash</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Total Supply</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Market Cap (WART)</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Decimals</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Price (WART)</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Activity (last 24 trades)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                onClick={() => window.location.href = '/asset/wart'}
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3 font-mono text-sm">
                  <div className="flex items-center gap-3">
                    <img src="/warthog-ticker.svg" alt="WART" className="h-6 w-6" />
                    <span className="text-primary font-bold">WART</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-primary font-mono text-xs">
                  native
                </td>
                <td className="px-5 py-3 text-white font-mono text-sm">-</td>
                <td className="px-5 py-3 text-white font-mono text-sm">-</td>
                <td className="px-5 py-3 text-white font-mono text-sm">8</td>
                <td className="px-5 py-3 text-white font-mono text-sm">-</td>
                <td className="px-5 py-3 text-white/30 font-mono text-sm">—</td>
              </tr>
              {assets.map((asset) => (
                <tr
                  key={asset.hash}
                  onClick={() => window.location.href = `/asset/${asset.hash}`}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono text-sm">
                    <div className="flex items-center gap-3">
                      <AssetLogo hash={asset.hash} name={asset.name} className="h-6 w-6" />
                      <span className="text-primary">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-primary font-mono text-xs">
                    {formatAddress(asset.hash, 8)}
                  </td>
                  <td className="px-5 py-3 text-white font-mono text-sm">
                    {formatCompact(parseFloat(asset.totalSupply?.str || '0'))}
                  </td>
                  <td className="px-5 py-3 text-white font-mono text-sm">
                    {(() => {
                      const p = priceMap[asset.hash];
                      if (p == null) return <span className="text-white/30">—</span>;
                      return formatCompact(p * parseFloat(asset.totalSupply?.str || '0'));
                    })()}
                  </td>
                  <td className="px-5 py-3 text-white font-mono text-sm">{asset.decimals}</td>
                  <td className="px-5 py-3 text-white font-mono text-sm">
                    {(() => {
                      const p = priceMap[asset.hash];
                      if (p == null) return <span className="text-white/30">—</span>;
                      return formatPrice(p);
                    })()}
                  </td>
                  <td className="px-5 py-3">
                    <Sparkline points={sparklineMap[asset.hash]} width={96} height={24} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}