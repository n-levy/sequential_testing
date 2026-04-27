'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

/* ── helpers ── */
function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1.0 / (1.0 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return 0.5 * (1 + sign * y)
}

function twoSampleZ(n: number): { z: number; p: number } {
  let sx = 0, sxx = 0, sy = 0, syy = 0
  for (let i = 0; i < n; i++) {
    const x = randn(); sx += x; sxx += x * x
    const y = randn(); sy += y; syy += y * y
  }
  const mx = sx / n, my = sy / n
  const vx = sxx / n - mx * mx, vy = syy / n - my * my
  const se = Math.sqrt((vx + vy) / n)
  const z = se > 0 ? (my - mx) / se : 0
  const pVal = 2 * (1 - normalCDF(Math.abs(z)))
  return { z, p: pVal }
}

/* ── constants ── */
interface PeekSchedule {
  label: string
  description: string
  peekTimes: number[]
  color: string
}

const SCHEDULES: PeekSchedule[] = [
  { label: 'Once (end only)', description: 'Classical: look once at n = 500', peekTimes: [500], color: '#22c55e' },
  { label: 'Weekly x 4', description: 'Peek every 125 users (4 peeks)', peekTimes: [125, 250, 375, 500], color: '#3b82f6' },
  { label: 'Daily x 14', description: 'Peek every ~36 users (14 peeks)', peekTimes: Array.from({ length: 14 }, (_, i) => Math.round(500 * (i + 1) / 14)), color: '#f59e0b' },
  { label: 'Continuous', description: 'Peek every 10 users (50 peeks)', peekTimes: Array.from({ length: 50 }, (_, i) => (i + 1) * 10), color: '#ef4444' },
]

const N_SIMS = 500
const ALPHA = 0.05

