import { InlineMath } from '@/components/ui/Math'

export function HybridApproach() {
  return (
    <section id="hybrid" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">
            The Hybrid Approach &mdash; The Recommended Default
          </h2>
          <p className="text-neutral-600">
            How to combine the best of fixed-horizon and sequential testing in practice.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8 text-neutral-800 space-y-3">
          <p>
            Pure sequential testing buys you the right to peek and stop early. But it
            also pays a price &mdash; wider confidence intervals at any single look. For
            most teams, neither extreme (&ldquo;fixed n&rdquo; or &ldquo;monitor every
            second&rdquo;) is the best default.
          </p>
          <p>
            The <strong>hybrid approach</strong> uses sequential testing for{' '}
            <em>monitoring</em> and falls back on a fixed-horizon analysis at a planned
            stopping date for the <em>final decision</em>. It gives you safe early
            stopping <em>and</em> avoids the pitfalls of stopping at an unrepresentative
            moment.
          </p>
        </div>

        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Why hybrid?</h3>

        <ul className="list-disc ml-6 space-y-2 text-neutral-700 mb-8">
          <li>
            <strong>Weekday and seasonality effects.</strong> Many products have
            day-of-week patterns. Stopping on a Thursday at 5pm because the sequential
            CI just excluded zero can produce decisions that don&apos;t generalise to a
            full weekly cycle. Forcing the final analysis to land on a planned
            multiple-of-7-days horizon protects against this.
          </li>
          <li>
            <strong>Novelty / primacy effects.</strong> User behaviour after a launch
            often differs from steady-state behaviour. A fixed minimum runtime guards
            against locking in an early, transient effect.
          </li>
          <li>
            <strong>Power.</strong> Sequential bands are wider than fixed-horizon CIs at
            the same <InlineMath>{`\\alpha`}</InlineMath>. If you almost always stop at
            the planned horizon anyway, the fixed CI gives you tighter intervals for the
            same data.
          </li>
        </ul>

        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Recipe</h3>

        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Step</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">What you do</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3">1. Plan a horizon</td>
                <td className="border border-neutral-300 p-3">
                  Pick a target sample size <InlineMath>{`\\nu`}</InlineMath> covering at
                  least one full weekly cycle (typically 1&ndash;4 weeks).
                </td>
                <td className="border border-neutral-300 p-3">Avoids weekday bias; gives the sequential CI its tightest calibration point.</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">2. Monitor with the sequential CI</td>
                <td className="border border-neutral-300 p-3">
                  Watch the sequential confidence interval at any cadence you like.
                </td>
                <td className="border border-neutral-300 p-3">Type I error stays at <InlineMath>{`\\alpha`}</InlineMath> regardless of how often you peek.</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">3. Allow safety stops</td>
                <td className="border border-neutral-300 p-3">
                  Stop the experiment early <em>only</em> if the sequential CI is on the
                  wrong side of zero (clear harm) or extremely wide of the practical
                  significance threshold.
                </td>
                <td className="border border-neutral-300 p-3">Protects users without making early-stop the default.</td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">4. Decide at the planned horizon</td>
                <td className="border border-neutral-300 p-3">
                  At <InlineMath>{`n = \\nu`}</InlineMath>, run a single fixed-horizon
                  analysis and use the standard CI to make the ship/no-ship decision.
                </td>
                <td className="border border-neutral-300 p-3">Tightest possible interval; one clean look at a full cycle of data.</td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">5. Long-running tests</td>
                <td className="border border-neutral-300 p-3">
                  For tests that must run for months (e.g. retention, low-traffic
                  surfaces), drop the fixed step and rely on the sequential CI alone.
                </td>
                <td className="border border-neutral-300 p-3">When the horizon is uncertain, sequential coverage is what you have.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-4">
          <h4 className="font-bold text-yellow-900 mb-3">Takeaway</h4>
          <p className="text-neutral-800">
            Default to the hybrid: <strong>sequential CI for monitoring, fixed CI at a
            planned horizon for decisions</strong>. Use pure sequential only when the
            horizon is genuinely unknown.
          </p>
        </div>
      </div>
    </section>
  )
}
