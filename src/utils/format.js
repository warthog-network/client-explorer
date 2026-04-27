export function formatAddress(address, chars = 6) {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatAmount(amount, decimals = 8) {
  if (!amount && amount !== 0) return '';
  if (typeof amount === 'object') {
    return amount.str || amount.E8 ? `${(amount.E8 || 0) / Math.pow(10, 8)}` : '';
  }
  return parseFloat(amount).toFixed(decimals);
}

export function formatWart(amount) {
  if (!amount && amount !== 0) return '';
  if (typeof amount === 'object' && amount.str) {
    return amount.str;
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(8);
}

export function formatTimestamp(timestamp) {
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

export function formatTimeAgo(timestamp, now = Math.floor(Date.now() / 1000)) {
  if (!timestamp) return '';
  const diff = now - timestamp;

  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

export function formatNumber(num) {
  if (!num && num !== 0) return '';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatHashrate(hashrate) {
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

export function getTxTypeLabel(type) {
  const labels = {
    wartTransfer: 'WART Transfer',
    tokenTransfer: 'Token Transfer',
    assetCreation: 'Asset Creation',
    cancelation: 'Cancelation',
    liquidityDeposit: 'Liquidity Deposit',
    liquidityWithdrawal: 'Liquidity Withdrawal',
    limitSwap: 'Limit Swap',
    reward: 'Block Reward',
    match: 'DEX Match',
  };
  return labels[type] || type || 'Unknown';
}

export function getTxTypeColor(type) {
  const colors = {
    wartTransfer: 'bg-primary',
    tokenTransfer: 'bg-blue-500',
    assetCreation: 'bg-green-500',
    cancelation: 'bg-red-500',
    liquidityDeposit: 'bg-purple-500',
    liquidityWithdrawal: 'bg-purple-500',
    limitSwap: 'bg-orange-500',
    reward: 'bg-yellow-400',
    match: 'bg-teal-500',
  };
  return colors[type] || 'bg-gray-500';
}