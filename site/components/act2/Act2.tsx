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
    <div id="act2" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 2 — The Eppo Solution</h2>

      {/* Simulation intro */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Simulation</h3>
        <p className="text-neutral-700">
          This is the same simulation as Act 1, plus Eppo&apos;s sequential confidence interval (blue)
          on top of the standard fixed-horizon confidence interval (red). The blue interval is typically
          wider at any single look, but it keeps error control valid under repeated monitoring.
        </p>
      </div>

      {/* Simulation */}
      <div className="mb-8 max-w-2xl mx-auto">
        <ABTestSim
          layers={['fixed-ci', 'sequential-ci']}
          showPeekStats={true}
          simulationTitle="Simulation 2: fixed-horizon + Eppo sequential confidence intervals."
          K={14}
        />
      </div>

      {/* Why does this work */}
      <div className="bg-white border border-neutral-300 rounded-lg p-5 mb-6">
        <h4 className="font-semibold mb-2">Why does this work?</h4>
        <p className="text-neutral-700 mb-2">
          The fixed-horizon CI controls error for one planned analysis. Eppo&apos;s sequential CI uses
          a time-dependent boundary, so the guarantee is valid no matter when or how often you peek.
        </p>
        <p className="text-neutral-700">
          Tradeoff: at any single look, the interval is wider; benefit: no hidden inflation from repeated checks.
        </p>
      </div>

      {/* How different is it */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">How different is it?</h4>
      </div>
      <div className="overflow-x-auto mb-6">
        <p className="text-xs text-neutral-500 mb-2">
          Values below are calibrated to default settings (<InlineMath>{`\\alpha = 0.05`}</InlineMath>, <InlineMath>{`n = 10000`}</InlineMath>, baseline 10%, no true effect) using equal-interval peeks.
        </p>
        <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 p-3 text-left font-semibold">Checking schedule</th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Standard 95% CI</th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Sequential CI (Eppo)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-300 p-3">Once at the end (1 look)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 2\\%`}</InlineMath></td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Daily for 1 week (7 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 16\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 4\\%`}</InlineMath></td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Daily for 2 weeks (14 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 22\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Daily for 4 weeks (28 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 28\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Very frequent checks (50 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 33\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 6\\%`}</InlineMath></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-8">
        <p className="text-neutral-700">
          Under repeated peeking, the standard CI inflates false positives substantially, while the sequential CI stays close to the target error level.
        </p>
      </div>

      {/* ── Key Takeaway ── */}
      <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Sequential intervals trade narrowness at a single look for validity across all looks. If your team monitors live, this is the right tradeoff.
          </p>
        </div>
      </div>

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mt-8">
          <h4 className="font-bold mb-3">Mathematical Formulation</h4>
          <p className="mb-2">
            In this simulation, the displayed effect is percentage uplift:
            <InlineMath>{`\\hat u_n = \\frac{\\bar X_{B,n}-\\bar X_{A,n}}{\\bar X_{A,n}}`}</InlineMath>.
            The CI construction is based on the underlying difference in means
            <InlineMath>{`\\hat\\tau_n = \\bar X_{B,n}-\\bar X_{A,n}`}</InlineMath> and its running standard error <InlineMath>{`\\widehat{\\mathrm{SE}}_n`}</InlineMath>.
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
        </div>
      </DisplayMathBox>
    </div>
  )
}
