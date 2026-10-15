import CopyableValue from './CopyableValue';
import { getAddressTag } from '../config/addressTags';
import { formatAddress } from '../utils/format';
import type { HTMLAttributes } from 'react';

interface CopyableAddressProps extends HTMLAttributes<HTMLSpanElement> {
  address: string | null | undefined;
  showFull?: boolean;
}

export default function CopyableAddress({
  address,
  showFull = true,
  ...props
}: CopyableAddressProps) {
  const tag = getAddressTag(address);

  return (
    <span className="inline-flex items-center gap-1">
      {tag && (
        <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
          {tag}
        </span>
      )}
      <CopyableValue value={address} display={showFull ? address : formatAddress(address, 8)} {...props} />
    </span>
  );
}