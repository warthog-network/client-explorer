import { Link, useNavigate } from 'react-router-dom';
import type { IconType } from 'react-icons';
import { FaArrowRight, FaGift, FaCoins, FaExchangeAlt, FaPlus, FaMinus, FaTimes, FaClipboardList } from 'react-icons/fa';
import { formatAddress, formatWart, getTxTypeLabel, getTxTypeColor } from '../utils/format';
import CopyableValue from './CopyableValue';
import AddressWithTag from './AddressWithTag';
import type {
  NodeAssetCreationData,
  NodeAssetCreationProcessed,
  NodeAssetBasic,
  NodeBaseQuote,
  NodeCancelationData,
  NodeCancelationProcessed,
  NodeFundsDecimal,
  NodeLimitSwapData,
  NodeLimitSwapProcessed,
  NodeLiquidityDepositData,
  NodeLiquidityDepositProcessed,
  NodeLiquidityWithdrawalData,
  NodeLiquidityWithdrawalProcessed,
  NodeMatchData,
  NodeRewardData,
  NodeTransactionId,
  NodeTransactionSignedCommon,
  NodeWart,
  NodeWartTransferData,
  NodeTokenTransferData,
  DisplayTransaction,
  NodeProcessed,
} from '../types/node';

/**
 * The four fields TransactionRow and TransactionDetails read off a
 * transaction, whichever of the accepted shapes it arrived in.
 */
interface NormalizedTx {
  hash?: string;
  data?: unknown;
  signedCommon?: NodeTransactionSignedCommon;
  processed?: NodeProcessed;
}

