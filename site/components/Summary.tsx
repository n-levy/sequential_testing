'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'

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
                <th className="border border-neutral-300 p-3 font-semibold text-left">Topic</th>
                <th className="border border-neutral-300 p-3 font-semibold text-left">Key message</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3 text-center font-bold">1</td>
                <td className="border border-neutral-300 p-3">The Peeking Problem</td>
                <td className="border border-neutral-300 p-3">Checking a standard test repeatedly inflates false positives to 20&ndash;30%. You need a different kind of test.</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 text-center font-bold">2</td>
                <td className="border border-neutral-300 p-3">The Eppo Solution</td>
                <td className="border border-neutral-300 p-3">A sequential CI is valid at every moment. The <strong>hybrid approach</strong> uses sequential testing only for guardrail KPIs (early abort) and a standard CI for the primary KPI (full power).</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 text-center font-bold">3</td>
                <td className="border border-neutral-300 p-3">DIY Alternatives</td>
                <td className="border border-neutral-300 p-3">Bonferroni (simplest), Pocock, O&apos;Brien&ndash;Fleming &mdash; three ways to peek safely without a platform. The hybrid approach works with any of them.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-neutral-700 mb-4">
          <strong>The core trade-off:</strong> valid interim monitoring requires wider
          confidence intervals. The magnitude of the penalty depends on the method:
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
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">No correction (naive)</td>
                <td className="border border-neutral-300 p-3 text-amber-700">Invalid inference (20&ndash;30% false positives)</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Bonferroni</td>
                <td className="border border-neutral-300 p-3">CI ~28&ndash;68% wider (depending on <InlineMath>{`K`}</InlineMath>)</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Pocock</td>
                <td className="border border-neutral-300 p-3">CI ~20&ndash;37% wider</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">O&apos;Brien&ndash;Fleming</td>
                <td className="border border-neutral-300 p-3">CI ~3% wider at final analysis</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Eppo (sequential CI)</td>
                <td className="border border-neutral-300 p-3">CI ~10&ndash;40% wider, valid <em>continuously</em></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium text-green-700">Hybrid (recommended)</td>
                <td className="border border-neutral-300 p-3 text-green-700 font-medium">No penalty on primary KPI; sequential penalty on guardrails only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
