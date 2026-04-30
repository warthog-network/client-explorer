import { Link } from 'react-router-dom';
import CopyableValue from './CopyableValue';

export default function BalanceRow({ label, value, unit, unitLink, liqValue, liqUnit, liqUnitLink, color = 'text-white', dimColor = 'text-yellow-400' }) {
  return (
    <div className="flex items-center bg-black/30 rounded-lg px-3 py-2">
      <span className="w-20 text-white/50 text-sm">{label}</span>
      <span className={`flex-1 flex items-center gap-1 ${color}`}>
        <CopyableValue value={value?.str || '0'} />
        {unitLink ? (
          <Link to={unitLink} className={`${dimColor} hover:underline text-sm`}>
            {unit}
          </Link>
        ) : (
          <span className={`${dimColor} text-sm`}>{unit}</span>
        )}
      </span>
      {liqValue !== undefined && (
        <span className={`flex-1 flex items-center gap-1 ${color}`}>
          <CopyableValue value={liqValue?.str || '0'} />
          {liqUnitLink ? (
            <Link to={liqUnitLink} className={`${dimColor} hover:underline text-sm`}>
              {liqUnit}
            </Link>
          ) : (
            <span className={`${dimColor} text-sm`}>{liqUnit}</span>
          )}
        </span>
      )}
    </div>
  );
}
