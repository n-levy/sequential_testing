"use client"

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as d3 from 'd3'
import { InlineMath } from '../ui/Math'

export type SimLayer =
  | 'fixed-ci'
  | 'sequential-ci'
  | 'pocock'
  | 'obf'
  | 'bonferroni'
  | 'harm-detect'

type KProp = number;
interface ABTestSimProps {
  layers: SimLayer[]
  showPeekStats?: boolean
  takeaway?: ReactNode
  simulationTitle?: string
  defaultEffect?: number
  defaultN?: number
  showPowerControl?: boolean
  K?: KProp
  hideEffectStats?: boolean
  showMeanEffects?: boolean // show mean |effect| columns in the 1000-repetitions table
}

const Z_975 = 1.959964
const PEEK_N_SIMS = 1000
const ALPHA_MIN = 0.01
const ALPHA_MAX = 0.1
const ALPHA_DEFAULT = 0.05
const DURATION_DEFAULT = 2 // weeks

function erfinv(x: number) {
  const a = 0.147
  const ln = Math.log(1 - x * x)
  const part1 = 2 / (Math.PI * a) + ln / 2
  const part2 = ln / a
  return Math.sign(x) * Math.sqrt(Math.sqrt(part1 * part1 - part2) - part1)
}

function normInv(p: number) {
  return Math.sqrt(2) * erfinv(2 * p - 1)
}

function normalCDF(x: number) {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return 0.5 * (1 + sign * y)
}

function getPeekIndices(n: number, k: number): number[] {
  if (n <= 0 || k <= 0) return []
  const uniqueLooks = new Set<number>()
  for (let j = 1; j <= k; j++) {
    const look = Math.round((j * n) / k)
    uniqueLooks.add(Math.max(1, Math.min(n, look)))
  }
  return Array.from(uniqueLooks).sort((a, b) => a - b)
}

function clampProbability(p: number): number {
  return Math.max(1e-6, Math.min(1 - 1e-6, p))
}

