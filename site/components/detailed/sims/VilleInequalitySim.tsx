'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1.0 / (1.0 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return 0.5 * (1 + sign * y)
}

function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function VilleInequalitySim() {
  const [nPaths, setNPaths] = useState(1000)
  const [nFlips, setNFlips] = useState(200)
  const [alpha] = useState(0.05)
  const [results, setResults] = useState<{
    markovCount: number
    villeCount: number
    zPeekCount: number
    examplePaths: number[][] // 10 example LR paths
  } | null>(null)
  const lrRef = useRef<SVGSVGElement | null>(null)
  const barRef = useRef<SVGSVGElement | null>(null)

  const delta = 0.1 // Alternative hypothesis bias

  const simulate = useCallback(() => {
    const threshold = 1 / alpha // Λ ≥ 1/α
    let markovCount = 0
    let villeCount = 0
    let zPeekCount = 0
    const examplePaths: number[][] = []

    for (let p = 0; p < nPaths; p++) {
      const lr = [1]
      let everCrossed = false
      let zEverSignificant = false
      let sumX = 0, sumX2 = 0

      for (let i = 1; i <= nFlips; i++) {
        // Fair coin (H0 is true)
        const flip = Math.random() < 0.5 ? 1 : 0
        const ratio = flip === 1 ? (0.5 + delta) / 0.5 : (0.5 - delta) / 0.5
        lr.push(lr[i - 1] * ratio)

        if (lr[i] >= threshold) everCrossed = true

        // Standard z-test for continuous checking
        const obs = randn() // N(0,1) under H0
        sumX += obs
        sumX2 += obs * obs
        if (i >= 2) {
          const mean = sumX / i
          const variance = (sumX2 / i) - mean * mean
          const se = Math.sqrt(Math.max(variance, 0.01) / i)
          const z = Math.abs(mean / se)
          const pVal = 2 * (1 - normalCDF(z))
          if (pVal < alpha) zEverSignificant = true
        }
      }

      // Markov: check only at the final step
      if (lr[nFlips] >= threshold) markovCount++
      if (everCrossed) villeCount++
      if (zEverSignificant) zPeekCount++

      if (p < 10) examplePaths.push(lr)
    }

    setResults({ markovCount, villeCount, zPeekCount, examplePaths })
  }, [nPaths, nFlips, alpha, delta])

  useEffect(() => { simulate() }, [])

  // Draw LR paths with threshold
  useEffect(() => {
    if (!results || !lrRef.current) return
    const svg = d3.select(lrRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 30, bottom: 45, left: 55 }
    const width = 600 - margin.left - margin.right
    const height = 280 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const threshold = 1 / alpha
    const x = d3.scaleLinear().domain([0, nFlips]).range([0, width])
    const yMax = Math.max(threshold * 1.5, 30)
    const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Threshold line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(threshold)).attr('y2', y(threshold))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text').attr('x', width + 4).attr('y', y(threshold) + 4)
      .text(`1/α = ${threshold}`).attr('fill', '#dc2626').attr('font-size', '10px')

    // Λ = 1 line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(1)).attr('y2', y(1))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '3,3').attr('stroke-width', 1)

    const line = d3.line<number>().x((_, i) => x(i)).y(d => y(Math.min(d, yMax * 1.2)))
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4']

    results.examplePaths.forEach((path, pIdx) => {
      g.append('path').datum(path)
        .attr('d', line).attr('fill', 'none')
        .attr('stroke', colors[pIdx % colors.length])
        .attr('stroke-width', 1.5).attr('opacity', 0.6)
    })

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Flip (n)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Λₙ')

    g.append('text').attr('x', width / 2).attr('y', -8)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text('10 Example LR Paths under H₀ (fair coin)')
  }, [results, nFlips, alpha])

  // Bar chart comparing the three rates
  useEffect(() => {
    if (!results || !barRef.current) return
    const svg = d3.select(barRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 20, bottom: 60, left: 60 }
    const width = 400 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const data = [
      { label: 'Markov\n(end only)', rate: results.markovCount / nPaths, color: '#3b82f6' },
      { label: 'Ville\n(LR any time)', rate: results.villeCount / nPaths, color: '#8b5cf6' },
      { label: 'z-test peek\n(every step)', rate: results.zPeekCount / nPaths, color: '#ef4444' },
    ]

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, width]).padding(0.35)
    const y = d3.scaleLinear()
      .domain([0, Math.max(0.35, d3.max(data, d => d.rate)! * 1.3)])
      .range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // α line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(alpha)).attr('y2', y(alpha))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 1.5)
    g.append('text').attr('x', width + 4).attr('y', y(alpha) + 4)
      .text(`α = ${(alpha * 100).toFixed(0)}%`).attr('fill', '#dc2626').attr('font-size', '10px')

    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('x', d => x(d.label)!)
      .attr('width', x.bandwidth())
      .attr('y', height).attr('height', 0)
      .attr('fill', d => d.color).attr('rx', 4)
      .transition().duration(800).delay((_, i) => i * 200)
      .attr('y', d => y(d.rate))
      .attr('height', d => height - y(d.rate))

    g.selectAll('.lbl').data(data).enter().append('text')
      .attr('x', d => x(d.label)! + x.bandwidth() / 2)
      .attr('y', d => y(d.rate) - 6)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold')
      .attr('fill', d => d.color)
      .text(d => `${(d.rate * 100).toFixed(1)}%`)

    g.append('g').attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text').attr('font-size', '10px')

    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('False positive rate')

    g.append('text').attr('x', width / 2).attr('y', -12)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text(`Crossing rates (${nPaths.toLocaleString()} paths, H₀ true)`)
  }, [results, nPaths, alpha])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Markov vs Ville vs Peeking z-test</h4>
            <p className="text-sm text-neutral-600">
              All under H₀ (fair coin). Compare: crossing threshold at one time (Markov),
              ever crossing (Ville), and repeated z-test significance.
            </p>
          </div>
          <button onClick={simulate}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">
            Re-run
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Paths: {nPaths.toLocaleString()}</label>
            <input type="range" min={100} max={5000} step={100} value={nPaths}
              onChange={e => setNPaths(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Flips: {nFlips}</label>
            <input type="range" min={50} max={500} step={50} value={nFlips}
              onChange={e => setNFlips(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <svg ref={lrRef} viewBox="0 0 600 280" className="w-full" />
          <svg ref={barRef} viewBox="0 0 400 250" className="w-full" />
        </div>

        {results && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Key insight:</strong> Both Markov ({((results.markovCount / nPaths) * 100).toFixed(1)}%)
              and Ville ({((results.villeCount / nPaths) * 100).toFixed(1)}%) stay below α = {(alpha * 100).toFixed(0)}%,
              while the standard z-test with peeking ({((results.zPeekCount / nPaths) * 100).toFixed(1)}%)
              far exceeds it. The LR threshold is anytime-valid; the p-value threshold is not.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
