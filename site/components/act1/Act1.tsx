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
              Suppose we flip a coin many times to see if it’s fair. After each flip, we look at the running average and ask: is the coin biased?
            </p>
            <p>
              In A/B testing, it’s the same idea. The “coin” is treatment versus control. A bias of zero means no real effect.
            </p>
            <p>
              Standard confidence intervals guarantee 95% coverage only if the sample size is fixed in advance. If we monitor continuously and stop based on the data, that guarantee no longer holds. The issue is not with confidence intervals themselves, but with using them outside their intended assumptions.
            </p>
            <p>
              By checking repeatedly and stopping when results look good, we give ourselves multiple chances to get a lucky fluctuation. The probability can become very large if we keep checking.
            </p>
            <p>
              At a fixed sample size, the error rate is 5%. If we can stop at any time, the chance of ever making an error is much higher.
            </p>
            <p>
              The issue isn’t peeking itself — it’s that standard statistical tools weren’t designed for continuous monitoring. We need methods that remain valid no matter when we stop.
            </p>
            <p>
              These methods control the probability of ever making a false positive, even if we keep checking.
            </p>
          </div>
        </div>

        {/* ── Simulation ── */}

        <div className="bg-orange-50 border border-orange-400 rounded-lg p-6 mb-2">
          <h4 className="font-bold text-orange-900 mb-2">Simulation</h4>
          <p className="text-neutral-800">
            The coin bias is fixed at 0 (fair coin). Use the sliders to set the number of flips and alpha. The plot shows the running average and the standard 95% CI. The stat box below reports, under the null (bias = 0), how often the standard CI crosses the “reject” threshold at some point during peeking.
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
              Simulation takeaway. With a fair coin (bias = 0), the standard CI is calibrated to fail to cover only <InlineMath>{`\\alpha = 5\\%`}</InlineMath> of the time at one specific look. But if you peek along the way, far more than 5% of trajectories will cross the boundary at some point. If you set the bias away from zero, the stat box below reports the probability of crossing the CI at some point under the simulated bias.
            </>
          }
        />

        {/* ── Why Does This Happen? ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4 mt-12">Why Does This Happen?</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Standard confidence intervals only control the chance of a false positive if you decide your sample size in advance and look once at the end. If you check your results along the way, that guarantee no longer holds. Each time we check, we give ourselves another chance to get lucky. The tests are not independent, but the more often you peek—and especially if you stop as soon as you see a “significant” result—the higher your actual false positive rate becomes.
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
            With daily checks over a 4-week experiment, about one in four “significant” results will be a false positive. Features shipped on this basis may have no real effect—or may even degrade your metrics.
          </p>
        </div>

        {/* ── Key Takeaway ── */}
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Sequential methods control the probability of ever making a false positive, no matter when we stop. They use stricter or time-dependent thresholds to account for repeated checking. This way, we can monitor results as often as we like, and the error rate stays controlled.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}