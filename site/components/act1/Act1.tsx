'use client'

// import { CoinFlipMeanSim } from '../shared/CoinFlipMeanSim'
import { ABTestSim } from '../shared/ABTestSim'
import { InlineMath } from '../ui/Math'

import { useState } from 'react'

// --- DisplayMathBox helper ---
function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  if (show) return <>{children}</>;
  return <button className="px-4 py-2 bg-blue-600 text-white rounded mb-6" onClick={() => setShow(true)}>Display the math</button>;
}

export function Act1() {
  return (
    <div id="act1" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 1 — The Peeking Problem</h2>

      {/* Simulation intro */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Simulation</h3>
        <p className="text-neutral-700">
          Below is a simulation of an A/B test. Specify the effect size, number of users, and significance level.
          The plot shows the running difference in means and the standard 95% confidence interval.
        </p>
      </div>

      {/* Simulation */}
      <div className="mb-8 max-w-2xl mx-auto">
        <ABTestSim 
          layers={['fixed-ci']} 
          showPeekStats={true}
          K={14}
        />
      </div>

      {/* Why does this happen */}
      <div className="bg-white border border-neutral-300 rounded-lg p-5 mb-6">
        <h4 className="font-semibold mb-2">Why does this happen?</h4>
        <p className="text-neutral-700">
          Standard confidence intervals only control the false positive rate if you look once
          at a pre-specified sample size. Each additional peek gives another chance to get
          a “significant” result by luck.
        </p>
      </div>

      {/* How bad is it */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">How bad is it?</h4>
      </div>
      {/* Simulation and explanation always visible */}
      <div className="overflow-x-auto mb-6">
        <p className="text-xs text-neutral-500 mb-2">
          Values below are calibrated to the default simulation settings (<InlineMath>{`\\alpha = 0.05`}</InlineMath>, <InlineMath>{`n = 10000`}</InlineMath>) using equal-interval peeks.
        </p>
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
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 17\\%`}</InlineMath></td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Daily for 2 weeks</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 22\\%`}</InlineMath></td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Daily for 4 weeks (28 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 29\\%`}</InlineMath></td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Continuously (every observation)</td>
              <td className="border border-neutral-300 p-3">Can exceed <InlineMath>{`60\\%`}</InlineMath></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-8">
        <p className="text-neutral-700">
          With daily checks over a 2-week experiment, about one in five “significant” results will be a false positive. Features released on this basis may have no real effect.
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

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mt-8">
          <h4 className="font-bold mb-3">Why peeking inflates Type I error</h4>
          <p className="mb-3 text-neutral-800">
            In a fixed-horizon A/B test (one planned analysis), we test:
          </p>
          <p className="mb-3">
            <InlineMath>{`H_0:\\ \\tau = 0,\\qquad \\hat{\\tau}_n = \\bar X_{B,n} - \\bar X_{A,n}`}</InlineMath>
          </p>
          <p className="mb-3 text-neutral-800">
            With a standard 95% CI,
          </p>
          <p className="mb-3">
            <InlineMath>{`\\hat{\\tau}_n \\pm 1.96\\,\\widehat{\\mathrm{SE}}_n`}</InlineMath>
          </p>
          <p className="mb-3 text-neutral-800">
            the false positive rate is controlled at one pre-specified look:
          </p>
          <p className="mb-3">
            <InlineMath>{`\\Pr(\\text{reject }H_0\\text{ at one look}) = \\alpha = 0.05`}</InlineMath>
          </p>
          <p className="mb-3 text-neutral-800">
            If we repeatedly check the data, we effectively run many tests. The probability of at least one false positive becomes:
          </p>
          <p className="mb-3">
            <InlineMath>{`\\Pr(\\text{at least one false positive in }K\\text{ looks})`}</InlineMath>
          </p>
          <p className="mb-3 text-neutral-800">
            Under independence this is:
          </p>
          <p className="mb-3">
            <InlineMath>{`1-(1-\\alpha)^K`}</InlineMath>
          </p>
          <p className="mb-3 text-neutral-800">
            and a useful approximation for small <InlineMath>{`\\alpha`}</InlineMath> is:
          </p>
          <p className="mb-3">
            <InlineMath>{`1-(1-\\alpha)^K \\approx K\\alpha`}</InlineMath>
          </p>
          <p className="text-neutral-800">
            Real interim looks are positively correlated, so the exact value is lower than the independence formula, but still substantially above <InlineMath>{`\\alpha`}</InlineMath>. That is why repeated peeking inflates Type I error.
          </p>
        </div>
      </DisplayMathBox>
    </div>
  )
}
