'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { EppoPipelineSim } from '@/components/act2/EppoPipelineSim'

export function DetailedAct10() {
  return (
    <section id="act-10" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 10 &mdash; The Eppo Pipeline, Step by Step
          </h2>
          <p className="text-neutral-600">(Schmit &amp; Miller, 2024)</p>
        </div>

        {/* Intuition */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <p className="text-neutral-800">
            Think of Eppo&apos;s pipeline as a factory with six stations. Each station does
            one job. Data enters raw and exits as a trustworthy confidence interval.
          </p>
        </div>

        {/* Pipeline diagram */}
        <div className="bg-neutral-100 rounded-lg p-6 mb-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-mono">
            <span className="bg-blue-100 border border-blue-300 rounded px-3 py-2">Randomise</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 border border-blue-300 rounded px-3 py-2">Collect</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 border border-blue-300 rounded px-3 py-2">Adjust</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 border border-blue-300 rounded px-3 py-2">Estimate</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 border border-blue-300 rounded px-3 py-2">CI</span>
            <span className="text-neutral-400">&rarr;</span>
            <span className="bg-blue-100 border border-blue-300 rounded px-3 py-2">Decide</span>
          </div>
        </div>

        {/* Step 1 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Step 1: Randomise</h3>
        <div className="text-neutral-700 space-y-3 mb-8">
          <p>
            Each user arriving at the website is randomly assigned to <strong>control</strong>{' '}
            (existing experience) or <strong>treatment</strong> (new feature). Randomisation
            ensures the groups are comparable &mdash; any difference in outcomes is caused by
            the treatment, not by pre-existing differences.
          </p>
        </div>

        {/* Step 2 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Step 2: Collect data over time</h3>
        <div className="text-neutral-700 space-y-3 mb-8">
          <p>As users interact with the product, two quantities are recorded for each user:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li><InlineMath>{`Y_i`}</InlineMath>: the <strong>outcome</strong> during the experiment (e.g. purchase amount, clicks, session length).</li>
            <li><InlineMath>{`X_i`}</InlineMath>: a <strong>pre-experiment covariate</strong> &mdash; the same metric from before the experiment started.</li>
          </ul>
        </div>

        {/* Step 3 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Step 3: Regression adjustment (noise removal)</h3>
        <div className="text-neutral-700 space-y-3 mb-8">
          <p>This is where Eppo <em>generalises</em> the CUPED idea from <a href="#ref-deng-2013" className="text-blue-600 hover:text-blue-800">Deng et al. (2013)</a>.</p>
          <p>For each group <strong>separately</strong>:</p>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Fit a regression model predicting <InlineMath>{`Y`}</InlineMath> from the pre-experiment covariates <InlineMath>{`X`}</InlineMath>.</li>
            <li>Compute the <strong>adjusted outcome</strong> (residual) for each user:</li>
          </ol>
          <div className="bg-white border border-neutral-300 rounded-lg p-4 mt-2">
            <BlockMath>{`Y^*_i = Y_i - \\hat{f}_g(X_i)`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600 mt-2">
            <p>
              &ldquo;Predict what each user would have done based on their history, then subtract
              that prediction. What&apos;s left is the part you <em>couldn&apos;t</em> have predicted
              &mdash; and that&apos;s where the treatment effect hides.&rdquo;
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Step 4: Estimate the treatment effect</h3>
        <div className="text-neutral-700 space-y-3 mb-8">
          <p>Compute the adjusted group means:</p>
          <BlockMath>{`\\hat{\\mu}_0(t) = \\frac{1}{n_0(t)} \\sum_{i \\in \\text{control}} Y^*_i, \\qquad \\hat{\\mu}_1(t) = \\frac{1}{n_1(t)} \\sum_{i \\in \\text{treatment}} Y^*_i`}</BlockMath>
          <p>The estimated treatment effect and the <strong>relative lift</strong>:</p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\text{Relative lift}(t) = \\frac{\\hat{\\tau}(t)}{\\hat{\\mu}_0(t)} = \\frac{\\hat{\\mu}_1(t)}{\\hat{\\mu}_0(t)} - 1`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600 mt-2">
            <p>
              If control averages &euro;100 and treatment averages &euro;103, the relative lift
              is <InlineMath>{`103/100 - 1 = 0.03 = +3\\%`}</InlineMath>.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Step 5: Estimate the variance</h3>
        <div className="text-neutral-700 space-y-3 mb-8">
          <p>
            Compute the standard error of <InlineMath>{`\\hat{\\tau}(t)`}</InlineMath> from the{' '}
            <strong>residuals</strong> <InlineMath>{`Y^*_i`}</InlineMath>:
          </p>
          <BlockMath>{`\\hat{\\sigma}_{\\hat{\\tau}}^2(t) = \\frac{s_0^2(t)}{n_0(t)} + \\frac{s_1^2(t)}{n_1(t)}`}</BlockMath>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              The variance is estimated from the data &mdash; not assumed known. This is a key
              difference from the mSPRT (Act 7), which required known variance. <a href="#ref-howard-2021" className="text-blue-600 hover:text-blue-800">Howard et al.&apos;s
              framework</a> (Act 8) permits this.
            </p>
          </div>
        </div>

        {/* Step 6 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Step 6: Construct the sequential confidence interval</h3>
        <div className="text-neutral-700 space-y-3 mb-8">
          <p>
            Plug the estimated treatment effect and its standard error into the Normal
            mixture boundary from Act 8:
          </p>
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <BlockMath>{`\\text{CI}(t) = \\hat{\\tau}(t) \\pm \\hat{\\sigma}_{\\hat{\\tau}}(t) \\cdot \\sqrt{\\frac{n + \\nu}{n} \\cdot \\log\\!\\frac{n + \\nu}{\\nu \\alpha^2}}`}</BlockMath>
          </div>
          <p className="mt-2">
            where <InlineMath>{`n = n_0(t) + n_1(t)`}</InlineMath> is the total sample size and{' '}
            <InlineMath>{`\\nu = M \\cdot \\hat{\\sigma}^2`}</InlineMath> is the tuning parameter.
          </p>
        </div>

        {/* Step 7 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Step 7: Decide</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">What you see</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Colour</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3">CI entirely above 0</td><td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-green-500 rounded mr-1 align-middle"></span> Green</td><td className="border border-neutral-300 p-3">Positive effect. Ship the feature.</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">CI entirely below 0</td><td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-neutral-500 rounded mr-1 align-middle"></span> Dark grey</td><td className="border border-neutral-300 p-3">Negative effect. Revert.</td></tr>
              <tr><td className="border border-neutral-300 p-3">CI crosses 0, experiment ongoing</td><td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-neutral-400 rounded mr-1 align-middle"></span> Grey</td><td className="border border-neutral-300 p-3">Inconclusive. Keep collecting.</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">CI crosses 0, experiment ended</td><td className="border border-neutral-300 p-3"><span className="inline-block w-4 h-4 bg-neutral-400 rounded mr-1 align-middle"></span> Grey</td><td className="border border-neutral-300 p-3">No significant effect. Decide pragmatically.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="text-neutral-700 mb-6">
          <p>
            Because the CI is a confidence sequence (Act 8),{' '}
            <strong>this decision is valid at whatever time it is made.</strong> No need to
            pre-specify an analysis time.
          </p>
        </div>

        {/* Interactive Pipeline Simulation */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">Try It: Interactive Pipeline</h3>
        <div className="mb-8">
          <EppoPipelineSim />
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>The Eppo pipeline in one sentence:</strong> Randomise &rarr; collect{' '}
              <InlineMath>{`Y`}</InlineMath> and covariates <InlineMath>{`X`}</InlineMath> &rarr;
              regression-adjust (remove predictable noise) &rarr; estimate lift and variance
              &rarr; wrap in a sequential CI &rarr; decide when CI excludes zero.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
