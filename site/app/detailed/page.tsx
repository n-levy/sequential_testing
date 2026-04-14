import { Navigation } from '@/components/Navigation'

export default function DetailedVersion() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation variant="detailed" />
      <main>
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-6">
              Sequential Testing: The Full Story
            </h1>
            <p className="text-xl text-neutral-600 mb-4">
              From random walks to modern confidence sequences &mdash; the complete
              mathematical journey in 14 acts.
            </p>
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mt-8 max-w-2xl mx-auto">
              <p className="text-amber-800 font-medium">
                Coming soon. This version will cover the full mathematical foundations:
                random walks, martingales, Ville&apos;s inequality, Wald&apos;s SPRT,
                Robbins&apos; mixture approach, and Howard et al.&apos;s confidence
                sequences &mdash; each with interactive D3 visualisations.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
