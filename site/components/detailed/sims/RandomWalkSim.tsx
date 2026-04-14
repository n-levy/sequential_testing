'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function RandomWalkSim() {
  const [nSteps, setNSteps] = useState(200)
  const [prob, setProb] = useState(0.5)
  const [nPaths, setNPaths] = useState(5)
  const [paths, setPaths] = useState<number[][] | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const generate = useCallback(() => {
    const result: number[][] = []
    for (let p = 0; p < nPaths; p++) {
      const path = [0]
      for (let i = 1; i <= nSteps; i++) {
        path.push(path[i - 1] + (Math.random() < prob ? 1 : -1))
      }
      result.push(path)
    }
    setPaths(result)
  }, [nSteps, prob, nPaths])

  useEffect(() => { generate() }, [])

  useEffect(() => {
    if (!paths || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 45, left: 55 }
    const width = 600 - margin.left - margin.right
    const height = 340 - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, nSteps]).range([0, width])
    const allVals = paths.flat()
    const yExtent = d3.extent(allVals) as [number, number]
    const pad = Math.max(Math.abs(yExtent[0]), Math.abs(yExtent[1]), 5) * 1.15
    const y = d3.scaleLinear().domain([-pad, pad]).range([height, 0])

    // Grid
    g.append('g').call(d3.axisLeft(y).ticks(8).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // ±√n envelope
    const envData = Array.from({ length: nSteps + 1 }, (_, i) => i)
    const envLine = d3.line<number>().x(d => x(d)).curve(d3.curveMonotoneX)

    g.append('path')
      .datum(envData)
      .attr('d', envLine.y(d => y(Math.sqrt(d))))
      .attr('fill', 'none').attr('stroke', '#d1d5db').attr('stroke-dasharray', '4,4').attr('stroke-width', 1.5)
    g.append('path')
      .datum(envData)
      .attr('d', envLine.y(d => y(-Math.sqrt(d))))
      .attr('fill', 'none').attr('stroke', '#d1d5db').attr('stroke-dasharray', '4,4').attr('stroke-width', 1.5)

    g.append('text')
      .attr('x', x(nSteps) + 2).attr('y', y(Math.sqrt(nSteps)) - 4)
      .text('+√n').attr('fill', '#9ca3af').attr('font-size', '10px')
    g.append('text')
      .attr('x', x(nSteps) + 2).attr('y', y(-Math.sqrt(nSteps)) + 12)
      .text('-√n').attr('fill', '#9ca3af').attr('font-size', '10px')

    // Zero line
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#6b7280').attr('stroke-width', 1)

    // Paths
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d))

    paths.forEach((path, pIdx) => {
      const p = g.append('path')
        .datum(path)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', COLORS[pIdx % COLORS.length])
        .attr('stroke-width', 2)
        .attr('opacity', 0.75)

      const totalLength = (p.node() as SVGPathElement)?.getTotalLength() || 0
      p.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition().duration(1500).delay(pIdx * 200)
        .attr('stroke-dashoffset', 0)
    })

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(8))
      .selectAll('text').attr('font-size', '11px')

    g.append('text')
      .attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Step number (n)')
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Position (Sₙ)')
  }, [paths, nSteps])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Random Walk Simulation</h4>
            <p className="text-sm text-neutral-600">
              Watch coin-flip random walks fan out over time. The dashed lines show the ±√n envelope.
            </p>
          </div>
          <button
            onClick={generate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            New Walks
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Steps: {nSteps}
            </label>
            <input
              type="range" min={50} max={1000} step={50} value={nSteps}
              onChange={e => setNSteps(+e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              P(heads): {prob.toFixed(2)}
            </label>
            <input
              type="range" min={0.3} max={0.7} step={0.01} value={prob}
              onChange={e => setProb(+e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Paths: {nPaths}
            </label>
            <input
              type="range" min={1} max={8} step={1} value={nPaths}
              onChange={e => setNPaths(+e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 600 340" className="w-full" />
      </div>

      {paths && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>What you&apos;re seeing:</strong> Each path is a cumulative sum of ±1 coin flips.
            {prob === 0.5
              ? ' With a fair coin (p = 0.5), paths wander symmetrically around zero. The ±√n envelope captures the typical spread.'
              : ` With p = ${prob.toFixed(2)}, paths drift ${prob > 0.5 ? 'upward' : 'downward'} — the expected position after n steps is ${((2 * prob - 1)).toFixed(2)}n.`}
          </p>
        </div>
      )}
    </div>
  )
}
