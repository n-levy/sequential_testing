'use client'

// import { CoinFlipMeanSim } from '../shared/CoinFlipMeanSim'
import { ABTestSim } from '../shared/ABTestSim'
import { InlineMath } from '../ui/Math'

import { useState } from 'react'

// --- DisplayMathBox helper ---
function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200 mb-6"
      >
        {show ? 'Hide the math' : 'Show the math'}
      </button>
      {show && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h4 className="font-bold text-neutral-900 mb-4">The math</h4>
          {children}
        </div>
      )}
      <div style={{ height: '4rem' }} />
    </div>
  );
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
          The plot shows the running estimate of the relative uplift and the standard 95% confidence interval.
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
      <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Sequential methods control the probability of ever making a false positive, no matter when we stop. They use stricter or time-dependent thresholds to account for repeated checking. This way, we can monitor results as often as we like, and the error rate stays controlled.
          </p>
        </div>
      </div>

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div>
          <h4 className="font-bold mb-3">Why peeking inflates Type I error</h4>
          <p className="mb-3 text-neutral-800">
            The simulation tracks the <strong>relative uplift</strong>: the treatment effect expressed as a percentage of the control mean. Formally:
          </p>
          <p className="mb-3">
            <InlineMath>{`\\hat{u}_n = 100 \\cdot \\frac{\\bar{X}_{B,n} - \\bar{X}_{A,n}}{\\bar{X}_{A,n}}`}</InlineMath>
          </p>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\hat{u}_n`}</InlineMath> — estimated relative uplift (in %) after <InlineMath>{`n`}</InlineMath> observations per group</li>
            <li><InlineMath>{`\\bar{X}_{B,n}`}</InlineMath> — running mean outcome in the <strong>treatment</strong> group after <InlineMath>{`n`}</InlineMath> observations</li>
            <li><InlineMath>{`\\bar{X}_{A,n}`}</InlineMath> — running mean outcome in the <strong>control</strong> group after <InlineMath>{`n`}</InlineMath> observations</li>
            <li><InlineMath>{`n`}</InlineMath> — number of observations (e.g. users) in each group so far</li>
          </ul>
          <p className="mb-3 text-neutral-800">
            We test <InlineMath>{`H_0: u = 0`}</InlineMath> (no relative uplift). A standard 95% confidence interval for the uplift, valid at one pre-specified look, is:
          </p>
          <p className="mb-3">
            <InlineMath>{`\\hat{u}_n \\pm 100 \\cdot \\frac{\\widehat{\\mathrm{SE}}_n}{\\bar{X}_{A,n}} \\cdot 1.96`}</InlineMath>
          </p>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`1.96`}</InlineMath> — the critical value for a 95% confidence interval (the 97.5th percentile of the standard Normal distribution)</li>
            <li><InlineMath>{`\\widehat{\\mathrm{SE}}_n`}</InlineMath> — estimated standard error of the difference in means <InlineMath>{`(\\bar{X}_{B,n} - \\bar{X}_{A,n})`}</InlineMath>, equal to <InlineMath>{`\\sqrt{(\\hat{\\sigma}_A^2 + \\hat{\\sigma}_B^2)/n}`}</InlineMath></li>
            <li><InlineMath>{`\\hat{\\sigma}_A^2,\\, \\hat{\\sigma}_B^2`}</InlineMath> — estimated variance of outcomes in the control and treatment groups</li>
          </ul>
          <p className="mb-3 text-neutral-800">
            The false positive rate at a single planned look is:
          </p>
          <p className="mb-3">
            <InlineMath>{`\\Pr(\\text{reject }H_0\\text{ at one look}) = \\alpha = 0.05`}</InlineMath>
          </p>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\alpha`}</InlineMath> — the significance level; the maximum acceptable probability of a false positive (here 5%)</li>
          </ul>
          <p className="mb-3 text-neutral-800">
            If we repeatedly check the data, we effectively run many tests. The probability of at least one false positive across <InlineMath>{`K`}</InlineMath> looks is:
          </p>
          <p className="mb-3">
            <InlineMath>{`\\Pr(\\text{at least one false positive in }K\\text{ looks}) = 1-(1-\\alpha)^K`}</InlineMath>
          </p>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`K`}</InlineMath> — total number of times we look at (peek at) the data during the experiment</li>
          </ul>
          <p className="mb-3 text-neutral-800">
            A useful approximation for small <InlineMath>{`\\alpha`}</InlineMath>:
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
