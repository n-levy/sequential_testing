import { Navigation } from '@/components/Navigation'
import { ActSidebar } from '@/components/ActSidebar'
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

const DETAILED_ITEMS = [
  { id: '_home', label: 'Home' },
  { id: 'intro', label: 'Introduction' },
  { id: 'act-0', label: 'Act 0 – Peeking Problem' },
  { id: 'act-1', label: 'Act 1 – Random Walk' },
  { id: 'act-2', label: 'Act 2 – Martingale' },
  { id: 'act-3', label: 'Act 3 – Likelihood Ratio' },
  { id: 'act-4', label: 'Act 4 – LR is a Martingale' },
  { id: 'act-5', label: 'Act 5 – Ville\'s Inequality' },
  { id: 'act-6', label: 'Act 6 – Wald\'s SPRT' },
  { id: 'act-7', label: 'Act 7 – Mixture / mSPRT' },
  { id: 'act-8', label: 'Act 8 – Confidence Sequences' },
  { id: 'act-9', label: 'Act 9 – Problem Eppo Solves' },
  { id: 'act-10', label: 'Act 10 – Eppo Pipeline' },
  { id: 'act-11', label: 'Act 11 – Variance Reduction' },
  { id: 'act-12', label: 'Act 12 – Sequential CI' },
  { id: 'act-13', label: 'Act 13 – DIY Alternatives' },
  { id: 'summary', label: 'Summary' },
  { id: 'references', label: 'References' },
]

export default function DetailedVersion() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation variant="detailed" />
      <ActSidebar items={DETAILED_ITEMS} />
      <main className="lg:ml-56">
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
