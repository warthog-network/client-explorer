import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSync, FaCube, FaArrowLeft } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import TransactionRow from '../components/TransactionRow';
import { formatNumber, formatTimestamp, formatHashrate, formatAddress } from '../utils/format';
import { useNode } from '../context/NodeContext';

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
    { key: 'limitSwap', label: 'Limit Swaps' },
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
          Block #{formatNumber(height)}
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
          <div>
            <div className="text-xs text-white/50 mb-1">Block Hash</div>
            <Link to={`/block/${header.hash}`} className="text-sm text-primary hover:underline font-mono break-all">
              {header.hash}
            </Link>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">
              {height === 1 ? 'Genesis Hash' : 'Previous Hash'}
            </div>
            {height === 1 ? (
              <span className="text-sm text-white/70 font-mono break-all">
                {header.prevHash}
              </span>
            ) : (
              <Link to={`/block/${header.prevHash}`} className="text-sm text-primary hover:underline font-mono break-all">
                {header.prevHash}
              </Link>
            )}
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Timestamp</div>
            <div className="text-white">{formatTimestamp(timestamp)}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Confirmations</div>
            <div className="text-white">{formatNumber(confirmations)}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Target</div>
            <div className="text-white font-mono text-sm">{header.target}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Transactions</div>
            <div className="text-primary font-semibold">{txCount}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Merkle Root</div>
            <div className="text-sm text-white font-mono break-all">{header.merkleroot}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Nonce</div>
            <div className="text-white">{header.nonce}</div>
          </div>
          {header.pow && (
            <>
              <div>
                <div className="text-xs text-white/50 mb-1">Janushash (float)</div>
                <div className="text-primary">{header.pow.floatVerus?.toExponential(6)}</div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Hash (Verus)</div>
                <div className="text-sm text-white font-mono break-all">{header.pow.hashVerus}</div>
              </div>
            </>
          )}
        </div>
      </div>

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
            <h3 className="text-sm font-semibold text-white mb-3">
              {label}{key !== 'reward' && ` (${count})`}
            </h3>
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
  );
}