'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

export function SPRTSim() {
  const [delta, setDelta] = useState(0.1)
  const [alphaVal, setAlphaVal] = useState(0.05)
  const [betaVal, setBetaVal] = useState(0.20)
  const [coinBias, setCoinBias] = useState<'fair' | 'biased'>('biased')
  const [maxFlips] = useState(500)
  const [nTrials, setNTrials] = useState(200)
  const [data, setData] = useState<{
    examplePath: number[]
    decision: string
    stoppingTime: number
    stoppingTimes: number[]
    decisions: string[]
  } | null>(null)
  const pathRef = useRef<SVGSVGElement | null>(null)
  const histRef = useRef<SVGSVGElement | null>(null)

  const B = (1 - betaVal) / alphaVal
  const A = betaVal / (1 - alphaVal)

  const simulate = useCallback(() => {
    const trueP = coinBias === 'biased' ? 0.5 + delta : 0.5
    const stoppingTimes: number[] = []
    const decisions: string[] = []
    let examplePath: number[] = []
    let exampleDecision = ''
    let exampleStop = 0

    for (let trial = 0; trial < nTrials; trial++) {
      const lr = [1]
      let decided = false
      for (let i = 1; i <= maxFlips; i++) {
        const flip = Math.random() < trueP ? 1 : 0
        const ratio = flip === 1 ? (0.5 + delta) / 0.5 : (0.5 - delta) / 0.5
        lr.push(lr[i - 1] * ratio)

        if (lr[i] >= B) {
          stoppingTimes.push(i)
          decisions.push('reject')
          decided = true
          if (trial === 0) { examplePath = lr; exampleDecision = 'Reject H₀ (biased)'; exampleStop = i }
          break
        }
        if (lr[i] <= A) {
          stoppingTimes.push(i)
          decisions.push('accept')
          decided = true
          if (trial === 0) { examplePath = lr; exampleDecision = 'Accept H₀ (fair)'; exampleStop = i }
          break
        }
      }
      if (!decided) {
        stoppingTimes.push(maxFlips)
        decisions.push('undecided')
        if (trial === 0) { examplePath = lr; exampleDecision = 'Undecided'; exampleStop = maxFlips }
      }
    }

    setData({
      examplePath,
      decision: exampleDecision,
      stoppingTime: exampleStop,
      stoppingTimes,
      decisions,
    })
  }, [delta, alphaVal, betaVal, coinBias, maxFlips, nTrials, A, B])

  useEffect(() => { simulate() }, [])

  // Path chart with boundaries
  useEffect(() => {
    if (!data || !pathRef.current) return
    const svg = d3.select(pathRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 40, bottom: 45, left: 55 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const pathLen = data.examplePath.length
    const x = d3.scaleLinear().domain([0, pathLen - 1]).range([0, width])

    // Log scale for y-axis
    const yMin = Math.min(A * 0.5, d3.min(data.examplePath.filter(v => v > 0))! * 0.5)
    const yMax = Math.max(B * 2, d3.max(data.examplePath)! * 1.2)
    const y = d3.scaleLog().domain([Math.max(yMin, 0.01), yMax]).range([height, 0]).clamp(true)

    g.append('g').call(d3.axisLeft(y).ticks(6, '.2f').tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Upper boundary
    g.append('rect')
      .attr('x', 0).attr('width', width)
      .attr('y', 0).attr('height', y(B))
      .attr('fill', '#fef2f2').attr('opacity', 0.5)
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(B)).attr('y2', y(B))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text').attr('x', width + 4).attr('y', y(B) + 4)
      .text(`B = ${B.toFixed(1)}`).attr('fill', '#dc2626').attr('font-size', '10px')

    // Lower boundary
    g.append('rect')
      .attr('x', 0).attr('width', width)
      .attr('y', y(A)).attr('height', height - y(A))
      .attr('fill', '#f0fdf4').attr('opacity', 0.5)
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(A)).attr('y2', y(A))
      .attr('stroke', '#16a34a').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text').attr('x', width + 4).attr('y', y(A) + 4)
      .text(`A = ${A.toFixed(3)}`).attr('fill', '#16a34a').attr('font-size', '10px')

    // Λ = 1 line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(1)).attr('y2', y(1))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '3,3').attr('stroke-width', 1)

    // LR path
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(Math.max(d, 0.01)))
    const path = g.append('path').datum(data.examplePath)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', '#8b5cf6').attr('stroke-width', 2.5)

    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0
    path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition().duration(2000).attr('stroke-dashoffset', 0)

    // Decision marker
    const lastIdx = data.examplePath.length - 1
    const lastVal = data.examplePath[lastIdx]
    g.append('circle')
      .attr('cx', x(lastIdx)).attr('cy', y(Math.max(lastVal, 0.01)))
      .attr('r', 6)
      .attr('fill', data.decision.includes('Reject') ? '#dc2626' : data.decision.includes('Accept') ? '#16a34a' : '#6b7280')
      .attr('opacity', 0).transition().delay(2000).duration(500).attr('opacity', 1)

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(6, '.2f'))
      .selectAll('text').attr('font-size', '10px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Flip (n)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Λₙ (log scale)')
  }, [data, A, B])

  // Stopping time histogram
  useEffect(() => {
    if (!data || !histRef.current) return
    const svg = d3.select(histRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 20, bottom: 45, left: 55 }
    const width = 400 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const stops = data.stoppingTimes
    const x = d3.scaleLinear().domain([0, d3.max(stops)! * 1.1]).range([0, width])
    const bins = d3.bin().domain(x.domain() as [number, number]).thresholds(25)(stops)
    const y = d3.scaleLinear().domain([0, d3.max(bins, b => b.length)! * 1.1]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    g.selectAll('.bar').data(bins).enter().append('rect')
      .attr('x', d => x(d.x0!))
      .attr('width', d => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length))
      .attr('fill', '#8b5cf6').attr('opacity', 0.7).attr('rx', 2)

    // Mean line
    const meanStop = stops.reduce((a, b) => a + b, 0) / stops.length
    g.append('line').attr('x1', x(meanStop)).attr('x2', x(meanStop))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', '#dc2626').attr('stroke-width', 2).attr('stroke-dasharray', '4,3')
    g.append('text').attr('x', x(meanStop) + 4).attr('y', 12)
      .text(`Mean: ${meanStop.toFixed(0)}`).attr('fill', '#dc2626').attr('font-size', '10px')

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Stopping time (flips)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Count')

    g.append('text').attr('x', width / 2).attr('y', -8)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text(`Stopping times (${nTrials} trials)`)
  }, [data, nTrials])

  const rejectCount = data ? data.decisions.filter(d => d === 'reject').length : 0
  const acceptCount = data ? data.decisions.filter(d => d === 'accept').length : 0

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">SPRT Decision Boundaries</h4>
            <p className="text-sm text-neutral-600">
              Watch Λₙ traverse between accept (green) and reject (red) boundaries.
            </p>
          </div>
          <button onClick={simulate}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">δ: {delta.toFixed(2)}</label>
            <input type="range" min={0.02} max={0.3} step={0.02} value={delta}
              onChange={e => setDelta(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">α: {alphaVal.toFixed(2)}</label>
            <input type="range" min={0.01} max={0.10} step={0.01} value={alphaVal}
              onChange={e => setAlphaVal(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">β: {betaVal.toFixed(2)}</label>
            <input type="range" min={0.05} max={0.30} step={0.05} value={betaVal}
              onChange={e => setBetaVal(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">True coin:</label>
            <select value={coinBias} onChange={e => setCoinBias(e.target.value as 'fair' | 'biased')}
              className="w-full text-sm border border-neutral-300 rounded p-1">
              <option value="fair">Fair (p = 0.5)</option>
              <option value="biased">Biased (p = {(0.5 + delta).toFixed(2)})</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <svg ref={pathRef} viewBox="0 0 600 300" className="w-full" />
          </div>
          <div className="md:col-span-2">
            <svg ref={histRef} viewBox="0 0 400 250" className="w-full" />
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-700">{rejectCount}</div>
              <div className="text-xs text-amber-600">Reject H₀ ({((rejectCount / nTrials) * 100).toFixed(1)}%)</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-700">{acceptCount}</div>
              <div className="text-xs text-green-600">Accept H₀ ({((acceptCount / nTrials) * 100).toFixed(1)}%)</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-700">{data.stoppingTime}</div>
              <div className="text-xs text-purple-600">Example stop: {data.decision}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
