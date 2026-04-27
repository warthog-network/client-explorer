import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaCoins } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';

export default function Asset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAsset = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nodeApi.getAsset(id);
      setAsset(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch asset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading asset...</span>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-error text-center">
          <p>{error || 'Asset not found'}</p>
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
          Asset
        </h1>
        <button
          onClick={fetchAsset}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
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

          <div>
            <div className="text-xs text-white/50 mb-1">Asset Hash</div>
            <div className="text-sm text-white font-mono break-all">{id}</div>
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
    </div>
  );
}