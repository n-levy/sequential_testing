'use client'

import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

export function SequentialMultiplierSim() {
  const [alpha] = useState(0.05)
  const [nuFactor, setNuFactor] = useState(1.0) // ν = nuFactor * maxN * σ²
  const [maxN, setMaxN] = useState(10000)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 30, bottom: 50, left: 60 }
    const width = 650 - margin.left - margin.right
    const height = 360 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const sigma2 = 1 // unit variance for simplicity
    const nu = nuFactor * maxN * sigma2

    // Generate multiplier values at log-spaced n values
    const nValues: number[] = []
    const steps = 200
    for (let i = 0; i < steps; i++) {
      const n = Math.round(Math.exp(Math.log(10) + (Math.log(maxN) - Math.log(10)) * i / (steps - 1)))
      if (nValues.length === 0 || n > nValues[nValues.length - 1]) {
        nValues.push(n)
      }
    }

    const seqMults: number[] = []
    const fixedMult = 1.96
    for (const n of nValues) {
      const v = n * sigma2
      const logTerm = Math.log((v + nu) / (nu * alpha))
      const m = Math.sqrt(((v + nu) / v) * logTerm)
      seqMults.push(m)
    }

    const x = d3.scaleLog().domain([10, maxN]).range([0, width])
    const yMax = Math.max(d3.max(seqMults)! * 1.1, 5)
    const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])

    // Grid
    g.append('g').call(d3.axisLeft(y).ticks(8).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Classical z = 1.96 line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(fixedMult)).attr('y2', y(fixedMult))
      .attr('stroke', '#3b82f6').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text').attr('x', width + 4).attr('y', y(fixedMult) + 4)
      .text('z = 1.96').attr('fill', '#3b82f6').attr('font-size', '10px')

    // Sequential multiplier curve
    const line = d3.line<number>()
      .x((_, i) => x(nValues[i]))
      .y(d => y(d))
    g.append('path').datum(seqMults)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', '#1d4ed8').attr('stroke-width', 3)

    // Area between sequential and fixed
    const area = d3.area<number>()
      .x((_, i) => x(nValues[i]))
      .y0(() => y(fixedMult))
      .y1(d => y(d))
    g.append('path').datum(seqMults)
      .attr('d', area).attr('fill', '#1d4ed8').attr('opacity', 0.08)

    // Mark where ν is tuned (n = nuFactor * maxN)
    const nuN = nuFactor * maxN
    if (nuN >= 10 && nuN <= maxN) {
      const nuV = nuN * sigma2
      const nuLogTerm = Math.log((nuV + nu) / (nu * alpha))
      const nuM = Math.sqrt(((nuV + nu) / nuV) * nuLogTerm)
      g.append('line').attr('x1', x(nuN)).attr('x2', x(nuN))
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', '#f59e0b').attr('stroke-dasharray', '4,3').attr('stroke-width', 1.5)
      g.append('circle').attr('cx', x(nuN)).attr('cy', y(nuM)).attr('r', 5)
        .attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 2)
      g.append('text').attr('x', x(nuN) + 8).attr('y', y(nuM) - 8)
        .text(`ν tuned here (${nuM.toFixed(2)})`).attr('fill', '#f59e0b').attr('font-size', '10px')
    }

    // Price of peeking annotation at several points
    const annotationNs = [100, 1000, 10000].filter(n => n <= maxN)
    annotationNs.forEach(n => {
      const idx = nValues.findIndex(v => v >= n)
      if (idx >= 0) {
        const m = seqMults[idx]
        const ratio = ((m - fixedMult) / fixedMult * 100).toFixed(0)
        g.append('text')
          .attr('x', x(n))
          .attr('y', y(m) - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', '#6b7280')
          .text(`+${ratio}%`)
      }
    })

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5, ',d'))
      .selectAll('text').attr('font-size', '10px')
    g.append('g').call(d3.axisLeft(y).ticks(8))
      .selectAll('text').attr('font-size', '10px')

    g.append('text').attr('x', width / 2).attr('y', height + 42)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Sample size (n) — log scale')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('CI multiplier')

    // Legend
    const leg = g.append('g').attr('transform', `translate(${width - 230}, 10)`)
    const items = [
      { label: 'Sequential multiplier m(n)', color: '#1d4ed8', dash: '' },
      { label: 'Classical z = 1.96', color: '#3b82f6', dash: '6,4' },
      { label: 'ν tuning point', color: '#f59e0b', dash: '4,3' },
    ]
    items.forEach((item, i) => {
      const row = leg.append('g').attr('transform', `translate(0, ${i * 18})`)
      row.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 0).attr('y2', 0)
        .attr('stroke', item.color).attr('stroke-width', 2.5)
        .attr('stroke-dasharray', item.dash || 'none')
      row.append('text').attr('x', 24).attr('y', 4)
        .text(item.label).attr('font-size', '10px').attr('fill', '#374151')
    })
  }, [alpha, nuFactor, maxN])

  // Compute example values
  const sigma2 = 1
  const nu = nuFactor * maxN * sigma2
  const exampleNs = [100, 1000, maxN]
  const exampleMults = exampleNs.map(n => {
    const v = n * sigma2
    const logTerm = Math.log((v + nu) / (nu * alpha))
    return Math.sqrt(((v + nu) / v) * logTerm)
  })

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Sequential Multiplier m(n)</h4>
            <p className="text-sm text-neutral-600">
              The blue curve shows how the sequential CI multiplier approaches — but 
              never reaches — the classical 1.96. The shaded area is the &ldquo;price of peeking.&rdquo;
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              ν tuning: {nuFactor.toFixed(1)}× planned N → tightest at n = {Math.round(nuFactor * maxN).toLocaleString()}
            </label>
            <input type="range" min={0.1} max={3.0} step={0.1} value={nuFactor}
              onChange={e => setNuFactor(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Max sample size: {maxN.toLocaleString()}
            </label>
            <input type="range" min={1000} max={100000} step={1000} value={maxN}
              onChange={e => setMaxN(+e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 650 360" className="w-full" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {exampleNs.map((n, i) => (
            <div key={n} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-700">{exampleMults[i].toFixed(2)}</div>
              <div className="text-xs text-blue-600">
                m({n.toLocaleString()}) — {((exampleMults[i] / 1.96 - 1) * 100).toFixed(0)}% wider than classical
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
