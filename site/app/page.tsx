import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main>
        <Hero />
        {/* Act components will be added here */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Sequential Testing Interactive Guide
            </h2>
            <p className="text-neutral-600">
              Coming soon: Interactive simulations of sequential testing methods
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}