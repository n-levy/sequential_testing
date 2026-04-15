import Link from 'next/link'
import { Navigation } from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation variant="landing" />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-neutral-900 mb-6">
              Sequential Testing for A/B Experiments
            </h1>
            <p className="text-xl text-neutral-600 mb-4 max-w-3xl mx-auto">
              Every company running A/B tests faces the same temptation: peek at the results
              early. Traditional statistics breaks when you do this. Sequential testing fixes it.
            </p>
            <p className="text-lg text-neutral-500 max-w-3xl mx-auto">
              This interactive guide explains how &mdash; with simulations you can run yourself,
              formulas with plain-language translations, and practical implementation advice.
            </p>
          </div>
        </section>

        {/* Version cards */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
              Choose Your Path
            </h2>
            <p className="text-neutral-500 text-center mb-10">
              Two versions of the same material, at different levels of depth.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Short version card */}
              <Link
                href="/short"
                className="group block bg-white border-2 border-blue-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-blue-700 transition-colors">
                  Focused
                </h3>
                <p className="text-neutral-600 mb-4">
                  For data scientists who want to <strong>implement sequential testing</strong> in
                  their domain. Three acts covering the peeking problem, the Eppo solution
                  (with the recommended hybrid approach), and DIY alternatives.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1.5 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">&#x2713;</span>
                    3 interactive simulations with D3 charts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">&#x2713;</span>
                    Complete formulas with plain-language translations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">&#x2713;</span>
                    Python code appendix you can copy-paste
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">&#x2713;</span>
                    ~20 minute read
                  </li>
                </ul>
                <span className="text-blue-600 font-medium group-hover:underline">
                  Start &rarr;
                </span>
              </Link>

              {/* Detailed version card */}
              <Link
                href="/detailed"
                className="group block bg-white border-2 border-purple-200 rounded-xl p-8 hover:border-purple-500 hover:shadow-lg transition-all"
              >
                <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-purple-700 transition-colors">
                  In-depth
                </h3>
                <p className="text-neutral-600 mb-4">
                  For those who want to understand the <strong>historical origins and
                  mathematical foundations</strong> of sequential testing. Fourteen acts tracing
                  the ideas from random walks through martingales to modern confidence sequences.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1.5 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#x2713;</span>
                    14 acts covering the full mathematical story
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#x2713;</span>
                    Interactive simulations for each key concept
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#x2713;</span>
                    Ville, Wald, Robbins, Howard &mdash; the full lineage
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#x2713;</span>
                    ~60 minute read
                  </li>
                </ul>
                <span className="text-purple-600 font-medium group-hover:underline">
                  Start &rarr;
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Prerequisites */}
        <section className="py-12 bg-white border-t border-neutral-200">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Prerequisites</h3>
            <p className="text-neutral-500">
              Comfort with algebra and basic probability. No calculus required.
              Every formula is accompanied by a plain-language translation.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}