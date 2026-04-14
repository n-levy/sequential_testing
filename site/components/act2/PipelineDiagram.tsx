'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface PipelineStep {
  id: string
  title: string
  description: string
  icon: string
}

const pipelineSteps: PipelineStep[] = [
  {
    id: 'randomise',
    title: 'Randomise',
    description: 'Assign users to control/treatment groups',
    icon: '🎲'
  },
  {
    id: 'collect',
    title: 'Collect',
    description: 'Measure outcomes for each user',
    icon: '📊'
  },
  {
    id: 'adjust',
    title: 'Adjust',
    description: 'Use CUPED to reduce variance',
    icon: '⚖️'
  },
  {
    id: 'estimate',
    title: 'Estimate',
    description: 'Calculate treatment effect',
    icon: '📈'
  },
  {
    id: 'ci',
    title: 'CI',
    description: 'Compute sequential confidence interval',
    icon: '📏'
  },
  {
    id: 'decide',
    title: 'Decide',
    description: 'Make go/no-go decision',
    icon: '✅'
  }
]

interface PipelineDiagramProps {
  activeStep?: string | null
  onStepClick?: (stepId: string) => void
}

export function PipelineDiagram({ activeStep, onStepClick }: PipelineDiagramProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        {pipelineSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <motion.div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer transition-colors ${
                activeStep === step.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white border-2 border-neutral-300 text-neutral-600 hover:border-primary-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStepClick?.(step.id)}
            >
              {step.icon}
            </motion.div>

            {/* Connector Line */}
            {index < pipelineSteps.length - 1 && (
              <motion.div
                className="flex-1 h-0.5 bg-neutral-300 mx-4"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-center">
        {pipelineSteps.map((step) => (
          <div key={step.id} className="w-16">
            <div className={`text-sm font-medium ${
              activeStep === step.id ? 'text-primary-600' : 'text-neutral-600'
            }`}>
              {step.title}
            </div>
          </div>
        ))}
      </div>

      {/* Active Step Description */}
      {activeStep && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200"
        >
          <h4 className="font-semibold text-primary-900 mb-2">
            {pipelineSteps.find(s => s.id === activeStep)?.title}
          </h4>
          <p className="text-primary-700">
            {pipelineSteps.find(s => s.id === activeStep)?.description}
          </p>
        </motion.div>
      )}
    </div>
  )
}