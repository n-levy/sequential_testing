'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function NoiseDemoSim() {
  const [trueEffect, setTrueEffect] = useState(2)
  const [noiseLevel, setNoiseLevel] = useState(50)
  const [nUsers, setNUsers] = useState(200)
  const [data, setData] = useState<{
    control: number[]
    treatment: number[]
    meanC: number
    meanT: number
    diff: number
    se: number
    significant: boolean
  } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const generate = useCallback(() => {
    const control: number[] = []
    const treatment: number[] = []
    for (let i = 0; i < nUsers; i++) {
      control.push(100 + noiseLevel * randn())
      treatment.push(100 + trueEffect + noiseLevel * randn())
    }
    const meanC = control.reduce((a, b) => a + b, 0) / nUsers
    const meanT = treatment.reduce((a, b) => a + b, 0) / nUsers
    const diff = meanT - meanC
    const pooledVar = (
      control.reduce((s, x) => s + (x - meanC) ** 2, 0) +
      treatment.reduce((s, x) => s + (x - meanT) ** 2, 0)
    ) / (2 * nUsers - 2)
    const se = Math.sqrt(2 * pooledVar / nUsers)
    const significant = Math.abs(diff) > 1.96 * se
    setData({ control, treatment, meanC, meanT, diff, se, significant })
  }, [trueEffect, noiseLevel, nUsers])

  useEffect(() => { generate() }, [])

  useEffect(() => {
    if (!data || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 45, left: 55 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Histogram both groups overlaid
    const allVals = [...data.control, ...data.treatment]
    const ext = d3.extent(allVals) as [number, number]
    const pad = (ext[1] - ext[0]) * 0.05
    const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, width])

    const binsC = d3.bin().domain(x.domain() as [number, number]).thresholds(30)(data.control)
    const binsT = d3.bin().domain(x.domain() as [number, number]).thresholds(30)(data.treatment)
    const yMax = Math.max(d3.max(binsC, b => b.length)!, d3.max(binsT, b => b.length)!) * 1.15
    const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])

    // Control bars
    g.selectAll('.barC').data(binsC).enter().append('rect')
      .attr('x', d => x(d.x0!))
      .attr('width', d => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length))
      .attr('fill', '#3b82f6').attr('opacity', 0.45)

    // Treatment bars
    g.selectAll('.barT').data(binsT).enter().append('rect')
      .attr('x', d => x(d.x0!))
      .attr('width', d => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length))
      .attr('fill', '#22c55e').attr('opacity', 0.45)

    // Mean lines
    g.append('line').attr('x1', x(data.meanC)).attr('x2', x(data.meanC))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', '#2563eb').attr('stroke-width', 2.5).attr('stroke-dasharray', '6,3')
    g.append('line').attr('x1', x(data.meanT)).attr('x2', x(data.meanT))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', '#16a34a').attr('stroke-width', 2.5).attr('stroke-dasharray', '6,3')

    // Labels
    g.append('text').attr('x', x(data.meanC)).attr('y', -4)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#2563eb')
      .text(`Control: ${data.meanC.toFixed(1)}`)
    g.append('text').attr('x', x(data.meanT)).attr('y', -4)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#16a34a')
      .text(`Treatment: ${data.meanT.toFixed(1)}`)

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '10px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '10px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('User outcome (e.g. revenue)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Count')

    // Legend
    const leg = g.append('g').attr('transform', `translate(${width - 135}, 5)`)
    ;[{ label: 'Control', color: '#3b82f6' }, { label: 'Treatment', color: '#22c55e' }].forEach((item, i) => {
      const row = leg.append('g').attr('transform', `translate(0, ${i * 18})`)
      row.append('rect').attr('width', 14).attr('height', 14).attr('fill', item.color).attr('opacity', 0.6).attr('rx', 2)
      row.append('text').attr('x', 20).attr('y', 11).text(item.label).attr('font-size', '11px').attr('fill', '#374151')
    })
  }, [data])

  const snr = data ? (Math.abs(trueEffect) / noiseLevel).toFixed(3) : '—'

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Signal vs Noise</h4>
            <p className="text-sm text-neutral-600">
              Blue = control, green = treatment. Try increasing noise — the distributions overlap 
              and the signal disappears.
            </p>
          </div>
          <button onClick={generate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
            Re-draw
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect: {trueEffect}
            </label>
            <input type="range" min={0} max={20} step={1} value={trueEffect}
              onChange={e => setTrueEffect(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Noise (σ): {noiseLevel}
            </label>
            <input type="range" min={5} max={200} step={5} value={noiseLevel}
              onChange={e => setNoiseLevel(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Users per group: {nUsers}
            </label>
            <input type="range" min={20} max={2000} step={20} value={nUsers}
              onChange={e => setNUsers(+e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 600 300" className="w-full" />

        {data && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-neutral-700">{snr}</div>
              <div className="text-xs text-neutral-500">Signal / Noise</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-neutral-700">{data.diff.toFixed(2)}</div>
              <div className="text-xs text-neutral-500">Observed diff</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-neutral-700">±{(1.96 * data.se).toFixed(2)}</div>
              <div className="text-xs text-neutral-500">95% CI half-width</div>
            </div>
            <div className={`border rounded-lg p-3 text-center ${data.significant ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`text-sm font-bold ${data.significant ? 'text-green-700' : 'text-amber-700'}`}>
                {data.significant ? 'Significant' : 'Not significant'}
              </div>
              <div className="text-xs text-neutral-500">p &lt; 0.05?</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>The core problem:</strong> In real A/B tests, the true effect is tiny (e.g. +2%)
          while user-level noise is enormous (σ ≈ 200%). This is why experiments need thousands of
          users and why variance reduction (Act 11) is so valuable — it narrows the distributions,
          making the signal visible sooner.
        </p>
      </div>
    </div>
  )
}
