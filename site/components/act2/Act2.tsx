"use client"
import { ABTestSim } from '../shared/ABTestSim'
import { InlineMath, BlockMath } from '../ui/Math'
import { useState, useEffect } from 'react'

function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true)
    window.addEventListener('show-all-content', handler)
    return () => window.removeEventListener('show-all-content', handler)
  }, [])

  return (
    <div>
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200 mb-6"
      >
        {show ? 'Hide the math' : 'Show the math'}
      </button>
      {show && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h4 className="font-bold text-neutral-900 mb-4">The math</h4>
          {children}
        </div>
      )}
      <div style={{ height: '2rem' }} />
    </div>
  );
}

export function Act2() {
  return (
    <div id="act2" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 2 — The Eppo (2022) Solution</h2>

      <p className="text-neutral-700 mb-6">
        This act describes the solution introduced in the 2022 technical report by Schmit &amp; Miller (see reference 5). We do not know whether this is the exact current implementation in Eppo (2022), but it provides a concrete example of how modern A/B testing platforms implement sequential testing.
      </p>

      {/* Simulation intro */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Simulation</h3>
        <p className="text-neutral-700">
          This is the same simulation as Act 1, plus Eppo&apos;s (2022) sequential confidence interval (blue)
          on top of the standard fixed-horizon confidence interval (red). The blue interval is typically
          wider at any single look, but it keeps error control valid under repeated monitoring.
        </p>
      </div>

      {/* Simulation */}
      <div className="mb-8 max-w-2xl mx-auto">
        <ABTestSim
          layers={['fixed-ci', 'sequential-ci']}
          showPeekStats={true}
          simulationTitle="Simulation 2: fixed-horizon + Eppo (2022) sequential confidence intervals."
          K={14}
        />
      </div>

      {/* Why does this work */}
      <div className="bg-white border border-neutral-300 rounded-lg p-5 mb-6">
        <h4 className="font-semibold mb-2">Why does this work?</h4>
        <p className="text-neutral-700 mb-2">
          The fixed-horizon confidence interval controls error for one planned analysis. Eppo&apos;s (2022) sequential confidence interval uses
          a time-dependent boundary, so the guarantee is valid no matter when or how often you peek.
        </p>
        <p className="text-neutral-700">
          Tradeoff: at any single look, the interval is wider; benefit: no hidden inflation from repeated checks.
        </p>
      </div>

      {/* How different is it */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">How different is it?</h4>
      </div>
      <div className="overflow-x-auto mb-6">
        <p className="text-xs text-neutral-500 mb-2">
          Values below are calibrated to default settings (<InlineMath>{`\\alpha = 0.05`}</InlineMath>, <InlineMath>{`n = 10000`}</InlineMath>, baseline 10%, no true effect) using equal-interval peeks.
        </p>
        <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 p-3 text-left font-semibold">Checking schedule</th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Standard 95% confidence interval</th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Sequential confidence interval (Eppo, 2022)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-300 p-3">Once at the end (1 look)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 2\\%`}</InlineMath></td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Daily for 1 week (7 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 16\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 4\\%`}</InlineMath></td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Daily for 2 weeks (14 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 22\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Daily for 4 weeks (28 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 28\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Very frequent checks (50 looks)</td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 33\\%`}</InlineMath></td>
              <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 6\\%`}</InlineMath></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-8">
        <p className="text-neutral-700">
          Under repeated peeking, the standard confidence interval inflates false positives substantially, while the sequential confidence interval stays close to the target error level.
        </p>
        <p className="text-neutral-600 text-sm mt-2">
          Note: the sequential CI shows ~2% at a single look — below the nominal 5% — because the sequential multiplier is calibrated for continuous monitoring and is intentionally conservative at any fixed look.
        </p>
      </div>

      {/* ── Key Takeaway ── */}
      <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Sequential intervals trade narrowness at a single look for validity across all looks. If your team monitors live, this is the right tradeoff.
          </p>
        </div>
      </div>

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div>

          {/* Step 1 */}
          <h5 className="font-semibold mb-2">1. Fixed-horizon confidence interval (from Act 1)</h5>
          <p className="mb-2 text-neutral-800">
            A standard 95% confidence interval for the relative uplift <InlineMath>{`\\hat{u}_n`}</InlineMath>, valid at one pre-specified sample size <InlineMath>{`n`}</InlineMath>, is:
          </p>
          <BlockMath>{`\\hat{u}_n \\pm \\frac{\\widehat{\\mathrm{SE}}_n}{\\bar{X}_{A,n}}\\cdot 1.96`}</BlockMath>
          <ul className="mb-6 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\hat{u}_n`}</InlineMath> — estimated relative uplift (in %) after <InlineMath>{`n`}</InlineMath> users per group have been observed</li>
            <li><InlineMath>{`1.96`}</InlineMath> — the critical value for a 95% confidence interval (the 97.5th percentile of the standard Normal distribution)</li>
            <li><InlineMath>{`\\widehat{\\mathrm{SE}}_n`}</InlineMath> — estimated standard error of the difference in means, equal to <InlineMath>{`\\sqrt{\\hat{\\sigma}_A^2/n + \\hat{\\sigma}_B^2/n}`}</InlineMath></li>
            <li><InlineMath>{`\\hat{\\sigma}_A^2`}</InlineMath> — estimated variance of outcomes in the control group (group A)</li>
            <li><InlineMath>{`\\hat{\\sigma}_B^2`}</InlineMath> — estimated variance of outcomes in the treatment group (group B)</li>
            <li><InlineMath>{`\\bar{X}_{A,n}`}</InlineMath> — running mean outcome in the control group after <InlineMath>{`n`}</InlineMath> observations</li>
            <li><InlineMath>{`n`}</InlineMath> — number of users assigned to each group so far</li>
          </ul>

          {/* Step 2 */}
          <h5 className="font-semibold mb-2">2. Sequential confidence interval (Eppo, 2022)</h5>
          <p className="mb-2 text-neutral-800">
            Eppo's (2022) sequential confidence interval replaces the fixed multiplier 1.96 with one that depends on the number of observations:
          </p>
          <BlockMath>{`\\hat{u}_n \\pm \\frac{\\widehat{\\mathrm{SE}}_n}{\\bar{X}_{A,n}}\\,\\sqrt{\\frac{n+\\nu}{n}\\log\\!\\left(\\frac{n+\\nu}{\\nu\\,\\alpha}\\right)}`}</BlockMath>
          <ul className="mb-6 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\hat{u}_n`}</InlineMath> — estimated relative uplift (in %) after <InlineMath>{`n`}</InlineMath> users per group</li>
            <li><InlineMath>{`\\widehat{\\mathrm{SE}}_n`}</InlineMath> — estimated standard error of the difference in means at the current sample size</li>
            <li><InlineMath>{`\\bar{X}_{A,n}`}</InlineMath> — running mean outcome in the control group (used to convert absolute SE to relative %)</li>
            <li><InlineMath>{`n`}</InlineMath> — current number of users in each group</li>
            <li><InlineMath>{`\\nu`}</InlineMath> — tuning parameter that controls the width–power tradeoff, calibrated to the planned sample size. See the formula below.</li>
            <li><InlineMath>{`\\alpha`}</InlineMath> — target Type I error level (e.g. 0.05 for a 5% false-positive rate)</li>
            <li><InlineMath>{`\\log`}</InlineMath> — natural logarithm</li>
          </ul>

          {/* Step 3 */}
          <h5 className="font-semibold mb-2">3. The multiplier</h5>
          <p className="mb-2 text-neutral-800">
            The key difference between the two formulas is the multiplier of the standard error. In the fixed-horizon case it is the constant 1.96. In Eppo's (2022) sequential implementation it is:
          </p>
          <BlockMath>{`m(n) = \\sqrt{\\frac{n+\\nu}{n}\\log\\!\\left(\\frac{n+\\nu}{\\nu\\,\\alpha}\\right)}`}</BlockMath>
          <ul className="mb-4 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`m(n)`}</InlineMath> — the time-varying multiplier applied to the standard error (replaces 1.96 from the fixed-horizon formula)</li>
            <li><InlineMath>{`n`}</InlineMath> — current number of users in each group</li>
            <li><InlineMath>{`\\nu`}</InlineMath> — tuning parameter (explained below)</li>
            <li><InlineMath>{`\\alpha`}</InlineMath> — target Type I error level (e.g. 0.05)</li>
            <li><InlineMath>{`\\log`}</InlineMath> — natural logarithm</li>
          </ul>
          <p className="mb-6 text-neutral-800">
            This multiplier is larger than 1.96, which is what keeps the Type I error controlled under continuous monitoring. The multiplier is especially high when <InlineMath>{`n`}</InlineMath> is small. As <InlineMath>{`n`}</InlineMath> grows, <InlineMath>{`m(n)`}</InlineMath> first decreases — so the confidence interval narrows — reaches a minimum somewhere before the planned sample size <InlineMath>{`n^*`}</InlineMath>, and then slowly increases again. The interval is therefore tightest in the middle of the experiment and widens slightly if the experiment runs well past <InlineMath>{`n^*`}</InlineMath>. It always remains above 1.96.
          </p>
          <p className="mb-6 text-neutral-800">
            The tuning parameter <InlineMath>{`\\nu`}</InlineMath> controls this trade-off between early-stopping power and long-run width. Eppo (2022) sets it as:
          </p>
          <BlockMath>{`\\nu = \\frac{n^*}{\\log(n^*/\\alpha) - 1}`}</BlockMath>
          <ul className="mb-4 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\nu`}</InlineMath> — tuning parameter that balances the interval width at early looks versus the planned end date</li>
            <li><InlineMath>{`n^*`}</InlineMath> — the planned (maximum) sample size per group — the horizon at which the experiment is expected to end</li>
            <li><InlineMath>{`\\alpha`}</InlineMath> — target Type I error level</li>
          </ul>
          <p className="mb-6 text-neutral-800">
            Setting <InlineMath>{`\\nu`}</InlineMath> too high (relative to actual traffic) shifts the minimum of <InlineMath>{`m(n)`}</InlineMath> to a sample size you never reach, so the interval stays wider than necessary throughout the experiment. Setting it too low shifts the minimum to a point you pass quickly, after which the multiplier starts rising earlier than optimal. The formula above calibrates <InlineMath>{`\\nu`}</InlineMath> so the multiplier is near its minimum around <InlineMath>{`n^*`}</InlineMath> — the point where you expect to make a decision. Being off by a factor of two is fine; being off by a factor of ten matters.
          </p>

          {/* Step 4 */}
          <h5 className="font-semibold mb-2">4. Time-uniform coverage guarantee</h5>
          <p className="mb-2 text-neutral-800">
            The sequential CI satisfies:
          </p>
          <BlockMath>{`\\Pr\\!\\left(u \\in \\mathrm{CI}_n\\ \\text{for all } n\\ge1\\right)\\ge 1-\\alpha`}</BlockMath>
          <ul className="mb-4 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`u`}</InlineMath> — the true (unknown) relative uplift of the treatment compared to control</li>
            <li><InlineMath>{`\\mathrm{CI}_n`}</InlineMath> — the sequential confidence interval computed at sample size <InlineMath>{`n`}</InlineMath></li>
            <li><InlineMath>{`\\Pr(\\cdot)`}</InlineMath> — probability over repeated experiments</li>
            <li><InlineMath>{`\\alpha`}</InlineMath> — target Type I error level; the guarantee holds with probability at least <InlineMath>{`1 - \\alpha`}</InlineMath></li>
          </ul>
          <p className="mb-2 text-neutral-800">
            So unlike fixed-horizon confidence intervals, the guarantee still holds under continuous monitoring.
          </p>
          <p className="text-neutral-800">
            As <InlineMath>{`n`}</InlineMath> increases, the multiplier <InlineMath>{`m(n)`}</InlineMath> first decreases and then slowly rises — so the confidence interval narrows through most of the experiment and widens slightly if the experiment runs past the planned sample size.
          </p>
        </div>
      </DisplayMathBox>
    </div>
  )
}
