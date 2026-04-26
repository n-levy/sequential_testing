import { Navigation } from '../../components/Navigation'
import { ActSidebar } from '../../components/ActSidebar'
import { Hero } from '../../components/Hero'
import { Act1 } from '../../components/act1/Act1'
import { Act2 } from '../../components/act2/Act2'
import { Act3 } from '../../components/act3/Act3'
import { Summary } from '../../components/Summary'
import { MathReference } from '../../components/MathReference'
import { References } from '../../components/References'
import { Comments } from '../../components/Comments'
import { ContactForm } from '../../components/ContactForm'

const SHORT_ITEMS = [
  { id: '_home', label: 'Home' },
  { id: 'intro', label: 'Introduction' },
  { id: 'act1', label: 'Act 1 – Peeking Problem' },
  { id: 'act2', label: 'Act 2 – Eppo Solution' },
  { id: 'act3', label: 'Act 3 – DIY Alternatives' },
  { id: 'summary', label: 'Summary' },
  { id: 'math-reference', label: 'Math Reference' },
  { id: 'references', label: 'References' },
  { id: 'comments', label: 'Comments' },
  { id: 'contact', label: 'Contact us' },
]

export default function ShortVersion() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation variant="short" />
      <ActSidebar items={SHORT_ITEMS} />
      <main className="lg:ml-56">
        <Hero />
        <Act1 />
        <Act2 />
        <Act3 />
        <Summary />
        <MathReference />
        <References />
        <Comments />
        <ContactForm />
      </main>
    </div>
  )
}
