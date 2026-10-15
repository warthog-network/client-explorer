import type { HTMLAttributes } from 'react';
import CopyableValue from './CopyableValue';
import { formatTimestampShort } from '../utils/format';

interface CopyableTimestampProps extends HTMLAttributes<HTMLSpanElement> {
  timestamp: number | null | undefined;
}

export default function CopyableTimestamp({
  timestamp,
  className = '',
  ...props
}: CopyableTimestampProps) {
  return (
    <CopyableValue
      value={timestamp}
      display={formatTimestampShort(timestamp)}
      suffix={null}
      copiedLabel="copied timestamp"
      className={`text-sm font-mono ${className}`}
      {...props}
    />
  );
}