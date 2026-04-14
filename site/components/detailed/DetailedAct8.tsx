'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'

export function DetailedAct8() {
  return (
    <section id="act-8" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 8 &mdash; Confidence Sequences: The Modern Framework
          </h2>
          <p className="text-neutral-600">(Howard et al., 2021)</p>
        </div>

        {/* Simulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Simulation</h3>
        <div className="bg-orange-50 border border-orange-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-orange-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Data arrives one observation at a time. Two bands track the estimated mean:
              a <strong>fixed 95% CI</strong> (recomputed at each step) &mdash; shrinks as{' '}
              <InlineMath>{`1/\\sqrt{n}`}</InlineMath>, but invalidated by peeking &mdash; and
              a <strong>confidence sequence</strong> &mdash; wider at first, but valid at{' '}
              <em>all</em> times simultaneously.
            </p>
          </div>
        </div>

        {/* Intuition */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Intuitive Explanation</h3>
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              A confidence sequence is the natural answer to the peeking problem for
              estimation (not just testing).
            </p>
            <p>
              A standard 95% confidence interval says: &ldquo;We are 95% confident the true
              value is in this range <em>right now</em>.&rdquo; But if you check again tomorrow
              with new data, the guarantee resets. Check 100 times and you are almost
              guaranteed to be wrong at least once.
            </p>
            <p>
              A confidence sequence says: &ldquo;We are 95% confident the true value has been
              in this range <em>at every single time we have ever checked, and at every
              time we will ever check in the future</em>.&rdquo;
            </p>
            <p>
              This is a strictly stronger guarantee. The price: the band is wider than a
              fixed CI at any single time. But in exchange, you are free to monitor
              continuously, stop whenever you want, and report at any time.
            </p>
          </div>
        </div>

        {/* Mathematical Formulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Definition</h4>
        <div className="bg-white border-2 border-neutral-400 rounded-lg p-5 mb-6">
          <p className="font-semibold text-neutral-900 mb-2">Definition (Confidence Sequence)</p>
          <div className="text-neutral-700">
            <p>
              A sequence of intervals <InlineMath>{`(C_t)_{t \\geq 1}`}</InlineMath> is a{' '}
              <InlineMath>{`(1-\\alpha)`}</InlineMath>-<strong>confidence sequence</strong> (CS) for
              a parameter <InlineMath>{`\\mu`}</InlineMath> if:
            </p>
            <div className="bg-neutral-50 border border-neutral-300 rounded p-3 mt-2">
              <BlockMath>{`\\PP\\!\\bigl(\\mu \\in C_t \\text{ for all } t \\geq 1\\bigr) \\geq 1 - \\alpha`}</BlockMath>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            The <strong>entire sequence</strong> of intervals simultaneously covers the true
            parameter with probability at least <InlineMath>{`1 - \\alpha`}</InlineMath>. Not
            just at one time &mdash; at every time.
          </p>
        </div>

        {/* The Normal Mixture Boundary */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">The Normal Mixture Boundary (the key formula)</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            The centrepiece of Howard et al. is the <strong>Normal mixture confidence
            sequence</strong>. For sub-Gaussian observations with intrinsic time (cumulative
            variance) <InlineMath>{`v_t = \\sum_{i=1}^t \\sigma_i^2`}</InlineMath>:
          </p>
          <div className="bg-white border-2 border-green-400 rounded-lg p-4">
            <BlockMath>{`u(v) = \\sqrt{(v + \\nu) \\cdot \\log\\!\\frac{v + \\nu}{\\nu \\alpha^2}}`}</BlockMath>
          </div>
          <p>
            The <InlineMath>{`(1-\\alpha)`}</InlineMath>-confidence sequence is:
          </p>
          <BlockMath>{`C_t = \\left(\\bar{x}_t - \\frac{u(v_t)}{t},\\; \\bar{x}_t + \\frac{u(v_t)}{t}\\right)`}</BlockMath>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Unpacking the boundary:</strong></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Symbol</th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-neutral-300 p-3"><InlineMath>{`v`}</InlineMath></td><td className="border border-neutral-300 p-3"><strong>Intrinsic time</strong>: the cumulative variance of observations so far. For i.i.d. data: <InlineMath>{`v_t = t\\sigma^2`}</InlineMath>.</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`\\nu > 0`}</InlineMath></td><td className="border border-neutral-300 p-3"><strong>Tuning parameter</strong>: controls which sample sizes the boundary is tightest for. The boundary is approximately optimised for <InlineMath>{`v \\approx \\nu`}</InlineMath>.</td></tr>
                <tr><td className="border border-neutral-300 p-3"><InlineMath>{`\\alpha`}</InlineMath></td><td className="border border-neutral-300 p-3">Significance level (e.g. 0.05)</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`\\log(\\cdot)`}</InlineMath></td><td className="border border-neutral-300 p-3">Natural logarithm</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            The boundary <InlineMath>{`u(v)`}</InlineMath> tells you how far from zero the running
            sum <InlineMath>{`S_t`}</InlineMath> can drift before you can reject{' '}
            <InlineMath>{`H_0`}</InlineMath>. The parameter <InlineMath>{`\\nu`}</InlineMath> lets
            you tune where the boundary is tightest. If you expect to collect{' '}
            <InlineMath>{`N`}</InlineMath> observations total with variance{' '}
            <InlineMath>{`\\sigma^2`}</InlineMath>, setting{' '}
            <InlineMath>{`\\nu \\approx N\\sigma^2`}</InlineMath> makes the boundary tightest
            around <InlineMath>{`n = N`}</InlineMath>.
          </p>
        </div>

        {/* Connection to Robbins and mSPRT */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Connection to Robbins and the mSPRT</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>Howard et al. explicitly credit Robbins (1970) as their starting point:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Robbins (1970):</strong> introduced the mixture approach and confidence sequences, but only for known-variance Normal data.</li>
            <li><strong>Johari et al. (2017):</strong> made it practical for A/B testing via the mSPRT, but still assumed known variance and parametric (Normal) data.</li>
            <li><strong>Howard et al. (2021): extended to nonparametric settings</strong> via the sub-<InlineMath>{`\\psi`}</InlineMath> framework. The boundary works for <em>any</em> sub-Gaussian data (not just Normal), the variance can be unknown (estimated from data), and the coverage guarantee is exact (non-asymptotic).</li>
          </ul>
        </div>

        {/* Growth rate comparison */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Growth rate comparison</h4>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Method</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Half-width rate</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3">Fixed-sample CI</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\frac{\\sigma}{\\sqrt{n}} \\cdot z_{\\alpha/2}`}</InlineMath></td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">Normal mixture CS</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\frac{1}{n}\\sqrt{(n\\sigma^2 + \\nu) \\log\\frac{n\\sigma^2 + \\nu}{\\nu\\alpha^2}}`}</InlineMath></td></tr>
              <tr><td className="border border-neutral-300 p-3">LIL-rate CS</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\frac{\\sigma}{\\sqrt{n}} \\cdot \\sqrt{2\\log\\log(n\\sigma^2)}`}</InlineMath></td></tr>
            </tbody>
          </table>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            The Normal mixture CS is wider than the fixed CI by a factor of{' '}
            <InlineMath>{`\\approx \\sqrt{\\log n}`}</InlineMath> (the price of peeking). It is
            slightly wider than the LIL-rate CS asymptotically, but{' '}
            <strong>tighter in practice</strong> over the 2&ndash;3 orders of magnitude of
            sample sizes relevant to A/B testing.
          </p>
        </div>

        {/* Why Eppo chose this */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Why Eppo chose this framework</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <ol className="list-decimal ml-6 space-y-2">
            <li><strong>Anytime-valid:</strong> Experimenters will peek &mdash; the guarantee must hold at every moment. &#10003;</li>
            <li><strong>No known variance required:</strong> Real experiments have unknown, potentially changing variance. &#10003;</li>
            <li><strong>No distributional assumption:</strong> Metrics like revenue or session length are far from Normal. &#10003;</li>
            <li><strong>Tunable tightness:</strong> Different experiments have different expected durations. &#10003;</li>
            <li><strong>Produces a confidence interval:</strong> Experimenters need to report &ldquo;the lift is +3% &plusmn; 1.5%&rdquo;, not just &ldquo;significant / not significant.&rdquo; &#10003;</li>
          </ol>
        </div>

        {/* Key Takeaway */}
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Key concepts:</strong> confidence sequences (uniform coverage over all times),
              the Normal mixture boundary{' '}
              <InlineMath>{`u(v) = \\sqrt{(v+\\nu)\\log\\frac{v+\\nu}{\\nu\\alpha^2}}`}</InlineMath>,
              the tuning parameter <InlineMath>{`\\nu`}</InlineMath>, the sub-<InlineMath>{`\\psi`}</InlineMath> framework,
              nonparametric validity, the <InlineMath>{`\\sqrt{\\log n}`}</InlineMath> &ldquo;price of peeking.&rdquo;
            </p>
            <p>
              <strong>This is the framework Eppo uses.</strong> The boundary formula from this act
              is the engine inside Eppo&apos;s confidence interval.
            </p>
          </div>
        </div>

        {/* Transition */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
          <p className="text-neutral-600 italic">
            &ldquo;The theory is complete. Now let&apos;s see what problems a real A/B
            testing platform must solve.&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
