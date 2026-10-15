/**
 * Wire shapes for the Warthog node REST API.
 *
 * Source of truth: the node's live JSON Schema registry, `GET /debug/json_schemas`
 * on the private RPC port (testnet `3100`, mainnet `3000`). Captured 2026-10-15
 * from a `v0.10.30` testnet node, 86 types.
 *
 * The registry is also checked in at `docs/developers/api/_agents/schemas.json`,
 * but that copy is older and has drifted: it is missing `NodeVersion`, and its
 * `NodeInfoResult` has no `version` field. Prefer a running node; fall back to
 * the cached file only when none is available.
 *
 * ## Optionality
 *
 * No type in the registry declares a `required` array. The schema therefore
 * fixes field *names* and value *shapes* but says nothing about which fields are
 * guaranteed present. Optionality below is decided by hand:
 *
 *   - Fields the node emits unconditionally are required.
 *   - Fields that depend on the transaction kind, the endpoint variant, or
 *     whether a lookup resolved are optional.
 *
 * `browser-wallet/src/types/nodeTx.ts` (an independent repo, in progress) covers
 * the same block-body and mempool shapes and reaches the same conclusions, which
 * is the cross-check for those parts.
 *
 * ## Numeric precision
 *
 * The node emits `uint64_t` as a JSON number, so every id here is a `number`.
 * `historyId` and `fromId` are monotonic and would need to exceed `2^53` before
 * `JSON.parse` lost precision, which is not a concern at present, but it is the
 * reason these are not typed as `bigint`.
 */

/* ------------------------------------------------------------------ *
 * Money
 * ------------------------------------------------------------------ */

/** A WART amount as the node renders it: 1 WART = 1e8 E8. */
export interface NodeWart {
  E8?: number;
  str?: string;
}

/** An amount in some asset's own decimal precision. */
export interface NodeFundsDecimal {
  decimals?: number;
  str?: string;
  u64?: number;
}

/** A fee, rendered three ways: E8 base units, a compact byte form, and decimal. */
export interface NodeCompactFee {
  E8?: number;
  bytes?: string;
  str?: string;
}

/** A price as a fixed-point mantissa/exponent pair plus its decimal renderings. */
export interface NodePriceDetail {
  doubleAdjusted?: number;
  doubleRaw?: number;
  exponent2?: number;
  hex?: string;
  mantissa?: number;
  precExponent10?: number;
}

/** A price with a floor and a ceiling leg. */
export interface NodeParsedPrice {
  ceil?: NodePriceDetail;
  decimals?: number;
  floor?: NodePriceDetail;
}

/** One side of a pool quote. */
export interface NodeBaseQuote {
  base?: NodeFundsDecimal;
  quote?: NodeWart;
}

/* ------------------------------------------------------------------ *
 * Accounts and assets
 * ------------------------------------------------------------------ */

export interface NodeAccount {
  accountId?: number;
  address?: string;
}

export interface NodeToken {
  decimals?: number;
  id?: number;
  name?: string;
  spec?: string;
}

export interface NodeAssetBasic {
  decimals?: number;
  hash?: string;
  id?: number;
  name?: string;
}

export interface NodeAssetDetail {
  decimals?: number;
  groupId?: number;
  hash?: string;
  height?: number;
  id?: number;
  name?: string;
  ownerAccountId?: number;
  parentId?: number | null;
  totalSupply?: NodeFundsDecimal;
}

/** `GET /asset/complete` */
export interface NodeAssetSearchResult {
  hashPrefix?: string;
  matches?: NodeAssetDetail[];
  namePrefix?: string;
}

/* ------------------------------------------------------------------ *
 * Transactions
 * ------------------------------------------------------------------ */

/** Fields every signed transaction carries. Absent on `reward` and `match`. */
export interface NodeTransactionSignedCommon {
  fee?: NodeWart;
  nonceId?: number;
  originAddress?: string;
  originId?: number;
  pinHeight?: number;
}

/** Identifies a transaction for cancellation. */
export interface NodeTransactionId {
  accountId?: number;
  nonceId?: number;
  pinHeight?: number;
}

export interface NodeWartTransferData {
  amount?: NodeWart;
  toAddress?: string;
}

