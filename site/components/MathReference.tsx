'use client'

import { InlineMath, BlockMath } from './ui/Math'

export function MathReference() {
  return (
    <section id="math-reference" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
          Mathematical Reference
        </h2>

        {/* ── Notation Table ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Notation</h3>
        <div className="overflow-x-auto mb-10">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 font-semibold text-left">Symbol</th>
                <th className="border border-neutral-300 p-3 font-semibold text-left">Meaning</th>
                <th className="border border-neutral-300 p-3 font-semibold text-left">Where used</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Y_i', 'Outcome for user i during the experiment', 'Act 2, Steps 2\u20133'],
                ['X_i', 'Pre-experiment covariate for user i', 'Act 2, Step 3 (CUPED)'],
                ['Y^*_i', 'Adjusted outcome after regression adjustment', 'Act 2, Step 3'],
                ['\\hat{\\tau}(t)', 'Estimated treatment effect at time t', 'Act 2, Step 4'],
                ['\\hat{\\mu}_0(t),\\ \\hat{\\mu}_1(t)', 'Adjusted group means at time t', 'Act 2, Step 4'],
                ['\\hat{\\sigma}_{\\hat{\\tau}}(t)', 'Estimated standard error of treatment effect', 'Act 2, Step 5'],
                ['s_g^2(t)', 'Sample variance in group g at time t', 'Act 2, Step 5'],
                ['n_0(t),\\ n_1(t)', 'Number of users in control / treatment at time t', 'Throughout'],
                ['n', 'Total observations: n_0(t) + n_1(t)', 'Act 2, Step 6'],
                ['\\alpha', 'Significance level (typically 0.05)', 'Throughout'],
                ['\\nu', 'Tuning parameter — calibrated to planned sample size', 'Act 2, Step 6 (sequential confidence interval)'],
                ['M', 'Expected total sample size', 'Act 2, Step 6'],
                ['K', 'Number of pre-planned analysis times (peeks)', 'Act 3'],
                ['k', 'Current peek number (1 to K)', 'Act 3'],
                ['t_k', 'Information fraction at peek k: k/K', 'Act 3 (OBF)'],
                ['Z_k', 'z-statistic at peek k: estimated effect divided by its SE', 'Act 3'],
                ['z_{\\alpha/2}', 'Standard Normal critical value (\u22481.96 for 95% CI)', 'Throughout'],
                ['z_{\\alpha/(2K)}', 'Bonferroni-adjusted critical value', 'Act 3 (Bonferroni)'],
                ['c_P', 'Pocock constant critical value', 'Act 3 (Pocock)'],
                ['c_k^{\\text{OBF}}', 'O\'Brien\u2013Fleming critical value at peek k', 'Act 3 (OBF)'],
                ['\\Phi^{-1}', 'Inverse standard Normal CDF (quantile function)', 'Act 3'],
                ['\\rho', 'Correlation between pre-experiment and experiment metrics', 'Act 2, Step 3'],
                ['G', 'Number of guardrail KPIs', 'Act 3 (Hybrid)'],
              ].map(([sym, meaning, where], i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-neutral-50' : ''}>
                  <td className="border border-neutral-300 p-3"><InlineMath>{sym}</InlineMath></td>
                  <td className="border border-neutral-300 p-3">{meaning}</td>
                  <td className="border border-neutral-300 p-3 text-neutral-500 text-xs">{where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Key Formulas ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Key Formulas</h3>

        <div className="space-y-8 mb-10">
          <div className="bg-white border border-neutral-300 rounded-lg p-5">
            <h4 className="font-bold text-neutral-900 mb-2">Standard Confidence Interval</h4>
            <BlockMath>{`\\text{CI} = \\hat{\\tau} \\;\\pm\\; z_{\\alpha/2} \\cdot \\text{SE}`}</BlockMath>
            <p className="text-sm text-neutral-600 mt-2">Valid only at one pre-specified time. The constant <InlineMath>{`z_{\\alpha/2} \\approx 1.96`}</InlineMath> for a 95% confidence interval.</p>
          </div>

          <div className="bg-white border border-neutral-300 rounded-lg p-5">
            <h4 className="font-bold text-neutral-900 mb-2">Sequential Confidence Interval (Howard et al., 2021)</h4>
            <BlockMath>{`\\text{CI}(t) = \\hat{\\tau}(t) \\;\\pm\\; \\hat{\\sigma}_{\\hat{\\tau}}(t) \\cdot \\sqrt{\\frac{n + \\nu}{n} \\cdot \\log\\!\\frac{n + \\nu}{\\nu \\alpha}}`}</BlockMath>
            <p className="text-sm text-neutral-600 mt-2">Valid at <em>all times simultaneously</em>. The sequential multiplier first decreases — reaching a minimum before <InlineMath>{`n^*`}</InlineMath> — then slowly rises. It always stays above 1.96.</p>
          </div>

          <div className="bg-white border border-neutral-300 rounded-lg p-5">
            <h4 className="font-bold text-neutral-900 mb-2">CUPED Variance Reduction</h4>
            <BlockMath>{`Y^*_i = Y_i - \\hat{f}_g(X_i) \\qquad \\Var(Y^*) = \\Var(Y)(1 - \\rho^2)`}</BlockMath>
            <p className="text-sm text-neutral-600 mt-2">At <InlineMath>{`\\rho = 0.7`}</InlineMath>, <InlineMath>{`1 - 0.7^2 = 0.51`}</InlineMath> — about 49% of the variance is eliminated.</p>
          </div>

          <div className="bg-white border border-neutral-300 rounded-lg p-5">
            <h4 className="font-bold text-neutral-900 mb-2">Treatment Effect &amp; Standard Error</h4>
            <BlockMath>{`\\hat{\\tau} = \\bar{Y}_1 - \\bar{Y}_0 \\qquad \\text{SE} = \\sqrt{\\frac{s_0^2}{n_0} + \\frac{s_1^2}{n_1}}`}</BlockMath>
          </div>

          <div className="bg-white border border-neutral-300 rounded-lg p-5">
            <h4 className="font-bold text-neutral-900 mb-2">Bonferroni Adjusted Confidence Interval</h4>
            <BlockMath>{`\\text{CI}_k = \\hat{\\tau}(t_k) \\;\\pm\\; z_{\\alpha/(2K)} \\cdot \\text{SE}(t_k)`}</BlockMath>
          </div>

          <div className="bg-white border border-neutral-300 rounded-lg p-5">
            <h4 className="font-bold text-neutral-900 mb-2">O&apos;Brien&ndash;Fleming Boundary</h4>
            <BlockMath>{`c_k^{\\text{OBF}} = \\frac{z_{\\alpha/2}}{\\sqrt{t_k}} = z_{\\alpha/2} \\cdot \\sqrt{\\frac{K}{k}}`}</BlockMath>
          </div>

          <div className="bg-white border border-neutral-300 rounded-lg p-5">
            <h4 className="font-bold text-neutral-900 mb-2">Pocock Boundary</h4>
            <BlockMath>{`\\mathbb{P}\\!\\bigl(\\max_{1 \\leq k \\leq K} |Z_k| > c_P\\bigr) = \\alpha`}</BlockMath>
            <p className="text-sm text-neutral-600 mt-2">
              With correlation: <InlineMath>{`\\operatorname{Cor}(Z_j, Z_k) = \\sqrt{\\min(j,k)/\\max(j,k)}`}</InlineMath>
            </p>
          </div>
        </div>

        {/* ── Detailed Explanations ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Detailed Explanations</h3>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-5">
            <h4 className="font-bold text-blue-900 mb-2">Confidence Sequences</h4>
            <p className="text-neutral-700">
              A confidence sequence is a sequence of confidence sets{' '}
              <InlineMath>{`(C_t)_{t \\geq 1}`}</InlineMath> such that the true parameter lies
              in <InlineMath>{`C_t`}</InlineMath> for <em>all</em>{' '}
              <InlineMath>{`t`}</InlineMath> simultaneously with high probability. Unlike a
              standard confidence interval (valid at one time), a confidence sequence allows continuous
              monitoring. The price: wider intervals, especially early on.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-300 rounded-lg p-5">
            <h4 className="font-bold text-blue-900 mb-2">Alpha Spending</h4>
            <p className="text-neutral-700">
              The total false positive rate <InlineMath>{`\\alpha`}</InlineMath> can be thought of as
              a &ldquo;budget&rdquo; that is spent across analyses. Bonferroni spends{' '}
              <InlineMath>{`\\alpha/K`}</InlineMath> at each peek. O&apos;Brien&ndash;Fleming spends
              almost nothing early and most at the end. The alpha-spending function{' '}
              <InlineMath>{`\\alpha^*(t)`}</InlineMath> formalises this: at information fraction{' '}
              <InlineMath>{`t`}</InlineMath>, cumulative type I error must not exceed{' '}
              <InlineMath>{`\\alpha^*(t)`}</InlineMath>.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-300 rounded-lg p-5">
            <h4 className="font-bold text-blue-900 mb-2">Information Fraction</h4>
            <p className="text-neutral-700">
              The information fraction at peek <InlineMath>{`k`}</InlineMath> is{' '}
              <InlineMath>{`t_k = k/K`}</InlineMath> for equally-spaced analyses, or more
              generally the ratio of current to planned total statistical information
              (proportional to sample size for equal variances). It ranges from 0 to 1 and
              determines where you are in the experiment.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-300 rounded-lg p-5">
            <h4 className="font-bold text-blue-900 mb-2">FWER vs FDR</h4>
            <p className="text-neutral-700">
              <strong>FWER</strong> (Family-Wise Error Rate): the probability of making{' '}
              <em>at least one</em> false positive across all tests. Bonferroni, Pocock, and OBF
              all control FWER.{' '}
              <strong>FDR</strong> (False Discovery Rate): the expected <em>proportion</em> of
              false positives among rejected hypotheses. FDR control is less strict and typically
              used when testing many hypotheses simultaneously (e.g. gene expression). For A/B
              testing with a small number of metrics, FWER control is standard.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
