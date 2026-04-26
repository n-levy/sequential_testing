'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import katex from 'katex'
import { InlineMath } from '../../ui/Math'

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

    const margin = { top: 20, right: 50, bottom: 45, left: 55 }
    const width = 600 - margin.left - margin.right
    const height = 340 - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, nSteps]).range([0, width])
    const allVals = paths.flat()
    const yExtent = d3.extent(allVals) as [number, number]
    const pad = Math.max(Math.abs(yExtent[0]), Math.abs(yExtent[1]), 2 * Math.sqrt(nSteps) + 5) * 1.1
    const y = d3.scaleLinear().domain([-pad, pad]).range([height, 0])

    // Grid
    g.append('g').call(d3.axisLeft(y).ticks(8).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Downsample for performance with large step counts
    const thin = Math.max(1, Math.floor(nSteps / 2000))

    // ±√n and ±2√n envelopes
    const envData: number[] = []
    for (let i = 0; i <= nSteps; i += thin) envData.push(i)
    if (envData[envData.length - 1] !== nSteps) envData.push(nSteps)
    const envLine = d3.line<number>().x(d => x(d)).curve(d3.curveMonotoneX)

    // ±√n (68% of walks)
    g.append('path')
      .datum(envData)
      .attr('d', envLine.y(d => y(Math.sqrt(d))))
      .attr('fill', 'none').attr('stroke', '#9ca3af').attr('stroke-dasharray', '6,3').attr('stroke-width', 1.5)
    g.append('path')
      .datum(envData)
      .attr('d', envLine.y(d => y(-Math.sqrt(d))))
      .attr('fill', 'none').attr('stroke', '#9ca3af').attr('stroke-dasharray', '6,3').attr('stroke-width', 1.5)

    // ±2√n (95% of walks)
    g.append('path')
      .datum(envData)
      .attr('d', envLine.y(d => y(2 * Math.sqrt(d))))
      .attr('fill', 'none').attr('stroke', '#d1d5db').attr('stroke-dasharray', '3,3').attr('stroke-width', 1)
    g.append('path')
      .datum(envData)
      .attr('d', envLine.y(d => y(-2 * Math.sqrt(d))))
      .attr('fill', 'none').attr('stroke', '#d1d5db').attr('stroke-dasharray', '3,3').attr('stroke-width', 1)

    // Envelope labels (KaTeX rendered via foreignObject)
    const addMathLabel = (xPos: number, yPos: number, latex: string, color: string) => {
      const html = katex.renderToString(latex, { throwOnError: false, displayMode: false })
      const fo = g.append('foreignObject')
        .attr('x', xPos)
        .attr('y', yPos - 10)
        .attr('width', 60)
        .attr('height', 22)
        .attr('style', 'overflow: visible')
      fo.append('xhtml:div')
        .style('font-size', '11px')
        .style('color', color)
        .style('line-height', '1')
        .style('white-space', 'nowrap')
        .html(html)
    }

    addMathLabel(x(nSteps) + 3, y(Math.sqrt(nSteps)) - 2, '+\\!\\sqrt{n}', '#6b7280')
    addMathLabel(x(nSteps) + 3, y(-Math.sqrt(nSteps)) + 8, '-\\!\\sqrt{n}', '#6b7280')
    addMathLabel(x(nSteps) + 3, y(2 * Math.sqrt(nSteps)) - 2, '+2\\!\\sqrt{n}', '#9ca3af')
    addMathLabel(x(nSteps) + 3, y(-2 * Math.sqrt(nSteps)) + 8, '-2\\!\\sqrt{n}', '#9ca3af')

    // Zero line
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#6b7280').attr('stroke-width', 1)

    // Paths (downsampled for rendering)
    const line = d3.line<[number, number]>()
      .x(d => x(d[0]))
      .y(d => y(d[1]))

    paths.forEach((path, pIdx) => {
      const data: [number, number][] = []
      for (let i = 0; i < path.length; i++) {
        if (i % thin === 0 || i === path.length - 1) data.push([i, path[i]])
      }
      const p = g.append('path')
        .datum(data)
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
    g.append('g').attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d => d3.format(',')(d as number)))
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
      .text('Position (S\u2099)')
  }, [paths, nSteps])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Random Walk Simulation</h4>
            <p className="text-sm text-neutral-600">
              Watch coin-flip random walks fan out over time. Dashed lines show the ±√n and ±2√n envelopes.
            </p>
          </div>
          <button
            onClick={generate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Steps: {nSteps}
            </label>
            <input
              type="range" min={50} max={10000} step={50} value={nSteps}
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
            <strong>Simulation takeaway:</strong> Each path is a cumulative sum of ±1 coin flips.
            {prob === 0.5
              ? <> With a fair coin (p = 0.5), the expected sum of flips is zero. About 68% of the time the walk stays within <InlineMath>{`\\pm\\sqrt{n}`}</InlineMath> of zero, and about 95% within <InlineMath>{`\\pm 2\\sqrt{n}`}</InlineMath>.</>
              : ` With p = ${prob.toFixed(2)}, paths drift ${prob > 0.5 ? 'upward' : 'downward'} — the expected position after n steps is ${((2 * prob - 1)).toFixed(2)}n.`}
          </p>
        </div>
      )}
    </div>
  )
}
