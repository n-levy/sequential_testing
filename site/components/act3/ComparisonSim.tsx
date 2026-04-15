'use client'

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
const K = 12  // number of peeks

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
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

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
      .text(`True = ${trueEffect}`)

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
    path.attr('stroke-dasharray', `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen)
        .transition().duration(1500)
        .attr('stroke-dashoffset', 0)

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
    const leg = g.append('g').attr('transform', `translate(${width - 170}, 5)`)
    result.methods.forEach((m, i) => {
      const row = leg.append('g').attr('transform', `translate(0, ${i * 16})`)
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
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

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
      g.selectAll(`.dot-${sIdx}`)
        .data(s.data)
        .enter().append('circle')
        .attr('cx', d => x(d.k))
        .attr('cy', d => y(Math.min(d.z, yMax)))
        .attr('r', 2.5).attr('fill', s.color)
    })

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(K).tickFormat(d => `${d}`))
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

    const leg = g.append('g').attr('transform', `translate(${width - 170}, 5)`)
    allSeries.forEach((s, i) => {
      const row = leg.append('g').attr('transform', `translate(0, ${i * 16})`)
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
          {result ? 'Re-run Comparison' : 'Run Comparison'}
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
                <div className={`text-lg font-bold mt-1 ${
                  m.decision === 'Ship' ? 'text-green-600' :
                  m.decision === 'Revert' ? 'text-amber-600' : 'text-neutral-500'
                }`}>
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
