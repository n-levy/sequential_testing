import { Navigation } from '@/components/Navigation'
import { DetailedHero } from '@/components/detailed/DetailedHero'
import { DetailedAct0 } from '@/components/detailed/DetailedAct0'
import { DetailedAct1 } from '@/components/detailed/DetailedAct1'
import { DetailedAct2 } from '@/components/detailed/DetailedAct2'
import { DetailedAct3 } from '@/components/detailed/DetailedAct3'
import { DetailedAct4 } from '@/components/detailed/DetailedAct4'
import { DetailedAct5 } from '@/components/detailed/DetailedAct5'
import { DetailedAct6 } from '@/components/detailed/DetailedAct6'
import { DetailedAct7 } from '@/components/detailed/DetailedAct7'
import { DetailedAct8 } from '@/components/detailed/DetailedAct8'
import { DetailedAct9 } from '@/components/detailed/DetailedAct9'
import { DetailedAct10 } from '@/components/detailed/DetailedAct10'
import { DetailedAct11 } from '@/components/detailed/DetailedAct11'
import { DetailedAct12 } from '@/components/detailed/DetailedAct12'
import { DetailedAct13 } from '@/components/detailed/DetailedAct13'
import { DetailedSummary } from '@/components/detailed/DetailedSummary'
import { DetailedReferences } from '@/components/detailed/DetailedReferences'

export default function DetailedVersion() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation variant="detailed" />
      <main>
        <DetailedHero />
        <DetailedAct0 />
        <DetailedAct1 />
        <DetailedAct2 />
        <DetailedAct3 />
        <DetailedAct4 />
        <DetailedAct5 />
        <DetailedAct6 />
        <DetailedAct7 />
        <DetailedAct8 />
        <DetailedAct9 />
        <DetailedAct10 />
        <DetailedAct11 />
        <DetailedAct12 />
        <DetailedAct13 />
        <DetailedSummary />
        <DetailedReferences />
      </main>
    </div>
  )
}
