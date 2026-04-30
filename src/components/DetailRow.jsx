import { Link } from 'react-router-dom';
import CopyableValue from './CopyableValue';
import CopyableTimestamp from './CopyableTimestamp';

export default function DetailRow({ label, value, timestamp, copyable = false, link, breakAll = false, mono = true }) {
  const valueClass = `text-sm ${mono ? 'font-mono' : ''} ${breakAll ? 'break-all' : ''} ${link ? 'text-primary hover:underline' : 'text-white'}`;

  return (
    <div>
      <div className="text-xs text-white/50 mb-1">{label}</div>
      {timestamp ? (
        <CopyableTimestamp timestamp={timestamp} />
      ) : copyable ? (
        <CopyableValue value={value} className={valueClass} />
      ) : link ? (
        <Link to={link} className={valueClass}>
          {value}
        </Link>
      ) : (
        <div className={valueClass}>{value}</div>
      )}
    </div>
  );
}
