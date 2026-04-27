"use client"
import { useState } from 'react'

const CODE_RandomWalkSim = `'use client'

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

    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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

    addMathLabel(x(nSteps) + 3, y(Math.sqrt(nSteps)) - 2, '+\\\\!\\\\sqrt{n}', '#6b7280')
    addMathLabel(x(nSteps) + 3, y(-Math.sqrt(nSteps)) + 8, '-\\\\!\\\\sqrt{n}', '#6b7280')
    addMathLabel(x(nSteps) + 3, y(2 * Math.sqrt(nSteps)) - 2, '+2\\\\!\\\\sqrt{n}', '#9ca3af')
    addMathLabel(x(nSteps) + 3, y(-2 * Math.sqrt(nSteps)) + 8, '-2\\\\!\\\\sqrt{n}', '#9ca3af')

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
      p.attr('stroke-dasharray', \`\${totalLength} \${totalLength}\`)
        .attr('stroke-dashoffset', totalLength)
        .transition().duration(1500).delay(pIdx * 200)
        .attr('stroke-dashoffset', 0)
    })

    // Axes
    g.append('g').attr('transform', \`translate(0,\${height})\`)
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
      .text('Position (S\\u2099)')
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
              ? <> With a fair coin (p = 0.5), the expected sum of flips is zero. About 68% of the time the walk stays within <InlineMath>{\`\\\\pm\\\\sqrt{n}\`}</InlineMath> of zero, and about 95% within <InlineMath>{\`\\\\pm 2\\\\sqrt{n}\`}</InlineMath>.</>
              : \` With p = \${prob.toFixed(2)}, paths drift \${prob > 0.5 ? 'upward' : 'downward'} — the expected position after n steps is \${((2 * prob - 1)).toFixed(2)}n.\`}
          </p>
        </div>
      )}
    </div>
  )
}
`

const CODE_MartingaleSim = `'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

export function MartingaleSim() {
  const [nGamblers, setNGamblers] = useState(5000)
  const [maxRounds, setMaxRounds] = useState(200)
  const [results, setResults] = useState<{ finalWealth: number[]; avgProfit: number; winners: number; losers: number } | null>(null)
  const [walkPath, setWalkPath] = useState<number[] | null>(null)
  const histRef = useRef<SVGSVGElement | null>(null)
  const walkRef = useRef<SVGSVGElement | null>(null)

  const runDoublingStrategy = useCallback(() => {
    const finalWealth: number[] = []
    for (let g = 0; g < nGamblers; g++) {
      let wealth = 0
      let bet = 1
      let lossStreak = 0
      for (let r = 0; r < maxRounds; r++) {
        if (Math.random() < 0.5) {
          // Win
          wealth += bet
          bet = 1
          lossStreak = 0
        } else {
          // Lose
          wealth -= bet
          lossStreak++
          bet = Math.pow(2, lossStreak) // double the bet
          if (bet > 1024) { bet = 1; lossStreak = 0 } // cap at 1024 to avoid Infinity
        }
      }
      finalWealth.push(wealth)
    }
    const avgProfit = finalWealth.reduce((a, b) => a + b, 0) / nGamblers
    const winners = finalWealth.filter(w => w > 0).length
    const losers = finalWealth.filter(w => w < 0).length
    setResults({ finalWealth, avgProfit, winners, losers })
  }, [nGamblers, maxRounds])

  const generateWalk = useCallback(() => {
    const path = [0]
    for (let i = 1; i <= maxRounds; i++) {
      path.push(path[i - 1] + (Math.random() < 0.5 ? 1 : -1))
    }
    setWalkPath(path)
  }, [maxRounds])

  useEffect(() => {
    generateWalk()
    runDoublingStrategy()
  }, [])

  // Gambling walk chart
  useEffect(() => {
    if (!walkPath || !walkRef.current) return
    const svg = d3.select(walkRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 45, left: 55 }
    const width = 550 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const x = d3.scaleLinear().domain([0, walkPath.length - 1]).range([0, width])
    const ext = d3.extent(walkPath) as [number, number]
    const pad = Math.max(Math.abs(ext[0]), Math.abs(ext[1]), 5) * 1.2
    const y = d3.scaleLinear().domain([-pad, pad]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Zero line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#6b7280').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')

    g.append('text').attr('x', width + 4).attr('y', y(0) + 4)
      .text('Break-even').attr('fill', '#6b7280').attr('font-size', '10px')

    const line = d3.line<number>().x((_, i) => x(i)).y(d => y(d))
    const path = g.append('path').datum(walkPath)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', '#3b82f6').attr('stroke-width', 2)

    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0
    path.attr('stroke-dasharray', \`\${totalLength} \${totalLength}\`)
      .attr('stroke-dashoffset', totalLength)
      .transition().duration(1500).attr('stroke-dashoffset', 0)

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(6))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Round')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('€ Profit / Loss')
  }, [walkPath])

  // Doubling strategy histogram
  useEffect(() => {
    if (!results || !histRef.current) return
    const svg = d3.select(histRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 45, left: 55 }
    const width = 550 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const data = results.finalWealth
    const ext = d3.extent(data) as [number, number]
    // Clip extreme outliers for display
    const p5 = d3.quantile(data.sort((a, b) => a - b), 0.01) ?? ext[0]
    const p95 = d3.quantile(data, 0.99) ?? ext[1]
    const lo = Math.min(p5, -50)
    const hi = Math.max(p95, 50)

    const x = d3.scaleLinear().domain([lo, hi]).range([0, width])
    const bins = d3.bin().domain([lo, hi]).thresholds(40)(data)

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, b => b.length)! * 1.1])
      .range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Zero line
    g.append('line').attr('x1', x(0)).attr('x2', x(0))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', '#6b7280').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')

    g.selectAll('.bar').data(bins).enter().append('rect')
      .attr('x', d => x(d.x0!))
      .attr('width', d => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length))
      .attr('fill', d => (d.x0! + d.x1!) / 2 >= 0 ? '#22c55e' : '#ef4444')
      .attr('opacity', 0.7)

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Final wealth (€)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Count')
  }, [results])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <h4 className="font-bold text-neutral-900 mb-3">Gambling Game & Doubling Strategy</h4>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">Fair-coin gambling walk (€1 per flip)</p>
            <svg ref={walkRef} viewBox="0 0 550 250" className="w-full" />
            <button onClick={generateWalk}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Run simulation
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Doubling strategy: {nGamblers.toLocaleString()} gamblers, {maxRounds} rounds each
            </p>
            <svg ref={histRef} viewBox="0 0 550 250" className="w-full" />
            <button onClick={runDoublingStrategy}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              Run simulation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Gamblers: {nGamblers.toLocaleString()}
            </label>
            <input type="range" min={1000} max={10000} step={1000} value={nGamblers}
              onChange={e => setNGamblers(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Max rounds: {maxRounds}
            </label>
            <input type="range" min={50} max={500} step={50} value={maxRounds}
              onChange={e => setMaxRounds(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        {results && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-700">{results.winners.toLocaleString()}</div>
              <div className="text-xs text-green-600">Winners ({((results.winners / nGamblers) * 100).toFixed(1)}%)</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-700">{results.losers.toLocaleString()}</div>
              <div className="text-xs text-amber-600">Losers ({((results.losers / nGamblers) * 100).toFixed(1)}%)</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-700">€{results.avgProfit.toFixed(2)}</div>
              <div className="text-xs text-neutral-500">Avg profit</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <strong>What you&apos;re seeing:</strong> Left: a single gambler&apos;s profit/loss over time — a random walk
          re-labelled as money. Right: the doubling strategy histogram — many small winners, a few
          catastrophic losers. The average profit converges to €0 (martingale property). No strategy
          can beat a fair game.
        </p>
      </div>
    </div>
  )
}
`

