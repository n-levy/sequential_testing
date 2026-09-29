'use client'

// Focused-track power curve: sweeps true effect from 0% to -25% and compares
// naïve peeking (uncorrected fixed CI at every look) against the hybrid design with harm-only interim monitoring
// design. Two-curve, smaller-grid counterpart to detailed/sims/HarmPowerCurve.

import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { InlineMath } from '../ui/Math'

const ALPHA = 0.05
const REPS_DEFAULT = 500
const HARM_GRID = [0, -0.02, -0.05, -0.08, -0.10, -0.15, -0.20, -0.25]

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
  const looks = new Set<number>()
  for (let j = 1; j <= k; j++) looks.add(Math.max(1, Math.round((j / k) * n)))
  return Array.from(looks).sort((a, b) => a - b)
}

function runOneTrial(
  n: number,
  relativeLift: number,
  controlRate: number,
  peekIndices: number[],
  seed: number,
): { hybrid: boolean; naivePeek: boolean } {
  const rand = mulberry32(seed)
  const pA = clampProbability(controlRate)
  const pB = clampProbability(pA * (1 + relativeLift))
  let sumA = 0
  let sumB = 0
  let hybrid = false
  let naivePeek = false
  let lookPtr = 0
  const lastLookPtr = peekIndices.length - 1
  const rho = n / (Math.log(Math.log(Math.E / (ALPHA * ALPHA))) - 2 * Math.log(ALPHA))
  const zAlpha = normInv(1 - ALPHA / 2)
  const zFinal = normInv(1 - ALPHA / 2)

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

    if (!hybrid) {
      const logTerm = Math.log((k + rho) / (rho * (ALPHA * ALPHA)))
      const wSeq = seRel * Math.sqrt((k + rho) / k * logTerm)
      if (est + wSeq < 0) hybrid = true
    }

    if (!naivePeek) {
      const wFix = seRel * zAlpha
      if (est - wFix > 0 || est + wFix < 0) naivePeek = true
    }

    if (lookPtr === lastLookPtr && !hybrid) {
      const wFinal = seRel * zFinal
      if (est - wFinal > 0 || est + wFinal < 0) hybrid = true
    }

    lookPtr++
  }
  return { hybrid, naivePeek }
}

interface Row { harm: number; hybrid: number; naivePeek: number }

