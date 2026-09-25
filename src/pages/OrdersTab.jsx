import { useParams, Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { formatAddress } from '../utils/format';

function fmtPrice(p) {
  if (p == null) return '—';
  const s = p.toFixed(8);
  return s.replace(/0+$/, '').replace(/\.$/, '');
}

function cumulateSize(orders) {
  let total = 0;
  return orders.map((order) => {
    const size = parseFloat(order.amount.str) || 0;
    total += size;
    return { order, cum: total, size };
  });
}

export default function OrdersTab() {
  const { hash } = useParams();
  const { asset, market } = useOutletContext();

  if (!market) {
    return (
      <div className="text-white/50 text-sm py-4">Loading market data...</div>
    );
  }

  const sellsAll = (market.assetToWartSwaps || []).slice();
  const buysAll = (market.wartToAssetSwaps || []).slice();
  sellsAll.sort((a, b) => a.limit.doubleAdjusted - b.limit.doubleAdjusted);
  buysAll.sort((a, b) => b.limit.doubleAdjusted - a.limit.doubleAdjusted);

  const sells = sellsAll.slice(0, 50);
  const buys = buysAll.slice(0, 50);

  const bestAsk = sells.length > 0 ? sells[0].limit.doubleAdjusted : null;
  const bestBid = buys.length > 0 ? buys[0].limit.doubleAdjusted : null;
  const spread = (bestAsk !== null && bestBid !== null) ? bestAsk - bestBid : null;
  const mid = (bestAsk !== null && bestBid !== null) ? (bestAsk + bestBid) / 2 : null;
  const spreadPct = (spread !== null && mid !== null && mid > 0) ? (spread / mid) * 100 : null;

  const sellRows = cumulateSize(sells);
  const buyRows = cumulateSize(buys);
  const maxCum = Math.max(
    sellRows.length > 0 ? sellRows[sellRows.length - 1].cum : 0,
    buyRows.length > 0 ? buyRows[buyRows.length - 1].cum : 0,
    1,
  );

  return (
    <div className="space-y-4">
      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-white/50 mb-1">Best bid</div>
            <div className="text-lg font-mono text-emerald-400">
              {fmtPrice(bestBid)}
            </div>
            <div className="text-xs text-white/40 mt-1">WART/{asset.name}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Spread</div>
            <div className="text-lg font-mono text-white">
              {fmtPrice(spread)}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {spreadPct !== null ? `${spreadPct.toFixed(4)}% of mid` : ''}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Best ask</div>
            <div className="text-lg font-mono text-red-400">
              {fmtPrice(bestAsk)}
            </div>
            <div className="text-xs text-white/40 mt-1">WART/{asset.name}</div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <FaArrowUp className="text-red-400" />
          <h3 className="text-sm font-semibold text-white">Sell orders (asks)</h3>
          <span className="text-xs text-white/50">
            ({sellsAll.length} order{sellsAll.length === 1 ? '' : 's'})
          </span>
        </div>
        <div className="flex items-center justify-between px-3 mb-2 text-xs text-white/40 uppercase tracking-wider">
          <span>Price (WART/{asset.name})</span>
          <span>Amount ({asset.name})</span>
          <span>Total</span>
          <span>Status</span>
          <span>Tx</span>
        </div>
        {sellRows.length > 0 ? (
          <div className="space-y-1">
            {sellRows.slice().reverse().map((row, idx) => {
              const widthPct = Math.max((row.cum / maxCum) * 100, 0);
              const isBest = idx === sellRows.length - 1;
              return (
                <div
                  key={row.order.txHash + ':' + idx}
                  className={`relative flex items-center justify-between py-2 px-3 rounded ${
                    isBest ? 'bg-red-500/10 border-l-2 border-red-500' : 'hover:bg-white/5'
                  }`}
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-red-500/15 rounded"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="relative text-red-400 font-mono text-sm">
                    {fmtPrice(row.order.limit.doubleAdjusted)}
                  </span>
                  <span className="relative text-white/70 font-mono text-sm">
                    {row.order.amount.str}
                  </span>
                  <span className="relative text-white/50 font-mono text-sm">
                    {row.cum.toFixed(2)}
                  </span>
                  <span
                    className={`relative text-xs px-2 py-0.5 rounded ${
                      row.order.inMempool
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {row.order.inMempool ? 'Mempool' : 'Confirmed'}
                  </span>
                  <Link
                    to={`/tx/${row.order.txHash}`}
                    className="relative text-primary hover:underline font-mono text-xs"
                  >
                    {formatAddress(row.order.txHash, 6)}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-white/50 text-sm py-2">No sell orders</div>
        )}
      </div>

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <FaArrowDown className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Buy orders (bids)</h3>
          <span className="text-xs text-white/50">
            ({buysAll.length} order{buysAll.length === 1 ? '' : 's'})
          </span>
        </div>
        <div className="flex items-center justify-between px-3 mb-2 text-xs text-white/40 uppercase tracking-wider">
          <span>Price (WART/{asset.name})</span>
          <span>Amount ({asset.name})</span>
          <span>Total</span>
          <span>Status</span>
          <span>Tx</span>
        </div>
        {buyRows.length > 0 ? (
          <div className="space-y-1">
            {buyRows.slice(0, 50).map((row, idx) => {
              const widthPct = Math.max((row.cum / maxCum) * 100, 0);
              const isBest = idx === 0;
              return (
                <div
                  key={row.order.txHash + ':' + idx}
                  className={`relative flex items-center justify-between py-2 px-3 rounded ${
                    isBest ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : 'hover:bg-white/5'
                  }`}
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-emerald-500/15 rounded"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="relative text-emerald-400 font-mono text-sm">
                    {fmtPrice(row.order.limit.doubleAdjusted)}
                  </span>
                  <span className="relative text-white/70 font-mono text-sm">
                    {row.order.amount.str}
                  </span>
                  <span className="relative text-white/50 font-mono text-sm">
                    {row.cum.toFixed(2)}
                  </span>
                  <span
                    className={`relative text-xs px-2 py-0.5 rounded ${
                      row.order.inMempool
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {row.order.inMempool ? 'Mempool' : 'Confirmed'}
                  </span>
                  <Link
                    to={`/tx/${row.order.txHash}`}
                    className="relative text-primary hover:underline font-mono text-xs"
                  >
                    {formatAddress(row.order.txHash, 6)}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-white/50 text-sm py-2">No buy orders</div>
        )}
      </div>
    </div>
  );
}
