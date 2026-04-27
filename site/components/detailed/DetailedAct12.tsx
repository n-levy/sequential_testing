'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { VarianceReductionSim } from './sims/VarianceReductionSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'

export function DetailedAct12() {

  return (
    <section id="act-12" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 12 &mdash; Variance Reduction via Regression Adjustment
          </h2>
        </div>

        {/* Intuition: How do you make experiments faster? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              User outcomes are noisy. If you can predict some of that noise using pre-experiment data, you can subtract it out and make your experiment much more efficient.
            </p>
            <p>
              <strong>Key point:</strong> Regression adjustment removes predictable noise, leaving only the unpredictable part. This shrinks the confidence interval and speeds up decisions.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <VarianceReductionSim />

        {/* Mathematical Formulation */}
        <DisplayMathBox>
        <h3 className="text-2xl font-bold text-neutral-900 mb-4 mt-8">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          From CUPED to generalised regression adjustment
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>Recall CUPED (<a href="#ref-deng-2013" className="text-blue-600 hover:text-blue-800">Deng et al., 2013</a>):</p>
          <BlockMath>{`Y^* = Y - \\theta(X - \\EE[X])`}</BlockMath>
          <p>
            with optimal <InlineMath>{`\\theta = \\Cov(Y,X)/\\Var(X)`}</InlineMath> and variance
            reduction <InlineMath>{`\\Var(Y^*) = \\Var(Y)(1 - \\rho^2)`}</InlineMath>, where{' '}
            <InlineMath>{`\\rho = \\Cor(Y,X)`}</InlineMath> is the correlation coefficient.
          </p>
          <p>Eppo generalises this in two ways:</p>
          <ol className="list-decimal ml-6 space-y-1">
            <li><strong>Nonlinear models:</strong> Instead of a single linear coefficient <InlineMath>{`\\theta`}</InlineMath>, fit a full regression model that can capture nonlinear relationships.</li>
            <li><strong>Separate models per group:</strong> Fit <InlineMath>{`\\hat{f}_{\\text{control}}(X)`}</InlineMath> and <InlineMath>{`\\hat{f}_{\\text{treatment}}(X)`}</InlineMath> independently.</li>
          </ol>
          <div className="bg-white border border-neutral-300 rounded-lg p-4 mt-2">
            <BlockMath>{`Y^*_i = Y_i - \\hat{f}_g(X_i)`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600 mt-2">
            <p>
              The adjusted outcome <InlineMath>{`Y^*_i`}</InlineMath> equals the raw outcome
              minus the model&apos;s prediction from pre-experiment covariates. The residual
              captures only the unpredictable component of each user&apos;s behaviour.
            </p>
          </div>
        </div>

        {/* Variance reduction */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Why this reduces variance</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <BlockMath>{`\\Var(Y^*) = \\Var(Y - \\hat{f}(X)) = \\Var(Y)(1 - R^2)`}</BlockMath>
          <p>
            where <InlineMath>{`R^2`}</InlineMath> is the coefficient of determination &mdash;
            the fraction of variance in <InlineMath>{`Y`}</InlineMath> explained by <InlineMath>{`X`}</InlineMath>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`R^2`}</InlineMath></th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`1 - R^2`}</InlineMath></th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Variance remaining</th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Traffic multiplier</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-neutral-300 p-3">0.10</td><td className="border border-neutral-300 p-3">0.90</td><td className="border border-neutral-300 p-3">90%</td><td className="border border-neutral-300 p-3">1.1&times;</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">0.25</td><td className="border border-neutral-300 p-3">0.75</td><td className="border border-neutral-300 p-3">75%</td><td className="border border-neutral-300 p-3">1.3&times;</td></tr>
                <tr><td className="border border-neutral-300 p-3">0.50</td><td className="border border-neutral-300 p-3">0.50</td><td className="border border-neutral-300 p-3">50%</td><td className="border border-neutral-300 p-3">2&times;</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">0.60</td><td className="border border-neutral-300 p-3">0.40</td><td className="border border-neutral-300 p-3">40%</td><td className="border border-neutral-300 p-3">2.5&times;</td></tr>
                <tr><td className="border border-neutral-300 p-3">0.75</td><td className="border border-neutral-300 p-3">0.25</td><td className="border border-neutral-300 p-3">25%</td><td className="border border-neutral-300 p-3">4&times;</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600 mt-2">
            <p>
              With <InlineMath>{`R^2 = 0.50`}</InlineMath>, the regression explains half the
              variance. The remaining noise is halved &mdash; equivalent to running the
              experiment with twice as many users.
            </p>
          </div>
        </div>

        {/* Safety rule */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-6">
          <h4 className="font-bold text-blue-900 mb-3">Critical Safety Rule</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              The covariate <InlineMath>{`X`}</InlineMath> must satisfy{' '}
              <InlineMath>{`\\EE[X^{(\\text{treatment})}] = \\EE[X^{(\\text{control})}]`}</InlineMath>.
              This is automatically guaranteed when <InlineMath>{`X`}</InlineMath> comes from the{' '}
              <em>pre-experiment</em> period (randomisation has not yet occurred).
            </p>
            <p>
              <strong>NEVER use post-treatment covariates.</strong> <a href="#ref-deng-2013" className="text-blue-600 hover:text-blue-800">Deng et al.</a> demonstrated that
              using an in-experiment covariate produced <strong>directionally opposite
              conclusions</strong>, because the treatment itself changed <InlineMath>{`X`}</InlineMath>.
            </p>
          </div>
        </div>

        {/* Why adjustment doesn't break sequential guarantee */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Why adjustment does not break the sequential guarantee
        </h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <ol className="list-decimal ml-6 space-y-1">
            <li>Covariates come from the pre-experiment period (independent of treatment).</li>
            <li>Regression adjustment changes only the variance, not the mean treatment effect.</li>
            <li>The sub-Gaussian condition (Act 9) is satisfied by the adjusted residuals.</li>
            <li><a href="#ref-ville-1939" className="text-blue-600 hover:text-blue-800">Ville&apos;s inequality</a> applies to the resulting supermartingale.</li>
          </ol>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600 mt-2">
            <p>
              Regression adjustment reduces variance without changing the estimand. The
              sequential guarantee depends on the martingale structure, which is preserved
              because pre-experiment covariates are independent of treatment assignment.
            </p>
          </div>
        </div>

        </DisplayMathBox>

        {/* Key Takeaway */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>Key concepts:</strong> regression adjustment as generalised CUPED, separate
              models per group, variance reduction factor <InlineMath>{`1 - R^2`}</InlineMath>,
              the safety rule (pre-experiment covariates only), adjustment preserves the
              sequential guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
