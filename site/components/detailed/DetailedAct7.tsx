'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { SPRTSim } from './sims/SPRTSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'

export function DetailedAct7() {

  return (
    <section id="act-7" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 7 &mdash; SPRT: Wald's Sequential Probability Ratio Test (1945)
          </h2>
        </div>

        {/* Intuition: How do you make the most efficient sequential decision? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Imagine you have a coin, but you don't know if it's fair (<InlineMath>{`H_0`}</InlineMath>) or biased (<InlineMath>{`H_1`}</InlineMath>). You want to decide as quickly as possible, but you can peek after every flip.
            </p>
            <p>
              <strong>Wald's answer:</strong> After each observation, compute <InlineMath>{`\Lambda_n`}</InlineMath>. If it gets high enough, call the coin biased. If it drops low enough, call it fair. Otherwise, keep flipping.
            </p>
            <p>
              <strong>Key point:</strong> This is the most efficient way to decide between two hypotheses with error guarantees. On average, it needs far fewer observations than any fixed-sample test.
            </p>
          </div>
        </div>

        {/* Simulation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Flip a coin and watch <InlineMath>{`\Lambda_n`}</InlineMath> move. If it crosses the upper threshold (<InlineMath>{`B`}</InlineMath>), you call the coin biased. If it falls below the lower threshold (<InlineMath>{`A`}</InlineMath>), you call it fair. Otherwise, keep going.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <SPRTSim />

        {/* Simulation takeaway */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-amber-800">
            <strong>Simulation takeaway:</strong> The SPRT lets you decide as soon as the evidence is strong enough, saving time and samples. But it requires you to pick the effect size in advance.
          </p>
        </div>

        {/* Mathematical Formulation */}
        <DisplayMathBox>
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Decision rule</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Choose error tolerances <InlineMath>{`\\alpha`}</InlineMath> (false positive rate) and{' '}
            <InlineMath>{`\\beta`}</InlineMath> (false negative rate). Compute two thresholds:
          </p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`B = \\frac{1 - \\beta}{\\alpha}, \\quad A = \\frac{\\beta}{1 - \\alpha}`}</BlockMath>
          </div>
          <p>
            <strong>Example</strong> (<InlineMath>{`\\alpha = 0.05`}</InlineMath>,{' '}
            <InlineMath>{`\\beta = 0.20`}</InlineMath>):
          </p>
          <BlockMath>{`B = \\frac{0.80}{0.05} = 16, \\quad A = \\frac{0.20}{0.95} \\approx 0.211`}</BlockMath>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Condition</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Decision</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3"><InlineMath>{`\\Lambda_n \\geq B = 16`}</InlineMath></td><td className="border border-neutral-300 p-3">Reject <InlineMath>{`H_0`}</InlineMath></td><td className="border border-neutral-300 p-3">&ldquo;Coin is biased&rdquo;</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`\\Lambda_n \\leq A \\approx 0.21`}</InlineMath></td><td className="border border-neutral-300 p-3">Accept <InlineMath>{`H_0`}</InlineMath></td><td className="border border-neutral-300 p-3">&ldquo;Coin is fair&rdquo;</td></tr>
              <tr><td className="border border-neutral-300 p-3"><InlineMath>{`A < \\Lambda_n < B`}</InlineMath></td><td className="border border-neutral-300 p-3">Keep flipping</td><td className="border border-neutral-300 p-3">&ldquo;Not enough evidence yet&rdquo;</td></tr>
            </tbody>
          </table>
        </div>

        {/* Savings */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Savings over fixed-sample tests</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`\\alpha`}</InlineMath></th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`\\beta`}</InlineMath></th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Saving in expected observations</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-neutral-300 p-3">0.05</td><td className="border border-neutral-300 p-3">0.05</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 53\\%`}</InlineMath></td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">0.05</td><td className="border border-neutral-300 p-3">0.01</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 47\\%`}</InlineMath></td></tr>
                <tr><td className="border border-neutral-300 p-3">0.01</td><td className="border border-neutral-300 p-3">0.01</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 63\\%`}</InlineMath></td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              The SPRT needs, on average, only about <strong>half as many observations</strong> as
              a traditional fixed-sample test. This was a remarkable result in 1945 and
              remains one of the main motivations for sequential testing.
            </p>
          </div>
        </div>

        {/* Critical weakness */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">The critical weakness</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            SPRT requires specifying <InlineMath>{`\\delta`}</InlineMath> in advance &mdash;
            the exact alternative hypothesis <InlineMath>{`H_1`}</InlineMath>. If you set{' '}
            <InlineMath>{`\\delta = 0.1`}</InlineMath> but the true bias is{' '}
            <InlineMath>{`0.03`}</InlineMath>, the likelihood ratio is computed against the
            wrong alternative. The test may take much longer, or still determine the correct
            answer but far less efficiently.
          </p>
          <p>
            In A/B testing &mdash; where the effect size is typically unknown &mdash; this is a
            serious limitation. The next two acts address this.
          </p>
        </div>

        </DisplayMathBox>

        {/* Historical Note */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-neutral-700 mb-3">Historical Note</h4>
          <p className="text-neutral-700">
            Wald conjectured in his 1945 paper that the SPRT is <em>exactly</em> optimal.
            Three years later, <a href="#ref-wald-wolfowitz-1948" className="text-blue-600 hover:text-blue-800">Wald &amp; Wolfowitz (1948)</a> proved the general result: among{' '}
            <strong>all</strong> sequential tests with the same or smaller error probabilities{' '}
            <InlineMath>{`(\\alpha, \\beta)`}</InlineMath>, the SPRT minimises the expected sample
            size under both <InlineMath>{`H_0`}</InlineMath> and <InlineMath>{`H_1`}</InlineMath> simultaneously.
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>Key concepts:</strong> SPRT decision rule, Wald&apos;s boundary approximations,
              47&ndash;63% saving over fixed-sample tests, optimality (Wald &amp; Wolfowitz 1948),
              the critical dependence on a pre-specified effect size.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
