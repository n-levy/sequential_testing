'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PipelineDiagram } from './PipelineDiagram'
import { PipelineStepDetail } from './PipelineStepDetail'
import { EppoPipelineSim } from './EppoPipelineSim'

export function Act2() {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  return (
    <section id="act2" className="py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 2: Sequential Testing in Action
          </h2>
          <p className="text-lg text-neutral-600">
            How EPPO's pipeline enables safe, continuous monitoring of experiments
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            The EPPO Sequential Testing Pipeline
          </h3>
          <PipelineDiagram
            activeStep={activeStep}
            onStepClick={setActiveStep}
          />
          <PipelineStepDetail activeStep={activeStep} />
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Interactive Pipeline Simulation
          </h3>
          <EppoPipelineSim />
        </div>
      </div>
    </section>
  )
}