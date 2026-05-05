'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { SequentialMultiplierSim } from './sims/SequentialMultiplierSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'

export function DetailedAct13() {

  return (
    <section id="act-13" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 13 &mdash; Sequential Confidence Intervals in Eppo (2022)
          </h2>
        </div>

        {/* Intuition: How does Eppo (2022) report results you can trust? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Eppo's (2022) confidence interval is valid at every time you check, not just one. This lets you monitor continuously and make decisions as soon as the evidence is clear.
            </p>
            <p>
              <strong>Key point:</strong> The interval is a bit wider than a classical CI, but you can stop at any time and the guarantee still holds.
            </p>
          </div>
        </div>

        {/* The formula */}
        <DisplayMathBox>
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Formula, Revisited</h3>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>From the pipeline (Act 11, Step 6):</p>
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <BlockMath>{`\\text{CI}(t) = \\hat{\\tau}(t) \\pm \\hat{\\sigma}_{\\hat{\\tau}}(t) \\cdot \\underbrace{\\sqrt{\\frac{n + \\nu}{n} \\cdot \\log\\!\\frac{n + \\nu}{\\nu \\alpha}}}_{\\text{sequential multiplier}}`}</BlockMath>
          </div>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\text{CI}(t)`}</InlineMath>:the sequential (anytime-valid) confidence interval at time <InlineMath>{`t`}</InlineMath></li>
            <li><InlineMath>{`\\hat{\\tau}(t)`}</InlineMath>:the estimated treatment effect at time <InlineMath>{`t`}</InlineMath> (the centre of the interval)</li>
            <li><InlineMath>{`\\hat{\\sigma}_{\\hat{\\tau}}(t)`}</InlineMath>:the estimated standard error of <InlineMath>{`\\hat{\\tau}(t)`}</InlineMath></li>
            <li><InlineMath>{`n`}</InlineMath>:the total number of users observed at time <InlineMath>{`t`}</InlineMath></li>
            <li><InlineMath>{`\\nu`}</InlineMath>:the tuning parameter set as <InlineMath>{`\\nu = M \\cdot \\hat{\\sigma}^2`}</InlineMath>, where <InlineMath>{`M`}</InlineMath> is the planned total sample size; calibrates the interval to be tightest near the planned end date</li>
            <li><InlineMath>{`\\alpha`}</InlineMath>:the significance level (e.g. 0.05 for 95% confidence)</li>
            <li>the sequential multiplier:replaces the fixed 1.96 of a classical CI; starts larger and decreases as <InlineMath>{`n`}</InlineMath> grows, approaching 1.96 asymptotically</li>
          </ul>
          <p>Compare with a standard CI:</p>
          <BlockMath>{`\\text{CI}_{\\text{classical}}(t) = \\hat{\\tau}(t) \\pm \\hat{\\sigma}_{\\hat{\\tau}}(t) \\cdot \\underbrace{z_{\\alpha/2}}_{\\approx 1.96}`}</BlockMath>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`z_{\\alpha/2}`}</InlineMath>:the critical value from the standard Normal distribution; equals 1.96 for a 95% confidence interval (<InlineMath>{`\\alpha = 0.05`}</InlineMath>)</li>
          </ul>
          <p>
            The only difference is the <strong>sequential multiplier</strong> replacing the
            constant 1.96.
          </p>
        </div>

        {/* Sequential multiplier table */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">How the sequential multiplier behaves</h4>

        <p className="text-xs text-neutral-500 mb-2">
          Values below use the default calibration (<InlineMath>{`n^* = 10{,}000,\\ \\alpha = 0.05`}</InlineMath>, giving <InlineMath>{`\\nu \\approx 892`}</InlineMath>).
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`n`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`m(n)`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`z_{\\alpha/2}`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3">100</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 5.5`}</InlineMath></td><td className="border border-neutral-300 p-3">1.96</td><td className="border border-neutral-300 p-3">Very early: CI is ~2.8&times; wider than classical</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">1,000</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 2.7`}</InlineMath></td><td className="border border-neutral-300 p-3">1.96</td><td className="border border-neutral-300 p-3">Decreasing toward minimum</td></tr>
              <tr><td className="border border-neutral-300 p-3">4,000</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 2.4`}</InlineMath></td><td className="border border-neutral-300 p-3">1.96</td><td className="border border-neutral-300 p-3">Near minimum (before <InlineMath>{`n^*`}</InlineMath>): ~23% wider</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">10,000</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 2.45`}</InlineMath></td><td className="border border-neutral-300 p-3">1.96</td><td className="border border-neutral-300 p-3">At <InlineMath>{`n^*`}</InlineMath>: multiplier already rising slightly</td></tr>
              <tr><td className="border border-neutral-300 p-3">100,000</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\approx 2.8`}</InlineMath></td><td className="border border-neutral-300 p-3">1.96</td><td className="border border-neutral-300 p-3">Well past <InlineMath>{`n^*`}</InlineMath>: multiplier rising, CI widening</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            The sequential multiplier starts high, decreases to a minimum somewhere before <InlineMath>{`n^*`}</InlineMath>, then slowly rises.
            The gap from 1.96 &mdash; the &ldquo;price of peeking&rdquo; &mdash; is largest early on and smallest near the planned sample size.
            It never fully closes; m(n) always stays above 1.96.
          </p>
        </div>

        </DisplayMathBox>

        {/* Interactive Simulation */}
        <SequentialMultiplierSim />

        {/* Role of nu */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3 mt-8">
          The role of <InlineMath>{`\\nu`}</InlineMath> and <InlineMath>{`M`}</InlineMath>
        </h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            <a href="#ref-schmit-miller-2024" className="text-blue-600 hover:text-blue-800">Schmit &amp; Miller</a> set <InlineMath>{`\\nu = M \\cdot \\hat{\\sigma}^2`}</InlineMath>,
            where <InlineMath>{`M`}</InlineMath> is the <strong>expected total sample size</strong>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-3 text-left font-semibold">If&hellip;</th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Then&hellip;</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-neutral-300 p-3"><InlineMath>{`M`}</InlineMath> is too small (underestimate traffic)</td><td className="border border-neutral-300 p-3">CI is tight early but wide late</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`M`}</InlineMath> is too large (overestimate traffic)</td><td className="border border-neutral-300 p-3">CI is wide early but tight late</td></tr>
                <tr><td className="border border-neutral-300 p-3"><InlineMath>{`M`}</InlineMath> matches actual traffic</td><td className="border border-neutral-300 p-3">CI is tightest around the planned end date</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600 mt-2">
            <p>
              The parameter <InlineMath>{`M`}</InlineMath> controls where the boundary is
              tightest. Setting <InlineMath>{`M`}</InlineMath> equal to the planned total
              sample size optimises the CI width around the expected decision point.
            </p>
          </div>
        </div>

        {/* Summary box */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">What Eppo (2022) Actually Uses (Summary)</h4>
          <div className="text-neutral-800 space-y-2">
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Framework:</strong> <a href="#ref-howard-2021" className="text-blue-600 hover:text-blue-800">Howard et al. (2021)</a> confidence sequences (not the mSPRT of <a href="#ref-johari-2017" className="text-blue-600 hover:text-blue-800">Johari et al. 2017</a>).</li>
              <li><strong>Boundary:</strong> The Normal mixture boundary <InlineMath>{`u(v) = \\sqrt{(v+\\nu)\\log\\frac{v+\\nu}{\\nu\\alpha}}`}</InlineMath>.</li>
              <li><strong>Tuning:</strong> <InlineMath>{`\\nu = M\\hat{\\sigma}^2`}</InlineMath>, where <InlineMath>{`M`}</InlineMath> is the expected total sample size.</li>
              <li><strong>Variance:</strong> Estimated from data (not assumed known).</li>
              <li><strong>Noise reduction:</strong> Generalised CUPED via per-group regression adjustments.</li>
              <li><strong>Estimand:</strong> Relative lift <InlineMath>{`\\mu_1/\\mu_0 - 1`}</InlineMath>.</li>
              <li><strong>Decision:</strong> Stop when CI no longer crosses zero, valid at any time.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