export function PeekingSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    fpCounts: number[]
    fpRates: number[]
    exampleTrajectories: { n: number; p: number }[][]
  } | null>(null)

  const barRef = useRef<SVGSVGElement | null>(null)
  const trajRef = useRef<SVGSVGElement | null>(null)

  const runSimulation = useCallback(() => {
    setIsRunning(true)
    setIsDone(false)
    setResults(null)
    setProgress(0)

    const fpCounts = new Array(SCHEDULES.length).fill(0)
    const exampleTrajectories: { n: number; p: number }[][] = SCHEDULES.map(() => [])
    let sim = 0
    const BATCH = 25

    function runBatch() {
      const end = Math.min(sim + BATCH, N_SIMS)
      for (; sim < end; sim++) {
        for (let sIdx = 0; sIdx < SCHEDULES.length; sIdx++) {
          const schedule = SCHEDULES[sIdx]
          let falsePositive = false
          for (const n of schedule.peekTimes) {
            const { p } = twoSampleZ(n)
            if (sim === 0) {
              exampleTrajectories[sIdx].push({ n, p })
            }
            if (p < ALPHA) {
              falsePositive = true
              break
            }
          }
          if (falsePositive) fpCounts[sIdx]++
        }
      }
      setProgress(Math.round((sim / N_SIMS) * 100))
      if (sim < N_SIMS) {
        setTimeout(runBatch, 0)
      } else {
        const fpRates = fpCounts.map(c => c / N_SIMS)
        setResults({ fpCounts: [...fpCounts], fpRates, exampleTrajectories })
        setIsRunning(false)
        setIsDone(true)
      }
    }
    setTimeout(runBatch, 0)
  }, [])

  /* ── Bar Chart ── */
  useEffect(() => {
    if (!results || !barRef.current) return
    const svg = d3.select(barRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 30, bottom: 60, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 280 - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(SCHEDULES.map(s => s.label))
      .range([0, width])
      .padding(0.35)

    const y = d3.scaleLinear()
      .domain([0, Math.max(0.35, d3.max(results.fpRates)! * 1.2)])
      .range([height, 0])

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#e5e7eb')

    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0.05)).attr('y2', y(0.05))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text')
      .attr('x', width + 4).attr('y', y(0.05) + 4)
      .text('alpha = 5%').attr('fill', '#dc2626').attr('font-size', '11px')

    g.selectAll('.bar')
      .data(results.fpRates)
      .enter().append('rect')
      .attr('x', (_, i) => x(SCHEDULES[i].label)!)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', (_, i) => SCHEDULES[i].color)
      .attr('rx', 4)
      .transition().duration(800).delay((_, i) => i * 150)
      .attr('y', (d: number) => y(d))
      .attr('height', (d: number) => height - y(d))

    g.selectAll('.label')
      .data(results.fpRates)
      .enter().append('text')
      .attr('x', (_, i) => x(SCHEDULES[i].label)! + x.bandwidth() / 2)
      .attr('y', (d: number) => y(d) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', (_, i) => SCHEDULES[i].color)
      .text((d: number) => `${(d * 100).toFixed(1)}%`)

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text').attr('font-size', '11px')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .selectAll('text').attr('font-size', '11px')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px').attr('fill', '#6b7280')
      .text('False Positive Rate')
  }, [results])

  /* ── Trajectory Chart ── */
  useEffect(() => {
    if (!results || !trajRef.current) return
    const svg = d3.select(trajRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 50, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 260 - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, 520]).range([0, width])
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#e5e7eb')

    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(ALPHA)).attr('y2', y(ALPHA))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 1.5)
    g.append('text')
      .attr('x', width + 4).attr('y', y(ALPHA) + 4)
      .text('alpha = 0.05').attr('fill', '#dc2626').attr('font-size', '10px')

    results.exampleTrajectories.forEach((traj, sIdx) => {
      const line = d3.line<{ n: number; p: number }>()
        .x(d => x(d.n))
        .y(d => y(d.p))

      const path = g.append('path')
        .datum(traj)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', SCHEDULES[sIdx].color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)

      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0
      path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition().duration(1500).delay(sIdx * 300)
          .attr('stroke-dashoffset', 0)

      g.selectAll(`.dot-${sIdx}`)
        .data(traj)
        .enter().append('circle')
        .attr('cx', d => x(d.n))
        .attr('cy', d => y(d.p))
        .attr('r', 3)
        .attr('fill', SCHEDULES[sIdx].color)
        .attr('opacity', 0)
        .transition().duration(400).delay((_, i) => sIdx * 300 + i * 80)
        .attr('opacity', 0.7)
    })

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '11px')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '11px')

    g.append('text')
      .attr('x', width / 2).attr('y', height + 40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Sample Size')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('p-value')

    const legend = g.append('g').attr('transform', `translate(${width - 150}, 5)`)
    SCHEDULES.forEach((s, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 18})`)
      row.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', s.color)
      row.append('text').attr('x', 16).attr('y', 10).text(s.label).attr('font-size', '10px').attr('fill', '#374151')
    })
  }, [results])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Peeking Simulation</h4>
            <p className="text-sm text-neutral-600">
              Run {N_SIMS} A/A experiments (no real effect) and count how often you get
              a false positive under different peeking schedules.
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isRunning ? `Running... ${progress}%` : 'Run simulation'}
          </button>
        </div>

        {isRunning && (
          <div className="mt-3">
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {results && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SCHEDULES.map((s, i) => (
              <div
                key={s.label}
                className="bg-white border-2 rounded-lg p-4 text-center"
                style={{ borderColor: s.color }}
              >
                <div className="text-2xl font-bold" style={{ color: s.color }}>
                  {(results.fpRates[i] * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-neutral-500 mt-1">{s.label}</div>
                <div className="text-xs text-neutral-400">
                  {results.fpCounts[i]}/{N_SIMS} false positives
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <h5 className="font-semibold text-neutral-800 mb-2 text-sm">False Positive Rate by Peek Frequency</h5>
              <svg ref={barRef} viewBox="0 0 500 280" className="w-full" />
            </div>
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <h5 className="font-semibold text-neutral-800 mb-2 text-sm">Example p-value Trajectories (1 experiment)</h5>
              <svg ref={trajRef} viewBox="0 0 500 260" className="w-full" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Simulation takeaway:</strong> Under the null hypothesis (no real effect),
              the more often you peek at p-values, the more likely you are to see a
              &ldquo;significant&rdquo; result by chance. This is the core problem that sequential
              testing methods solve.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
