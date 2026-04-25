'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

export function PocockImpl() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-orange-700">Method 2: Pocock Boundaries (1977)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The idea</h4>
            <p className="text-neutral-700 mb-2">
              Like Bonferroni, pre-specify <InlineMath>{`K`}</InlineMath> equally-spaced analysis
              times. But instead of Bonferroni's crude <InlineMath>{`\\alpha/K`}</InlineMath> split,
              use a constant critical value <InlineMath>{`c_P`}</InlineMath> that accounts for the
              correlation between test statistics at different peeks.
            </p>
            <p className="text-neutral-700">
              Because the test statistics <InlineMath>{`Z_1, Z_2, \\ldots, Z_K`}</InlineMath> at
              successive analyses share overlapping data, they are positively correlated. Pocock's
              method exploits this to derive a tighter threshold.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">The recipe</h4>
            <ol className="list-decimal list-inside space-y-2 text-neutral-700 ml-4">
              <li>Choose <InlineMath>{`K`}</InlineMath> and <InlineMath>{`\\alpha`}</InlineMath>.</li>
              <li>Look up (or compute) the Pocock critical value <InlineMath>{`c_P(K, \\alpha)`}</InlineMath>.</li>
              <li>At each peek <InlineMath>{`k`}</InlineMath>, compute the <InlineMath>{`z`}</InlineMath>-statistic: <InlineMath>{`Z_k = \\hat{\\tau}(t_k) / \\hat{\\sigma}_{\\hat{\\tau}}(t_k)`}</InlineMath>.</li>
              <li>If <InlineMath>{`|Z_k| > c_P`}</InlineMath>: stop and declare significance.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">Pocock vs Bonferroni critical values</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 p-2"><InlineMath>{`K`}</InlineMath></th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`c_P`}</InlineMath> (Pocock)</th>
                    <th className="border border-neutral-300 p-2"><InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath> (Bonf.)</th>
                    <th className="border border-neutral-300 p-2">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [2, '2.18', '2.24', '3% tighter'],
                    [4, '2.36', '2.50', '6% tighter'],
                    [8, '2.51', '2.73', '8% tighter'],
                    [12, '2.60', '2.87', '9% tighter'],
                    [20, '2.69', '3.02', '11% tighter'],
                  ].map(([k, cp, zb, imp], i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-neutral-50' : ''}>
                      <td className="border border-neutral-300 p-2 text-center">{k}</td>
                      <td className="border border-neutral-300 p-2 text-center">{cp}</td>
                      <td className="border border-neutral-300 p-2 text-center">{zb}</td>
                      <td className="border border-neutral-300 p-2 text-center">{imp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-neutral-400 rounded-lg p-4">
            <p className="text-neutral-700">
              Pocock gives a constant threshold that is a few percent lower than
              Bonferroni's. The key advantage: the threshold is the same at every peek,
              so it is almost as simple to use as Bonferroni.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-2">How the boundary is computed</h4>
            <p className="text-neutral-700 mb-2">
              Under the null, the <InlineMath>{`z`}</InlineMath>-statistics at successive
              analyses follow a multivariate Normal with correlation:
            </p>
            <BlockMath>{`\\operatorname{Cor}(Z_j, Z_k) = \\sqrt{\\frac{\\min(j,k)}{\\max(j,k)}} \\quad \\text{for } 1 \\leq j, k \\leq K`}</BlockMath>
            <p className="text-neutral-700 mt-2">
              The Pocock boundary <InlineMath>{`c_P`}</InlineMath> is the unique value satisfying:
            </p>
            <BlockMath>{`\\mathbb{P}\\!\\bigl(\\max_{1 \\leq k \\leq K} |Z_k| > c_P\\bigr) = \\alpha`}</BlockMath>
            <p className="text-neutral-700 mt-2">
              Once <InlineMath>{`c_P`}</InlineMath> is known, the decision rule at each peek is
              identical to Bonferroni, but with <InlineMath>{`c_P`}</InlineMath> replacing{' '}
              <InlineMath>{`z_{\\alpha/(2K)}`}</InlineMath>.
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
