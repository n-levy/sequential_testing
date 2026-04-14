'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

interface PocockImplProps {
  k?: number
  alpha?: number
}

export function PocockImpl({ k = 5, alpha = 0.05 }: PocockImplProps) {
  // Pocock boundaries: constant critical value at each look
  // For k=5, alpha=0.05 two-sided, the Pocock boundary is ~2.413
  const pocockBoundaries: Record<number, number> = { 2: 2.178, 3: 2.289, 4: 2.361, 5: 2.413 }
  const boundary = pocockBoundaries[k] || 2.413

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pocock Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Recipe</h4>
            <div className="bg-neutral-50 p-3 rounded border text-sm">
              <p className="mb-2">For <InlineMath>{`K = ${k}`}</InlineMath> equally-spaced analyses:</p>
              <BlockMath>{`z_{\\text{crit}} = c_P(K, \\alpha) = ${boundary.toFixed(3)}`}</BlockMath>
              <p className="mt-2">Same boundary at every analysis — reject if <InlineMath>{`|Z_k| \\geq ${boundary.toFixed(3)}`}</InlineMath></p>
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
                    return (
                      <tr key={analysis}>
                        <td className="border border-neutral-300 p-2 text-center">{analysis}</td>
                        <td className="border border-neutral-300 p-2 text-center">{(analysis / k).toFixed(2)}</td>
                        <td className="border border-neutral-300 p-2 text-center">{boundary.toFixed(3)}</td>
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
              <pre>{`def pocock_test(data, k, boundary=2.413):
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
                  <li>Constant boundary (simple to implement)</li>
                  <li>Good power for early effects</li>
                  <li>Early stopping saves resources</li>
                </ul>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h5 className="font-medium text-red-800 mb-1">Cons</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>Less power at the final analysis than OBF</li>
                  <li>May stop too early on noise</li>
                  <li>Requires pre-specified number of looks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
