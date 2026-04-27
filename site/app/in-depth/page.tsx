import { Navigation } from '../../components/Navigation'
import { ActSidebar } from '../../components/ActSidebar'
import { DetailedHero } from '../../components/detailed/DetailedHero'
import { DetailedAct1 } from '../../components/detailed/DetailedAct1'
import { DetailedAct2 } from '../../components/detailed/DetailedAct2'
import { DetailedAct3 } from '../../components/detailed/DetailedAct3_clean'
import { DetailedAct4 } from '../../components/detailed/DetailedAct4'
import { DetailedAct5 } from '../../components/detailed/DetailedAct5'
import { DetailedAct6 } from '../../components/detailed/DetailedAct6'
import { DetailedAct7 } from '../../components/detailed/DetailedAct7'
import { DetailedAct8 } from '../../components/detailed/DetailedAct8'
import { DetailedAct9 } from '../../components/detailed/DetailedAct9'
import { DetailedAct10 } from '../../components/detailed/DetailedAct10'
import { DetailedAct11 } from '../../components/detailed/DetailedAct11'
import { DetailedAct12 } from '../../components/detailed/DetailedAct12'
import { DetailedAct13 } from '../../components/detailed/DetailedAct13'
import { DetailedAct14 } from '../../components/detailed/DetailedAct14'
import { HybridApproach } from '../../components/detailed/HybridApproach'
import { AppendixDivider } from '../../components/detailed/AppendixDivider'
import { DetailedSummary } from '../../components/detailed/DetailedSummary'
import { DetailedReferences } from '../../components/detailed/DetailedReferences'
import { DetailedAppendixCode } from '../../components/detailed/DetailedAppendixCode'
import { Comments } from '../../components/Comments'
import { ContactForm } from '../../components/ContactForm'

const IN_DEPTH_ITEMS = [
  { id: '_home', label: 'Home' },
  { id: 'intro', label: 'Introduction' },
  { id: 'act-1', label: 'Act 1 – Peeking Problem' },
  { id: 'act-2', label: 'Act 2 – Random Walk' },
  { id: 'act-3', label: 'Act 3 – Martingale' },
  { id: 'act-4', label: 'Act 4 – Likelihood Ratio' },
  { id: 'act-5', label: 'Act 5 – LR is a Martingale' },
  { id: 'act-6', label: 'Act 6 – Ville\'s Inequality' },
  { id: 'act-7', label: 'Act 7 – Wald\'s SPRT' },
  { id: 'act-8', label: 'Act 8 – Mixture / mSPRT' },
  { id: 'act-9', label: 'Act 9 – Confidence Sequences' },
  { id: 'act-11', label: 'Act 10 – Eppo Pipeline' },
  { id: 'act-13', label: 'Act 11 – Sequential CI' },
  { id: 'act-14', label: 'Act 12 – Alternative Methods' },
  { id: 'hybrid', label: 'Hybrid Approach' },
  { id: 'summary', label: 'Summary' },
  { id: 'references', label: 'References' },
  { id: 'appendix', label: 'Appendix' },
  { id: 'act-10', label: 'A1 – Problem Eppo Solves' },
  { id: 'act-12', label: 'A2 – Variance Reduction' },
  { id: 'comments', label: 'Comments' },
  { id: 'contact', label: 'Contact us' },
]

export default function InDepthVersion() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation variant="in-depth" />
      <ActSidebar items={IN_DEPTH_ITEMS} />
      <main className="lg:ml-56">
        <DetailedHero />
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
        <DetailedAct14 />
        <HybridApproach />
        <DetailedSummary />
        <DetailedReferences />
        <AppendixDivider />
        <DetailedAppendixCode />
        <Comments />
        <ContactForm />
      </main>
    </div>
  )
}