const LAYER_STYLE: Record<SimLayer, { color: string; label: string }> = {
  'fixed-ci':      { color: '#ef4444', label: 'Standard 95% confidence interval' },
  'sequential-ci': { color: '#2563eb', label: 'Sequential confidence interval (Eppo, 2022)' },
  'pocock':        { color: '#f59e0b', label: 'Pocock' },
  'obf':           { color: '#1d4ed8', label: "O'Brien–Fleming" },
  'bonferroni':    { color: '#0d9488', label: 'Bonferroni' },
  'harm-detect':   { color: '#dc2626', label: 'Guardrail harm detection (3 SD)' },
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function simulateABTestTrajectory(n: number, relativeLift: number, controlRate: number, seed: number) {
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

export function ABTestSim({
  layers,
  showPeekStats = false,
  takeaway,
  simulationTitle = 'Simulation 1: fixed-horizon confidence intervals.',
  defaultEffect = 0,
  defaultN = 10000,
  showPowerControl = true,
  K: KProp = 6,
  hideEffectStats = false,
  showMeanEffects = false,
}: ABTestSimProps) {
  const [effect, setEffect] = useState(defaultEffect)
  const [n, setN] = useState(defaultN)
  const [alpha, setAlpha] = useState(ALPHA_DEFAULT)
  const [baselineRate, setBaselineRate] = useState(0.1)
  const [seed, setSeed] = useState(1)
  const [kState, setK] = useState(KProp)
  const [durationWeeks, setDurationWeeks] = useState(DURATION_DEFAULT)
  const [peekProbs, setPeekProbs] = useState<Record<string, number> | null>(null)
  const [meanEstWhenSig, setMeanEstWhenSig] = useState<Record<string, number> | null>(null)
  const [meanEstAtEndWhenSig, setMeanEstAtEndWhenSig] = useState<Record<string, number> | null>(null)
  const [runSimulationsTrigger, setRunSimulationsTrigger] = useState(0)
  const [showSimulationNotes, setShowSimulationNotes] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const handler = () => {
      setShowSimulationNotes(true)
      if (showPeekStats) {
        setPeekProbs(null)
        setMeanEstWhenSig(null)
        setMeanEstAtEndWhenSig(null)
        setRunSimulationsTrigger(t => t + 1)
      }
    }
    window.addEventListener('show-all-content', handler)
    return () => window.removeEventListener('show-all-content', handler)
  }, [showPeekStats])

  const clampedEffect = Math.max(-0.5, Math.min(0.5, effect))
  const effectiveEffect = clampedEffect
  const effectPercent = Math.round(effectiveEffect * 100)
  const clampedBaseline = clampProbability(baselineRate)
  const peekIndices = useMemo(() => getPeekIndices(n, kState), [n, kState])
  const daysTotal = durationWeeks * 7
  const usersPerDay = n > 0 && daysTotal > 0 ? Math.max(1, Math.round(n / daysTotal)) : 1
  const nExt = n + usersPerDay

  const estimatedPower = useMemo<number | null>(() => {
    if (n <= 0) return null
    if (Math.abs(clampedEffect) < 1e-12) return null
    const pA = clampedBaseline
    const pB = clampProbability(pA * (1 + clampedEffect))
    const delta = Math.abs(pB - pA)
    const seAlt = Math.sqrt((pA * (1 - pA) + pB * (1 - pB)) / n)
    if (seAlt <= 0) return null
    const mu = delta / seAlt
    const zCrit = normInv(1 - alpha / 2)
    const powerVal = normalCDF(mu - zCrit) + normalCDF(-mu - zCrit)
    return Math.max(0, Math.min(1, powerVal))
  }, [n, clampedEffect, alpha, clampedBaseline])

  useEffect(() => {
    if (!showPeekStats || runSimulationsTrigger === 0) return;
    const results: Record<string, number> = {};
    const meanEstResults: Record<string, number> = {};
    const meanEstAtEndResults: Record<string, number> = {};
    for (const layer of layers) {
      let count = 0;
      let sumAbsEstWhenSig = 0;
      let sumAbsEstAtEndWhenSig = 0;
      for (let sim = 0; sim < PEEK_N_SIMS; ++sim) {
        const t = simulateABTestTrajectory(n, effectiveEffect, clampedBaseline, seed + sim + runSimulationsTrigger * 10000);
        let crossed = false;
        let estAtCrossing = 0;
        if (peekIndices.length === 0) continue;
        let lookPtr = 0
        const lastLookPtr = peekIndices.length - 1
        for (let i = 0; i < n && lookPtr <= lastLookPtr; ++i) {
          if ((i + 1) !== peekIndices[lookPtr]) continue;
          const denom = t.meansA[i];
          const est = denom !== 0 ? 100 * (t.meansB[i] - denom) / denom : 0;
          let w = 0;
          if (layer === 'fixed-ci') {
            w = denom !== 0 ? 100 * Z_975 * t.ses[i] / denom : 0;
          } else if (layer === 'sequential-ci') {
            const nu = n * 0.25;
            const t_i = i + 1;
            const logTerm = Math.log((t_i + nu) / (nu * alpha));
            w = denom !== 0 ? 100 * t.ses[i] * Math.sqrt((t_i + nu) / t_i * logTerm) / denom : 0;
          } else if (layer === 'pocock') {
            const cP = 2.41;
            w = denom !== 0 ? 100 * t.ses[i] * cP / denom : 0;
          } else if (layer === 'obf') {
            const k = Math.max(1, Math.round((i + 1) / n * kState));
            const z = normInv(1 - alpha / (2 * kState / k));
            w = denom !== 0 ? 100 * t.ses[i] * z / denom : 0;
          } else if (layer === 'bonferroni') {
            const z = normInv(1 - alpha / (2 * kState));
            w = denom !== 0 ? 100 * t.ses[i] * z / denom : 0;
          } else if (layer === 'harm-detect') {
            w = denom !== 0 ? 100 * t.ses[i] * 3.0 / denom : 0;
          }
          // harm-detect: one-sided — only cross if CI upper bound is below zero (harm detected)
          const isCross = layer === 'harm-detect'
            ? (est + w < 0)
            : (est - w > 0 || est + w < 0);
          if (isCross) {
            crossed = true;
            estAtCrossing = est;
            break
          }
          lookPtr++
        }
        if (crossed) {
          count++;
          sumAbsEstWhenSig += Math.abs(estAtCrossing);
          const denomEnd = t.meansA[n - 1];
          const estAtEnd = denomEnd !== 0 ? 100 * (t.meansB[n - 1] - denomEnd) / denomEnd : 0;
          sumAbsEstAtEndWhenSig += Math.abs(estAtEnd);
        }
      }
      results[layer] = count / PEEK_N_SIMS;
      meanEstResults[layer] = count > 0 ? sumAbsEstWhenSig / count : 0;
      meanEstAtEndResults[layer] = count > 0 ? sumAbsEstAtEndWhenSig / count : 0;
    }
    setPeekProbs(results);
    setMeanEstWhenSig(meanEstResults);
    setMeanEstAtEndWhenSig(meanEstAtEndResults);
  }, [showPeekStats, layers, n, clampedEffect, effectiveEffect, clampedBaseline, seed, alpha, kState, runSimulationsTrigger, peekIndices]);

  const traj = useMemo(
    () => simulateABTestTrajectory(nExt, effectiveEffect, clampedBaseline, seed),
    [nExt, effectiveEffect, clampedBaseline, seed]
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

  const ciHalfWidthPct = useMemo(() => {
    const arr = new Float64Array(nExt)
    for (let i = 0; i < nExt; i++) {
      const denom = traj.meansA[i]
      arr[i] = denom !== 0 ? 100 * Z_975 * traj.ses[i] / denom : 0
    }
    if (nExt > 0) arr[0] = 0
    return arr
  }, [traj, nExt])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const W = 700
    const H = 360
    const margin = { top: 20, right: 16, bottom: 44, left: 56 }
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom
    const yMin = -100
    const yMax = 100
    // x-axis in days
    const x = d3.scaleLinear().domain([0, daysTotal + 1]).range([0, innerW])
    const y = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0])
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
    const xAxisY = y(0)

    // Draw x-axis with day ticks; always include a tick at 14 days (2 weeks)
    const tickSet = new Set<number>()
    const approxTicks = d3.ticks(0, daysTotal, 6)
    approxTicks.forEach(t => tickSet.add(t))
    tickSet.add(14) // always show 2-week mark
    tickSet.add(daysTotal) // always show last day
    const tickValues = Array.from(tickSet).filter(t => t >= 0 && t <= daysTotal).sort((a, b) => a - b)

    g.append('g')
      .attr('transform', `translate(0,${xAxisY})`)
      .call(d3.axisBottom(x).tickValues(tickValues).tickFormat(d => `${Math.round(d as number)}`))

    g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(d => `${Math.round(d as number)}%`))
    g.append('text')
      .attr('transform', `translate(${innerW / 2}, ${innerH + 34})`)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Time (days)')
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -42)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Effect (%)')

    // Reference line at 0
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#525252').attr('stroke-width', 1).attr('stroke-dasharray', '4 3')

    g.append('text')
      .attr('x', x(0))
      .attr('y', xAxisY + 16)
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#525252')
      .text('0')

    // Helper: convert user index i to x-day coordinate
    const dayOf = (i: number) => n > 0 ? (i + 1) * daysTotal / n : 0

    // CI band for fixed-ci (always rendered as base layer)
    const area = d3.area<number>()
      .x((_d, i) => x(dayOf(i)))
      .y0((_d, i) => y(effectPct[i] - ciHalfWidthPct[i]))
      .y1((_d, i) => y(effectPct[i] + ciHalfWidthPct[i]))
      .defined((_d, i) => i >= 5 && Number.isFinite(ciHalfWidthPct[i]))
    g.append('path')
      .datum(Array.from({ length: nExt }, (_, i) => i))
      .attr('fill', LAYER_STYLE['fixed-ci'].color)
      .attr('fill-opacity', 0.12)
      .attr('stroke', LAYER_STYLE['fixed-ci'].color)
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.7)
      .attr('d', area as d3.Area<number>)

    if (layers.includes('sequential-ci')) {
      const seqArea = d3.area<number>()
        .x((_d, i) => x(dayOf(i)))
        .y0((_d, i) => {
          const denom = traj.meansA[i]
          const nu = n * 0.25
          const t_i = i + 1
          const logTerm = Math.log((t_i + nu) / (nu * alpha))
          const w = denom !== 0
            ? 100 * traj.ses[i] * Math.sqrt((t_i + nu) / t_i * logTerm) / denom
            : 0
          return y(effectPct[i] - w)
        })
        .y1((_d, i) => {
          const denom = traj.meansA[i]
          const nu = n * 0.25
          const t_i = i + 1
          const logTerm = Math.log((t_i + nu) / (nu * alpha))
          const w = denom !== 0
            ? 100 * traj.ses[i] * Math.sqrt((t_i + nu) / t_i * logTerm) / denom
            : 0
          return y(effectPct[i] + w)
        })
      g.append('path')
        .datum(Array.from({ length: nExt }, (_, i) => i))
        .attr('fill', LAYER_STYLE['sequential-ci'].color)
        .attr('fill-opacity', 0.15)
        .attr('stroke', LAYER_STYLE['sequential-ci'].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.8)
        .attr('d', seqArea as d3.Area<number>)
    }

    if (layers.includes('pocock')) {
      const cP = 2.41
      const pocockArea = d3.area<number>()
        .x((_d, i) => x(dayOf(i)))
        .y0((_d, i) => {
          const denom = traj.meansA[i]
          const w = denom !== 0 ? 100 * traj.ses[i] * cP / denom : 0
          return y(effectPct[i] - w)
        })
        .y1((_d, i) => {
          const denom = traj.meansA[i]
          const w = denom !== 0 ? 100 * traj.ses[i] * cP / denom : 0
          return y(effectPct[i] + w)
        })
      g.append('path')
        .datum(Array.from({ length: nExt }, (_, i) => i))
        .attr('fill', LAYER_STYLE['pocock'].color)
        .attr('fill-opacity', 0.12)
        .attr('stroke', LAYER_STYLE['pocock'].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.8)
        .attr('d', pocockArea as d3.Area<number>)
    }

    if (layers.includes('obf')) {
      const obfArea = d3.area<number>()
        .x((_d, i) => x(dayOf(i)))
        .y0((_d, i) => {
          const denom = traj.meansA[i]
          const k = Math.max(1, Math.round((i + 1) / n * kState))
          const z = normInv(1 - alpha / (2 * kState / k))
          const w = denom !== 0 ? 100 * traj.ses[i] * z / denom : 0
          return y(effectPct[i] - w)
        })
        .y1((_d, i) => {
          const denom = traj.meansA[i]
          const k = Math.max(1, Math.round((i + 1) / n * kState))
          const z = normInv(1 - alpha / (2 * kState / k))
          const w = denom !== 0 ? 100 * traj.ses[i] * z / denom : 0
          return y(effectPct[i] + w)
        })
      g.append('path')
        .datum(Array.from({ length: nExt }, (_, i) => i))
        .attr('fill', LAYER_STYLE['obf'].color)
        .attr('fill-opacity', 0.12)
        .attr('stroke', LAYER_STYLE['obf'].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.8)
        .attr('d', obfArea as d3.Area<number>)
    }

    if (layers.includes('bonferroni')) {
      const z = normInv(1 - alpha / (2 * kState))
      const bonfArea = d3.area<number>()
        .x((_d, i) => x(dayOf(i)))
        .y0((_d, i) => {
          const denom = traj.meansA[i]
          const w = denom !== 0 ? 100 * traj.ses[i] * z / denom : 0
          return y(effectPct[i] - w)
        })
        .y1((_d, i) => {
          const denom = traj.meansA[i]
          const w = denom !== 0 ? 100 * traj.ses[i] * z / denom : 0
          return y(effectPct[i] + w)
        })
      g.append('path')
        .datum(Array.from({ length: nExt }, (_, i) => i))
        .attr('fill', LAYER_STYLE['bonferroni'].color)
        .attr('fill-opacity', 0.12)
        .attr('stroke', LAYER_STYLE['bonferroni'].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.8)
        .attr('d', bonfArea as d3.Area<number>)
    }

    if (layers.includes('harm-detect')) {
      const harmArea = d3.area<number>()
        .x((_d, i) => x(dayOf(i)))
        .y0((_d, i) => {
          const denom = traj.meansA[i]
          const w = denom !== 0 ? 100 * traj.ses[i] * 3.0 / denom : 0
          return y(effectPct[i] - w)
        })
        .y1((_d, i) => {
          const denom = traj.meansA[i]
          const w = denom !== 0 ? 100 * traj.ses[i] * 3.0 / denom : 0
          return y(effectPct[i] + w)
        })
      g.append('path')
        .datum(Array.from({ length: nExt }, (_, i) => i))
        .attr('fill', LAYER_STYLE['harm-detect'].color)
        .attr('fill-opacity', 0.10)
        .attr('stroke', LAYER_STYLE['harm-detect'].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.7)
        .attr('d', harmArea as d3.Area<number>)
    }

    // Mean effect trajectory
    const line = d3.line<number>()
      .x((_d, i) => x(dayOf(i)))
      .y((_d, i) => y(effectPct[i]))
    g.append('path')
      .datum(Array.from({ length: nExt }, (_, i) => i))
      .attr('fill', 'none')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1.6)
      .attr('d', line as d3.Line<number>)
  }, [effectPct, ciHalfWidthPct, n, nExt, layers, traj, alpha, kState, daysTotal])

  const decision = useMemo(() => {
    if (n <= 0) return null
    if (peekIndices.length === 0) return null
    for (const look of peekIndices) {
      const i = look - 1
      const est = effectPct[i]
      const w = ciHalfWidthPct[i]
      const lo = est - w
      const hi = est + w
      if (lo > 0 || hi < 0) return { label: 'Yes' }
    }
    return { label: 'No' }
  }, [effectPct, ciHalfWidthPct, n, peekIndices])

  return (
    <div className="bg-white border border-neutral-300 rounded-lg p-4 my-6">
      <div className="mb-2 text-base font-semibold text-blue-900">
        {simulationTitle}
      </div>
      <div className="mb-3 text-sm text-blue-900 font-semibold">
        Relative effect size (%): <span className="font-mono">{effectPercent}%</span>
      </div>
      <div className="flex flex-wrap items-start gap-4 mb-4">
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Control conversion rate <span className="font-mono">({(clampedBaseline * 100).toFixed(1)}%)</span>
          </label>
          <input
            type="range" min={0.01} max={0.5} step={0.01}
            value={baselineRate} onChange={e => setBaselineRate(parseFloat(e.target.value))}
            className="w-full" list="abt-baseline-ticks"
          />
          <datalist id="abt-baseline-ticks">
            <option value="0.01" /><option value="0.10" /><option value="0.25" /><option value="0.50" />
          </datalist>
          <SliderTicks ticks={[0.01, 0.10, 0.25, 0.50]} min={0.01} max={0.5} format={v => `${Math.round(v * 100)}%`} />
        </div>
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Number of users <span className="font-mono">(n = {n})</span>
          </label>
          <input
            type="range" min={0} max={100000} step={50}
            value={n} onChange={e => setN(parseInt(e.target.value, 10))}
            className="w-full" list="abt-n-ticks"
          />
          <datalist id="abt-n-ticks">
            <option value="0" /><option value="1000" /><option value="5000" /><option value="10000" /><option value="50000" /><option value="100000" />
          </datalist>
          <SliderTicks ticks={[0, 1000, 5000, 10000, 50000, 100000]} min={0} max={100000} format={v => v >= 1000 ? `${v / 1000}k` : '0'} />
        </div>
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            <InlineMath>{`\\alpha`}</InlineMath> <span className="font-mono">({alpha.toFixed(2)})</span>
          </label>
          <div className="relative">
            <input
              type="range" min={ALPHA_MIN} max={ALPHA_MAX} step={0.01}
              value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))}
              className="w-full" list="abt-alpha-ticks"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-neutral-500"
              style={{ left: `${((ALPHA_DEFAULT - ALPHA_MIN) / (ALPHA_MAX - ALPHA_MIN)) * 100}%` }}
              aria-hidden
            />
          </div>
          <datalist id="abt-alpha-ticks">
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
              className="w-full" list="abt-effect-ticks"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-neutral-500"
              style={{ left: '50%' }}
              aria-hidden
            />
          </div>
          <datalist id="abt-effect-ticks">
            <option value="-0.5" /><option value="-0.25" /><option value="0" /><option value="0.25" /><option value="0.5" />
          </datalist>
          <SliderTicks ticks={[-0.5, -0.25, 0, 0.25, 0.5]} min={-0.5} max={0.5} format={v => `${Math.round(v * 100)}%`} />
          <div className="text-[11px] text-neutral-500 mt-1">Default: effect size = 0%</div>
        </div>
        <div className="w-full sm:w-[210px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Number of peeks (K) <span className="font-mono">({kState})</span>
          </label>
          <input
            type="range" min={2} max={50} step={1}
            value={kState}
            onChange={e => {
              const newK = parseInt(e.target.value, 10)
              setK(newK)
              setPeekProbs(null)
            }}
            className="w-full" list="abt-k-ticks"
          />
          <datalist id="abt-k-ticks">
            <option value="2" /><option value="10" /><option value="25" /><option value="50" />
          </datalist>
          <SliderTicks ticks={[2, 10, 25, 50]} min={2} max={50} format={v => `${v}`} />
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
              className="w-full" list="abt-duration-ticks"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-neutral-500"
              style={{ left: `${((DURATION_DEFAULT - 1) / (8 - 1)) * 100}%` }}
              aria-hidden
            />
          </div>
          <datalist id="abt-duration-ticks">
            <option value="1" /><option value="2" /><option value="4" /><option value="8" />
          </datalist>
          <SliderTicks ticks={[1, 2, 4, 8]} min={1} max={8} format={v => `${v}w`} />
          <div className="text-[11px] text-neutral-500 mt-1">
            Default: 2 weeks · {usersPerDay} users/day per group
          </div>
        </div>
        {showPowerControl && (
          <div className="w-full sm:w-[300px]">
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Estimated Power (1 - β)
            </label>
            <div className="h-9 px-3 flex items-center rounded border border-neutral-300 bg-neutral-50 text-neutral-800 font-mono text-xs w-full">
              {estimatedPower === null
                ? 'Inapplicable since there is no true effect'
                : estimatedPower >= 0.9995
                  ? '≈100%'
                  : `${(estimatedPower * 100).toFixed(1)}%`}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Computed from effect size, n, and α (two-sided z-test approximation). Shown as inapplicable when effect size is 0.
            </div>
          </div>
        )}
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
          {layers.map(layer => (
            <span key={layer} className="inline-flex items-center gap-1.5 text-neutral-700">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: LAYER_STYLE[layer].color, opacity: 0.45 }}
              />
              {LAYER_STYLE[layer].label}{['pocock','obf','bonferroni'].includes(layer) ? ` (K=${kState})` : ''}
            </span>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 700 360"
          style={{ minWidth: 700, width: '100%', maxWidth: '100%' }}
          className="w-full"
        />
      </div>
      {decision && (
        <div className="mt-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <div className="text-sm font-semibold text-black mb-2">
              In this instance of the simulation, would peeking {kState} times at equal time intervals during the test show at least one statistically significant result?
            </div>
            <span className="inline-block bg-blue-50 border border-blue-400 rounded-lg px-3 py-1 text-sm font-semibold text-blue-800">
              {decision.label}
            </span>
          </div>
        </div>
      )}
      {takeaway && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-sm text-blue-900">
          {takeaway}
        </div>
      )}
      {showPeekStats && (
        <div className="mb-8 mt-4">
          <div className="bg-white border border-blue-400 rounded-lg p-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-blue-900 font-semibold">
                Share of simulations in which peeking {kState} times at equal time intervals during the test would show at least one statistically significant result,<br />
                across 1000 repetitions:
              </span>
              <button
                type="button"
                onClick={() => {
                  setPeekProbs(null)
                  setMeanEstWhenSig(null)
                  setMeanEstAtEndWhenSig(null)
                  setRunSimulationsTrigger(t => t + 1)
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Run 1000 repetitions
              </button>
            </div>
            {peekProbs === null ? (
              <div className="mt-2 text-sm text-neutral-500">Click the button to run simulations</div>
            ) : Object.keys(peekProbs).length === 1 ? (
              <span className="mt-2 inline-block bg-blue-50 border border-blue-400 rounded-lg px-4 py-1.5 text-blue-700 font-mono font-semibold text-lg">
                {(Object.values(peekProbs)[0] * 100).toFixed(1)}%
              </span>
            ) : (
              <table className="mx-auto mt-2 text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-1 text-left">Method</th>
                    <th className="px-3 py-1 text-right">Share crossing</th>
                    {showMeanEffects && (
                      <>
                        <th className="px-3 py-1 text-right">Mean |effect| when significant</th>
                        <th className="px-3 py-1 text-right">Mean |effect| at end of test when significant</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {layers.map(layer => (
                    <tr key={layer}>
                      <td className="px-3 py-1 text-left">{LAYER_STYLE[layer].label}{['pocock','obf','bonferroni'].includes(layer) ? ` (K=${kState})` : ''}</td>
                      <td className="px-3 py-1 text-right text-blue-700 font-mono">{(peekProbs[layer] * 100).toFixed(1)}%</td>
                      {showMeanEffects && (
                        <>
                          <td className="px-3 py-1 text-right text-blue-700 font-mono">
                            {meanEstWhenSig && peekProbs[layer] > 0 ? `${meanEstWhenSig[layer].toFixed(1)}%` : '—'}
                          </td>
                          <td className="px-3 py-1 text-right text-blue-700 font-mono">
                            {meanEstAtEndWhenSig && peekProbs[layer] > 0 ? `${meanEstAtEndWhenSig[layer].toFixed(1)}%` : '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowSimulationNotes(v => !v)}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200"
            >
              {showSimulationNotes ? 'Hide simulation assumptions and notes' : 'Show simulation assumptions and notes'}
            </button>
          </div>

          {showSimulationNotes && (
            <div className="mt-3 bg-neutral-50 border border-neutral-300 rounded-lg p-4 text-left text-sm text-neutral-700 space-y-4 leading-relaxed">
              <div>
                <h5 className="font-semibold text-neutral-900 mb-2">Assumptions</h5>
                <ul className="list-disc list-inside space-y-2">
                  <li>Binary outcome metric (Bernoulli), modeled as conversion in each arm. For example: making an order in the first visit during the test.</li>
                  <li>Uplift is modeled as relative lift on baseline: <InlineMath>{`\\text{uplift} = (\\bar p_B - \\bar p_A)/\\bar p_A`}</InlineMath>, with generator <InlineMath>{`p_B = p_A(1 + \\text{lift})`}</InlineMath>.</li>
                  <li>Null hypothesis is <InlineMath>{`H_0: \\text{lift} = 0`}</InlineMath> (equivalently, no treatment effect).</li>
                  <li>Standard deviation follows Bernoulli variance in each arm: <InlineMath>{`\\sigma_A = \\sqrt{p_A(1-p_A)},\\ \\sigma_B = \\sqrt{p_B(1-p_B)}`}</InlineMath>, so <InlineMath>{`\\mathrm{SE}(\\hat p_B-\\hat p_A)=\\sqrt{(\\sigma_A^2+\\sigma_B^2)/n}`}</InlineMath> where <InlineMath>{`n`}</InlineMath> is the per-group sample size.</li>
                  <li>Equal traffic split: 50% control and 50% treatment.</li>
                  <li>Control conversion baseline is user-specified via slider.</li>
                  <li>A constant number of users joins the experiment each day. For example, if n = 1,400 and the experiment lasts 2 weeks (14 days), then 1,400 / 14 = 100 users per group join per day.</li>
                  <li>In reality, the number of unique users entering each day may decrease over time as repeat visitors are excluded. This simplification does not affect the key insights the simulation aims to illustrate.</li>
                  <li>Independent users/events within and across arms (no clustering or interference).</li>
                  <li>No missing data, no delayed outcomes, and no sample-ratio mismatch.</li>
                  <li>Two-sided significance check at each look: confidence interval crossing zero is treated as significant. Exception: the guardrail harm detection method is one-sided — it only triggers when the confidence interval lies entirely below zero.</li>
                  <li>Peeks occur at exactly K equal time intervals over the test duration.</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-neutral-900 mb-2">Notes</h5>
                <ul className="list-disc list-inside space-y-2">
                  <li>The Monte Carlo estimate uses 1000 repetitions, so displayed rates include simulation noise.</li>
                  <li>Example: baseline 10% with +4% relative lift gives treatment 10.4%.</li>
                  <li>Estimated power is shown as <InlineMath>{`\\approx 100\\%`}</InlineMath> when extremely close to 1, rather than exactly 100%.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
