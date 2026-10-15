import { useId } from 'react';

interface SparklineProps {
  points: number[] | null | undefined;
  width?: number;
  height?: number;
  className?: string;
}

/** Inline price sparkline, filled to the baseline and tinted by direction. */
export default function Sparkline({
  points,
  width = 96,
  height = 24,
  className = '',
}: SparklineProps) {
  const reactId = useId();

  if (!points || points.length < 2) {
    return <span className="text-white/30 text-xs">—</span>;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padY = 2;
  const usableH = height - padY * 2;
  const stepX = width / (points.length - 1);

  const lineCoords: Array<[number, number]> = points.map((p, i) => {
    const x = i * stepX;
    const y = height - padY - ((p - min) / range) * usableH;
    return [x, y];
  });

  const polyline = lineCoords
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  const firstX = lineCoords[0]?.[0] ?? 0;
  const lastX = lineCoords[lineCoords.length - 1]?.[0] ?? 0;
  const polygonPoints = [
    ...lineCoords,
    [lastX, height],
    [firstX, height],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  const isUp = (points[points.length - 1] ?? 0) >= (points[0] ?? 0);
  const stroke = isUp ? '#34d399' : '#f87171';
  const gradientId = `sparkline-grad-${reactId}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={polygonPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}