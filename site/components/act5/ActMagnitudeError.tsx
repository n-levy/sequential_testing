"use client"

import { ABTestSim } from '../shared/ABTestSim'

export function ActMagnitudeError() {
  return (
    <div id="act5" className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-1">Act 5: Caution, Magnitude Error</h2>

      <p className="text-neutral-700 mb-6">
        Any test that monitors interim results and stops when significant faces a potential
        distortion in its effect estimate. This is a concern separate from statistical
        validity: even a correctly calibrated sequential test controls the false positive rate,
        but no stopping rule can prevent the <strong>magnitude of the estimated effect</strong>{' '}
        from being inflated when the test stops early.
      </p>

      {/* Core concept */}
      <div id="act5-winners-curse" className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-6">
        <h4 className="font-semibold mb-2 text-neutral-900">The winner&rsquo;s curse in A/B testing</h4>
        <p className="text-neutral-700 mb-3">
          When an A/B test stops early and declares a statistically significant result, the
          measured effect tends to be larger than the true effect. This happens because we
          only stop when the data happen to show a strong signal, and strong signals are
          partly due to real effects and partly due to random noise pushing the estimate in
          the same direction. The result is a systematic overestimate of the true effect size.
        </p>
        <p className="text-neutral-700">
          This upward bias in significant results is called the <strong>winner&rsquo;s curse</strong>{' '}
          or <strong>magnitude error</strong>. Early stopping amplifies the problem: the earlier
          the test stops, the noisier the estimate, and the more inflated it tends to be. The same
          bias applies on the harm side: a test stopped early for harm overstates the harm, which
          matters if the estimate is used later, for example in a post-mortem.
        </p>
      </div>

      <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-5 mb-6">
        <h5 className="font-semibold mb-2 text-neutral-900">How much inflation, in this example</h5>
        <p className="text-neutral-700 mb-2">
          At a true effect of −10% (n = 10,000 per arm, 10% baseline, K = 14 daily peeks), tests
          stopped early for harm by Eppo&apos;s sequential CI reported on average <strong>1.87×</strong> the
          true effect. For comparison:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
          <li>Significant results of a single test at the planned end (no early stopping): <strong>1.23×</strong></li>
          <li>All end-of-test estimates (significant or not): <strong>1.01×</strong></li>
          <li>O&apos;Brien&ndash;Fleming early stops: <strong>1.47×</strong></li>
        </ul>
        <p className="text-neutral-700 mt-2">
          Most of the exaggeration after an early stop is therefore due to stopping early, not due to
          which rule was used to stop.
        </p>
      </div>

      {/* Why early stopping inflates estimates */}
      <h4 className="font-semibold mb-2 text-neutral-900">
        Why early stopping inflates effect estimates
      </h4>
      <p className="text-neutral-700 mb-3">
        When any test stops early at an interim peek, you condition on two things simultaneously:
      </p>
      <ol className="list-decimal list-inside ml-4 space-y-2 text-neutral-700 mb-4">
        <li>
          The result is significant (the confidence interval excludes zero).
        </li>
        <li>
          The result became significant at an <em>early</em> time point — while the sample
          size was still small and the estimate was noisy.
        </li>
      </ol>
      <p className="text-neutral-700 mb-4">
        At any interim look the standard error is larger than at the planned end. For the
        confidence interval to exclude zero at that stage, the observed effect must be
        unusually far from zero relative to that larger standard error. This means stopping
        early selects for trials where random noise happened to push the estimate in the
        signal direction. The earlier the stop, the more extreme that selection — and the
        more inflated the reported effect.
      </p>

      <div className="bg-white border border-neutral-300 rounded-lg p-5 mb-6">
        <p className="text-neutral-700">
          <strong>In practice:</strong> if a test stops early — whether using a standard
          confidence interval with peeking or a sequential confidence interval — treat the
          point estimate with caution. Do not use the measured uplift directly for revenue
          projections, expected ROI calculations, or product roadmap prioritisation. The
          true effect is likely smaller. Bayesian shrinkage or corrected estimators (see,
          e.g., Howard et al. 2021) can help produce less biased post-hoc estimates.
        </p>
      </div>

      {/* Why hybrid helps */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-5 mb-8">
        <h4 className="font-semibold mb-2 text-blue-900">One of the reasons to prefer harm-only interim monitoring</h4>
        <p className="text-neutral-700 mb-2">
          In the hybrid design with harm-only interim monitoring (Act 3), the primary KPI is <em>never</em> stopped early because of benefit: it is
          always analysed at the planned end date with a standard confidence interval. This means:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
          <li>The point estimate for the primary KPI does not suffer from early-stopping bias.</li>
          <li>The measured effect size at the planned end date is an unbiased estimate of the true effect.</li>
          <li>Business decisions that depend on the magnitude of the effect (projections, ROI, prioritisation) can be made with confidence.</li>
        </ul>
        <p className="text-neutral-700 mt-3">
          Only guardrail KPIs may be stopped early — and for those, you typically care about
          whether harm occurred, not the precise magnitude of the harm.
        </p>
        <p className="text-neutral-700 mt-3">
          <strong>A small caveat:</strong> if the primary KPI is itself also monitored for early
          stopping (as in the example in Act 3), or if the guardrail KPIs are correlated with the
          primary KPI, then early stopping can indirectly affect the primary KPI estimate at the
          planned end date — experiments that stop early are not included in the final analysis, so
          the observed distribution of final estimates is slightly selected. In practice this effect
          is negligible: the bias is far smaller than in a fully sequential design, and for most
          purposes the primary KPI estimate can be treated as unbiased.
        </p>
      </div>

      {/* Simulation */}
      <h4 className="font-semibold mb-3 text-neutral-900">Simulation: magnitude error across 1,000 repetitions</h4>
      <p className="text-neutral-700 mb-4">
        Both the standard CI and the sequential CI are checked at each of K equally-spaced
        interim looks, stopping as soon as the result is significant. For each simulated
        experiment that was declared significant, the table shows two numbers:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-neutral-700 mb-4">
        <li>
          <strong>Mean |effect| when significant:</strong> the effect estimate at the moment
          the test stopped.
        </li>
        <li>
          <strong>Mean |effect| at end of test when significant:</strong> what the effect
          estimate would have been if the same experiment had continued to the planned end
          date (for the same simulations that stopped early).
        </li>
      </ul>
      <p className="text-neutral-700 mb-4">
        A gap between these two numbers indicates early-stopping inflation: the estimate at
        the time of stopping was higher than what the data eventually showed at the end. Try
        setting a positive effect size (e.g. +10%) and clicking &ldquo;Run 1,000
        repetitions&rdquo; — both rows will show that the estimate at stopping exceeds the
        estimate at the end of the experiment.
      </p>

      <div id="act5-sim" className="mb-2 max-w-2xl mx-auto">
        <p className="text-xs text-neutral-500 mb-2">
          The 1000-repetition table uses the same settings (n, α, effect size, K, baseline rate) as the trajectory chart: they are part of the same simulation. Adjust any slider above the chart and click &ldquo;Run 1000 repetitions&rdquo; to re-run with the updated parameters.
        </p>
      </div>
      <div className="mb-8 max-w-2xl mx-auto">
        <ABTestSim
          layers={['fixed-ci', 'sequential-ci']}
          showPeekStats={true}
          showMeanEffects={true}
          showDecision={false}
          K={14}
          simulationTitle="Simulation 5: magnitude error — mean effect at stopping vs. at end of test, across 1,000 repetitions."
          defaultEffect={0.1}
        />
      </div>

      {/* Key Takeaway */}
      <div id="act5-takeaway" className="bg-blue-100 border border-blue-500 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Any test that monitors interim results and stops early — whether using a standard
            confidence interval with peeking or a sequential confidence interval — tends to
            report an inflated effect estimate at the time of stopping. Early stopping
            coincides with atypically large observed effects due to random noise: a stronger
            version of the winner&rsquo;s curse.
          </p>
          <p>
            <strong>What to do:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>If estimating the magnitude of the effect is important, prefer the hybrid design with harm-only interim monitoring.</li>
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
