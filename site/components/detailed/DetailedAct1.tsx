'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { PeekingSimulation } from '@/components/act1/PeekingSimulation'

export function DetailedAct1() {
  return (
    <section id="act-1" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 1 &mdash; Why Should You Care? The Peeking Problem
          </h2>
        </div>

        {/* Motivation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Motivation</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Consider a standard A/B test comparing a control experience against a new
              variant. After a week of data collection, the dashboard reports a desired effect with{' '}
              <InlineMath>{`p\text{-value} = 0.03`}</InlineMath>. At <InlineMath>{`\alpha = 0.05`}</InlineMath>,
              this is statistically significant, so the variant is declared a winner.
            </p>
            <p>
              But here is the problem: if you monitored the test daily before that decision,
              the actual false positive rate may be far higher than 5%. A substantial fraction
              of &ldquo;significant&rdquo; results under this practice are false positives
              &mdash; driven by random fluctuation rather than a genuine treatment effect.
            </p>
          </div>
        </div>

        {/* Simulation description */}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Setup:</strong>{' '}
              1,000 A/B experiments simulated under the null hypothesis (zero treatment
              effect). Both groups are drawn from identical distributions. A standard{' '}
              <InlineMath>{`t`}</InlineMath>-test is recomputed after each new observation.
            </p>
            <p>
              The cumulative fraction of experiments that show{' '}
              <InlineMath>{`p < 0.05`}</InlineMath> at some point during monitoring
              climbs well above 5%.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <PeekingSimulation />

        {/* Intuitive Explanation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Why Does This Happen?</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              When you run a standard hypothesis test with{' '}
              <InlineMath>{`\alpha = 0.05`}</InlineMath>, the 5% false positive guarantee
              holds only if you commit to a fixed sample size and analyse the result once.
            </p>
            <p>
              If you monitor the experiment and repeatedly check for significance, that
              guarantee no longer holds. Each interim analysis gives random fluctuations
              another opportunity to cross the significance threshold.
            </p>
            <p>
              The tests across interim looks are not independent, but the overall
              effect is clear: the more often you peek &mdash; and especially if you stop as
              soon as <InlineMath>{`p < 0.05`}</InlineMath> &mdash; the higher the
              realised false positive rate.
            </p>
            <p>
              The rest of this presentation develops a testing framework that does not
              suffer from this problem: one where the Type I error guarantee holds
              regardless of the number or timing of analyses.
            </p>
            <p>
              That framework is called <strong>anytime-valid inference</strong>.
            </p>
          </div>
        </div>

        {/* How Bad Is It? */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">How Bad Is It?</h3>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Checking schedule</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Actual false positive rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3">Once at the end (as designed)</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">Daily for 1 week</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 13\\%`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">Daily for 2 weeks</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 19\\%`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">Daily for 4 weeks</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 25\\%`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">Continuously (every observation)</td>
                <td className="border border-neutral-300 p-3">Can exceed <InlineMath>{`30\\%`}</InlineMath></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>The peeking problem:</strong> Repeated interim analyses of a standard
              hypothesis test inflate the Type I error rate well beyond its nominal level.
              Valid continuous monitoring requires a fundamentally different testing
              framework &mdash; one whose error guarantees hold regardless of the stopping rule.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
