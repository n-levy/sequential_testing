'use client'

// HarmPowerCurve.tsx — power-to-detect-harm curve for the in-depth track.
//
// Runs a client-side Monte Carlo across a grid of true harm magnitudes (0% to -50%)
// and plots the probability of detecting harm under three procedures:
//
//   1. Hybrid split-sided design (recommended)
//        - Interim: one-sided sequential CI at α/2 on the guardrail (upper bound < 0)
//        - Final:   two-sided fixed CI at α/2 at the planned end date
//        Total detection = union of the two channels.
//
//   2. Fixed-horizon test at α, evaluated only at the planned end date
//        (no interim monitoring; the "do nothing" baseline).
//
//   3. Three-Standard-Deviations rule (one-sided at z = 3.0)
//        evaluated at every peek — a common DIY guardrail check.
//
// All three procedures see the same K peeks and the same sample size, so the
// comparison is like-for-like.

import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

const Z_975 = 1.959964
const ALPHA_DEFAULT = 0.05
const REPS_DEFAULT = 500
const HARM_GRID = [0, -0.02, -0.05, -0.08, -0.10, -0.15, -0.20, -0.30, -0.50]

// ----- utilities (duplicated locally to keep this component self-contained) -----

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function erfinv(x: number) {
  const a = 0.147
  const ln = Math.log(1 - x * x)
  const s = 2 / (Math.PI * a) + ln / 2
  const sign = x < 0 ? -1 : 1
  return sign * Math.sqrt(Math.sqrt(s * s - ln / a) - s)
}

function normInv(p: number) {
  return Math.SQRT2 * erfinv(2 * p - 1)
}

function clampProbability(p: number) {
  return Math.max(1e-6, Math.min(1 - 1e-6, p))
}

function getPeekIndices(n: number, k: number): number[] {
  const uniqueLooks = new Set<number>()
  for (let j = 1; j <= k; j++) {
    const idx = Math.max(1, Math.round((j / k) * n))
    uniqueLooks.add(idx)
  }
  return Array.from(uniqueLooks).sort((a, b) => a - b)
}

// Simulates a single A/B trajectory and returns detection flags for the three methods.
function runOneTrial(
  n: number,
  relativeLift: number,
  controlRate: number,
  alpha: number,
  peekIndices: number[],
  seed: number
): { hybrid: boolean; fixedEnd: boolean; threeSD: boolean } {
  const rand = mulberry32(seed)
  const pA = clampProbability(controlRate)
  const pB = clampProbability(pA * (1 + relativeLift))
  let sumA = 0
  let sumB = 0
  let hybrid = false
  let threeSD = false
  let fixedEnd = false
  let lookPtr = 0
  const lastLookPtr = peekIndices.length - 1
  const nu = n * 0.25
  const zFinal = normInv(1 - alpha / 4) // two-sided at α/2 ⇒ per-tail α/4

  for (let i = 0; i < n && lookPtr <= lastLookPtr; i++) {
    sumA += rand() < pA ? 1 : 0
    sumB += rand() < pB ? 1 : 0
    if ((i + 1) !== peekIndices[lookPtr]) continue

    const k = i + 1
    const meanA = sumA / k
    const meanB = sumB / k
    const vA = Math.max(meanA * (1 - meanA), 1e-4)
    const vB = Math.max(meanB * (1 - meanB), 1e-4)
    const se = Math.sqrt((vA + vB) / k)
    const denom = meanA
    const est = denom !== 0 ? (meanB - denom) / denom : 0
    const seRel = denom !== 0 ? se / denom : 0

    // Hybrid: sequential CI at α/2, one-sided upper bound < 0
    if (!hybrid) {
      const logTerm = Math.log((k + nu) / (nu * (alpha / 2)))
      const wSeq = seRel * Math.sqrt((k + nu) / k * logTerm)
      if (est + wSeq < 0) hybrid = true
    }

    // Three-SD rule: one-sided at z = 3
    if (!threeSD) {
      const w3 = seRel * 3.0
      if (est + w3 < 0) threeSD = true
    }

    if (lookPtr === lastLookPtr) {
      // Fixed CI at end date, two-sided at α (=> per-tail α/2 => z = 1.96 when α = 0.05)
      const zAlpha = normInv(1 - alpha / 2)
      const wEnd = seRel * zAlpha
      if (est - wEnd > 0 || est + wEnd < 0) fixedEnd = true

      // Hybrid final channel: two-sided at α/2 (=> per-tail α/4 => z ≈ 2.24 when α = 0.05)
      if (!hybrid) {
        const wFinal = seRel * zFinal
        if (est - wFinal > 0 || est + wFinal < 0) hybrid = true
      }
    }

    lookPtr++
  }
  return { hybrid, fixedEnd, threeSD }
}

interface PowerRow { harm: number; hybrid: number; fixedEnd: number; threeSD: number }

