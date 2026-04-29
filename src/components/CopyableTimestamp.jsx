import CopyableValue from './CopyableValue';
import { formatTimestampShort } from '../utils/format';

export default function CopyableTimestamp({ timestamp, ...props }) {
  return (
    <CopyableValue
      value={timestamp}
      display={formatTimestampShort(timestamp)}
      suffix={null}
      copiedLabel="copied timestamp"
      {...props}
    />
  );
}