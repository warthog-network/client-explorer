import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSync, FaCoins, FaSearch } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import { useNode } from '../context/NodeContext';
import { formatAddress } from '../utils/format';

export default function Tokens() {
  const { nodeKey } = useNode();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nodeApi.getAssets(search, '');
      setAssets(data.matches || []);
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
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">ID</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Name</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Total Supply</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Decimals</th>
                <th className="text-left text-xs text-white/50 font-medium px-5 py-3">Hash</th>
              </tr>
            </thead>
            <tbody>
              <tr
                onClick={() => window.location.href = '/asset/wart'}
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3 text-white font-mono text-sm">-</td>
                <td className="px-5 py-3 text-yellow-400 font-mono text-sm font-bold">WART</td>
                <td className="px-5 py-3 text-white font-mono text-sm">-</td>
                <td className="px-5 py-3 text-white font-mono text-sm">8</td>
                <td className="px-5 py-3 text-primary font-mono text-xs">
                  native
                </td>
              </tr>
              {assets.map((asset) => (
                <tr
                  key={asset.hash}
                  onClick={() => window.location.href = `/asset/${asset.hash}`}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 text-white font-mono text-sm">{asset.id}</td>
                  <td className="px-5 py-3 text-primary font-mono text-sm">{asset.name}</td>
                  <td className="px-5 py-3 text-white font-mono text-sm">{asset.totalSupply?.str}</td>
                  <td className="px-5 py-3 text-white font-mono text-sm">{asset.decimals}</td>
                  <td className="px-5 py-3 text-primary font-mono text-xs">
                    {formatAddress(asset.hash, 8)}
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