'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { LikelihoodRatioSim } from './sims/LikelihoodRatioSim'

export function DetailedAct3() {
  return (
    <section id="act-3" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 3 &mdash; Hypothesis Testing: Telling Two Coins Apart
          </h2>
        </div>

        {/* Simulation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              You are presented with a coin and must determine whether it is fair
              (<InlineMath>{`p = 0.5`}</InlineMath>) or biased
              (<InlineMath>{`p = 0.5 + \delta`}</InlineMath>). With small bias, sequences
              from the two hypotheses are nearly indistinguishable over short horizons.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <LikelihoodRatioSim />

        {/* Intuition */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Given a sequence of coin flips, the goal is to discriminate between
              two hypotheses. With 10 flips and 6 heads, the evidence is ambiguous.
              With 1,000 flips and 600 heads, the evidence is overwhelming.
            </p>
            <p>The framework:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Null hypothesis <InlineMath>{`H_0`}</InlineMath>:</strong> The coin is fair (<InlineMath>{`p = 0.5`}</InlineMath>). No effect.</li>
              <li><strong>Alternative hypothesis <InlineMath>{`H_1`}</InlineMath>:</strong> The coin is biased (<InlineMath>{`p = 0.5 + \delta`}</InlineMath>). A real effect exists.</li>
            </ul>
            <p>Two error types:</p>
            <ol className="list-decimal ml-6 space-y-1">
              <li><strong>False positive</strong> (Type I): conclude biased when it is fair.</li>
              <li><strong>False negative</strong> (Type II): conclude fair when it is biased.</li>
            </ol>
            <p>
              Traditionally: <InlineMath>{`\\alpha = 0.05`}</InlineMath> (max false positive rate),{' '}
              <InlineMath>{`\\beta = 0.20`}</InlineMath> (max false negative rate).{' '}
              <strong>Power</strong> <InlineMath>{`= 1 - \\beta = 0.80`}</InlineMath>.
            </p>
          </div>
        </div>

        {/* Mathematical Formulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">The likelihood</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Suppose <InlineMath>{`n`}</InlineMath> flips produce <InlineMath>{`k`}</InlineMath> heads.
          </p>
          <p>Under <InlineMath>{`H_0`}</InlineMath> (fair coin, <InlineMath>{`p = 0.5`}</InlineMath>):</p>
          <BlockMath>{`\\mathcal{L}_0 = (0.5)^k \\times (0.5)^{n-k} = (0.5)^n`}</BlockMath>
          <p>Under <InlineMath>{`H_1`}</InlineMath> (biased coin, <InlineMath>{`p = 0.5 + \\delta`}</InlineMath>):</p>
          <BlockMath>{`\\mathcal{L}_1 = (0.5 + \\delta)^k \\times (0.5 - \\delta)^{n-k}`}</BlockMath>
        </div>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">The likelihood ratio</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\Lambda_n = \\frac{\\mathcal{L}_1}{\\mathcal{L}_0} = \\frac{(0.5+\\delta)^k \\;(0.5-\\delta)^{n-k}}{(0.5)^n}`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              The likelihood ratio quantifies how many times more probable the observed data are
              under <InlineMath>{`H_1`}</InlineMath> relative to <InlineMath>{`H_0`}</InlineMath>.
            </p>
          </div>
        </div>

        {/* Worked example */}
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            <strong>Worked example.</strong>{' '}
            <InlineMath>{`\\delta = 0.1`}</InlineMath> (biased coin has{' '}
            <InlineMath>{`p = 0.6`}</InlineMath>);{' '}
            <InlineMath>{`n = 10`}</InlineMath> flips, <InlineMath>{`k = 7`}</InlineMath> heads.
          </p>
          <BlockMath>{`\\begin{aligned}
\\mathcal{L}_1 &= (0.6)^7 \\times (0.4)^3 \\approx 0.001792 \\\\
\\mathcal{L}_0 &= (0.5)^{10} \\approx 0.000977 \\\\
\\Lambda_{10} &= \\frac{0.001792}{0.000977} \\approx 1.83
\\end{aligned}`}</BlockMath>
          <p>
            The data is <InlineMath>{`\\approx 1.83`}</InlineMath> times more likely if the coin
            is biased. Evidence, but not overwhelming.
          </p>
        </div>

        {/* Interpreting LR */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Interpreting <InlineMath>{`\\Lambda_n`}</InlineMath>
        </h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`\\Lambda_n`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3"><InlineMath>{`= 1`}</InlineMath></td><td className="border border-neutral-300 p-3">Data equally consistent with both hypotheses</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`= 10`}</InlineMath></td><td className="border border-neutral-300 p-3">10&times; more likely under <InlineMath>{`H_1`}</InlineMath> &mdash; moderate evidence</td></tr>
              <tr><td className="border border-neutral-300 p-3"><InlineMath>{`= 100`}</InlineMath></td><td className="border border-neutral-300 p-3">100&times; more likely under <InlineMath>{`H_1`}</InlineMath> &mdash; strong evidence</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`= 0.1`}</InlineMath></td><td className="border border-neutral-300 p-3">10&times; more likely under <InlineMath>{`H_0`}</InlineMath> &mdash; evidence for fairness</td></tr>
            </tbody>
          </table>
        </div>

        {/* Incremental updating */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Incremental updating</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p><InlineMath>{`\\Lambda_n`}</InlineMath> can be computed one flip at a time:</p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\Lambda_n = \\Lambda_{n-1} \\times \\frac{f_1(x_n)}{f_0(x_n)}`}</BlockMath>
          </div>
          <p>
            where <InlineMath>{`f_j(x_n)`}</InlineMath> is the probability of the{' '}
            <InlineMath>{`n`}</InlineMath>th flip&apos;s outcome under <InlineMath>{`H_j`}</InlineMath>.
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Heads: multiply by <InlineMath>{`\\frac{0.5 + \\delta}{0.5}`}</InlineMath>.</li>
            <li>Tails: multiply by <InlineMath>{`\\frac{0.5 - \\delta}{0.5}`}</InlineMath>.</li>
          </ul>
          <p>This incremental structure is what makes <em>sequential</em> testing possible.</p>
        </div>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Starting value</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Before any data: <InlineMath>{`\\Lambda_0 = 1`}</InlineMath>.
            Neither hypothesis is favoured. This will be important for <a href="#ref-ville-1939" className="text-blue-600 hover:text-blue-800">Ville&apos;s inequality</a>
            (which requires the starting value to equal 1).
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>Key concepts:</strong> null hypothesis, alternative hypothesis, likelihood,
              likelihood ratio, false positive, false negative, power, incremental updating.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
