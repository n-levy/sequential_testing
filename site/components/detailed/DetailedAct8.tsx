'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { MixtureSPRTSim } from './sims/MixtureSPRTSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'

export function DetailedAct8() {

  return (
    <section id="act-8" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 8 &mdash; The Mixture Approach: From Robbins (1970) to the mSPRT
          </h2>
        </div>

        {/* Intuition: What if you don't know the effect size? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              The SPRT is powerful, but it requires you to pick a single effect size in advance. What if you don't know it? Robbins' idea: average the likelihood ratio over a range of plausible effect sizes.
            </p>
            <p>
              <strong>Key point:</strong> This "mixture" likelihood ratio is still a martingale under <InlineMath>{`H_0`}</InlineMath>. Ville's inequality still applies. You get the anytime-valid guarantee, but now the test is robust to a range of effect sizes.
            </p>
          </div>
        </div>

        <DisplayMathBox>
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
            <li>Each <InlineMath>{`\\Lambda_n^\\delta`}</InlineMath> is a non-negative martingale under <InlineMath>{`H_0`}</InlineMath> (Act 5).</li>
            <li>A weighted average (integral) of martingales is a martingale (linearity of conditional expectation).</li>
          </ol>
          <p>Therefore Ville&apos;s inequality gives:</p>
          <BlockMath>{`\\PP\\!\\left(\\Lambda_n^{H} \\text{ ever} \\geq \\frac{1}{\\alpha}\\right) \\leq \\alpha`}</BlockMath>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\Lambda_n^{H}`}</InlineMath> — the mixture likelihood ratio: a weighted average of the likelihood ratios for all possible effect sizes, weighted by the mixing distribution <InlineMath>{`H`}</InlineMath></li>
            <li><InlineMath>{`1/\\alpha`}</InlineMath> — the rejection threshold (e.g. 20 for <InlineMath>{`\\alpha = 0.05`}</InlineMath>)</li>
            <li><InlineMath>{`\\PP(\\cdot \\text{ ever} \\geq 1/\\alpha)`}</InlineMath> — the probability that the mixture statistic crosses the threshold at <em>any</em> point during the experiment</li>
            <li><InlineMath>{`\\alpha`}</InlineMath> — the overall false positive rate, controlled even under continuous monitoring</li>
          </ul>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p><strong>Symbol by symbol:</strong></p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li><InlineMath>{`\\Lambda_n^{\\delta}`}</InlineMath> = the likelihood ratio assuming effect size <InlineMath>{`\\delta`}</InlineMath>.</li>
            <li><InlineMath>{`dH(\\delta)`}</InlineMath> = how much weight to give effect size <InlineMath>{`\\delta`}</InlineMath>.</li>
            <li><InlineMath>{`\\int`}</InlineMath> = the integral &mdash; takes a weighted average (mixture) over all possible <InlineMath>{`\\delta`}</InlineMath>.</li>
          </ul>
          <p className="mt-2">
            The result is the expected likelihood ratio under the mixing distribution{' '}
            <InlineMath>{`H`}</InlineMath>, averaging evidence across all plausible effect sizes.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-neutral-800">
          <p className="font-semibold mb-2">What is the &ldquo;mixture <InlineMath>{`\\tau`}</InlineMath>&rdquo;?</p>
          <p className="mb-2">
            The mixing distribution <InlineMath>{`H`}</InlineMath> is your <em>prior belief</em> about
            how big the true effect could plausibly be. A common choice is{' '}
            <InlineMath>{`H = \\mathcal{N}(0, \\tau^2 \\sigma^2)`}</InlineMath> &mdash; a Normal centred at zero
            with spread controlled by the parameter <InlineMath>{`\\tau`}</InlineMath>.
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <strong>Small <InlineMath>{`\\tau`}</InlineMath></strong> &mdash; you assume the effect
              (if any) is small. The test is most powerful for small effects, less powerful for
              large ones.
            </li>
            <li>
              <strong>Large <InlineMath>{`\\tau`}</InlineMath></strong> &mdash; you allow for
              potentially large effects. The test gains power against big effects but pays for it
              with wider confidence intervals.
            </li>
          </ul>
          <p className="mt-2">
            <InlineMath>{`\\tau`}</InlineMath> is therefore a <em>tuning knob</em>: pick it to match
            the smallest effect size you genuinely care about detecting. In Act 9 we will see that
            Eppo (2022) exposes this as the <em>target sample size</em> <InlineMath>{`\\nu`}</InlineMath>,
            which plays the same role under a different parameterisation.
          </p>
        </div>


        {/* Interactive Simulation */}
        <MixtureSPRTSim />

        {/* Simulation takeaway */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Simulation takeaway:</strong> The mixture approach lets you test for a range of effect sizes, not just one. The anytime-valid guarantee is preserved.
          </p>
        </div>

        {/* Part B: mSPRT */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
          Part B: The mSPRT for A/B Testing (Johari et al., 2017)
        </h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              <a href="#ref-johari-2017" className="text-blue-600 hover:text-blue-800">Johari, Pekelis, and Walsh (2017)</a> applied Robbins&apos; idea to the specific
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
            <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
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
            The mSPRT statistic is large when the sample mean is far from zero (strong
            signal), the sample size is large, and the observation noise is small relative
            to the mixing-distribution variance.
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

        </DisplayMathBox>

        {/* Key Takeaway */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Key concepts:</strong> Robbins&apos; mixture idea, the mSPRT as a weighted
              average of likelihood ratios, the closed-form Normal formula, the role of{' '}
              <InlineMath>{`\\tau`}</InlineMath>, no lower boundary, the known-variance assumption.
            </p>
            <p>
              <strong>What&apos;s next:</strong> The mSPRT was a landmark &mdash; but it is not
              what Eppo (2022) uses. The next act introduces <strong>confidence sequences</strong> from
              <a href="#ref-howard-2021" className="text-blue-600 hover:text-blue-800">Howard et al. (2021)</a>, a more general framework that Eppo (2022) adopted instead.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
