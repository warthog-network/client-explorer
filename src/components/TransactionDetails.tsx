import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';
import { FaGift, FaCoins, FaExchangeAlt, FaPlus, FaMinus, FaTimes, FaClipboardList } from 'react-icons/fa';
import { formatAddress, formatWart, getTxTypeLabel, getTxTypeColor } from '../utils/format';
import CopyableValue from './CopyableValue';
import AddressWithTag from './AddressWithTag';
import type {
  DisplayTransaction,
  NodeAssetBasic,
  NodeAssetCreationData,
  NodeAssetCreationProcessed,
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
  NodeProcessed,
  NodeRewardData,
  NodeSignedTransaction,
  NodeTokenTransferData,
  NodeUnsignedTransaction,
  NodeWart,
  NodeWartTransferData,
} from '../types/node';

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
  return <Icon size={16} />;
}

/** A transfer amount is a `Wart` for wartTransfer, a `FundsDecimal` otherwise. */
function copyableAmount(amount: NodeWart | NodeFundsDecimal | undefined): string {
  if (!amount) return '';
  const { str, E8, u64 } = amount as { str?: string; E8?: number; u64?: number };
  if (str) return str;
  if (u64 !== undefined) return `${u64}`;
  if (E8 !== undefined) return formatWart(amount as NodeWart);
  return '';
}

function asProcessed<T extends NodeProcessed>(p: NodeProcessed | undefined): T | undefined {
  return p as T | undefined;
}

