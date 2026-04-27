'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

export function LikelihoodRatioSim() {
  const [delta, setDelta] = useState(0.1)
  const [nFlips, setNFlips] = useState(100)
  const [data, setData] = useState<{ lr: number[]; flips: number[]; heads: number[] } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const generate = useCallback(() => {
    const trueBias = delta // coin actually IS biased with prob 0.5+delta
    const flips: number[] = []
    const lr: number[] = [1] // Λ₀ = 1
    const heads: number[] = [0]
    let k = 0
    for (let i = 1; i <= nFlips; i++) {
      const flip = Math.random() < (0.5 + trueBias) ? 1 : 0
      flips.push(flip)
      k += flip
      heads.push(k)
      // Incremental update: Λₙ = Λₙ₋₁ × (f₁(xₙ)/f₀(xₙ))
      const prevLR = lr[i - 1]
      const ratio = flip === 1
        ? (0.5 + delta) / 0.5
        : (0.5 - delta) / 0.5
      lr.push(prevLR * ratio)
    }
    setData({ lr, flips, heads })
  }, [delta, nFlips])

  useEffect(() => { generate() }, [])

  useEffect(() => {
    if (!data || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 30, bottom: 45, left: 55 }
    const width = 600 - margin.left - margin.right
    const height = 320 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, nFlips]).range([0, width])
    const yMax = Math.max(d3.max(data.lr)! * 1.1, 2)
    const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])

    // Grid
    g.append('g').call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Λ = 1 reference line
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(1)).attr('y2', y(1))
      .attr('stroke', '#6b7280').attr('stroke-dasharray', '4,3').attr('stroke-width', 1)
    g.append('text').attr('x', width + 4).attr('y', y(1) + 4)
      .text('Λ = 1').attr('fill', '#6b7280').attr('font-size', '10px')

    // LR path
    const line = d3.line<number>().x((_, i) => x(i)).y(d => y(d))
    const path = g.append('path').datum(data.lr)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', '#1d4ed8').attr('stroke-width', 2.5)

    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0
    path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition().duration(2000).attr('stroke-dashoffset', 0)

    // Flip markers along the top
    const flipY = 10
    data.flips.forEach((flip, i) => {
      g.append('circle')
        .attr('cx', x(i + 1)).attr('cy', flipY)
        .attr('r', nFlips <= 50 ? 3 : 1.5)
        .attr('fill', flip === 1 ? '#22c55e' : '#ef4444')
        .attr('opacity', 0.6)
    })

    if (nFlips <= 50) {
      g.append('text').attr('x', 0).attr('y', flipY - 8)
        .text('Flips:').attr('font-size', '9px').attr('fill', '#9ca3af')
    }

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(6))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Flip number (n)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Likelihood Ratio (Λₙ)')

    // Title
    g.append('text').attr('x', width / 2).attr('y', -8)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text(`δ = ${delta.toFixed(2)} — Biased coin (p = ${(0.5 + delta).toFixed(2)})`)
  }, [data, nFlips, delta])

  const finalLR = data ? data.lr[data.lr.length - 1] : 0
  const totalHeads = data ? data.heads[data.heads.length - 1] : 0

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Likelihood Ratio Accumulation</h4>
            <p className="text-sm text-neutral-600">
              Watch the LR grow as evidence accumulates flip by flip.
              Green dots = heads, red dots = tails.
            </p>
          </div>
          <button onClick={generate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bias δ: {delta.toFixed(2)} → coin p = {(0.5 + delta).toFixed(2)}
            </label>
            <input type="range" min={0.01} max={0.3} step={0.01} value={delta}
              onChange={e => setDelta(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Flips: {nFlips}
            </label>
            <input type="range" min={20} max={500} step={10} value={nFlips}
              onChange={e => setNFlips(+e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 600 320" className="w-full" />

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-700">{finalLR.toFixed(2)}</div>
              <div className="text-xs text-blue-600">Final Λₙ</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-700">{totalHeads}/{nFlips}</div>
              <div className="text-xs text-green-600">Heads</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-700">{finalLR > 1 ? 'Favours H₁' : 'Favours H₀'}</div>
              <div className="text-xs text-neutral-500">{finalLR > 10 ? 'Strong' : finalLR > 3 ? 'Moderate' : 'Weak'} evidence</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
