'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { NoiseDemoSim } from './sims/NoiseDemoSim'

export function DetailedAct10() {

  return (
    <section id="act-10" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 10 &mdash; The Problem Eppo Solves
          </h2>
        </div>

        {/* Intuition: What makes real A/B testing hard? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Real A/B testing faces three problems at once:
            </p>
            <ol className="list-decimal ml-6 space-y-3">
              <li><strong>The peeking problem:</strong> People check results often. Classical tests break under repeated checking.</li>
              <li><strong>High variance:</strong> User outcomes are extremely variable. Small effects are buried in noise, so experiments take a long time.</li>
              <li><strong>Heterogeneous users:</strong> Treatment effects differ across user segments. Pre-experiment data can help separate signal from noise.</li>
            </ol>
          </div>
        </div>

        {/* Interactive Simulation */}
        <NoiseDemoSim />

        <div className="text-neutral-700 space-y-3 mb-8 mt-8">
          <p><strong>What Eppo wants:</strong></p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Anytime-valid inference:</strong> Peek as often as you like; the error guarantee holds.</li>
            <li><strong>Faster experiments:</strong> Use pre-experiment data to reduce noise, shrinking the confidence interval.</li>
            <li><strong>Simple outputs:</strong> Report a confidence interval for the <em>relative lift</em> (&ldquo;+3% &plusmn; 1.5%&rdquo;) that experimenters can act on immediately.</li>
          </ul>
          <p>
            Acts 1&ndash;8 built each ingredient. The next three acts show how Eppo assembles
            them into one pipeline.
          </p>
        </div>

        {/* Three problems table */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p className="mb-3"><strong>Three problems, three solutions:</strong></p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 p-3 text-left font-semibold">Problem</th>
                    <th className="border border-neutral-300 p-3 text-left font-semibold">Solution</th>
                    <th className="border border-neutral-300 p-3 text-left font-semibold">Where we learned it</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-neutral-300 p-3">Peeking inflates errors</td><td className="border border-neutral-300 p-3">Sequential CI (<a href="#ref-howard-2021" className="text-blue-600 hover:text-blue-800">Howard et al.</a>)</td><td className="border border-neutral-300 p-3">Acts 6, 8</td></tr>
                  <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">High variance / slow experiments</td><td className="border border-neutral-300 p-3">Regression adjustment (CUPED)</td><td className="border border-neutral-300 p-3">Act 12</td></tr>
                  <tr><td className="border border-neutral-300 p-3">Need interpretable output</td><td className="border border-neutral-300 p-3">Relative lift with CI</td><td className="border border-neutral-300 p-3">Act 13</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