const TX_ICONS: Record<string, IconType> = {
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

function TxTypeIcon({ type }: { type: string }) {
  const Icon = TX_ICONS[type] || FaCoins;
  return <Icon size={14} />;
}

/**
 * Amount rendered for copy: the node's own decimal string when it has one.
 *
 * A transfer amount is a `Wart` for wartTransfer and a `FundsDecimal` for
 * tokenTransfer, so both field sets are read. The original inlined
 * `amount.str || (amount.u64 ?? formatWart(amount))`; spelled out because the
 * two node money types carry different fields.
 */
function copyableAmount(amount: NodeWart | NodeFundsDecimal | undefined): string {
  if (!amount) return '';
  const { str, E8, u64 } = amount as { str?: string; E8?: number; u64?: number };
  if (str) return str;
  if (u64 !== undefined) return `${u64}`;
  if (E8 !== undefined) return formatWart(amount as NodeWart);
  return '';
}

/** The `processed` payload narrowed to the kind currently being rendered. */
function asProcessed<T extends NodeProcessed>(p: NodeProcessed | undefined): T | undefined {
  return p as T | undefined;
}

function TransferDisplay({
  data,
}: {
  data: NodeWartTransferData | NodeTokenTransferData;
}) {
  const isWart = !(data as NodeTokenTransferData).asset;
  const asset = (data as NodeTokenTransferData).asset;
  const tokenspec = isWart ? 'WART' : `asset:${asset?.hash}`;
  return (
    <div className="text-sm flex items-center gap-2">
      <CopyableValue value={copyableAmount(data.amount)} />
      {isWart ? (
        <Link to="/asset/wart" className="text-primary hover:underline font-mono text-xs">
          WART
        </Link>
      ) : (
        <Link to={`/asset/${asset?.hash}`} className="text-primary hover:underline font-mono text-xs">
          {asset?.name} <span className="text-white/50">({formatAddress(asset?.hash, 8)})</span>
        </Link>
      )}
      <span className="text-white/50">→</span>
      <AddressWithTag address={data.toAddress} tokenspec={tokenspec} />
    </div>
  );
}

function AssetCreationDisplay({
  data,
  processed,
  txHash,
}: {
  data: NodeAssetCreationData;
  processed: NodeAssetCreationProcessed | undefined;
  txHash?: string;
}) {
  return (
    <div className="text-sm flex items-center gap-1">
      <CopyableValue value={data.supply?.str} />
      {processed?.assetId ? (
        <>
          <Link to={`/asset/${txHash}`} className="text-primary hover:underline">
            {data.name}
          </Link>
          <span className="text-white/50">with </span>
          <CopyableValue value={String(data.supply?.decimals)} className="text-white" />
          <span className="text-white/50">Decimals</span>
        </>
      ) : (
        <>
          <span>{data.name}</span>
          <span className="text-white/50">with </span>
          <CopyableValue value={String(data.supply?.decimals)} className="text-white" />
          <span className="text-white/50">Decimals</span>
        </>
      )}
    </div>
  );
}

function CancelationDisplay({
  data,
  processed,
}: {
  data: NodeCancelationData;
  processed: NodeCancelationProcessed | undefined;
}) {
  const cancelTxid: NodeTransactionId | undefined = data.cancelTxid;
  return (
    <div className="text-sm">
      <div className="text-white/50">Canceling transaction:</div>
      <div className="mt-1 font-mono text-xs text-white">
        Account {cancelTxid?.accountId}, Nonce {cancelTxid?.nonceId}, Pin Height {cancelTxid?.pinHeight}
      </div>
      {processed?.canceledTxHash && (
        <div className="mt-1 text-xs text-white/50">
          Canceled order: {formatAddress(processed.canceledTxHash, 8)}
        </div>
      )}
    </div>
  );
}

function LiquidityDepositDisplay({
  data,
  processed,
}: {
  data: NodeLiquidityDepositData;
  processed: NodeLiquidityDepositProcessed | undefined;
}) {
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  return (
    <div className="text-sm flex items-center gap-2">
      <CopyableValue value={data.deposited?.base?.str} />
      <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-xs">
        {baseAsset?.name}
      </Link>
      <span className="text-white/50">+</span>
      <CopyableValue value={data.deposited?.quote?.str} />
      <Link to="/asset/wart" className="text-primary hover:underline font-mono text-xs">WART</Link>
      <span className="text-white/50">→</span>
      <CopyableValue value={processed?.sharesReceived?.str || '0'} />
      <Link to={`/asset/${baseAsset?.hash}/liquidity`} className="text-primary hover:underline font-mono text-xs">
        {baseAsset?.name}-Liquidity <span className="text-white/50">({formatAddress(baseAsset?.hash, 8)})</span>
      </Link>
    </div>
  );
}

function LiquidityWithdrawalDisplay({
  data,
  processed,
}: {
  data: NodeLiquidityWithdrawalData;
  processed: NodeLiquidityWithdrawalProcessed | undefined;
}) {
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <CopyableValue value={data.sharesRedeemed?.str || '0'} />
        <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-xs">
          {baseAsset?.name}-Liquidity <span className="text-white/50">({formatAddress(baseAsset?.hash, 8)})</span>
        </Link>
        <span className="text-white/50">→</span>
      </div>
      <div className="text-xs text-white/70 mt-1">
        Receiving: Base <CopyableValue value={processed?.received?.base?.str} /> | Quote <CopyableValue value={processed?.received?.quote?.str} suffix="WART" />
      </div>
    </div>
  );
}

function LimitSwapDisplay({
  data,
  processed,
}: {
  data: NodeLimitSwapData;
  processed: NodeLimitSwapProcessed | undefined;
}) {
  const isBuy = data.buy;
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  const assetLink = (
    <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
      {baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})
    </Link>
  );
  const wartLink = (
    <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
  );
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="text-white/50">Input:</span>
        <CopyableValue value={data.amount?.str} />
        {isBuy ? wartLink : assetLink}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/50">Output:</span>
        {isBuy ? assetLink : wartLink}
      </div>
      <div className="text-xs text-white/70 mt-1">
        Price: {isBuy ? 'max.' : 'min.'} <CopyableValue value={data.limit?.doubleAdjusted} /> WART per {baseAsset?.name}
      </div>
      {processed?.remaining && (
        <div className="text-xs text-white/50 mt-1">
          Remaining: <CopyableValue value={processed.remaining.str} />
          {isBuy ? wartLink : assetLink}
        </div>
      )}
    </div>
  );
}

