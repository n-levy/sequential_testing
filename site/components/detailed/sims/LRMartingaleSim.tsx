'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

export function LRMartingaleSim() {
  const [delta, setDelta] = useState(0.1)
  const [nFlips, setNFlips] = useState(100)
  const [nPaths, setNPaths] = useState(50)
  const [data, setData] = useState<{ h0: number[][]; h1: number[][] } | null>(null)
  const h0Ref = useRef<SVGSVGElement | null>(null)
  const h1Ref = useRef<SVGSVGElement | null>(null)

  const generate = useCallback(() => {
    const makePaths = (trueProb: number) => {
      const paths: number[][] = []
      for (let p = 0; p < nPaths; p++) {
        const lr = [1]
        for (let i = 1; i <= nFlips; i++) {
          const flip = Math.random() < trueProb ? 1 : 0
          const ratio = flip === 1 ? (0.5 + delta) / 0.5 : (0.5 - delta) / 0.5
          lr.push(lr[i - 1] * ratio)
        }
        paths.push(lr)
      }
      return paths
    }
    setData({ h0: makePaths(0.5), h1: makePaths(0.5 + delta) })
  }, [delta, nFlips, nPaths])

  useEffect(() => { generate() }, [])

  const drawPanel = useCallback((
    svgEl: SVGSVGElement | null,
    paths: number[][],
    title: string,
    color: string
  ) => {
    if (!svgEl || paths.length === 0) return
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 20, bottom: 45, left: 50 }
    const width = 400 - margin.left - margin.right
    const height = 280 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, nFlips]).range([0, width])
    // Use log scale for better visualization
    const allVals = paths.flat().filter(v => v > 0)
    const yMax = Math.min(d3.quantile(allVals.sort((a, b) => a - b), 0.99)! * 2, 100)
    const y = d3.scaleLinear().domain([0, Math.max(yMax, 3)]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Λ = 1 line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(1)).attr('y2', y(1))
      .attr('stroke', '#6b7280').attr('stroke-dasharray', '4,3').attr('stroke-width', 1)

    // Draw paths
    const line = d3.line<number>().x((_, i) => x(i)).y(d => y(Math.min(d, yMax * 1.5)))
    paths.forEach(path => {
      g.append('path').datum(path)
        .attr('d', line).attr('fill', 'none')
        .attr('stroke', color).attr('stroke-width', 1).attr('opacity', 0.25)
    })

    // Mean path
    const meanPath = Array.from({ length: nFlips + 1 }, (_, i) => {
      const vals = paths.map(p => Math.min(p[i], yMax * 1.5))
      return vals.reduce((a, b) => a + b, 0) / vals.length
    })
    g.append('path').datum(meanPath)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', color).attr('stroke-width', 3).attr('opacity', 0.9)

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '10px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '10px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', '#6b7280').text('Flip (n)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -35)
      .attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', '#6b7280').text('Λₙ')

    g.append('text').attr('x', width / 2).attr('y', -12)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text(title)
  }, [nFlips])

  useEffect(() => {
    if (!data) return
    drawPanel(h0Ref.current, data.h0, `Under H₀ (fair coin, p = 0.5)`, '#3b82f6')
    drawPanel(h1Ref.current, data.h1, `Under H₁ (biased, p = ${(0.5 + delta).toFixed(2)})`, '#ef4444')
  }, [data, drawPanel, delta])

  // Compute stats
  const h0Mean = data ? (data.h0.reduce((s, p) => s + p[p.length - 1], 0) / data.h0.length).toFixed(2) : '—'
  const h1Mean = data ? (data.h1.reduce((s, p) => s + p[p.length - 1], 0) / data.h1.length).toFixed(2) : '—'

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">LR Paths: H₀ vs H₁</h4>
            <p className="text-sm text-neutral-600">
              {nPaths} likelihood ratio paths. Under H₀ they wander (martingale); under H₁ they drift up.
              Bold line = average path.
            </p>
          </div>
          <button onClick={generate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">δ: {delta.toFixed(2)}</label>
            <input type="range" min={0.02} max={0.3} step={0.02} value={delta}
              onChange={e => setDelta(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Flips: {nFlips}</label>
            <input type="range" min={20} max={300} step={10} value={nFlips}
              onChange={e => setNFlips(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Paths: {nPaths}</label>
            <input type="range" min={10} max={100} step={10} value={nPaths}
              onChange={e => setNPaths(+e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <svg ref={h0Ref} viewBox="0 0 400 280" className="w-full" />
            <div className="text-center text-sm text-blue-700 font-medium mt-1">
              Mean final Λ: {h0Mean} (should ≈ 1)
            </div>
          </div>
          <div>
            <svg ref={h1Ref} viewBox="0 0 400 280" className="w-full" />
            <div className="text-center text-sm text-blue-700 font-medium mt-1">
              Mean final Λ: {h1Mean} (drifts upward)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
