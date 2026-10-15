import type { NodeCandle, NodeTrade } from '../types/node';

/**
 * Chart interval labels mapped to their length in seconds.
 */
export const INTERVAL_SECONDS: Record<string, number> = {
  '5m': 300,
  '1h': 3600,
  '1d': 86400,
};

/** Base units per quote unit. `null` when the trade carries no usable base. */
export function tradePrice(trade: NodeTrade | null | undefined): number | null {
  if (!trade) return null;
  const [, , base, quote] = trade;
  if (!base || base <= 0) return null;
  return quote / base;
}

/**
 * Unix timestamp of the trade, from index 0 of the tuple.
 *
 * Index 1 is the block height, not the timestamp. The trade tuple is
 * `(Timestamp, Height, Base, Quote)`.
 */
export function tradeTimestamp(trade: NodeTrade | null | undefined): number | null {
  if (!trade) return null;
  const [ts] = trade;
  return ts;
}

/** Close prices for a series of trades, dropping any with no usable price. */
export function tradeCloses(trades: NodeTrade[] | null | undefined): number[] {
  if (!Array.isArray(trades)) return [];
  return trades
    .map(tradePrice)
    .filter((p): p is number => p !== null && Number.isFinite(p));
}

/** Close price at index 5 of the candle tuple. */
export function candleClose(candle: NodeCandle | null | undefined): number | null {
  if (!candle) return null;
  const [, , , , , close] = candle;
  return close;
}

/**
 * Number of missing candles between two adjacent candles, or `0` when they are
 * consecutive.
 *
 * Throws on out-of-order, duplicate, or interval-misaligned timestamps. Those
 * are integrity failures rather than gaps, so they surface rather than being
 * papered over.
 */
export function getCandleGap(
  prev: NodeCandle,
  cur: NodeCandle,
  intervalSec: number,
  context = '',
): number {
  const diff = cur[0] - prev[0];
  if (diff < 0) {
    throw new Error(
      `Candles out of order (${context}): ${prev[0]} > ${cur[0]} (diff=${diff}s)`,
    );
  }
  if (diff === 0) {
    throw new Error(
      `Duplicate candle timestamp (${context}): ${prev[0]} == ${cur[0]}`,
    );
  }
  if (diff % intervalSec !== 0) {
    throw new Error(
      `Candle gap not aligned to interval (${context}): `
      + `interval=${intervalSec}s, diff=${diff}s between ${prev[0]} and ${cur[0]}`,
    );
  }
  return diff / intervalSec - 1;
}

/**
 * Insert synthetic candles for gaps so the series is evenly spaced.
 *
 * A synthetic candle reuses the previous close at every OHLC leg and carries
 * zero volume, so a gap renders as a flat segment rather than a spike.
 */
export function fillCandleGaps(
  candles: NodeCandle[] | null | undefined,
  intervalSec: number,
): NodeCandle[] | null | undefined {
  if (!candles?.length || candles.length < 2 || !intervalSec) return candles;
  const out: NodeCandle[] = [candles[0] as NodeCandle];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1] as NodeCandle;
    const cur = candles[i] as NodeCandle;
    const fillCount = getCandleGap(prev, cur, intervalSec, 'fillCandleGaps');
    for (let j = 0; j < fillCount; j++) {
      out.push([
        prev[0] + (j + 1) * intervalSec,
        0,                                       // synthetic: no first trade
        prev[5], prev[5], prev[5], prev[5],
        0, 0,
      ]);
    }
    out.push(cur);
  }
  return out;
}