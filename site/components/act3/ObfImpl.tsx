'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

export function ObfImpl() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-700">Method 3: O&apos;Brien&ndash;Fleming Boundaries (1979)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The idea</h4>
            <p className="text-neutral-700">
              Instead of a constant threshold, use a threshold that <em>decreases</em> over
              time. At the first peek, demand very strong evidence; at the last peek,
              demand nearly the same evidence as a classical test.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The recipe</h4>
            <p className="text-neutral-700 mb-2">
              At peek <InlineMath>{`k`}</InlineMath> (of <InlineMath>{`K`}</InlineMath> total),
              use the critical value:
            </p>
            <BlockMath>{`c_k^{\\text{OBF}} \\;\\approx\\; z_{\\alpha/2} \\cdot \\sqrt{K/k}`}</BlockMath>
            <p className="text-neutral-700">
              where <InlineMath>{`z_{\\alpha/2} \\approx 1.96`}</InlineMath> is the standard Normal
              critical value.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Critical values at each peek (K=4)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 p-2">Peek <InlineMath>{`k`}</InlineMath> (of K=4)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`c_k^{\\text{OBF}}`}</InlineMath></th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`c_P`}</InlineMath> (Pocock)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath> (Bonf.)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`z_{\\alpha/2}`}</InlineMath> (classical)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1 (25% of data)', '4.05', '2.36', '2.50', '1.96'],
                    ['2 (50% of data)', '2.86', '2.36', '2.50', '1.96'],
                    ['3 (75% of data)', '2.34', '2.36', '2.50', '1.96'],
                    ['4 (100% of data)', '2.02', '2.36', '2.50', '1.96'],
                  ].map(([peek, obf, poc, bon, cls], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-neutral-50' : ''}>
                      <td className="border border-neutral-300 p-2 text-center">{peek}</td>
                      <td className="border border-neutral-300 p-2 text-center font-semibold">{obf}</td>
                      <td className="border border-neutral-300 p-2 text-center">{poc}</td>
                      <td className="border border-neutral-300 p-2 text-center">{bon}</td>
                      <td className="border border-neutral-300 p-2 text-center">{cls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-neutral-400 rounded-lg p-4">
            <p className="text-neutral-700">
              O&apos;Brien&ndash;Fleming is extremely conservative early (threshold 4.05 at the
              first analysis &mdash; early stopping is rare) but barely penalises
              the final analysis (2.02 vs. 1.96 &mdash; only 3% wider).
              This makes it the most efficient method: if the experiment runs to completion,
              the power loss from the interim analyses is negligible.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Implementation step by step</h4>
            <ol className="list-decimal list-inside space-y-3 text-neutral-700 ml-4">
              <li>
                <strong>Before the experiment:</strong> Fix <InlineMath>{`K`}</InlineMath> and{' '}
                <InlineMath>{`\\alpha`}</InlineMath>. At each peek <InlineMath>{`k`}</InlineMath>,
                the fraction of total data collected is{' '}
                <InlineMath>{`t_k = k / K`}</InlineMath> (assuming equal spacing).
              </li>
              <li>
                <strong>At peek <InlineMath>{`k`}</InlineMath>, compute the critical value:</strong>
                <BlockMath>{`c_k^{\\text{OBF}} = \\frac{z_{\\alpha/2}}{\\sqrt{t_k}} = z_{\\alpha/2} \\cdot \\sqrt{\\frac{K}{k}}`}</BlockMath>
              </li>
              <li>
                <strong>Compute the <InlineMath>{`z`}</InlineMath>-statistic</strong> (same as Bonferroni and Pocock):
                <BlockMath>{`Z_k = \\frac{\\hat{\\tau}(t_k)}{\\text{SE}(t_k)}`}</BlockMath>
              </li>
              <li>
                <strong>Decide:</strong> If <InlineMath>{`|Z_k| > c_k^{\\text{OBF}}`}</InlineMath>: reject.
                Otherwise: continue to peek <InlineMath>{`k+1`}</InlineMath>.
              </li>
              <li>
                <strong>Convert to a confidence interval</strong> (optional but recommended):
                <BlockMath>{`\\text{CI}_k = \\hat{\\tau}(t_k) \\;\\pm\\; c_k^{\\text{OBF}} \\cdot \\text{SE}(t_k)`}</BlockMath>
                <p className="text-sm text-neutral-600 ml-4">
                  Note: the CI width <em>changes</em> across peeks because{' '}
                  <InlineMath>{`c_k^{\\text{OBF}}`}</InlineMath> varies.
                </p>
              </li>
            </ol>
          </div>

          <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
            <h5 className="font-bold text-purple-900 mb-2">Practical tips</h5>
            <p className="text-neutral-700 text-sm">
              The exact O&apos;Brien&ndash;Fleming boundaries (computed via multivariate Normal
              integration) differ slightly from the <InlineMath>{`z_{\\alpha/2}/\\sqrt{t_k}`}</InlineMath>{' '}
              approximation. The approximation is accurate for <InlineMath>{`K \\leq 10`}</InlineMath>{' '}
              and is what most software implements. For larger <InlineMath>{`K`}</InlineMath>, use a
              library (e.g. <code>statsmodels</code> or the R package <code>gsDesign</code>).
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
