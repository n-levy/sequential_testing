"use client";
import React, { useState } from 'react';

// Key extract of the shared simulation component (ABTestSim.tsx) showing the layer definitions.
const SIM_CODE = `// Layer type definition — all supported confidence interval methods:
export type SimLayer =
  | 'fixed-ci'       // Standard fixed-horizon 95% confidence interval
  | 'sequential-ci'  // Sequential confidence interval (Eppo / Howard et al.)
  | 'pocock'         // Pocock group-sequential boundary
  | 'obf'            // O'Brien–Fleming group-sequential boundary
  | 'bonferroni'     // Bonferroni correction (alpha/K per look)
  | 'harm-detect'    // Guardrail harm detection (one-sided, z = 3.0)

// Legend labels and colours for each layer:
const LAYER_STYLE = {
  'fixed-ci':      { color: '#ef4444', label: 'Standard 95% confidence interval' },
  'sequential-ci': { color: '#2563eb', label: 'Sequential confidence interval (Eppo)' },
  'pocock':        { color: '#f59e0b', label: 'Pocock' },
  'obf':           { color: '#1d4ed8', label: "O'Brien–Fleming" },
  'bonferroni':    { color: '#0d9488', label: 'Bonferroni' },
  'harm-detect':   { color: '#dc2626', label: 'Guardrail harm detection (3 SD)' },
}

// Harm-detect stopping is one-sided: only fires when the CI upper bound is below zero.
// For all other methods, stopping is two-sided (CI excludes zero on either side).
const isCross = layer === 'harm-detect'
  ? (est + w < 0)                    // upper bound below zero => harm
  : (est - w > 0 || est + w < 0)     // CI excludes zero (two-sided)
`;
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { InlineMath, BlockMath } from '../ui/Math'
import { BonferroniImpl } from './BonferroniImpl'
import { PocockImpl } from './PocockImpl'
import { ObfImpl } from './ObfImpl'
import { HarmDetectionImpl } from './HarmDetectionImpl'
import { ABTestSim } from '../shared/ABTestSim'

