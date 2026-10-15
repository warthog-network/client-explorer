import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type {
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  LogicalRange,
  UTCTimestamp,
  Time,
} from 'lightweight-charts';
import { FaSync } from 'react-icons/fa';
import nodeApi from '../api/nodeApi';
import { fillCandleGaps, INTERVAL_SECONDS } from '../utils/trades';
import { formatPrice, formatCompact, formatTimestampShort } from '../utils/format';
import type { NodeCandle } from '../types/node';

interface Range {
  label: string;
  interval: string;
  n: number;
}

const RANGES: Range[] = [
  { label: '5m', interval: '5m', n: 200 },
  { label: '1h', interval: '1h', n: 200 },
  { label: '1d', interval: '1d', n: 200 },
];

const EDGE = 20;
const JUMP_MULT = 2;
const JUMP_HALF = 100;

/** Candle tuple index: 0 time, 1 height, 2 open, 3 high, 4 low, 5 close, 6 base, 7 quote. */
/** lightweight-charts wants a UTCTimestamp (seconds) rather than a plain number. */
const toLwcCandle = (c: NodeCandle) => ({
  time: c[0] as UTCTimestamp, open: c[2], high: c[3], low: c[4], close: c[5],
});
const toLwcVolume = (c: NodeCandle) => ({
  time: c[0] as UTCTimestamp,
  value: c[7],
  color: c[5] >= c[2] ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)',
});

interface Hover {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  base: number;
  quote: number;
  height: number;
}

interface ChartBundle {
  chart: IChartApi;
  candleSeries: ISeriesApi<'Candlestick'>;
  volumeSeries: ISeriesApi<'Histogram'>;
}

interface CandleChartProps {
  asset: string | null | undefined;
  name?: string | null;
  refreshKey?: number;
}

