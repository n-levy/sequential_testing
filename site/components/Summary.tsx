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
              <tr><td className="border border-neutral-300 p-3 text-center font-bold">1</td><td className="border border-neutral-300 p-3">Peeking inflates false positives. You need a test that is valid at every time you check.</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 text-center font-bold">2</td><td className="border border-neutral-300 p-3">Sequential confidence intervals are valid at every moment. The hybrid approach uses sequential confidence intervals for guardrails and classical confidence intervals for the primary KPI.</td></tr>
              <tr><td className="border border-neutral-300 p-3 text-center font-bold">3</td><td className="border border-neutral-300 p-3">DIY alternatives: Bonferroni, Pocock, O'Brien–Fleming. All widen the confidence interval to control error when peeking.</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 text-center font-bold">4–6</td><td className="border border-neutral-300 p-3">Martingales and Ville's inequality: the math that makes peeking safe.</td></tr>
              <tr><td className="border border-neutral-300 p-3 text-center font-bold">7–9</td><td className="border border-neutral-300 p-3">SPRT, mixture, and confidence sequences: the evolution of sequential testing and estimation.</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 text-center font-bold">10–13</td><td className="border border-neutral-300 p-3">Eppo's pipeline: regression adjustment, sequential confidence intervals, and actionable decisions.</td></tr>
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
