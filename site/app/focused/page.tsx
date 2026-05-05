import { Navigation } from '../../components/Navigation'
import { ActSidebar } from '../../components/ActSidebar'
import { Hero } from '../../components/Hero'
import { Act1 } from '../../components/act1/Act1'
import { Act2 } from '../../components/act2/Act2'
import { ActHybrid } from '../../components/act_hybrid/ActHybrid'
import { Act4 } from '../../components/act3/Act3'
import { ActMagnitudeError } from '../../components/act5/ActMagnitudeError'
import { FAQ } from '../../components/FAQ'
import { Summary } from '../../components/Summary'
import { MathReference } from '../../components/MathReference'
import { References } from '../../components/References'
import { Comments } from '../../components/Comments'
import { ContactForm } from '../../components/ContactForm'
import { ShowAllButton } from '../../components/shared/ShowAllButton'

const FOCUSED_ITEMS = [
  { id: '_home', label: 'Home' },
  { id: 'intro', label: 'Introduction' },
  {
    id: 'act1', label: 'Act 1 – Peeking Problem',
    children: [
      { id: 'act1-sim', label: 'Simulation' },
      { id: 'act1-why', label: 'Why does this happen?' },
      { id: 'act1-takeaway', label: 'Key Takeaway' },
    ],
  },
  {
    id: 'act2', label: 'Act 2 – Sequential Testing in Eppo (2022)',
    children: [
      { id: 'act2-sim', label: 'Simulation' },
      { id: 'act2-tradeoff', label: 'Power tradeoff' },
      { id: 'act2-takeaway', label: 'Key Takeaway' },
    ],
  },
  {
    id: 'act3-hybrid', label: 'Act 3 – Hybrid Approach',
    children: [
      { id: 'act3-sim', label: 'Simulation' },
      { id: 'act3-adv', label: 'Advantages & Limitations' },
      { id: 'act3-guardrail', label: 'Primary KPI as guardrail' },
      { id: 'act3-math', label: 'Show the math' },
      { id: 'act3-takeaway', label: 'Key Takeaway' },
    ],
  },
  {
    id: 'act4', label: 'Act 4 – Alternative Methods',
    children: [
      { id: 'act4-bonferroni', label: 'Method 1: Bonferroni' },
      { id: 'act4-pocock', label: 'Method 2: Pocock' },
      { id: 'act4-obf', label: 'Method 3: OBF' },
      { id: 'act4-harm', label: 'Method 4: Harm Detection' },
      { id: 'act4-sim', label: 'Simulation' },
      { id: 'act4-comparison', label: 'Comparison' },
      { id: 'act4-hybrid-impl', label: 'Hybrid without Eppo' },
    ],
  },
  {
    id: 'act5', label: 'Act 5 – Magnitude Error',
    children: [
      { id: 'act5-winners-curse', label: "Winner's curse" },
      { id: 'act5-sim', label: 'Simulation' },
      { id: 'act5-takeaway', label: 'Key Takeaway' },
    ],
  },
  { id: 'faq', label: 'FAQ' },
  { id: 'summary', label: 'Summary' },
  { id: 'math-reference', label: 'Math Reference' },
  { id: 'references', label: 'References' },
  { id: 'comments', label: 'Comments' },
  { id: 'contact', label: 'Contact us' },
]

export default function FocusedVersion() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation variant="focused" />
      <ActSidebar items={FOCUSED_ITEMS} />
      <main className="lg:ml-56">
        <Hero />
        <Act1 />
        <Act2 />
        <ActHybrid />
        <Act4 />
        <ActMagnitudeError />
        <FAQ />
        <Summary />
        <MathReference />
        <References />
        <ShowAllButton />
        <Comments />
        <ContactForm />
      </main>
    </div>
  )
}
