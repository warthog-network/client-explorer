import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { FaSync } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import { fillCandleGaps, INTERVAL_SECONDS } from '../utils/trades';

const RANGES = [
  { label: '5m', interval: '5m', n: 200 },
  { label: '1h', interval: '1h', n: 200 },
  { label: '1d', interval: '1d', n: 200 },
];

const EDGE = 20;
const JUMP_MULT = 2;
const JUMP_HALF = 100;

const toLwcCandle = (c) => ({
  time: c[0], open: c[2], high: c[3], low: c[4], close: c[5],
});
const toLwcVolume = (c) => ({
  time: c[0],
  value: c[7],
  color: c[5] >= c[2] ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)',
});

export default function CandleChart({ asset, refreshKey = 0 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const dataRef = useRef([]);
  const [rangeIdx, setRangeIdx] = useState(1);
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const chart = createChart(containerRef.current, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: 'rgba(255,255,255,0.5)' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
      autoSize: true,
    });
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#34d399', downColor: '#f87171',
      borderUpColor: '#34d399', borderDownColor: '#f87171',
      wickUpColor: '#34d399', wickDownColor: '#f87171',
    });
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume_scale',
    });
    chart.priceScale('volume_scale').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    chartRef.current = { chart, candleSeries, volumeSeries };
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!asset) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const range = RANGES[rangeIdx];
    const intervalSec = INTERVAL_SECONDS[range.interval];
    nodeApi.getCandles(asset, range.interval, range.n).then((data) => {
      if (cancelled || !chartRef.current) return;
      const arr = Array.isArray(data) ? data : [];
      const filled = fillCandleGaps(arr, intervalSec);
      dataRef.current = filled;
      setCandles(filled);
      chartRef.current.candleSeries.setData(filled.map(toLwcCandle));
      chartRef.current.volumeSeries.setData(filled.map(toLwcVolume));
      chartRef.current.chart.timeScale().fitContent();
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      setError(err.message || 'Failed to load chart');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [asset, rangeIdx, refreshKey]);

  useEffect(() => {
    if (!chartRef.current) return undefined;
    const { chart, candleSeries, volumeSeries } = chartRef.current;
    const range = RANGES[rangeIdx];
    const intervalSec = INTERVAL_SECONDS[range.interval];
    let timer = null;
    let cancelled = false;

    const onLogicalRangeChange = (logicalRange) => {
      if (!logicalRange || !asset) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        if (cancelled) return;
        const all = dataRef.current;
        if (!all.length) return;
        const total = all.length;
        const earliest = all[0][0];
        const latest = all[all.length - 1][0];
        const avgIntervalSec = total > 1 ? Math.max(1, Math.round((latest - earliest) / (total - 1))) : 1;
        console.log('[chart] onLogicalRangeChange', {
          total, earliest, latest, avgIntervalSec,
          logicalRange: { from: logicalRange.from, to: logicalRange.to },
          needsOlder: logicalRange.from !== null && logicalRange.from < EDGE,
          needsNewer: logicalRange.to !== null && logicalRange.to > total - 1 - EDGE,
        });

        const width = chart.timeScale().width();
        const leftLogical = chart.timeScale().coordinateToLogical(0);
        const rightLogical = chart.timeScale().coordinateToLogical(width);

        const isJumpLeft =
          leftLogical !== null && rightLogical !== null && rightLogical < -total * JUMP_MULT;
        const isJumpRight =
          leftLogical !== null && rightLogical !== null && leftLogical > total + total * JUMP_MULT;

        if (isJumpLeft || isJumpRight) {
          const midLogical = (leftLogical + rightLogical) / 2;
          let midTs;
          if (isJumpLeft) {
            midTs = earliest + Math.floor(midLogical) * avgIntervalSec;
          } else {
            midTs = latest + Math.ceil(midLogical - (total - 1)) * avgIntervalSec;
          }
          const tRight = Math.min(midTs + JUMP_HALF * avgIntervalSec, Math.floor(Date.now() / 1000));
          try {
            const fresh = await nodeApi.getCandlesBefore(asset, range.interval, tRight, range.n);
            if (cancelled || !chartRef.current) return;
            if (!fresh?.length) return;
            const filled = fillCandleGaps(fresh, intervalSec);
            dataRef.current = filled;
            setCandles(filled);
            candleSeries.setData(filled.map(toLwcCandle));
            volumeSeries.setData(filled.map(toLwcVolume));
          } catch (err) {
            if (!cancelled) setError(err.message || 'Failed to jump');
          }
          return;
        }

        const needsOlder = logicalRange.from !== null && logicalRange.from < EDGE;
        const needsNewer = logicalRange.to !== null && logicalRange.to > total - 1 - EDGE;

        if (!needsOlder && !needsNewer) return;

        let working = all;
        try {
          if (needsOlder) {
            const older = await nodeApi.getCandlesBefore(
              asset,
              range.interval,
              earliest - 1,
              range.n,
            );
            console.log('[chart] pan-left fetch', {
              url: `?to=${earliest - 1}&n=${range.n}`,
              rowCount: older.length,
              first: older[0],
              last: older[older.length - 1],
            });
            if (cancelled) return;
            working = fillCandleGaps([...older, ...dataRef.current], intervalSec);
            dataRef.current = working;
            console.log('[chart] pan-left merged', { total: working.length, firstTs: working[0][0], lastTs: working[working.length - 1][0] });
          }
          if (needsNewer) {
            const newer = await nodeApi.getCandlesAfter(
              asset,
              range.interval,
              latest + 1,
              range.n,
            );
            console.log('[chart] pan-right fetch', {
              url: `?from=${latest + 1}&n=${range.n}`,
              rowCount: newer.length,
              first: newer[0],
              last: newer[newer.length - 1],
            });
            if (cancelled) return;
            working = fillCandleGaps([...dataRef.current, ...newer], intervalSec);
            dataRef.current = working;
            console.log('[chart] pan-right merged', { total: working.length, firstTs: working[0][0], lastTs: working[working.length - 1][0] });
          }
        } catch (err) {
          if (!cancelled) setError(err.message || 'Failed to load adjacent range');
          return;
        }

        setCandles(working);
        candleSeries.setData(working.map(toLwcCandle));
        volumeSeries.setData(working.map(toLwcVolume));
      }, 250);
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(onLogicalRangeChange);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onLogicalRangeChange);
    };
  }, [asset, rangeIdx]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {RANGES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setRangeIdx(i)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              i === rangeIdx ? 'bg-primary text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >{r.label}</button>
        ))}
        {loading && <FaSync className="animate-spin text-white/40 ml-1" size={14} />}
      </div>
      <div ref={containerRef} className="h-96 w-full" />
      {!loading && error && (
        <div className="text-xs text-error">{error}</div>
      )}
    </div>
  );
}
