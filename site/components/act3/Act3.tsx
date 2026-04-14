'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BonferroniImpl } from './BonferroniImpl'
import { PocockImpl } from './PocockImpl'
import { ObfImpl } from './ObfImpl'
import { ComparisonSim } from './ComparisonSim'

export function Act3() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  return (
    <section id="act3" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 3: DIY Options When You Don't Have EPPO
          </h2>
          <p className="text-lg text-neutral-600">
            Practical alternative methods for teams without a sequential testing platform.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Choose a Method to Explore
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className={`cursor-pointer transition-all ${
                selectedMethod === 'bonferroni' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedMethod(selectedMethod === 'bonferroni' ? null : 'bonferroni')}
            >
              <CardHeader>
                <CardTitle className="text-red-700">Bonferroni</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-3">
                  The simplest correction for multiple testing.
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedMethod === 'pocock' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedMethod(selectedMethod === 'pocock' ? null : 'pocock')}
            >
              <CardHeader>
                <CardTitle className="text-orange-700">Pocock</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-3">
                  Constant critical boundary across all analyses.
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedMethod === 'obf' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedMethod(selectedMethod === 'obf' ? null : 'obf')}
            >
              <CardHeader>
                <CardTitle className="text-blue-700">O'Brien-Fleming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-3">
                  Boundaries start wide, get narrow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedMethod && (
          <div className="mb-12">
            {selectedMethod === 'bonferroni' && <BonferroniImpl />}
            {selectedMethod === 'pocock' && <PocockImpl />}
            {selectedMethod === 'obf' && <ObfImpl />}
          </div>
        )}

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Head-to-Head Comparison
          </h3>
          <ComparisonSim />
        </div>
      </div>
    </section>
  )
}