export function HybridHarmCurve() {
  const [n, setN] = useState(10000)
  const [baseline, setBaseline] = useState(0.10)
  const [K, setK] = useState(14)
  const [reps, setReps] = useState(REPS_DEFAULT)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000))
  const [results, setResults] = useState<Row[] | null>(null)
  const [running, setRunning] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const runCurve = () => {
    setRunning(true)
    setTimeout(() => {
      const peekIndices = getPeekIndices(n, K)
      const rows: Row[] = HARM_GRID.map(harm => {
        let hyCount = 0
        let npCount = 0
        for (let r = 0; r < reps; r++) {
          const s = seed + Math.floor((harm + 1) * 10007) + r * 31 + 1
          const { hybrid, naivePeek } = runOneTrial(n, harm, baseline, peekIndices, s)
          if (hybrid) hyCount++
          if (naivePeek) npCount++
        }
        return { harm, hybrid: hyCount / reps, naivePeek: npCount / reps }
      })
      setResults(rows)
      setRunning(false)
    }, 0)
  }

  // Auto-run once on mount so the chart is visible without user interaction.
  useEffect(() => {
    runCurve()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!svgRef.current || !results) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 130, bottom: 46, left: 56 }
    const W = 700
    const H = 340
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, 25]).range([0, innerW])
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

    g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(d => `${Math.round((d as number) * 100)}%`))
      .selectAll('line').attr('stroke', '#f1f5f9')

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => `-${d}%`))

    g.append('text')
      .attr('transform', `translate(${innerW / 2}, ${innerH + 36})`)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('True harm magnitude (relative)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -42)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Share of simulations flagging as significant')

    const series: { key: 'hybrid' | 'naivePeek'; color: string; label: string }[] = [
      { key: 'naivePeek', color: '#ef4444', label: `Fixed horizon (naïve peeking, K=${K})` },
      { key: 'hybrid',    color: '#0369a1', label: 'Hybrid (harm-only interim monitoring)' },
    ]

    const mkLine = (k: 'hybrid' | 'naivePeek') => d3.line<Row>()
      .x(d => x(-d.harm * 100))
      .y(d => y(d[k]))

    for (const s of series) {
      g.append('path')
        .datum(results)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2.2)
        .attr('d', mkLine(s.key) as unknown as string)

      g.selectAll(`circle.${s.key}`)
        .data(results)
        .enter()
        .append('circle')
        .attr('cx', d => x(-d.harm * 100))
        .attr('cy', d => y(d[s.key]))
        .attr('r', 3)
        .attr('fill', s.color)
    }

    const legend = g.append('g').attr('transform', `translate(${innerW + 12}, 8)`)
    series.forEach((s, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 22})`)
      row.append('line')
        .attr('x1', 0).attr('x2', 18)
        .attr('y1', 6).attr('y2', 6)
        .attr('stroke', s.color).attr('stroke-width', 2.2)
      row.append('text')
        .attr('x', 24).attr('y', 10)
        .style('font-size', '11px').style('fill', '#334155')
        .text(s.label)
    })
  }, [results, K])

  return (
    <div className="border border-neutral-300 bg-white rounded-lg p-5">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Sample size per group (<span className="font-mono">n = {n.toLocaleString()}</span>)
          </label>
          <input
            type="range" min={1000} max={100000} step={1000}
            value={n} onChange={e => setN(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Control conversion rate (<span className="font-mono">p = {(baseline * 100).toFixed(0)}%</span>)
          </label>
          <input
            type="range" min={0.01} max={0.5} step={0.01}
            value={baseline} onChange={e => setBaseline(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Number of peeks (<span className="font-mono">K = {K}</span>)
          </label>
          <input
            type="range" min={2} max={50} step={1}
            value={K} onChange={e => setK(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Repetitions per grid point (<span className="font-mono">R = {reps}</span>)
          </label>
          <input
            type="range" min={100} max={2000} step={100}
            value={reps} onChange={e => setReps(Number(e.target.value))}
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
          {running ? 'Running…' : 'Run comparison curve'}
        </button>
        <button
          type="button"
          onClick={() => setSeed(Math.floor(Math.random() * 100000))}
          className="px-3 py-2 text-sm bg-neutral-100 border border-neutral-300 rounded hover:bg-neutral-200"
        >
          New random seed
        </button>
        <span className="text-xs text-neutral-500">
          <InlineMath>{`\\alpha = 0.05`}</InlineMath>
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 700 340"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
        />
      </div>

      {results && (
        <div className="mt-4 overflow-x-auto">
          <table className="text-sm border-collapse w-full max-w-xl mx-auto">
            <thead>
              <tr className="bg-neutral-100 text-neutral-800">
                <th className="border border-neutral-300 px-3 py-1.5 text-left">True effect</th>
                <th className="border border-neutral-300 px-3 py-1.5 text-right">Fixed horizon (naïve peeking)</th>
                <th className="border border-neutral-300 px-3 py-1.5 text-right">Hybrid (harm-only interim monitoring)</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.harm}>
                  <td className="border border-neutral-300 px-3 py-1 font-mono">
                    {r.harm === 0 ? '0%' : `${(r.harm * 100).toFixed(0)}%`}
                  </td>
                  <td className="border border-neutral-300 px-3 py-1 text-right font-mono text-red-700">
                    {(r.naivePeek * 100).toFixed(1)}%
                  </td>
                  <td className="border border-neutral-300 px-3 py-1 text-right font-mono text-blue-800">
                    {(r.hybrid * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!results && !running && (
        <div className="text-sm text-neutral-500 text-center py-4">
          Adjust the parameters above and click <strong>Run comparison curve</strong> to generate the plot.
        </div>
      )}
    </div>
  )
}
