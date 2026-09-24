export const INTERVAL_SECONDS = { '5m': 300, '1h': 3600, '1d': 86400 };

export function tradePrice(trade) {
  if (!trade) return null;
  const [, , base, quote] = trade;
  if (!base || base <= 0) return null;
  return quote / base;
}

export function tradeTimestamp(trade) {
  if (!trade) return null;
  const [, ts] = trade;
  return ts;
}

export function tradeCloses(trades) {
  if (!Array.isArray(trades)) return [];
  return trades
    .map(tradePrice)
    .filter((p) => p !== null && Number.isFinite(p));
}

export function candleClose(candle) {
  if (!candle) return null;
  const [, , , , , close] = candle;
  return close;
}

export function getCandleGap(prev, cur, intervalSec, context = '') {
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

export function fillCandleGaps(candles, intervalSec) {
  if (!candles?.length || candles.length < 2 || !intervalSec) return candles;
  const out = [candles[0]];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const cur = candles[i];
    const fillCount = getCandleGap(prev, cur, intervalSec, 'fillCandleGaps');
    for (let j = 0; j < fillCount; j++) {
      out.push([
        prev[0] + (j + 1) * intervalSec,
        prev[1] + (j + 1),
        prev[5], prev[5], prev[5], prev[5],
        0, 0,
      ]);
    }
    out.push(cur);
  }
  return out;
}
