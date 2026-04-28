import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSync, FaList, FaArrowLeft } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import TransactionRow from '../components/TransactionRow';
import { formatTimestamp } from '../utils/format';
import { useNode } from '../context/NodeContext';

export default function Mempool() {
  const { nodeKey } = useNode();
  const [mempool, setMempool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMempool = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nodeApi.getMempool();
      setMempool(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch mempool');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMempool();
    const interval = setInterval(fetchMempool, 15000);
    return () => clearInterval(interval);
  }, [nodeKey]);

  if (loading && mempool.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading mempool...</span>
        </div>
      </div>
    );
  }

  if (error && mempool.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4">
        <div className="text-error text-center">
          <p>{error}</p>
        </div>
        <button
          onClick={fetchMempool}
          className="px-6 py-2 bg-primary text-black font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
        >
          Retry
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <FaList className="text-primary" />
          Mempool
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-white/50">{mempool.length} pending</span>
          <button
            onClick={fetchMempool}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Refresh"
          >
            <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {mempool.length === 0 ? (
        <div className="text-center text-white/50 py-12">
          <p>No pending transactions in mempool</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mempool.map((entry, idx) => {
            const { transaction, type } = entry;
            const txHash = transaction?.hash || entry.hash;

            return (
              <div key={txHash || idx} className="space-y-2">
                <TransactionRow
                  tx={transaction}
                  type={type}
                  showBlockLink={true}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center text-xs text-white/30">
        Auto-refreshes every 15 seconds
      </div>
    </div>
  );
}