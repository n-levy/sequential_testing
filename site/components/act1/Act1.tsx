'use client'

import { CoinFlipMeanSim } from '../shared/CoinFlipMeanSim'
import { InlineMath } from '../ui/Math'

export function Act1() {
  return (
    <section id="act1" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 1 &mdash; The Peeking Problem
          </h2>
        </div>

        {/* ── Motivation ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Motivation</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Throughout this guide we use a single running example: <strong>flipping a coin
              many times to decide whether it is fair</strong>. After each flip we compute the
              running sample mean and ask: is the bias zero, or not?
            </p>
            <p>
              In an A/B test this is exactly the same question. The &ldquo;coin&rdquo; is the
              treatment-versus-control assignment; &ldquo;heads&rdquo; means the user&apos;s
              outcome was higher under treatment than control. A bias of zero means no
              real effect.
            </p>
            <p>
              In the simulation below, set the bias to <strong>0</strong> (the null is true)
              and watch the running sample mean. Each time you peek and the standard 95%
              confidence interval excludes zero, you would (wrongly) declare a winner.
            </p>
          </div>
        </div>

        {/* ── Simulation ── */}

        <div className="bg-orange-50 border border-orange-400 rounded-lg p-6 mb-2">
          <h4 className="font-bold text-orange-900 mb-2">Simulation</h4>
          <p className="text-neutral-800">
            The coin bias is fixed at 0 (fair coin). Use the sliders to set the number of flips and alpha. The plot shows
            the running sample mean and the standard 95% CI around it. The amber stat box
            below the plot reports, under the null (bias = 0), how often the standard CI
            crosses the &ldquo;reject&rdquo; threshold at <em>some</em> point during peeking.
          </p>
        </div>

        <CoinFlipMeanSim
          layers={['fixed-ci']}
          showPeekStats
          defaultBias={0}
          showAnalogy={false}
          analogyNote={"This is analogous to peeking at results while using fixed-horizon confidence intervals in an A/B test."}
          takeaway={
            <>
              Simulation takeaway. With a fair coin (bias = 0), the standard
              CI is calibrated to fail to cover only <InlineMath>{`\\alpha = 5\\%`}</InlineMath> of
              the time at one specific look. But under <em>continuous peeking</em>, far
                more than 5% of trajectories will cross the boundary at some point. If you set the bias away from zero, the stat box below reports the probability of crossing the CI at some point under the simulated bias.
              </>
            }
        />

        {/* ── Why Does This Happen? ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4 mt-12">Why Does This Happen?</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              When you run a standard hypothesis test with{' '}
              <InlineMath>{`\\alpha = 0.05`}</InlineMath>, you are guaranteed a 5% false positive
              rate only if you commit to a fixed sample size and analyse the result once.
            </p>
            <p>
              If you monitor your experiment and repeatedly check for significance, that
              guarantee no longer holds. Each interim analysis gives random fluctuations
              another opportunity to cross the significance threshold.
            </p>
            <p>
              The tests across these interim looks are not independent, but the overall
              effect is clear: the more often you peek &mdash; and especially if you stop as
              soon as you see <InlineMath>{`p < 0.05`}</InlineMath> &mdash; the higher your
              actual false positive rate becomes.
            </p>
          </div>
        </div>

        {/* ── How Bad Is It? ── */}
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
                <td className="border border-neutral-300 p-3">Daily for 4 weeks (28 looks)</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 25\\%`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">Continuously (every observation)</td>
                <td className="border border-neutral-300 p-3">Can exceed <InlineMath>{`30\\%`}</InlineMath></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-8">
          <p className="text-neutral-700">
            With daily checks over a 4-week experiment, roughly one in four
            &ldquo;significant&rdquo; results will be a false positive. Features shipped
            on this basis may have no real effect &mdash; or may even degrade the metrics
            you care about.
          </p>
        </div>

        {/* ── Key Takeaway ── */}
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Repeated interim analyses of a standard hypothesis test inflate the Type I
              error rate well beyond its nominal level. Valid continuous monitoring
              requires a fundamentally different testing framework &mdash; one whose error
              guarantees hold regardless of the number or timing of analyses.
            </p>
            <p>
              That framework is <strong>sequential testing</strong>, and it is
              what platforms like Eppo use under the hood.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}