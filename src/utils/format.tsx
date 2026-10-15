import type { NodeWart } from '../types/node';

export function formatAddress(address: string | null | undefined, chars = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Render an amount. Accepts a node `{str, E8}` object, a numeric string, or a
 * number. An object renders from `E8` at WART precision, ignoring `str`.
 */
export function formatAmount(
  amount: NodeWart | string | number | null | undefined,
  decimals = 8,
): string {
  if (!amount && amount !== 0) return '';
  if (typeof amount === 'object') {
    return amount.str || amount.E8 ? `${(amount.E8 || 0) / Math.pow(10, 8)}` : '';
  }
  return parseFloat(String(amount)).toFixed(decimals);
}

/**
 * Render a WART amount, preferring the node's own decimal string.
 *
 * A `{str, E8}` object with no `str` has nothing to render, so it yields `''`.
 * The node always emits both fields, so that branch is defensive.
 */
export function formatWart(
  amount: NodeWart | string | number | null | undefined,
): string {
  if (!amount && amount !== 0) return '';
  if (typeof amount === 'object' && amount.str) {
    return amount.str;
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (typeof num !== 'number') return '';
  return num.toFixed(8);
}

export function formatTimestamp(timestamp: number | null | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });
}

export function formatTimestampShort(timestamp: number | null | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/** Relative time from `now`, which defaults to the current second. */
export function formatTimeAgo(
  timestamp: number | null | undefined,
  now = Math.floor(Date.now() / 1000),
): string {
  if (!timestamp) return '';
  const diff = now - timestamp;

  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

export function formatNumber(num: number | null | undefined): string {
  if (!num && num !== 0) return '';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatHashrate(hashrate: number | null | undefined): string {
  if (!hashrate && hashrate !== 0) return '';
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  let unitIndex = 0;
  let value = hashrate;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}H/s`;
}

export function formatWork(work: number | null | undefined): string {
  if (!work && work !== 0) return '';
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  let unitIndex = 0;
  let value = work;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}H`;
}

export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  if (value === 0) return '0';
  const units = ['', 'K', 'M', 'B', 'T', 'Q'];
  let v = value;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  return `${v.toFixed(2)}${units[i]}`;
}

/**
 * Render a price at a given significant-digit count.
 *
 * Very small values are rendered with a subscripted exponent so the leading
 * zeroes do not push the significant digits off screen.
 */
export function formatPrice(
  value: number | null | undefined,
  sigDigits = 4,
): string | JSX.Element {
  if (value == null || Number.isNaN(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e6) {
    return sign + formatCompact(abs);
  }

  if (abs >= 0.001) {
    return sign + abs.toPrecision(sigDigits);
  }

  const str = abs.toFixed(20);
  const dotIdx = str.indexOf('.');
  let i = dotIdx + 1;
  while (i < str.length && str[i] === '0') i++;
  const zerosAfterDecimal = i - dotIdx - 1;
  if (zerosAfterDecimal <= 0) {
    return sign + abs.toPrecision(sigDigits);
  }
  const sig = str.slice(i, i + sigDigits);
  if (!sig) {
    return sign + abs.toExponential(sigDigits - 1);
  }
  const sub = String(zerosAfterDecimal - 1);
  return (
    <span>
      {sign}0.0<sub className="text-[0.8em] align-baseline">{sub}</sub>{sig}
    </span>
  );
}

const TX_TYPE_LABELS: Record<string, string> = {
  wartTransfer: 'Transfer',
  tokenTransfer: 'Transfer',
  assetCreation: 'Asset Creation',
  cancelation: 'Cancelation',
  liquidityDeposit: 'Liquidity Deposit',
  liquidityWithdrawal: 'Liquidity Withdrawal',
  limitSwap: 'Limit Order',
  reward: 'Block Reward',
  match: 'DEX Match',
};

const TX_TYPE_COLORS: Record<string, string> = {
  wartTransfer: 'bg-blue-500',
  tokenTransfer: 'bg-blue-500',
  assetCreation: 'bg-green-500',
  cancelation: 'bg-red-500',
  liquidityDeposit: 'bg-purple-500',
  liquidityWithdrawal: 'bg-purple-500',
  limitSwap: 'bg-orange-500',
  reward: 'bg-yellow-400',
  match: 'bg-teal-500',
};

export function getTxTypeLabel(type: string | null | undefined): string {
  return (type && TX_TYPE_LABELS[type]) || type || 'Unknown';
}

export function getTxTypeColor(type: string | null | undefined): string {
  return (type && TX_TYPE_COLORS[type]) || 'bg-gray-500';
}