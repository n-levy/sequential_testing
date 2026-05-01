import { InlineMath } from './ui/Math'

export function Hero() {
  return (
    <section id="intro" className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
          Sequential Testing for A/B Experiments
        </h1>
        <p className="text-xl text-neutral-700 mb-4 max-w-3xl mx-auto">
          A Focused Guide in Five Acts
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-10 text-neutral-700 space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Introduction</h2>
        <p>
          <strong>The problem.</strong>{' '}
          Standard hypothesis tests guarantee a controlled false positive rate only when
          results are analysed once, at a pre-specified sample size. In practice, teams
          routinely monitor experiments and peek at interim results &mdash; inflating the
          Type I error rate well beyond the nominal{' '}
          <InlineMath>{`\\alpha`}</InlineMath>.
        </p>
        <p>
          <strong>Why does peeking happen?</strong>{' '}
          Often out of curiosity &mdash; and if no decisions are made based on those looks,
          that is completely fine. The issues described in this guide arise specifically when
          the motivation for peeking is deciding whether to <em>stop the experiment early</em>,
          either because there appears to be a clear benefit or a clear harm. In that case,
          the standard confidence interval is no longer valid: it was designed for a single
          planned analysis, not for interim decision-making.
        </p>
        <p>
          <strong>The solution.</strong>{' '}
          <em>Sequential testing</em> provides statistical methods whose error guarantees
          hold regardless of the number or timing of analyses. The confidence intervals
          become wider, but they remain valid whenever you decide to stop.
        </p>
        <p>
          <strong>This guide.</strong>{' '}
          Five acts, each with an interactive simulation, technical exposition, and
          key formulas:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li><strong>The Peeking Problem</strong> &mdash; Why interim analyses invalidate standard tests.</li>
          <li><strong>The Eppo Solution (2022)</strong> &mdash; How modern platforms implement sequential confidence intervals.</li>
          <li><strong>The Hybrid Approach</strong> &mdash; Combine sequential guardrail monitoring with standard analysis of the primary KPI.</li>
          <li><strong>Alternative Methods</strong> &mdash; Bonferroni, Pocock, O&apos;Brien&ndash;Fleming, and guardrail harm detection for teams without a dedicated platform.</li>
          <li><strong>Caution: Magnitude Error</strong> &mdash; Why early stopping inflates effect size estimates, and how to handle it.</li>
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
