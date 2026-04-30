import CopyableValue from './CopyableValue';
import { formatTimestampShort } from '../utils/format';

export default function CopyableTimestamp({ timestamp, className = '', ...props }) {
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