export interface NodeTokenTransferData {
  amount?: NodeFundsDecimal;
  asset?: NodeAssetBasic;
  isLiquidity?: boolean;
  toAddress?: string;
  tokenSpec?: string;
}

export interface NodeLimitSwapData {
  amount?: NodeFundsDecimal;
  baseAsset?: NodeAssetBasic;
  buy?: boolean;
  limit?: NodePriceDetail;
}

export interface NodeLiquidityDepositData {
  baseAsset?: NodeAssetBasic;
  deposited?: NodeBaseQuote;
}

export interface NodeLiquidityWithdrawalData {
  baseAsset?: NodeAssetBasic;
  sharesRedeemed?: NodeFundsDecimal;
}

export interface NodeAssetCreationData {
  name?: string;
  supply?: NodeFundsDecimal;
}

export interface NodeCancelationData {
  cancelTxid?: NodeTransactionId;
}

export interface NodeRewardData {
  amount?: NodeWart;
  toAddress?: string;
}

/** One side of a match, as the FBM batch matcher recorded it. */
export interface NodeSwapEntry {
  historyId?: number;
  swapped?: NodeBaseQuote;
}

/* ------------------------------------------------------------------ *
 * Post-processing results
 *
 * A processed transaction carries what the chain made of the submission:
 * the asset id for a creation, the order a cancelation removed, the
 * shares a deposit minted. The schema models these as
 * `SignedTransactionProcessed<Data, Processed>`; only some kinds have one.
 * ------------------------------------------------------------------ */

export interface NodeAssetCreationProcessed {
  assetId?: number;
}

export interface NodeCancelationProcessed {
  canceledTxHash?: string | null;
}

export interface NodeLimitSwapProcessed {
  remaining?: NodeFundsDecimal;
}

export interface NodeLiquidityDepositProcessed {
  sharesReceived?: NodeFundsDecimal;
}

export interface NodeLiquidityWithdrawalProcessed {
  received?: NodeBaseQuote;
}

export type NodeProcessed =
  | NodeAssetCreationProcessed
  | NodeCancelationProcessed
  | NodeLimitSwapProcessed
  | NodeLiquidityDepositProcessed
  | NodeLiquidityWithdrawalProcessed;

export interface NodeMatchData {
  baseAsset?: NodeAssetBasic;
  buySwaps?: NodeSwapEntry[];
  poolAfter?: NodeBaseQuote;
  poolBefore?: NodeBaseQuote;
  sellSwaps?: NodeSwapEntry[];
}

/**
 * A user-signed transaction. Seven kinds, all sharing this envelope.
 * The node does not tag the kind inside the object, so a union would not be
 * discriminable here; the kind is the block-body key or the mempool `type`.
 */
export interface NodeSignedTransaction {
  data?:
    | NodeWartTransferData
    | NodeTokenTransferData
    | NodeLimitSwapData
    | NodeLiquidityDepositData
    | NodeLiquidityWithdrawalData
    | NodeAssetCreationData
    | NodeCancelationData;
  hash?: string;
  signedCommon?: NodeTransactionSignedCommon;
  /** Present once the chain has processed it. Which kind depends on `data`. */
  processed?: NodeProcessed;
}

/**
 * Anything TransactionRow accepts as its `tx` prop.
 *
 * Three shapes reach it: a block body entry (`{historyId, transaction}`), a
 * mempool entry (`{transaction, type}`), and a bare transaction object. The
 * explorer flattens history rows into bare transactions before rendering, so
 * all three occur. Use `normalizeTransaction` rather than probing by hand.
 */
export type DisplayTransaction =
  | NodeHistoryEntry
  | NodeMempoolEntry
  | NodeSignedTransaction
  | NodeUnsignedTransaction;

/** A node-generated transaction. Carries no signature, so no `signedCommon`. */
export interface NodeUnsignedTransaction {
  data?: NodeRewardData | NodeMatchData;
  hash?: string;
  /**
   * Declared so that reading `signedCommon` off the union of signed and
   * unsigned transactions type checks, while still resolving to `undefined`:
   * reward and match are the two kinds the node produces itself.
   */
  signedCommon?: never;
}

/**
 * A block-body entry: the transaction plus the history-table row id that
 * records it. `historyId` is what makes the history endpoint paginatable.
 */
