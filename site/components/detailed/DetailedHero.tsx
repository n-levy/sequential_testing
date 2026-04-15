export function DetailedHero() {
  return (
    <section id="intro" className="bg-gradient-to-br from-purple-50 to-blue-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
          From Random Walks to Sequential Testing
        </h1>
        <p className="text-xl text-neutral-700 mb-4 max-w-3xl mx-auto">
          The Complete Mathematical Journey in 14 Acts
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-10 text-neutral-700 space-y-4">
        <p>
          <strong>The story.</strong>{' '}
          Sequential testing enables you to peek at test results as often as you like and the false positive
          guarantee still holds. Getting there has required several developments in statistics.
          This webpage takes you through that journey, one step at a time: beginning with coin
          flips and random walks, proceeding with gambling examples in 1939 and testing ammunition
          in WWII, all the way up to modern confidence sequences.
        </p>
        <p>
          <strong>Format.</strong>{' '}
          Fourteen interactive acts (Acts 0&ndash;13) &mdash; deliberately small steps. Each
          act has an intuitive explanation, mathematical formulation, and key takeaway.
          Every formula is accompanied by a plain-language translation.
        </p>
        <p>
          <strong>Target audience.</strong>{' '}
          People comfortable with algebra and basic probability (e.g. a 12th-grade math
          background). No calculus is required to follow the main ideas.
        </p>
        <p>
          <strong>Design philosophy.</strong>{' '}
          Better to over-explain than under-explain. When in doubt, slow down.
        </p>
      </div>

      {/* Act overview */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: '0', t: 'The Peeking Problem', c: 'bg-blue-50 border-blue-200' },
            { n: '1', t: 'Random Walk', c: 'bg-blue-50 border-blue-200' },
            { n: '2', t: 'Martingale', c: 'bg-blue-50 border-blue-200' },
            { n: '3', t: 'Likelihood Ratio', c: 'bg-blue-50 border-blue-200' },
            { n: '4', t: 'LR is a Martingale', c: 'bg-blue-50 border-blue-200' },
            { n: '5', t: 'Ville\'s Inequality', c: 'bg-blue-50 border-blue-200' },
            { n: '6', t: 'Wald\'s SPRT', c: 'bg-blue-50 border-blue-200' },
            { n: '7', t: 'Mixture / mSPRT', c: 'bg-blue-50 border-blue-200' },
            { n: '8', t: 'Confidence Sequences', c: 'bg-blue-50 border-blue-200' },
            { n: '9', t: 'Problem Eppo Solves', c: 'bg-blue-50 border-blue-200' },
            { n: '10', t: 'Eppo Pipeline', c: 'bg-blue-50 border-blue-200' },
            { n: '11', t: 'Variance Reduction', c: 'bg-blue-50 border-blue-200' },
            { n: '12', t: 'Sequential CI', c: 'bg-blue-50 border-blue-200' },
            { n: '13', t: 'DIY Alternatives', c: 'bg-blue-50 border-blue-200' },
          ].map(({ n, t, c }) => (
            <a
              key={n}
              href={`#act-${n}`}
              className={`block border rounded-lg p-3 hover:shadow-md transition-shadow ${c}`}
            >
              <div className="text-xs font-semibold text-neutral-500 mb-1">Act {n}</div>
              <div className="text-sm font-medium text-neutral-800">{t}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
