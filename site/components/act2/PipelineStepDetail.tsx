'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { InlineMath, BlockMath } from '@/components/ui/Math'

interface StepDetail {
  id: string
  title: string
  description: string
  math?: string
  visual?: string
}

const stepDetails: Record<string, StepDetail> = {
  randomise: {
    id: 'randomise',
    title: 'Step 1: Randomise',
    description: 'Users are randomly assigned to either the control group (existing experience) or treatment group (new feature). This ensures the groups are comparable on average.',
    math: 'P(\\text{treatment}) = 0.5',
    visual: '🎲 Random assignment creates balanced groups'
  },
  collect: {
    id: 'collect',
    title: 'Step 2: Collect Data',
    description: 'We measure the outcome metric for each user. This could be revenue, engagement time, conversion rate, or any other KPI.',
    math: 'Y_i \\sim \\text{outcome for user } i',
    visual: '📊 Each user gets a measurement Yᵢ'
  },
  adjust: {
    id: 'adjust',
    title: 'Step 3: Adjust for Covariates (CUPED)',
    description: 'We use CUPED (Controlled-experiment Using Pre-Experiment Data) to reduce variance by adjusting for pre-experiment covariates like user age or historical behavior.',
    math: 'Y_i^* = Y_i - \\theta(X_i - \\bar{X})',
    visual: '⚖️ Regression adjustment reduces noise'
  },
  estimate: {
    id: 'estimate',
    title: 'Step 4: Estimate Treatment Effect',
    description: 'Calculate the difference between treatment and control group means. This gives us the estimated lift from the new feature.',
    math: '\\hat{\\tau} = \\bar{Y}_T^* - \\bar{Y}_C^*',
    visual: '📈 Treatment effect = difference in means'
  },
  ci: {
    id: 'ci',
    title: 'Step 5: Sequential Confidence Interval',
    description: 'Compute a confidence interval that remains valid even if we check it repeatedly. This uses Howard et al. (2021) confidence sequences.',
    math: '\\hat{\\tau} \\pm c_{1-\\alpha}(n) \\cdot \\sqrt{\\frac{\\sigma^2}{n}}',
    visual: '📏 CI that stays valid with peeking'
  },
  decide: {
    id: 'decide',
    title: 'Step 6: Make Decision',
    description: 'If the confidence interval excludes zero (and meets other criteria), we can declare a winner. If not, we continue collecting data.',
    math: '\\text{If } CI \\cap \\{0\\} = \\emptyset \\text{ and } n \\geq n_{\\min}: \\text{ Ship!}',
    visual: '✅ Go/no-go based on evidence'
  }
}

interface PipelineStepDetailProps {
  activeStep: string | null
}

export function PipelineStepDetail({ activeStep }: PipelineStepDetailProps) {
  const detail = activeStep ? stepDetails[activeStep] : null

  return (
    <AnimatePresence>
      {detail && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {detail.title}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {detail.description}
                </p>
                {detail.math && (
                  <div className="bg-neutral-50 p-3 rounded border">
                    <BlockMath>{detail.math}</BlockMath>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">{detail.visual}</div>
                  <p className="text-sm text-neutral-500">Visual representation</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}