function TransferDetails({
  data,
}: {
  data: NodeWartTransferData | NodeTokenTransferData;
}) {
  const isWart = !(data as NodeTokenTransferData).asset;
  const asset = (data as NodeTokenTransferData).asset;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">To:</span>
        <AddressWithTag address={data.toAddress} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Amount:</span>
        <CopyableValue value={copyableAmount(data.amount)} />
        {isWart ? (
          <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
        ) : (
          <Link to={`/asset/${asset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {asset?.name} ({formatAddress(asset?.hash, 8)})
          </Link>
        )}
      </div>
    </div>
  );
}

function AssetCreationDetails({
  data,
  txHash,
}: {
  data: NodeAssetCreationData;
  processed: NodeAssetCreationProcessed | undefined;
  txHash?: string;
}) {
  // An asset's hash is its creation transaction's hash, so fall back to that.
  const assetHash = txHash;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Name:</span>
        <CopyableValue value={data.name} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Supply:</span>
        <CopyableValue value={data.supply?.str} />
        {assetHash && (
          <Link to={`/asset/${assetHash}/`} className="text-primary hover:underline font-mono text-sm">
            {data.name} ({formatAddress(assetHash, 8)})
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Decimals:</span>
        <CopyableValue value={String(data.supply?.decimals)} />
      </div>
    </div>
  );
}

function CancelationDetails({ data }: { data: NodeCancelationData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Account ID:</span>
        <CopyableValue value={String(data.cancelTxid?.accountId)} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Nonce ID:</span>
        <CopyableValue value={String(data.cancelTxid?.nonceId)} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Pin Height:</span>
        <CopyableValue value={String(data.cancelTxid?.pinHeight)} />
      </div>
    </div>
  );
}

function LiquidityDepositDetails({ data }: { data: NodeLiquidityDepositData }) {
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Base Amount:</span>
        <CopyableValue value={data.deposited?.base?.str} />
        <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Quote Amount:</span>
        <CopyableValue value={data.deposited?.quote?.str} />
        <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
      </div>
    </div>
  );
}

function LiquidityWithdrawalDetails({ data }: { data: NodeLiquidityWithdrawalData }) {
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline">
          {baseAsset?.name || formatAddress(baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {baseAsset?.hash}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Shares:</span>
        <CopyableValue value={data.sharesRedeemed?.str} />
        <Link to={`/asset/${baseAsset?.hash}/liquidity`} className="text-primary hover:underline font-mono text-sm">
          {baseAsset?.name}-Liquidity ({formatAddress(baseAsset?.hash, 8)})
        </Link>
      </div>
    </div>
  );
}

function LimitSwapDetails({ data }: { data: NodeLimitSwapData }) {
  const isBuy = data.buy;
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Input:</span>
        <CopyableValue value={data.amount?.str} />
        {isBuy ? (
          <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
        ) : (
          <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Output:</span>
        {isBuy ? (
          <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})
          </Link>
        ) : (
          <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Price:</span>
        <span className="text-white font-mono text-sm">
          {isBuy ? 'max.' : 'min.'} <CopyableValue value={data.limit?.doubleAdjusted} /> WART per {baseAsset?.name}
        </span>
      </div>
    </div>
  );
}

function RewardDetails({ data }: { data: NodeRewardData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">To:</span>
        <AddressWithTag address={data.toAddress} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Amount:</span>
        <CopyableValue value={data.amount?.str || formatWart(data.amount)} />
        <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
      </div>
    </div>
  );
}

function SwapLeg({ swap, baseAsset, reverse }: { swap: NodeSwapLeg; baseAsset?: NodeAssetBasic; reverse?: boolean }) {
  const base = <CopyableValue value={swap.swapped?.base?.str} />;
  const quote = <CopyableValue value={swap.swapped?.quote?.str} />;
  const baseLink = (
    <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
      {baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})
    </Link>
  );
  const quoteLink = (
    <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
  );
  return (
    <div key={swap.historyId} className="bg-white/5 rounded-lg p-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 text-sm w-20">History ID:</span>
        <span className="text-white font-mono text-sm">{swap.historyId}</span>
      </div>
      <div className="flex items-center gap-4 mt-1">
        <span className="text-white/50 text-sm w-20">Swapped:</span>
        <span className="text-white font-mono text-sm">
          {reverse ? (<>{quote} {quoteLink} → {base} {baseLink}</>) : (<>{base} {baseLink} → {quote} {quoteLink}</>)}
        </span>
      </div>
    </div>
  );
}

type NodeSwapLeg = NonNullable<NodeMatchData['buySwaps']>[number];

function SwapLegList({
  title,
  legs,
  baseAsset,
  reverse,
}: {
  title: string;
  legs: NodeSwapLeg[] | undefined;
  baseAsset?: NodeAssetBasic;
  reverse?: boolean;
}) {
  if (!legs || legs.length === 0) return null;
  return (
    <div className="border-t border-white/10 pt-4">
      <div className="text-white/50 mb-2">{title} ({legs.length})</div>
      <div className="space-y-2">
        {legs.map((swap) => (
          <SwapLeg key={swap.historyId} swap={swap} baseAsset={baseAsset} reverse={reverse} />
        ))}
      </div>
    </div>
  );
}

function MatchDetails({ data }: { data: NodeMatchData }) {
  const baseAsset = data.baseAsset as NodeAssetBasic | undefined;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Name:</span>
        <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline">
          {baseAsset?.name || formatAddress(baseAsset?.hash, 8)}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Asset Hash:</span>
        <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {baseAsset?.hash}
        </Link>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="text-white/50 mb-2">Pool State</div>
        <div className="grid grid-cols-2 gap-4">
          {(['Before', 'After'] as const).map((label) => {
            const pool = label === 'Before' ? data.poolBefore : data.poolAfter;
            return (
              <div key={label} className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">{label}</div>
                <div className="text-white font-mono text-sm">
                  Base: <CopyableValue value={pool?.base?.str} /> <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">{baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})</Link><br />
                  Quote: <CopyableValue value={pool?.quote?.str} /> <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SwapLegList title="Buy Swaps" legs={data.buySwaps} baseAsset={baseAsset} />
      <SwapLegList title="Sell Swaps" legs={data.sellSwaps} baseAsset={baseAsset} reverse />
    </div>
  );
}

function normalizeTransaction(tx: DisplayTransaction) {
  const inner: Partial<NodeSignedTransaction & NodeUnsignedTransaction> =
    'transaction' in tx && tx.transaction
      ? tx.transaction
      : (tx as Partial<NodeSignedTransaction & NodeUnsignedTransaction>);
  return {
    hash: inner.hash,
    data: inner.data,
    processed: inner.processed as NodeProcessed | undefined,
  };
}

/** Kinds whose `processed` payload the node only fills in once mined. */
const TYPES_WITH_RESULT = [
  'assetCreation',
  'cancelation',
  'liquidityDeposit',
  'liquidityWithdrawal',
  'limitSwap',
];

interface TransactionDetailsProps {
  tx: DisplayTransaction | null | undefined;
  type: string;
  mined?: unknown;
}

export default function TransactionDetails({ tx, type, mined }: TransactionDetailsProps) {
  if (!tx) return null;

  const { hash: txHash, data, processed } = normalizeTransaction(tx);
  const showResult = TYPES_WITH_RESULT.includes(type);

  /**
   * As in TransactionRow, `type` is a sibling prop, so each branch casts to
   * the payload the schema defines for that kind.
   */
  const renderTxDetails = () => {
    switch (type) {
      case 'wartTransfer':
      case 'tokenTransfer':
        return <TransferDetails data={data as NodeWartTransferData | NodeTokenTransferData} />;
      case 'assetCreation':
        return <AssetCreationDetails data={data as NodeAssetCreationData} processed={asProcessed<NodeAssetCreationProcessed>(processed)} txHash={txHash} />;
      case 'cancelation':
        return <CancelationDetails data={data as NodeCancelationData} />;
      case 'liquidityDeposit':
        return <LiquidityDepositDetails data={data as NodeLiquidityDepositData} />;
      case 'liquidityWithdrawal':
        return <LiquidityWithdrawalDetails data={data as NodeLiquidityWithdrawalData} />;
      case 'limitSwap':
        return <LimitSwapDetails data={data as NodeLimitSwapData} />;
      case 'reward':
        return <RewardDetails data={data as NodeRewardData} />;
      case 'match':
        return <MatchDetails data={data as NodeMatchData} />;
      default:
        return <div className="text-white/50">Unknown transaction type: {type}</div>;
    }
  };

  /**
   * `processed` is only present once the chain has acted on the transaction,
   * which can lag `mined`. Every branch reads it optionally; four of the five
   * previously dereferenced it bare, so a mined-but-unprocessed transaction of
   * those kinds threw instead of rendering.
   */
  const renderResult = () => {
    if (!mined) {
      return <div className="text-white/50">Transaction not yet mined</div>;
    }
    switch (type) {
      case 'assetCreation': {
        const p = asProcessed<NodeAssetCreationProcessed>(processed);
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-24">Created Asset:</span>
            {p?.assetId ? (
              <Link to={`/asset/${txHash}`} className="text-primary hover:underline font-mono text-sm">
                #{p.assetId}
              </Link>
            ) : (
              <span className="text-white/50 font-mono text-sm">Transaction not mined</span>
            )}
          </div>
        );
      }
      case 'cancelation': {
        const p = asProcessed<NodeCancelationProcessed>(processed);
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-24">Canceled:</span>
            <CopyableValue value={p?.canceledTxHash ?? undefined} />
          </div>
        );
      }
      case 'liquidityDeposit': {
        const p = asProcessed<NodeLiquidityDepositProcessed>(processed);
        const baseAsset = (data as NodeLiquidityDepositData | undefined)?.baseAsset as NodeAssetBasic | undefined;
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Shares Received:</span>
            <CopyableValue value={p?.sharesReceived?.str} />
            <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
              {baseAsset?.name}-Liquidity ({formatAddress(baseAsset?.hash, 8)})
            </Link>
          </div>
        );
      }
      case 'liquidityWithdrawal': {
        const p = asProcessed<NodeLiquidityWithdrawalProcessed>(processed);
        const baseAsset = (data as NodeLiquidityWithdrawalData | undefined)?.baseAsset as NodeAssetBasic | undefined;
        return (
          <>
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-32">Base Received:</span>
              <CopyableValue value={p?.received?.base?.str} />
              <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
                {baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-32">Quote Received:</span>
              <CopyableValue value={p?.received?.quote?.str} suffix="WART" />
            </div>
          </>
        );
      }
      case 'limitSwap': {
        const p = asProcessed<NodeLimitSwapProcessed>(processed);
        const swap = data as NodeLimitSwapData | undefined;
        const baseAsset = swap?.baseAsset as NodeAssetBasic | undefined;
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Remaining:</span>
            <CopyableValue value={p?.remaining?.str} />
            {swap?.buy ? (
              <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
            ) : (
              <Link to={`/asset/${baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
                {baseAsset?.name} ({formatAddress(baseAsset?.hash, 8)})
              </Link>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <div className="border-t border-white/10 pt-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-black ${getTxTypeColor(type)}`}>
          <TxTypeIcon type={type} />
          {getTxTypeLabel(type)}
        </span>
        {renderTxDetails()}
      </div>

      {showResult && (
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-xs text-white/50 mb-2">Result</h3>
          {renderResult()}
        </div>
      )}
    </>
  );
}