const CODE_LikelihoodRatioSim = `'use client'

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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
      .attr('stroke', '#8b5cf6').attr('stroke-width', 2.5)

    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0
    path.attr('stroke-dasharray', \`\${totalLength} \${totalLength}\`)
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
    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(8))
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
      .text(\`δ = \${delta.toFixed(2)} — Biased coin (p = \${(0.5 + delta).toFixed(2)})\`)
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
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bias δ: {delta.toFixed(2)} → coin p = {(0.5 + delta).toFixed(2)}
            </label>
            <input type="range" min={0.01} max={0.3} step={0.01} value={delta}
              onChange={e => setDelta(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Flips: {nFlips}
            </label>
            <input type="range" min={20} max={500} step={10} value={nFlips}
              onChange={e => setNFlips(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 600 320" className="w-full" />

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-700">{finalLR.toFixed(2)}</div>
              <div className="text-xs text-purple-600">Final Λₙ</div>
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
`

const CODE_LRMartingaleSim = `'use client'

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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(6))
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
    drawPanel(h0Ref.current, data.h0, \`Under H₀ (fair coin, p = 0.5)\`, '#3b82f6')
    drawPanel(h1Ref.current, data.h1, \`Under H₁ (biased, p = \${(0.5 + delta).toFixed(2)})\`, '#ef4444')
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
            <div className="text-center text-sm text-amber-700 font-medium mt-1">
              Mean final Λ: {h1Mean} (drifts upward)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
`

const CODE_VilleInequalitySim = `'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1.0 / (1.0 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return 0.5 * (1 + sign * y)
}

function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function VilleInequalitySim() {
  const [nPaths, setNPaths] = useState(1000)
  const [nFlips, setNFlips] = useState(200)
  const [alpha] = useState(0.05)
  const [results, setResults] = useState<{
    markovCount: number
    villeCount: number
    zPeekCount: number
    examplePaths: number[][] // 10 example LR paths
  } | null>(null)
  const lrRef = useRef<SVGSVGElement | null>(null)
  const barRef = useRef<SVGSVGElement | null>(null)

  const delta = 0.1 // Alternative hypothesis bias

  const simulate = useCallback(() => {
    const threshold = 1 / alpha // Λ ≥ 1/α
    let markovCount = 0
    let villeCount = 0
    let zPeekCount = 0
    const examplePaths: number[][] = []

    for (let p = 0; p < nPaths; p++) {
      const lr = [1]
      let everCrossed = false
      let zEverSignificant = false
      let sumX = 0, sumX2 = 0

      for (let i = 1; i <= nFlips; i++) {
        // Fair coin (H0 is true)
        const flip = Math.random() < 0.5 ? 1 : 0
        const ratio = flip === 1 ? (0.5 + delta) / 0.5 : (0.5 - delta) / 0.5
        lr.push(lr[i - 1] * ratio)

        if (lr[i] >= threshold) everCrossed = true

        // Standard z-test for continuous checking
        const obs = randn() // N(0,1) under H0
        sumX += obs
        sumX2 += obs * obs
        if (i >= 2) {
          const mean = sumX / i
          const variance = (sumX2 / i) - mean * mean
          const se = Math.sqrt(Math.max(variance, 0.01) / i)
          const z = Math.abs(mean / se)
          const pVal = 2 * (1 - normalCDF(z))
          if (pVal < alpha) zEverSignificant = true
        }
      }

      // Markov: check only at the final step
      if (lr[nFlips] >= threshold) markovCount++
      if (everCrossed) villeCount++
      if (zEverSignificant) zPeekCount++

      if (p < 10) examplePaths.push(lr)
    }

    setResults({ markovCount, villeCount, zPeekCount, examplePaths })
  }, [nPaths, nFlips, alpha, delta])

  useEffect(() => { simulate() }, [])

  // Draw LR paths with threshold
  useEffect(() => {
    if (!results || !lrRef.current) return
    const svg = d3.select(lrRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 25, right: 30, bottom: 45, left: 55 }
    const width = 600 - margin.left - margin.right
    const height = 280 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const threshold = 1 / alpha
    const x = d3.scaleLinear().domain([0, nFlips]).range([0, width])
    const yMax = Math.max(threshold * 1.5, 30)
    const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Threshold line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(threshold)).attr('y2', y(threshold))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text').attr('x', width - 4).attr('y', y(threshold) - 6)
      .attr('text-anchor', 'end')
      .text(\`1/α = \${threshold}\`).attr('fill', '#dc2626').attr('font-size', '11px')

    // Λ = 1 line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(1)).attr('y2', y(1))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '3,3').attr('stroke-width', 1)

    const line = d3.line<number>().x((_, i) => x(i)).y(d => y(Math.min(d, yMax * 1.2)))
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4']

    results.examplePaths.forEach((path, pIdx) => {
      g.append('path').datum(path)
        .attr('d', line).attr('fill', 'none')
        .attr('stroke', colors[pIdx % colors.length])
        .attr('stroke-width', 1.5).attr('opacity', 0.6)
    })

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Flip (n)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Λₙ')

    g.append('text').attr('x', width / 2).attr('y', -8)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text('10 Example LR Paths under H₀ (fair coin)')
  }, [results, nFlips, alpha])

  // Bar chart comparing the three rates
  useEffect(() => {
    if (!results || !barRef.current) return
    const svg = d3.select(barRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 20, bottom: 60, left: 60 }
    const width = 400 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const data = [
      { label: 'Markov\\n(end only)', rate: results.markovCount / nPaths, color: '#3b82f6' },
      { label: 'Ville\\n(LR any time)', rate: results.villeCount / nPaths, color: '#8b5cf6' },
      { label: 'z-test peek\\n(every step)', rate: results.zPeekCount / nPaths, color: '#ef4444' },
    ]

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, width]).padding(0.35)
    const y = d3.scaleLinear()
      .domain([0, Math.max(0.35, d3.max(data, d => d.rate)! * 1.3)])
      .range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // α line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(alpha)).attr('y2', y(alpha))
      .attr('stroke', '#dc2626').attr('stroke-dasharray', '6,4').attr('stroke-width', 1.5)
    g.append('text').attr('x', width - 4).attr('y', y(alpha) - 6)
      .attr('text-anchor', 'end')
      .text(\`α = \${(alpha * 100).toFixed(0)}%\`).attr('fill', '#dc2626').attr('font-size', '11px')

    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('x', d => x(d.label)!)
      .attr('width', x.bandwidth())
      .attr('y', height).attr('height', 0)
      .attr('fill', d => d.color).attr('rx', 4)
      .transition().duration(800).delay((_, i) => i * 200)
      .attr('y', d => y(d.rate))
      .attr('height', d => height - y(d.rate))

    g.selectAll('.lbl').data(data).enter().append('text')
      .attr('x', d => x(d.label)! + x.bandwidth() / 2)
      .attr('y', d => y(d.rate) - 6)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold')
      .attr('fill', d => d.color)
      .text(d => \`\${(d.rate * 100).toFixed(1)}%\`)

    g.append('g').attr('transform', \`translate(0,\${height})\`)
      .call(d3.axisBottom(x))
      .selectAll('text').attr('font-size', '10px')

    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => \`\${(+d * 100).toFixed(0)}%\`))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('False positive rate')

    g.append('text').attr('x', width / 2).attr('y', -12)
      .attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#374151')
      .text(\`Crossing rates (\${nPaths.toLocaleString()} paths, H₀ true)\`)
  }, [results, nPaths, alpha])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Markov vs Ville vs Peeking z-test</h4>
            <p className="text-sm text-neutral-600">
              All under H₀ (fair coin). Compare: crossing threshold at one time (Markov),
              ever crossing (Ville), and repeated z-test significance.
            </p>
          </div>
          <button onClick={simulate}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Paths: {nPaths.toLocaleString()}</label>
            <input type="range" min={100} max={5000} step={100} value={nPaths}
              onChange={e => setNPaths(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Flips: {nFlips}</label>
            <input type="range" min={50} max={500} step={50} value={nFlips}
              onChange={e => setNFlips(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <svg ref={lrRef} viewBox="0 0 600 280" className="w-full" />
          <svg ref={barRef} viewBox="0 0 400 250" className="w-full" />
        </div>

        {results && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Key insight:</strong> Both Markov ({((results.markovCount / nPaths) * 100).toFixed(1)}%)
              and Ville ({((results.villeCount / nPaths) * 100).toFixed(1)}%) stay below α = {(alpha * 100).toFixed(0)}%,
              while the standard z-test with peeking ({((results.zPeekCount / nPaths) * 100).toFixed(1)}%)
              far exceeds it. The LR threshold is anytime-valid; the p-value threshold is not.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
`

