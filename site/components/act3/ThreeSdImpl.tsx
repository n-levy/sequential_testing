'use client'

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { InlineMath, BlockMath } from '../ui/Math'

export function ThreeSdImpl() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-700">Method 4: 3 Standard Deviations Rule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The idea</h4>
            <p className="text-neutral-700">
              A simple informal rule sometimes used in practice: stop the experiment
              and declare a significant result if the effect estimate is more than
              3 standard deviations from zero at any point during the test.
              This corresponds to using a fixed critical value of <InlineMath>{`z = 3.0`}</InlineMath>{' '}
              at every look, regardless of how many peeks are planned.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The recipe</h4>
            <p className="text-neutral-700 mb-2">
              At each peek, compute the confidence interval using the fixed critical value:
            </p>
            <BlockMath>{`\\text{CI}_k = \\hat{\\tau}(t_k) \\;\\pm\\; 3.0 \\cdot \\text{SE}(t_k)`}</BlockMath>
            <p className="text-neutral-700">
              Reject (stop early) if the interval excludes zero, i.e. if{' '}
              <InlineMath>{`|Z_k| = |\\hat{\\tau}(t_k) / \\text{SE}(t_k)| > 3.0`}</InlineMath>.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Critical values at each peek (K=4)</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 p-2">Peek <InlineMath>{`k`}</InlineMath> (of K=4)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`c^{\\text{3SD}}`}</InlineMath> (3 SD rule)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`c_k^{\\text{OBF}}`}</InlineMath> (OBF)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`c_P`}</InlineMath> (Pocock)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`z_{\\alpha/2}`}</InlineMath> (classical)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1 (25% of data)', '3.00', '4.05', '2.36', '1.96'],
                    ['2 (50% of data)', '3.00', '2.86', '2.36', '1.96'],
                    ['3 (75% of data)', '3.00', '2.34', '2.36', '1.96'],
                    ['4 (100% of data)', '3.00', '2.02', '2.36', '1.96'],
                  ].map(([peek, threesd, obf, poc, cls], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-neutral-50' : ''}>
                      <td className="border border-neutral-300 p-2 text-center">{peek}</td>
                      <td className="border border-neutral-300 p-2 text-center font-semibold">{threesd}</td>
                      <td className="border border-neutral-300 p-2 text-center">{obf}</td>
                      <td className="border border-neutral-300 p-2 text-center">{poc}</td>
                      <td className="border border-neutral-300 p-2 text-center">{cls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-neutral-400 rounded-lg p-4">
            <p className="text-neutral-700">
              The 3 SD rule uses the same threshold (3.0) at every analysis.
              At a single look, this corresponds to a false positive rate of about{' '}
              <InlineMath>{`2 \\times \\Phi(-3) \\approx 0.27\\%`}</InlineMath>{' '}
              per look &mdash; far below the nominal 5%.
              With 6 peeks and independent looks, the Bonferroni upper bound on
              the family-wise error rate is approximately <InlineMath>{`6 \\times 0.27\\% \\approx 1.6\\%`}</InlineMath>{' '}
              (in this simulation setup). In practice the true rate is lower because looks are positively correlated.
              The simulation below confirms this conservative behavior.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Implementation step by step</h4>
            <ol className="list-decimal list-inside space-y-3 text-neutral-700 ml-4">
              <li>
                <strong>At each peek:</strong> compute the z-statistic:
                <BlockMath>{`Z_k = \\frac{\\hat{\\tau}(t_k)}{\\text{SE}(t_k)}`}</BlockMath>
              </li>
              <li>
                <strong>Decide:</strong> If <InlineMath>{`|Z_k| > 3.0`}</InlineMath>: stop and reject.
                Otherwise: continue to the next peek.
              </li>
              <li>
                <strong>No pre-specification of K required</strong> &mdash; the threshold does not
                depend on the total number of planned peeks.
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <h5 className="font-bold text-blue-900 mb-2">Statistical caveats</h5>
            <p className="text-neutral-700 text-sm">
              The 3 SD rule does not formally control the family-wise error rate at any
              pre-specified level. Its false positive rate depends on the number of peeks,
              which may not be known in advance. While it is conservative in practice
              (the simulation shows a very low crossing share under the null), the method
              does not provide the anytime-valid guarantee of the sequential confidence interval
              (Act 2), nor the formal FWER control of Bonferroni, Pocock, or O&apos;Brien&ndash;Fleming.
              It also penalises the final analysis &mdash; a fixed z = 3.0 is substantially
              wider than the classical z = 1.96, so statistical power is meaningfully reduced.
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
