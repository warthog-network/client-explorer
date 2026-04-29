import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCube, FaExchangeAlt } from 'react-icons/fa';
import { formatNumber, formatTimeAgo, formatAddress } from '../utils/format';
import { getAddressTag } from '../config/addressTags';
import CopyableTimestamp from './CopyableTimestamp';

export default function BlockCard({ block }) {
  const { header, body, height, confirmations } = block;
  const timestamp = header?.time?.timestamp;
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const minerAddress = body?.reward?.transaction?.data?.toAddress || body?.reward?.data?.toAddress;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const txCount = body ? Object.values(body).reduce((count, arr) => {
    if (Array.isArray(arr)) return count + arr.length;
    if (arr && typeof arr === 'object' && arr.transaction) return count + 1;
    return count;
  }, 0) : 0;

  return (
    <Link
      to={`/block/${header.hash}`}
      className="block p-5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-primary/50 hover:bg-white/15 transition-all h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <FaCube className="text-primary" size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-lg">Block #{formatNumber(height)}</span>
            <span className="text-xs text-white/50">({formatTimeAgo(timestamp, now)})</span>
          </div>
          <div className="text-sm text-white/50">
            {confirmations ? `${formatNumber(confirmations)} confirmations` : 'Pending'}
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary bg-primary/10 px-3 py-1 rounded-full">
          <FaExchangeAlt size={12} />
          <span className="text-sm font-semibold">{txCount}</span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-white/50">Hash</span>
          <Link to={`/block/${header.hash}`} className="text-primary hover:underline font-mono text-xs lg:text-sm">
            {formatAddress(header?.hash, 8)}
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/50">Time</span>
          <CopyableTimestamp timestamp={timestamp} className="text-xs lg:text-sm" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/50">Miner</span>
          {minerAddress && (
            <span className="inline-flex items-center gap-1">
              {getAddressTag(minerAddress) && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
                  {getAddressTag(minerAddress)}
                </span>
              )}
              <Link to={`/address/${minerAddress}`} className="text-primary hover:underline font-mono text-xs lg:text-sm">
                {formatAddress(minerAddress, 8)}
              </Link>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}