const CODE_SPRTSim = `'use client'

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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
      .text(\`B = \${B.toFixed(1)}\`).attr('fill', '#dc2626').attr('font-size', '10px')

    // Lower boundary
    g.append('rect')
      .attr('x', 0).attr('width', width)
      .attr('y', y(A)).attr('height', height - y(A))
      .attr('fill', '#f0fdf4').attr('opacity', 0.5)
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(A)).attr('y2', y(A))
      .attr('stroke', '#16a34a').attr('stroke-dasharray', '6,4').attr('stroke-width', 2)
    g.append('text').attr('x', width + 4).attr('y', y(A) + 4)
      .text(\`A = \${A.toFixed(3)}\`).attr('fill', '#16a34a').attr('font-size', '10px')

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
    path.attr('stroke-dasharray', \`\${totalLength} \${totalLength}\`)
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

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(8))
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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
      .text(\`Mean: \${meanStop.toFixed(0)}\`).attr('fill', '#dc2626').attr('font-size', '10px')

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(6))
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
      .text(\`Stopping times (\${nTrials} trials)\`)
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
`

const CODE_MixtureSPRTSim = `'use client'

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
        sprtDecision = \`Reject at n=\${i}\`
      }

      // mSPRT (Normal mixture)
      // Λₙᴴ = 1/√(1 + nτ²) * exp(nτ²x̄² / (2(σ²/n)(1+nτ²)))
      const nTau2 = i * tau * tau
      const shrinkage = 1 / Math.sqrt(1 + nTau2)
      const exponentTerm = (nTau2 * xbar * xbar) / (2 * (sigma * sigma / i) * (1 + nTau2))
      msprtPath.push(shrinkage * Math.exp(exponentTerm))

      if (msprtPath[i] >= threshold && msprtDecision === 'Undecided') {
        msprtDecision = \`Reject at n=\${i}\`
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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
      .text(\`1/α = \${threshold}\`).attr('fill', '#dc2626').attr('font-size', '10px')

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
    p1.attr('stroke-dasharray', \`\${l1} \${l1}\`).attr('stroke-dashoffset', l1)
      .transition().duration(1500).attr('stroke-dashoffset', 0)

    // mSPRT path
    const p2 = g.append('path').datum(data.msprtPath)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', '#8b5cf6').attr('stroke-width', 2.5)
    const l2 = (p2.node() as SVGPathElement)?.getTotalLength() || 0
    p2.attr('stroke-dasharray', \`\${l2} \${l2}\`).attr('stroke-dashoffset', l2)
      .transition().duration(1500).delay(300).attr('stroke-dashoffset', 0)

    // Legend
    const legend = g.append('g').attr('transform', \`translate(10, 10)\`)
    const items = [
      { label: \`SPRT (δ = \${wrongDelta}, wrong)\`, color: '#f59e0b' },
      { label: \`mSPRT (τ = \${tau.toFixed(2)}, mixture)\`, color: '#8b5cf6' },
    ]
    items.forEach((item, i) => {
      const row = legend.append('g').attr('transform', \`translate(0, \${i * 20})\`)
      row.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 0).attr('y2', 0)
        .attr('stroke', item.color).attr('stroke-width', 3)
      row.append('text').attr('x', 26).attr('y', 4)
        .text(item.label).attr('font-size', '11px').attr('fill', '#374151')
    })

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(8))
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
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect: {trueEffect.toFixed(2)}
            </label>
            <input type="range" min={0.05} max={0.5} step={0.05} value={trueEffect}
              onChange={e => setTrueEffect(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Mixture τ: {tau.toFixed(2)}
            </label>
            <input type="range" min={0.1} max={1.0} step={0.05} value={tau}
              onChange={e => setTau(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observations: {nObs}
            </label>
            <input type="range" min={50} max={500} step={50} value={nObs}
              onChange={e => setNObs(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 650 340" className="w-full" />

        {data && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-amber-700">SPRT (wrong δ)</div>
              <div className="text-xs text-amber-600">{data.sprtDecision}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-purple-700">mSPRT (mixture)</div>
              <div className="text-xs text-purple-600">{data.msprtDecision}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <strong>Key insight:</strong> When the true effect size differs from the SPRT&apos;s assumed δ,
          the SPRT can be slow or erratic. The mSPRT hedges across many effect sizes via the
          mixture, making it robust. Both are anytime-valid — the difference is power and speed.
        </p>
      </div>
    </div>
  )
}
`

const CODE_ConfidenceSequenceSim = `'use client'

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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
      .text(\`μ = \${trueEffect}\`).attr('fill', '#16a34a').attr('font-size', '10px')

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
    const legend = g.append('g').attr('transform', \`translate(\${width - 220}, 10)\`)
    const items = [
      { label: 'Confidence Sequence (anytime-valid)', color: '#8b5cf6', dash: '' },
      { label: 'Fixed CI (single-time valid)', color: '#3b82f6', dash: '4,3' },
      { label: 'Sample mean', color: '#374151', dash: '' },
    ]
    items.forEach((item, i) => {
      const row = legend.append('g').attr('transform', \`translate(0, \${i * 18})\`)
      row.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 0).attr('y2', 0)
        .attr('stroke', item.color).attr('stroke-width', 2.5)
        .attr('stroke-dasharray', item.dash || 'none')
      row.append('text').attr('x', 24).attr('y', 4)
        .text(item.label).attr('font-size', '10px').attr('fill', '#374151')
    })

    // Axes
    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(8))
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
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
`

