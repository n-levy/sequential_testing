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
  { id: 'act1', label: 'Act 1 – Peeking Problem' },
  { id: 'act2', label: 'Act 2 – Eppo Solution (2022)' },
  { id: 'act3-hybrid', label: 'Act 3 – Hybrid Approach' },
  { id: 'act4', label: 'Act 4 – Alternative Methods' },
  { id: 'act5', label: 'Act 5 – Magnitude Error' },
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