export function Act4() {
  const [showSimCode, setShowSimCode] = useState(false)

  return (
    <div id="act4" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 4 — Alternative Methods</h2>
      <p className="text-neutral-700 mb-6">
        Three group sequential methods for controlling false positives under interim analyses,
        plus a one-sided guardrail harm detection rule — for teams implementing sequential
        monitoring without a dedicated platform.
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
              <li><strong>Harm detection (3 SD):</strong> a one-sided guardrail rule using a fixed critical value of <InlineMath>{`z = 3.0`}</InlineMath>. Stops only when the effect is more than 3 SDs in the harmful direction. Does not formally control the family-wise error rate, but is very conservative in practice.</li>
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
            This extends the Act 1/2 simulation by adding Bonferroni, Pocock, O&apos;Brien&ndash;Fleming,
            and the 3 SD rule confidence intervals, so you can compare all methods under the same settings.
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
              <CardTitle className="text-neutral-900">Method 2: <a href="#ref-pocock-1977" className="text-blue-600 hover:text-blue-800">Pocock (1977)</a></CardTitle>
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
          <Card className="bg-white border border-neutral-300">
            <CardHeader>
              <CardTitle className="text-red-700">Method 4: Guardrail Harm Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                One-sided guardrail rule: stop only if the effect is more than 3 SDs in the harmful direction. Fixed critical value, no pre-specification of K required.
              </p>
            </CardContent>
            <HarmDetectionImpl />
          </Card>
        </div>


        {/* ── Simulation: Share crossing each threshold ── */}
        <h4 className="font-semibold mb-2">How methods compare in simulation</h4>
        <div className="mb-10">
          <ABTestSim
            layers={['fixed-ci', 'sequential-ci', 'pocock', 'obf', 'bonferroni', 'harm-detect']}
            showPeekStats
            simulationTitle="Simulation 4: fixed-horizon, Eppo, three group-sequential methods, and guardrail harm detection."
            defaultEffect={0}
            takeaway={<>
              <strong>Result interpretation:</strong> click &ldquo;Run 1000 repetitions&rdquo; to estimate how often each method crosses the threshold under the current settings.<br /><br />
              <strong>Bonferroni:</strong> most conservative among the formal methods (lowest crossing share).<br />
              <strong>Pocock:</strong> less conservative than Bonferroni; calibrated to the joint distribution across K analyses.<br />
              <strong>O&apos;Brien&ndash;Fleming:</strong> very strict early, close to classical at the final analysis.<br />
              <strong>Harm detection:</strong> one-sided — only fires when the effect is strongly negative. Under a null with no true harm, it rarely triggers regardless of K.<br />
              <strong>Sequential confidence interval (Eppo):</strong> anytime-valid and typically close to 5% under continuous monitoring.
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
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Bonferroni</th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Pocock</th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">OBF</th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Harm detection</th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Eppo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Pre-specify K?</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Threshold type</td>
                <td className="border border-neutral-300 p-3 text-center">Constant</td>
                <td className="border border-neutral-300 p-3 text-center">Constant</td>
                <td className="border border-neutral-300 p-3 text-center">Decreasing</td>
                <td className="border border-neutral-300 p-3 text-center">One-sided (z=3.0)</td>
                <td className="border border-neutral-300 p-3 text-center">Continuous</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Confidence interval at peek 1 (K=4)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.50 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.36 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`4.05 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`3.00 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`{\\sim}2.7 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Confidence interval at final analysis (K=4)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.50 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.36 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.02 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`3.00 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`{\\sim}2.4 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Valid between peeks?</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Formal FWER control?</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
                <td className="border border-neutral-300 p-3 text-center">Yes (anytime)</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Variance reduction?</td>
                <td className="border border-neutral-300 p-3 text-center">Manual</td>
                <td className="border border-neutral-300 p-3 text-center">Manual</td>
                <td className="border border-neutral-300 p-3 text-center">Manual</td>
                <td className="border border-neutral-300 p-3 text-center">Manual</td>
                <td className="border border-neutral-300 p-3 text-center">Built-in</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Implementation</td>
                <td className="border border-neutral-300 p-3 text-center">1 line</td>
                <td className="border border-neutral-300 p-3 text-center">Lookup table</td>
                <td className="border border-neutral-300 p-3 text-center">Formula</td>
                <td className="border border-neutral-300 p-3 text-center">1 line</td>
                <td className="border border-neutral-300 p-3 text-center">Platform</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Purpose</td>
                <td className="border border-neutral-300 p-3 text-center">General (two-sided)</td>
                <td className="border border-neutral-300 p-3 text-center">General (two-sided)</td>
                <td className="border border-neutral-300 p-3 text-center">General (two-sided)</td>
                <td className="border border-neutral-300 p-3 text-center">Guardrail only</td>
                <td className="border border-neutral-300 p-3 text-center">General (anytime)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Key Takeaway ── */}
        <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p><strong>Which method to use:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Closest to Eppo in these simulations:</strong> in the conditions of this simulation, Pocock seems like the most reasonable choice among the alternative methods.</li>
              <li><strong>Avoid over-correction:</strong> Bonferroni is often too conservative, reducing sensitivity more than needed.</li>
              <li><strong>Avoid early over-triggering:</strong> O&apos;Brien&ndash;Fleming is very conservative early, so early stopping is rare in this setup.</li>
              <li><strong>Harm detection is not a substitute for a two-sided method:</strong> it is a one-sided guardrail rule only. Because it stops only for harm, it will never flag a beneficial effect as significant. Use it as a safety net alongside a primary analysis, not as the primary analysis itself.</li>
            </ul>
            <p>
              That said, we recommend running simulations, A/A tests, or analysing historical tests in each domain, using its specific circumstances (i.e. KPIs and their standard deviations) before deciding which alternative method to use in each domain.
            </p>
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
          Act 3 introduced the hybrid approach: sequential confidence interval on guardrail KPIs for early
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
          <li>If <strong>any</strong> guardrail confidence interval is entirely on the harmful side of zero: <span className="text-blue-700 font-bold">ABORT</span> the experiment.</li>
          <li>Otherwise: continue.</li>
        </ol>

        <p className="mb-2 text-neutral-700">At the <strong>end</strong> of the experiment:</p>
        <ol className="list-decimal list-inside ml-4 mb-4 text-neutral-700 space-y-1">
          <li>For the <strong>primary KPI</strong>: compute a standard confidence interval with the full <InlineMath>{`\\alpha`}</InlineMath>:</li>
        </ol>
        <BlockMath>{`\\text{CI}_{\\text{primary}} = \\hat{\\tau} \\;\\pm\\; z_{\\alpha/2} \\cdot \\text{SE}`}</BlockMath>
        <p className="mb-6 text-neutral-700">
          <span className="text-blue-700 font-bold">SHIP</span> if the confidence interval excludes zero.
          Otherwise: no significant effect.
        </p>

        <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
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
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200"
          >
            Show the code of the simulations
          </button>
          {showSimCode && (
            <div className="mt-3">
              <p className="text-sm text-neutral-600 mb-2">
                All simulations on this page use the shared{' '}
                <code className="bg-neutral-200 rounded px-1">ABTestSim.tsx</code> component, called
                with different <code className="bg-neutral-200 rounded px-1">layers</code> props
                (Act 1: <code className="bg-neutral-200 rounded px-1">fixed-ci</code>; Act 2:{' '}
                <code className="bg-neutral-200 rounded px-1">fixed-ci, sequential-ci</code>; Act 4: all five methods).
                The key layer definitions and stopping logic are shown below.
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
