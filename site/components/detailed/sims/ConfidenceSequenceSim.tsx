'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function ConfidenceSequenceSim() {
  const [trueEffect, setTrueEffect] = useState(0.3)
  const [nObs, setNObs] = useState(300)
  const [alpha] = useState(0.05)
  const [nu, setNu] = useState(100) // tuning parameter
  const [data, setData] = useState<{
    means: number[]
    ciUpper: number[]
    ciLower: number[]
    csUpper: number[]
    csLower: number[]
  } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const simulate = useCallback(() => {
    const sigma = 1
    const z = 1.96 // for 95% CI
    let sumX = 0
    let sumX2 = 0
    const means: number[] = []
    const ciUpper: number[] = []
    const ciLower: number[] = []
    const csUpper: number[] = []
    const csLower: number[] = []

    for (let i = 1; i <= nObs; i++) {
      const obs = trueEffect + sigma * randn()
      sumX += obs
      sumX2 += obs * obs
      const mean = sumX / i

      // Fixed-sample CI
      const se = sigma / Math.sqrt(i)
      const ciHalf = z * se

      // Confidence Sequence (Normal mixture boundary from Howard et al.)
      // u(v) = sqrt((v + ν) * log((v + ν) / (ν * α²)))
      // Half-width = u(v) / n where v = n * σ²
      const v = i * sigma * sigma
      const uVal = Math.sqrt((v + nu) * Math.log((v + nu) / (nu * alpha * alpha)))
      const csHalf = uVal / i

      means.push(mean)
      ciUpper.push(mean + ciHalf)
      ciLower.push(mean - ciHalf)
      csUpper.push(mean + csHalf)
      csLower.push(mean - csHalf)
    }

    setData({ means, ciUpper, ciLower, csUpper, csLower })
  }, [trueEffect, nObs, alpha, nu])

  useEffect(() => { simulate() }, [])

  useEffect(() => {
    if (!data || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 30, bottom: 50, left: 60 }
    const width = 650 - margin.left - margin.right
    const height = 380 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([1, nObs]).range([0, width])
    const allVals = [...data.csUpper, ...data.csLower, ...data.ciUpper, ...data.ciLower]
    const yExtent = d3.extent(allVals) as [number, number]
    const pad = (yExtent[1] - yExtent[0]) * 0.15
    const y = d3.scaleLinear().domain([yExtent[0] - pad, yExtent[1] + pad]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(8).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // True effect line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(trueEffect)).attr('y2', y(trueEffect))
      .attr('stroke', '#16a34a').attr('stroke-dasharray', '6,4').attr('stroke-width', 1.5)
    g.append('text').attr('x', width + 4).attr('y', y(trueEffect) + 4)
      .text(`μ = ${trueEffect}`).attr('fill', '#16a34a').attr('font-size', '10px')

    // Zero line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '3,3').attr('stroke-width', 1)

    const indices = Array.from({ length: nObs }, (_, i) => i)

    // CS band
    const csArea = d3.area<number>()
      .x(i => x(i + 1))
      .y0(i => y(data.csLower[i]))
      .y1(i => y(data.csUpper[i]))
    g.append('path').datum(indices)
      .attr('d', csArea).attr('fill', '#8b5cf6').attr('opacity', 0.15)

    // CI band
    const ciArea = d3.area<number>()
      .x(i => x(i + 1))
      .y0(i => y(data.ciLower[i]))
      .y1(i => y(data.ciUpper[i]))
    g.append('path').datum(indices)
      .attr('d', ciArea).attr('fill', '#3b82f6').attr('opacity', 0.15)

    // CS boundary lines
    const csUpperLine = d3.line<number>().x(i => x(i + 1)).y(i => y(data.csUpper[i]))
    const csLowerLine = d3.line<number>().x(i => x(i + 1)).y(i => y(data.csLower[i]))
    g.append('path').datum(indices).attr('d', csUpperLine)
      .attr('fill', 'none').attr('stroke', '#8b5cf6').attr('stroke-width', 2)
    g.append('path').datum(indices).attr('d', csLowerLine)
      .attr('fill', 'none').attr('stroke', '#8b5cf6').attr('stroke-width', 2)

    // CI boundary lines
    const ciUpperLine = d3.line<number>().x(i => x(i + 1)).y(i => y(data.ciUpper[i]))
    const ciLowerLine = d3.line<number>().x(i => x(i + 1)).y(i => y(data.ciLower[i]))
    g.append('path').datum(indices).attr('d', ciUpperLine)
      .attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
    g.append('path').datum(indices).attr('d', ciLowerLine)
      .attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')

    // Sample mean path
    const meanLine = d3.line<number>().x(i => x(i + 1)).y(i => y(data.means[i]))
    g.append('path').datum(indices).attr('d', meanLine)
      .attr('fill', 'none').attr('stroke', '#374151').attr('stroke-width', 1.5)

    // Legend
    const legend = g.append('g').attr('transform', `translate(${width - 220}, 10)`)
    const items = [
      { label: 'Confidence Sequence (anytime-valid)', color: '#8b5cf6', dash: '' },
      { label: 'Fixed CI (single-time valid)', color: '#3b82f6', dash: '4,3' },
      { label: 'Sample mean', color: '#374151', dash: '' },
    ]
    items.forEach((item, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 18})`)
      row.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 0).attr('y2', 0)
        .attr('stroke', item.color).attr('stroke-width', 2.5)
        .attr('stroke-dasharray', item.dash || 'none')
      row.append('text').attr('x', 24).attr('y', 4)
        .text(item.label).attr('font-size', '10px').attr('fill', '#374151')
    })

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(8))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 42)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Observation (n)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Estimated mean')
  }, [data, nObs, trueEffect])

  // Compute width comparison at final observation
  const ciWidth = data ? (data.ciUpper[nObs - 1] - data.ciLower[nObs - 1]).toFixed(3) : '—'
  const csWidth = data ? (data.csUpper[nObs - 1] - data.csLower[nObs - 1]).toFixed(3) : '—'
  const ratio = data ? ((data.csUpper[nObs - 1] - data.csLower[nObs - 1]) / (data.ciUpper[nObs - 1] - data.ciLower[nObs - 1])).toFixed(2) : '—'

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Confidence Sequence vs Fixed CI</h4>
            <p className="text-sm text-neutral-600">
              The CS (purple) is wider than the fixed CI (blue) — the &ldquo;price of peeking&rdquo; —
              but valid at all times simultaneously.
            </p>
          </div>
          <button onClick={simulate}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect μ: {trueEffect.toFixed(2)}
            </label>
            <input type="range" min={0} max={1.0} step={0.05} value={trueEffect}
              onChange={e => setTrueEffect(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tuning ν: {nu}
            </label>
            <input type="range" min={10} max={500} step={10} value={nu}
              onChange={e => setNu(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observations: {nObs}
            </label>
            <input type="range" min={50} max={1000} step={50} value={nObs}
              onChange={e => setNObs(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 650 380" className="w-full" />

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-blue-700">{ciWidth}</div>
            <div className="text-xs text-blue-600">Fixed CI width at n={nObs}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-purple-700">{csWidth}</div>
            <div className="text-xs text-purple-600">CS width at n={nObs}</div>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-neutral-700">{ratio}×</div>
            <div className="text-xs text-neutral-500">CS / CI ratio (price of peeking)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
