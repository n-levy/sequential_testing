'use client'

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as d3 from 'd3'
import { InlineMath } from '../ui/Math'

/**
 * Layers correspond to the concepts the user has learned so far.
 * Each act enables only the layers it has introduced.
 */
export type SimLayer =
  | 'fixed-ci'         // standard 95% CI band (Act 1: the one that fails under peeking)
  | 'sequential-ci'    // Eppo's sequential / mixture-boundary CI (Act 2)
  | 'pocock'           // group-sequential Pocock band (Act 3)
  | 'obf'              // group-sequential O'Brien-Fleming band (Act 3)
  | 'bonferroni'       // Bonferroni-corrected band (Act 3)

interface CoinFlipMeanSimProps {
  layers: SimLayer[]
  /** Show the peeking false-positive-rate stat (Act 1's punchline). */
  showPeekStats?: boolean
  /** Optional caption shown beneath the plot. */
  takeaway?: ReactNode
  /** Default coin bias, in [-0.5, +0.5] (P(heads) − 0.5). */
  defaultBias?: number
  /** Default number of flips. */
  defaultN?: number
}

const Z_975 = 1.959964               // standard normal quantile
const POCOCK_C = 2.555               // K=10 looks, α=0.05, two-sided
const OBF_C = 2.024                  // K=10 looks, α=0.05, two-sided
const N_LOOKS = 10                   // group-sequential schedule
const PEEK_N_SIMS = 500              // simulations behind the peeking stat
const PEEK_LOOKS = 50                // continuous peeking schedule for the stat

const LAYER_STYLE: Record<SimLayer, { color: string; label: string }> = {
  'fixed-ci':        { color: '#ef4444', label: 'Standard 95% CI' },
  'sequential-ci':   { color: '#2563eb', label: 'Sequential CI (Eppo)' },
  'pocock':          { color: '#f59e0b', label: 'Pocock (K=10)' },
  'obf':             { color: '#8b5cf6', label: "O'Brien–Fleming (K=10)" },
  'bonferroni':      { color: '#0d9488', label: 'Bonferroni (K=10)' },
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Simulate running mean of n coin flips with given bias. */
function simulateTrajectory(n: number, pHeads: number, seed: number) {
  const rand = mulberry32(seed)
  const means = new Float64Array(n)
  const ses = new Float64Array(n)
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += rand() < pHeads ? 1 : 0
    const k = i + 1
    const m = sum / k
    means[i] = m
    // Bernoulli variance estimator with floor to avoid 0
    const v = Math.max(m * (1 - m), 1e-4)
    ses[i] = Math.sqrt(v / k)
  }
  return { means, ses }
}

/** Half-width of the Eppo / Howard normal-mixture sequential CI. */
function sequentialHalfWidth(k: number, se: number, alpha: number, nu: number) {
  return se * Math.sqrt(((k + nu) / k) * Math.log((k + nu) / (nu * alpha * alpha)))
}

/**
 * Compute the empirical false-positive rate when peeking with a standard
 * fixed-n CI under the null (true bias = 0). This is the punchline of Act 1.
 */
function computePeekFPR(n: number, alpha: number, seedBase: number): number {
  // Standard CI crossing
  const zCrit = (() => {
    // Beasley-Springer-Moro
    const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
    const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
    const pl = 0.02425, pu = 1 - pl
    let q: number, r: number
    const p = 1 - alpha / 2
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1) }
    if (p <= pu) { q = p - 0.5; r = q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1) }
    q = Math.sqrt(-2 * Math.log(1-p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
  })();
  const looks = Math.min(PEEK_LOOKS, n)
  const stepSize = Math.max(1, Math.floor(n / looks))
  let fpCount = 0
  for (let s = 0; s < PEEK_N_SIMS; s++) {
    const rand = mulberry32(seedBase + s)
    let sum = 0
    let crossed = false
    for (let i = 1; i <= n && !crossed; i++) {
      sum += rand() < 0.5 ? 1 : 0
      if (i % stepSize !== 0 && i !== n) continue
      const m = sum / i
      const se = Math.sqrt(Math.max(m * (1 - m), 1e-4) / i)
      if (Math.abs(m - 0.5) > zCrit * se) crossed = true
    }
    if (crossed) fpCount++
  }
  return fpCount / PEEK_N_SIMS
}

