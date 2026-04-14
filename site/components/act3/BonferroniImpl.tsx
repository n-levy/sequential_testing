'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

export function BonferroniImpl() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-700">Method 1: Bonferroni Correction (Simplest)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The idea</h4>
            <p className="text-neutral-700">
              Before the experiment starts, commit to checking exactly{' '}
              <InlineMath>{`K`}</InlineMath> times (e.g. every Monday for 4 weeks:{' '}
              <InlineMath>{`K = 4`}</InlineMath>). At each check, use a significance level of{' '}
              <InlineMath>{`\\alpha/K`}</InlineMath> instead of <InlineMath>{`\\alpha`}</InlineMath>.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The recipe</h4>
            <ol className="list-decimal list-inside space-y-2 text-neutral-700 ml-4">
              <li>Choose <InlineMath>{`K`}</InlineMath> (number of planned peeks) and <InlineMath>{`\\alpha`}</InlineMath> (e.g. 0.05).</li>
              <li>At each peek <InlineMath>{`k = 1, \\ldots, K`}</InlineMath>, compute the standard CI using the adjusted significance level:</li>
            </ol>
            <BlockMath>{`\\text{CI}_k = \\hat{\\tau}(t_k) \\;\\pm\\; \\hat{\\sigma}_{\\hat{\\tau}}(t_k) \\cdot z_{\\alpha/(2K)}`}</BlockMath>
            <p className="text-neutral-700 text-sm ml-4">
              where <InlineMath>{`\\hat{\\tau}(t_k)`}</InlineMath> is the estimated treatment effect at peek{' '}
              <InlineMath>{`k`}</InlineMath>, <InlineMath>{`\\hat{\\sigma}_{\\hat{\\tau}}(t_k)`}</InlineMath> is
              its standard error, and <InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath> is the critical value
              from a Normal distribution at the adjusted significance level.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-neutral-700 ml-4" start={3}>
              <li>If the CI does not cross 0: stop and declare significance.</li>
              <li>If <InlineMath>{`k = K`}</InlineMath> and the CI crosses 0: no significant effect.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Critical Values</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 p-2"><InlineMath>{`K`}</InlineMath> (peeks)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`\\alpha/K`}</InlineMath></th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath></th>
                    <th className="border border-neutral-300 p-2">CI multiplier vs. 1.96</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [1, '0.050', '1.96', '1.00× (no correction)'],
                    [2, '0.025', '2.24', '1.14×'],
                    [4, '0.0125', '2.50', '1.28×'],
                    [8, '0.00625', '2.73', '1.39×'],
                    [12, '0.00417', '2.87', '1.46×'],
                    [20, '0.0025', '3.02', '1.54×'],
                    [52, '0.00096', '3.29', '1.68× (weekly for a year)'],
                  ].map(([k, aK, z, mult], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-neutral-50' : ''}>
                      <td className="border border-neutral-300 p-2 text-center">{k}</td>
                      <td className="border border-neutral-300 p-2 text-center">{aK}</td>
                      <td className="border border-neutral-300 p-2 text-center">{z}</td>
                      <td className="border border-neutral-300 p-2 text-center">{mult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-neutral-400 rounded-lg p-4">
            <p className="text-neutral-700">
              With 4 planned peeks, replace <InlineMath>{`z = 1.96`}</InlineMath> with{' '}
              <InlineMath>{`z = 2.50`}</InlineMath>. Your CI is 28% wider at each peek, but you can
              safely check 4 times without inflating errors.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Implementation step by step</h4>
            <p className="text-neutral-700 mb-2">Given data arrays <code>control[]</code> and <code>treatment[]</code> at each scheduled peek:</p>
            <ol className="list-decimal list-inside space-y-3 text-neutral-700 ml-4">
              <li>
                <strong>Compute group statistics:</strong>
                <BlockMath>{`\\bar{Y}_0 = \\frac{1}{n_0}\\sum_{i=1}^{n_0} Y_{0,i}, \\qquad s_0^2 = \\frac{1}{n_0 - 1}\\sum_{i=1}^{n_0}(Y_{0,i} - \\bar{Y}_0)^2`}</BlockMath>
              </li>
              <li>
                <strong>Compute the estimated treatment effect and its standard error:</strong>
                <BlockMath>{`\\hat{\\tau} = \\bar{Y}_1 - \\bar{Y}_0, \\qquad \\text{SE} = \\sqrt{\\frac{s_0^2}{n_0} + \\frac{s_1^2}{n_1}}`}</BlockMath>
              </li>
              <li>
                <strong>Look up the adjusted critical value:</strong>
                <BlockMath>{`z^* = z_{\\alpha/(2K)} = \\Phi^{-1}\\!\\bigl(1 - \\tfrac{\\alpha}{2K}\\bigr)`}</BlockMath>
                <p className="text-sm text-neutral-600 ml-4">
                  where <InlineMath>{`\\Phi^{-1}`}</InlineMath> is the inverse of the standard Normal CDF
                  (e.g. <code>scipy.stats.norm.ppf</code> in Python).
                </p>
              </li>
              <li>
                <strong>Construct the CI and decide:</strong>
                <BlockMath>{`\\text{CI} = \\bigl[\\hat{\\tau} - z^* \\cdot \\text{SE},\\; \\hat{\\tau} + z^* \\cdot \\text{SE}\\bigr]`}</BlockMath>
                <p className="text-sm text-neutral-600 ml-4">
                  If the CI does not contain 0, stop and declare significance. Otherwise, wait
                  until the next scheduled peek.
                </p>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Pros and cons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <ul className="text-sm text-green-800 space-y-1">
                  <li><strong>+</strong> Dead simple. One line of code: change 1.96 to <InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath>.</li>
                  <li><strong>+</strong> Always valid. Works for any test statistic, any distribution.</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <ul className="text-sm text-red-800 space-y-1">
                  <li><strong>&minus;</strong> Conservative. The CI is wider than necessary because Bonferroni ignores the correlation between test statistics at successive peeks.</li>
                  <li><strong>&minus;</strong> Scales poorly. As <InlineMath>{`K`}</InlineMath> grows, the correction becomes increasingly harsh.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