export interface NodeHistoryEntry {
  historyId?: number;
  transaction?: NodeSignedTransaction | NodeUnsignedTransaction;
}

/**
 * The `reward` entry is narrower than the rest: a block carries at most one
 * coinbase and it is never signed, so its transaction is always a reward
 * payload. The schema spells this as
 * `api::glaze::Transaction<api::glaze::reward::Data>`.
 */
export interface NodeRewardEntry {
  historyId?: number;
  transaction?: {
    hash?: string;
    data?: NodeRewardData;
  };
}

/* ------------------------------------------------------------------ *
 * Blocks
 * ------------------------------------------------------------------ */

export interface NodeTimepoint {
  UTC?: string;
  timestamp?: number;
}

export interface NodeBlockHeader {
  hash?: string;
  merkleroot?: string;
  nonce?: string;
  pow?: {
    floatSha256t?: number;
    floatVerus?: number;
    hashSha256t?: string;
    hashVerus?: string;
    verusV2_2?: boolean;
  };
  prevHash?: string;
  raw?: string;
  target?: string;
  time?: NodeTimepoint;
  version?: string;
}

/**
 * The nine transaction groups of a block body.
 *
 * `reward` is the odd one out: it is a single nullable object, because a block
 * carries at most one coinbase. Every other group is an array, and every array
 * is present but may be empty. `confirmations` and `height` sit on the block,
 * not the body.
 */
export interface NodeBlockBody {
  reward?: NodeRewardEntry | null;
  wartTransfer?: NodeHistoryEntry[];
  tokenTransfer?: NodeHistoryEntry[];
  limitSwap?: NodeHistoryEntry[];
  match?: NodeHistoryEntry[];
  liquidityDeposit?: NodeHistoryEntry[];
  liquidityWithdrawal?: NodeHistoryEntry[];
  assetCreation?: NodeHistoryEntry[];
  cancelation?: NodeHistoryEntry[];
}

export interface NodeBlock {
  body?: NodeBlockBody;
  confirmations?: number;
  header?: NodeBlockHeader;
  height?: number;
}

/* ------------------------------------------------------------------ *
 * History and mempool
 * ------------------------------------------------------------------ */

/**
 * `GET /account/:addr/history/:beforeId`
 *
 * `perBlock` is newest-first. `fromId` is the *lowest* history id on the page,
 * which makes it the correct `beforeId` for the next call: the node filters on
 * `h.id < beforeId`, so feeding it back resumes exactly one past the boundary,
 * with no gap and no overlap.
 */
export interface NodeActionsByBlock {
  fromId?: number;
  perBlock?: NodeBlock[];
}

/**
 * `GET /transaction/mempool`
 *
 * Unlike block entries, mempool entries carry the kind as a sibling `type`
 * string, because there is no enclosing body key to carry it. The registry
 * does not include `height` or `confirmations`; they are left off rather than
 * modelled as always-absent, since a busy mempool may gain them.
 */
export interface NodeMempoolEntry {
  transaction?: NodeSignedTransaction;
  type?: string;
  height?: number;
  confirmations?: number;
}

/* ------------------------------------------------------------------ *
 * Balances, richlist, market
 * ------------------------------------------------------------------ */

export interface NodeWartBalance {
  locked?: NodeWart;
  mempool?: NodeWart;
  total?: NodeWart;
}

/** `GET /account/:addr/wart_balance` */
export interface NodeWartBalanceResult {
  account?: NodeAccount | null;
  wart?: NodeWartBalance;
}

/** `GET /account/:addr/balance/:tokenspec` */
export interface NodeTokenBalanceLookup {
  account?: NodeAccount | null;
  balance?: {
    locked?: NodeFundsDecimal;
    mempool?: NodeFundsDecimal;
    total?: NodeFundsDecimal;
  };
  lookupTrace?: {
    fails?: NodeAssetDetail[];
    snapshotHeight?: number | null;
  } | null;
  token?: NodeToken;
}

export interface NodeRichlistEntry {
  address?: string;
  balance?: NodeFundsDecimal;
}

/** `GET /account/richlist/:tokenspec` */
export interface NodeRichlistResult {
  richlist?: NodeRichlistEntry[];
  token?: NodeToken;
}

