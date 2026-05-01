import { useParams, Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import CopyableValue from '../components/CopyableValue';

export default function LiquidityTab() {
  const { hash } = useParams();
  const { asset, liquidityRichlist, market } = useOutletContext();

  return (
    <>
      {market?.liquidityPool && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">Liquidity Pool</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Asset Pool</div>
              <div className="flex items-center gap-1">
                <CopyableValue value={market.liquidityPool.asset.str} className="text-white font-mono" />
                <Link to={`/asset/${hash}/`} className="text-primary hover:underline font-mono text-sm">{asset.name}</Link>
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">WART Pool</div>
              <div className="flex items-center gap-1">
                <CopyableValue value={market.liquidityPool.wart.str} className="text-white font-mono" />
                <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Total Shares</div>
              <div className="flex items-center gap-1">
                <CopyableValue value={market.liquidityPool.shares.str} className="text-white font-mono" />
                <Link to={`/asset/${hash}/liquidity`} className="text-primary hover:underline font-mono text-sm">{asset.name}-Liquidity</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {liquidityRichlist && liquidityRichlist.richlist && liquidityRichlist.richlist.length > 0 && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">
            Liquidity Rich List
          </h3>
          <div className="space-y-2">
            {liquidityRichlist.richlist.map((entry, idx) => (
              <div key={entry.address} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-sm w-6">{idx + 1}.</span>
                  <Link to={`/address/${entry.address}`} className="text-primary text-sm hover:underline">
                    {entry.address}
                  </Link>
                </div>
                <CopyableValue value={entry.balance.str} className="text-white font-mono text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
