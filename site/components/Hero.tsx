import { InlineMath } from '@/components/ui/Math'

export function Hero() {
  return (
    <section id="intro" className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
          Sequential Testing for A/B Experiments
        </h1>
        <p className="text-xl text-neutral-700 mb-4 max-w-3xl mx-auto">
          A Focused Guide in Three Acts
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-10 text-neutral-700 space-y-4">
        <p>
          <strong>The problem.</strong>{' '}
          Standard hypothesis tests guarantee a controlled false positive rate only when
          results are analysed once, at a pre-specified sample size. In practice, teams
          routinely monitor experiments and peek at interim results &mdash; inflating the
          Type I error rate well beyond the nominal{' '}
          <InlineMath>{`\\alpha`}</InlineMath>.
        </p>
        <p>
          <strong>The solution.</strong>{' '}
          <em>Sequential testing</em> provides statistical methods whose error guarantees
          hold regardless of the number or timing of analyses. The confidence intervals
          become wider, but it can still reduce overall runtime if effects become clear
          at an early stage.
        </p>
        <p>
          <strong>This guide.</strong>{' '}
          Three acts, each with an interactive simulation, technical exposition, and
          key formulas:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li><strong>The Peeking Problem</strong> &mdash; Why interim analyses invalidate standard tests.</li>
          <li><strong>The Eppo Solution</strong> &mdash; Confidence sequences, variance reduction,
              and the recommended <strong>hybrid approach</strong>.</li>
          <li><strong>DIY Alternatives</strong> &mdash; Bonferroni, Pocock, and O&apos;Brien&ndash;Fleming
              corrections for teams without a sequential testing platform.</li>
        </ol>
        <p>
          <strong>Target audience.</strong>{' '}
          Data scientists and analysts familiar with A/B testing, hypothesis testing,
          and confidence intervals.
        </p>
      </div>
    </section>
  )
}