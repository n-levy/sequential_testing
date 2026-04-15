'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { SPRTSim } from './sims/SPRTSim'

export function DetailedAct6() {
  return (
    <section id="act-6" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 6 &mdash; SPRT: Wald&apos;s Sequential Probability Ratio Test (1945)
          </h2>
        </div>

        {/* Simulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Simulation</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Two coins: one fair (<InlineMath>{`H_0`}</InlineMath>), one biased (<InlineMath>{`H_1`}</InlineMath>).
              The user does not know which they have.
            </p>
            <p>
              <InlineMath>{`\\Lambda_n`}</InlineMath> is plotted as a path. Two thresholds:
              <strong> Upper</strong> at <InlineMath>{`\\Lambda_n = B`}</InlineMath>: cross this
              &rArr; &ldquo;coin is biased.&rdquo;{' '}
              <strong>Lower</strong> at <InlineMath>{`\\Lambda_n = A`}</InlineMath>: fall below this
              &rArr; &ldquo;coin is fair.&rdquo;
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <SPRTSim />

        {/* Intuition */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4 mt-8">Intuitive Explanation</h3>
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Abraham Wald (1943, published 1945) asked: given that we can peek at the data
              anytime, what is the most <em>efficient</em> way to decide between two hypotheses?
            </p>
            <p>
              His answer: compute <InlineMath>{`\\Lambda_n`}</InlineMath> after each observation.
              If it gets high enough, conclude <InlineMath>{`H_1`}</InlineMath>. Low enough,
              conclude <InlineMath>{`H_0`}</InlineMath>. Otherwise, keep collecting.
            </p>
            <p>
              Wald proved this is <strong>optimal</strong>: no other sequential test with the same
              error guarantees needs fewer observations on average. In fact, the SPRT typically
              requires <strong>47&ndash;63% fewer observations</strong> than the best
              fixed-sample test with the same error rates.
            </p>
          </div>
        </div>

        {/* Mathematical Formulation */}
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
          <table className="w-full text-sm border-collapse border border-neutral-300">
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
            <table className="w-full text-sm border-collapse border border-neutral-300">
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

        {/* Historical Note */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-neutral-700 mb-3">Historical Note</h4>
          <p className="text-neutral-700">
            Wald conjectured in his 1945 paper that the SPRT is <em>exactly</em> optimal.
            Three years later, Wald &amp; Wolfowitz (1948) proved the general result: among{' '}
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
