'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function MixtureSPRTSim() {
  const [trueEffect, setTrueEffect] = useState(0.2)
  const [tau, setTau] = useState(0.3)
  const [nObs, setNObs] = useState(200)
  const [alpha] = useState(0.05)
  const [data, setData] = useState<{
    sprtPath: number[]
    msprtPath: number[]
    sprtDecision: string
    msprtDecision: string
  } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const wrongDelta = 0.5 // SPRT assumes a large effect

  const simulate = useCallback(() => {
    const sigma = 1
    const threshold = 1 / alpha
    let sumX = 0
    const sprtPath = [1]
    const msprtPath = [1]
    let sprtDecision = 'Undecided'
    let msprtDecision = 'Undecided'

    for (let i = 1; i <= nObs; i++) {
      const obs = trueEffect + sigma * randn() // N(trueEffect, 1)
      sumX += obs
      const xbar = sumX / i

      // SPRT with wrong delta
      // For Normal: log(Λ) = n*δ*x̄/σ² - n*δ²/(2σ²) per observation
      const logLR_sprt = (i * wrongDelta * xbar / (sigma * sigma)) - (i * wrongDelta * wrongDelta / (2 * sigma * sigma))
      sprtPath.push(Math.exp(logLR_sprt))

      if (sprtPath[i] >= threshold && sprtDecision === 'Undecided') {
        sprtDecision = `Reject at n=${i}`
      }

      // mSPRT (Normal mixture)
      // Λₙᴴ = 1/√(1 + nτ²) * exp(nτ²x̄² / (2(σ²/n)(1+nτ²)))
      const nTau2 = i * tau * tau
      const shrinkage = 1 / Math.sqrt(1 + nTau2)
      const exponentTerm = (nTau2 * xbar * xbar) / (2 * (sigma * sigma / i) * (1 + nTau2))
      msprtPath.push(shrinkage * Math.exp(exponentTerm))

      if (msprtPath[i] >= threshold && msprtDecision === 'Undecided') {
        msprtDecision = `Reject at n=${i}`
      }
    }

    setData({ sprtPath, msprtPath, sprtDecision, msprtDecision })
  }, [trueEffect, tau, nObs, alpha, wrongDelta])

  useEffect(() => { simulate() }, [])

  useEffect(() => {
    if (!data || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 40, bottom: 50, left: 60 }
    const width = 650 - margin.left - margin.right
    const height = 340 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, nObs]).range([0, width])
    const threshold = 1 / alpha

    const allVals = [...data.sprtPath, ...data.msprtPath].filter(v => v > 0)
    const yMax = Math.min(d3.quantile(allVals.sort((a, b) => a - b), 0.99)! * 2, threshold * 3)
    const y = d3.scaleLog().domain([0.1, Math.max(yMax, threshold * 1.5)]).range([height, 0]).clamp(true)

    g.append('g').call(d3.axisLeft(y).ticks(6, '.1f').tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Threshold
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(threshold)).attr('y2', y(threshold))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text').attr('x', width + 4).attr('y', y(threshold) + 4)
      .text(`1/α = ${threshold}`).attr('fill', '#dc2626').attr('font-size', '10px')

    // Λ = 1 line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(1)).attr('y2', y(1))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '3,3').attr('stroke-width', 1)

    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(Math.max(d, 0.1)))

    // SPRT path (wrong δ)
    const p1 = g.append('path').datum(data.sprtPath)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', '#f59e0b').attr('stroke-width', 2.5)
    const l1 = (p1.node() as SVGPathElement)?.getTotalLength() || 0
    p1.attr('stroke-dasharray', `${l1} ${l1}`).attr('stroke-dashoffset', l1)
      .transition().duration(1500).attr('stroke-dashoffset', 0)

    // mSPRT path
    const p2 = g.append('path').datum(data.msprtPath)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', '#1d4ed8').attr('stroke-width', 2.5)
    const l2 = (p2.node() as SVGPathElement)?.getTotalLength() || 0
    p2.attr('stroke-dasharray', `${l2} ${l2}`).attr('stroke-dashoffset', l2)
      .transition().duration(1500).delay(300).attr('stroke-dashoffset', 0)

    // Legend
    const legend = g.append('g').attr('transform', `translate(10, 10)`)
    const items = [
      { label: `SPRT (δ = ${wrongDelta}, wrong)`, color: '#f59e0b' },
      { label: `mSPRT (τ = ${tau.toFixed(2)}, mixture)`, color: '#1d4ed8' },
    ]
    items.forEach((item, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 20})`)
      row.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 0).attr('y2', 0)
        .attr('stroke', item.color).attr('stroke-width', 3)
      row.append('text').attr('x', 26).attr('y', 4)
        .text(item.label).attr('font-size', '11px').attr('fill', '#374151')
    })

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(6, '.1f'))
      .selectAll('text').attr('font-size', '10px')

    g.append('text').attr('x', width / 2).attr('y', height + 42)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Observation (n)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Λₙ (log scale)')
  }, [data, nObs, alpha, tau, wrongDelta])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">SPRT vs mSPRT Comparison</h4>
            <p className="text-sm text-neutral-600">
              SPRT assumes δ = {wrongDelta} (wrong guess). mSPRT uses a mixture over effect sizes.
              The true effect is {trueEffect.toFixed(2)}.
            </p>
          </div>
          <button onClick={simulate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect: {trueEffect.toFixed(2)}
            </label>
            <input type="range" min={0.05} max={0.5} step={0.05} value={trueEffect}
              onChange={e => setTrueEffect(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Mixture τ: {tau.toFixed(2)}
            </label>
            <input type="range" min={0.1} max={1.0} step={0.05} value={tau}
              onChange={e => setTau(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observations: {nObs}
            </label>
            <input type="range" min={50} max={500} step={50} value={nObs}
              onChange={e => setNObs(+e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 650 340" className="w-full" />

        {data && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-700">SPRT (wrong δ)</div>
              <div className="text-xs text-blue-600">{data.sprtDecision}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-700">mSPRT (mixture)</div>
              <div className="text-xs text-blue-600">{data.msprtDecision}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Key insight:</strong> When the true effect size differs from the SPRT&apos;s assumed δ,
          the SPRT can be slow or erratic. The mSPRT hedges across many effect sizes via the
          mixture, making it robust. Both are anytime-valid — the difference is power and speed.
        </p>
      </div>
    </div>
  )
}