const CODE_NoiseDemoSim = `'use client'

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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
      .text(\`Control: \${data.meanC.toFixed(1)}\`)
    g.append('text').attr('x', x(data.meanT)).attr('y', -4)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#16a34a')
      .text(\`Treatment: \${data.meanT.toFixed(1)}\`)

    // Axes
    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(8))
      .selectAll('text').attr('font-size', '10px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '10px')

    g.append('text').attr('x', width / 2).attr('y', height + 38)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('User outcome (e.g. revenue)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280').text('Count')

    // Legend
    const leg = g.append('g').attr('transform', \`translate(\${width - 135}, 5)\`)
    ;[{ label: 'Control', color: '#3b82f6' }, { label: 'Treatment', color: '#22c55e' }].forEach((item, i) => {
      const row = leg.append('g').attr('transform', \`translate(0, \${i * 18})\`)
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
            Run simulation
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect: {trueEffect}%
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
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
            <div className={\`border rounded-lg p-3 text-center \${data.significant ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}\`}>
              <div className={\`text-sm font-bold \${data.significant ? 'text-green-700' : 'text-amber-700'}\`}>
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
`

const CODE_EppoPipelineSim = `'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

/* ── RNG helpers ── */
function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/* ── types ── */
interface TimePoint {
  n: number
  tauHat: number
  se: number
  ciLower: number
  ciUpper: number
  seqCiLower: number
  seqCiUpper: number
}

interface SimState {
  timePoints: TimePoint[]
  decision: 'continue' | 'ship' | 'revert'
  decisionAt: number | null
}

/* ── simulation engine (CLT-based for large N support) ── */
function runPipeline(trueEffect: number, maxN: number): SimState {
  const checkpoints = Array.from({ length: 20 }, (_, i) => Math.round(maxN * (i + 1) / 20))
  const timePoints: TimePoint[] = []
  let decision: 'continue' | 'ship' | 'revert' = 'continue'
  let decisionAt: number | null = null

  // Y = 0.7*X + noise*0.7, so Var(Y) = 0.49 + 0.49 = 0.98
  // After CUPED with rho=0.7: Var(Y*) = Var(Y)*(1-rho^2) = 0.98*0.51 = 0.4998
  const adjustedVar = 0.5
  // The "true" random walk: at each checkpoint, sample tauHat ~ N(trueEffect, 2*adjustedVar/n)
  // We generate a consistent path by drawing incremental noise
  const noiseSeeds = Array.from({ length: 20 }, () => randn())

  // Running sums to produce correlated path
  let cumNoise = 0
  for (let idx = 0; idx < checkpoints.length; idx++) {
    const n = checkpoints[idx]
    const se = Math.sqrt(2 * adjustedVar / n)

    // Build correlated path: tauHat converges to trueEffect
    // Use sqrt(prev_n/n) correlation structure
    const prevN = idx > 0 ? checkpoints[idx - 1] : 0
    const newInfoFrac = (n - prevN) / n
    cumNoise = cumNoise * Math.sqrt(prevN / n) + noiseSeeds[idx] * Math.sqrt(newInfoFrac)
    const tauHat = trueEffect + se * cumNoise

    // Standard CI
    const ciLower = tauHat - 1.96 * se
    const ciUpper = tauHat + 1.96 * se

    // Sequential CI (Howard et al.)
    const totalN = 2 * n
    const nu = maxN * se * se * 2
    const logTerm = Math.log((totalN + nu) / (nu * 0.05 * 0.05))
    const seqMult = Math.sqrt(((totalN + nu) / totalN) * logTerm)
    const seqCiLower = tauHat - seqMult * se
    const seqCiUpper = tauHat + seqMult * se

    timePoints.push({ n, tauHat, se, ciLower, ciUpper, seqCiLower, seqCiUpper })

    if (decision === 'continue') {
      if (seqCiLower > 0) { decision = 'ship'; decisionAt = n }
      else if (seqCiUpper < 0) { decision = 'revert'; decisionAt = n }
    }
  }

  return { timePoints, decision, decisionAt }
}

export function EppoPipelineSim() {
  const [trueEffect, setTrueEffect] = useState(0.15)
  const [maxN, setMaxN] = useState(10000)
  const [simState, setSimState] = useState<SimState | null>(null)
  const ciRef = useRef<SVGSVGElement | null>(null)
  const effectRef = useRef<SVGSVGElement | null>(null)

  const run = useCallback(() => {
    setSimState(runPipeline(trueEffect, maxN))
  }, [trueEffect, maxN])

  /* ── CI Band Chart ── */
  useEffect(() => {
    if (!simState || !ciRef.current) return
    const svg = d3.select(ciRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 50, left: 70 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const tp = simState.timePoints
    const x = d3.scaleLinear().domain([0, maxN]).range([0, width])

    const allVals = tp.flatMap(t => [t.seqCiLower, t.seqCiUpper, t.ciLower, t.ciUpper])
    const yMin = Math.min(d3.min(allVals)! * 1.1, -0.1)
    const yMax = Math.max(d3.max(allVals)! * 1.1, 0.1)
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

    // Grid
    g.append('g').call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Zero line
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '4,3')

    // Sequential CI band
    const seqArea = d3.area<TimePoint>()
      .x(d => x(d.n))
      .y0(d => y(d.seqCiLower))
      .y1(d => y(d.seqCiUpper))
    g.append('path').datum(tp)
      .attr('d', seqArea)
      .attr('fill', '#3b82f6').attr('opacity', 0.15)

    // Standard CI band
    const stdArea = d3.area<TimePoint>()
      .x(d => x(d.n))
      .y0(d => y(d.ciLower))
      .y1(d => y(d.ciUpper))
    g.append('path').datum(tp)
      .attr('d', stdArea)
      .attr('fill', '#f59e0b').attr('opacity', 0.15)

    // Sequential CI lines
    const seqUpperLine = d3.line<TimePoint>().x(d => x(d.n)).y(d => y(d.seqCiUpper))
    const seqLowerLine = d3.line<TimePoint>().x(d => x(d.n)).y(d => y(d.seqCiLower))
    g.append('path').datum(tp).attr('d', seqUpperLine)
      .attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
    g.append('path').datum(tp).attr('d', seqLowerLine)
      .attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')

    // Standard CI lines
    const stdUpperLine = d3.line<TimePoint>().x(d => x(d.n)).y(d => y(d.ciUpper))
    const stdLowerLine = d3.line<TimePoint>().x(d => x(d.n)).y(d => y(d.ciLower))
    g.append('path').datum(tp).attr('d', stdUpperLine)
      .attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 1).attr('opacity', 0.7)
    g.append('path').datum(tp).attr('d', stdLowerLine)
      .attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 1).attr('opacity', 0.7)

    // Point estimate line
    const estLine = d3.line<TimePoint>().x(d => x(d.n)).y(d => y(d.tauHat))
    const path = g.append('path').datum(tp).attr('d', estLine)
      .attr('fill', 'none').attr('stroke', '#1d4ed8').attr('stroke-width', 2.5)
    const totalLen = (path.node() as SVGPathElement)?.getTotalLength() || 0
    path.attr('stroke-dasharray', \`\${totalLen} \${totalLen}\`)
        .attr('stroke-dashoffset', totalLen)
        .transition().duration(1500)
        .attr('stroke-dashoffset', 0)

    // True effect line
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(trueEffect)).attr('y2', y(trueEffect))
      .attr('stroke', '#16a34a').attr('stroke-dasharray', '8,4').attr('stroke-width', 1.5)
    g.append('text')
      .attr('x', width - 5).attr('y', y(trueEffect) - 6)
      .attr('text-anchor', 'end').attr('font-size', '10px').attr('fill', '#16a34a')
      .text(\`True effect = \${trueEffect}\`)

    // Decision marker
    if (simState.decisionAt) {
      const decTP = tp.find(t => t.n === simState.decisionAt)!
      g.append('line')
        .attr('x1', x(simState.decisionAt)).attr('x2', x(simState.decisionAt))
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', simState.decision === 'ship' ? '#16a34a' : '#dc2626')
        .attr('stroke-dasharray', '3,3').attr('stroke-width', 2)
      g.append('text')
        .attr('x', x(simState.decisionAt) + 4).attr('y', 14)
        .attr('font-size', '11px').attr('font-weight', 'bold')
        .attr('fill', simState.decision === 'ship' ? '#16a34a' : '#dc2626')
        .text(simState.decision === 'ship' ? 'Ship!' : 'Revert')
    }

    // Axes
    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(6))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Sample size per group')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -55)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Treatment effect')

    // Legend
    const leg = g.append('g').attr('transform', \`translate(\${width - 200}, \${height - 60})\`)
    const items = [
      { label: 'Point estimate', color: '#1d4ed8', dash: '' },
      { label: 'Sequential CI', color: '#3b82f6', dash: '4,3' },
      { label: 'Standard CI', color: '#f59e0b', dash: '' },
    ]
    items.forEach((item, i) => {
      const row = leg.append('g').attr('transform', \`translate(0, \${i * 16})\`)
      row.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 6).attr('y2', 6)
        .attr('stroke', item.color).attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dash || 'none')
      row.append('text').attr('x', 22).attr('y', 10).text(item.label)
        .attr('font-size', '10px').attr('fill', '#374151')
    })
  }, [simState, trueEffect, maxN])

  /* ── Variance Reduction Chart ── */
  useEffect(() => {
    if (!simState || !effectRef.current) return
    const svg = d3.select(effectRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 50, left: 70 }
    const width = 600 - margin.left - margin.right
    const height = 220 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const tp = simState.timePoints
    const x = d3.scaleLinear().domain([0, maxN]).range([0, width])
    const seMax = d3.max(tp, d => d.se)! * 1.2
    const y = d3.scaleLinear().domain([0, seMax]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // SE line
    const seLine = d3.line<TimePoint>().x(d => x(d.n)).y(d => y(d.se))
    g.append('path').datum(tp).attr('d', seLine)
      .attr('fill', 'none').attr('stroke', '#8b5cf6').attr('stroke-width', 2.5)

    // SE without CUPED (approx: SE_raw ~ SE_adj / sqrt(1 - rho^2), rho=0.7)
    const rawFactor = 1 / Math.sqrt(1 - 0.7 * 0.7)
    const rawLine = d3.line<TimePoint>().x(d => x(d.n)).y(d => y(d.se * rawFactor))
    g.append('path').datum(tp).attr('d', rawLine)
      .attr('fill', 'none').attr('stroke', '#d946ef').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')

    // Area between them (variance reduction)
    const betweenArea = d3.area<TimePoint>()
      .x(d => x(d.n))
      .y0(d => y(d.se))
      .y1(d => y(d.se * rawFactor))
    g.append('path').datum(tp).attr('d', betweenArea)
      .attr('fill', '#a78bfa').attr('opacity', 0.15)

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.3f')))
      .selectAll('text').attr('font-size', '11px')

    g.append('text').attr('x', width / 2).attr('y', height + 40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Sample size per group')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -55)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Standard Error')

    const leg = g.append('g').attr('transform', \`translate(\${width - 180}, 5)\`)
    const legItems = [
      { label: 'With CUPED', color: '#8b5cf6', dash: '' },
      { label: 'Without CUPED', color: '#d946ef', dash: '6,4' },
    ]
    legItems.forEach((item, i) => {
      const row = leg.append('g').attr('transform', \`translate(0, \${i * 16})\`)
      row.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 6).attr('y2', 6)
        .attr('stroke', item.color).attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dash || 'none')
      row.append('text').attr('x', 22).attr('y', 10).text(item.label)
        .attr('font-size', '10px').attr('fill', '#374151')
    })

    // Annotation
    const midTP = tp[Math.floor(tp.length / 2)]
    g.append('text')
      .attr('x', x(midTP.n)).attr('y', y((midTP.se + midTP.se * rawFactor) / 2))
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#7c3aed')
      .text('Variance reduction')
  }, [simState, maxN])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <h4 className="font-bold text-neutral-900 mb-3">EPPO Pipeline Simulation</h4>
        <p className="text-sm text-neutral-600 mb-4">
          Watch the full Eppo pipeline in action: randomise users, collect data with CUPED adjustment,
          build sequential confidence intervals, and see when a decision is reached.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect size: {trueEffect.toFixed(2)}
            </label>
            <input
              type="range" min="-0.3" max="0.5" step="0.01"
              value={trueEffect}
              onChange={e => setTrueEffect(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>-0.3 (harm)</span><span>0 (null)</span><span>0.5 (strong)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Max sample size per group: {maxN.toLocaleString()}
            </label>
            <input
              type="range" min="1000" max="1000000" step="1000"
              value={maxN}
              onChange={e => setMaxN(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>1,000</span><span>500,000</span><span>1,000,000</span>
            </div>
          </div>
        </div>
        <button
          onClick={run}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Run simulation
        </button>
      </div>

      {simState && (
        <>
          {/* Decision banner */}
          <div className={\`rounded-lg p-4 border-2 text-center font-medium \${
            simState.decision === 'ship' ? 'bg-green-50 border-green-300 text-green-800' :
            simState.decision === 'revert' ? 'bg-amber-50 border-amber-300 text-blue-800' :
            'bg-neutral-50 border-neutral-300 text-neutral-700'
          }\`}>
            {simState.decision === 'ship' && \`Decision: Ship the feature (significant at n = \${simState.decisionAt?.toLocaleString()} per group)\`}
            {simState.decision === 'revert' && \`Decision: Revert (harmful effect detected at n = \${simState.decisionAt?.toLocaleString()} per group)\`}
            {simState.decision === 'continue' && \`Decision: Inconclusive after \${maxN.toLocaleString()} users per group. Collect more data.\`}
          </div>

          {/* CI chart */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h5 className="font-semibold text-neutral-800 mb-1 text-sm">Confidence Intervals Over Time</h5>
            <p className="text-xs text-neutral-500 mb-2">
              Blue band = sequential CI (valid at all times). Orange band = standard CI (only valid at one pre-set time).
            </p>
            <svg ref={ciRef} viewBox="0 0 600 300" className="w-full" />
          </div>

          {/* Variance reduction */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h5 className="font-semibold text-neutral-800 mb-1 text-sm">CUPED Variance Reduction</h5>
            <p className="text-xs text-neutral-500 mb-2">
              Shaded area shows the variance reduction from CUPED (pre-experiment covariate adjustment).
            </p>
            <svg ref={effectRef} viewBox="0 0 600 220" className="w-full" />
          </div>
        </>
      )}
    </div>
  )
}
`

