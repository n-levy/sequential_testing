import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { Act1 } from '@/components/act1/Act1'
import { Act2 } from '@/components/act2/Act2'
import { Act3 } from '@/components/act3/Act3'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main>
        <Hero />
        <Act1 />
        <Act2 />
        <Act3 />
      </main>
    </div>
  )
}