"use client";
import React, { useState } from 'react';

// Full source of the shared simulation component (ABTestSim.tsx)
const SIM_CODE = `"use client"

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as d3 from 'd3'
import { InlineMath } from '../ui/Math'

export type SimLayer =
  | 'fixed-ci'
  | 'sequential-ci'
  | 'pocock'
  | 'obf'
  | 'bonferroni'

type KProp = number;
interface ABTestSimProps {
  layers: SimLayer[]
  showPeekStats?: boolean
  takeaway?: ReactNode
  simulationTitle?: string
  defaultEffect?: number // difference in means between B and A
  defaultN?: number
  showPowerControl?: boolean
  K?: KProp // number of peeks for group sequential methods
  hideEffectStats?: boolean // hide sample effect and CI half-width boxes
}

const Z_975 = 1.959964
const PEEK_N_SIMS = 1000 // number of re-randomizations used to estimate crossing probabilities
const ALPHA_MIN = 0.01
const ALPHA_MAX = 0.1
const ALPHA_DEFAULT = 0.05

// Normal quantile approximation
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
  'fixed-ci':        { color: '#ef4444', label: 'Standard 95% CI' },
  'sequential-ci':   { color: '#2563eb', label: 'Sequential CI (Eppo)' },
  'pocock':          { color: '#f59e0b', label: 'Pocock' },
  'obf':             { color: '#8b5cf6', label: "O'Brien-Fleming" },
  'bonferroni':      { color: '#0d9488', label: 'Bonferroni' },
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Simulate running difference in means for A/B test with relative lift on a control baseline. */
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
    // Pooled variance for difference in means
    const vA = Math.max(meansA[i] * (1 - meansA[i]), 1e-4)
    const vB = Math.max(meansB[i] * (1 - meansB[i]), 1e-4)
    ses[i] = Math.sqrt((vA + vB) / k)
  }
  return { meansA, meansB, ses }
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
}: ABTestSimProps) {
  const [effect, setEffect] = useState(defaultEffect)
  const [n, setN] = useState(defaultN)
  const [alpha, setAlpha] = useState(ALPHA_DEFAULT)
  const [baselineRate, setBaselineRate] = useState(0.1)
  const [seed, setSeed] = useState(1)
  const [kState, setK] = useState(KProp)
  const [peekProbs, setPeekProbs] = useState<Record<string, number> | null>(null)
  const [runSimulationsTrigger, setRunSimulationsTrigger] = useState(0)
  const [showSimulationNotes, setShowSimulationNotes] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const clampedEffect = Math.max(-0.5, Math.min(0.5, effect))
  const effectiveEffect = clampedEffect
  const effectPercent = Math.round(effectiveEffect * 100)
  const clampedBaseline = clampProbability(baselineRate)
  const peekIndices = useMemo(() => getPeekIndices(n, kState), [n, kState])

  // Classical power approximation for two-sided difference-in-proportions test.
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

  // Compute the probability of crossing the CI at any point for all selected layers
  useEffect(() => {
    if (!showPeekStats || runSimulationsTrigger === 0) return;
    const results: Record<string, number> = {};
    for (const layer of layers) {
      let count = 0;
      for (let sim = 0; sim < PEEK_N_SIMS; ++sim) {
        const t = simulateABTestTrajectory(n, effectiveEffect, clampedBaseline, seed + sim + runSimulationsTrigger * 10000);
        let crossed = false;
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
          }
          if (est - w > 0 || est + w < 0) {
            crossed = true;
            break
          }
          lookPtr++
        }
        if (crossed) count++;
      }
      results[layer] = count / PEEK_N_SIMS;
    }
    setPeekProbs(results);
  }, [showPeekStats, layers, n, clampedEffect, effectiveEffect, clampedBaseline, seed, alpha, kState, runSimulationsTrigger, peekIndices]);

  const traj = useMemo(
    () => simulateABTestTrajectory(n, effectiveEffect, clampedBaseline, seed),
    [n, effectiveEffect, clampedBaseline, seed]
  )

  // Compute the running effect in percent: (meanB - meanA) / meanA
  const effectPct = useMemo(() => {
    const arr = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const denom = traj.meansA[i]
      arr[i] = denom !== 0 ? 100 * (traj.meansB[i] - denom) / denom : 0
    }
    if (n > 0) arr[0] = 0
    return arr
  }, [traj, n])

  // Compute the per-step CI half-width for the fixed CI (in percent)
  const ciHalfWidthPct = useMemo(() => {
    const arr = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const denom = traj.meansA[i]
      arr[i] = denom !== 0 ? 100 * Z_975 * traj.ses[i] / denom : 0
    }
    if (n > 0) arr[0] = 0
    return arr
  }, [traj, n])

  // Render the plot with D3
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const W = 700, H = 360
    const margin = { top: 20, right: 16, bottom: 44, left: 56 }
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom
    const yMin = -100, yMax = 100
    const xUpper = Math.max(1, n)
    const x = d3.scaleLinear().domain([0, xUpper]).range([0, innerW])
    const y = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0])
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`)
    const xAxisY = y(0)

    g.append('g').attr('transform', \`translate(0,\${xAxisY})\`).call(d3.axisBottom(x).ticks(6))
    g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(d => \`\${Math.round(d as number)}%\`))
    g.append('text')
      .attr('transform', \`translate(\${innerW / 2}, \${innerH + 34})\`)
      .style('text-anchor', 'middle').style('font-size', '12px').style('fill', '#525252')
      .text('Number of users (n)')
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

    // CI bands — one per layer
    const ciWidth = (layer: SimLayer, i: number) => {
      const denom = traj.meansA[i]
      if (denom === 0) return 0
      if (layer === 'fixed-ci') return 100 * Z_975 * traj.ses[i] / denom
      if (layer === 'sequential-ci') {
        const nu = n * 0.25
        const t_i = i + 1
        return 100 * traj.ses[i] * Math.sqrt((t_i + nu) / t_i * Math.log((t_i + nu) / (nu * alpha))) / denom
      }
      if (layer === 'pocock') return 100 * traj.ses[i] * 2.41 / denom
      if (layer === 'obf') {
        const k = Math.max(1, Math.round((i + 1) / n * kState))
        return 100 * traj.ses[i] * normInv(1 - alpha / (2 * kState / k)) / denom
      }
      if (layer === 'bonferroni') return 100 * traj.ses[i] * normInv(1 - alpha / (2 * kState)) / denom
      return 0
    }

    for (const layer of layers) {
      const area = d3.area<number>()
        .x((_d, i) => x(i + 1))
        .y0((_d, i) => y(effectPct[i] - ciWidth(layer, i)))
        .y1((_d, i) => y(effectPct[i] + ciWidth(layer, i)))
        .defined((_d, i) => i >= 5 && Number.isFinite(ciWidth(layer, i)))
      g.append('path')
        .datum(Array.from({ length: n }, (_, i) => i))
        .attr('fill', LAYER_STYLE[layer].color)
        .attr('fill-opacity', 0.12)
        .attr('stroke', LAYER_STYLE[layer].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.8)
        .attr('d', area as d3.Area<number>)
    }

    // Mean effect trajectory
    const line = d3.line<number>()
      .x((_d, i) => x(i + 1))
      .y((_d, i) => y(effectPct[i]))
    g.append('path')
      .datum(Array.from({ length: n }, (_, i) => i))
      .attr('fill', 'none').attr('stroke', '#0f172a').attr('stroke-width', 1.6)
      .attr('d', line as d3.Line<number>)
  }, [effectPct, ciHalfWidthPct, n, layers, traj, alpha, kState])

  const decision = useMemo(() => {
    if (n <= 0 || peekIndices.length === 0) return null
    for (const look of peekIndices) {
      const i = look - 1
      const lo = effectPct[i] - ciHalfWidthPct[i]
      const hi = effectPct[i] + ciHalfWidthPct[i]
      if (lo > 0 || hi < 0) return { label: 'Yes' }
    }
    return { label: 'No' }
  }, [effectPct, ciHalfWidthPct, n, peekIndices])

  return (
    <div className="bg-white border border-neutral-300 rounded-lg p-4 my-6">
      {/* Controls: baseline rate, n, alpha, effect size, K, estimated power */}
      {/* ... (see full source for complete JSX) */}

      {/* SVG plot rendered by D3 */}
      <svg ref={svgRef} viewBox="0 0 700 360" style={{ minWidth: 700, width: '100%' }} />

      {/* Decision panel, peek-probability runner, simulation notes */}
    </div>
  )
}
`;
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { InlineMath, BlockMath } from '../ui/Math'
import { BonferroniImpl } from './BonferroniImpl'
import { PocockImpl } from './PocockImpl'
import { ObfImpl } from './ObfImpl'
import { ABTestSim } from '../shared/ABTestSim'

export function Act3() {
  const [showSimCode, setShowSimCode] = useState(false)

  return (
    <div id="act3" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 3 — Alternative Methods</h2>
      <p className="text-neutral-700 mb-6">
        Three group sequential methods for controlling false positives under interim analyses,
        for teams implementing sequential monitoring without a dedicated platform.
      </p>

        {/* ── Intuition ── */}
        <div className="bg-white border border-neutral-300 rounded-lg p-5 mb-6">
          <h4 className="font-semibold mb-2">How these methods differ</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Suppose you plan to analyse your experiment at <InlineMath>{`K`}</InlineMath> pre-specified
              interim time points. Using the standard <InlineMath>{`\\alpha = 0.05`}</InlineMath> threshold
              at each analysis inflates the overall Type I error rate (Act 1).
            </p>
            <p>
              The fix: <strong>adjust the per-analysis significance level</strong> so that
              the family-wise error rate remains at <InlineMath>{`\\alpha`}</InlineMath>. The three
              methods below differ in <em>how</em> they allocate the error budget across
              the <InlineMath>{`K`}</InlineMath> analyses.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Bonferroni:</strong> equal allocation, <InlineMath>{`\\alpha/K`}</InlineMath> per analysis. Conservative because it ignores correlation across analyses.</li>
              <li><strong>Pocock:</strong> constant critical value calibrated to the joint distribution of the test statistics across analyses. Tighter than Bonferroni.</li>
              <li><strong>O&apos;Brien&ndash;Fleming:</strong> front-loaded allocation. Very strict early, nearly standard at the final analysis.</li>
            </ul>
            <p>
              Eppo&apos;s approach (Act 2) does not require pre-specifying <InlineMath>{`K`}</InlineMath> &mdash;
              it provides a continuously valid guarantee.
            </p>
          </div>
        </div>

        {/* ── Simulation Intro ── */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Simulation</h3>
          <p className="text-neutral-700 mb-3">
            This extends the Act 1/2 simulation by adding Bonferroni, Pocock, and O&apos;Brien&ndash;Fleming
            confidence intervals, so you can compare all methods under the same settings.
          </p>
        </div>

        {/* ── All Methods ── */}
        <div className="flex flex-col gap-6 mb-8">
          <Card className="bg-white border border-neutral-300">
            <CardHeader>
              <CardTitle className="text-blue-700">Method 1: Bonferroni</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                The simplest correction. Divide <InlineMath>{`\\alpha`}</InlineMath> by{' '}
                <InlineMath>{`K`}</InlineMath>. One line of code.
              </p>
            </CardContent>
            <BonferroniImpl />
          </Card>
          <Card className="bg-white border border-neutral-300">
            <CardHeader>
              <CardTitle className="text-orange-700">Method 2: <a href="#ref-pocock-1977" className="text-blue-600 hover:text-blue-800">Pocock (1977)</a></CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Constant critical boundary. Tighter than Bonferroni by exploiting correlation.
              </p>
            </CardContent>
            <PocockImpl />
          </Card>
          <Card className="bg-white border border-neutral-300">
            <CardHeader>
              <CardTitle className="text-blue-700">Method 3: <a href="#ref-obrien-fleming-1979" className="text-blue-600 hover:text-blue-800">O'Brien–Fleming (1979)</a></CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Decreasing threshold. Nearly no penalty at the final analysis.
              </p>
            </CardContent>
            <ObfImpl />
          </Card>
        </div>


        {/* ── Simulation: Share crossing each threshold ── */}
        <h4 className="font-semibold mb-2">How methods compare in simulation</h4>
        <div className="mb-10">
          <ABTestSim
            layers={['fixed-ci', 'sequential-ci', 'pocock', 'obf', 'bonferroni']}
            showPeekStats
            simulationTitle="Simulation 3: fixed-horizon, Eppo, and three alternative sequential methods."
            defaultEffect={0}
            takeaway={<>
              <strong>Result interpretation:</strong> click &ldquo;Run 1000 repetitions&rdquo; to estimate how often each method crosses significance under the current settings.<br /><br />
              <strong>Bonferroni:</strong> most conservative among the three DIY methods (lowest crossing share).<br />
              <strong>Pocock:</strong> less conservative than Bonferroni with the same threshold at each look.<br />
              <strong>O&apos;Brien&ndash;Fleming:</strong> very strict early, then close to classical thresholds at later looks.<br />
              <strong>Sequential confidence interval (Eppo):</strong> anytime-valid and typically conservative in this setup.
            </>}
          />
        </div>

        {/* ── Head-to-Head Comparison ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Comparison</h3>
        <div className="overflow-x-auto mb-6">
          <p className="text-xs text-neutral-500 mb-2">
            The confidence interval width rows below are illustrative values for <InlineMath>{`K = 4`}</InlineMath>, independent of the slider above.
          </p>
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"></th>
                <th className="border border-neutral-300 p-3 font-semibold text-blue-700">Bonferroni</th>
                <th className="border border-neutral-300 p-3 font-semibold text-orange-700">Pocock</th>
                <th className="border border-neutral-300 p-3 font-semibold text-blue-700">OBF</th>
                <th className="border border-neutral-300 p-3 font-semibold text-green-700">Eppo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Pre-specify K?</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Threshold type</td>
                <td className="border border-neutral-300 p-3 text-center">Constant</td>
                <td className="border border-neutral-300 p-3 text-center">Constant</td>
                <td className="border border-neutral-300 p-3 text-center">Decreasing</td>
                <td className="border border-neutral-300 p-3 text-center">Continuous</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Confidence interval at peek 1 (K=4)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.50 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.36 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`4.05 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`{\\sim}3.8 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Confidence interval at final analysis (K=4)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.50 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.36 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.02 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`{\\sim}2.3 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Valid between peeks?</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Variance reduction?</td>
                <td className="border border-neutral-300 p-3 text-center">Manual</td>
                <td className="border border-neutral-300 p-3 text-center">Manual</td>
                <td className="border border-neutral-300 p-3 text-center">Manual</td>
                <td className="border border-neutral-300 p-3 text-center">Built-in</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Implementation</td>
                <td className="border border-neutral-300 p-3 text-center">1 line</td>
                <td className="border border-neutral-300 p-3 text-center">Lookup table</td>
                <td className="border border-neutral-300 p-3 text-center">Formula</td>
                <td className="border border-neutral-300 p-3 text-center">Platform</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Key Takeaway ── */}
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p><strong>Which method to use:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Closest to Eppo in these simulations:</strong> Pocock is usually the best match among the DIY options.</li>
              <li><strong>Avoid over-correction:</strong> Bonferroni is often too conservative, reducing sensitivity more than needed.</li>
              <li><strong>Avoid early over-triggering:</strong> O&apos;Brien&ndash;Fleming can produce too many early significant crossings in this setup.</li>
              <li><strong>Practical recommendation:</strong> if you are choosing one DIY method for this workflow, use Pocock.</li>
            </ul>
            <p>
              <strong>Timing insight:</strong> the method choice matters most at the beginning of tests, when monitoring is mostly for implementation issues. As sample size grows, interval widths become more similar across methods.
            </p>
          </div>
        </div>

        {/* ── Hybrid Without Eppo ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
          Implementing the Hybrid Approach Without Eppo
        </h3>

        <p className="mb-4 text-neutral-700">
          Act 2 introduced the hybrid approach: sequential confidence interval on guardrail KPIs for early
          abort, standard confidence interval on the primary KPI at the planned end date. Below is how to
          implement it using any of the three correction methods above.
        </p>

        <h4 className="text-lg font-bold text-neutral-900 mb-3">Step 1: Classify your metrics</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Category</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Examples</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Testing method</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3">Primary KPI</td>
                <td className="border border-neutral-300 p-3">Conversion rate, sign-ups</td>
                <td className="border border-neutral-300 p-3">Fixed-horizon (<InlineMath>{`z = 1.96`}</InlineMath>)</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">Guardrail KPIs</td>
                <td className="border border-neutral-300 p-3">Revenue, error rate, latency, crash rate</td>
                <td className="border border-neutral-300 p-3">Sequential (any of the 3 methods)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-neutral-900 mb-3">Step 2: Set guardrail significance levels</h4>
        <p className="mb-2 text-neutral-700">
          If you have <InlineMath>{`G`}</InlineMath> guardrail KPIs, set{' '}
          <InlineMath>{`\\alpha_{\\text{guardrail}} = \\alpha / G`}</InlineMath> for each one.
        </p>
        <p className="mb-2 text-neutral-700">
          <strong>Example:</strong> 3 guardrails (<InlineMath>{`G = 3`}</InlineMath>),{' '}
          <InlineMath>{`\\alpha = 0.05`}</InlineMath>, 4 weekly peeks (<InlineMath>{`K = 4`}</InlineMath>):
        </p>
        <BlockMath>{`\\alpha_{\\text{per guardrail}} = \\frac{0.05}{3} \\approx 0.0167`}</BlockMath>
        <p className="mb-2 text-neutral-700">
          Then apply Bonferroni within each guardrail:
        </p>
        <BlockMath>{`z^* = \\Phi^{-1}\\!\\bigl(1 - \\tfrac{0.0167}{2 \\times 4}\\bigr) = \\Phi^{-1}(0.9979) \\approx 2.86`}</BlockMath>

        <h4 className="text-lg font-bold text-neutral-900 mb-3 mt-6">Step 3: Run the experiment</h4>
        <p className="mb-2 text-neutral-700">At each scheduled peek:</p>
        <ol className="list-decimal list-inside ml-4 mb-4 text-neutral-700 space-y-1">
          <li>For <strong>each guardrail KPI</strong>: compute the confidence interval using your chosen sequential method.</li>
          <li>If <strong>any</strong> guardrail confidence interval is entirely on the harmful side of zero: <span className="text-amber-600 font-bold">ABORT</span> the experiment.</li>
          <li>Otherwise: continue.</li>
        </ol>

        <p className="mb-2 text-neutral-700">At the <strong>end</strong> of the experiment:</p>
        <ol className="list-decimal list-inside ml-4 mb-4 text-neutral-700 space-y-1">
          <li>For the <strong>primary KPI</strong>: compute a standard confidence interval with the full <InlineMath>{`\\alpha`}</InlineMath>:</li>
        </ol>
        <BlockMath>{`\\text{CI}_{\\text{primary}} = \\hat{\\tau} \\;\\pm\\; z_{\\alpha/2} \\cdot \\text{SE}`}</BlockMath>
        <p className="mb-6 text-neutral-700">
          <span className="text-green-700 font-bold">SHIP</span> if the confidence interval excludes zero.
          Otherwise: no significant effect.
        </p>

        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-2">
            <p><strong>The hybrid approach without Eppo:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Apply Bonferroni across your <InlineMath>{`G`}</InlineMath> guardrail KPIs: <InlineMath>{`\\alpha_g = \\alpha / G`}</InlineMath>.</li>
              <li>Within each guardrail, use O&apos;Brien&ndash;Fleming (best) or Bonferroni (simplest).</li>
              <li>Test the primary KPI once at the end with a standard confidence interval &mdash; no correction needed.</li>
              <li><strong>This is the recommended approach for teams without a sequential testing platform.</strong></li>
            </ul>
          </div>
        </div>

        {/* ── Appendix ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Appendix</h3>
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowSimCode(v => !v)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Show the code of the simulations
          </button>
          {showSimCode && (
            <div className="mt-3">
              <p className="text-sm text-neutral-600 mb-2">
                All three simulations on this page use the same component:{' '}
                <code className="bg-neutral-200 rounded px-1">ABTestSim.tsx</code>. It is called
                with different <code className="bg-neutral-200 rounded px-1">layers</code> props
                (Act 1: fixed-ci only; Act 2: fixed-ci + sequential-ci; Act 3: all five methods).
                The full TypeScript source is shown below.
              </p>
              <pre className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre">
                {SIM_CODE}
              </pre>
            </div>
          )}
        </div>

        {/* (Removed duplicate CoinFlipMeanSim simulation; see ABTestSim block above) */}
    </div>
  )
}