const CODE_VarianceReductionSim = `'use client'

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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(6))
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
    drawHist(adjRef.current, data.adjDiffs, data.adjMean, data.adjSE, data.adjSig, \`CUPED-adjusted (ρ = \${rho})\`, '#8b5cf6')
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
            Run simulation
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
              True effect: {trueEffect}%
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
`

const CODE_SequentialMultiplierSim = `'use client'

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
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

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
      const logTerm = Math.log((v + nu) / (nu * alpha * alpha))
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
      .attr('stroke', '#8b5cf6').attr('stroke-width', 3)

    // Area between sequential and fixed
    const area = d3.area<number>()
      .x((_, i) => x(nValues[i]))
      .y0(() => y(fixedMult))
      .y1(d => y(d))
    g.append('path').datum(seqMults)
      .attr('d', area).attr('fill', '#8b5cf6').attr('opacity', 0.08)

    // Mark where ν is tuned (n = nuFactor * maxN)
    const nuN = nuFactor * maxN
    if (nuN >= 10 && nuN <= maxN) {
      const nuV = nuN * sigma2
      const nuLogTerm = Math.log((nuV + nu) / (nu * alpha * alpha))
      const nuM = Math.sqrt(((nuV + nu) / nuV) * nuLogTerm)
      g.append('line').attr('x1', x(nuN)).attr('x2', x(nuN))
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', '#f59e0b').attr('stroke-dasharray', '4,3').attr('stroke-width', 1.5)
      g.append('circle').attr('cx', x(nuN)).attr('cy', y(nuM)).attr('r', 5)
        .attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 2)
      g.append('text').attr('x', x(nuN) + 8).attr('y', y(nuM) - 8)
        .text(\`ν tuned here (\${nuM.toFixed(2)})\`).attr('fill', '#f59e0b').attr('font-size', '10px')
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
          .text(\`+\${ratio}%\`)
      }
    })

    // Axes
    g.append('g').attr('transform', \`translate(0,\${height})\`)
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
    const leg = g.append('g').attr('transform', \`translate(\${width - 230}, 10)\`)
    const items = [
      { label: 'Sequential multiplier m(n)', color: '#8b5cf6', dash: '' },
      { label: 'Classical z = 1.96', color: '#3b82f6', dash: '6,4' },
      { label: 'ν tuning point', color: '#f59e0b', dash: '4,3' },
    ]
    items.forEach((item, i) => {
      const row = leg.append('g').attr('transform', \`translate(0, \${i * 18})\`)
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
    const logTerm = Math.log((v + nu) / (nu * alpha * alpha))
    return Math.sqrt(((v + nu) / v) * logTerm)
  })

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-neutral-900 mb-1">Sequential Multiplier m(n)</h4>
            <p className="text-sm text-neutral-600">
              The purple curve shows how the sequential CI multiplier approaches — but 
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
              onChange={e => setNuFactor(+e.target.value)} className="w-full accent-purple-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Max sample size: {maxN.toLocaleString()}
            </label>
            <input type="range" min={1000} max={100000} step={1000} value={maxN}
              onChange={e => setMaxN(+e.target.value)} className="w-full accent-purple-600" />
          </div>
        </div>

        <svg ref={svgRef} viewBox="0 0 650 360" className="w-full" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {exampleNs.map((n, i) => (
            <div key={n} className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-purple-700">{exampleMults[i].toFixed(2)}</div>
              <div className="text-xs text-purple-600">
                m({n.toLocaleString()}) — {((exampleMults[i] / 1.96 - 1) * 100).toFixed(0)}% wider than classical
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
`

