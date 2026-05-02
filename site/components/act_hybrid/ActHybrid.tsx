"use client"

import { HybridSim } from './HybridSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'
import { InlineMath, BlockMath } from '../ui/Math'

export function ActHybrid() {
  return (
    <div id="act3-hybrid" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 3 — The Hybrid Approach</h2>

      <p className="text-neutral-700 mb-6">
        This act explains a popular &ldquo;hybrid&rdquo; approach to sequential testing. The description and
        the simulation below follow the approach described by Eppo (
        <a
          href="https://www.geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-900"
        >
          link to source
        </a>
        ).
      </p>

      {/* Core idea */}
      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-6">
        <p className="font-bold text-neutral-900 mb-3">
          The core insight: apply sequential testing where early stopping adds the most value,
          and fixed-horizon testing where statistical power matters most.
        </p>
        <p className="text-neutral-700 mb-3">The hybrid approach partitions metrics into two categories:</p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-700">
          <li>
            <strong>Guardrail KPIs</strong> (revenue, error rate, latency, etc.): monitored
            continuously with a <strong>sequential confidence interval</strong>. If the interval
            excludes zero on the harmful side at any point during the experiment, abort immediately.
          </li>
          <li>
            <strong>Primary KPI</strong> (the metric the experiment is designed to move): analysed
            with a <strong>standard fixed-horizon confidence interval</strong> at the pre-planned end
            date. No sequential correction applied.
          </li>
        </ul>
      </div>

      {/* Pros */}
      <h4 className="font-semibold mb-2 text-neutral-900">Advantages</h4>
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
      <ul className="list-disc pl-5 space-y-2 text-neutral-700 mb-4">
        <li>
          <strong>No early stopping for success on the primary KPI.</strong> If the treatment effect
          is very large, you must still wait until the planned end date to declare success. This could
          have a considerable effect on experiments that were designed to run for a long time, in
          which the treatment has a larger effect than expected.
        </li>
      </ul>

      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-4 mb-6 text-sm text-neutral-700">
        <strong>Note:</strong> Usually some of the guardrail metrics are also outcome metrics. That
        is, we do not only wish to monitor them for harm during the experiment. We also wish to
        estimate the effect on them at the end of the experiment. During the experiment their
        sequential confidence intervals will be wider than the standard one; at the planned end date
        it will narrow abruptly. This can be confusing to stakeholders following results in real
        time.
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

      {/* Simulation */}
      <div className="mb-8 max-w-2xl mx-auto">
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
      <div className="border-t border-neutral-200 pt-6 mb-6">
        <h3 className="text-lg font-bold mb-3 text-neutral-900">
          Both decisions are effectively one-tailed tests at α/2
        </h3>
        <p className="text-neutral-700 mb-4">
          The confidence intervals in the hybrid approach are <em>two-sided</em> — they have both an
          upper and a lower bound. But the decision rules are <em>one-directional</em>:
        </p>
        <ul className="list-disc pl-5 space-y-3 text-neutral-700 mb-4">
          <li>
            <strong>Guardrail KPIs — abort for harm only.</strong> You abort the experiment only if
            the sequential confidence interval is entirely <em>below</em> zero (i.e., the entire
            interval lies on the harmful side). This is a one-tailed test at α/2 on the harm side.
          </li>
          <li>
            <strong>Primary KPI — test for benefit only.</strong> You ship the feature only if the
            standard confidence interval at the end of the experiment is entirely <em>above</em>{' '}
            zero (i.e., a beneficial effect is confirmed) or includes zero in case of a &lsquo;no
            harm&rsquo; test, but you are not interested in testing whether it has a statistically
            significant negative effect. This is a one-tailed test at α/2 on the benefit side.
          </li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-neutral-800 font-semibold mb-2">
            The total false positive rate is the same as a classic two-tailed test
          </p>
          <p className="text-neutral-700 mb-3">
            In a classic A/B test with α = 0.05, a two-tailed test at the end of the experiment
            produces a 5% false positive rate — split symmetrically as 2.5% on the benefit side and
            2.5% on the harm side. The hybrid approach keeps exactly the same total budget:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-700 mb-3">
            <li>2.5% allocated to false aborts <em>during</em> the test (sequential CI, harm side)</li>
            <li>2.5% allocated to false ships <em>at the end</em> of the test (standard CI, benefit side)</li>
            <li>Total: 2.5% + 2.5% = <strong>5%</strong></li>
          </ul>
          <p className="text-neutral-700">
            The hybrid approach is not more or less conservative than a classic test — the total
            false positive rate is the same. What changes is <em>when and where</em> you spend the
            budget: half during the experiment for harm protection, half at the end for benefit
            detection. The only cost of the hybrid approach is that confidence intervals are wider
            during the experiment (sequential CIs must be wider to remain valid across repeated
            looks). At the planned end date, the standard CI is exactly as narrow as in a classic test.
          </p>
        </div>
      </div>

      {/* Sub-section: What if primary KPI is also a guardrail? */}
      <div className="border-t border-neutral-200 pt-6 mb-6">
        <h3 className="text-lg font-bold mb-3 text-neutral-900">
          What if the primary KPI is also a guardrail?
        </h3>
        <p className="text-neutral-700 mb-4">
          In some experiments, the primary outcome metric must also be protected against severe harm —
          for example, a revenue metric where a large negative effect would require immediate action.
          In this case, waiting until the planned end date for the primary KPI is not acceptable.
        </p>
        <p className="text-neutral-700 mb-4">
          In this case, the same approach described above applies — the significance budget is split
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
          By a union bound (Bonferroni), the probability of any false positive across both tests is
          at most <em>α/2 + α/2 = α</em>, so the overall Type I error is controlled. The tradeoff is
          that each individual test is slightly more conservative than if it alone used the full{' '}
          <em>α</em> budget.
        </p>
        <div className="overflow-x-auto mb-2">
          <table className="w-full min-w-[480px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Standard hybrid</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Hybrid sequential (Eppo)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3">Primary KPI monitored during experiment?</td>
                <td className="border border-neutral-300 p-3">No</td>
                <td className="border border-neutral-300 p-3">Yes (at α/2)</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">Primary KPI analysed at end?</td>
                <td className="border border-neutral-300 p-3">Yes (at α)</td>
                <td className="border border-neutral-300 p-3">Yes (at α/2)</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">Power at end of experiment</td>
                <td className="border border-neutral-300 p-3">Full (α)</td>
                <td className="border border-neutral-300 p-3">Near-full (α/2, slightly lower)</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">Early stopping for harm on primary KPI?</td>
                <td className="border border-neutral-300 p-3">No</td>
                <td className="border border-neutral-300 p-3">Yes</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">Overall Type I error controlled at α?</td>
                <td className="border border-neutral-300 p-3">Yes</td>
                <td className="border border-neutral-300 p-3">Yes (by union bound)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Show the math */}
      <DisplayMathBox>
        <div className="space-y-6 text-neutral-800">

          <div>
            <h5 className="font-semibold text-neutral-900 mb-2">1. Sequential confidence interval (guardrails)</h5>
            <p className="mb-2">
              During the experiment, each guardrail KPI is monitored with a sequential confidence interval. At any time <InlineMath>{`n`}</InlineMath>, the interval is:
            </p>
            <BlockMath>{`\\mathrm{CI}_{\\text{seq}}(n) = \\hat{\\tau}(n) \\;\\pm\\; \\widehat{\\mathrm{SE}}(n) \\cdot \\underbrace{\\sqrt{\\frac{n+\\nu}{n}\\log\\!\\frac{n+\\nu}{\\nu\\,\\alpha_g}}}_{m(n,\\,\\alpha_g)}`}</BlockMath>
            <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc mt-2">
              <li><InlineMath>{`\\hat{\\tau}(n)`}</InlineMath> — estimated treatment effect at sample size <InlineMath>{`n`}</InlineMath></li>
              <li><InlineMath>{`\\widehat{\\mathrm{SE}}(n)`}</InlineMath> — estimated standard error at sample size <InlineMath>{`n`}</InlineMath></li>
              <li><InlineMath>{`m(n, \\alpha_g)`}</InlineMath> — time-varying multiplier (Howard et al., 2021); always <InlineMath>{`> 1.96`}</InlineMath></li>
              <li><InlineMath>{`\\nu`}</InlineMath> — tuning parameter calibrated to the planned sample size <InlineMath>{`n^*`}</InlineMath></li>
              <li><InlineMath>{`\\alpha_g`}</InlineMath> — per-guardrail significance level (see below for multiple guardrails)</li>
            </ul>
            <p className="mt-2 text-sm text-neutral-700">
              This interval is <strong>anytime-valid</strong>: the probability of it ever excluding zero under the null is at most <InlineMath>{`\\alpha_g`}</InlineMath>, no matter how many times you peek.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-neutral-900 mb-2">2. Standard confidence interval (primary KPI, at planned end date)</h5>
            <p className="mb-2">
              At the planned end date <InlineMath>{`n^*`}</InlineMath>, the primary KPI is analysed exactly once with a fixed-horizon interval:
            </p>
            <BlockMath>{`\\mathrm{CI}_{\\text{std}}(n^*) = \\hat{\\tau}(n^*) \\;\\pm\\; z_{\\alpha/2} \\cdot \\widehat{\\mathrm{SE}}(n^*)`}</BlockMath>
            <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc mt-2">
              <li><InlineMath>{`z_{\\alpha/2} = \\Phi^{-1}(1 - \\alpha/2)`}</InlineMath> — the standard normal critical value; <InlineMath>{`z_{0.025} \\approx 1.96`}</InlineMath> for <InlineMath>{`\\alpha = 0.05`}</InlineMath></li>
              <li>Because the primary KPI is tested only once, no sequential correction is needed — the full statistical power is retained</li>
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
              <li>Sequential: <InlineMath>{`\\mathrm{CI}_{\\text{seq}}(n)`}</InlineMath> with <InlineMath>{`\\alpha_s = \\alpha/2`}</InlineMath> — wider multiplier <InlineMath>{`m(n, \\alpha/2)`}</InlineMath></li>
              <li>Final: one-tailed test at <InlineMath>{`\\alpha/2`}</InlineMath> using <InlineMath>{`z_{\\alpha/2} = \\Phi^{-1}(1 - \\alpha/2) = 1.96`}</InlineMath> for <InlineMath>{`\\alpha = 0.05`}</InlineMath></li>
            </ul>
            <p className="mt-2 text-sm text-neutral-700">
              The final test uses <InlineMath>{`z_{\\alpha/2} = 1.96`}</InlineMath> — exactly the same critical value as the benefit side of a classic two-tailed test at <InlineMath>{`\\alpha`}</InlineMath>. There is no extra cost at the end of the experiment: a one-tailed test at <InlineMath>{`\\alpha/2`}</InlineMath> occupies exactly the same region of the normal distribution as one tail of a classic two-tailed test at <InlineMath>{`\\alpha`}</InlineMath>. The only cost of the hybrid sequential variant is the wider sequential confidence interval <em>during</em> the experiment.
            </p>
          </div>

        </div>
      </DisplayMathBox>

      {/* Key Takeaway */}
      <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Monitor guardrail KPIs with a sequential confidence interval for early abort; analyse
            the primary KPI with a standard confidence interval at the planned end date.
          </p>
          <p>
            This gives you the safety of sequential testing where it matters most (preventing harm)
            without sacrificing statistical power on the metric you care about most.
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
