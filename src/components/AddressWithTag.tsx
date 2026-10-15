import { Link } from 'react-router-dom';
import { getAddressTag } from '../config/addressTags';
import { formatAddress } from '../utils/format';
import type { ReactNode } from 'react';

export function AddressTag({ address }: { address: string | null | undefined }) {
  const tag = getAddressTag(address);
  if (!tag) return null;
  return (
    <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
      {tag}
    </span>
  );
}

interface AddressWithTagProps {
  address: string | null | undefined;
  display?: ReactNode;
  showFull?: boolean;
  mono?: boolean;
  className?: string;
  /** Adds the token segment to the link: `/address/:addr/:tokenspec`. */
  tokenspec?: string;
}

export default function AddressWithTag({
  address,
  display,
  showFull = false,
  mono = true,
  className = '',
  tokenspec,
}: AddressWithTagProps) {
  const isFull = display || showFull;
  const linkPath = tokenspec ? `/address/${address}/${tokenspec}` : `/address/${address}`;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Link
        to={linkPath}
        className={`text-primary hover:underline ${mono ? 'font-mono' : ''} ${isFull ? 'break-all' : ''}`}
      >
        {display || (showFull ? address : formatAddress(address, 8))}
      </Link>
      <AddressTag address={address} />
    </span>
  );
}