function RewardDisplay({ data }: { data: NodeRewardData }) {
  return (
    <div className="text-sm flex items-center gap-2">
      <CopyableValue value={data.amount?.str || formatWart(data.amount)} />
      <Link to="/asset/wart" className="text-primary hover:underline font-mono text-xs">WART</Link>
      <span className="text-white/50">→</span>
      <AddressWithTag address={data.toAddress} />
    </div>
  );
}

function MatchDisplay({ data }: { data: NodeMatchData }) {
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  const poolBefore = data.poolBefore as NodeBaseQuote | undefined;
  const poolAfter = data.poolAfter as NodeBaseQuote | undefined;
  return (
    <div className="text-sm">
      <div className="text-white/50">DEX Match:</div>
      <div className="mt-1">
        <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {baseAsset?.name} <span className="text-white/50">({formatAddress(baseAsset?.hash, 8)})</span>
        </Link>
        <div className="text-xs text-white/70">
          Pool: <CopyableValue value={poolBefore?.base?.str} /> <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-xs">{baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})</Link> → <CopyableValue value={poolAfter?.base?.str} /> <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-xs">{baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})</Link>
        </div>
        <div className="text-xs text-primary mt-1">
          {data.buySwaps?.length || 0} buy swaps, {data.sellSwaps?.length || 0} sell swaps
        </div>
      </div>
    </div>
  );
}

/**
 * Flatten whichever of the three accepted shapes was passed into the fields
 * the row renders. The old code chained `tx.transaction?.hash || tx.hash` at
 * each access site; doing it once keeps the union from leaking into the
 * display components.
 */
function normalizeTransaction(tx: DisplayTransaction) {
  // Entries wrap the transaction; a bare transaction is its own inner value.
  // The cast is the union boundary: every accepted shape carries these four
  // fields or none of them.
  const inner = ('transaction' in tx && tx.transaction ? tx.transaction : tx) as NormalizedTx;
  return {
    hash: inner.hash,
    data: inner.data,
    signedCommon: inner.signedCommon,
    processed: inner.processed,
  };
}

interface TransactionRowProps {
  tx: DisplayTransaction | null | undefined;
  type: string;
  showBlockLink?: boolean;
  blockHeight?: number;
  confirmations?: number;
}

export default function TransactionRow({
  tx,
  type,
  showBlockLink = true,
  blockHeight,
  confirmations,
}: TransactionRowProps) {
  if (!tx) return null;

  const navigate = useNavigate();
  const { hash: txHash, data, signedCommon, processed } = normalizeTransaction(tx);

  /**
   * The node does not tag a transaction's kind inside the object, so `type`
   * arrives as a sibling prop and TypeScript cannot correlate the two across
   * the prop boundary. Each branch narrows to the payload the schema defines
   * for that kind, which is where the checking actually pays off.
   */
  const renderTxDetails = () => {
    switch (type) {
      case 'wartTransfer':
      case 'tokenTransfer':
        return <TransferDisplay data={data as NodeWartTransferData | NodeTokenTransferData} />;
      case 'assetCreation':
        return <AssetCreationDisplay data={data as NodeAssetCreationData} processed={asProcessed<NodeAssetCreationProcessed>(processed)} txHash={txHash} />;
      case 'cancelation':
        return <CancelationDisplay data={data as NodeCancelationData} processed={asProcessed<NodeCancelationProcessed>(processed)} />;
      case 'liquidityDeposit':
        return <LiquidityDepositDisplay data={data as NodeLiquidityDepositData} processed={asProcessed<NodeLiquidityDepositProcessed>(processed)} />;
      case 'liquidityWithdrawal':
        return <LiquidityWithdrawalDisplay data={data as NodeLiquidityWithdrawalData} processed={asProcessed<NodeLiquidityWithdrawalProcessed>(processed)} />;
      case 'limitSwap':
        return <LimitSwapDisplay data={data as NodeLimitSwapData} processed={asProcessed<NodeLimitSwapProcessed>(processed)} />;
      case 'reward':
        return <RewardDisplay data={data as NodeRewardData} />;
      case 'match':
        return <MatchDisplay data={data as NodeMatchData} />;
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
      <div
        onClick={() => navigate(`/tx/${txHash}`)}
        className="block p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer"
      >
        {content}
      </div>
    );
  }

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      {content}
    </div>
  );
}