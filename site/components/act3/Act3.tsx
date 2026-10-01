"use client";
import React, { useState, useEffect } from 'react';

// Key extract of the shared simulation component (ABTestSim.tsx) showing the layer definitions.
const SIM_CODE = `// Layer type definition — all supported confidence interval methods:
export type SimLayer =
  | 'fixed-ci'       // Standard fixed-horizon 95% confidence interval
  | 'sequential-ci'  // Sequential confidence interval (Eppo / Howard et al.)
  | 'pocock'         // Pocock group-sequential boundary
  | 'obf'            // O'Brien–Fleming group-sequential boundary
  | 'bonferroni'     // Bonferroni correction (alpha/K per look)
  | 'harm-detect'    // Three Standard Deviations (one-sided, z = 3.0)

// Legend labels and colours for each layer:
const LAYER_STYLE = {
  'fixed-ci':      { color: '#ef4444', label: 'Standard 95% confidence interval' },
  'sequential-ci': { color: '#2563eb', label: 'Sequential confidence interval (Eppo)' },
  'pocock':        { color: '#f59e0b', label: 'Pocock' },
  'obf':           { color: '#1d4ed8', label: "O'Brien–Fleming" },
  'bonferroni':    { color: '#0d9488', label: 'Bonferroni' },
  'harm-detect':   { color: '#dc2626', label: 'Three Standard Deviations (one-sided)' },
}

// Harm-detect stopping is one-sided: only fires when the CI upper bound is below zero.
// For all other methods, stopping is two-sided (CI excludes zero on either side).
const isCross = layer === 'harm-detect'
  ? (est + w < 0)                    // upper bound below zero => harm
  : (est - w > 0 || est + w < 0)     // CI excludes zero (two-sided)
`;
import { Card } from '../ui/Card'
import { InlineMath, BlockMath } from '../ui/Math'
import { BonferroniImpl } from './BonferroniImpl'
import { PocockImpl } from './PocockImpl'
import { ObfImpl } from './ObfImpl'
import { HarmDetectionImpl } from './HarmDetectionImpl'
import { ABTestSim, type SimLayer } from '../shared/ABTestSim'

const ALL_LAYERS: SimLayer[] = ['fixed-ci', 'sequential-ci', 'pocock', 'obf', 'bonferroni', 'harm-detect']
const LAYER_META: Record<SimLayer, { label: string; color: string }> = {
  'fixed-ci':      { label: 'Standard CI (fixed-horizon)',          color: '#ef4444' },
  'sequential-ci': { label: 'Sequential CI (Eppo)',           color: '#2563eb' },
  'pocock':        { label: 'Pocock',                               color: '#f59e0b' },
  'obf':           { label: "O'Brien–Fleming",                      color: '#1d4ed8' },
  'bonferroni':    { label: 'Bonferroni',                           color: '#0d9488' },
  'harm-detect':   { label: 'Three SD',                            color: '#7c3aed' },
  'hybrid-split':  { label: 'Hybrid with harm-only interim monitoring', color: '#0369a1' },
}

