'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { ComparisonSim } from '@/components/act3/ComparisonSim'

export function DetailedAct13() {
  return (
    <section id="act-13" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 13 &mdash; What If You Don&apos;t Have Eppo? (The Poor Man&apos;s Sequential Test)
          </h2>
        </div>

        {/* Intuition */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              You want to check your experiment every Monday. If you use a standard 95% CI each
              time, you&apos;ll get false positives far too often (Act 0).
            </p>
            <p>
              The simplest fix: <strong>be stricter at each check.</strong> If you plan to peek
              4 times, demand stronger evidence each time. The three methods below differ in{' '}
              <em>how</em> they distribute that strictness across the peeks.
            </p>
            <p>Think of it as a budget. You have a total error budget of <InlineMath>{`\\alpha = 5\\%`}</InlineMath>.</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Bonferroni</strong> distributes the budget equally: <InlineMath>{`\\alpha/K`}</InlineMath> per peek.</li>
              <li><strong>Pocock</strong> distributes it more cleverly (using the correlation between test statistics at different peeks), but still equally across peeks.</li>
              <li><strong>O&apos;Brien&ndash;Fleming</strong> front-loads the budget: almost no spending early, most of it saved for the final analysis.</li>
            </ul>
            <p>
              Eppo&apos;s approach (Acts 8&ndash;12) doesn&apos;t need a fixed budget at all &mdash;
              it works for <em>any</em> number of peeks, continuously.
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
          <table className="w-full text-sm border-collapse border border-neutral-300">
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
          <table className="w-full text-sm border-collapse border border-neutral-300">
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
          <table className="w-full text-sm border-collapse border border-neutral-300">
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
          <table className="w-full text-sm border-collapse border border-neutral-300">
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
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Which method should you use?</h4>
          <div className="text-neutral-800 space-y-3">
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>No platform, minimal effort:</strong> Bonferroni. Commit to <InlineMath>{`K`}</InlineMath> peeks. Replace 1.96 with <InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath>. Done.</li>
              <li><strong>No platform, moderate effort:</strong> O&apos;Brien&ndash;Fleming. Nearly as efficient as Eppo at the final analysis, but requires pre-specifying <InlineMath>{`K`}</InlineMath>.</li>
              <li><strong>Need continuous monitoring or variance reduction:</strong> Use a platform like Eppo.</li>
            </ul>
            <p className="mt-2">
              <strong>The bottom line:</strong> even the crudest correction (Bonferroni) is{' '}
              <em>vastly</em> better than naive peeking. If you are checking results without any
              correction, you should start with Bonferroni <em>today</em>.
            </p>
          </div>
        </div>

        {/* Interactive Comparison Simulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Try It: Compare Methods</h3>
        <div className="mb-8">
          <ComparisonSim />
        </div>

        {/* Historical Note */}
        <div className="bg-purple-50 border border-purple-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-purple-900 mb-3">Historical Note</h4>
          <p className="text-neutral-700">
            <strong>Stuart Pocock</strong> (1977) and <strong>Peter O&apos;Brien &amp; Thomas
            Fleming</strong> (1979) developed these group sequential methods for clinical trials,
            where stopping a trial early can save lives. Their work sits between Wald&apos;s SPRT
            (1945) and Howard et al.&apos;s continuous framework (2021) in the historical timeline.
            The key insight of all three: if you want to peek, you must pay &mdash; but the
            price is negotiable.
          </p>
        </div>
      </div>
    </section>
  )
}
