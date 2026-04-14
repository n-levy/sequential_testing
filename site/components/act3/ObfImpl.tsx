'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

interface ObfImplProps {
  k?: number
  alpha?: number
}

export function ObfImpl({ k = 5, alpha = 0.05 }: ObfImplProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>O&apos;Brien-Fleming Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Recipe</h4>
            <div className="bg-neutral-50 p-3 rounded border text-sm">
              <p className="mb-2">For <InlineMath>{`K = ${k}`}</InlineMath> planned analyses:</p>
              <BlockMath>{`z_{\\text{crit}}(t) = \\frac{c_{\\text{OBF}}}{\\sqrt{t/K}}`}</BlockMath>
              <p className="mt-2">Boundaries decrease as information accumulates</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Critical Values</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-300 p-2">Analysis</th>
                    <th className="border border-neutral-300 p-2">Information fraction</th>
                    <th className="border border-neutral-300 p-2">Critical Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: k }, (_, i) => {
                    const analysis = i + 1
                    const infoFrac = analysis / k
                    const crit = (1.96 / Math.sqrt(infoFrac)).toFixed(3)
                    return (
                      <tr key={analysis}>
                        <td className="border border-neutral-300 p-2 text-center">{analysis}</td>
                        <td className="border border-neutral-300 p-2 text-center">{infoFrac.toFixed(2)}</td>
                        <td className="border border-neutral-300 p-2 text-center">{crit}</td>
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
              <pre>{`def obf_test(data, k, t, c=1.96):
    info_frac = t / k
    boundary = c / sqrt(info_frac)
    z_stat = calculate_z_statistic(data)
    return abs(z_stat) >= boundary`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Pros & Cons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h5 className="font-medium text-green-800 mb-1">Pros</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Near-optimal final-analysis power</li>
                  <li>Conservative early (limits false positives)</li>
                  <li>Industry standard for clinical trials</li>
                </ul>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h5 className="font-medium text-red-800 mb-1">Cons</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>Very hard to reject early</li>
                  <li>Requires pre-specified number of looks</li>
                  <li>Complex boundary computation</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Practical Tips</h4>
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Use when you expect effects to appear gradually</li>
                <li>Good for safety monitoring in clinical trials</li>
                <li>Consider Pocock if early detection is a priority</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
