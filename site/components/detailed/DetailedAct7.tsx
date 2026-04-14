'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { MixtureSPRTSim } from './sims/MixtureSPRTSim'

export function DetailedAct7() {
  return (
    <section id="act-7" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 7 &mdash; The Mixture Approach: From Robbins (1970) to the mSPRT
          </h2>
          <p className="text-neutral-600">
            Two parts: Robbins&apos; key idea, then Johari et al.&apos;s application to A/B testing.
          </p>
        </div>

        {/* Part A: Robbins */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Part A: Robbins&apos; Mixture Approach (1970)</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Wald&apos;s SPRT is like betting everything on one horse: you pick a specific
              effect size <InlineMath>{`\\delta`}</InlineMath> and compute evidence based on that choice.
              If the horse wins (the true effect is near <InlineMath>{`\\delta`}</InlineMath>), you
              are fast. Otherwise, slow.
            </p>
            <p>
              Herbert Robbins proposed a radical alternative in 1970:{' '}
              <strong>bet on all horses simultaneously.</strong> Instead of choosing one{' '}
              <InlineMath>{`\\delta`}</InlineMath>, spread your &ldquo;evidence budget&rdquo; across
              many possible effect sizes using a weighting scheme (a mixing distribution{' '}
              <InlineMath>{`H`}</InlineMath>).
            </p>
            <p>
              The key insight: this average likelihood ratio is <em>still</em> a non-negative
              martingale under <InlineMath>{`H_0`}</InlineMath>. Ville&apos;s inequality still
              applies. The anytime-valid guarantee is preserved.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">The fundamental result</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Robbins observed that if <InlineMath>{`\\Lambda_n^\\delta`}</InlineMath> is the likelihood
            ratio for a specific effect size <InlineMath>{`\\delta`}</InlineMath>, then the{' '}
            <strong>mixture likelihood ratio</strong>
          </p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\Lambda_n^{H} = \\int \\Lambda_n^{\\delta} \\, dH(\\delta)`}</BlockMath>
          </div>
          <p>
            is also a non-negative martingale starting at 1 under <InlineMath>{`H_0`}</InlineMath>,
            because:
          </p>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Each <InlineMath>{`\\Lambda_n^\\delta`}</InlineMath> is a non-negative martingale under <InlineMath>{`H_0`}</InlineMath> (Act 4).</li>
            <li>A weighted average (integral) of martingales is a martingale (linearity of conditional expectation).</li>
          </ol>
          <p>Therefore Ville&apos;s inequality gives:</p>
          <BlockMath>{`\\PP\\!\\left(\\Lambda_n^{H} \\text{ ever} \\geq \\frac{1}{\\alpha}\\right) \\leq \\alpha`}</BlockMath>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p><strong>Symbol by symbol:</strong></p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li><InlineMath>{`\\Lambda_n^{\\delta}`}</InlineMath> = the likelihood ratio assuming effect size <InlineMath>{`\\delta`}</InlineMath>.</li>
            <li><InlineMath>{`dH(\\delta)`}</InlineMath> = how much weight to give effect size <InlineMath>{`\\delta`}</InlineMath>.</li>
            <li><InlineMath>{`\\int`}</InlineMath> = continuous version of summation &mdash; averages over all possible <InlineMath>{`\\delta`}</InlineMath>.</li>
          </ul>
          <p className="mt-2">
            Think: &ldquo;average likelihood ratio across an infinitely large expert panel,
            weighted by credibility.&rdquo;
          </p>
        </div>

        {/* Interactive Simulation */}
        <MixtureSPRTSim />

        {/* Part B: mSPRT */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
          Part B: The mSPRT for A/B Testing (Johari et al., 2017)
        </h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Johari, Pekelis, and Walsh (2017) applied Robbins&apos; idea to the specific
              setting of A/B tests. They chose the Normal distribution as the mixing
              distribution <InlineMath>{`H`}</InlineMath> and derived a closed-form formula for
              the mixture likelihood ratio. They called it the{' '}
              <strong>mixture Sequential Probability Ratio Test (mSPRT)</strong>.
            </p>
            <p>
              Their key contribution: making the theory practical. They gave explicit
              formulas, calibration guidance for <InlineMath>{`\\tau`}</InlineMath>, and proved that being within
              an order of magnitude of the true effect-size variance is sufficient for
              near-optimal power.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Closed form for Normal observations</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Assumptions:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              Observations <InlineMath>{`x_i \\sim \\mathcal{N}(\\mu, \\sigma^2)`}</InlineMath>{' '}
              (Normal with mean <InlineMath>{`\\mu`}</InlineMath>, <strong>known</strong> variance{' '}
              <InlineMath>{`\\sigma^2`}</InlineMath>).
            </li>
            <li>
              Mixing distribution <InlineMath>{`H = \\mathcal{N}(0, \\tau^2 \\sigma^2)`}</InlineMath>{' '}
              (Normal centred at 0, variance proportional to <InlineMath>{`\\sigma^2`}</InlineMath>).
            </li>
          </ul>

          <p>The mixture likelihood ratio (Johari et al., Proposition 1):</p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\Lambda_n^{H} = \\frac{1}{\\sqrt{1 + n\\tau^2}} \\;\\exp\\!\\left(\\frac{n\\tau^2\\, \\bar{x}_n^2}{2\\,(\\sigma^2/n)\\,(1 + n\\tau^2)}\\right)`}</BlockMath>
          </div>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Unpacking every piece:</strong></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Symbol</th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-neutral-300 p-3"><InlineMath>{`\\sigma^2`}</InlineMath></td><td className="border border-neutral-300 p-3">Variance of individual observations (how noisy the data is)</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`n`}</InlineMath></td><td className="border border-neutral-300 p-3">Number of observations so far</td></tr>
                <tr><td className="border border-neutral-300 p-3"><InlineMath>{`\\tau^2`}</InlineMath></td><td className="border border-neutral-300 p-3">Variance of the mixing distribution; controls how wide a range of effect sizes we consider plausible</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`\\bar{x}_n`}</InlineMath></td><td className="border border-neutral-300 p-3">Sample mean after <InlineMath>{`n`}</InlineMath> observations</td></tr>
                <tr><td className="border border-neutral-300 p-3"><InlineMath>{`1/\\sqrt{1 + n\\tau^2}`}</InlineMath></td><td className="border border-neutral-300 p-3">Shrinkage factor; slowly decreases as <InlineMath>{`n`}</InlineMath> grows</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`\\exp(\\cdot)`}</InlineMath></td><td className="border border-neutral-300 p-3"><InlineMath>{`e \\approx 2.718`}</InlineMath> raised to the argument; grows rapidly when <InlineMath>{`\\bar{x}_n`}</InlineMath> is far from zero</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            &ldquo;The mSPRT score is large when the observed average is far from zero (strong
            signal), there are many observations, and the noise is low relative to the
            prior width.&rdquo;
          </p>
        </div>

        {/* Decision rule */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Decision rule</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\text{Stop and reject } H_0 \\text{ when:} \\quad \\Lambda_n^{H} \\geq \\frac{1}{\\alpha}`}</BlockMath>
          </div>
          <p>
            For <InlineMath>{`\\alpha = 0.05`}</InlineMath>: stop when{' '}
            <InlineMath>{`\\Lambda_n^{H} \\geq 20`}</InlineMath>.
          </p>
          <p>
            <strong>No lower boundary.</strong> Unlike the SPRT, the mSPRT cannot definitively
            confirm <InlineMath>{`H_0`}</InlineMath>. In practice, experiments run for a fixed
            maximum duration; if the threshold is never crossed, conclude: &ldquo;No significant
            effect detected.&rdquo;
          </p>
        </div>

        {/* Key assumption */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Key assumption: known variance</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            The mSPRT formula assumes <InlineMath>{`\\sigma^2`}</InlineMath> is known. For
            continuous data this is typically estimated; for binary data (e.g. click/no-click),
            the exact mSPRT results hold only approximately via the Central Limit Theorem.
            For large samples (<InlineMath>{`n \\geq 100`}</InlineMath>, nearly always true in
            A/B testing), the approximation is excellent.
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Key concepts:</strong> Robbins&apos; mixture idea, the mSPRT as a weighted
              average of likelihood ratios, the closed-form Normal formula, the role of{' '}
              <InlineMath>{`\\tau`}</InlineMath>, no lower boundary, the known-variance assumption.
            </p>
            <p>
              <strong>What&apos;s next:</strong> The mSPRT was a landmark &mdash; but it is not
              what Eppo uses. The next act introduces <strong>confidence sequences</strong> from
              Howard et al. (2021), a more general framework that Eppo adopted instead.
            </p>
          </div>
        </div>

        {/* Transition */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
          <p className="text-neutral-600 italic">
            &ldquo;The mixture approach works, but can we make it nonparametric?
            Howard et al. found the answer.&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
