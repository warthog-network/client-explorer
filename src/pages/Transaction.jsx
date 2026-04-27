import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSync, FaArrowLeft } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import TransactionRow from '../components/TransactionRow';
import { formatTimestamp, formatNumber } from '../utils/format';

export default function Transaction() {
  const { txid } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTx = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nodeApi.getTransaction(txid);
      setTx(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch transaction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTx();
  }, [txid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading transaction...</span>
        </div>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4">
        <div className="text-error text-center">
          <p>{error || 'Transaction not found'}</p>
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

  const { transaction, type, confirmations } = tx;
  const txType = type? type : 'unknown';
  const txHash = transaction?.hash || txid;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-white/70" size={20} />
        </button>
        <h1 className="text-xl font-semibold text-white">Transaction Details</h1>
        <button
          onClick={fetchTx}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-white/50 mb-1">Transaction Hash</div>
            <div className="text-sm text-white font-mono break-all">{txHash}</div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Type</div>
              <div className="text-white capitalize">{txType}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Confirmations</div>
              <div className="text-white">{formatNumber(confirmations)}</div>
            </div>
          </div>

          {transaction?.mined && (
            <>
              <div>
                <div className="text-xs text-white/50 mb-1">Block</div>
                <Link
                  to={`/block/${transaction.mined.block?.hash}`}
                  className="text-primary hover:underline font-mono text-sm break-all"
                >
                  {transaction.mined.block?.hash}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Transaction Data</h3>
        <TransactionRow tx={transaction} type={txType} showBlockLink={false} />
      </div>
    </div>
  );
}
