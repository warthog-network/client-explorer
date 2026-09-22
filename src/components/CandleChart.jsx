import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { FaSync } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

const RANGES = [
  { label: '1H', interval: '5m', n: 200 },
  { label: '1D', interval: '1h', n: 200 },
  { label: '1W', interval: '1d', n: 200 },
];

function formatTick(ts, interval) {
  const d = new Date(ts * 1000);
  if (interval === '1d') {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }
  if (interval === '1h') {
    return d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const SUBS_DIGITS = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';

function toUnicodeSubscript(n) {
  return String(n).split('').map((d) => SUBS_DIGITS[+d]).join('');
}

function formatPrice(v, sigDigits = 4) {
  if (!Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';

  if (abs >= 1e6) return sign + abs.toExponential(sigDigits - 1);
  if (abs >= 0.001) return sign + abs.toPrecision(sigDigits);

  const str = abs.toFixed(20);
  const dotIdx = str.indexOf('.');
  let i = dotIdx + 1;
  while (i < str.length && str[i] === '0') i++;
  const zerosAfterDecimal = i - dotIdx - 1;
  if (zerosAfterDecimal <= 0) return sign + abs.toPrecision(sigDigits);
  const sig = str.slice(i, i + sigDigits);
  if (!sig) return sign + abs.toExponential(sigDigits - 1);
  return `${sign}0.0${toUnicodeSubscript(zerosAfterDecimal - 1)}${sig}`;
}

export default function CandleChart({ asset, refreshKey = 0 }) {
  const [rangeIdx, setRangeIdx] = useState(1);
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const range = RANGES[rangeIdx];

  useEffect(() => {
    if (!asset) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    nodeApi
      .getCandles(asset, range.interval, range.n)
      .then((data) => {
        if (cancelled) return;
        setCandles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load chart');
        setCandles([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [asset, rangeIdx, refreshKey]);

  const hasData = candles.length > 0;

  const data = {
    labels: candles.map((c) => formatTick(c[0], range.interval)),
    datasets: [
      {
        label: 'Price',
        data: candles.map((c) => ({ o: c[2], h: c[3], l: c[4], c: c[5] })),
        color: {
          up: '#34d399',
          down: '#f87171',
          unchanged: '#9ca3af',
          borderUp: '#34d399',
          borderDown: '#f87171',
          borderUnchanged: '#9ca3af',
        },
        borderColor: '#FDB913',
      },
      {
        label: 'Volume (quote)',
        type: 'bar',
        data: candles.map((c) => c[7]),
        backgroundColor: candles.map((c) =>
          c[5] >= c[2] ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.35)'
        ),
        borderWidth: 0,
        yAxisID: 'yVolume',
        barPercentage: 0.9,
        categoryPercentage: 0.9,
      },
    ],
  };

  let priceMin = 0;
  let priceMax = 1;
  let pricePad = 0;
  if (hasData) {
    let lo = Infinity;
    let hi = -Infinity;
    for (const c of candles) {
      if (c[3] > hi) hi = c[3];
      if (c[4] < lo) lo = c[4];
    }
    priceMin = lo;
    priceMax = hi;
    pricePad = (hi - lo) * 0.1 || Math.abs(hi) * 0.05 || 1;
  }

  const maxQuote = hasData ? Math.max(...candles.map((c) => c[7])) : 1;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        titleColor: '#FDB913',
        bodyColor: '#ffffff',
        borderColor: '#FDB913',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const idx = items[0].dataIndex;
            const ts = candles[idx]?.[0];
            return ts ? new Date(ts * 1000).toLocaleString() : '';
          },
          label: (ctx) => {
            if (ctx.datasetIndex === 0) {
              const d = candles[ctx.dataIndex];
              if (!d) return '';
              return [
                `O ${formatPrice(d[2])}`,
                `H ${formatPrice(d[3])}`,
                `L ${formatPrice(d[4])}`,
                `C ${formatPrice(d[5])}`,
              ];
            }
            const q = candles[ctx.dataIndex]?.[7];
            const b = candles[ctx.dataIndex]?.[6];
            return `Vol ${formatPrice(q)} (base ${formatPrice(b)})`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', maxTicksLimit: 8 },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: (v) => formatPrice(v),
        },
        suggestedMin: priceMin - pricePad,
        suggestedMax: priceMax + pricePad,
      },
      yVolume: {
        position: 'left',
        grid: { display: false },
        ticks: { display: false },
        beginAtZero: true,
        max: maxQuote * 4,
      },
    },
    interaction: { intersect: false, mode: 'index' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {RANGES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setRangeIdx(i)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              i === rangeIdx
                ? 'bg-primary text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {r.label}
          </button>
        ))}
        {loading && <FaSync className="animate-spin text-white/40 ml-1" size={14} />}
      </div>

      {error && hasData ? (
        <div className="text-xs text-error">{error}</div>
      ) : null}

      <div className="h-64">
        {hasData ? (
          <Chart type="candlestick" data={data} options={options} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-white/50">
            {loading ? (
              <>
                <FaSync className="animate-spin" size={20} />
                <span>Loading price history...</span>
              </>
            ) : (
              <>
                <span>No price history available yet.</span>
                <span className="text-xs">Charts populate once trades occur.</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
