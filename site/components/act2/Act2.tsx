"use client"
import { ABTestSim } from '../shared/ABTestSim'
import { InlineMath } from '../ui/Math'
import { useState } from 'react'

function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  if (show) return <>{children}</>;
  return <button className="px-4 py-2 bg-blue-600 text-white rounded mb-6" onClick={() => setShow(true)}>Display the math</button>;
}

export function Act2() {
  return (
    <div id="act2">
      <h2 className="text-2xl font-bold mb-2">Act 2 — The Eppo Solution</h2>
      <p className="text-neutral-600 mb-6">(Schmit & Miller, 2024)</p>

      {/* Simulation intro */}
      <div className="mb-4 text-neutral-700">
        Simulate an A/B test with no true effect (effect = 0). The plot below adds Eppo's sequential confidence interval (blue band) on top of the standard 95% CI (red band) you saw in Act 1. The sequential CI is wider at any single look — that is the price of peeking — but its 95% coverage holds simultaneously at every look.
      </div>

      {/* Simulation */}
      <div className="mb-8 max-w-2xl mx-auto">
        <ABTestSim layers={['fixed-ci', 'sequential-ci']} showPeekStats={true} showPowerControl={false} />
      </div>

      {/* Probability of crossing */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border border-neutral-300 text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="border border-neutral-300 p-3 text-left">Method</th>
              <th className="border border-neutral-300 p-3 text-left">Share crossing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-300 p-3">Standard 95% CI</td>
              <td className="border border-neutral-300 p-3">~68%</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Sequential CI (Eppo)</td>
              <td className="border border-neutral-300 p-3">~26%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Intuitive explanation always visible */}
      <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-8">
        <p className="text-neutral-700 mb-2">
          Eppo's sequential confidence interval lets you peek as often as you want, while still controlling the false positive rate. The band is wider at any given time — that is the price of peeking — but its coverage is valid simultaneously at every look.
        </p>
        <p className="text-neutral-700">
          This method is more conservative than the standard 95% CI, but it remains valid no matter when you stop.
        </p>
      </div>

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mt-8">
          <h4 className="font-bold mb-3">Mathematical Formulation</h4>
          <p className="mb-2">
            Let <InlineMath>{`\\hat{\\tau}_n = \\bar X_{B,n} - \\bar X_{A,n}`}</InlineMath> be the running treatment effect estimate and <InlineMath>{`\\widehat{\\mathrm{SE}}_n`}</InlineMath> its running standard error.
          </p>
          <p className="mb-2">
            A fixed-horizon 95% CI uses
          </p>
          <p className="mb-2">
            <InlineMath>{`\\hat{\\tau}_n \\pm 1.96\\,\\widehat{\\mathrm{SE}}_n`}</InlineMath>
          </p>
          <p className="mb-2">
            and is valid at one pre-specified analysis.
          </p>
          <p className="mb-2">
            A sequential CI replaces 1.96 with a time-dependent multiplier:
          </p>
          <p className="mb-2">
            <InlineMath>{`\\hat{\\tau}_n \\pm \\widehat{\\mathrm{SE}}_n\\,\\sqrt{\\frac{n+\\nu}{n}\\log\\!\\left(\\frac{n+\\nu}{\\nu\\alpha}\\right)}`}</InlineMath>
          </p>
          <p className="mb-2">
            where <InlineMath>{`\\nu`}</InlineMath> is a tuning parameter and <InlineMath>{`\\alpha`}</InlineMath> is the target Type I error level.
          </p>
          <p className="mb-2">
            This yields time-uniform coverage:
          </p>
          <p className="mb-2">
            <InlineMath>{`\\Pr\\!\\left(\\tau \\in \\mathrm{CI}_n\\ \\text{for all } n\\ge1\\right)\\ge 1-\\alpha`}</InlineMath>
          </p>
          <p className="mb-2">
            So unlike fixed-horizon CIs, the guarantee still holds under continuous monitoring.
          </p>
          <p className="mb-2">
            In this app, the sequential interval is based on this mixture-boundary form. For each time <InlineMath>n</InlineMath>, the interval is:
          </p>
          <p className="mb-2">
            <InlineMath>{`\left[ \bar{X}_n - c_n,\ \bar{X}_n + c_n \right]`}</InlineMath>
          </p>
          <p className="mb-2">
            where <InlineMath>{`\\bar{X}_n`}</InlineMath> is the running mean and <InlineMath>{`c_n`}</InlineMath> is a time-dependent width chosen so that the interval covers the true mean with at least 95% probability, no matter when you stop.
          </p>
        </div>
      </DisplayMathBox>
    </div>
  )
}