const CODE_ComparisonSim = `'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

/* ── helpers ── */
function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1.0 / (1.0 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return 0.5 * (1 + sign * y)
}

function normalInv(p: number): number {
  // Rational approximation (Abramowitz & Stegun 26.2.23)
  if (p <= 0.0001) return -3.72
  if (p >= 0.9999) return 3.72
  if (p === 0.5) return 0
  const isLower = p < 0.5
  const pp = isLower ? p : 1 - p
  const t = Math.sqrt(-2 * Math.log(pp))
  const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328
  const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308
  const z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t)
  return isLower ? -z : z
}

/* ── method boundary functions ── */
const ALPHA = 0.05
const K = 6  // number of peeks

function bonferroniZ(): number {
  return normalInv(1 - ALPHA / (2 * K))
}

function pocockZ(): number {
  // Approximate Pocock constant via lookup/interpolation
  // K: 2->2.18, 4->2.36, 8->2.51, 12->2.58, 20->2.65
  if (K <= 2) return 2.18
  if (K <= 4) return 2.36
  if (K <= 8) return 2.51
  if (K <= 12) return 2.58
  return 2.65
}

function obfZ(k: number): number {
  const tk = k / K  // information fraction
  return 1.96 / Math.sqrt(tk)
}

function seqCSMultiplier(n: number, maxN: number): number {
  const totalN = 2 * n
  const nu = maxN * 2
  const logTerm = Math.log((totalN + nu) / (nu * ALPHA * ALPHA))
  return Math.sqrt(((totalN + nu) / totalN) * logTerm)
}

/* ── types ── */
interface MethodResult {
  name: string
  color: string
  boundaries: { k: number; n: number; halfWidth: number }[]
  decision: string
  decisionAt: number | null
}

/* ── simulation ── */
function runComparison(trueEffect: number, nPerGroup: number): {
  methods: MethodResult[]
  tauPath: { n: number; tau: number; se: number }[]
} {
  const checkN = Array.from({ length: K }, (_, i) => Math.round(nPerGroup * (i + 1) / K))

  // CLT-based: each group ~ N(0,1) for control, N(trueEffect,1) for treatment
  // SE = sqrt(2/n), tauHat ~ N(trueEffect, 2/n)
  const noiseSeeds = Array.from({ length: K }, () => randn())
  const tauPath: { n: number; tau: number; se: number }[] = []

  let cumNoise = 0
  for (let idx = 0; idx < checkN.length; idx++) {
    const n = checkN[idx]
    const se = Math.sqrt(2 / n)
    const prevN = idx > 0 ? checkN[idx - 1] : 0
    const newInfoFrac = (n - prevN) / n
    cumNoise = cumNoise * Math.sqrt(prevN / n) + noiseSeeds[idx] * Math.sqrt(newInfoFrac)
    const tau = trueEffect + se * cumNoise
    tauPath.push({ n, tau, se })
  }

  // Build methods
  const methods: MethodResult[] = []

  // 1. Bonferroni
  const bZ = bonferroniZ()
  let bDec = 'continue', bDecAt: number | null = null
  const bBounds = tauPath.map((tp, i) => {
    const hw = bZ * tp.se
    if (bDec === 'continue') {
      if (tp.tau - hw > 0) { bDec = 'Ship'; bDecAt = tp.n }
      else if (tp.tau + hw < 0) { bDec = 'Revert'; bDecAt = tp.n }
    }
    return { k: i + 1, n: tp.n, halfWidth: hw }
  })
  methods.push({ name: 'Bonferroni', color: '#f59e0b', boundaries: bBounds, decision: bDec === 'continue' ? 'Continue' : bDec, decisionAt: bDecAt })

  // 2. Pocock
  const pZ = pocockZ()
  let pDec = 'continue', pDecAt: number | null = null
  const pBounds = tauPath.map((tp, i) => {
    const hw = pZ * tp.se
    if (pDec === 'continue') {
      if (tp.tau - hw > 0) { pDec = 'Ship'; pDecAt = tp.n }
      else if (tp.tau + hw < 0) { pDec = 'Revert'; pDecAt = tp.n }
    }
    return { k: i + 1, n: tp.n, halfWidth: hw }
  })
  methods.push({ name: 'Pocock', color: '#8b5cf6', boundaries: pBounds, decision: pDec === 'continue' ? 'Continue' : pDec, decisionAt: pDecAt })

  // 3. O'Brien-Fleming
  let oDec = 'continue', oDecAt: number | null = null
  const oBounds = tauPath.map((tp, i) => {
    const oZ = obfZ(i + 1)
    const hw = oZ * tp.se
    if (oDec === 'continue') {
      if (tp.tau - hw > 0) { oDec = 'Ship'; oDecAt = tp.n }
      else if (tp.tau + hw < 0) { oDec = 'Revert'; oDecAt = tp.n }
    }
    return { k: i + 1, n: tp.n, halfWidth: hw }
  })
  methods.push({ name: "O'Brien-Fleming", color: '#06b6d4', boundaries: oBounds, decision: oDec === 'continue' ? 'Continue' : oDec, decisionAt: oDecAt })

  // 4. Confidence Sequences
  let sDec = 'continue', sDecAt: number | null = null
  const sBounds = tauPath.map((tp, i) => {
    const mult = seqCSMultiplier(tp.n, nPerGroup)
    const hw = mult * tp.se
    if (sDec === 'continue') {
      if (tp.tau - hw > 0) { sDec = 'Ship'; sDecAt = tp.n }
      else if (tp.tau + hw < 0) { sDec = 'Revert'; sDecAt = tp.n }
    }
    return { k: i + 1, n: tp.n, halfWidth: hw }
  })
  methods.push({ name: 'Conf. Sequences', color: '#3b82f6', boundaries: sBounds, decision: sDec === 'continue' ? 'Continue' : sDec, decisionAt: sDecAt })

  return { methods, tauPath }
}

export function ComparisonSim() {
  const [trueEffect, setTrueEffect] = useState(0.2)
  const [nPerGroup, setNPerGroup] = useState(10000)
  const [result, setResult] = useState<ReturnType<typeof runComparison> | null>(null)
  const chartRef = useRef<SVGSVGElement | null>(null)
  const boundaryRef = useRef<SVGSVGElement | null>(null)

  const run = useCallback(() => {
    setResult(runComparison(trueEffect, nPerGroup))
  }, [trueEffect, nPerGroup])

  /* ── CI Bands Chart ── */
  useEffect(() => {
    if (!result || !chartRef.current) return
    const svg = d3.select(chartRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 50, left: 70 }
    const width = 700 - margin.left - margin.right
    const height = 340 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const x = d3.scaleLinear().domain([0, nPerGroup]).range([0, width])

    // Compute y range from all CIs
    const allVals: number[] = []
    result.tauPath.forEach((tp, i) => {
      result.methods.forEach(m => {
        allVals.push(tp.tau - m.boundaries[i].halfWidth)
        allVals.push(tp.tau + m.boundaries[i].halfWidth)
      })
    })
    const yPad = 0.1
    const yDomain: [number, number] = [Math.min(d3.min(allVals)! - yPad, -0.2), Math.max(d3.max(allVals)! + yPad, 0.2)]
    const y = d3.scaleLinear().domain(yDomain).range([height, 0])

    // Grid
    g.append('g').call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Zero line
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '4,3')

    // True effect
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(trueEffect)).attr('y2', y(trueEffect))
      .attr('stroke', '#16a34a').attr('stroke-dasharray', '8,4').attr('stroke-width', 1.5)
    g.append('text').attr('x', 5).attr('y', y(trueEffect) - 6)
      .attr('font-size', '10px').attr('fill', '#16a34a')
      .text(\`True = \${trueEffect}\`)

    // Draw CI bands per method
    result.methods.forEach(m => {
      const upper = result.tauPath.map((tp, i) => ({ n: tp.n, val: tp.tau + m.boundaries[i].halfWidth }))
      const lower = result.tauPath.map((tp, i) => ({ n: tp.n, val: tp.tau - m.boundaries[i].halfWidth }))

      const area = d3.area<{ n: number; val: number }>()
        .x(d => x(d.n))
        .y0((_, i) => y(lower[i].val))
        .y1(d => y(d.val))

      g.append('path').datum(upper).attr('d', area)
        .attr('fill', m.color).attr('opacity', 0.08)

      // Upper line
      const upperLine = d3.line<{ n: number; val: number }>().x(d => x(d.n)).y(d => y(d.val))
      g.append('path').datum(upper).attr('d', upperLine)
        .attr('fill', 'none').attr('stroke', m.color).attr('stroke-width', 1.5).attr('opacity', 0.6)
      // Lower line
      const lowerLine = d3.line<{ n: number; val: number }>().x(d => x(d.n)).y(d => y(d.val))
      g.append('path').datum(lower).attr('d', lowerLine)
        .attr('fill', 'none').attr('stroke', m.color).attr('stroke-width', 1.5).attr('opacity', 0.6)
    })

    // Point estimate
    const estLine = d3.line<{ n: number; tau: number }>().x(d => x(d.n)).y(d => y(d.tau))
    const path = g.append('path').datum(result.tauPath).attr('d', estLine)
      .attr('fill', 'none').attr('stroke', '#111827').attr('stroke-width', 2.5)
    const totalLen = (path.node() as SVGPathElement)?.getTotalLength() || 0
    path.attr('stroke-dasharray', \`\${totalLen} \${totalLen}\`)
        .attr('stroke-dashoffset', totalLen)
        .transition().duration(1500)
        .attr('stroke-dashoffset', 0)

    // Axes
    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(6))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(6))
      .selectAll('text').attr('font-size', '11px')
    g.append('text').attr('x', width / 2).attr('y', height + 40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Sample size per group')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -55)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Treatment effect')

    // Legend
    const leg = g.append('g').attr('transform', \`translate(\${width - 170}, 5)\`)
    result.methods.forEach((m, i) => {
      const row = leg.append('g').attr('transform', \`translate(0, \${i * 16})\`)
      row.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2)
        .attr('fill', m.color).attr('opacity', 0.5)
      row.append('text').attr('x', 16).attr('y', 10).text(m.name)
        .attr('font-size', '10px').attr('fill', '#374151')
    })
  }, [result, trueEffect, nPerGroup])

  /* ── Critical Value Chart ── */
  useEffect(() => {
    if (!result || !boundaryRef.current) return
    const svg = d3.select(boundaryRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 50, left: 60 }
    const width = 700 - margin.left - margin.right
    const height = 220 - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)

    const peeks = Array.from({ length: K }, (_, i) => i + 1)
    const x = d3.scaleLinear().domain([1, K]).range([0, width])

    // Compute critical values per method at each peek
    type CritEntry = { k: number; z: number }
    const bfData: CritEntry[] = peeks.map(k => ({ k, z: bonferroniZ() }))
    const pkData: CritEntry[] = peeks.map(k => ({ k, z: pocockZ() }))
    const obfData: CritEntry[] = peeks.map(k => ({ k, z: obfZ(k) }))
    const csData: CritEntry[] = peeks.map(k => ({ k, z: seqCSMultiplier(Math.round(nPerGroup * k / K), nPerGroup) }))

    const allZ = [...bfData, ...pkData, ...obfData, ...csData].map(d => d.z)
    const yMax = Math.min(d3.max(allZ)! * 1.1, 10)
    const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f3f4f6')

    // Standard z=1.96 reference
    g.append('line').attr('x1', 0).attr('x2', width)
      .attr('y1', y(1.96)).attr('y2', y(1.96))
      .attr('stroke', '#9ca3af').attr('stroke-dasharray', '4,3')
    g.append('text').attr('x', width + 4).attr('y', y(1.96) + 4)
      .attr('font-size', '10px').attr('fill', '#9ca3af').text('z = 1.96')

    const allSeries: { data: CritEntry[]; color: string; label: string }[] = [
      { data: bfData, color: '#f59e0b', label: 'Bonferroni' },
      { data: pkData, color: '#8b5cf6', label: 'Pocock' },
      { data: obfData, color: '#06b6d4', label: "O'Brien-Fleming" },
      { data: csData, color: '#3b82f6', label: 'Conf. Sequences' },
    ]

    allSeries.forEach((s, sIdx) => {
      const line = d3.line<CritEntry>().x(d => x(d.k)).y(d => y(Math.min(d.z, yMax)))
      g.append('path').datum(s.data).attr('d', line)
        .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2)
      g.selectAll(\`.dot-\${sIdx}\`)
        .data(s.data)
        .enter().append('circle')
        .attr('cx', d => x(d.k))
        .attr('cy', d => y(Math.min(d.z, yMax)))
        .attr('r', 2.5).attr('fill', s.color)
    })

    g.append('g').attr('transform', \`translate(0,\${height})\`).call(d3.axisBottom(x).ticks(K).tickFormat(d => \`\${d}\`))
      .selectAll('text').attr('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('font-size', '11px')
    g.append('text').attr('x', width / 2).attr('y', height + 40)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Peek number (k)')
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
      .text('Critical value / Multiplier')

    const leg = g.append('g').attr('transform', \`translate(\${width - 170}, 5)\`)
    allSeries.forEach((s, i) => {
      const row = leg.append('g').attr('transform', \`translate(0, \${i * 16})\`)
      row.append('line').attr('x1', 0).attr('x2', 14).attr('y1', 6).attr('y2', 6)
        .attr('stroke', s.color).attr('stroke-width', 2)
      row.append('text').attr('x', 18).attr('y', 10).text(s.label)
        .attr('font-size', '10px').attr('fill', '#374151')
    })
  }, [result, nPerGroup])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <h4 className="font-bold text-neutral-900 mb-3">Head-to-Head Method Comparison</h4>
        <p className="text-sm text-neutral-600 mb-4">
          Compare how Bonferroni, Pocock, O&apos;Brien&ndash;Fleming, and Confidence Sequences
          behave on the same data. All methods use {K} equally-spaced peeks.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              True effect: {trueEffect.toFixed(2)}
            </label>
            <input type="range" min="0" max="0.5" step="0.01" value={trueEffect}
              onChange={e => setTrueEffect(parseFloat(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Sample size per group: {nPerGroup.toLocaleString()}
            </label>
            <input type="range" min="1000" max="1000000" step="1000" value={nPerGroup}
              onChange={e => setNPerGroup(parseInt(e.target.value))} className="w-full" />
          </div>
        </div>
        <button onClick={run}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Run simulation
        </button>
      </div>

      {result && (
        <>
          {/* Decision cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.methods.map(m => (
              <div key={m.name} className="bg-white border-2 rounded-lg p-3 text-center"
                style={{ borderColor: m.color }}>
                <div className="text-sm font-bold" style={{ color: m.color }}>{m.name}</div>
                <div className={\`text-lg font-bold mt-1 \${
                  m.decision === 'Ship' ? 'text-green-600' :
                  m.decision === 'Revert' ? 'text-amber-600' : 'text-neutral-500'
                }\`}>
                  {m.decision}
                </div>
                {m.decisionAt && (
                  <div className="text-xs text-neutral-400">at n = {m.decisionAt}</div>
                )}
              </div>
            ))}
          </div>

          {/* CI bands chart */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h5 className="font-semibold text-neutral-800 mb-1 text-sm">Confidence Intervals by Method</h5>
            <p className="text-xs text-neutral-500 mb-2">
              Each band shows a different method&apos;s CI around the same point estimate. Narrower = more efficient.
            </p>
            <svg ref={chartRef} viewBox="0 0 700 340" className="w-full" />
          </div>

          {/* Critical values chart */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h5 className="font-semibold text-neutral-800 mb-1 text-sm">Critical Values / Multipliers Over Peeks</h5>
            <p className="text-xs text-neutral-500 mb-2">
              How each method adjusts its threshold at each peek. OBF starts very high and drops;
              Pocock stays flat; Bonferroni is constant; Confidence Sequences adapt continuously.
            </p>
            <svg ref={boundaryRef} viewBox="0 0 700 220" className="w-full" />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Key insight:</strong> O&apos;Brien&ndash;Fleming is very conservative early
              (wide CI) but nearly matches a fixed-horizon test at the end. Pocock gives equal
              chances of stopping at every peek. Confidence Sequences are the most flexible,
              allowing continuous monitoring without pre-specifying the number of peeks.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
`

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200"
      >
        {show ? ('Hide ' + label) : ('Show ' + label)}
      </button>
      {show && (
        <pre className="mt-3 bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre">
          {code}
        </pre>
      )}
    </div>
  )
}

