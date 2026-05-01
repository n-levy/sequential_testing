"use client"

import { HybridSim } from './HybridSim'

export function ActHybrid() {
  return (
    <div id="act3-hybrid" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 3 — The Hybrid Approach</h2>

      <p className="text-neutral-700 mb-6">
        This act explains a popular &ldquo;hybrid&rdquo; approach to sequential testing. The description and
        the simulation below follow the approach described by Eppo (source:{' '}
        <a
          href="https://www.geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-900"
        >
          geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches
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
            date. No sequential correction applied, so statistical power is fully preserved.
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
          <strong>Accounting for weekday effects.</strong> In many settings it is good practice to
          run an experiment for a round number of weeks, so that the treatment and control groups are
          exposed to the same day-of-week distribution. A pre-specified end date naturally satisfies
          this requirement.
        </li>
      </ul>

      {/* Cons */}
      <h4 className="font-semibold mb-2 text-neutral-900">Limitations</h4>
      <ul className="list-disc pl-5 space-y-2 text-neutral-700 mb-6">
        <li>
          <strong>No early stopping for success on the primary KPI.</strong> If the treatment effect
          is very large, you must still wait until the planned end date to declare success.
        </li>
        <li>
          <strong>Point estimates are still biased when a guardrail triggers early stopping.</strong>{' '}
          Winner&rsquo;s curse applies: estimates observed at an early stop tend to overstate the true
          effect. (Act 5 discusses this in detail.)
        </li>
        <li>
          <strong>The confidence interval switches width at the end of the test.</strong> During the
          experiment the sequential confidence interval is wider than the standard one; at the planned
          end date it narrows abruptly. This can be confusing to stakeholders following results in
          real time.
        </li>
      </ul>

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
              <td className="border border-neutral-300 p-3">Wider (~10–40%)</td>
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
        primary KPI decision. Notice how much narrower the standard confidence interval is at the end
        — this is the statistical power that would have been sacrificed with a fully sequential approach.
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
          Eppo describes a <strong>hybrid sequential</strong> solution for this scenario (source:{' '}
          <a
            href="https://www.geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline hover:text-blue-900"
          >
            geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches
          </a>
          ). The approach splits the significance budget between two tests:
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <ul className="list-disc pl-5 space-y-2 text-neutral-800">
            <li>
              <strong>Sequential CI throughout the experiment</strong>, at significance level{' '}
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
        <p className="text-neutral-700 mb-4">
          According to Eppo, this approach &ldquo;provides a balance of strong statistical power at
          the end of the experiment while still allowing the user to safely peek during the
          experiment&rdquo; and &ldquo;achieves confidence intervals at the end of the experiment
          that are almost as tight as those generated by the fixed test, resulting in much higher
          power to detect smaller effects compared to the fully sequential test.&rdquo;
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

      {/* Key Takeaway */}
      <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            <strong>The hybrid approach in one sentence:</strong> Monitor guardrail KPIs with a
            sequential confidence interval for early abort; analyse the primary KPI with a standard
            confidence interval at the planned end date.
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
