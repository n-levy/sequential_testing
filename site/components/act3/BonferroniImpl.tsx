'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

interface BonferroniImplProps {
  k?: number
  alpha?: number
}

export function BonferroniImpl({ k = 5, alpha = 0.05 }: BonferroniImplProps) {
  const adjustedAlpha = alpha / k

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bonferroni Correction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Recipe</h4>
            <div className="bg-neutral-50 p-3 rounded border text-sm">
              <p className="mb-2">For <InlineMath>{`K = ${k}`}</InlineMath> planned analyses:</p>
              <BlockMath>{`\\alpha_{\\text{adjusted}} = \\frac{\\alpha}{K} = \\frac{${alpha}}{${k}} = ${adjustedAlpha.toFixed(3)}`}</BlockMath>
              <p className="mt-2">Reject if <InlineMath>{`|z| \\geq z_{1 - \\alpha_{\\text{adj}}/2}`}</InlineMath></p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Critical Values</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 p-2">Analysis</th>
                    <th className="border border-neutral-300 p-2">Critical Value</th>
                    <th className="border border-neutral-300 p-2">Cumulative α spent</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: k }, (_, i) => {
                    const analysis = i + 1
                    return (
                      <tr key={analysis}>
                        <td className="border border-neutral-300 p-2 text-center">{analysis}</td>
                        <td className="border border-neutral-300 p-2 text-center">2.576</td>
                        <td className="border border-neutral-300 p-2 text-center">{(adjustedAlpha * analysis).toFixed(3)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Implementation</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
              <pre>{`def bonferroni_test(data, k, alpha=0.05):
    adjusted_alpha = alpha / k
    z_critical = norm.ppf(1 - adjusted_alpha / 2)
    z_stat = calculate_z_statistic(data)
    return abs(z_stat) >= z_critical`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Pros & Cons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h5 className="font-medium text-green-800 mb-1">Pros</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Simple to implement</li>
                  <li>Conservative (controls FWER)</li>
                  <li>No assumptions about correlation</li>
                </ul>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h5 className="font-medium text-red-800 mb-1">Cons</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>Very conservative (loses power)</li>
                  <li>Ignores timing of analyses</li>
                  <li>Not optimal for sequential testing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
