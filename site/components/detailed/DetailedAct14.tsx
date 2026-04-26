'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { ComparisonSim } from '../act3/ComparisonSim'

export function DetailedAct14() {
  return (
    <section id="act-14" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 14 &mdash; What If Your Experimentation Platform Does Not Support Sequential Testing?
          </h2>
        </div>

        {/* Intuition */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Standard confidence intervals guarantee 95% coverage only at a fixed sample size.
            </p>
            <p>
              Confidence intervals are only valid when the sample size is fixed in advance. If we monitor continuously and stop based on the data, that guarantee no longer applies.
            </p>
            <p>
              By checking repeatedly and stopping when results look good, we give ourselves multiple chances to get a lucky fluctuation.
            </p>
            <p>
              At a fixed sample size, the chance of a false positive is 5%. If we can stop at any time, the chance of ever making at least one false positive is much higher.
            </p>
            <p>
              The issue isn’t peeking itself — it’s that standard statistical tools weren’t designed for continuous monitoring.
            </p>
            <p>
              The issue isn’t peeking itself — it’s that standard statistical tools weren’t designed for continuous monitoring.
            </p>
            <p>
              We need methods that remain valid no matter when we stop.
            </p>
            <p>
              These methods control the probability of ever making at least one false positive, even if we keep checking.
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

        {/* Head-to-head comparison */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Head-to-Head Comparison</h3>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Bonferroni</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Pocock</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">OBF</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Eppo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3 font-semibold">Pre-specify K?</td><td className="border border-neutral-300 p-3">Yes</td><td className="border border-neutral-300 p-3">Yes</td><td className="border border-neutral-300 p-3">Yes</td><td className="border border-neutral-300 p-3">No</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 font-semibold">Threshold type</td><td className="border border-neutral-300 p-3">Constant</td><td className="border border-neutral-300 p-3">Constant</td><td className="border border-neutral-300 p-3">Decreasing</td><td className="border border-neutral-300 p-3">Continuous</td></tr>
              <tr><td className="border border-neutral-300 p-3 font-semibold">Valid between peeks?</td><td className="border border-neutral-300 p-3">No</td><td className="border border-neutral-300 p-3">No</td><td className="border border-neutral-300 p-3">No</td><td className="border border-neutral-300 p-3">Yes</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 font-semibold">Variance reduction?</td><td className="border border-neutral-300 p-3">Manual</td><td className="border border-neutral-300 p-3">Manual</td><td className="border border-neutral-300 p-3">Manual</td><td className="border border-neutral-300 p-3">Built-in</td></tr>
              <tr><td className="border border-neutral-300 p-3 font-semibold">Implementation</td><td className="border border-neutral-300 p-3">1 line</td><td className="border border-neutral-300 p-3">Lookup table</td><td className="border border-neutral-300 p-3">Formula</td><td className="border border-neutral-300 p-3">Platform</td></tr>
            </tbody>
          </table>
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Which method should you use?</h4>
          <div className="text-neutral-800 space-y-3">
            <ul className="list-disc ml-6 space-y-2">
              <li>No platform, minimal effort: Bonferroni. Commit to <InlineMath>{`K`}</InlineMath> peeks. Replace 1.96 with <InlineMath>{`z_{\alpha/(2K)}`}</InlineMath>. Done.</li>
              <li>No platform, moderate effort: O'Brien–Fleming or Pocock. These are not overly conservative and are a good practical choice for most A/B tests.</li>
              <li>Need continuous monitoring or variance reduction: Use a platform like Eppo, but be aware that the sequential CI is often much more conservative than necessary for typical A/B testing.</li>
            </ul>
            <p className="mt-2">
              The key point: even the simplest correction (Bonferroni) is far superior to uncorrected repeated testing. Any team that currently checks results without adjustment should adopt at least Bonferroni immediately.
            </p>
          </div>
        </div>

        {/* Interactive Comparison Simulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Try It: Compare Methods</h3>
        <div className="mb-8">
          <ComparisonSim />
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