export function DetailedAppendixCode() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Simulation source code</h3>
        <p className="text-neutral-600 text-sm mb-6">
          Each simulation on this page is a self-contained React/TypeScript component using D3.js.
          Click any button below to reveal its source.
        </p>
        <CodeBlock label="Act 2 — RandomWalkSim.tsx" code={CODE_RandomWalkSim} />
        <CodeBlock label="Act 3 — MartingaleSim.tsx" code={CODE_MartingaleSim} />
        <CodeBlock label="Act 4 — LikelihoodRatioSim.tsx" code={CODE_LikelihoodRatioSim} />
        <CodeBlock label="Act 5 — LRMartingaleSim.tsx" code={CODE_LRMartingaleSim} />
        <CodeBlock label="Act 6 — VilleInequalitySim.tsx" code={CODE_VilleInequalitySim} />
        <CodeBlock label="Act 7 — SPRTSim.tsx" code={CODE_SPRTSim} />
        <CodeBlock label="Act 8 — MixtureSPRTSim.tsx" code={CODE_MixtureSPRTSim} />
        <CodeBlock label="Act 9 — ConfidenceSequenceSim.tsx" code={CODE_ConfidenceSequenceSim} />
        <CodeBlock label="Act 10 — NoiseDemoSim.tsx" code={CODE_NoiseDemoSim} />
        <CodeBlock label="Act 11 — EppoPipelineSim.tsx" code={CODE_EppoPipelineSim} />
        <CodeBlock label="Act 12 — VarianceReductionSim.tsx" code={CODE_VarianceReductionSim} />
        <CodeBlock label="Act 13 — SequentialMultiplierSim.tsx" code={CODE_SequentialMultiplierSim} />
        <CodeBlock label="Act 14 — ComparisonSim.tsx" code={CODE_ComparisonSim} />
      </div>
    </section>
  )
}