'use client'

import { InlineMath, BlockMath } from './ui/Math'

export function Summary() {
  return (
    <section id="summary" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">Summary</h2>

        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 font-semibold">Act</th>
                <th className="border border-neutral-300 p-3 font-semibold text-left">Key message</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3 text-center font-bold">1</td><td className="border border-neutral-300 p-3">Peeking inflates false positives. You need a test that is valid every time you check — not just at the planned end date.</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 text-center font-bold">2</td><td className="border border-neutral-300 p-3">Sequential confidence intervals (Eppo, 2022) remain valid under continuous monitoring by using a time-varying multiplier instead of the fixed 1.96.</td></tr>
              <tr><td className="border border-neutral-300 p-3 text-center font-bold">3</td><td className="border border-neutral-300 p-3">The hybrid approach: monitor guardrail KPIs sequentially for early abort, and analyse the primary KPI with a standard confidence interval at the planned end date — preserving full statistical power.</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 text-center font-bold">4</td><td className="border border-neutral-300 p-3">DIY alternatives: Bonferroni, Pocock, O&apos;Brien–Fleming for two-sided control; plus a one-sided guardrail harm detection rule (z = 3.0).</td></tr>
              <tr><td className="border border-neutral-300 p-3 text-center font-bold">5</td><td className="border border-neutral-300 p-3">Early stopping in sequential tests inflates estimated effect sizes (magnitude error). Treat point estimates from early-stopped tests with caution; prefer the hybrid approach to avoid this for the primary KPI.</td></tr>
            </tbody>
          </table>
        </div>

        <p className="text-neutral-700 mb-4">
          <strong>The core trade-off:</strong> Valid interim monitoring requires wider confidence intervals. The penalty depends on the method, but the benefit is freedom to peek and act at any time.
        </p>

        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 font-semibold text-left">Method</th>
                <th className="border border-neutral-300 p-3 font-semibold text-left">Price of peeking</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3 font-medium">No correction (naive)</td><td className="border border-neutral-300 p-3 text-blue-700">Invalid inference (20–30% false positives)</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 font-medium">Bonferroni</td><td className="border border-neutral-300 p-3">Confidence interval ~28–68% wider (depending on <InlineMath>{`K`}</InlineMath>)</td></tr>
              <tr><td className="border border-neutral-300 p-3 font-medium">Pocock</td><td className="border border-neutral-300 p-3">Confidence interval ~20–37% wider</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 font-medium">O'Brien–Fleming</td><td className="border border-neutral-300 p-3">Confidence interval ~3% wider at final analysis</td></tr>
              <tr><td className="border border-neutral-300 p-3 font-medium">Eppo (sequential confidence interval)</td><td className="border border-neutral-300 p-3">Confidence interval ~10–40% wider, valid <em>continuously</em></td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 font-medium text-blue-700">Hybrid (recommended)</td><td className="border border-neutral-300 p-3 text-blue-700 font-medium">No penalty on primary KPI; sequential penalty on guardrails only</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
