'use client'

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
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

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
    path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition().duration(1500).attr('stroke-dashoffset', 0)

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(6))
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
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

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

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8))
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
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
              onChange={e => setNGamblers(+e.target.value)} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Max rounds: {maxRounds}
            </label>
            <input type="range" min={50} max={500} step={50} value={maxRounds}
              onChange={e => setMaxRounds(+e.target.value)} className="w-full accent-blue-600" />
          </div>
        </div>

        {results && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-700">{results.winners.toLocaleString()}</div>
              <div className="text-xs text-blue-600">Winners ({((results.winners / nGamblers) * 100).toFixed(1)}%)</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-700">{results.losers.toLocaleString()}</div>
              <div className="text-xs text-blue-600">Losers ({((results.losers / nGamblers) * 100).toFixed(1)}%)</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-neutral-700">€{results.avgProfit.toFixed(2)}</div>
              <div className="text-xs text-neutral-500">Avg profit</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>What you&apos;re seeing:</strong> Left: a single gambler&apos;s profit/loss over time:a random walk
          re-labelled as money. Right: the doubling strategy histogram:many small winners, a few
          catastrophic losers. The average profit converges to €0 (martingale property). No strategy
          can beat a fair game.
        </p>
      </div>
    </div>
  )
}