// Sequential CI crossing (Eppo/Howard/mixture)
function computePeekSeqFPR(n: number, alpha: number, seedBase: number): number {
  const looks = Math.min(PEEK_LOOKS, n)
  const stepSize = Math.max(1, Math.floor(n / looks))
  let fpCount = 0
  for (let s = 0; s < PEEK_N_SIMS; s++) {
    const rand = mulberry32(seedBase + 10000 + s) // offset seed for independence
    let sum = 0
    let crossed = false
    for (let i = 1; i <= n && !crossed; i++) {
      sum += rand() < 0.5 ? 1 : 0
      if (i % stepSize !== 0 && i !== n) continue
      const m = sum / i
      const se = Math.sqrt(Math.max(m * (1 - m), 1e-4) / i)
      const hw = sequentialHalfWidth(i, se, alpha, n)
      if (Math.abs(m - 0.5) > hw) crossed = true
    }
    if (crossed) fpCount++
  }
  return fpCount / PEEK_N_SIMS
}

export function CoinFlipMeanSim({
  layers,
  showPeekStats = false,
  takeaway,
  // defaultBias is ignored; bias is always zero in this version
  defaultN = 500,
}: CoinFlipMeanSimProps) {
  const bias = 0 // always fair coin
  const [n, setN] = useState(defaultN)
  const [alpha, setAlpha] = useState(0.05)
  const [seed, setSeed] = useState(1)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const pHeads = 0.5

  // Trajectory recomputed automatically whenever the controls change.
  const traj = useMemo(() => simulateTrajectory(n, pHeads, seed), [n, pHeads, seed])

  // Peeking-FPR stats, gated by prop. Recomputed on n / α change only.
  const [peekFPR, setPeekFPR] = useState<number | null>(null)
  const [peekSeqFPR, setPeekSeqFPR] = useState<number | null>(null)
  useEffect(() => {
    if (!showPeekStats) return
    setPeekFPR(null)
    setPeekSeqFPR(null)
    const id = setTimeout(() => {
      setPeekFPR(computePeekFPR(n, alpha, seed * 7919))
      setPeekSeqFPR(computePeekSeqFPR(n, alpha, seed * 7919))
    }, 50)
    return () => clearTimeout(id)
  }, [showPeekStats, n, alpha, seed])

  // Compute the per-step CI half-width for each enabled layer.
  const bands = useMemo(() => {
    const result: Record<SimLayer, Float64Array | null> = {
      'fixed-ci': null,
      'sequential-ci': null,
      'pocock': null,
      'obf': null,
      'bonferroni': null,
    }
    const z = Z_975 // fixed for α=0.05; could be derived from alpha
    const zAlpha = alpha === 0.05 ? Z_975 : (() => {
      // crude but adequate fallback for the small range of α we expose
      const t = Math.sqrt(-2 * Math.log(alpha / 2))
      return t - (2.515517 + 0.802853 * t + 0.010328 * t * t) /
        (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)
    })()
    void z
    const nu = n // tightest at the planned sample size
    for (const layer of layers) {
      const arr = new Float64Array(n)
      for (let i = 0; i < n; i++) {
        const k = i + 1
        const se = traj.ses[i]
        switch (layer) {
          case 'fixed-ci':
            arr[i] = zAlpha * se
            break
          case 'sequential-ci':
            arr[i] = sequentialHalfWidth(k, se, alpha, nu)
            break
          case 'pocock':
            arr[i] = POCOCK_C * se
            break
          case 'obf': {
            // Within K=10 looks, OBF's boundary is c_K · √(K/look_index) · se
            // We approximate continuously: c_K · √(N/k) · se (front-loaded).
            arr[i] = OBF_C * Math.sqrt(n / k) * se
            break
          }
          case 'bonferroni': {
            // z_{α / (2K)} · se
            const aPer = alpha / N_LOOKS
            const t = Math.sqrt(-2 * Math.log(aPer / 2))
            const zB = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) /
              (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)
            arr[i] = zB * se
            break
          }
        }
      }
      result[layer] = arr
    }
    return result
  }, [layers, traj, alpha, n])

  // ── Render the plot ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = 700
    const H = 360
    const margin = { top: 20, right: 16, bottom: 44, left: 56 }
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom

    // Y-axis: estimated bias = sample mean - 0.5
    // Determine a comfortable y-extent that covers the largest enabled band.
    let yMax = 0.05
    for (const layer of layers) {
      const band = bands[layer]
      if (!band) continue
      // ignore the first 5 points which can have huge widths
      for (let i = Math.min(20, band.length - 1); i < band.length; i++) {
        if (band[i] > yMax) yMax = band[i]
      }
    }
    // include the trajectory itself
    let trajMax = 0
    for (let i = Math.min(20, traj.means.length - 1); i < traj.means.length; i++) {
      const v = Math.abs(traj.means[i] - 0.5)
      if (v > trajMax) trajMax = v
    }
    yMax = Math.min(0.5, Math.max(yMax, trajMax + 0.02, Math.abs(bias) + 0.05))

    const x = d3.scaleLinear().domain([1, n]).range([0, innerW])
    const y = d3.scaleLinear().domain([-yMax, yMax]).range([innerH, 0])

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Axes
    g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(6))
    g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(d3.format('+.2f')))
    g.append('text')
      .attr('transform', `translate(${innerW / 2}, ${innerH + 36})`)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Number of coin flips (n)')
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -42)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Estimated bias  (mean − 0.5)')

    // Reference line: null hypothesis at 0
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#525252').attr('stroke-width', 1).attr('stroke-dasharray', '4 3')
    // Draw white rectangle behind the label, higher (about +0.2)
    const nullLabel = 'Null (fair coin)';
    const nullFontSize = 11;
    const nullPaddingX = 6;
    const nullPaddingY = 2;
    const nullLabelY = y(0.2) - 8;
    // Temporary text to measure width
    const tempText = g.append('text')
      .attr('x', innerW - 8)
      .attr('y', nullLabelY)
      .style('font-size', `${nullFontSize}px`)
      .text(nullLabel);
    const node = tempText.node();
    if (node) {
      const bbox = node.getBBox();
      tempText.remove();
      g.append('rect')
        .attr('x', innerW - 8 - bbox.width - nullPaddingX)
        .attr('y', nullLabelY - bbox.height + nullPaddingY)
        .attr('width', bbox.width + 2 * nullPaddingX)
        .attr('height', bbox.height + 2 * nullPaddingY)
        .attr('fill', 'white')
        .attr('stroke', '#e5e7eb')
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('opacity', 0.95);
      g.append('text')
        .attr('x', innerW - 8)
        .attr('y', nullLabelY)
        .style('text-anchor', 'end')
        .style('font-size', `${nullFontSize}px`)
        .style('fill', '#525252')
        .text(nullLabel);
    }

    // True bias line if non-zero (removed: bias is always 0)

    // Band layers (lower → upper draw order).
    // Draw outermost bands first so inner bands overlay.
    const ordered: SimLayer[] = ['obf', 'bonferroni', 'pocock', 'sequential-ci', 'fixed-ci']
    for (const layer of ordered) {
      if (!layers.includes(layer)) continue
      const band = bands[layer]
      if (!band) continue
      const area = d3.area<number>()
        .x((_d, i) => x(i + 1))
        .y0((_d, i) => y(traj.means[i] - 0.5 - band[i]))
        .y1((_d, i) => y(traj.means[i] - 0.5 + band[i]))
        .defined((_d, i) => i >= 5 && Number.isFinite(band[i]))
      g.append('path')
        .datum(Array.from({ length: n }, (_, i) => i))
        .attr('fill', LAYER_STYLE[layer].color)
        .attr('fill-opacity', 0.12)
        .attr('stroke', LAYER_STYLE[layer].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.7)
        .attr('d', area as d3.Area<number>)
    }

    // Mean trajectory (drawn last, on top)
    const line = d3.line<number>()
      .x((_d, i) => x(i + 1))
      .y((_d, i) => y(traj.means[i] - 0.5))
    g.append('path')
      .datum(Array.from({ length: n }, (_, i) => i))
      .attr('fill', 'none')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1.6)
      .attr('d', line as d3.Line<number>)
  }, [traj, bands, layers, n, bias])

  // Decision at the final time step (using whichever the most-conservative
  // shown band is, so the displayed verdict matches the displayed plot).
  const decision = useMemo(() => {
    if (layers.length === 0) return null
    const last = n - 1
    const est = traj.means[last] - 0.5
    // Pick the *narrowest* band the user asked about: prefer sequential, else fixed.
    const order: SimLayer[] = ['sequential-ci', 'fixed-ci', 'pocock', 'obf', 'bonferroni']
    const layer = order.find(l => layers.includes(l))
    if (!layer) return null
    const w = bands[layer]?.[last]
    if (w == null) return null
    const lo = est - w
    const hi = est + w
    if (lo > 0) return { label: 'Reject null — bias > 0', color: 'text-green-700' }
    if (hi < 0) return { label: 'Reject null — bias < 0', color: 'text-rose-700' }
    return { label: 'Inconclusive', color: 'text-neutral-600' }
  }, [layers, bands, traj, n])

  return (
    <div className="bg-white border border-neutral-300 rounded-lg p-4 my-6">
      <div className="mb-3 text-sm text-blue-900 font-semibold">
        Coin bias is fixed at 0 (fair coin)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Number of flips <span className="font-mono">(n = {n})</span>
          </label>
          <input
            type="range" min={50} max={3000} step={50}
            value={n} onChange={e => setN(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            <InlineMath>{`\\alpha`}</InlineMath> <span className="font-mono">({alpha.toFixed(2)})</span>
          </label>
          <input
            type="range" min={0.01} max={0.10} step={0.01}
            value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSeed(s => s + 1)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Re-randomize
        </button>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {layers.map(layer => (
            <span key={layer} className="inline-flex items-center gap-1.5 text-neutral-700">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: LAYER_STYLE[layer].color, opacity: 0.45 }}
              />
              {LAYER_STYLE[layer].label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 text-neutral-700">
            <span className="inline-block w-3 h-px bg-neutral-900" />
            Sample mean
          </span>
        </div>
      </div>

      {/* Plot */}
      <svg ref={svgRef} viewBox="0 0 700 360" className="w-full" />

      {/* Stats / decision panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-neutral-500 uppercase">Sample mean</div>
          <div className="text-lg font-semibold text-neutral-900 font-mono">
            {traj.means[n - 1].toFixed(3)}
          </div>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-neutral-500 uppercase">Estimated bias</div>
          <div className="text-lg font-semibold text-neutral-900 font-mono">
            {(traj.means[n - 1] - 0.5 >= 0 ? '+' : '')}{(traj.means[n - 1] - 0.5).toFixed(3)}
          </div>
        </div>
        {decision && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 col-span-2">
            <div className="text-[11px] font-medium text-neutral-500 uppercase">
              Decision at n = {n}
            </div>
            <div className={`text-base font-semibold ${decision.color}`}>{decision.label}</div>
          </div>
        )}
        {showPeekStats && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 col-span-2 sm:col-span-4">
            <div className="text-[11px] font-medium text-amber-700 uppercase">
              False positive rate when peeking after every batch (true bias = 0)
            </div>
            <div className="text-lg font-semibold text-amber-900">
              {peekFPR == null
                ? 'Computing…'
                : `${(peekFPR * 100).toFixed(1)}% of ${PEEK_N_SIMS} simulated A/A tests crossed the standard CI at some point.`}
            </div>
            <div className="text-lg font-semibold text-blue-900 mt-1">
              {peekSeqFPR == null
                ? 'Computing…'
                : `${(peekSeqFPR * 100).toFixed(1)}% of ${PEEK_N_SIMS} simulated A/A tests crossed the Sequential CI at some point.`}
            </div>
            <div className="text-xs text-amber-800 mt-1">
              {bias === 0
                ? `Compare with the alpha of ${(alpha * 100).toFixed(0)}% — peeking inflates the error rate well beyond what a single look would give.`
                : 'With nonzero bias, this is not a false positive rate but the probability of crossing the standard or sequential CI at some point.'}
            </div>
          </div>
        )}
      </div>

      {takeaway && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-sm text-blue-900">
          {takeaway}
        </div>
      )}
    </div>
  )
}
