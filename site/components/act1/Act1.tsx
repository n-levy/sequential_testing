'use client'

import { PeekingSimulation } from './PeekingSimulation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

export function Act1() {
  return (
    <section id="act1" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 1: The Problem with Fixed-Horizon Testing
          </h2>
          <p className="text-lg text-neutral-600">
            Why traditional A/B testing wastes time and resources
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Peeking Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-neutral max-w-none">
              <p className="mb-4">
                Every company running A/B tests faces a temptation: <strong>peek at the results
                before the experiment is over</strong>. Traditional statistics breaks when you do this
                — the false positive rate inflates far beyond the promised <InlineMath>5\%</InlineMath>.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Interactive Simulation: The Cost of Peeking
          </h3>
          <PeekingSimulation />
        </div>
      </div>
    </section>
  )
}