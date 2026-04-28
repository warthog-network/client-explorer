import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSync, FaArrowLeft, FaWallet, FaHistory } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import TransactionRow from '../components/TransactionRow';
import { formatWart, formatNumber } from '../utils/format';
import { useNode } from '../context/NodeContext';

export default function Account() {
  const { address } = useParams();
  const navigate = useNavigate();
  const { nodeKey } = useNode();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceData, historyData] = await Promise.all([
        nodeApi.getAccountWartBalance(address),
        nodeApi.getAccountHistory(address),
      ]);
      setBalance(balanceData);
      setHistory(historyData);
    } catch (err) {
      setError(err.message || 'Failed to fetch account data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address, nodeKey]);

  if (loading && !balance) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading account...</span>
        </div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-error text-center">
          <p>{error || 'Account not found'}</p>
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

  const { account, wart } = balance;

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
          <FaWallet className="text-primary" />
          Account
        </h1>
        <button
          onClick={fetchData}
          className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="text-center mb-4">
          <div className="text-lg text-white font-mono break-all">{address}</div>
        </div>

        {account && (
          <div className="text-xs text-white/50 text-center mb-2">
            Account ID: {account.accountId}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-black/30 rounded-xl">
            <div className="text-sm text-white/50 mb-2">Total Balance</div>
            <div className="text-2xl font-bold text-primary">{wart?.total?.str || '0'}</div>
          </div>
          <div className="p-4 bg-black/30 rounded-xl">
            <div className="text-sm text-white/50 mb-2">Locked</div>
            <div className="text-2xl font-semibold text-white">{wart?.locked?.str || '0'}</div>
          </div>
          <div className="p-4 bg-black/30 rounded-xl">
            <div className="text-sm text-white/50 mb-2">Mempool</div>
            <div className="text-2xl font-semibold text-yellow-400">{wart?.mempool?.str || '0'}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FaHistory className="text-primary" />
          Transaction History
        </h3>

        {history?.perBlock?.length === 0 && (
          <div className="text-center text-white/50 py-8">No transactions found</div>
        )}

        <div className="space-y-3">
          {history?.perBlock?.map((blockData) => {
            const { header, body, height, confirmations } = blockData;

            const txTypes = [
              { key: 'wartTransfer', label: 'WART Transfer' },
              { key: 'tokenTransfer', label: 'Token Transfer' },
              { key: 'limitSwap', label: 'Limit Swap' },
              { key: 'match', label: 'DEX Match' },
              { key: 'liquidityDeposit', label: 'Liquidity Deposit' },
              { key: 'liquidityWithdrawal', label: 'Liquidity Withdrawal' },
              { key: 'assetCreation', label: 'Asset Creation' },
              { key: 'cancelation', label: 'Cancelation' },
            ];

            const allTxs = [];
            if (body.reward) {
              allTxs.push({ tx: body.reward, type: 'reward', height, confirmations });
            }
            txTypes.forEach(({ key }) => {
              const txs = body[key];
              if (txs && txs.length > 0) {
                txs.forEach((tx) => {
                  allTxs.push({ tx, type: key, height, confirmations });
                });
              }
            });

            return allTxs.map(({ tx, type }, idx) => (
              <TransactionRow
                key={tx.transaction?.hash || tx.hash || `${height}-${idx}`}
                tx={tx}
                type={type}
                showBlockLink={true}
                blockHeight={height}
                confirmations={confirmations}
              />
            ));
          })}
        </div>

        {history?.fromId > 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                try {
                  const moreHistory = await nodeApi.getAccountHistory(address, history.fromId);
                  setHistory((prev) => ({
                    ...prev,
                    perBlock: [...prev.perBlock, ...moreHistory.perBlock],
                    fromId: moreHistory.fromId,
                  }));
                } catch (err) {
                  console.error('Failed to load more:', err);
                }
              }}
              className="px-6 py-2 bg-primary text-black font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}