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
  return <Icon size={16} />;
}

function TransferDetails({ data }) {
  const isWart = !data.asset;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">To:</span>
        <AddressWithTag address={data.toAddress} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Amount:</span>
        <CopyableValue value={data.amount?.str || (data.amount?.u64 !== undefined ? `${data.amount?.u64}` : formatWart(data.amount))} />
        {isWart ? (
          <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
        ) : (
          <Link to={`/asset/${data.asset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {data.asset?.name} ({formatAddress(data.asset?.hash, 8)})
          </Link>
        )}
      </div>
    </div>
  );
}

function AssetCreationDetails({ data, processed, txHash }) {
  const assetHash = data.hash || txHash;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-24">Name:</span>
        <span className="text-white font-mono text-sm">{data.name}</span>
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
        <span className="text-white font-mono text-sm">{data.supply?.decimals}</span>
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
        <CopyableValue value={data.deposited?.base?.str} />
        <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
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

function LiquidityWithdrawalDetails({ data }) {
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
        <CopyableValue value={data.sharesRedeemed?.str} />
        <Link to={`/asset/${data.baseAsset?.hash}/liquidity`} className="text-primary hover:underline font-mono text-sm">
          {data.baseAsset?.name}-Liquidity ({formatAddress(data.baseAsset?.hash, 8)})
        </Link>
      </div>
    </div>
  );
}

function LimitSwapDetails({ data }) {
  const isBuy = data.buy;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Input:</span>
        {isBuy ? (
          <>
            <CopyableValue value={data.amount?.str} />
            <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
          </>
        ) : (
          <>
            <CopyableValue value={data.amount?.str} />
            <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
              {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Output:</span>
        {isBuy ? (
          <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
            {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
          </Link>
        ) : (
          <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/50 w-32">Price:</span>
        <span className="text-white font-mono text-sm">
          {isBuy ? 'max.' : 'min.'} <CopyableValue value={data.limit?.doubleAdjusted} /> WART per {data.baseAsset?.name}
        </span>
      </div>
    </div>
  );
}

function RewardDetails({ data }) {
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
              Base: <CopyableValue value={data.poolBefore?.base?.str} /> <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">{data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})</Link><br />
              Quote: <CopyableValue value={data.poolBefore?.quote?.str} /> <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-1">After</div>
            <div className="text-white font-mono text-sm">
              Base: <CopyableValue value={data.poolAfter?.base?.str} /> <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">{data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})</Link><br />
              Quote: <CopyableValue value={data.poolAfter?.quote?.str} /> <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
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
                    <CopyableValue value={swap.swapped?.quote?.str} /> <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link> → <CopyableValue value={swap.swapped?.base?.str} /> <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">{data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})</Link>
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
                    <CopyableValue value={swap.swapped?.base?.str} /> <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">{data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})</Link> → <CopyableValue value={swap.swapped?.quote?.str} /> <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
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
        return <AssetCreationDetails data={data} processed={processed} txHash={tx.transaction?.hash || tx.hash} />;
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
            <span className="text-white/50 w-24">Created Asset:</span>
            {processed?.assetId ? (
              <Link to={`/asset/${tx.hash}`} className="text-primary hover:underline font-mono text-sm">
                #{processed.assetId}
              </Link>
            ) : (
              <span className="text-white/50 font-mono text-sm">Transaction not mined</span>
            )}
          </div>
        );
      case 'cancelation':
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-24">Canceled:</span>
            <CopyableValue value={processed.canceledTxHash} />
          </div>
        );
      case 'liquidityDeposit':
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Shares Received:</span>
            <CopyableValue value={processed.sharesReceived.str} />
            <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
              {data.baseAsset?.name}-Liquidity ({formatAddress(data.baseAsset?.hash, 8)})
            </Link>
          </div>
        );
      case 'liquidityWithdrawal':
        return (
          <>
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-32">Base Received:</span>
              <CopyableValue value={processed.received.base?.str} />
              <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
                {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/50 w-32">Quote Received:</span>
              <CopyableValue value={processed.received.quote?.str} suffix="WART" />
            </div>
          </>
        );
      case 'limitSwap':
        return (
          <div className="flex items-center gap-4">
            <span className="text-white/50 w-32">Remaining:</span>
            <CopyableValue value={processed.remaining.str} />
            {data.buy ? (
              <Link to="/asset/wart" className="text-primary hover:underline font-mono text-sm">WART</Link>
            ) : (
              <Link to={`/asset/${data.baseAsset?.hash}`} className="text-primary hover:underline font-mono text-sm">
                {data.baseAsset?.name} ({formatAddress(data.baseAsset?.hash, 8)})
              </Link>
            )}
          </div>
        );
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
          {renderResult(data)}
        </div>
      )}
    </>
  );
}