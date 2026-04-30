import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSync, FaCube, FaChartLine, FaCheck, FaTimes } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import BlockCard from '../components/BlockCard';
import SearchBar from '../components/SearchBar';
import HashrateChart from '../components/HashrateChart';
import { formatNumber, formatTimestamp, formatHashrate, formatWork } from '../utils/format';
import { useNode } from '../context/NodeContext';
import CopyableValue from '../components/CopyableValue';

export default function Dashboard() {
  const { nodeKey } = useNode();
  const [chainHead, setChainHead] = useState(null);
  const [hashrate, setHashrate] = useState(null);
  const [hashrateChart, setHashrateChart] = useState([]);
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const head = await nodeApi.getChainHead();
      setChainHead(head);

      const hr = await nodeApi.getHashrate(100);
      setHashrate(hr);

      const now = Math.floor(Date.now() / 1000);
      const dayAgo = now - 86400;
      try {
        const chart = await nodeApi.getHashrateChart(dayAgo, now, 3600);
        setHashrateChart(chart.data || []);
      } catch {
        setHashrateChart([]);
      }

      const blocks = [];
      for (let i = 0; i < 10; i++) {
        try {
          const block = await nodeApi.getBlock(head.height - i);
          blocks.push(block);
        } catch {
          break;
        }
      }
      setRecentBlocks(blocks);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [nodeKey]);

  if (loading && !chainHead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-white/70">
          <FaSync className="animate-spin" size={24} />
          <span>Loading blockchain data...</span>
        </div>
      </div>
    );
  }

  if (error && !chainHead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-error text-center">
          <FaTimes size={48} className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-primary text-black font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-xl">
        <SearchBar />
      </div>

      {chainHead && (
        <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FaCube className="text-primary" size={20} />
              </div>
              Network
            </h2>
            <div className="flex items-center gap-3">
              {chainHead.synced ? (
                <span className="flex items-center gap-1 text-sm text-green-400">
                  <FaCheck size={14} /> Synced
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <FaSync size={14} className="animate-spin" /> Syncing
                </span>
              )}
              <button
                onClick={fetchData}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Refresh"
              >
                <FaSync size={16} className={`text-white/50 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-white/50 mb-2">Chain Length</div>
              <CopyableValue value={String(chainHead.height)} display={formatNumber(chainHead.height)} className="text-lg text-white font-mono" />
            </div>
            <div>
              <div className="text-sm text-white/50 mb-2">Chain Work</div>
              <CopyableValue value={chainHead.worksum} display={formatWork(chainHead.worksum)} className="text-white text-lg font-mono truncate" />
            </div>
            <div>
              <div className="text-sm text-white/50 mb-2">Difficulty</div>
              <CopyableValue value={String(chainHead.difficulty)} display={formatWork(chainHead.difficulty)} className="text-white text-lg font-mono" />
            </div>
            <div>
              <div className="text-sm text-white/50 mb-2">Hashrate</div>
              <CopyableValue value={String(hashrate?.estimate || 0)} display={hashrate ? formatHashrate(hashrate.estimate) : '...'} className="text-white text-lg font-mono" />
            </div>
          </div>
        </div>
      )}

      {hashrateChart.length > 0 && (
        <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Hashrate (24h)</h3>
          <div className="h-48 lg:h-56">
            <HashrateChart data={hashrateChart} isLoading={loading} />
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Blocks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentBlocks.map((block) => (
            <BlockCard key={block.height} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}