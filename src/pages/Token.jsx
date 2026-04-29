import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaCoins, FaCoins as FaLiquidity } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import { useNode } from '../context/NodeContext';
import { formatAddress } from '../utils/format';

export default function Token() {
  const { tokenspec } = useParams();
  const navigate = useNavigate();
  const { nodeKey } = useNode();
  const [asset, setAsset] = useState(null);
  const [richlist, setRichlist] = useState(null);
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
    } finally {
      setLoading(false);
    }
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