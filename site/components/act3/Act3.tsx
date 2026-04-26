"use client";
import React, { useState } from 'react';
import { EppoFPRReport } from './EppoFPRReport'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { InlineMath, BlockMath } from '../ui/Math'
import { BonferroniImpl } from './BonferroniImpl'
import { PocockImpl } from './PocockImpl'
import { ObfImpl } from './ObfImpl'
import { CoinFlipMeanSim } from '../shared/CoinFlipMeanSim'

export function Act3() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [K, setK] = useState(6)

  return (
    <section id="act3" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 3 &mdash; Alternative Methods
          </h2>
          <p className="text-neutral-600">
            Three group sequential methods for controlling the family-wise error rate
            under interim analyses, implementable without a dedicated platform.
          </p>
        </div>

        {/* ── Intuition ── */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
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

        {/* ── K slider ── */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Number of planned analyses (K): <span className="font-mono">{K}</span>
          </label>
          <input
            type="range" min={2} max={20} step={1}
            value={K} onChange={e => setK(Number(e.target.value))}
            className="w-full max-w-xs"
          />
        </div>

        {/* ── All Methods ── */}
        <div className="flex flex-col gap-6 mb-8">
          <Card className="bg-blue-50">
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
          <Card className="bg-orange-50">
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
          <Card className="bg-blue-50">
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
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Simulation: Share Crossing Each Threshold</h3>
        <div className="mb-10">
          <CoinFlipMeanSim
            layers={['fixed-ci', 'sequential-ci', 'pocock', 'obf', 'bonferroni']}
            defaultBias={0}
            K={K}
            takeaway={<>
              Simulation takeaway. For each method, this shows the share of 500 simulated tests that crossed the respective threshold at any point. When bias = 0, this is an A/A test; otherwise, it shows the probability of crossing under the simulated bias.<br /><br />
              Note: The Eppo/Howard sequential CI is very conservative in this setting, with a type I error rate often well below 1%. One of the group sequential alternatives, especially O'Brien–Fleming or Pocock, may be a better choice for most practical A/B tests, as they are not overly conservative and still control the error rate under peeking.
            </>}
          />
        </div>

        {/* ── Head-to-Head Comparison ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Comparison</h3>
        <div className="overflow-x-auto mb-6">
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
                <td className="border border-neutral-300 p-3 font-medium">CI at peek 1 (K=4)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.50 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.36 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`4.05 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`{\\sim}3.8 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">CI at final analysis (K=4)</td>
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
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-10">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p><strong>Which method to use:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Minimal implementation effort:</strong> Bonferroni. Replace 1.96 with{' '}
                <InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath>.</li>
              <li><strong>Best efficiency at the final analysis:</strong> O&apos;Brien&ndash;Fleming.
                The final-analysis critical value is within 3% of the unadjusted value, but
                requires pre-specifying <InlineMath>{`K`}</InlineMath>.</li>
              <li><strong>Continuous monitoring or built-in variance reduction:</strong> Use Eppo
                or an equivalent platform.</li>
            </ul>
            <p>
              <strong>Bottom line:</strong> even the simplest correction (Bonferroni) eliminates
              the bulk of the peeking-induced inflation. Any correction is vastly better than
              none.
            </p>
          </div>
        </div>

        {/* ── Hybrid Without Eppo ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
          Implementing the Hybrid Approach Without Eppo
        </h3>

        <p className="mb-4 text-neutral-700">
          Act 2 introduced the hybrid approach: sequential CI on guardrail KPIs for early
          abort, standard CI on the primary KPI at the planned end date. Below is how to
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
          <li>For <strong>each guardrail KPI</strong>: compute the CI using your chosen sequential method.</li>
          <li>If <strong>any</strong> guardrail CI is entirely on the harmful side of zero: <span className="text-amber-600 font-bold">ABORT</span> the experiment.</li>
          <li>Otherwise: continue.</li>
        </ol>

        <p className="mb-2 text-neutral-700">At the <strong>end</strong> of the experiment:</p>
        <ol className="list-decimal list-inside ml-4 mb-4 text-neutral-700 space-y-1">
          <li>For the <strong>primary KPI</strong>: compute a standard CI with the full <InlineMath>{`\\alpha`}</InlineMath>:</li>
        </ol>
        <BlockMath>{`\\text{CI}_{\\text{primary}} = \\hat{\\tau} \\;\\pm\\; z_{\\alpha/2} \\cdot \\text{SE}`}</BlockMath>
        <p className="mb-6 text-neutral-700">
          <span className="text-green-700 font-bold">SHIP</span> if the CI excludes zero.
          Otherwise: no significant effect.
        </p>

        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-2">
            <p><strong>The hybrid approach without Eppo:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Apply Bonferroni across your <InlineMath>{`G`}</InlineMath> guardrail KPIs: <InlineMath>{`\\alpha_g = \\alpha / G`}</InlineMath>.</li>
              <li>Within each guardrail, use O&apos;Brien&ndash;Fleming (best) or Bonferroni (simplest).</li>
              <li>Test the primary KPI once at the end with a standard CI &mdash; no correction needed.</li>
              <li><strong>This is the recommended approach for teams without a sequential testing platform.</strong></li>
            </ul>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-400 rounded-lg p-6 mb-2">
          <h4 className="font-bold text-orange-900 mb-2">Simulation &mdash; All Methods Side by Side</h4>
          <p className="text-neutral-800">
            The coin bias is fixed at 0 (fair coin). The same coin-flip example, now with all three group-sequential bands
            (Pocock, O&apos;Brien&ndash;Fleming, Bonferroni) drawn alongside Eppo&apos;s
            sequential CI and the standard fixed-n CI. Compare how wide each method
            is at every step.
          </p>
        </div>

        <CoinFlipMeanSim
          layers={['fixed-ci', 'sequential-ci', 'pocock', 'obf', 'bonferroni']}
          showPeekStats
          K={K}
          takeaway={
            <>
              <strong>Simulation takeaway.</strong> The standard CI (red) is the
              narrowest but its peeking guarantee is broken. Eppo&apos;s sequential CI
              (blue) is the tightest valid band for continuous monitoring. Among the
              DIY methods, O&apos;Brien&ndash;Fleming is conservative early and tight at the final analysis.
              <br />
              <span className="block mt-2 text-blue-900 text-sm">
                <strong>Share of false positives in 500 runs using sequential testing (Eppo approach):</strong>
                (see stat box below)
              </span>
            </>
          }
        />
      </div>
    </section>
  )
}