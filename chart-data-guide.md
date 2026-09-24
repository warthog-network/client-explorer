# CandleChart data acquisition

How `client-explorer/src/components/CandleChart.jsx` loads and merges candle data.

## Goal

Serve OHLCV data for asset price charts. Lazy, asymmetric, exhaustable.

## State

- `dataRef.current`: the in-memory candle array. ASC by timestamp.
  Each entry = `[begin_timestamp, height, open, high, low, close, base, quote]`.
- `exhaustedLeftRef`: bool. True once `getCandlesBefore` returned 0 candles —
  means there's no trading history older than `dataRef.current[0][0]`.
- `exhaustedRightRef`: bool. Same idea on the future side (past "now").
- `vLeftRef`, `vRightRef`: numeric. The leftmost / rightmost timestamps in
  the chart's currently visible viewport, kept in sync via
  `subscribeVisibleTimeRangeChange`. Null if no data is loaded.

## Server contract (v0.10.29, inclusive both sides, no server LOCF)

- `?n=N`             → latest N (ASC). Use for initial load.
- `?to=<bound>&n=N`  → up to N candles with `ts <= bound` (ASC). Use for pan-left.
- `?from=<bound>&n=N` → up to N candles with `ts >= bound` (ASC). Use for pan-right.
- `?from=<a>&to=<b>` → all candles in `[a, b]` inclusive. SDKs only; the
                       chart doesn't call this — directional ±1 requests
                       guarantee non-overlap so plain concat works.

## Offsets matter

Each fetch uses an offset of ±1 second against the current boundary:

  pan-left:  `to = loadedLeft  - 1`     → never includes the boundary candle we already have.
  pan-right: `from = loadedRight + 1`   → never duplicates it.

This gives non-overlapping chunks. Concat + `fillCandleGaps` is correct
without any dedup step. If you change the offsets, you must add dedup.

## Fill-the-gap pipeline

After every merge, run `fillCandleGaps(mergedArray, intervalSec)`:

- Sorts gaps between consecutive real candles.
- Inserts `(Δ / interval − 1)` synthetic candles per gap.
- Synthetic shape: open=high=low=close=prev.close, base=quote=0, height=0
  (sentinel for "no first trade").
- Throws on out-of-order, duplicate, or misaligned pairs.

## Imputing candles you didn't request

The chart tracks two ranges:

- **Loaded range.** `dataRef.current[0][0]` to `dataRef.current[last][0]`.
  Set by every successful fetch.
- **Visible range.** `vLeftRef` / `vRightRef`, kept in sync with the chart's
  `getVisibleRange()` via `subscribeVisibleTimeRangeChange`. At first paint
  they default to the loaded range; subsequent pan/zoom updates them.

`ensureRangeLoaded()` runs whenever the visible range extends past the
loaded range. It loops the directional request type until one of two exits:

- The server returns 0 candles (start of trading or present edge reached).
  The matching `exhausted*Ref` is set; subsequent calls short-circuit
  the network request.
- The new chunk's first candle has `ts < vLeft` (or last candle has
  `ts > v_right`). We have a prevNonEmpty at the boundary, the leading
  edge is filled by `fillCandleGaps`, loop terminates.

First paint typically needs no extra request: `vLeft == loadedLeft`
and `v_right == loadedRight`, so the under-shoot condition is false.
Only an immediately-applied zoom-out or jump exposes under-shoot at
first render; in that case the post-load visible-range event triggers
the loop.

User-driven pans and viewport-driven fetches cooperate: a pan pulls in
N candles, then `subscribeVisibleTimeRangeChange` sees the new `vLeft`
and (if the user keeps panning past) continues the loop.

## Fetch sites

| Trigger                                 | URL                                            |
|-----------------------------------------|------------------------------------------------|
| Component mount / asset / range change  | `?n=200`                                       |
| Visible range extends past left edge     | `?to={loadedLeft - 1}&n=200`                    |
| Visible range extends past right edge    | `?from={loadedRight + 1}&n=200`                  |
| User-clicked jump                       | `?to={min(midTs+JUMP_HALF·interval, now)}&n=200` |

Two fetch paths share the same directional request types:

1. **Viewport-driven.** `subscribeVisibleTimeRangeChange` keeps
   `vLeftRef`/`vRightRef` aligned with the visible window; whenever
   `v_left < loadedLeft` (or `v_right > loaded_right`), `ensureRangeLoaded`
   loops `?to=`/`?from=` until exhaustion or until the new chunk
   crosses the requested boundary.
2. **User-driven.** Pan-left/right gestures call the same directional
   endpoints directly. No separate API.

Loop termination: response empty (set matching `exhausted*Ref`); or
the new chunk crosses the required boundary.

## Exhaustion optimization

`exhaustedLeftRef` flips true the first time any `getCandlesBefore`
returns empty — whether triggered by user pan-left or viewport under-shoot.
Same for `exhaustedRightRef` on the right side.

Reset the flags whenever the data domain changes:

- asset change (different trading history).
- rangeIdx change (different interval granularity).
- jump executed (new viewport domain).
- component mount (refs default to false).

A single `inflightLoopRef` guards against simultaneous loops.

## Validation

`fillCandleGaps.getCandleGap` throws on:

- `diff < 0`                (out of order — server bug or merge-order bug)
- `diff === 0`              (duplicate timestamp — server bug)
- `diff % interval !== 0`   (misaligned gap — server bug)

Treat these as fatal; surface to the chart's error state.

## What not to do

- Don't bypass the visible-range handler by issuing fetches imperatively
  from a user gesture without also updating `vLeftRef` / `vRightRef`.
  The next visible-range event will then fire the same loop with
  stale V_left / V_right.
- Don't change the wire format — it's locked at v0.10.29 server.
- Don't merge without `fillCandleGaps` — sparse trading periods leave
  gaps that produce visible chart artifacts.
- Don't swap `?to=`/ `?from=` for `?from=&to=` without the dedup step.
- Don't fire concurrent loops. The single in-flight guarantee is the
  `inflightLoopRef` guard.
