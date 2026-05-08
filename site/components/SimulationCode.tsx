import { readFileSync } from 'fs'
import path from 'path'
import { SimulationCodeClient } from './SimulationCodeClient'

export function SimulationCode() {
  const abTestSimCode = readFileSync(
    path.join(process.cwd(), 'components/shared/ABTestSim.tsx'),
    'utf-8'
  )
  const hybridSimCode = readFileSync(
    path.join(process.cwd(), 'components/act_hybrid/HybridSim.tsx'),
    'utf-8'
  )
  return (
    <SimulationCodeClient
      files={[
        {
          filename: 'ABTestSim.tsx',
          description: 'Used in Acts 1, 2, 4, and 5 (peeking problem, sequential CI, alternative methods, magnitude error).',
          code: abTestSimCode,
        },
        {
          filename: 'HybridSim.tsx',
          description: 'Used in Act 3 (hybrid split-sided approach).',
          code: hybridSimCode,
        },
      ]}
    />
  )
}
