'use client'

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as d3 from 'd3'
import { InlineMath } from '../ui/Math'

export type SimLayer =
  | 'fixed-ci'
  | 'sequential-ci'
  | 'pocock'
  | 'obf'
  | 'bonferroni'

interface ABTestSimProps {
  layers: SimLayer[]
  showPeekStats?: boolean
  takeaway?: ReactNode
  defaultEffect?: number // difference in means between B and A
  defaultN?: number
  showPowerControl?: boolean
  K?: number // number of peeks for group sequential methods
  hideEffectStats?: boolean // hide sample effect and CI half-width boxes
}

const Z_975 = 1.959964
const PEEK_N_SIMS = 500
const PEEK_LOOKS = 6
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

/** Simulate running difference in means for A/B test. */
function simulateABTestTrajectory(n: number, effect: number, seed: number) {
  const rand = mulberry32(seed)
  const meansA = new Float64Array(n)
  const meansB = new Float64Array(n)
  const ses = new Float64Array(n)
  let sumA = 0, sumB = 0
  for (let i = 0; i < n; i++) {
    sumA += rand() < 0.5 ? 1 : 0
    sumB += rand() < 0.5 + effect ? 1 : 0
    const k = i + 1
    meansA[i] = sumA / k
    meansB[i] = sumB / k
    // Pooled variance for difference in means
    const vA = Math.max(meansA[i] * (1 - meansA[i]), 1e-4)
    const vB = Math.max(meansB[i] * (1 - meansB[i]), 1e-4)
    ses[i] = Math.sqrt((vA + vB) / k)
  }
  return { meansA, meansB, ses }
}

