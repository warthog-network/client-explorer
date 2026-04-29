import { Link } from 'react-router-dom';
import { FaArrowRight, FaGift, FaCoins, FaExchangeAlt, FaPlus, FaMinus, FaTimes, FaSync } from 'react-icons/fa';
import { formatAddress, formatWart, formatTimestamp, getTxTypeLabel, getTxTypeColor } from '../utils/format';
import CopyableValue from './CopyableValue';

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
  return <Icon size={14} />;
}

function TransferDisplay({ data }) {
  const isWart = !data.asset;
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="text-white/50">To:</span>
        <Link to={`/address/${data.toAddress}`} className="text-primary hover:underline font-mono">
          {formatAddress(data.toAddress, 8)}
        </Link>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-white/50">Amount:</span>
        <CopyableValue value={data.amount?.str || (data.amount?.u64 !== undefined ? `${data.amount?.u64}` : formatWart(data.amount))} />
        {isWart ? (
          <span className="text-white font-mono text-sm">WART</span>
        ) : (
          <Link to={`/token/asset:${data.asset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {data.asset?.name} ({formatAddress(data.asset?.hash, 8)})
          </Link>
        )}
      </div>
    </div>
  );
}

function AssetCreationDisplay({ data, processed, txHash }) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="text-white/50 w-24">Name:</span>
        <span className="text-white font-mono text-sm">{data.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/50 w-24">Supply:</span>
        <CopyableValue value={data.supply?.str} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/50 w-24">Decimals:</span>
        <span className="text-white font-mono text-sm">{data.supply?.decimals}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/50 w-24">Created Asset:</span>
        {processed?.assetId ? (
          <Link to={`/token/asset:${txHash}`} className="text-primary hover:underline font-mono text-sm">
            #{processed.assetId}
          </Link>
        ) : (
          <span className="text-white/50 font-mono text-sm">Transaction not mined</span>
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
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
        </Link>
        <div className="text-xs text-white/70">
          Base: <CopyableValue value={data.deposited?.base?.str} /> | Quote: <CopyableValue value={data.deposited?.quote?.str} suffix="WART" />
        </div>
        {processed?.sharesReceived && (
          <div className="text-primary text-xs mt-1">
            Shares received: <CopyableValue value={processed.sharesReceived.str} />
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
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
        </Link>
        <div className="text-xs text-white/70">
          Shares: <CopyableValue value={data.sharesRedeemed?.str} />
        </div>
        {processed?.received && (
          <div className="text-xs text-white/70 mt-1">
            Received: Base <CopyableValue value={processed.received.base?.str} /> | Quote <CopyableValue value={processed.received.quote?.str} suffix="WART" />
          </div>
        )}
      </div>
    </div>
  );
}

function LimitSwapDisplay({ data, processed }) {
  const isBuy = data.buy;
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="text-white/50">Input:</span>
        {isBuy ? (
          <CopyableValue value={data.amount?.str} suffix="WART" />
        ) : (
          <>
            <CopyableValue value={data.amount?.str} />
            <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
              {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/50">Output:</span>
        {isBuy ? (
          <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
          </Link>
        ) : (
          <span className="text-white font-mono text-sm">WART</span>
        )}
      </div>
      <div className="text-xs text-white/70 mt-1">
        Price: {isBuy ? 'max.' : 'min.'} <CopyableValue value={data.limit?.doubleAdjusted} /> WART per {data.baseAsset?.name}
      </div>
      {processed?.remaining && (
        <div className="text-xs text-white/50 mt-1">
          Remaining: <CopyableValue value={processed.remaining.str} />
          {isBuy ? (
            <span className="text-white font-mono text-sm">WART</span>
          ) : (
            <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
              {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
            </Link>
          )}
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
      <CopyableValue value={data.amount?.str || formatWart(data.amount)} />
      <span className="text-white font-mono text-sm">WART</span>
    </div>
  );
}

function MatchDisplay({ data }) {
  return (
    <div className="text-sm">
      <div className="text-white/50">DEX Match:</div>
      <div className="mt-1">
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
        </Link>
        <div className="text-xs text-white/70">
          Pool: <CopyableValue value={data.poolBefore?.base?.str} /> → <CopyableValue value={data.poolAfter?.base?.str} />
        </div>
        <div className="text-xs text-primary mt-1">
          {data.buySwaps?.length || 0} buy swaps, {data.sellSwaps?.length || 0} sell swaps
        </div>
      </div>
    </div>
  );
}

export default function TransactionRow({ tx, type, showBlockLink = true, blockHeight, confirmations }) {
  if (!tx) return null;

  const txHash = tx.transaction?.hash || tx.hash;
  const signedCommon = tx.transaction?.signedCommon;

  const renderTxDetails = () => {
    const data = tx.transaction?.data || tx.data;
    const processed = tx.transaction?.processed || tx.processed;

    switch (type) {
      case 'wartTransfer':
      case 'tokenTransfer':
        return <TransferDisplay data={data} />;
      case 'assetCreation':
        return <AssetCreationDisplay data={data} processed={processed} txHash={txHash} />;
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
          {blockHeight && (
            <span className="text-xs text-white/50 font-mono">
              #{blockHeight}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-medium text-black ${getTxTypeColor(type)}`}>
            <span className="inline-flex items-center gap-1">
              <TxTypeIcon type={type} />
              {getTxTypeLabel(type)}
            </span>
          </span>
          {confirmations !== undefined && (
            <span className="text-xs text-white/30">
              {confirmations} conf
            </span>
          )}
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
