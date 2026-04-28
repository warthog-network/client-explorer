import { Link } from 'react-router-dom';
import { FaArrowRight, FaGift, FaCoins, FaExchangeAlt, FaPlus, FaMinus, FaTimes, FaSync } from 'react-icons/fa';
import { formatAddress, formatWart, formatTimestamp, getTxTypeLabel, getTxTypeColor } from '../utils/format';

function TxTypeIcon({ type }) {
  const icons = {
    wartTransfer: FaExchangeAlt,
    tokenTransfer: FaExchangeAlt,
    assetCreation: FaPlus,
    cancelation: FaTimes,
    liquidityDeposit: FaPlus,
    liquidityWithdrawal: FaMinus,
    limitSwap: FaSync,
    reward: FaGift,
    match: FaExchangeAlt,
  };
  const Icon = icons[type] || FaCoins;
  return <Icon size={16} />;
}

function TransferDetails({ data }) {
  const isWart = !data.asset;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">To:</span>
        <Link to={`/address/${data.toAddress}`} className="text-primary hover:underline font-mono">
          {data.toAddress}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Asset:</span>
        {isWart ? (
          <span className="text-white">WART</span>
        ) : (
          <>
            <Link to={`/asset/${data.asset?.hash}`} className="text-primary hover:underline">
              {data.asset?.name || formatAddress(data.asset?.hash, 8)}
            </Link>
          </>
        )}
      </div>
      {!isWart && data.asset?.hash && (
        <div className="flex items-center gap-4">
          <span className="text-white/50 w-24">Asset Hash:</span>
          <Link to={`/asset/${data.asset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {data.asset?.hash}
          </Link>
        </div>
      )}
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Amount:</span>
        <span className="text-white font-medium text-lg">
          {data.amount?.str || (data.amount?.u64 !== undefined ? `${data.amount?.u64}` : formatWart(data.amount))}
          {!isWart && data.asset?.decimals && <span className="text-white/50 ml-2">({data.asset.decimals} decimals)</span>}
        </span>
      </div>
    </div>
  );
}

function AssetCreationDetails({ data, processed }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Name:</span>
        <span className="text-white font-medium text-lg">{data.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Supply:</span>
        <span className="text-white text-lg">{data.supply?.str}</span>
      </div>
      {processed?.assetId && (
        <div className="flex items-center gap-4">
          <span className="text-white/50 w-24">Asset ID:</span>
          <span className="text-primary text-lg">{processed.assetId}</span>
        </div>
      )}
    </div>
  );
}

function CancelationDetails({ data, processed }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Account ID:</span>
        <span className="text-white font-mono">{data.cancelTxid?.accountId}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Nonce ID:</span>
        <span className="text-white font-mono">{data.cancelTxid?.nonceId}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Pin Height:</span>
        <span className="text-white font-mono">{data.cancelTxid?.pinHeight}</span>
      </div>
      {processed?.canceledTxHash && (
        <div className="flex items-center gap-4">
          <span className="text-white/50 w-24">Canceled:</span>
          <span className="text-white font-mono text-sm">{processed.canceledTxHash}</span>
        </div>
      )}
    </div>
  );
}

function LiquidityDepositDetails({ data, processed }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline">
          {data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.hash}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Base Amount:</span>
        <span className="text-white font-mono">{data.deposited?.base?.str}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Quote Amount:</span>
        <span className="text-white font-mono">{data.deposited?.quote?.str}</span>
      </div>
      {processed?.sharesReceived && (
        <div className="flex items-center gap-4">
          <span className="text-white/50 w-32">Shares Received:</span>
          <span className="text-primary font-medium">{processed.sharesReceived.str}</span>
        </div>
      )}
    </div>
  );
}

function LiquidityWithdrawalDetails({ data, processed }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline">
          {data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.hash}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Shares:</span>
        <span className="text-white font-mono">{data.sharesRedeemed?.str}</span>
      </div>
      {processed?.received && (
        <>
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Base Received:</span>
            <span className="text-white font-mono">{processed.received.base?.str}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Quote Received:</span>
            <span className="text-white font-mono">{processed.received.quote?.str}</span>
          </div>
        </>
      )}
    </div>
  );
}

function LimitSwapDetails({ data, processed }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Side:</span>
        <span className={data.buy ? 'text-green-400 text-lg font-semibold' : 'text-red-400 text-lg font-semibold'}>
          {data.buy ? 'BUY' : 'SELL'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline">
          {data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.hash}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Amount:</span>
        <span className="text-white font-mono">{data.amount?.str}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Price:</span>
        <span className="text-white font-mono">{data.limit?.doubleAdjusted}</span>
      </div>
      {processed?.remaining && (
        <div className="flex items-center gap-4">
          <span className="text-white/50 w-32">Remaining:</span>
          <span className="text-white font-mono">{processed.remaining.str}</span>
        </div>
      )}
    </div>
  );
}

function RewardDetails({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">To:</span>
        <Link to={`/address/${data.toAddress}`} className="text-primary hover:underline font-mono">
          {data.toAddress}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Amount:</span>
        <span className="text-yellow-400 font-semibold text-lg">
          +{data.amount?.str || formatWart(data.amount)}
        </span>
      </div>
    </div>
  );
}

function MatchDetails({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline">
          {data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.hash}
        </Link>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="text-white/50 mb-2">Pool State</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-1">Before</div>
            <div className="text-white font-mono text-sm">
              Base: {data.poolBefore?.base?.str}<br />
              Quote: {data.poolBefore?.quote?.str}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-1">After</div>
            <div className="text-white font-mono text-sm">
              Base: {data.poolAfter?.base?.str}<br />
              Quote: {data.poolAfter?.quote?.str}
            </div>
          </div>
        </div>
      </div>

      {data.buySwaps && data.buySwaps.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <div className="text-white/50 mb-2">Buy Swaps ({data.buySwaps.length})</div>
          <div className="space-y-2">
            {data.buySwaps.map((swap, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <span className="text-white/50 text-sm w-20">History ID:</span>
                  <span className="text-white font-mono">{swap.historyId}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-white/50 text-sm w-20">Swapped:</span>
                  <span className="text-white font-mono text-sm">
                    Base: {swap.swapped?.base?.str} | Quote: {swap.swapped?.quote?.str}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.sellSwaps && data.sellSwaps.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <div className="text-white/50 mb-2">Sell Swaps ({data.sellSwaps.length})</div>
          <div className="space-y-2">
            {data.sellSwaps.map((swap, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <span className="text-white/50 text-sm w-20">History ID:</span>
                  <span className="text-white font-mono">{swap.historyId}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-white/50 text-sm w-20">Swapped:</span>
                  <span className="text-white font-mono text-sm">
                    Base: {swap.swapped?.base?.str} | Quote: {swap.swapped?.quote?.str}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransactionDetails({ tx, type }) {
  if (!tx) return null;

  const data = tx.transaction?.data || tx.data;
  const processed = tx.transaction?.processed || tx.processed;
  const signedCommon = tx.transaction?.signedCommon;

  const renderTxDetails = () => {
    switch (type) {
      case 'wartTransfer':
      case 'tokenTransfer':
        return <TransferDetails data={data} />;
      case 'assetCreation':
        return <AssetCreationDetails data={data} processed={processed} />;
      case 'cancelation':
        return <CancelationDetails data={data} processed={processed} />;
      case 'liquidityDeposit':
        return <LiquidityDepositDetails data={data} processed={processed} />;
      case 'liquidityWithdrawal':
        return <LiquidityWithdrawalDetails data={data} processed={processed} />;
      case 'limitSwap':
        return <LimitSwapDetails data={data} processed={processed} />;
      case 'reward':
        return <RewardDetails data={data} />;
      case 'match':
        return <MatchDetails data={data} />;
      default:
        return <div className="text-white/50">Unknown transaction type: {type}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {signedCommon && (
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-4">Signer</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-24">Sender:</span>
              <Link to={`/address/${signedCommon.originAddress}`} className="text-primary hover:underline font-mono text-sm">
                {signedCommon.originAddress}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-24">Fee:</span>
              <span className="text-white font-medium">{signedCommon.fee?.str || formatWart(signedCommon.fee)}</span>
            </div>
            {signedCommon.nonceId !== undefined && (
              <div className="flex items-center gap-4">
                <span className="text-white/50 w-24">Nonce:</span>
                <span className="text-white font-mono">{signedCommon.nonceId}</span>
              </div>
            )}
            {signedCommon.pinHeight !== undefined && (
              <div className="flex items-center gap-4">
                <span className="text-white/50 w-24">Pin Height:</span>
                <span className="text-white font-mono">{signedCommon.pinHeight}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        <h3 className="text-sm font-semibold text-white mb-4">Transaction Data</h3>
        {renderTxDetails()}
      </div>
    </div>
  );
}