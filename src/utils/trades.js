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

export function mergeCandlesPrepend(existing, older) {
  if (!older?.length) return existing;
  const seen = new Set(existing.map((c) => c[0]));
  const unique = older.filter((c) => !seen.has(c[0]));
  return [...unique, ...existing];
}

export function mergeCandlesAppend(existing, newer) {
  if (!newer?.length) return existing;
  const seen = new Set(existing.map((c) => c[0]));
  const unique = newer.filter((c) => !seen.has(c[0]));
  return [...existing, ...unique];
}
