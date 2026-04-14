'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InlineMath } from '@/components/ui/Math'

interface SimulationData {
  control: number[]
  treatment: number[]
  covariates: number[]
  adjustedControl: number[]
  adjustedTreatment: number[]
  tauHat: number
  ciLower: number
  ciUpper: number
  decision: 'continue' | 'ship' | 'revert'
}

export function EppoPipelineSim() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [data, setData] = useState<SimulationData | null>(null)
  const [sampleSize, setSampleSize] = useState(100)

  const steps = [
    'randomise',
    'collect',
    'adjust',
    'estimate',
    'ci',
    'decide'
  ]

  const generateData = () => {
    // Simple data generation for demo
    const n = sampleSize
    const trueEffect = 0.05 // 5% lift
    const sigma = 1.0

    const covariates = Array.from({ length: n }, () => Math.random() * 2 - 1)
    const control = covariates.map(x => x + Math.random() * sigma)
    const treatment = covariates.map((x, i) =>
      x + trueEffect + Math.random() * sigma
    )

    // Simple CUPED adjustment (theta = 0.8 for demo)
    const theta = 0.8
    const covariateMean = covariates.reduce((a, b) => a + b, 0) / n

    const adjustedControl = control.map((y, i) =>
      y - theta * (covariates[i] - covariateMean)
    )
    const adjustedTreatment = treatment.map((y, i) =>
      y - theta * (covariates[i] - covariateMean)
    )

    const tauHat = adjustedTreatment.reduce((a, b) => a + b, 0) / n -
                   adjustedControl.reduce((a, b) => a + b, 0) / n

    // Simplified CI calculation (would use proper sequential CI in real implementation)
    const se = Math.sqrt((adjustedControl.reduce((a, b) => a + (b - adjustedControl.reduce((c, d) => c + d, 0) / n)**2, 0) / (n - 1) +
                         adjustedTreatment.reduce((a, b) => a + (b - adjustedTreatment.reduce((c, d) => c + d, 0) / n)**2, 0) / (n - 1)) / n)

    const z = 1.96 // 95% CI
    const ciLower = tauHat - z * se
    const ciUpper = tauHat + z * se

    const decision = ciLower > 0 ? 'ship' : ciUpper < 0 ? 'revert' : 'continue'

    setData({
      control,
      treatment,
      covariates,
      adjustedControl,
      adjustedTreatment,
      tauHat,
      ciLower,
      ciUpper,
      decision
    })
  }

  const runStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const reset = () => {
    setCurrentStep(0)
    setData(null)
  }

  useEffect(() => {
    if (currentStep === 1 && !data) {
      generateData()
    }
  }, [currentStep, data])

  const getStepDescription = () => {
    switch (currentStep) {
      case 0: return "Click 'Start' to begin the EPPO pipeline simulation"
      case 1: return `Generated ${sampleSize} users with random assignment`
      case 2: return "Collected outcome measurements for all users"
      case 3: return "Applied CUPED adjustment to reduce variance"
      case 4: return `Estimated treatment effect: ${data?.tauHat.toFixed(3)}`
      case 5: return `Computed 95% CI: [${data?.ciLower.toFixed(3)}, ${data?.ciUpper.toFixed(3)}]`
      case 6: return `Decision: ${data?.decision === 'ship' ? '🚀 Ship the feature!' :
                                 data?.decision === 'revert' ? '❌ Revert the change' :
                                 '⏳ Continue collecting data'}`
      default: return ""
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EPPO Pipeline Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Sample Size:</label>
            <input
              type="range"
              min="50"
              max="500"
              value={sampleSize}
              onChange={(e) => setSampleSize(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-neutral-600 w-12">{sampleSize}</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runStep}
              disabled={currentStep >= steps.length}
            >
              {currentStep === 0 ? 'Start Pipeline' : 'Next Step'}
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Step {currentStep}:</strong> {getStepDescription()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {data && currentStep >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.tauHat.toFixed(3)}
                </div>
                <div className="text-sm text-neutral-600">Estimated Effect</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-neutral-900">
                  [{data.ciLower.toFixed(3)}, {data.ciUpper.toFixed(3)}]
                </div>
                <div className="text-sm text-neutral-600">95% Confidence Interval</div>
              </div>

              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  data.decision === 'ship' ? 'text-green-600' :
                  data.decision === 'revert' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {data.decision === 'ship' ? '🚀' :
                   data.decision === 'revert' ? '❌' :
                   '⏳'}
                </div>
                <div className="text-sm text-neutral-600 capitalize">{data.decision}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}