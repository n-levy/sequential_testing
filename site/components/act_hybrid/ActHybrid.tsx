"use client"

import { useState } from 'react'
import { HybridSim } from './HybridSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'
import { InlineMath, BlockMath } from '../ui/Math'

function EppoGuidanceSection() {
  const [showEppo, setShowEppo] = useState(false)

  return (
    <div className="border-t border-neutral-200 pt-6 mb-6">
      <p className="text-neutral-700 mb-4">
        Eppo (2022) implements this equivalently using a different but mathematically identical
        parameterization.
      </p>
      <button
        type="button"
        onClick={() => setShowEppo(v => !v)}
        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200 mb-4"
      >
        {showEppo ? 'Hide Eppo guidance' : 'Show Eppo guidance'}
      </button>
      {showEppo && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mb-4">
          <h4 className="font-bold text-neutral-900 mb-3">Eppo&apos;s parameterization</h4>
          <p className="text-neutral-700 mb-3">
            Eppo (2022) frames the same design as two one-sided tests each at{' '}
            <InlineMath>{`\\alpha/4`}</InlineMath>, where <InlineMath>{`\\alpha = 0.10`}</InlineMath>{' '}
            is recommended. At <InlineMath>{`\\alpha = 0.10`}</InlineMath>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-700 mb-3">
            <li>
              Sequential test on the degradation tail at{' '}
              <InlineMath>{`\\alpha/4 = 0.025`}</InlineMath>
            </li>
            <li>
              Fixed-sample test on the improvement tail at{' '}
              <InlineMath>{`\\alpha/4 = 0.025`}</InlineMath>
            </li>
          </ul>
          <p className="text-neutral-700 mb-3">
            This is identical to the <InlineMath>{`\\alpha = 0.05`}</InlineMath>,{' '}
            <InlineMath>{`\\alpha/2`}</InlineMath> framing above: both give 2.5% per component and{' '}
            <InlineMath>{`z = 1.96`}</InlineMath>. The difference is purely notational. Eppo
            allocates <InlineMath>{`\\alpha/2`}</InlineMath> to each of two two-tailed tests and then
            uses one tail of each, arriving at <InlineMath>{`\\alpha/4`}</InlineMath> per component.
          </p>
          <p className="text-neutral-700">
            Source:{' '}
            <a
              href="https://docs.geteppo.com/statistics/confidence-intervals/analysis-methods/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline hover:text-blue-900"
            >
              Eppo docs: &ldquo;Sequential hybrid as two one-sided tests&rdquo;
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

export function ActHybrid() {
  return (
    <div id="act3-hybrid" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 3: A Hybrid Approach</h2>

      <p className="text-neutral-700 mb-6">
        This act explains a popular &ldquo;hybrid&rdquo; approach to sequential testing. The description and
        the simulation below follow the approach described by Eppo. (See &ldquo;Hybrid sequential tests&rdquo;{' '}
        <a
          href="https://www.geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-900"
        >
          here
        </a>{' '}
        and &ldquo;Sequential hybrid as two one-sided tests&rdquo;{' '}
        <a
          href="https://docs.geteppo.com/statistics/confidence-intervals/analysis-methods/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-900"
        >
          here
        </a>
        .)
      </p>

      {/* Simulation */}
      <div id="act3-sim" className="mb-8 max-w-2xl mx-auto">
        <HybridSim />
      </div>

      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-4 mb-8 text-sm text-neutral-700">
        <strong>Reading the chart:</strong> The wide blue band is the sequential confidence interval
        that monitors guardrail KPIs throughout the experiment. At the planned end date (dashed vertical
        line), the narrower red error bar shows the standard 95% confidence interval used to make the
        primary KPI decision. Notice that the standard confidence interval at the end is narrower.
        The difference between the red and blue intervals is the statistical power that would have
        been sacrificed with a fully sequential approach.
      </div>

      {/* Sub-section: One-tailed decisions */}
      <EppoGuidanceSection />

      {/* Pros */}
      <h4 id="act3-adv" className="font-semibold mb-2 text-neutral-900">Advantages</h4>
      <ul className="list-disc pl-5 space-y-2 text-neutral-700 mb-5">
        <li>
          <strong>Full statistical power on the primary KPI.</strong> Because the primary KPI uses a
          standard confidence interval at the planned end date, there is no sequential correction and
          no power penalty.
        </li>
        <li>
          <strong>Continuous guardrail protection.</strong> Sequential monitoring of guardrail KPIs
          lets you abort the experiment the moment a harmful effect is detected, without waiting for
          the planned end date.
        </li>
        <li>
          <strong>Simpler to explain and implement</strong> than a fully sequential design. Most
          decisions are still made at a single planned analysis; only guardrails require continuous
          monitoring.
        </li>
        <li>
          <strong>Accounting for weekday effects.</strong> In many cases, tests are designed to run
          for a round number of weeks (e.g. 2 weeks), so that the treatment and control groups are
          exposed to the same day-of-week distribution. In these cases, stopping early may create
          bias by giving some weekdays more weight than others.
        </li>
      </ul>

      {/* Cons */}
      <h4 className="font-semibold mb-2 text-neutral-900">Limitations</h4>
      <ul className="list-disc pl-5 space-y-2 text-neutral-700 mb-6">
        <li>
          <strong>No early stopping for success on the primary KPI.</strong> If the treatment effect
          is very large, you must still wait until the planned end date to declare success. This could
          have a considerable effect on experiments that were designed to run for a long time, in
          which the treatment has a larger effect than expected.
        </li>
      </ul>

      {/* Sub-section: What if primary KPI is also a guardrail? */}
      <div id="act3-guardrail" className="border-t border-neutral-200 pt-6 mb-6">
        <h3 className="text-lg font-bold mb-3 text-neutral-900">
          What if the primary KPI is also a guardrail?
        </h3>
        <p className="text-neutral-700 mb-4">
          In some experiments, the primary outcome metric must also be protected against severe harm,
          for example a revenue metric where a large negative effect would require immediate action.
          In this case, the same approach described above applies: the significance budget is split
          between two tests:
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <ul className="list-disc pl-5 space-y-2 text-neutral-800">
            <li>
              <strong>Sequential confidence interval throughout the experiment</strong>, at significance level{' '}
              <em>α / 2</em>. If the CI excludes zero at any point during the experiment, you may
              stop early.
            </li>
            <li>
              <strong>Standard t-test at the planned end date</strong>, at significance level{' '}
              <em>α / 2</em>. If the experiment runs to completion without early stopping, the final
              decision uses this narrower threshold.
            </li>
          </ul>
        </div>
        <p className="text-neutral-700 mb-4">
          As mentioned above, by a union bound (Bonferroni), the probability of any false positive
          across both tests is at most <em>α/2 + α/2 = α</em>, so the overall Type I error is
          controlled.
        </p>
        <p className="text-neutral-700">
          Note that guardrail metrics that are also tracked as outcome metrics will show wider
          sequential confidence intervals throughout the experiment, narrowing to standard width
          only at the planned end date. This can be confusing to stakeholders following results in
          real time.
        </p>
      </div>

      {/* What you gain table */}
      <h4 className="font-semibold mb-3 text-neutral-900">What you gain compared to full sequential</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full min-w-[480px] text-sm border-collapse border border-neutral-300">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 p-3 text-left font-semibold"></th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Full sequential</th>
              <th className="border border-neutral-300 p-3 text-left font-semibold">Hybrid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-300 p-3">Primary KPI confidence interval width</td>
              <td className="border border-neutral-300 p-3">Wider</td>
              <td className="border border-neutral-300 p-3">Standard (no penalty)</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Primary KPI power</td>
              <td className="border border-neutral-300 p-3">Reduced</td>
              <td className="border border-neutral-300 p-3">Full</td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Guardrail protection</td>
              <td className="border border-neutral-300 p-3">Continuous</td>
              <td className="border border-neutral-300 p-3">Continuous</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Early stopping for success</td>
              <td className="border border-neutral-300 p-3">Yes</td>
              <td className="border border-neutral-300 p-3">No</td>
            </tr>
            <tr>
              <td className="border border-neutral-300 p-3">Early stopping for harm</td>
              <td className="border border-neutral-300 p-3">Yes</td>
              <td className="border border-neutral-300 p-3">Yes</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-300 p-3">Complexity</td>
              <td className="border border-neutral-300 p-3">Higher</td>
              <td className="border border-neutral-300 p-3">Lower</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Show the math */}
      <div id="act3-math">
      <DisplayMathBox>
        <div className="space-y-6 text-neutral-800">

          <div>
            <h5 className="font-semibold text-neutral-900 mb-2">1. Sequential confidence interval (guardrails)</h5>
            <p className="mb-2">
              During the experiment, each guardrail KPI is monitored with a sequential confidence interval. At any time <InlineMath>{`n`}</InlineMath>, the interval is:
            </p>
            <BlockMath>{`\\mathrm{CI}_{\\text{seq}}(n) = \\hat{\\tau}(n) \\;\\pm\\; \\widehat{\\mathrm{SE}}(n) \\cdot \\underbrace{\\sqrt{\\frac{n+\\nu}{n}\\log\\!\\frac{n+\\nu}{\\nu\\,\\alpha_g}}}_{m(n,\\,\\alpha_g)}`}</BlockMath>
            <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc mt-2">
              <li><InlineMath>{`\\hat{\\tau}(n)`}</InlineMath>: estimated treatment effect at sample size <InlineMath>{`n`}</InlineMath></li>
              <li><InlineMath>{`\\widehat{\\mathrm{SE}}(n)`}</InlineMath>: estimated standard error at sample size <InlineMath>{`n`}</InlineMath></li>
              <li><InlineMath>{`m(n, \\alpha_g)`}</InlineMath>: time-varying multiplier (Howard et al., 2021); always <InlineMath>{`> 1.96`}</InlineMath></li>
              <li><InlineMath>{`\\nu`}</InlineMath>: tuning parameter calibrated to the planned sample size <InlineMath>{`n^*`}</InlineMath></li>
              <li><InlineMath>{`\\alpha_g`}</InlineMath>: per-guardrail significance level (see below for multiple guardrails)</li>
            </ul>
            <p className="mt-2 text-sm text-neutral-700">
              This interval is <strong>anytime-valid</strong>: the probability of it ever excluding zero under the null is at most <InlineMath>{`\\alpha_g`}</InlineMath>, no matter how many times you peek. For the standard hybrid, the sequential CI monitors the degradation tail only, so <InlineMath>{`\\alpha_g = \\alpha/2`}</InlineMath> (with <InlineMath>{`\\alpha = 0.05`}</InlineMath>), giving <InlineMath>{`z = 1.96`}</InlineMath>, the same critical value as one tail of a standard 95% confidence interval.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-neutral-900 mb-2">2. Standard confidence interval (primary KPI, at planned end date)</h5>
            <p className="mb-2">
              At the planned end date <InlineMath>{`n^*`}</InlineMath>, the primary KPI is analysed exactly once with a fixed-horizon interval:
            </p>
            <BlockMath>{`\\mathrm{CI}_{\\text{std}}(n^*) = \\hat{\\tau}(n^*) \\;\\pm\\; z_{\\alpha/2} \\cdot \\widehat{\\mathrm{SE}}(n^*)`}</BlockMath>
            <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc mt-2">
              <li><InlineMath>{`z_{\\alpha/2} = \\Phi^{-1}(1 - \\alpha/2)`}</InlineMath>: the one-sided critical value for the improvement tail; at <InlineMath>{`\\alpha = 0.05`}</InlineMath>, <InlineMath>{`z_{0.025} = 1.96`}</InlineMath></li>
              <li>Because the primary KPI is tested only once (improvement tail only), no sequential correction is needed, so full statistical power is retained</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-neutral-900 mb-2">3. Multiple guardrail KPIs: Bonferroni correction</h5>
            <p className="mb-2">
              If there are <InlineMath>{`G`}</InlineMath> guardrail KPIs, apply a Bonferroni correction to keep the family-wise false positive rate at <InlineMath>{`\\alpha`}</InlineMath>:
            </p>
            <BlockMath>{`\\alpha_g = \\frac{\\alpha}{G}`}</BlockMath>
            <p className="mt-1 text-sm text-neutral-700">
              For example, with <InlineMath>{`G = 3`}</InlineMath> guardrails and <InlineMath>{`\\alpha = 0.05`}</InlineMath>, set <InlineMath>{`\\alpha_g = 0.0167`}</InlineMath> for each.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-neutral-900 mb-2">4. The union bound (hybrid sequential variant)</h5>
            <p className="mb-2">
              When the primary KPI also needs interim protection against harm, the significance budget is split equally: a sequential test at <InlineMath>{`\\alpha/2`}</InlineMath> during the experiment, and a standard test at <InlineMath>{`\\alpha/2`}</InlineMath> at the end.
            </p>
            <p className="mb-2">
              The <strong>union bound</strong>{' '}(Boole&rsquo;s inequality) guarantees that the probability of any false positive across both tests is at most the sum of each test&rsquo;s error rate:
            </p>
            <BlockMath>{`\\Pr(\\text{any false positive}) \\leq \\Pr(\\text{seq. test crosses zero}) + \\Pr(\\text{final test crosses zero}) \\leq \\frac{\\alpha}{2} + \\frac{\\alpha}{2} = \\alpha`}</BlockMath>
            <p className="mt-2 text-sm text-neutral-700">
              The two tests use:
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc mt-1">
              <li>Sequential: <InlineMath>{`\\mathrm{CI}_{\\text{seq}}(n)`}</InlineMath> with <InlineMath>{`\\alpha_s = \\alpha/2`}</InlineMath>, using wider multiplier <InlineMath>{`m(n, \\alpha/2)`}</InlineMath></li>
              <li>Final: one-tailed test at <InlineMath>{`\\alpha/2`}</InlineMath> using <InlineMath>{`z_{\\alpha/2} = \\Phi^{-1}(1 - \\alpha/2) = 1.96`}</InlineMath> for <InlineMath>{`\\alpha = 0.05`}</InlineMath></li>
            </ul>
            <p className="mt-2 text-sm text-neutral-700">
              The final test uses <InlineMath>{`z_{\\alpha/2} = 1.96`}</InlineMath>, exactly the same critical value as the benefit side of a classic two-tailed test at <InlineMath>{`\\alpha`}</InlineMath>. There is no extra cost at the end of the experiment: a one-tailed test at <InlineMath>{`\\alpha/2`}</InlineMath> occupies exactly the same region of the normal distribution as one tail of a classic two-tailed test at <InlineMath>{`\\alpha`}</InlineMath>. The only cost of the hybrid sequential variant is the wider sequential confidence interval <em>during</em> the experiment.
            </p>
          </div>

        </div>
      </DisplayMathBox>
      </div>

      {/* Key Takeaway */}
      <div id="act3-takeaway" className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Stop early only for degradations (sequential CI, degradation tail, at α/2 = 2.5%);
            declare winning variants only at the planned end date (standard CI, improvement tail,
            at α/2 = 2.5%).
          </p>
          <p>
            This gives you continuous harm protection without sacrificing statistical power on the metric
            you care about most. Both components use the conventional 2.5% threshold (z = 1.96),
            identical to one tail of a standard 95% confidence interval.
          </p>
          <p>
            When the primary KPI must also be protected against harm, use the hybrid sequential
            variant: run both a sequential test (at α/2) during the experiment and a standard test
            (at α/2) at the end, keeping the overall Type I error at α.
          </p>
        </div>
      </div>
    </div>
  )
}
