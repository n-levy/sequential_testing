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
          description: 'Shared component used in Acts 1, 2, 4, and 5 (Simulations 1–2 and 4–5: peeking problem, sequential CI, alternative methods, magnitude error). Implements two-sided sequential CI using alpha/2 per tail.',
          code: abTestSimCode,
        },
        {
          filename: 'HybridSim.tsx',
          description: 'Used in Act 3 (Simulation 3: hybrid split-sided approach). Implements one-sided sequential CI for guardrail harm detection using alpha (not alpha/2).',
          code: hybridSimCode,
        },
      ]}
    />
  )
}
