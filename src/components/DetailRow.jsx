import { Link } from 'react-router-dom';
import CopyableValue from './CopyableValue';
import CopyableTimestamp from './CopyableTimestamp';

export default function DetailRow({ label, value, timestamp, copyable = false, link, breakAll = false, mono = true, color, suffix }) {
  const defaultColor = copyable ? 'text-white' : (link ? 'text-primary' : 'text-white');
  const valueClass = `text-sm ${mono ? 'font-mono' : ''} ${breakAll ? 'break-all' : ''} ${color || defaultColor} ${link ? 'hover:underline' : ''}`;

  return (
    <div>
      <div className="text-xs text-white/50 mb-1">{label}</div>
      {timestamp ? (
        <span className={valueClass}>
          <CopyableTimestamp timestamp={timestamp} />
          {suffix && <span className="text-white/50 ml-2">{suffix}</span>}
        </span>
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
