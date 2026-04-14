'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function VarianceReductionSim() {
  const [rho, setRho] = useState(0.7)
  const [nUsers, setNUsers] = useState(500)
  const [trueEffect, setTrueEffect] = useState(3)
  const [data, setData] = useState<{
    rawDiffs: number[]
    adjDiffs: number[]
    rawVar: number
    adjVar: number
    rawSE: number
    adjSE: number
    rawSig: boolean
    adjSig: boolean
    rawMean: number
    adjMean: number
  } | null>(null)
  const rawRef = useRef<SVGSVGElement | null>(null)
  const adjRef = useRef<SVGSVGElement | null>(null)

  const sigma = 50

  const generate = useCallback(() => {
    // Generate correlated (X, Y) pairs for treatment group
    // X = pre-experiment, Y = during-experiment
    // Y = trueEffect + rho*X + sqrt(1-rho^2)*noise
    const rawDiffs: number[] = []
    const adjDiffs: number[] = []

    let sumRaw = 0, sumAdj = 0
    let sumRaw2 = 0, sumAdj2 = 0

    for (let i = 0; i < nUsers; i++) {
      // Control user
      const xC = sigma * randn()
      const yC = rho * xC + Math.sqrt(1 - rho * rho) * sigma * randn()

      // Treatment user
      const xT = sigma * randn()
      const yT = trueEffect + rho * xT + Math.sqrt(1 - rho * rho) * sigma * randn()

      // Raw difference: just Y_T - Y_C for matched pairs (simplified)
      const rawDiff = yT - yC
      rawDiffs.push(rawDiff)
      sumRaw += rawDiff
      sumRaw2 += rawDiff * rawDiff

      // Adjusted: Y* = Y - rho*X, so difference = (Y_T - rho*X_T) - (Y_C - rho*X_C)
      const adjDiff = (yT - rho * xT) - (yC - rho * xC)
      adjDiffs.push(adjDiff)
      sumAdj += adjDiff
      sumAdj2 += adjDiff * adjDiff
    }

    const rawMean = sumRaw / nUsers
    const adjMean = sumAdj / nUsers
    const rawVar = sumRaw2 / nUsers - rawMean * rawMean
    const adjVar = sumAdj2 / nUsers - adjMean * adjMean
    const rawSE = Math.sqrt(rawVar / nUsers)
    const adjSE = Math.sqrt(adjVar / nUsers)

    setData({
      rawDiffs, adjDiffs,
      rawVar, adjVar,
      rawSE, adjSE,
      rawSig: Math.abs(rawMean) > 1.96 * rawSE,
      adjSig: Math.abs(adjMean) > 1.96 * adjSE,
      rawMean, adjMean,
    })
  }, [rho, nUsers, trueEffect, sigma])

  useEffect(() => { generate() }, [])

  const drawHist = useCallback((
    svgEl: SVGSVGElement | null,
    values: number[],
    mean: number,
    se: number,
    sig: boolean,
    title: string,
    color: string
  ) => {
    if (!svgEl) return
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 15, bottom: 40, left: 45 }
    const width = 380 - margin.left - margin.right
    const height = 240 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const ext = d3.extent(values) as [number, number]
    const pad = (ext[1] - ext[0]) * 0.1
    const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, width])
    const bins = d3.bin().domain(x.domain() as [number, number]).thresholds(25)(values)
    const y = d3.scaleLinear().domain([0, d3.max(bins, b => b.length)! * 1.15]).range([height, 0])

    g.selectAll('.bar').data(bins).enter().append('rect')
      .attr('x', d => x(d.x0!))
      .attr('width', d => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length))
      .attr('fill', color).attr('opacity', 0.6).attr('rx', 1)

    // Mean line
    g.append('line').attr('x1', x(mean)).attr('x2', x(mean))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', '#111827').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')

    // CI band
    const ciLo = mean - 1.96 * se
    const ciHi = mean + 1.96 * se
    g.append('rect')
      .attr('x', x(ciLo)).attr('width', x(ciHi) - x(ciLo))
      .attr('y', 0).attr('height', height)
      .attr('fill', sig ? '#22c55e' : '#9ca3af').attr('opacity', 0.12)
    g.append('line').attr('x1', x(ciLo)).attr('x2', x(ciLo))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', sig ? '#16a34a' : '#6b7280').attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3')
    g.append('line').attr('x1', x(ciHi)).attr('x2', x(ciHi))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', sig ? '#16a34a' : '#6b7280').attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3')

    // Zero line
    if (x.domain()[0] < 0 && x.domain()[1] > 0) {
      g.append('line').attr('x1', x(0)).attr('x2', x(0))
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', '#dc2626').attr('stroke-width', 1).attr('stroke-dasharray', '2,2')
    }

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '10px')
    g.append('g').call(d3.axisLeft(y).ticks(4))
      .selectAll('text').attr('font-size', '10px')

    g.append('text').attr('x', width / 2).attr('y', -12)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text(title)

    g.append('text').attr('x', width / 2).attr('y', height + 33)
      .attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', '#6b7280')
      .text('Treatment − Control')
  }, [])

  useEffect(() => {
    if (!data) return
    drawHist(rawRef.current, data.rawDiffs, data.rawMean, data.rawSE, data.rawSig, 'Raw (no adjustment)', '#3b82f6')
    drawHist(adjRef.current, data.adjDiffs, data.adjMean, data.adjSE, data.adjSig, `CUPED-adjusted (ρ = ${rho})`, '#8b5cf6')
  }, [data, drawHist, rho])

  const reductionPct = data ? ((1 - data.adjVar / data.rawVar) * 100).toFixed(1) : '—'
  const theoreticalPct = ((1 - (1 - rho * rho)) * 100).toFixed(1)
  const speedup = data ? (data.rawVar / data.adjVar).toFixed(1) : '—'

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Variance Reduction: Raw vs CUPED</h4>
            <p className="text-sm text-neutral-600">
              Left: raw differences. Right: CUPED-adjusted. Same data, tighter distribution.
              Dashed lines = 95% CI for the mean.
            </p>
          </div>
          <button onClick={generate}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">
            Re-draw
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Correlation ρ: {rho.toFixed(2)}
            </label>
            <input type="range" min={0} max={0.95} step={0.05} value={rho}
              onChange={e => setRho(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect: {trueEffect}
            </label>
            <input type="range" min={0} max={10} step={0.5} value={trueEffect}
              onChange={e => setTrueEffect(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Users per group: {nUsers}
            </label>
            <input type="range" min={50} max={2000} step={50} value={nUsers}
              onChange={e => setNUsers(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <svg ref={rawRef} viewBox="0 0 380 240" className="w-full" />
          <svg ref={adjRef} viewBox="0 0 380 240" className="w-full" />
        </div>

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-700">±{(1.96 * data.rawSE).toFixed(2)}</div>
              <div className="text-xs text-blue-600">Raw CI width</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-purple-700">±{(1.96 * data.adjSE).toFixed(2)}</div>
              <div className="text-xs text-purple-600">Adjusted CI width</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-green-700">{reductionPct}%</div>
              <div className="text-xs text-green-600">Variance reduced (theory: {theoreticalPct}%)</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-amber-700">{speedup}×</div>
              <div className="text-xs text-amber-600">Effective sample multiplier</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
