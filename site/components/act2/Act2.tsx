"use client"
import { ABTestSim } from '../shared/ABTestSim'
import { InlineMath } from '../ui/Math'
import { useState } from 'react'

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
      {show && children}
    </div>
  );
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
          The fixed-horizon confidence interval controls error for one planned analysis. Eppo&apos;s sequential confidence interval uses
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
              <th className="border border-neutral-300 p-3 text-left font-semibold">Standard 95% confidence interval</th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Sequential confidence interval (Eppo)</th>
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
          Under repeated peeking, the standard confidence interval inflates false positives substantially, while the sequential confidence interval stays close to the target error level.
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

      {/* ── The Hybrid Approach ── */}
      <h3 className="text-xl font-bold mb-4">The Hybrid Approach</h3>

      <p className="text-neutral-700 mb-4">
        The sequential confidence interval is always wider than a fixed-horizon confidence interval at any given sample size. For the{' '}
        <strong>primary KPI</strong> — the metric the experiment is designed to move — this width
        penalty reduces statistical power.
      </p>

      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-5">
        <p className="font-bold text-neutral-900 mb-3">
          Apply sequential testing where early stopping adds the most value (safety guardrails), and
          fixed-horizon testing where statistical power matters most (the primary metric).
        </p>
        <p className="text-neutral-700 mb-3">The hybrid approach partitions metrics into two categories:</p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-700">
          <li>
            <strong>Guardrail KPIs</strong> (revenue, error rate, latency, etc.): monitored
            continuously with a <strong>sequential confidence interval</strong>. If the confidence interval excludes zero on the
            harmful side, abort the experiment immediately.
          </li>
          <li>
            <strong>Primary KPI</strong> (the metric the experiment targets): analysed with a{' '}
            <strong>standard fixed-horizon confidence interval</strong> at the pre-planned end date. No peeking
            penalty. Full statistical power.
          </li>
        </ul>
      </div>

      <h4 className="font-semibold mb-3">What you gain</h4>
      <div className="overflow-x-auto mb-6">
        <table className="w-full min-w-[480px] text-sm border-collapse border border-neutral-300">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 p-3 text-left font-semibold"></th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Full sequential</th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Hybrid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-300 p-3">Primary KPI confidence interval width</td>
              <td className="border border-neutral-300 p-3">Wider (~10–40%)</td>
              <td className="border border-neutral-300 p-3">Standard (no penalty)</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Primary KPI power</td>
              <td className="border border-neutral-300 p-3">Reduced</td>
              <td className="border border-neutral-300 p-3">Full</td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Guardrail protection</td>
              <td className="border border-neutral-300 p-3">Continuous</td>
              <td className="border border-neutral-300 p-3">Continuous</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Early stopping for success</td>
              <td className="border border-neutral-300 p-3">Yes</td>
              <td className="border border-neutral-300 p-3">No</td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Early stopping for harm</td>
              <td className="border border-neutral-300 p-3">Yes</td>
              <td className="border border-neutral-300 p-3">Yes</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Complexity</td>
              <td className="border border-neutral-300 p-3">Higher</td>
              <td className="border border-neutral-300 p-3">Lower</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            <strong>The hybrid approach in one sentence:</strong> Monitor guardrail KPIs with a
            sequential confidence interval for early abort; analyse the primary KPI with a standard confidence interval at the planned
            end-date.
          </p>
          <p>
            This gives you the safety of sequential testing where it matters most (preventing harm)
            without paying the power penalty on the metric you care about most (the primary KPI).
          </p>
          <p className="font-semibold">
            This is the recommended approach for most A/B testing programmes.
          </p>
        </div>
      </div>

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mt-8 mb-16">
          <h4 className="font-bold mb-3">Mathematical Formulation</h4>
          <p className="mb-2">
            In this simulation, the displayed effect and the confidence interval boundaries are both expressed as percentage uplift:
          </p>
          <p className="mb-2">
            <InlineMath>{`\\hat u_n = 100\\cdot\\frac{\\bar X_{B,n}-\\bar X_{A,n}}{\\bar X_{A,n}}`}</InlineMath>
          </p>
          <p className="mb-2">
            The confidence interval half-width is computed from the running standard error <InlineMath>{`\\widehat{\\mathrm{SE}}_n`}</InlineMath> of the difference in means, then divided by the control mean to convert to percentage scale.
            A fixed-horizon 95% confidence interval uses
          </p>
          <p className="mb-2">
            <InlineMath>{`\\hat u_n \\pm 100\\cdot\\frac{1.96\\,\\widehat{\\mathrm{SE}}_n}{\\bar X_{A,n}}`}</InlineMath>
          </p>
          <p className="mb-2">
            and is valid at one pre-specified analysis.
          </p>
          <p className="mb-2">
            A sequential confidence interval replaces 1.96 with a time-dependent multiplier:
          </p>
          <p className="mb-2">
            <InlineMath>{`\\hat u_n \\pm 100\\cdot\\frac{\\widehat{\\mathrm{SE}}_n}{\\bar X_{A,n}}\\,\\sqrt{\\frac{n+\\nu}{n}\\log\\!\\left(\\frac{n+\\nu}{\\nu\\alpha}\\right)}`}</InlineMath>
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
            So unlike fixed-horizon confidence intervals, the guarantee still holds under continuous monitoring.
          </p>
        </div>
      </DisplayMathBox>
    </div>
  )
}