export default function CandleChart({ asset, name, refreshKey = 0 }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartBundle | null>(null);
  const dataRef = useRef<NodeCandle[]>([]);
  const exhaustedLeftRef = useRef(false);
  const exhaustedRightRef = useRef(false);
  const vLeftRef = useRef<number | null>(null);
  const vRightRef = useRef<number | null>(null);
  const rangeRef = useRef<Range | null>(null);
  const assetRef = useRef<string | null | undefined>(null);
  const inflightLoopRef = useRef<Promise<unknown> | null>(null);
  const [rangeIdx, setRangeIdx] = useState(1);
  /**
   * There is deliberately no `candles` state. The series are driven
   * imperatively through `candleSeries.setData`, and the tooltip re-renders
   * off `hover`, so nothing in this component's output depends on the data.
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: 'rgba(255,255,255,0.5)' },
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

    const onCrosshairMove = (param: MouseEventParams) => {
      if (param === undefined || param.time === undefined || !param.point) {
        setHover(null);
        return;
      }
      const candle = dataRef.current.find((c) => c[0] === param.time);
      if (!candle) {
        setHover(null);
        return;
      }
      setHover({
        time: candle[0],
        open: candle[2],
        high: candle[3],
        low: candle[4],
        close: candle[5],
        base: candle[6],
        quote: candle[7],
        height: candle[1],
      });
    };
    chart.subscribeCrosshairMove(onCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(onCrosshairMove);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    assetRef.current = asset;
    rangeRef.current = RANGES[rangeIdx] ?? null;
  });

  // Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!asset) return undefined;
    exhaustedLeftRef.current = false;
    exhaustedRightRef.current = false;
    vLeftRef.current = null;
    vRightRef.current = null;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const range = RANGES[rangeIdx];
    if (!range) return undefined;
    const intervalSec = INTERVAL_SECONDS[range.interval] ?? 1;
    assetRef.current = asset;
    rangeRef.current = range;
    nodeApi.getCandles(asset, range.interval, range.n).then((data) => {
      if (cancelled || !chartRef.current) return;
      const arr = Array.isArray(data) ? data : [];
      const filled = fillCandleGaps(arr, intervalSec) ?? [];
      dataRef.current = filled;
      if (filled.length > 0) {
        vLeftRef.current = filled[0]![0];
        vRightRef.current = filled[filled.length - 1]![0];
      }
      chartRef.current.candleSeries.setData(filled.map(toLwcCandle));
      chartRef.current.volumeSeries.setData(filled.map(toLwcVolume));
      chartRef.current.chart.timeScale().fitContent();
      setLoading(false);
    }).catch((err: unknown) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Failed to load chart');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [asset, rangeIdx, refreshKey]);

  // ensureRangeLoaded — keeps the loaded data covering the visible viewport ─
  const ensureRangeLoaded = async (): Promise<unknown> => {
    if (vLeftRef.current === null || vRightRef.current === null) return null;
    if (!assetRef.current || !rangeRef.current) return null;
    if (inflightLoopRef.current) return inflightLoopRef.current;
    if (!dataRef.current.length) return null;
    const bundle = chartRef.current;
    const intervalSec = INTERVAL_SECONDS[rangeRef.current.interval] ?? 1;
    const first = dataRef.current[0]![0];
    const last = dataRef.current[dataRef.current.length - 1]![0];

    if (!exhaustedLeftRef.current && vLeftRef.current < first) {
      inflightLoopRef.current = (async () => {
        try {
          let cursor = first - 1;
          while (
            !exhaustedLeftRef.current &&
            dataRef.current[0]![0] > vLeftRef.current! &&
            cursor >= vLeftRef.current!
          ) {
            const older = await nodeApi.getCandlesBefore(
              assetRef.current!, rangeRef.current!.interval, cursor, rangeRef.current!.n,
            );
            if (older.length === 0) {
              exhaustedLeftRef.current = true;
              console.log('[chart] rangeLoaded left: exhausted at history boundary');
              break;
            }
            const merged = fillCandleGaps([...older, ...dataRef.current], intervalSec) ?? [];
            dataRef.current = merged;
            if (bundle) {
              bundle.candleSeries.setData(merged.map(toLwcCandle));
              bundle.volumeSeries.setData(merged.map(toLwcVolume));
            }
            console.log('[chart] rangeLoaded left', {
              url: `?to=${cursor}&n=${rangeRef.current!.n}`,
              fetched: older.length,
              total: merged.length,
              firstTs: merged[0]![0],
              vLeft: vLeftRef.current,
            });
            cursor = merged[0]![0] - 1;
          }
          if (dataRef.current[0]![0] <= vLeftRef.current!) {
            console.log('[chart] rangeLoaded left: covered viewport boundary');
          }
        } catch (err) {
          console.warn('[chart] rangeLoaded left error:', err);
        } finally {
          inflightLoopRef.current = null;
        }
      })();
      return inflightLoopRef.current;
    }

    if (!exhaustedRightRef.current && vRightRef.current > last) {
      inflightLoopRef.current = (async () => {
        try {
          let cursor = last + 1;
          while (
            !exhaustedRightRef.current &&
            dataRef.current[dataRef.current.length - 1]![0] < vRightRef.current! &&
            cursor <= vRightRef.current!
          ) {
            const newer = await nodeApi.getCandlesAfter(
              assetRef.current!, rangeRef.current!.interval, cursor, rangeRef.current!.n,
            );
            if (newer.length === 0) {
              exhaustedRightRef.current = true;
              console.log('[chart] rangeLoaded right: exhausted at present boundary');
              break;
            }
            const merged = fillCandleGaps([...dataRef.current, ...newer], intervalSec) ?? [];
            dataRef.current = merged;
            if (bundle) {
              bundle.candleSeries.setData(merged.map(toLwcCandle));
              bundle.volumeSeries.setData(merged.map(toLwcVolume));
            }
            console.log('[chart] rangeLoaded right', {
              url: `?from=${cursor}&n=${rangeRef.current!.n}`,
              fetched: newer.length,
              total: merged.length,
              lastTs: merged[merged.length - 1]![0],
              vRight: vRightRef.current,
            });
            cursor = merged[merged.length - 1]![0] + 1;
          }
          if (dataRef.current[dataRef.current.length - 1]![0] >= vRightRef.current!) {
            console.log('[chart] rangeLoaded right: covered viewport boundary');
          }
        } catch (err) {
          console.warn('[chart] rangeLoaded right error:', err);
        } finally {
          inflightLoopRef.current = null;
        }
      })();
      return inflightLoopRef.current;
    }
    return null;
  };

  // Subscribe to viewport time-range changes ───────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return undefined;
    const chart = chartRef.current.chart;

    const onVisibleTimeRangeChange = (range: { from: Time; to: Time } | null) => {
      if (range === null) {
        vLeftRef.current = null;
        vRightRef.current = null;
        return;
      }
      vLeftRef.current = Number(range.from);
      vRightRef.current = Number(range.to);
      ensureRangeLoaded();
    };
    chart.timeScale().subscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
    return () => {
      chart.timeScale().unsubscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
    };
  }, []);

  // User-driven pan / jump ────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return undefined;
    const { chart, candleSeries, volumeSeries } = chartRef.current;
    const range = RANGES[rangeIdx];
    if (!range) return undefined;
    assetRef.current = asset;
    rangeRef.current = range;
    const intervalSec = INTERVAL_SECONDS[range.interval] ?? 1;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const onLogicalRangeChange = (logicalRange: LogicalRange | null) => {
      if (!logicalRange || !asset) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        if (cancelled) return;
        const all = dataRef.current;
        if (!all.length) return;
        const total = all.length;
        const earliest = all[0]![0];
        const latest = all[all.length - 1]![0];
        const avgIntervalSec = total > 1 ? Math.max(1, Math.round((latest - earliest) / (total - 1))) : 1;

        const width = chart.timeScale().width();
        const leftLogical = chart.timeScale().coordinateToLogical(0);
        const rightLogical = chart.timeScale().coordinateToLogical(width);

        const isJumpLeft =
          leftLogical !== null && rightLogical !== null && rightLogical < -total * JUMP_MULT;
        const isJumpRight =
          leftLogical !== null && rightLogical !== null && leftLogical > total + total * JUMP_MULT;

        if (isJumpLeft || isJumpRight) {
          exhaustedLeftRef.current = false;
          exhaustedRightRef.current = false;
          vLeftRef.current = null;
          vRightRef.current = null;

          const midLogical = (leftLogical! + rightLogical!) / 2;
          let midTs: number;
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
            const filled = fillCandleGaps(fresh, intervalSec) ?? [];
            dataRef.current = filled;
            if (filled.length > 0) {
              vLeftRef.current = filled[0]![0];
              vRightRef.current = filled[filled.length - 1]![0];
            }
            candleSeries.setData(filled.map(toLwcCandle));
            volumeSeries.setData(filled.map(toLwcVolume));
          } catch (err) {
            if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to jump');
          }
          return;
        }

        const needsOlder = logicalRange.from !== null && logicalRange.from < EDGE;
        const needsNewer = logicalRange.to !== null && logicalRange.to > total - 1 - EDGE;

        if (!needsOlder && !needsNewer) return;

        let working = all;
        try {
          if (needsOlder) {
            if (exhaustedLeftRef.current) {
              console.log('[chart] pan-left skipped: already at history boundary');
              working = dataRef.current;
            } else {
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
              if (older.length === 0) {
                exhaustedLeftRef.current = true;
                console.log('[chart] pan-left reached history boundary, no more requests');
                working = dataRef.current;
              } else {
                working = fillCandleGaps([...older, ...dataRef.current], intervalSec) ?? [];
                dataRef.current = working;
                console.log('[chart] pan-left merged', { total: working.length, firstTs: working[0]![0], lastTs: working[working.length - 1]![0] });
              }
            }
          }
          if (needsNewer) {
            if (exhaustedRightRef.current) {
              console.log('[chart] pan-right skipped: at present boundary');
            } else {
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
              if (newer.length === 0) {
                exhaustedRightRef.current = true;
                console.log('[chart] pan-right reached present boundary, no more requests');
              } else {
                working = fillCandleGaps([...dataRef.current, ...newer], intervalSec) ?? [];
                dataRef.current = working;
                console.log('[chart] pan-right merged', { total: working.length, firstTs: working[0]![0], lastTs: working[working.length - 1]![0] });
              }
            }
          }
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load adjacent range');
          return;
        }

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
      <div className="relative h-96 w-full">
        <div ref={containerRef} className="absolute inset-0" />
        {hover && (
          <div
            className="absolute top-2 left-2 z-10 pointer-events-none
                       px-3 py-2 rounded-md bg-black/80 border border-white/10
                       text-xs font-mono text-white/80 leading-snug"
            data-testid="candle-hover"
          >
            <div className="text-white/60 text-[10px] mb-1">
              {formatTimestampShort(hover.time)}
              {hover.height > 0 ? ` · block #${hover.height}` : ''}
            </div>
            <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5">
              <span className="text-emerald-400">O</span>
              <span className="text-white">{formatPrice(hover.open)}</span>
              <span className="text-red-400">H</span>
              <span className="text-white">{formatPrice(hover.high)}</span>
              <span className="text-red-400">L</span>
              <span className="text-white">{formatPrice(hover.low)}</span>
              <span className="text-emerald-400">C</span>
              <span className="text-white">{formatPrice(hover.close)}</span>
            </div>
            <div className="mt-1 text-[10px] text-white/60 border-t border-white/10 pt-1">
              Vol{' '}
              <span className="text-white">{formatCompact(hover.base)}</span>
              {' '}{name ?? 'asset'}{' / '}
              <span className="text-white">{formatCompact(hover.quote)}</span>
              {' WART'}
            </div>
          </div>
        )}
      </div>
      {!loading && error && (
        <div className="text-xs text-error">{error}</div>
      )}
    </div>
  );
}