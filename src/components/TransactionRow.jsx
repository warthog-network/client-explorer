import { Link } from 'react-router-dom';
import { FaArrowRight, FaGift, FaCoins, FaExchangeAlt, FaPlus, FaMinus, FaTimes, FaSync } from 'react-icons/fa';
import { formatAddress, formatWart, formatTimestamp, getTxTypeLabel, getTxTypeColor } from '../utils/format';

function TxTypeIcon({ type }) {
  const icons = {
    wartTransfer: FaCoins,
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
  return <Icon size={14} />;
}

function WartTransferDisplay({ data }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-white/50">To:</span>
      <Link to={`/address/${data.toAddress}`} className="text-primary hover:underline font-mono">
        {formatAddress(data.toAddress, 8)}
      </Link>
      <span className="text-white/50">Amount:</span>
      <span className="text-white font-medium">{data.amount?.str || formatWart(data.amount)}</span>
    </div>
  );
}

function TokenTransferDisplay({ data }) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="text-white/50">To:</span>
        <Link to={`/address/${data.toAddress}`} className="text-primary hover:underline font-mono">
          {formatAddress(data.toAddress, 8)}
        </Link>
        <span className="text-white/50">Asset:</span>
        <span className="text-white">{data.asset?.name || formatAddress(data.asset?.hash, 6)}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-white/50">Amount:</span>
        <span className="text-white font-medium">
          {data.amount?.str || `${data.amount?.u64}`}
          {data.asset?.decimals && <span className="text-white/50"> ({data.asset.decimals} decimals)</span>}
        </span>
      </div>
    </div>
  );
}

function AssetCreationDisplay({ data, processed }) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="text-white/50">Name:</span>
        <span className="text-white font-medium">{data.name}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-white/50">Supply:</span>
        <span className="text-white">{data.supply?.str}</span>
        {processed?.assetId && (
          <span className="text-primary">(ID: {processed.assetId})</span>
        )}
      </div>
    </div>
  );
}

function CancelationDisplay({ data, processed }) {
  return (
    <div className="text-sm">
      <div className="text-white/50">Canceling transaction:</div>
      <div className="mt-1 font-mono text-xs text-white">
        Account {data.cancelTxid?.accountId}, Nonce {data.cancelTxid?.nonceId}, Pin Height {data.cancelTxid?.pinHeight}
      </div>
      {processed?.canceledTxHash && (
        <div className="mt-1 text-xs text-white/50">
          Canceled order: {formatAddress(processed.canceledTxHash, 8)}
        </div>
      )}
    </div>
  );
}

function LiquidityDepositDisplay({ data, processed }) {
  return (
    <div className="text-sm">
      <div className="text-white/50">Depositing into liquidity pool:</div>
      <div className="mt-1">
        <span className="text-white">{data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 6)}</span>
        <div className="text-xs text-white/70">
          Base: {data.deposited?.base?.str} | Quote: {data.deposited?.quote?.str}
        </div>
        {processed?.sharesReceived && (
          <div className="text-primary text-xs mt-1">
            Shares received: {processed.sharesReceived.str}
          </div>
        )}
      </div>
    </div>
  );
}

function LiquidityWithdrawalDisplay({ data, processed }) {
  return (
    <div className="text-sm">
      <div className="text-white/50">Withdrawing from liquidity pool:</div>
      <div className="mt-1">
        <span className="text-white">{data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 6)}</span>
        <div className="text-xs text-white/70">
          Shares redeemed: {data.sharesRedeemed?.str}
        </div>
        {processed?.received && (
          <div className="text-xs text-white/70 mt-1">
            Received: Base {processed.received.base?.str} | Quote {processed.received.quote?.str}
          </div>
        )}
      </div>
    </div>
  );
}

function LimitSwapDisplay({ data, processed }) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className={data.buy ? 'text-green-400' : 'text-red-400'}>
          {data.buy ? 'BUY' : 'SELL'}
        </span>
        <span className="text-white">{data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 6)}</span>
      </div>
      <div className="text-xs text-white/70 mt-1">
        Amount: {data.amount?.str} @ {data.limit?.doubleAdjusted}
      </div>
      {processed?.remaining && (
        <div className="text-xs text-white/50 mt-1">
          Remaining: {processed.remaining.str}
        </div>
      )}
    </div>
  );
}

function RewardDisplay({ data }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-white/50">To:</span>
      <Link to={`/address/${data.toAddress}`} className="text-primary hover:underline font-mono">
        {formatAddress(data.toAddress, 8)}
      </Link>
      <span className="text-yellow-400 font-semibold">
        +{data.amount?.str || formatWart(data.amount)}
      </span>
    </div>
  );
}

function MatchDisplay({ data }) {
  return (
    <div className="text-sm">
      <div className="text-white/50">DEX Match:</div>
      <div className="mt-1">
        <span className="text-white">{data.baseAsset?.name || formatAddress(data.baseAsset?.hash, 6)}</span>
        <div className="text-xs text-white/70">
          Pool: {data.poolBefore?.base?.str} → {data.poolAfter?.base?.str}
        </div>
        <div className="text-xs text-primary mt-1">
          {data.buySwaps?.length || 0} buy swaps, {data.sellSwaps?.length || 0} sell swaps
        </div>
      </div>
    </div>
  );
}

export default function TransactionRow({ tx, type, showBlockLink = true }) {
  if (!tx) return null;

  const txHash = tx.transaction?.hash || tx.hash;
  const signedCommon = tx.transaction?.signedCommon;

  const renderTxDetails = () => {
    const data = tx.transaction?.data || tx.data;
    const processed = tx.transaction?.processed || tx.processed;

    switch (type) {
      case 'wartTransfer':
        return <WartTransferDisplay data={data} />;
      case 'tokenTransfer':
        return <TokenTransferDisplay data={data} />;
      case 'assetCreation':
        return <AssetCreationDisplay data={data} processed={processed} />;
      case 'cancelation':
        return <CancelationDisplay data={data} processed={processed} />;
      case 'liquidityDeposit':
        return <LiquidityDepositDisplay data={data} processed={processed} />;
      case 'liquidityWithdrawal':
        return <LiquidityWithdrawalDisplay data={data} processed={processed} />;
      case 'limitSwap':
        return <LimitSwapDisplay data={data} processed={processed} />;
      case 'reward':
        return <RewardDisplay data={data} />;
      case 'match':
        return <MatchDisplay data={data} />;
      default:
        return <div className="text-white/50">Unknown transaction type: {type}</div>;
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium text-black ${getTxTypeColor(type)}`}>
            <span className="inline-flex items-center gap-1">
              <TxTypeIcon type={type} />
              {getTxTypeLabel(type)}
            </span>
          </span>
        </div>
        {showBlockLink && txHash && (
          <span className="text-xs text-primary font-mono">
            {formatAddress(txHash, 8)}
          </span>
        )}
      </div>

      {renderTxDetails()}

      {signedCommon && (
        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span>From:</span>
            <Link to={`/address/${signedCommon.originAddress}`} className="text-primary hover:underline font-mono">
              {formatAddress(signedCommon.originAddress, 8)}
            </Link>
            <span>Fee:</span>
            <span>{signedCommon.fee?.str || formatWart(signedCommon.fee)}</span>
          </div>
        </div>
      )}
    </>
  );

  if (showBlockLink && txHash) {
    return (
      <Link
        to={`/tx/${txHash}`}
        className="block p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      {content}
    </div>
  );
}