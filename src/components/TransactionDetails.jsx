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
            <Link to={`/token/asset:${data.asset?.hash}`} className="text-primary hover:underline">
              {data.asset?.name || formatAddress(data.asset?.hash, 8)}
            </Link>
          </>
        )}
      </div>
      {!isWart && data.asset?.hash && (
        <div className="flex items-center gap-4">
          <span className="text-white/50 w-24">Asset Hash:</span>
          <Link to={`/token/asset:${data.asset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {data.asset?.hash}
          </Link>
        </div>
      )}
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Amount:</span>
        <span className="text-white font-mono text-sm">
          {data.amount?.str || (data.amount?.u64 !== undefined ? `${data.amount?.u64}` : formatWart(data.amount))}
          {!isWart && data.asset?.decimals && <span className="text-white/50 ml-2">({data.asset.decimals} decimals)</span>}
        </span>
      </div>
    </div>
  );
}

function AssetCreationDetails({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Name:</span>
        <span className="text-white font-mono text-sm">{data.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Supply:</span>
        <span className="text-white font-mono text-sm">{data.supply?.str}</span>
      </div>
    </div>
  );
}

function CancelationDetails({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Account ID:</span>
        <span className="text-white font-mono text-sm">{data.cancelTxid?.accountId}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Nonce ID:</span>
        <span className="text-white font-mono text-sm">{data.cancelTxid?.nonceId}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Pin Height:</span>
        <span className="text-white font-mono text-sm">{data.cancelTxid?.pinHeight}</span>
      </div>
    </div>
  );
}

function LiquidityDepositDetails({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Base Amount:</span>
        <span className="text-white font-mono text-sm">{data.deposited?.base?.str}</span>
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Quote Amount:</span>
        <span className="text-white font-mono text-sm">{data.deposited?.quote?.str} WART</span>
      </div>
    </div>
  );
}

function LiquidityWithdrawalDetails({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline">
          {data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.hash}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Shares:</span>
        <span className="text-white font-mono text-sm">{data.sharesRedeemed?.str}</span>
      </div>
    </div>
  );
}

function LimitSwapDetails({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Side:</span>
        <span className={data.buy ? 'text-green-400 text-sm font-semibold' : 'text-red-400 text-sm font-semibold'}>
          {data.buy ? 'BUY' : 'SELL'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline">
          {data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.hash}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Amount:</span>
        <span className="text-white font-mono text-sm">{data.amount?.str}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Price:</span>
        <span className="text-white font-mono text-sm">{data.limit?.doubleAdjusted}</span>
      </div>
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
        <span className="text-yellow-400 font-semibold text-sm">
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
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline">
          {data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
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
                  <span className="text-white font-mono text-sm">{swap.historyId}</span>
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
                  <span className="text-white font-mono text-sm">{swap.historyId}</span>
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

export default function TransactionDetails({ tx, type, mined }) {
  if (!tx) return null;

  const data = tx.transaction?.data || tx.data;
  const processed = tx.transaction?.processed || tx.processed;

  const typesWithResult = ['assetCreation', 'cancelation', 'liquidityDeposit', 'liquidityWithdrawal', 'limitSwap'];
  const showResult = typesWithResult.includes(type);

  const renderTxDetails = () => {
    switch (type) {
      case 'wartTransfer':
      case 'tokenTransfer':
        return <TransferDetails data={data} />;
      case 'assetCreation':
        return <AssetCreationDetails data={data} />;
      case 'cancelation':
        return <CancelationDetails data={data} />;
      case 'liquidityDeposit':
        return <LiquidityDepositDetails data={data} />;
      case 'liquidityWithdrawal':
        return <LiquidityWithdrawalDetails data={data} />;
      case 'limitSwap':
        return <LimitSwapDetails data={data} />;
      case 'reward':
        return <RewardDetails data={data} />;
      case 'match':
        return <MatchDetails data={data} />;
      default:
        return <div className="text-white/50">Unknown transaction type: {type}</div>;
    }
  };

  const renderResult = (data) => {
    if (!mined) {
      return <div className="text-white/50">Transaction not yet mined</div>;
    }
    switch (type) {
      case 'assetCreation':
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-24">Asset ID:</span>
            <span className="text-primary font-mono text-sm">{processed.assetId}</span>
          </div>
        );
      case 'cancelation':
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-24">Canceled:</span>
            <span className="text-white font-mono text-sm">{processed.canceledTxHash}</span>
          </div>
        );
      case 'liquidityDeposit':
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Shares Received:</span>
            <span className="text-white font-mono text-sm">{processed.sharesReceived.str}</span>
            <Link to={`/token/liquidity:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
              {data.baseAsset?.name}-Liquidity ({formatAddress(data.baseAsset?.hash, 8)})
            </Link>
          </div>
        );
      case 'liquidityWithdrawal':
        return (
          <>
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-32">Base Received:</span>
              <span className="text-white font-mono text-sm">{processed.received.base?.str}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-32">Quote Received:</span>
              <span className="text-white font-mono text-sm">{processed.received.quote?.str} WART</span>
            </div>
          </>
        );
      case 'limitSwap':
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Remaining:</span>
            <span className="text-white font-mono text-sm">{processed.remaining.str}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="border-t border-white/10 pt-4">
        <h3 className="text-xs text-white/50 mb-2">{getTxTypeLabel(type)}</h3>
        {renderTxDetails()}
      </div>

      {showResult && (
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-xs text-white/50 mb-2">Result</h3>
          {renderResult(data)}
        </div>
      )}
    </>
  );
}