export function Act4() {
  const [showSimCode, setShowSimCode] = useState(false)
  const [selectedLayers, setSelectedLayers] = useState<Set<SimLayer>>(new Set(ALL_LAYERS))

  const toggleLayer = (layer: SimLayer) => {
    setSelectedLayers(prev => {
      const next = new Set(prev)
      if (next.has(layer)) { next.delete(layer) } else { next.add(layer) }
      return next
    })
  }

  const activeLayers = ALL_LAYERS.filter(l => selectedLayers.has(l))

  useEffect(() => {
    const handler = () => setShowSimCode(true)
    window.addEventListener('show-all-content', handler)
    return () => window.removeEventListener('show-all-content', handler)
  }, [])

  return (
    <div id="act4" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 4: Alternative Methods</h2>
      <p className="text-neutral-700 mb-6">
        Three group sequential methods for controlling false positives under interim analyses,
        plus the Three Standard Deviations one-sided guardrail rule, for teams implementing
        sequential monitoring without a dedicated platform.
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
              <li><strong>Three Standard Deviations:</strong> a one-sided guardrail rule using a fixed critical value of <InlineMath>{`z = 3.0`}</InlineMath>. Stops only when the effect is more than 3 SDs in the harmful direction. Does not formally control the family-wise error rate, but is very conservative in practice.</li>
            </ul>
            <p>
              Eppo&apos;s (2022) approach (Act 2) does not require pre-specifying <InlineMath>{`K`}</InlineMath> &mdash;
              it provides a continuously valid guarantee.
            </p>
          </div>
        </div>

        {/* ── All Methods ── */}
        <div className="flex flex-col gap-6 mb-8">
          <Card id="act4-bonferroni" className="bg-white border border-neutral-300">
            <BonferroniImpl />
          </Card>
          <Card id="act4-pocock" className="bg-white border border-neutral-300">
            <PocockImpl />
          </Card>
          <Card id="act4-obf" className="bg-white border border-neutral-300">
            <ObfImpl />
          </Card>
          <Card id="act4-harm" className="bg-white border border-neutral-300">
            <HarmDetectionImpl />
          </Card>
        </div>


        {/* ── Simulation: Share crossing each threshold ── */}
        <div id="act4-sim" className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Simulation</h3>
          <p className="text-neutral-700 mb-3">
            This extends the Act 1/2 simulation by adding Bonferroni, Pocock, O&apos;Brien&ndash;Fleming,
            and the Three Standard Deviations rule, so you can compare all methods under the same settings.
          </p>
        </div>

        {/* Method checkboxes */}
        <div className="bg-white border border-neutral-300 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-neutral-700 mb-2">Methods to include:</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {ALL_LAYERS.map(layer => (
              <label key={layer} className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={selectedLayers.has(layer)}
                  onChange={() => toggleLayer(layer)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: LAYER_META[layer].color }}
                />
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: LAYER_META[layer].color }}
                />
                {LAYER_META[layer].label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <ABTestSim
            layers={activeLayers.length > 0 ? activeLayers : ['fixed-ci']}
            showPeekStats
            showDecision={false}
            K={14}
            simulationTitle="Simulation 4: false positive rate across methods under the current settings."
            defaultEffect={0}
            takeaway={<>
              <strong>Result interpretation:</strong> click &ldquo;Run 1,000 repetitions&rdquo; to estimate how often each method crosses the threshold under the current settings.<br /><br />
              <strong>Bonferroni:</strong> most conservative among the formal methods (lowest crossing share).<br />
              <strong>Pocock:</strong> less conservative than Bonferroni; calibrated to the joint distribution across K analyses.<br />
              <strong>O&apos;Brien&ndash;Fleming:</strong> very strict early, close to classical at the final analysis.<br />
              <strong>Three Standard Deviations:</strong> one-sided, only fires when the effect is strongly negative (z &lt; −3.0). Under a null with no true harm, it rarely triggers regardless of K.<br />
              <strong>Sequential CI (Eppo):</strong> anytime-valid on the harm tail; nominal false harm-alarm rate ≤2.5% under continuous monitoring, but in our simulations the realised rate is well below its budget (≈0.5% at 14 peeks) &mdash; the price of remaining valid for any number and timing of peeks. Among the valid rules it therefore has the lowest power to detect harm during the test (see Comparison below); harm not caught early is still visible at the planned end.
            </>}
          />
        </div>

        {/* ── Head-to-Head Comparison ── */}
        <h3 id="act4-comparison" className="text-2xl font-bold text-neutral-900 mb-4">Comparison</h3>
        <div className="overflow-x-auto mb-6">
          <p className="text-xs text-neutral-500 mb-2">
            The confidence interval width and harm-detection rows below use this site&apos;s default simulation settings
            (<InlineMath>{`n=10{,}000`}</InlineMath> per arm, 10% baseline conversion, <InlineMath>{`K = 14`}</InlineMath> equally
            spaced peeks), independent of the slider above. Pocock and O&apos;Brien&ndash;Fleming constants are calibrated
            (by simulation) to a 2.5% harm-tail error rate at exactly these settings; they are not recalibrated if you
            change K or the sample size elsewhere on this page. The companion guideline runs the same simulations at a
            larger <InlineMath>{`n = 100{,}000`}</InlineMath>; see the Python repo linked from the simulation-code
            section.
          </p>
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"></th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Bonferroni</th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Pocock</th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">OBF</th>
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Three SD</th>
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
                <td className="border border-neutral-300 p-3 font-medium">Critical value at first peek (K=14)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.91 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.62 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`7.88 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`3.00 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`4.22 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Critical value at planned end (K=14)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.91 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.62 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.11 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`3.00 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`3.04 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">False harm alarm rate (true effect 0%, K=14)</td>
                <td className="border border-neutral-300 p-3 text-center">1.1%</td>
                <td className="border border-neutral-300 p-3 text-center">2.5%</td>
                <td className="border border-neutral-300 p-3 text-center">2.7%</td>
                <td className="border border-neutral-300 p-3 text-center">0.9%</td>
                <td className="border border-neutral-300 p-3 text-center">0.5%</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Harm detected (true effect −10%, K=14)</td>
                <td className="border border-neutral-300 p-3 text-center">40.9%</td>
                <td className="border border-neutral-300 p-3 text-center">53.5%</td>
                <td className="border border-neutral-300 p-3 text-center">65.9%</td>
                <td className="border border-neutral-300 p-3 text-center">37.2%</td>
                <td className="border border-neutral-300 p-3 text-center">34.6%</td>
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
          <p className="text-xs text-neutral-500 mt-2">
            Eppo&apos;s sequential CI has the lowest harm-detection rate among the valid rules above: this is the price of
            remaining valid for any number and timing of peeks, and of being available directly in the platform. Methods
            with a fixed peek schedule (Bonferroni, Pocock, O&apos;Brien&ndash;Fleming) detect more harm during the test, but
            they require pre-specifying K and are not available in Eppo itself.
          </p>
        </div>

        {/* ── Key Takeaway ── */}
        <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p><strong>Which method to use:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Eppo&apos;s sequential CI has the lowest harm-detection rate</strong> among the valid rules here (see Comparison above): the price of remaining valid for any number and timing of peeks, and of being available directly in the platform. If you have Eppo, use it; the alternatives below matter mainly when a fixed peek schedule can be pre-specified and Eppo is not available.</li>
              <li><strong>Avoid over-correction:</strong> Bonferroni is often too conservative, reducing sensitivity more than needed.</li>
              <li><strong>O&apos;Brien&ndash;Fleming detects harm earliest by the planned end</strong> among the fixed-schedule methods in this simulation, at the cost of being very conservative early.</li>
              <li><strong>Three Standard Deviations is not a substitute for a two-sided method:</strong> it is a one-sided guardrail rule only. Because it stops only for harm, it will never flag a beneficial effect as significant. Use it as a safety net alongside a primary analysis, not as the primary analysis itself.</li>
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
        <h3 id="act4-hybrid-impl" className="text-2xl font-bold text-neutral-900 mb-4">
          Implementing Harm-Only Interim Monitoring Without Eppo
        </h3>

        <p className="mb-4 text-neutral-700">
          Act 3 introduced the hybrid design with harm-only interim monitoring: a sequential confidence interval on
          guardrail KPIs for early abort, and a standard confidence interval on the primary KPI at the planned end date.
          Below is how to implement it using any of the three group-sequential methods above.
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

        <h4 className="text-lg font-bold text-neutral-900 mb-3">Step 2: Choose a low number of guardrail KPIs</h4>
        <p className="mb-2 text-neutral-700">
          Every guardrail KPI monitored for harm is another opportunity for a false harm alarm. With <InlineMath>{`J`}</InlineMath> guardrail
          KPIs, each monitored with its own per-KPI error budget (say 2.5%), the chance of at least one false alarm across the
          whole experiment is at most <InlineMath>{`J \\times 2.5\\%`}</InlineMath> whatever the dependence between them (Boole&apos;s
          inequality), and <InlineMath>{`1 - 0.975^J`}</InlineMath> when they are independent. This is a per-KPI budget, not a
          single experiment-wide rate: with several correlated guardrails the real joint rate is usually well below the bound, but
          highly correlated KPIs still each add another opportunity for a false alarm without adding much distinct information
          about harm.
        </p>
        <p className="mb-2 text-neutral-700">
          We do not recommend a specific multiple-testing correction (such as splitting <InlineMath>{`\\alpha`}</InlineMath> equally
          across guardrails) or a specific number of KPIs. Instead: choose a low number of guardrail KPIs that capture distinct
          kinds of harm, and decide which KPIs will be used for the early-stopping decision before the test begins.
        </p>

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
            <p><strong>Harm-only interim monitoring without Eppo:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Choose a low number of guardrail KPIs that capture distinct kinds of harm (Step 2 above); do not add or remove them based on interim results.</li>
              <li>Within each guardrail, use O&apos;Brien&ndash;Fleming (best power) or Bonferroni (simplest) as a harm-only, one-sided rule.</li>
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