export function HarmPowerCurve() {
  const [n, setN] = useState(10000)
  const [baseline, setBaseline] = useState(0.10)
  const [K, setK] = useState(6)
  const [reps, setReps] = useState(REPS_DEFAULT)
  const [alpha] = useState(ALPHA_DEFAULT)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000))
  const [results, setResults] = useState<PowerRow[] | null>(null)
  const [running, setRunning] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const runCurve = () => {
    setRunning(true)
    // Defer the heavy loop so the "running" state can render.
    setTimeout(() => {
      const peekIndices = getPeekIndices(n, K)
      const rows: PowerRow[] = HARM_GRID.map(harm => {
        let hyCount = 0
        let fxCount = 0
        let sdCount = 0
        for (let r = 0; r < reps; r++) {
          const s = seed + Math.floor((harm + 1) * 10007) + r * 31 + 1
          const { hybrid, fixedEnd, threeSD } = runOneTrial(n, harm, baseline, alpha, peekIndices, s)
          if (hybrid) hyCount++
          if (fixedEnd) fxCount++
          if (threeSD) sdCount++
        }
        return {
          harm,
          hybrid: hyCount / reps,
          fixedEnd: fxCount / reps,
          threeSD: sdCount / reps,
        }
      })
      setResults(rows)
      setRunning(false)
    }, 0)
  }

  // Draw the curve whenever results change
  useEffect(() => {
    if (!svgRef.current || !results) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 130, bottom: 46, left: 56 }
    const W = 700
    const H = 360
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, 50]).range([0, innerW]) // harm magnitude in %
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

    // grid
    g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(d => `${Math.round((d as number) * 100)}%`))
      .selectAll('line')
      .attr('stroke', '#f1f5f9')

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => `-${d}%`))

    g.append('text')
      .attr('transform', `translate(${innerW / 2}, ${innerH + 36})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#525252')
      .text('True harm magnitude (relative)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -42)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#525252')
      .text('P(harm detected by end)')

    const line = <K1 extends keyof PowerRow>(key: K1) => d3.line<PowerRow>()
      .x(d => x(-d.harm * 100))
      .y(d => y(d[key] as number))

    type Series = { key: keyof PowerRow; color: string; label: string }
    const series: Series[] = [
      { key: 'hybrid',    color: '#0369a1', label: 'Hybrid split-sided' },
      { key: 'fixedEnd',  color: '#ef4444', label: 'Fixed CI at end (α)' },
      { key: 'threeSD',   color: '#7c3aed', label: 'Three SD rule' },
    ]

    for (const s of series) {
      g.append('path')
        .datum(results)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2.2)
        .attr('d', line(s.key) as unknown as string)

      g.selectAll(`circle.${s.key}`)
        .data(results)
        .enter()
        .append('circle')
        .attr('cx', d => x(-d.harm * 100))
        .attr('cy', d => y(d[s.key] as number))
        .attr('r', 3)
        .attr('fill', s.color)
    }

    // Legend
    const legend = g.append('g').attr('transform', `translate(${innerW + 12}, 8)`)
    series.forEach((s, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 20})`)
      row.append('line')
        .attr('x1', 0).attr('x2', 18)
        .attr('y1', 6).attr('y2', 6)
        .attr('stroke', s.color).attr('stroke-width', 2.2)
      row.append('text')
        .attr('x', 24).attr('y', 10)
        .style('font-size', '11px')
        .style('fill', '#334155')
        .text(s.label)
    })
  }, [results])

  return (
    <div className="border border-neutral-300 bg-white rounded-lg p-5">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Sample size per group (<span className="font-mono">n = {n.toLocaleString()}</span>)
          </label>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={n}
            onChange={e => setN(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Control conversion rate (<span className="font-mono">p = {(baseline * 100).toFixed(0)}%</span>)
          </label>
          <input
            type="range"
            min={0.01}
            max={0.5}
            step={0.01}
            value={baseline}
            onChange={e => setBaseline(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Number of peeks (<span className="font-mono">K = {K}</span>)
          </label>
          <input
            type="range"
            min={2}
            max={50}
            step={1}
            value={K}
            onChange={e => setK(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Repetitions per grid point (<span className="font-mono">R = {reps}</span>)
          </label>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={reps}
            onChange={e => setReps(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={runCurve}
          disabled={running}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-neutral-400"
        >
          {running ? 'Running…' : 'Run power curve'}
        </button>
        <button
          type="button"
          onClick={() => setSeed(Math.floor(Math.random() * 100000))}
          className="px-3 py-2 text-sm bg-neutral-100 border border-neutral-300 rounded hover:bg-neutral-200"
        >
          New random seed
        </button>
        <span className="text-xs text-neutral-500">
          α = {alpha}, two-sided fixed test as baseline
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 700 360"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
        />
      </div>

      {results && (
        <div className="mt-4 overflow-x-auto">
          <table className="text-sm border-collapse w-full max-w-xl mx-auto">
            <thead>
              <tr className="bg-neutral-100 text-neutral-800">
                <th className="border border-neutral-300 px-3 py-1.5 text-left">True harm</th>
                <th className="border border-neutral-300 px-3 py-1.5 text-right">Hybrid split-sided</th>
                <th className="border border-neutral-300 px-3 py-1.5 text-right">Fixed CI at end</th>
                <th className="border border-neutral-300 px-3 py-1.5 text-right">Three SD</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.harm}>
                  <td className="border border-neutral-300 px-3 py-1 font-mono">
                    {r.harm === 0 ? '0%' : `${(r.harm * 100).toFixed(0)}%`}
                  </td>
                  <td className="border border-neutral-300 px-3 py-1 text-right font-mono text-blue-800">
                    {(r.hybrid * 100).toFixed(1)}%
                  </td>
                  <td className="border border-neutral-300 px-3 py-1 text-right font-mono text-red-700">
                    {(r.fixedEnd * 100).toFixed(1)}%
                  </td>
                  <td className="border border-neutral-300 px-3 py-1 text-right font-mono text-purple-700">
                    {(r.threeSD * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!results && !running && (
        <div className="text-sm text-neutral-500 text-center py-4">
          Adjust the parameters above and click <strong>Run power curve</strong> to generate the plot.
        </div>
      )}
    </div>
  )
}
