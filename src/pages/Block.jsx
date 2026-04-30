import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSync, FaCube, FaArrowLeft } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import TransactionRow from '../components/TransactionRow';
import { formatNumber, formatHashrate, formatAddress } from '../utils/format';
import { useNode } from '../context/NodeContext';
import CopyableTimestamp from '../components/CopyableTimestamp';
import CopyableValue from '../components/CopyableValue';
import DetailRow from '../components/DetailRow';

export default function Block() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nodeKey } = useNode();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nodeApi.getBlock(id);
      setBlock(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch block');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlock();
  }, [id, nodeKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading block...</span>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4">
        <div className="text-error text-center">
          <p>{error || 'Block not found'}</p>
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

  const { header, body, height, confirmations } = block;
  const timestamp = header?.time?.timestamp;

  const txTypes = [
    { key: 'reward', label: 'Reward' },
    { key: 'transfers', label: 'Transfers' },
    { key: 'limitSwap', label: 'Limit Orders' },
    { key: 'match', label: 'DEX Matches' },
    { key: 'liquidityDeposit', label: 'Liquidity Deposits' },
    { key: 'liquidityWithdrawal', label: 'Liquidity Withdrawals' },
    { key: 'assetCreation', label: 'Asset Creations' },
    { key: 'cancelation', label: 'Cancelations' },
  ];

  const txCount = txTypes.reduce((acc, { key }) => {
    if (key === 'transfers') {
      return acc + (body.wartTransfer?.length || 0) + (body.tokenTransfer?.length || 0);
    }
    const arr = body[key];
    return acc + (Array.isArray(arr) ? arr.length : (arr ? 1 : 0));
  }, 0);

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
          <FaCube className="text-primary" />
          <span className="text-white">Block</span>
          {height > 1 && (
            <Link to={`/block/${height - 1}`} className="text-white/50 hover:text-white text-sm">
              ◀
            </Link>
          )}
          <span className="text-primary">#{formatNumber(height)}</span>
          {confirmations > 1 && (
            <Link to={`/block/${height + 1}`} className="text-white/50 hover:text-white text-sm">
              ▶
            </Link>
          )}
        </h1>
        <button
          onClick={fetchBlock}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="Block Hash" value={header.hash} copyable breakAll />
          <DetailRow label={height === 1 ? 'Genesis Hash' : 'Previous Hash'} value={header.prevHash} link={height !== 1 ? `/block/${header.prevHash}` : undefined} breakAll />
          <DetailRow label="Time" timestamp={timestamp} suffix={`(${formatNumber(confirmations)} confirmations)`} />
          <DetailRow label="Target" value={header.target} copyable />
          <DetailRow label="Merkle Root" value={header.merkleroot} copyable breakAll />
          <DetailRow label="Nonce" value={header.nonce} copyable />
          {header.pow && (
            <>
              <DetailRow label="Janushash (float)" value={header.pow.floatVerus?.toExponential(6)} copyable />
              <DetailRow label="Hash (Verus)" value={header.pow.hashVerus} copyable breakAll />
            </>
          )}
        </div>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <h3 className="text-sm font-semibold text-white mb-4">
          Transactions ({formatNumber(txCount)})
        </h3>
        <div className="space-y-2">
          {txTypes.map(({ key, label }) => {
            let txs = body[key];
            let txArray = [];
            let actualType = key;

            if (key === 'transfers') {
              const wartTxs = body.wartTransfer || [];
              const tokenTxs = body.tokenTransfer || [];
              if (wartTxs.length === 0 && tokenTxs.length === 0) return null;
              txArray = [...wartTxs.map(tx => ({ ...tx, _type: 'wartTransfer' })), ...tokenTxs.map(tx => ({ ...tx, _type: 'tokenTransfer' }))];
            } else {
              if (!txs || (Array.isArray(txs) && txs.length === 0)) return null;
              txArray = Array.isArray(txs) ? txs : [txs];
            }

            const count = key === 'transfers' ? (body.wartTransfer?.length || 0) + (body.tokenTransfer?.length || 0) : txArray.length;

            return (
              <div key={key}>
                <h4 className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                  {label} ({count})
                </h4>
                <div className="space-y-2">
                  {txArray.map((tx, idx) => (
                    <TransactionRow
                      key={tx.transaction?.hash || tx.hash || idx}
                      tx={tx}
                      type={tx._type || key}
                      showBlockLink={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}