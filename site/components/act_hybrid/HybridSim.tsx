"use client"

import { useState, useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { InlineMath } from '../ui/Math'

const Z_975 = 1.959964
const DURATION_DEFAULT = 2
const ALPHA_DEFAULT = 0.05
const ALPHA_MIN = 0.01
const ALPHA_MAX = 0.1

function clampProbability(p: number): number {
  return Math.max(1e-6, Math.min(1 - 1e-6, p))
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function simulateTrajectory(n: number, relativeLift: number, controlRate: number, seed: number) {
  const rand = mulberry32(seed)
  const meansA = new Float64Array(n)
  const meansB = new Float64Array(n)
  const ses = new Float64Array(n)
  const pA = clampProbability(controlRate)
  const pB = clampProbability(pA * (1 + relativeLift))
  let sumA = 0, sumB = 0
  for (let i = 0; i < n; i++) {
    sumA += rand() < pA ? 1 : 0
    sumB += rand() < pB ? 1 : 0
    const k = i + 1
    meansA[i] = sumA / k
    meansB[i] = sumB / k
    const vA = Math.max(meansA[i] * (1 - meansA[i]), 1e-4)
    const vB = Math.max(meansB[i] * (1 - meansB[i]), 1e-4)
    ses[i] = Math.sqrt((vA + vB) / k)
  }
  return { meansA, meansB, ses }
}

function SliderTicks({ ticks, min, max, format }: {
  ticks: number[]
  min: number
  max: number
  format: (v: number) => string
}) {
  return (
    <div className="relative h-4 mt-0.5 select-none pointer-events-none">
      {ticks.map(v => (
        <span
          key={v}
          className="absolute text-[9px] text-neutral-400 -translate-x-1/2"
          style={{ left: `${((v - min) / (max - min)) * 100}%` }}
        >
          {format(v)}
        </span>
      ))}
    </div>
  )
}

export function HybridSim() {
  const [n, setN] = useState(10000)
  const [alpha, setAlpha] = useState(ALPHA_DEFAULT)
  const [baselineRate, setBaselineRate] = useState(0.1)
  const [effect, setEffect] = useState(0)
  const [durationWeeks, setDurationWeeks] = useState(DURATION_DEFAULT)
  const [seed, setSeed] = useState(1)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const daysTotal = durationWeeks * 7
  const clampedEffect = Math.max(-0.5, Math.min(0.5, effect))
  const clampedBaseline = clampProbability(baselineRate)
  const usersPerDay = n > 0 && daysTotal > 0 ? Math.round(n / daysTotal) : 0
  const nExt = n + Math.max(1, usersPerDay)

  const traj = useMemo(
    () => simulateTrajectory(nExt, clampedEffect, clampedBaseline, seed),
    [nExt, clampedEffect, clampedBaseline, seed]
  )

  const effectPct = useMemo(() => {
    const arr = new Float64Array(nExt)
    for (let i = 0; i < nExt; i++) {
      const denom = traj.meansA[i]
      arr[i] = denom !== 0 ? 100 * (traj.meansB[i] - denom) / denom : 0
    }
    if (nExt > 0) arr[0] = 0
    return arr
  }, [traj, nExt])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = 920
    const H = 380
    const margin = { top: 30, right: 200, bottom: 48, left: 56 }
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom

    const yMin = -100
    const yMax = 100
    const x = d3.scaleLinear().domain([0, daysTotal + 1]).range([0, innerW])
    const y = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0])
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // X-axis: always include tick at 14 (2-week mark) and at daysTotal
    const tickSet = new Set<number>()
    d3.ticks(0, daysTotal, 6).forEach((t: number) => tickSet.add(t))
    tickSet.add(14)
    tickSet.add(daysTotal)
    const tickValues = Array.from(tickSet).filter((t: number) => t >= 0 && t <= daysTotal).sort((a, b) => a - b)

    g.append('g')
      .attr('transform', `translate(0,${y(0)})`)
      .call(d3.axisBottom(x).tickValues(tickValues).tickFormat(d => `${Math.round(d as number)}`))

    g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(d => `${Math.round(d as number)}%`))

    g.append('text')
      .attr('transform', `translate(${innerW / 2}, ${innerH + 38})`)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Time (days)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -42)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Effect (%)')

    // Zero reference line
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#525252').attr('stroke-width', 1).attr('stroke-dasharray', '4 3')

    const dayOf = (i: number) => n > 0 ? (i + 1) * daysTotal / n : 0

    // Sequential CI band (blue) — full experiment duration, guardrail monitoring
    const seqArea = d3.area<number>()
      .x((_d, i) => x(dayOf(i)))
      .y0((_d, i) => {
        const denom = traj.meansA[i]
        const nu = n * 0.25
        const t_i = i + 1
        const logTerm = Math.log((t_i + nu) / (nu * alpha))
        const w = denom !== 0 ? 100 * traj.ses[i] * Math.sqrt((t_i + nu) / t_i * logTerm) / denom : 0
        return y(effectPct[i] - w)
      })
      .y1((_d, i) => {
        const denom = traj.meansA[i]
        const nu = n * 0.25
        const t_i = i + 1
        const logTerm = Math.log((t_i + nu) / (nu * alpha))
        const w = denom !== 0 ? 100 * traj.ses[i] * Math.sqrt((t_i + nu) / t_i * logTerm) / denom : 0
        return y(effectPct[i] + w)
      })
      .defined((_d, i) => i >= 5)

    g.append('path')
      .datum(Array.from({ length: nExt }, (_, i) => i))
      .attr('fill', '#2563eb')
      .attr('fill-opacity', 0.13)
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.65)
      .attr('d', seqArea as d3.Area<number>)

    // Vertical dashed line at end of test
    const xEnd = x(daysTotal)
    g.append('line')
      .attr('x1', xEnd).attr('x2', xEnd)
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#374151')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6 4')

    // "End of test" label — above the chart area, right-aligned to the dashed line
    g.append('text')
      .attr('x', xEnd - 6)
      .attr('y', -8)
      .style('text-anchor', 'end')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('End of test')

    // Standard CI error bar (red) at x = daysTotal — primary KPI decision
    if (n > 0) {
      const lastI = n - 1
      const denom = traj.meansA[lastI]
      const estEnd = effectPct[lastI]
      const wEnd = denom !== 0 ? 100 * Z_975 * traj.ses[lastI] / denom : 0
      const yLo = y(estEnd - wEnd)
      const yHi = y(estEnd + wEnd)
      const capHalf = 10

      // Shaded box for the standard CI (narrow red region)
      g.append('rect')
        .attr('x', xEnd - 4)
        .attr('y', yHi)
        .attr('width', 8)
        .attr('height', Math.abs(yLo - yHi))
        .attr('fill', '#ef4444')
        .attr('fill-opacity', 0.22)

      // Vertical bar
      g.append('line')
        .attr('x1', xEnd).attr('x2', xEnd)
        .attr('y1', yHi).attr('y2', yLo)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)

      // Top cap
      g.append('line')
        .attr('x1', xEnd - capHalf).attr('x2', xEnd + capHalf)
        .attr('y1', yHi).attr('y2', yHi)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)

      // Bottom cap
      g.append('line')
        .attr('x1', xEnd - capHalf).attr('x2', xEnd + capHalf)
        .attr('y1', yLo).attr('y2', yLo)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)

      // Center dot
      g.append('circle')
        .attr('cx', xEnd)
        .attr('cy', y(estEnd))
        .attr('r', 4)
        .attr('fill', '#ef4444')

    }

    // Effect trajectory (dark line on top)
    const line = d3.line<number>()
      .x((_d, i) => x(dayOf(i)))
      .y((_d, i) => y(effectPct[i]))

    g.append('path')
      .datum(Array.from({ length: nExt }, (_, i) => i))
      .attr('fill', 'none')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1.6)
      .attr('d', line as d3.Line<number>)

    // Annotation — drawn last so it sits on top of all plot lines
    if (n > 0) {
      const lastI = n - 1
      const estEnd = effectPct[lastI]
      const annotX = xEnd + 20
      const annotY = Math.min(Math.max(y(estEnd) - 26, 4), innerH - 56)
      const annotLines = ['Primary KPI:', 'decided at end', 'standard CI']
      const boxW = 130
      const boxH = 52
      g.append('rect')
        .attr('x', annotX - 4)
        .attr('y', annotY - 14)
        .attr('width', boxW)
        .attr('height', boxH)
        .attr('fill', 'white')
        .attr('fill-opacity', 1)
        .attr('rx', 4)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1)
      annotLines.forEach((line, idx) => {
        g.append('text')
          .attr('x', annotX)
          .attr('y', annotY + idx * 14)
          .style('text-anchor', 'start')
          .style('font-size', '10px')
          .style('font-weight', idx === 0 ? '600' : '400')
          .style('fill', '#ef4444')
          .text(line)
      })
    }
  }, [effectPct, traj, n, nExt, alpha, daysTotal])

  return (
    <div className="bg-white border border-neutral-300 rounded-lg p-4 my-6">
      <div className="mb-2 text-base font-semibold text-blue-900">
        Hybrid approach simulation: sequential confidence interval during the experiment, standard confidence interval at the end.
      </div>
      <div className="flex flex-wrap items-start gap-4 mb-4">
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Control conversion rate <span className="font-mono">({(clampedBaseline * 100).toFixed(1)}%)</span>
          </label>
          <input
            type="range" min={0.01} max={0.5} step={0.01}
            value={baselineRate} onChange={e => setBaselineRate(parseFloat(e.target.value))}
            className="w-full" list="hs-baseline-ticks"
          />
          <datalist id="hs-baseline-ticks">
            <option value="0.01" /><option value="0.10" /><option value="0.25" /><option value="0.50" />
          </datalist>
          <SliderTicks ticks={[0.01, 0.10, 0.25, 0.50]} min={0.01} max={0.5} format={v => `${Math.round(v * 100)}%`} />
        </div>
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Number of users <span className="font-mono">(n = {n})</span>
          </label>
          <input
            type="range" min={0} max={1000000} step={1000}
            value={n} onChange={e => setN(parseInt(e.target.value, 10))}
            className="w-full" list="hs-n-ticks"
          />
          <datalist id="hs-n-ticks">
            <option value="0" /><option value="1000" /><option value="10000" /><option value="100000" /><option value="500000" /><option value="1000000" />
          </datalist>
          <SliderTicks ticks={[0, 1000, 10000, 100000, 500000, 1000000]} min={0} max={1000000} format={v => v >= 1000000 ? '1M' : v >= 1000 ? `${v / 1000}k` : '0'} />
        </div>
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            <InlineMath>{`\\alpha`}</InlineMath> <span className="font-mono">({alpha.toFixed(2)})</span>
          </label>
          <div className="relative">
            <input
              type="range" min={ALPHA_MIN} max={ALPHA_MAX} step={0.01}
              value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))}
              className="w-full" list="hs-alpha-ticks"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-neutral-500"
              style={{ left: `${((ALPHA_DEFAULT - ALPHA_MIN) / (ALPHA_MAX - ALPHA_MIN)) * 100}%` }}
              aria-hidden
            />
          </div>
          <datalist id="hs-alpha-ticks">
            <option value="0.01" /><option value="0.05" /><option value="0.10" />
          </datalist>
          <SliderTicks ticks={[0.01, 0.05, 0.10]} min={ALPHA_MIN} max={ALPHA_MAX} format={v => v.toFixed(2)} />
          <div className="text-[11px] text-neutral-500 mt-1">Default: α = 0.05</div>
        </div>
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Relative effect size (%) <span className="font-mono">({Math.round(clampedEffect * 100)}%)</span>
          </label>
          <div className="relative">
            <input
              type="range" min={-0.5} max={0.5} step={0.01}
              value={clampedEffect} onChange={e => setEffect(parseFloat(e.target.value))}
              className="w-full" list="hs-effect-ticks"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-neutral-500"
              style={{ left: '50%' }}
              aria-hidden
            />
          </div>
          <datalist id="hs-effect-ticks">
            <option value="-0.5" /><option value="-0.25" /><option value="0" /><option value="0.25" /><option value="0.5" />
          </datalist>
          <SliderTicks ticks={[-0.5, -0.25, 0, 0.25, 0.5]} min={-0.5} max={0.5} format={v => `${Math.round(v * 100)}%`} />
          <div className="text-[11px] text-neutral-500 mt-1">Default: effect size = 0%</div>
        </div>
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Experiment duration (weeks) <span className="font-mono">({durationWeeks})</span>
          </label>
          <div className="relative">
            <input
              type="range" min={1} max={8} step={1}
              value={durationWeeks}
              onChange={e => setDurationWeeks(parseInt(e.target.value, 10))}
              className="w-full" list="hs-duration-ticks"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-neutral-500"
              style={{ left: `${((DURATION_DEFAULT - 1) / (8 - 1)) * 100}%` }}
              aria-hidden
            />
          </div>
          <datalist id="hs-duration-ticks">
            <option value="1" /><option value="2" /><option value="4" /><option value="8" />
          </datalist>
          <SliderTicks ticks={[1, 2, 4, 8]} min={1} max={8} format={v => `${v}w`} />
          <div className="text-[11px] text-neutral-500 mt-1">
            Default: 2 weeks · {usersPerDay} users/day per group
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSeed(s => s + 1)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Re-randomize
        </button>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 text-neutral-700">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#2563eb', opacity: 0.45 }} />
            Sequential confidence interval (guardrail, full duration)
          </span>
          <span className="inline-flex items-center gap-1.5 text-neutral-700">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#ef4444', opacity: 0.85 }} />
            Standard 95% confidence interval (primary KPI, end of test only)
          </span>
          <span className="inline-flex items-center gap-1.5 text-neutral-700">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#0f172a', opacity: 0.8 }} />
            Running effect estimate
          </span>
        </div>
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 920 380"
          style={{ minWidth: 700, width: '100%', maxWidth: '100%' }}
          className="w-full"
        />
      </div>
    </div>
  )
}
