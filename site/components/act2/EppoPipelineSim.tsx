'use client'

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
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

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
    path.attr('stroke-dasharray', `${totalLen} ${totalLen}`)
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
      .text(`True effect = ${trueEffect}`)

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
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(6))
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
    const leg = g.append('g').attr('transform', `translate(${width - 200}, ${height - 60})`)
    const items = [
      { label: 'Point estimate', color: '#1d4ed8', dash: '' },
      { label: 'Sequential CI', color: '#3b82f6', dash: '4,3' },
      { label: 'Standard CI', color: '#f59e0b', dash: '' },
    ]
    items.forEach((item, i) => {
      const row = leg.append('g').attr('transform', `translate(0, ${i * 16})`)
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
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

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

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(6))
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

    const leg = g.append('g').attr('transform', `translate(${width - 180}, 5)`)
    const legItems = [
      { label: 'With CUPED', color: '#8b5cf6', dash: '' },
      { label: 'Without CUPED', color: '#d946ef', dash: '6,4' },
    ]
    legItems.forEach((item, i) => {
      const row = leg.append('g').attr('transform', `translate(0, ${i * 16})`)
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
          {simState ? 'Re-run Pipeline' : 'Run Pipeline'}
        </button>
      </div>

      {simState && (
        <>
          {/* Decision banner */}
          <div className={`rounded-lg p-4 border-2 text-center font-medium ${
            simState.decision === 'ship' ? 'bg-green-50 border-green-300 text-green-800' :
            simState.decision === 'revert' ? 'bg-amber-50 border-amber-300 text-amber-800' :
            'bg-neutral-50 border-neutral-300 text-neutral-700'
          }`}>
            {simState.decision === 'ship' && `Decision: Ship the feature (significant at n = ${simState.decisionAt?.toLocaleString()} per group)`}
            {simState.decision === 'revert' && `Decision: Revert (harmful effect detected at n = ${simState.decisionAt?.toLocaleString()} per group)`}
            {simState.decision === 'continue' && `Decision: Inconclusive after ${maxN.toLocaleString()} users per group. Collect more data.`}
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
