export function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
          Sequential Testing for A/B Experiments
        </h1>
        <p className="text-xl text-neutral-700 mb-4 max-w-3xl mx-auto">
          A Practical Guide in Three Acts
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-10 text-neutral-700 space-y-4">
        <p>
          <strong>The problem.</strong>{' '}
          Teams running A/B tests face a temptation: peek at the results
          before the experiment is over, and stop before the planned runtime if
          results are statistically significant. Traditional statistics breaks when you do
          this &mdash; the false positive rate inflates far beyond the promised 5%.
        </p>
        <p>
          <strong>The solution.</strong>{' '}
          <em>Sequential testing</em> provides statistical methods that remain valid
          no matter when or how often you check. Modern platforms like Eppo build
          this into their pipeline automatically.
        </p>
        <p>
          <strong>This guide.</strong>{' '}
          Three acts, each with a simulation, intuitive explanations, and key formulas
          with plain-language translations:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li><strong>The Peeking Problem</strong> &mdash; Why checking early is dangerous.</li>
          <li><strong>The Eppo Solution</strong> &mdash; How a modern platform solves it,
              including the recommended <strong>hybrid approach</strong>.</li>
          <li><strong>DIY Alternatives</strong> &mdash; What to do if you don&apos;t have Eppo,
              including how to implement the hybrid approach yourself.</li>
        </ol>
        <p>
          <strong>Target audience.</strong>{' '}
          People comfortable with algebra and basic probability. No calculus required.
          Every formula is accompanied by a plain-language translation.
        </p>
      </div>
    </section>
  )
}