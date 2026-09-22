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
