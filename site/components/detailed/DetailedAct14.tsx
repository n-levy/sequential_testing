'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { ABTestSim } from '../shared/ABTestSim'

export function DetailedAct14() {
  return (
    <section id="act-14" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 14 &mdash; Alternative Methods
          </h2>
        </div>

        {/* Intuition */}
        <div className="bg-white border border-neutral-300 rounded-lg p-5 mb-8">
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
              Eppo&apos;s (2022) approach (Acts 8&ndash;9) does not require pre-specifying <InlineMath>{`K`}</InlineMath> &mdash;
              it provides a continuously valid guarantee.
            </p>
          </div>
        </div>

        {/* Method 1: Bonferroni */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Method 1: Bonferroni Correction (Simplest)</h3>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Before the experiment starts, commit to checking exactly <InlineMath>{`K`}</InlineMath> times.
            At each check, use a significance level of <InlineMath>{`\\alpha/K`}</InlineMath> instead
            of <InlineMath>{`\\alpha`}</InlineMath>.
          </p>
          <BlockMath>{`\\text{CI}_k = \\hat{\\tau}(t_k) \\pm \\hat{\\sigma}_{\\hat{\\tau}}(t_k) \\cdot z_{\\alpha/(2K)}`}</BlockMath>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`K`}</InlineMath> (peeks)</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`\\alpha/K`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">CI multiplier vs. 1.96</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3">1</td><td className="border border-neutral-300 p-3">0.050</td><td className="border border-neutral-300 p-3">1.96</td><td className="border border-neutral-300 p-3">1.00&times;</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">2</td><td className="border border-neutral-300 p-3">0.025</td><td className="border border-neutral-300 p-3">2.24</td><td className="border border-neutral-300 p-3">1.14&times;</td></tr>
              <tr><td className="border border-neutral-300 p-3">4</td><td className="border border-neutral-300 p-3">0.0125</td><td className="border border-neutral-300 p-3">2.50</td><td className="border border-neutral-300 p-3">1.28&times;</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">12</td><td className="border border-neutral-300 p-3">0.00417</td><td className="border border-neutral-300 p-3">2.87</td><td className="border border-neutral-300 p-3">1.46&times;</td></tr>
              <tr><td className="border border-neutral-300 p-3">52</td><td className="border border-neutral-300 p-3">0.00096</td><td className="border border-neutral-300 p-3">3.29</td><td className="border border-neutral-300 p-3">1.68&times; (weekly for a year)</td></tr>
            </tbody>
          </table>
        </div>

        {/* Method 2: Pocock */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Method 2: Pocock Boundaries (1977)</h3>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Like Bonferroni, pre-specify <InlineMath>{`K`}</InlineMath> equally-spaced analysis times.
            But instead of Bonferroni&apos;s crude <InlineMath>{`\\alpha/K`}</InlineMath> split, use a
            constant critical value <InlineMath>{`c_P`}</InlineMath> that accounts for the correlation
            between test statistics at different peeks.
          </p>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`K`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`c_P`}</InlineMath> (Pocock)</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath> (Bonf.)</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3">2</td><td className="border border-neutral-300 p-3">2.18</td><td className="border border-neutral-300 p-3">2.24</td><td className="border border-neutral-300 p-3">3% tighter</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">4</td><td className="border border-neutral-300 p-3">2.36</td><td className="border border-neutral-300 p-3">2.50</td><td className="border border-neutral-300 p-3">6% tighter</td></tr>
              <tr><td className="border border-neutral-300 p-3">12</td><td className="border border-neutral-300 p-3">2.60</td><td className="border border-neutral-300 p-3">2.87</td><td className="border border-neutral-300 p-3">9% tighter</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">20</td><td className="border border-neutral-300 p-3">2.69</td><td className="border border-neutral-300 p-3">3.02</td><td className="border border-neutral-300 p-3">11% tighter</td></tr>
            </tbody>
          </table>
        </div>

        {/* Method 3: OBF */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Method 3: O&apos;Brien&ndash;Fleming Boundaries (1979)</h3>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Instead of a constant threshold, use a threshold that <em>decreases</em> over time.
            At the first peek, demand very strong evidence; at the last peek, demand nearly the
            same evidence as a classical test.
          </p>
          <BlockMath>{`c_k^{\\text{OBF}} \\approx z_{\\alpha/2} \\cdot \\sqrt{K/k}`}</BlockMath>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Peek <InlineMath>{`k`}</InlineMath> (of <InlineMath>{`K = 4`}</InlineMath>)</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`c_k^{\\text{OBF}}`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`c_P`}</InlineMath> (Pocock)</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`z_{\\alpha/2}`}</InlineMath> (classical)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3">1 (25% of data)</td><td className="border border-neutral-300 p-3">4.05</td><td className="border border-neutral-300 p-3">2.36</td><td className="border border-neutral-300 p-3">1.96</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">2 (50% of data)</td><td className="border border-neutral-300 p-3">2.86</td><td className="border border-neutral-300 p-3">2.36</td><td className="border border-neutral-300 p-3">1.96</td></tr>
              <tr><td className="border border-neutral-300 p-3">3 (75% of data)</td><td className="border border-neutral-300 p-3">2.34</td><td className="border border-neutral-300 p-3">2.36</td><td className="border border-neutral-300 p-3">1.96</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">4 (100% of data)</td><td className="border border-neutral-300 p-3">2.02</td><td className="border border-neutral-300 p-3">2.36</td><td className="border border-neutral-300 p-3">1.96</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            O&apos;Brien&ndash;Fleming is extremely conservative early (threshold 4.05 at the
            first peek) but barely penalises the final analysis (2.02 vs. 1.96 &mdash; only
            3% wider). This is the most efficient approach: if you run the experiment to
            completion, you pay almost nothing for the option to peek.
          </p>
        </div>

        {/* Simulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">How methods compare in simulation</h3>
        <p className="text-neutral-700 mb-4">
          This simulation adds Bonferroni, Pocock, and O&apos;Brien&ndash;Fleming confidence intervals
          to the Act 1/2 simulation, so you can compare all methods under the same settings.
        </p>
        <div className="mb-8">
          <ABTestSim
            layers={['fixed-ci', 'sequential-ci', 'pocock', 'obf', 'bonferroni']}
            showPeekStats
            simulationTitle="Simulation: fixed-horizon, Eppo (2022), and three alternative sequential methods."
            defaultEffect={0}
            takeaway={<>
              <strong>Result interpretation:</strong> click &ldquo;Run 1000 repetitions&rdquo; to estimate how often each method crosses significance under the current settings.<br /><br />
              <strong>Bonferroni:</strong> most conservative among the three methods (lowest crossing share).<br />
              <strong>Pocock:</strong> less conservative than Bonferroni with the same threshold at each look.<br />
              <strong>O&apos;Brien&ndash;Fleming:</strong> very strict early, then close to classical thresholds at later looks.<br />
              <strong>Sequential confidence interval (Eppo, 2022):</strong> anytime-valid and typically conservative in this setup.
            </>}
          />
        </div>

        {/* Comparison table */}
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
                <th className="border border-neutral-300 p-3 font-semibold text-neutral-900">Eppo (2022)</th>
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
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`{\\sim}2.7 \\times \\hat{\\sigma}`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Confidence interval at final analysis (K=4)</td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.50 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.36 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`2.02 \\times \\hat{\\sigma}`}</InlineMath></td>
                <td className="border border-neutral-300 p-3 text-center"><InlineMath>{`{\\sim}2.4 \\times \\hat{\\sigma}`}</InlineMath></td>
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

        {/* Key Takeaway */}
        <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p><strong>Which method to use:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Closest to Eppo (2022) in these simulations:</strong> in the conditions of this simulation, Pocock seems like the most reasonable choice among the alternative methods.</li>
              <li><strong>Avoid over-correction:</strong> Bonferroni is often too conservative, reducing sensitivity more than needed.</li>
              <li><strong>Avoid early over-triggering:</strong> O&apos;Brien&ndash;Fleming can produce too many early significant crossings in this setup.</li>
            </ul>
            <p>
              That said, we recommend running simulations, A/A tests, or analysing historical tests in each domain, using its specific circumstances (i.e. KPIs and their standard deviations) before deciding which alternative method to use in each domain.
            </p>
            <p>
              <strong>Timing insight:</strong> the method choice matters most at the beginning of tests, when monitoring is mostly for implementation issues. As sample size grows, interval widths become more similar across methods.
            </p>
          </div>
        </div>

        {/* Implementing hybrid without Eppo (2022) */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
          Implementing the Hybrid Approach Without Eppo (2022)
        </h3>

        <p className="mb-4 text-neutral-700">
          Act 13 introduced the hybrid approach: sequential confidence interval on guardrail KPIs for early
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
          <span className="text-green-700 font-bold">SHIP</span> if the confidence interval excludes zero.
          Otherwise: no significant effect.
        </p>

        <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-2">
            <p><strong>The hybrid approach without Eppo (2022):</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Apply Bonferroni across your <InlineMath>{`G`}</InlineMath> guardrail KPIs: <InlineMath>{`\\alpha_g = \\alpha / G`}</InlineMath>.</li>
              <li>Within each guardrail, use O&apos;Brien&ndash;Fleming (best) or Bonferroni (simplest).</li>
              <li>Test the primary KPI once at the end with a standard confidence interval &mdash; no correction needed.</li>
            </ul>
          </div>
        </div>

        {/* Historical Note */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-neutral-700 mb-3">Historical Note</h4>
          <p className="text-neutral-700">
            <strong><a href="#ref-pocock-1977" className="text-blue-600 hover:text-blue-800">Stuart Pocock</a></strong> (1977) and <strong><a href="#ref-obrien-fleming-1979" className="text-blue-600 hover:text-blue-800">Peter O&apos;Brien &amp; Thomas
            Fleming</a></strong> (1979) developed these group sequential methods for clinical trials,
            where stopping a trial early can save lives. Their work sits between <a href="#ref-wald-1945" className="text-blue-600 hover:text-blue-800">Wald&apos;s SPRT
            (1945)</a> and <a href="#ref-howard-2021" className="text-blue-600 hover:text-blue-800">Howard et al.&apos;s continuous framework (2021)</a> in the historical timeline.
            The key insight of all three: sequential monitoring requires a wider
            critical region, but the magnitude of the adjustment can be minimised
            with the right boundary.
          </p>
        </div>
      </div>
    </section>
  )
}
