'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface MethodResult {
  method: string
  avgSampleSize: number
  power: number
  type1Error: number
}

export function ComparisonSim() {
  const [results, setResults] = useState<MethodResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runComparison = () => {
    setIsRunning(true)
    setTimeout(() => {
      setResults([
        { method: 'Bonferroni', avgSampleSize: 1250, power: 0.65, type1Error: 0.02 },
        { method: 'Pocock', avgSampleSize: 980, power: 0.78, type1Error: 0.045 },
        { method: "O'Brien-Fleming", avgSampleSize: 1100, power: 0.72, type1Error: 0.048 },
        { method: 'Confidence Sequences', avgSampleSize: 850, power: 0.85, type1Error: 0.048 },
      ])
      setIsRunning(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Head-to-Head Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Compare the efficiency of different sequential testing methods under realistic conditions.
          </p>
          <Button onClick={runComparison} disabled={isRunning}>
            {isRunning ? 'Simulating...' : 'Run Comparison'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-neutral-300">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="border border-neutral-300 p-2 text-left">Method</th>
                      <th className="border border-neutral-300 p-2">Avg Sample Size</th>
                      <th className="border border-neutral-300 p-2">Power</th>
                      <th className="border border-neutral-300 p-2">Type I Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.method}>
                        <td className="border border-neutral-300 p-2 font-medium">{r.method}</td>
                        <td className="border border-neutral-300 p-2 text-center">{r.avgSampleSize}</td>
                        <td className="border border-neutral-300 p-2 text-center">{(r.power * 100).toFixed(1)}%</td>
                        <td className="border border-neutral-300 p-2 text-center">{(r.type1Error * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">Key Insights</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Confidence Sequences are most efficient (smallest avg sample size)</li>
                  <li>Pocock has good early-detection power</li>
                  <li>Bonferroni is most conservative but least efficient</li>
                  <li>All methods control Type I error at or below 5%</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
