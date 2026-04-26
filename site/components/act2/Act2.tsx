'use client'


import { useState } from 'react'

// --- DisplayMathBox helper ---
function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  if (show) return <>{children}</>;
  return <button className="px-4 py-2 bg-blue-600 text-white rounded mb-6" onClick={() => setShow(true)}>Display the math</button>;
}

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { InlineMath, BlockMath } from '../ui/Math'
import { PipelineDiagram } from './PipelineDiagram'
import { PipelineStepDetail } from './PipelineStepDetail'
import { ABTestSim } from '../shared/ABTestSim'

export function Act2() {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  return (
    <section id="act2" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 2 &mdash; The Eppo Solution
          </h2>
          <p className="text-neutral-500 text-sm">(Schmit &amp; Miller, 2024)</p>
        </div>

        {/* ── Simulation ── */}

        <div className="bg-orange-50 border border-orange-400 rounded-lg p-6 mb-2">
          <h4 className="font-bold text-orange-900 mb-2">Simulation</h4>
          <p className="text-neutral-800">
            Simulate an A/B test with no true effect (effect = 0). The plot below adds Eppo&apos;s
            <strong> sequential confidence interval</strong> (blue band) on top of the
            standard 95% CI (red band) you saw in Act 1. The sequential CI is wider at
            any single look &mdash; that is the price of peeking &mdash; but its 95% coverage
            holds <em>simultaneously at every look</em>.
          </p>
        </div>

        <ABTestSim
          layers={['fixed-ci', 'sequential-ci']}
          showPeekStats
          defaultEffect={0}
          takeaway={
            <>
              Simulation takeaway. With no true effect, the standard CI (red) crosses the null line in many
              trajectories &mdash; the peeking problem. The sequential CI (blue) is wider but
              its boundary is calibrated to keep the false positive rate at <InlineMath>{`\alpha`}</InlineMath> across <em>every</em> peek. The table below shows the share of 500 runs in which the estimate was significant at least once during the test for each method. If you set the effect away from zero, the table updates to show the probability of crossing the CI at some point under the simulated effect.
            </>
          }
        />

        {/* ── Pipeline diagram (kept for the conceptual flow) ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4 mt-12">The Pipeline at a Glance</h3>
        <div className="mb-12 max-w-6xl mx-auto">
          <PipelineDiagram
            activeStep={activeStep}
            onStepClick={setActiveStep}
          />
          <PipelineStepDetail activeStep={activeStep} />
        </div>

        {/* ── Pipeline Step by Step ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Pipeline, Step by Step</h3>

        {/* Step 1 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 1: Randomise</h4>
        <p className="mb-4 text-neutral-700">
          Users are randomly assigned to <strong>control</strong> or{' '}
          <strong>treatment</strong>. Randomisation ensures exchangeability between groups
          so that any observed difference in outcomes can be attributed to the treatment.
        </p>

        {/* Step 2 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 2: Collect data over time</h4>
        <p className="mb-2 text-neutral-700">As users interact with the product, two quantities are recorded for each user:</p>
        <ul className="list-disc list-inside ml-4 mb-4 text-neutral-700 space-y-1">
          <li><InlineMath>{`Y_i`}</InlineMath>: the <strong>outcome</strong> during the experiment (e.g. purchase amount, clicks, session length).</li>
          <li><InlineMath>{`X_i`}</InlineMath>: a <strong>pre-experiment covariate</strong> &mdash; the same metric from before the experiment started (e.g. purchases in the prior 2 weeks).</li>
        </ul>

        {/* Step 3 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 3: Regression adjustment (variance reduction)</h4>
        <p className="mb-3 text-neutral-700">
          Individual-level outcome variance is typically large relative to the treatment
          effect. Eppo reduces this variance by regressing out the predictable component
          using pre-experiment covariates.
        </p>
        <p className="mb-2 text-neutral-700">
          For each group <strong>separately</strong>, fit a model predicting{' '}
          <InlineMath>{`Y`}</InlineMath> from <InlineMath>{`X`}</InlineMath>:
        </p>
        <BlockMath>{`\hat{f}_{\text{control}}(X), \qquad \hat{f}_{\text{treatment}}(X)`}</BlockMath>
        <p className="my-2 text-neutral-700">
          Then compute the <strong>adjusted outcome</strong> for each user:
        </p>
        <BlockMath>{`Y^*_i = Y_i - \hat{f}_g(X_i)`}</BlockMath>
        <p className="mb-3 text-neutral-700">
          where <InlineMath>{`g`}</InlineMath> is the user&apos;s group (control or treatment).
        </p>

        <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-4">
          <p className="text-neutral-700 mb-3">
            &ldquo;Predict what each user would have done based on their history, then subtract
            that prediction. What&apos;s left is the part you <em>couldn&apos;t</em> have predicted
            &mdash; and that&apos;s where the treatment effect hides.&rdquo;
          </p>
          <p className="text-neutral-700 mb-3">
            This is a generalisation of a technique called CUPED (<a href="#ref-deng-2013" className="text-blue-600 hover:text-blue-800">Deng et al., 2013</a>).
            The stronger the correlation <InlineMath>{`\rho`}</InlineMath> between pre-experiment
            and experiment behaviour, the more noise is removed:
          </p>
          <BlockMath>{`\Var(Y^*) = \Var(Y)(1 - \rho^2)`}</BlockMath>
          <p className="text-neutral-700">
            At <InlineMath>{`\rho = 0.7`}</InlineMath>, half the variance is eliminated &mdash;
            equivalent to doubling your traffic.
          </p>
        </div>

        <p className="mb-6 text-neutral-700">
          <strong>Safety rule:</strong> Covariates must come from the{' '}
          <em>pre-experiment</em> period. Using post-treatment covariates can introduce
          bias and invalidate the analysis.
        </p>

        {/* Step 4 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 4: Estimate the treatment effect</h4>
        <p className="mb-2 text-neutral-700">
          Compute the adjusted group means and the <strong>relative lift</strong>:
        </p>
        <BlockMath>{`\hat{\tau}(t) = \hat{\mu}_1(t) - \hat{\mu}_0(t), \qquad \text{Relative lift}(t) = \frac{\hat{\tau}(t)}{\hat{\mu}_0(t)}`}</BlockMath>
        <DisplayMathBox>
          <BlockMath>{`\hat{\tau}(t) = \hat{\mu}_1(t) - \hat{\mu}_0(t), \qquad \text{Relative lift}(t) = \frac{\hat{\tau}(t)}{\hat{\mu}_0(t)}`}</BlockMath>
        </DisplayMathBox>

        <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-6">
          <p className="text-neutral-700 mb-2">
            <InlineMath>{`\hat{\mu}_0(t)`}</InlineMath> and{' '}
            <InlineMath>{`\hat{\mu}_1(t)`}</InlineMath> are the adjusted group means at
            time <InlineMath>{`t`}</InlineMath>. Their difference{' '}
            <InlineMath>{`\hat{\tau}(t)`}</InlineMath> estimates the average treatment
            effect. Dividing by the control mean yields the relative lift.
          </p>
          <p className="text-neutral-700">
            Relative lift is preferred because it is <strong>scale-invariant</strong> &mdash;
            a 3% lift has the same interpretation regardless of the baseline level.
          </p>
        </div>

        {/* Step 5 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 5: Estimate the variance</h4>
        <BlockMath>{`\hat{\sigma}_{\hat{\tau}}^2(t) = \frac{s_0^2(t)}{n_0(t)} + \frac{s_1^2(t)}{n_1(t)}`}</BlockMath>
        <DisplayMathBox>
          <BlockMath>{`\hat{\sigma}_{\hat{\tau}}^2(t) = \frac{s_0^2(t)}{n_0(t)} + \frac{s_1^2(t)}{n_1(t)}`}</BlockMath>
        </DisplayMathBox>

        <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-6">
          <p className="text-neutral-700">
            Here <InlineMath>{`s_g^2(t)`}</InlineMath> is the sample variance (spread) of the
            adjusted outcomes in group <InlineMath>{`g`}</InlineMath>, and{' '}
            <InlineMath>{`n_g(t)`}</InlineMath> is the number of users in that group so far.
            The variance is estimated from the data &mdash; not assumed known.
          </p>
        </div>

        {/* Step 6 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 6: Construct the sequential confidence interval</h4>
        <p className="mb-3 text-neutral-700">
          Instead of using the fixed critical value{' '}
          <InlineMath>{`z_{\alpha/2} \approx 1.96`}</InlineMath>, Eppo applies a time-varying
          multiplier derived from the confidence sequence framework:
        </p>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 mb-4">
          <BlockMath>{`E = mc^2`}</BlockMath>
        </div>
        <DisplayMathBox>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 mb-4">
            <BlockMath>{`E = mc^2`}</BlockMath>
          </div>
        </DisplayMathBox>
        {/* Step 7 and remaining JSX go here */}
        {/* ...existing code... */}
      </div>
    )
}
            <a href="#ref-howard-2021" className="text-blue-600 hover:text-blue-800">Howard et al. (2021)</a>, specifically the Normal mixture boundary. The
            mathematical guarantee: the true treatment effect lies inside the CI at{' '}
            <em>all times simultaneously</em> with probability{' '}
            <InlineMath>{`\\geq 1 - \\alpha`}</InlineMath>.
          </p>
        </div>

        {/* Step 7 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 7: Decide</h4>

        <div className="overflow-x-auto mb-4">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">What you see</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Colour</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3">CI entirely above 0</td>
                <td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-green-600 rounded mr-2 align-middle"></span>Green</td>
                <td className="border border-neutral-300 p-3">Positive effect. Ship the feature.</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">CI entirely below 0</td>
                <td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-neutral-500 rounded mr-2 align-middle"></span>Dark grey</td>
                <td className="border border-neutral-300 p-3">Negative effect. Revert.</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">CI crosses 0, experiment ongoing</td>
                <td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-gray-400 rounded mr-2 align-middle"></span>Grey</td>
                <td className="border border-neutral-300 p-3">Inconclusive. Keep collecting.</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">CI crosses 0, experiment ended</td>
                <td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-gray-400 rounded mr-2 align-middle"></span>Grey</td>
                <td className="border border-neutral-300 p-3">No significant effect. Decide pragmatically.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-6 text-neutral-700">
          <strong>This decision is valid at any stopping time.</strong> No pre-specified
          analysis schedule is required. This resolves the peeking problem from Act 1.
        </p>

        {/* ── Key Takeaway ── */}
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-10">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>The Eppo pipeline in one sentence:</strong>{' '}
              Randomise &rarr; collect outcomes <InlineMath>{`Y`}</InlineMath> and covariates{' '}
              <InlineMath>{`X`}</InlineMath> &rarr; regression-adjust (remove predictable noise)
              &rarr; estimate lift and variance &rarr; wrap in a sequential CI &rarr; decide when
              CI excludes zero.
            </p>
            <p><strong>What makes it work:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Framework:</strong> <a href="#ref-howard-2021" className="text-blue-600 hover:text-blue-800">Howard et al. (2021)</a> confidence sequences.</li>
              <li><strong>Noise reduction:</strong> Generalised CUPED via per-group regression.</li>
              <li><strong>Output:</strong> Relative lift with a CI that is valid at any time.</li>
            </ul>
          </div>
        </div>

        {/* ── Hybrid Approach ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Hybrid Approach</h3>

        <p className="mb-4 text-neutral-700">
          The sequential CI is always wider than a fixed-horizon CI at any given sample
          size. For the <strong>primary KPI</strong> &mdash; the metric the experiment is
          designed to move &mdash; this width penalty reduces statistical power.
        </p>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-6">
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Apply sequential testing where early stopping adds the most value
              (safety guardrails), and fixed-horizon testing where statistical power
              matters most (the primary metric).</strong>
            </p>
            <p>
              The hybrid approach partitions metrics into two categories:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Guardrail KPIs</strong> (revenue, error rate, latency, etc.):
                monitored continuously with a <strong>sequential CI</strong>. If the CI
                excludes zero on the harmful side, abort the experiment immediately.</li>
              <li><strong>Primary KPI</strong> (the metric the experiment targets):
                analysed with a <strong>standard fixed-horizon CI</strong> at the pre-planned
                end date. No peeking penalty. Full statistical power.</li>
            </ul>
          </div>
        </div>

        <h4 className="text-lg font-bold text-neutral-900 mb-3">What you gain</h4>

        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"></th>
                <th className="border border-neutral-300 p-3 font-semibold">Full sequential</th>
                <th className="border border-neutral-300 p-3 font-semibold">Hybrid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Primary KPI CI width</td>
                <td className="border border-neutral-300 p-3 text-center">Wider (~10&ndash;40%)</td>
                <td className="border border-neutral-300 p-3 text-center">Standard (no penalty)</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Primary KPI power</td>
                <td className="border border-neutral-300 p-3 text-center">Reduced</td>
                <td className="border border-neutral-300 p-3 text-center">Full</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Guardrail protection</td>
                <td className="border border-neutral-300 p-3 text-center">Continuous</td>
                <td className="border border-neutral-300 p-3 text-center">Continuous</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Early stopping for success</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">No</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3 font-medium">Early stopping for harm</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
                <td className="border border-neutral-300 p-3 text-center">Yes</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3 font-medium">Complexity</td>
                <td className="border border-neutral-300 p-3 text-center">Higher</td>
                <td className="border border-neutral-300 p-3 text-center">Lower</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>The hybrid approach in one sentence:</strong>{' '}
              Monitor guardrail KPIs with a sequential CI for early abort; analyse the
              primary KPI with a standard CI at the planned end-date.
            </p>
            <p>
              This gives you the safety of sequential testing where it matters most
              (preventing harm) without paying the power penalty on the metric you care
              about most (the primary KPI).
            </p>
            <p>
              <strong>This is the recommended approach for most A/B testing programmes.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}