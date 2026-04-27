'use client'

import { InlineMath, BlockMath } from '../ui/Math'

export function DetailedSummary() {
  return (
    <section id="summary" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Summary: The Through-Line
          </h2>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Act</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Object</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Represents</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Key idea</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3">0</td><td className="border border-neutral-300 p-3">Repeated <InlineMath>{`p`}</InlineMath>-values</td><td className="border border-neutral-300 p-3">The peeking problem</td><td className="border border-neutral-300 p-3">Checking repeatedly inflates FP</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">1</td><td className="border border-neutral-300 p-3">Random walk <InlineMath>{`S_n`}</InlineMath></td><td className="border border-neutral-300 p-3">Position</td><td className="border border-neutral-300 p-3">SD grows as <InlineMath>{`\\sqrt{n}`}</InlineMath></td></tr>
              <tr><td className="border border-neutral-300 p-3">2</td><td className="border border-neutral-300 p-3">Winnings <InlineMath>{`M_n`}</InlineMath></td><td className="border border-neutral-300 p-3">Gambler&apos;s fortune</td><td className="border border-neutral-300 p-3">Martingale; Doob: <InlineMath>{`\\EE[M_\\tau] = M_0`}</InlineMath></td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">3</td><td className="border border-neutral-300 p-3">Likelihood ratio <InlineMath>{`\\Lambda_n`}</InlineMath></td><td className="border border-neutral-300 p-3">Evidence against <InlineMath>{`H_0`}</InlineMath></td><td className="border border-neutral-300 p-3">Comparing hypotheses flip by flip</td></tr>
              <tr><td className="border border-neutral-300 p-3">4</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\Lambda_n`}</InlineMath> under <InlineMath>{`H_0`}</InlineMath></td><td className="border border-neutral-300 p-3">LR is a martingale</td><td className="border border-neutral-300 p-3">The cancellation proof</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">5</td><td className="border border-neutral-300 p-3">Markov + Ville</td><td className="border border-neutral-300 p-3">Anytime-valid guarantee</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\PP(\\Lambda_n \\text{ ever} \\geq 1/\\alpha) \\leq \\alpha`}</InlineMath></td></tr>
              <tr><td className="border border-neutral-300 p-3">6</td><td className="border border-neutral-300 p-3">SPRT</td><td className="border border-neutral-300 p-3">Wald&apos;s decision rule</td><td className="border border-neutral-300 p-3">Optimal but requires known <InlineMath>{`\\delta`}</InlineMath></td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">7</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\Lambda_n^H`}</InlineMath> (mixture LR)</td><td className="border border-neutral-300 p-3">Robust evidence</td><td className="border border-neutral-300 p-3">Robbins&apos; mixtures &rarr; Johari&apos;s mSPRT</td></tr>
              <tr><td className="border border-neutral-300 p-3">8</td><td className="border border-neutral-300 p-3">Confidence sequence</td><td className="border border-neutral-300 p-3">Modern framework</td><td className="border border-neutral-300 p-3">Howard: nonparametric, estimated <InlineMath>{`\\sigma^2`}</InlineMath></td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">9</td><td className="border border-neutral-300 p-3">Peeking vs. variance</td><td className="border border-neutral-300 p-3">Three problems</td><td className="border border-neutral-300 p-3">Peeking, high variance, heterogeneous users</td></tr>
              <tr><td className="border border-neutral-300 p-3">10</td><td className="border border-neutral-300 p-3">Eppo pipeline</td><td className="border border-neutral-300 p-3">Statistical pipeline</td><td className="border border-neutral-300 p-3">Randomise &rarr; adjust &rarr; CI &rarr; decide</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">11</td><td className="border border-neutral-300 p-3">Regression adjustment</td><td className="border border-neutral-300 p-3">Variance reduction</td><td className="border border-neutral-300 p-3"><InlineMath>{`\Var(Y^*) = \Var(Y)(1-R^2)`}</InlineMath></td></tr>
              <tr><td className="border border-neutral-300 p-3">12</td><td className="border border-neutral-300 p-3">Eppo&apos;s sequential CI</td><td className="border border-neutral-300 p-3">Final output</td><td className="border border-neutral-300 p-3">Sequential multiplier; decide anytime</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">13</td><td className="border border-neutral-300 p-3">DIY alternatives</td><td className="border border-neutral-300 p-3">Simple approximations</td><td className="border border-neutral-300 p-3">Bonferroni, Pocock, OBF vs. Eppo</td></tr>
            </tbody>
          </table>
        </div>

        <div className="text-neutral-700 space-y-4 mb-8">
          <p>
            <strong>The core message:</strong> All fourteen acts build on the same mathematical
            structure &mdash; non-negative (super)martingales and Ville&apos;s inequality. The
            anytime-valid guarantee flows from a single elegant fact:
          </p>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 text-center text-lg italic">
            No stopping rule applied to a non-negative martingale can inflate the probability of exceeding a fixed threshold.
          </div>
        </div>

        <div className="text-neutral-700 mb-8">
          <p className="mb-2"><strong>The evolution across eight decades:</strong></p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="bg-blue-100 px-3 py-1 rounded">Ville (1939)</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 px-3 py-1 rounded">Wald (1945)</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 px-3 py-1 rounded">Robbins (1970)</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 px-3 py-1 rounded">Johari (2017)</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 px-3 py-1 rounded">Howard (2021)</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 px-3 py-1 rounded">Eppo (2024)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
