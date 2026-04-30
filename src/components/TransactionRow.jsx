import { Link } from 'react-router-dom';
import { FaArrowRight, FaGift, FaCoins, FaExchangeAlt, FaPlus, FaMinus, FaTimes, FaClipboardList } from 'react-icons/fa';
import { formatAddress, formatWart, formatTimestamp, getTxTypeLabel, getTxTypeColor } from '../utils/format';
import CopyableValue from './CopyableValue';
import AddressWithTag from './AddressWithTag';

function TxTypeIcon({ type }) {
  const icons = {
    wartTransfer: FaExchangeAlt,
    tokenTransfer: FaExchangeAlt,
    assetCreation: FaPlus,
    cancelation: FaTimes,
    liquidityDeposit: FaPlus,
    liquidityWithdrawal: FaMinus,
    limitSwap: FaClipboardList,
    reward: FaGift,
    match: FaExchangeAlt,
  };
  const Icon = icons[type] || FaCoins;
  return <Icon size={14} />;
}

function TransferDisplay({ data }) {
  const isWart = !data.asset;
  const tokenspec = isWart ? 'WART' : `asset:${data.asset.hash}`;
  return (
    <div className="text-sm flex items-center gap-2">
      <CopyableValue value={data.amount?.str || (data.amount?.u64 !== undefined ? `${data.amount?.u64}` : formatWart(data.amount))} />
      {isWart ? (
        <Link to="/token/wart" className="text-primary hover:underline font-mono text-xs">
          WART
        </Link>
      ) : (
        <Link to={`/token/asset:${data.asset.hash}`} className="text-primary hover:underline font-mono text-xs">
          {data.asset.name} <span className="text-white/50">({formatAddress(data.asset.hash, 8)})</span>
        </Link>
      )}
      <span className="text-white/50">→</span>
      <AddressWithTag address={data.toAddress} tokenspec={tokenspec} />
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
    <div className="text-sm flex items-center gap-2">
      <CopyableValue value={data.deposited?.base?.str} />
      <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-xs">
        {data.baseAsset?.name}
      </Link>
      <span className="text-white/50">+</span>
      <CopyableValue value={data.deposited?.quote?.str} />
      <Link to="/token/wart" className="text-primary hover:underline font-mono text-xs">WART</Link>
      <span className="text-white/50">→</span>
      <CopyableValue value={processed?.sharesReceived?.str || '0'} />
      <Link to={`/token/liquidity:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-xs">
        {data.baseAsset?.name}-Liquidity <span className="text-white/50">({formatAddress(data.baseAsset?.hash, 8)})</span>
      </Link>
    </div>
  );
}

function LiquidityWithdrawalDisplay({ data, processed }) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <CopyableValue value={data.sharesRedeemed?.str || '0'} />
        <Link to={`/token/liquidity:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-xs">
          {data.baseAsset?.name}-Liquidity <span className="text-white/50">({formatAddress(data.baseAsset?.hash, 8)})</span>
        </Link>
        <span className="text-white/50">→</span>
      </div>
      <div className="text-xs text-white/70 mt-1">
        Receiving: Base <CopyableValue value={processed?.received?.base?.str} /> | Quote <CopyableValue value={processed?.received?.quote?.str} suffix="WART" />
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
    <div className="text-sm flex items-center gap-2">
      <CopyableValue value={data.amount?.str || formatWart(data.amount)} />
      <Link to="/token/wart" className="text-primary hover:underline font-mono text-xs">WART</Link>
      <span className="text-white/50">→</span>
      <AddressWithTag address={data.toAddress} />
    </div>
  );
}

function MatchDisplay({ data }) {
  return (
    <div className="text-sm">
      <div className="text-white/50">DEX Match:</div>
      <div className="mt-1">
        <Link to={`/token/asset:${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.name} <span className="text-white/50">({formatAddress(data.baseAsset?.hash, 8)})</span>
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
  const data = tx.transaction?.data || tx.data;
  const processed = tx.transaction?.processed || tx.processed;

  const renderTxDetails = () => {
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
            <AddressWithTag address={signedCommon.originAddress} />
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
