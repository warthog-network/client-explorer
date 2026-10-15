import { useParams, Link, useOutletContext } from 'react-router-dom';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import CopyableValue from '../components/CopyableValue';
import AddressWithTag from '../components/AddressWithTag';
import type { AssetOutletContext } from '../types/outlet';

const addressToSeed = (addr: string) => parseInt(addr.slice(0, 8), 16);

export default function AssetTab() {
  const { hash } = useParams<{ hash: string }>();
  const { asset, richlist } = useOutletContext<AssetOutletContext>();

  return (
    <>
      <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Name</div>
              <CopyableValue value={asset.name} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">ID</div>
              <CopyableValue value={String(asset.id)} className="text-white" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Token Spec</div>
              <CopyableValue value={`asset:${hash}`} className="text-white font-mono" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Creation:</span>
              <Link to={`/tx/${hash}`} className="text-xs text-primary hover:underline">
                View Transaction
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Total Supply</div>
              <CopyableValue value={asset.totalSupply?.str} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Decimals</div>
              <CopyableValue value={String(asset.decimals)} className="text-white" />
            </div>
          </div>

          {asset.ownerAccountId && (
            <div>
              <div className="text-xs text-white/50 mb-1">Owner Account ID</div>
              <CopyableValue value={String(asset.ownerAccountId)} className="text-white" />
            </div>
          )}

          <div>
            <div className="text-xs text-white/50 mb-1">Height</div>
            <CopyableValue value={String(asset.height)} className="text-white" />
          </div>
        </div>
      </div>

      {richlist && richlist.richlist && richlist.richlist.length > 0 && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-48 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">
            Asset Rich List
          </h3>
          <div className="space-y-2">
            {richlist.richlist.map((entry, idx) => (
              <div key={entry.address} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <Jazzicon diameter={24} seed={addressToSeed(entry.address ?? '')} />
                  <span className="text-white/50 text-sm w-6">{idx + 1}.</span>
                  <AddressWithTag address={entry.address} showFull={true} className="text-primary text-sm" />
                </div>
                <CopyableValue value={entry.balance?.str} className="text-white font-mono text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}