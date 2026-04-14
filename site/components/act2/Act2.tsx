'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'
import { PipelineDiagram } from './PipelineDiagram'
import { PipelineStepDetail } from './PipelineStepDetail'
import { EppoPipelineSim } from './EppoPipelineSim'

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

        {/* ── Big Idea ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Big Idea</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Eppo replaces the standard confidence interval with a{' '}
              <strong>sequential confidence interval</strong> &mdash; a band around the estimated
              treatment effect that is valid at <em>every moment</em> since the experiment started,
              not just at one pre-planned analysis time.
            </p>
            <p>
              The key insight: a sequential CI is wider than a standard CI (you pay a small price
              for the freedom to peek), but the error guarantee holds no matter when you look.
              And Eppo reduces the noise in your data using pre-experiment information, making
              the CI narrower and experiments faster.
            </p>
          </div>
        </div>

        {/* ── Simulation ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Simulation</h3>

        <div className="bg-orange-50 border border-orange-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-orange-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>What is being simulated:</strong>{' '}
              A single A/B experiment flowing through Eppo&apos;s pipeline, stage by stage.
            </p>
            <p>
              <strong>Animated pipeline diagram.</strong> Data flows left-to-right through
              labelled stages. Each stage lights up as it is explained.
            </p>
            <div className="text-center my-4">
              <BlockMath>{`\\fbox{Randomise} \\;\\to\\; \\fbox{Collect} \\;\\to\\; \\fbox{Adjust} \\;\\to\\; \\fbox{Estimate} \\;\\to\\; \\fbox{CI} \\;\\to\\; \\fbox{Decide}`}</BlockMath>
            </div>
          </div>
        </div>

        <div className="mb-12 max-w-6xl mx-auto">
          <PipelineDiagram
            activeStep={activeStep}
            onStepClick={setActiveStep}
          />
          <PipelineStepDetail activeStep={activeStep} />
        </div>

        <div className="mb-12">
          <EppoPipelineSim />
        </div>

        {/* ── Pipeline Step by Step ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Pipeline, Step by Step</h3>

        {/* Step 1 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 1: Randomise</h4>
        <p className="mb-4 text-neutral-700">
          Each user arriving at the website is randomly assigned to <strong>control</strong>{' '}
          (existing experience) or <strong>treatment</strong> (new feature). Randomisation
          ensures the groups are comparable &mdash; any difference in outcomes is caused by
          the treatment, not by pre-existing differences.
        </p>

        {/* Step 2 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 2: Collect data over time</h4>
        <p className="mb-2 text-neutral-700">As users interact with the product, two quantities are recorded for each user:</p>
        <ul className="list-disc list-inside ml-4 mb-4 text-neutral-700 space-y-1">
          <li><InlineMath>{`Y_i`}</InlineMath>: the <strong>outcome</strong> during the experiment (e.g. purchase amount, clicks, session length).</li>
          <li><InlineMath>{`X_i`}</InlineMath>: a <strong>pre-experiment covariate</strong> &mdash; the same metric from before the experiment started (e.g. purchases in the prior 2 weeks).</li>
        </ul>

        {/* Step 3 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 3: Regression adjustment (noise removal)</h4>
        <p className="mb-3 text-neutral-700">
          Users are wildly different &mdash; some buy &euro;0, others &euro;500. This noise drowns out
          the treatment effect. Eppo reduces this noise by using pre-experiment data.
        </p>
        <p className="mb-2 text-neutral-700">
          For each group <strong>separately</strong>, fit a model predicting{' '}
          <InlineMath>{`Y`}</InlineMath> from <InlineMath>{`X`}</InlineMath>:
        </p>
        <BlockMath>{`\\hat{f}_{\\text{control}}(X), \\qquad \\hat{f}_{\\text{treatment}}(X)`}</BlockMath>
        <p className="my-2 text-neutral-700">
          Then compute the <strong>adjusted outcome</strong> for each user:
        </p>
        <BlockMath>{`Y^*_i = Y_i - \\hat{f}_g(X_i)`}</BlockMath>
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
            This is a generalisation of a technique called CUPED (Deng et al., 2013).
            The stronger the correlation <InlineMath>{`\\rho`}</InlineMath> between pre-experiment
            and experiment behaviour, the more noise is removed:
          </p>
          <BlockMath>{`\\Var(Y^*) = \\Var(Y)(1 - \\rho^2)`}</BlockMath>
          <p className="text-neutral-700">
            At <InlineMath>{`\\rho = 0.7`}</InlineMath>, half the variance is eliminated &mdash;
            equivalent to doubling your traffic.
          </p>
        </div>

        <p className="mb-6 text-neutral-700">
          <strong>Safety rule:</strong> The covariate <InlineMath>{`X`}</InlineMath> must come from
          the <em>pre-experiment</em> period. Never use data that could be affected by the treatment.
        </p>

        {/* Step 4 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 4: Estimate the treatment effect</h4>
        <p className="mb-2 text-neutral-700">
          Compute the adjusted group means and the <strong>relative lift</strong>:
        </p>
        <BlockMath>{`\\hat{\\tau}(t) = \\hat{\\mu}_1(t) - \\hat{\\mu}_0(t), \\qquad \\text{Relative lift}(t) = \\frac{\\hat{\\tau}(t)}{\\hat{\\mu}_0(t)}`}</BlockMath>

        <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-6">
          <p className="text-neutral-700 mb-2">
            Here <InlineMath>{`\\hat{\\mu}_0(t)`}</InlineMath> and{' '}
            <InlineMath>{`\\hat{\\mu}_1(t)`}</InlineMath> are the average adjusted outcomes
            in the control and treatment groups at time <InlineMath>{`t`}</InlineMath>.
            Their difference <InlineMath>{`\\hat{\\tau}(t)`}</InlineMath> is the estimated
            treatment effect. Dividing by the control mean gives a percentage:
            &ldquo;the treatment increased purchases by +3%.&rdquo;
          </p>
          <p className="text-neutral-700">
            Relative lift is preferred because it is <strong>scale-invariant</strong> &mdash;
            a 3% lift means the same thing whether the baseline is &euro;10 or &euro;10,000.
          </p>
        </div>

        {/* Step 5 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 5: Estimate the variance</h4>
        <BlockMath>{`\\hat{\\sigma}_{\\hat{\\tau}}^2(t) = \\frac{s_0^2(t)}{n_0(t)} + \\frac{s_1^2(t)}{n_1(t)}`}</BlockMath>

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
          This is the key formula. Instead of a standard CI (which uses the constant{' '}
          <InlineMath>{`z_{\\alpha/2} \\approx 1.96`}</InlineMath>), Eppo uses a time-varying
          multiplier:
        </p>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 mb-4">
          <BlockMath>{`\\text{CI}(t) = \\hat{\\tau}(t) \\;\\pm\\; \\hat{\\sigma}_{\\hat{\\tau}}(t) \\cdot \\underbrace{\\sqrt{\\frac{n + \\nu}{n} \\cdot \\log\\!\\frac{n + \\nu}{\\nu \\alpha^2}}}_{\\text{sequential multiplier}}`}</BlockMath>
        </div>

        <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-6">
          <p className="font-semibold text-neutral-800 mb-3">Unpacking the formula:</p>
          <ul className="list-disc list-inside space-y-2 text-neutral-700">
            <li><InlineMath>{`\\hat{\\tau}(t)`}</InlineMath>: the estimated treatment effect at time <InlineMath>{`t`}</InlineMath> (from Step 4).</li>
            <li><InlineMath>{`\\hat{\\sigma}_{\\hat{\\tau}}(t)`}</InlineMath>: the estimated standard error (from Step 5).</li>
            <li><InlineMath>{`n = n_0(t) + n_1(t)`}</InlineMath>: total observations so far.</li>
            <li><InlineMath>{`\\alpha`}</InlineMath>: significance level (e.g. 0.05 for a 95% CI).</li>
            <li><InlineMath>{`\\nu`}</InlineMath>: a tuning parameter set from the expected total sample size <InlineMath>{`M`}</InlineMath>: <InlineMath>{`\\nu = M \\cdot \\hat{\\sigma}^2`}</InlineMath>. It controls <em>which</em> sample size the CI is tightest for.</li>
            <li>The &ldquo;sequential multiplier&rdquo; replaces the constant 1.96. It starts higher (e.g. ~3.8 early on) and slowly decreases toward 1.96 &mdash; but never quite reaches it. This is the <strong>price of peeking</strong>.</li>
          </ul>
          <p className="text-neutral-700 mt-3">
            This formula comes from the <em>confidence sequence</em> framework of
            Howard et al. (2021), specifically the Normal mixture boundary. The
            mathematical guarantee: the true treatment effect lies inside the CI at{' '}
            <em>all times simultaneously</em> with probability{' '}
            <InlineMath>{`\\geq 1 - \\alpha`}</InlineMath>.
          </p>
        </div>

        {/* Step 7 */}
        <h4 className="text-xl font-bold text-neutral-900 mb-3">Step 7: Decide</h4>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse border border-neutral-300">
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
                <td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-red-600 rounded mr-2 align-middle"></span>Red</td>
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
          <strong>This decision is valid at whatever time it is made.</strong> No need to
          pre-specify an analysis time. This solves the peeking problem from Act 1.
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
              <li><strong>Framework:</strong> Howard et al. (2021) confidence sequences.</li>
              <li><strong>Noise reduction:</strong> Generalised CUPED via per-group regression.</li>
              <li><strong>Output:</strong> Relative lift with a CI that is valid at any time.</li>
            </ul>
          </div>
        </div>

        {/* ── Hybrid Approach ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Hybrid Approach</h3>

        <p className="mb-4 text-neutral-700">
          The full sequential pipeline described above is powerful but comes with a cost:
          the sequential CI is always wider than a fixed-horizon CI (the &ldquo;price of
          peeking&rdquo;). For the <strong>primary KPI</strong> &mdash; the metric you are trying
          to improve &mdash; this wider CI means you need more data to detect the same effect size.
        </p>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-6">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Use sequential testing where it matters most &mdash; early stopping for
              safety &mdash; and fixed-horizon testing where it is most efficient &mdash; the
              primary metric.</strong>
            </p>
            <p>
              The hybrid approach splits your metrics into two categories:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Guardrail KPIs</strong> (revenue, error rate, latency, etc.):
                monitored with a <strong>sequential CI</strong>. You can check these every
                day or even continuously. If the CI goes fully below zero, abort immediately.</li>
              <li><strong>Primary KPI</strong> (the metric you are trying to improve):
                analysed with a <strong>standard fixed-horizon CI</strong> at the pre-planned
                end of the experiment. No peeking penalty. Full statistical power.</li>
            </ul>
          </div>
        </div>

        <h4 className="text-lg font-bold text-neutral-900 mb-3">What you gain</h4>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse border border-neutral-300">
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