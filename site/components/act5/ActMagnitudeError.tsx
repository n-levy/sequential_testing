"use client"

import { ABTestSim } from '../shared/ABTestSim'

export function ActMagnitudeError() {
  return (
    <div id="act5" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 5:Caution: Magnitude Error</h2>

      <p className="text-neutral-700 mb-6">
        Sequential testing provides valid error control: the probability of a false positive stays
        below the target level no matter when you stop. However, there is a separate issue that
        valid error control does not address:the <strong>magnitude of the estimated effect</strong>{' '}
        when you stop early.
      </p>

      {/* Core concept */}
      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-6">
        <h4 className="font-semibold mb-2 text-neutral-900">The winner&rsquo;s curse in A/B testing</h4>
        <p className="text-neutral-700 mb-3">
          When an A/B test stops early and declares a statistically significant result, the
          measured effect tends to be larger than the true effect. This happens because we
          only stop when the data happen to show a strong signal:and strong signals are
          partly due to real effects and partly due to random noise pushing the estimate in
          the same direction. The result is a systematic overestimate of the true effect size.
        </p>
        <p className="text-neutral-700">
          This upward bias in significant results is called the <strong>winner&rsquo;s curse</strong>{' '}
          or <strong>magnitude error</strong>. It affects all stopping rules, including
          fixed-horizon tests (when you only report results that happen to be significant).
          But early stopping in sequential tests introduces an additional layer of this
          problem.
        </p>
      </div>

      {/* Why sequential testing makes it worse */}
      <h4 className="font-semibold mb-2 text-neutral-900">
        Why sequential early stopping amplifies the bias
      </h4>
      <p className="text-neutral-700 mb-3">
        In a fixed-horizon test, you check once at the end. The only conditioning is that the
        result happened to be significant (a type of winner&rsquo;s curse, but mild). In a
        sequential test that stops early, you condition on two things simultaneously:
      </p>
      <ol className="list-decimal list-inside ml-4 space-y-2 text-neutral-700 mb-4">
        <li>
          The result is significant (the confidence interval excludes zero).
        </li>
        <li>
          The result became significant at an <em>early</em> time point:meaning the effect
          estimate crossed a wide threshold while the sample size was still small.
        </li>
      </ol>
      <p className="text-neutral-700 mb-4">
        Sequential confidence intervals are deliberately <em>wider</em> than fixed-horizon
        intervals (that&rsquo;s how they maintain valid coverage under repeated monitoring).
        For the confidence interval to exclude zero when it is wide, the point estimate must be very far from
        zero. In other words, a sequential test that stops early requires an especially large
        observed effect. When this happens, random noise is almost always contributing —
        meaning the true effect is smaller than what was measured.
      </p>

      <div className="bg-white border border-neutral-300 rounded-lg p-5 mb-6">
        <p className="text-neutral-700">
          <strong>In practice:</strong> if a sequential test stops early, treat the point estimate
          with caution. Do not use the measured uplift directly for revenue projections, expected
          ROI calculations, or product roadmap prioritisation. The true effect is likely smaller.
          Bayesian shrinkage or corrected estimators (see, e.g., Howard et al. 2021) can help
          produce less biased post-hoc estimates.
        </p>
      </div>

      {/* Why hybrid helps */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-5 mb-8">
        <h4 className="font-semibold mb-2 text-blue-900">Another reason to prefer the hybrid approach</h4>
        <p className="text-neutral-700 mb-2">
          In the hybrid approach (Act 3), the primary KPI is <em>never</em> stopped early:it is
          always analysed at the planned end date with a standard confidence interval. This means:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
          <li>The point estimate for the primary KPI does not suffer from early-stopping bias.</li>
          <li>The measured effect size at the planned end date is an unbiased estimate of the true effect.</li>
          <li>Business decisions that depend on the magnitude of the effect (projections, ROI, prioritisation) can be made with confidence.</li>
        </ul>
        <p className="text-neutral-700 mt-3">
          Only guardrail KPIs may be stopped early:and for those, you typically care about
          whether harm occurred, not the precise magnitude of the harm.
        </p>
      </div>

      {/* Simulation */}
      <h4 className="font-semibold mb-3 text-neutral-900">Simulation: magnitude error across 1000 repetitions</h4>
      <p className="text-neutral-700 mb-4">
        The table below shows the mean absolute effect measured at the time of stopping (for the
        simulations that crossed the threshold) versus the mean absolute effect measured at the
        end of the experiment in the same simulations. A large gap between the two numbers
        indicates that early stopping was associated with an inflated estimate:the value
        observed when stopping was higher than the value at the end of the same experiment.
      </p>
      <p className="text-neutral-700 mb-4">
        Compare the standard confidence interval (which stops at a fixed planned end date) to
        the sequential confidence interval (which can stop at any point). Try setting a positive
        effect size (e.g. +10%) and clicking &ldquo;Run 1000 repetitions&rdquo;:you will see
        that the sequential CI, when it stops early, systematically shows a larger estimate at
        the time of stopping than at the end of the test. The standard CI also shows some
        winner&rsquo;s curse (only significant results are included in the mean), but the gap
        is smaller because there is no early stopping.
      </p>

      <div className="mb-2 max-w-2xl mx-auto">
        <p className="text-xs text-neutral-500 mb-2">
          The 1000-repetition table uses the same settings (n, α, effect size, K, baseline rate) as the trajectory chart:they are part of the same simulation. Adjust any slider above the chart and click &ldquo;Run 1000 repetitions&rdquo; to re-run with the updated parameters.
        </p>
      </div>
      <div className="mb-8 max-w-2xl mx-auto">
        <ABTestSim
          layers={['fixed-ci', 'sequential-ci']}
          showPeekStats={true}
          showMeanEffects={true}
          showDecision={false}
          simulationTitle="Simulation 5: magnitude error:mean effect at stopping vs. at end of test."
          defaultEffect={0.1}
        />
      </div>

      {/* Key Takeaway */}
      <div className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Sequential testing controls the <em>probability</em> of a false positive, but not
            the <em>magnitude</em> of the estimated effect when you stop early. Early stopping
            in sequential tests tends to coincide with atypically large observed effects due to
            random noise:a stronger version of the winner&rsquo;s curse.
          </p>
          <p>
            <strong>What to do:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prefer the hybrid approach to avoid early stopping on the primary KPI altogether.</li>
            <li>If you do stop early, acknowledge that the point estimate is likely an overestimate.</li>
            <li>Use the measured effect for the yes/no decision (is there an effect?) but not
            for magnitude-dependent decisions (how large is the effect?) without applying a
            correction.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
