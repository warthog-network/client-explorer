import { Link } from 'react-router-dom';
import CopyableValue from './CopyableValue';
import CopyableTimestamp from './CopyableTimestamp';
import type { ReactNode } from 'react';

interface DetailRowProps {
  label: ReactNode;
  /**
   * Rendered as-is when not copyable, and copied verbatim when it is. Every
   * call site passes a string or number from a block header field, so this is
   * deliberately narrower than `ReactNode`.
   */
  value?: string | number | null;
  /** When present, renders as a copyable timestamp instead of `value`. */
  timestamp?: number | null;
  copyable?: boolean;
  link?: string;
  breakAll?: boolean;
  mono?: boolean;
  color?: string;
  suffix?: ReactNode;
}

export default function DetailRow({
  label,
  value,
  timestamp,
  copyable = false,
  link,
  breakAll = false,
  mono = true,
  color,
  suffix,
}: DetailRowProps) {
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