export function ABTestSim({
  layers,
  showPeekStats = false,
  takeaway,
  defaultEffect = 0,
  defaultN = 500,
  showPowerControl = false,
  K = 6,
  hideEffectStats = false,
}: ABTestSimProps) {
  const [effect, setEffect] = useState(defaultEffect)
  const [n, setN] = useState(defaultN)
  const [alpha, setAlpha] = useState(0.05)
  const [power, setPower] = useState(0.8)
  const [seed, setSeed] = useState(1)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Clamp effect to [-0.5, 0.5]
  const clampedEffect = Math.max(-0.5, Math.min(0.5, effect))

  // Trajectory recomputed automatically whenever the controls change.
  const traj = useMemo(() => simulateABTestTrajectory(n, clampedEffect, seed), [n, clampedEffect, seed])


  // Compute the running effect in percent: (meanB - meanA) / meanA
  const effectPct = useMemo(() => {
    const arr = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const denom = traj.meansA[i]
      arr[i] = denom !== 0 ? 100 * (traj.meansB[i] - denom) / denom : 0
    }
    return arr
  }, [traj, n])

  // Compute the per-step CI half-width for the fixed CI (in percent)
  const ciHalfWidthPct = useMemo(() => {
    const arr = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const denom = traj.meansA[i]
      arr[i] = denom !== 0 ? 100 * Z_975 * traj.ses[i] / denom : 0
    }
    return arr
  }, [traj, n])

  // ── Render the plot ──
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const W = 700
    const H = 360
    const margin = { top: 20, right: 16, bottom: 44, left: 56 }
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom
    // Y-axis: include all values of the effect and all CI bands
    let allBounds: number[] = []
    for (let i = 0; i < effectPct.length; i++) {
      const v = effectPct[i]
      allBounds.push(v)
      allBounds.push(v - ciHalfWidthPct[i])
      allBounds.push(v + ciHalfWidthPct[i])
    }
    let minY = Math.min(...allBounds)
    let maxY = Math.max(...allBounds)
    const yMargin = 0.02 * Math.max(1, Math.abs(maxY - minY))
    const yMin = minY - yMargin
    const yMax = maxY + yMargin
    const x = d3.scaleLinear().domain([1, n]).range([0, innerW])
    const y = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0])
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
    // Axes
    g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(6))
    g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(d => `${(d as number).toFixed(1)}%`))
    g.append('text')
      .attr('transform', `translate(${innerW / 2}, ${innerH + 36})`)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Number of users (n)')
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -42)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Effect: (B − A) / A (%)')
    // Reference line: null hypothesis at 0
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#525252').attr('stroke-width', 1).attr('stroke-dasharray', '4 3')
    // CI band
    const area = d3.area<number>()
      .x((_d, i) => x(i + 1))
      .y0((_d, i) => y(effectPct[i] - ciHalfWidthPct[i]))
      .y1((_d, i) => y(effectPct[i] + ciHalfWidthPct[i]))
      .defined((_d, i) => i >= 5 && Number.isFinite(ciHalfWidthPct[i]))
    g.append('path')
      .datum(Array.from({ length: n }, (_, i) => i))
      .attr('fill', LAYER_STYLE['fixed-ci'].color)
      .attr('fill-opacity', 0.12)
      .attr('stroke', LAYER_STYLE['fixed-ci'].color)
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.7)
      .attr('d', area as d3.Area<number>)
    // Mean effect trajectory
    const line = d3.line<number>()
      .x((_d, i) => x(i + 1))
      .y((_d, i) => y(effectPct[i]))
    g.append('path')
      .datum(Array.from({ length: n }, (_, i) => i))
      .attr('fill', 'none')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1.6)
      .attr('d', line as d3.Line<number>)
  }, [effectPct, ciHalfWidthPct, n])

  // Decision at the final time step (in percent)
  const decision = useMemo(() => {
    const last = n - 1
    const est = effectPct[last]
    const w = ciHalfWidthPct[last]
    const lo = est - w
    const hi = est + w
    if (lo > 0) return { label: 'Reject null — B > A', color: 'text-green-700' }
    if (hi < 0) return { label: 'Reject null — B < A', color: 'text-rose-700' }
    return { label: 'Inconclusive', color: 'text-neutral-600' }
  }, [effectPct, ciHalfWidthPct, n])

  return (
    <div className="bg-white border border-neutral-300 rounded-lg p-4 my-6">
      <div className="mb-2 text-base font-semibold text-blue-900">
        Effect: (B − A) / A, null hypothesis = 0%.
      </div>
      <div className="mb-3 text-sm text-blue-900 font-semibold">
        Effect size: <span className="font-mono">{clampedEffect >= 0 ? '+' : ''}{clampedEffect.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Number of users <span className="font-mono">(n = {n})</span>
          </label>
          <input
            type="range" min={50} max={100000} step={50}
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
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Effect size <span className="font-mono">({clampedEffect >= 0 ? '+' : ''}{clampedEffect.toFixed(2)})</span>
          </label>
          <input
            type="range" min={-0.5} max={0.5} step={0.01}
            value={clampedEffect} onChange={e => setEffect(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      {showPowerControl && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Power (1 - β) <span className="font-mono">({power.toFixed(2)})</span>
          </label>
          <input
            type="range" min={0.5} max={0.99} step={0.01}
            value={power} onChange={e => setPower(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSeed(s => s + 1)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Re-randomize
        </button>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 text-neutral-700">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: LAYER_STYLE['fixed-ci'].color, opacity: 0.45 }}
            />
            {LAYER_STYLE['fixed-ci'].label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-neutral-700">
            <span className="inline-block w-3 h-px bg-neutral-900" />
            Sample diff
          </span>
        </div>
      </div>
      {/* Plot */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 700 360"
          style={{ minWidth: 700, width: '100%', maxWidth: '100%' }}
          className="w-full"
        />
      </div>
      {/* Stats / decision panel */}
      {!hideEffectStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <div className="text-[11px] font-medium text-neutral-500 uppercase">Sample effect</div>
            <div className="text-lg font-semibold text-neutral-900 font-mono">
              {(effectPct[n - 1] >= 0 ? '+' : '')}{effectPct[n - 1].toFixed(2)}%
            </div>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <div className="text-[11px] font-medium text-neutral-500 uppercase">CI half-width</div>
            <div className="text-lg font-semibold text-neutral-900 font-mono">
              ±{ciHalfWidthPct[n - 1].toFixed(2)}%
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
        </div>
      )}
      {takeaway && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-sm text-blue-900">
          {takeaway}
        </div>
      )}
    </div>
  )
}