/** An open swap order, as shown in the market view. */
export interface NodeSwapOrder {
  amount?: NodeFundsDecimal;
  filled?: NodeFundsDecimal;
  inMempool?: boolean;
  limit?: NodePriceDetail;
  txHash?: string;
}

/** `GET /dex/market/:asset` */
export interface NodeMarketDetails {
  assetToWartSwaps?: NodeSwapOrder[];
  baseAsset?: NodeAssetBasic;
  liquidityPool?: {
    asset?: NodeFundsDecimal;
    shares?: NodeFundsDecimal;
    wart?: NodeWart;
  };
  match?: {
    filled?: NodeBaseQuote;
    toPool?: unknown;
  };
  wartToAssetSwaps?: NodeSwapOrder[];
}

/* ------------------------------------------------------------------ *
 * Charts
 * ------------------------------------------------------------------ */

export interface NodeUint32Range {
  begin?: number;
  end?: number;
}

/** `GET /chain/hashrate/:window` */
export interface NodeHashrateInfo {
  estimate?: number;
  nBlocks?: number;
}

/** One sample of `GET /chart/hashrate/time/:from/:to/:interval` */
export interface NodeHashrateSample {
  hashrate?: number;
  height?: number;
  timestamp?: number;
}

/** `GET /chart/hashrate/time/:from/:to/:interval` */
export interface NodeHashrateTimeChart {
  data?: NodeHashrateSample[];
  interval?: number;
  range?: NodeUint32Range;
}

/** `GET /chart/trades/:asset` */
export interface NodeTransmissionChartsResult {
  byHost?: Record<string, unknown>;
}

/**
 * The trade and candle endpoints return positional tuples, which JSON has no
 * notation for. The registry spells them out as vectors of tuples:
 *
 *   `GET /chart/trades/:asset` ->
 *     `std::vector<std::tuple<Timestamp, Height, Base, Quote>>`
 *   `GET /chart/candles/:asset/:interval` ->
 *     `std::vector<std::tuple<Timestamp, Height, Open, High, Low, Close, Base, Quote>>`
 *
 * Confirmed against a live node, e.g. a trade row
 * `[1784666579, 152398, 29.924812020000008, 16]` and a candle row
 * `[1784664000, 152398, 0.534..., 0.534..., 0.534..., 0.534..., 29.924..., 16]`.
 *
 * The node does not label the positions, so the names here come from the
 * registry's type parameters.
 */

/** `GET /chart/trades/:asset` */
export type NodeTrade = [
  timestamp: number,
  height: number,
  base: number,
  quote: number,
];

/** `GET /chart/candles/:asset/:interval`, with or without a window */
export type NodeCandle = [
  timestamp: number,
  height: number,
  open: number,
  high: number,
  low: number,
  close: number,
  base: number,
  quote: number,
];

/* ------------------------------------------------------------------ *
 * Chain head and node info
 * ------------------------------------------------------------------ */

export interface NodeChainHead {
  difficulty?: number;
  hash?: string;
  hashrate?: number;
  height?: number;
  is_janushash?: boolean;
  pinHash?: string;
  pinHeight?: number;
  worksum?: number;
  worksumHex?: string;
}

/** `GET /chain/head` */
export interface NodeChainHeadSynced {
  chainHead?: NodeChainHead;
  synced?: boolean;
}

export interface NodeVersion {
  commit?: string;
  major?: number;
  minor?: number;
  name?: string;
  patch?: number;
}

/** `GET /tools/info` */
export interface NodeInfoResult {
  db?: {
    chain?: {
      path?: string;
      size?: number;
    };
    peersPath?: string;
    rxtxPath?: string;
  };
  uptime?: {
    formatted?: string;
    seconds?: number;
    since?: NodeTimepoint;
  };
  version?: NodeVersion;
}

/** `GET /transaction/lookup/:txid` */
export interface NodeTransactionDetails {
  confirmations?: number;
  mined?: {
    block?: {
      hash?: string;
      height?: number;
      timestamp?: number;
    };
    historyId?: number;
  } | null;
  transaction?: NodeSignedTransaction | NodeUnsignedTransaction;
  type?: string;
}