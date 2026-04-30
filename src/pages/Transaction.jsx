import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaReceipt } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import TransactionDetails from '../components/TransactionDetails';
import { formatTimestamp, formatTimestampShort, formatNumber, formatTimeAgo } from '../utils/format';
import { useNode } from '../context/NodeContext';
import CopyableTimestamp from '../components/CopyableTimestamp';
import CopyableValue from '../components/CopyableValue';
import AddressWithTag from '../components/AddressWithTag';

export default function Transaction() {
  const { txid } = useParams();
  const navigate = useNavigate();
  const { nodeKey } = useNode();
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
  }, [txid, nodeKey]);

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

  const { transaction, type, confirmations, mined } = tx;
  const txType = type ? type : 'unknown';
  const txHash = transaction?.hash || txid;
  const signedCommon = transaction?.signedCommon;
  const now = Math.floor(Date.now() / 1000);

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
          <FaReceipt className="text-primary" />
          Transaction Details
        </h1>
        <button
          onClick={fetchTx}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-xs text-white/50 mb-1">Transaction Hash</div>
              <CopyableValue value={txHash} className="text-white font-mono text-sm break-all" />
            </div>
            <div className="text-right">
              <div className="text-xs text-white/50 mb-1">Confirmations</div>
              <CopyableValue value={String(confirmations)} className="text-white font-mono text-sm" />
            </div>
          </div>

          {signedCommon && (
            <div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-sm">Signer:</span>
                  <AddressWithTag address={signedCommon.originAddress} showFull={false} className="text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-sm">Fee:</span>
                  <CopyableValue value={signedCommon.fee?.str || String(signedCommon.fee)} suffix="WART" className="text-white font-mono text-sm" />
                </div>
                {signedCommon.nonceId !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">Nonce:</span>
                    <CopyableValue value={String(signedCommon.nonceId)} className="text-white font-mono text-sm" />
                  </div>
                )}
                {signedCommon.pinHeight !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">Pin Height:</span>
                    <CopyableValue value={String(signedCommon.pinHeight)} className="text-white font-mono text-sm" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-4">
            <div className="text-xs text-white/50 mb-2">Block</div>
            {mined ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-sm">Hash:</span>
                  <Link to={`/block/${mined.block?.hash}`} className="text-primary hover:underline font-mono text-sm">
                    {mined.block?.hash}
                  </Link>
                </div>
<div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">Height:</span>
                    <CopyableValue value={String(mined.block?.height)} className="text-white font-mono text-sm" />
                  </div>
                {mined?.block?.timestamp && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">Time:</span>
                    <CopyableTimestamp timestamp={mined.block.timestamp} />
                    <span className="text-white/50 text-sm">({formatTimeAgo(mined.block.timestamp, now)})</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/50 text-sm">Not yet mined</div>
            )}
          </div>

          <TransactionDetails tx={transaction} type={txType} mined={mined} />
        </div>
      </div>
    </div>
  );
}