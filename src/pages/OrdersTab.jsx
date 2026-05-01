import { useParams, Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { formatAddress } from '../utils/format';

export default function OrdersTab() {
  const { hash } = useParams();
  const { asset, market } = useOutletContext();

  if (!market) {
    return (
      <div className="text-white/50 text-sm py-4">Loading market data...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <FaArrowDown className="text-green-400" />
          <h3 className="text-sm font-semibold text-white">Buy Orders</h3>
          <span className="text-xs text-white/50">({market.wartToAssetSwaps?.length || 0} orders)</span>
        </div>
        <div className="flex items-center justify-between px-3 mb-2 text-xs text-white/40 uppercase tracking-wider">
          <span>Price</span>
          <span>Amount</span>
          <span>Filled</span>
          <span>Status</span>
          <span>Tx</span>
        </div>
        {market.wartToAssetSwaps?.length > 0 ? (
          <div className="space-y-1">
            {market.wartToAssetSwaps.slice(0, 20).map((order, idx) => (
              <div
                key={order.txHash}
                className={`flex items-center justify-between py-2 px-3 rounded ${
                  idx === 0 ? 'bg-green-500/10 border-l-2 border-green-500' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-green-400 font-mono text-sm">
                  {order.limit.doubleAdjusted.toFixed(6)} WART/{asset.name}
                </span>
                <span className="text-white/70 font-mono text-sm">{order.amount.str}</span>
                <span className="text-white/50 font-mono text-sm">{order.filled.str}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${order.inMempool ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                  {order.inMempool ? 'Mempool' : 'Confirmed'}
                </span>
                <Link to={`/tx/${order.txHash}`} className="text-primary hover:underline font-mono text-xs">
                  {formatAddress(order.txHash, 6)}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/50 text-sm py-2">No buy orders</div>
        )}
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <FaArrowUp className="text-red-400" />
          <h3 className="text-sm font-semibold text-white">Sell Orders</h3>
          <span className="text-xs text-white/50">({market.assetToWartSwaps?.length || 0} orders)</span>
        </div>
        <div className="flex items-center justify-between px-3 mb-2 text-xs text-white/40 uppercase tracking-wider">
          <span>Price</span>
          <span>Amount</span>
          <span>Filled</span>
          <span>Status</span>
          <span>Tx</span>
        </div>
        {market.assetToWartSwaps?.length > 0 ? (
          <div className="space-y-1">
            {market.assetToWartSwaps.slice(0, 20).map((order, idx) => (
              <div
                key={order.txHash}
                className={`flex items-center justify-between py-2 px-3 rounded ${
                  idx === 0 ? 'bg-red-500/10 border-l-2 border-red-500' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-red-400 font-mono text-sm">
                  {order.limit.doubleAdjusted.toFixed(6)} WART/{asset.name}
                </span>
                <span className="text-white/70 font-mono text-sm">{order.amount.str}</span>
                <span className="text-white/50 font-mono text-sm">{order.filled.str}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${order.inMempool ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                  {order.inMempool ? 'Mempool' : 'Confirmed'}
                </span>
                <Link to={`/tx/${order.txHash}`} className="text-primary hover:underline font-mono text-xs">
                  {formatAddress(order.txHash, 6)}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/50 text-sm py-2">No sell orders</div>
        )}
      </div>
    </div>
  );
}
