import { readFileSync } from 'fs'
import path from 'path'
import { DetailedAppendixCode } from './DetailedAppendixCode'

export function DetailedAppendixCodeWrapper() {
  const abTestSimCode = readFileSync(
    path.join(process.cwd(), 'components/shared/ABTestSim.tsx'),
    'utf-8'
  )
  const hybridSimCode = readFileSync(
    path.join(process.cwd(), 'components/act_hybrid/HybridSim.tsx'),
    'utf-8'
  )
  return <DetailedAppendixCode abTestSimCode={abTestSimCode} hybridSimCode={hybridSimCode} />
}
