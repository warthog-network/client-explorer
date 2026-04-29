import { Link } from 'react-router-dom';
import { getAddressTag } from '../config/addressTags';
import { formatAddress } from '../utils/format';

export function AddressTag({ address }) {
  const tag = getAddressTag(address);
  if (!tag) return null;
  return (
    <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
      {tag}
    </span>
  );
}

export default function AddressWithTag({ address, showFull = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <AddressTag address={address} />
      <Link to={`/address/${address}`} className="text-primary hover:underline font-mono">
        {showFull ? address : formatAddress(address, 8)}
      </Link>
    </span>
  );
}