'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { MartingaleSim } from './sims/MartingaleSim'

export function DetailedAct2() {
  return (
    <section id="act-2" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 2 &mdash; The Gambling Game and the Martingale
          </h2>
        </div>

        {/* Simulation */}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              The same random walk, relabelled. The vertical axis now shows
              &ldquo;&euro; profit or loss.&rdquo; A bold horizontal line marks zero &mdash;
              break-even.
            </p>
            <p>
              <strong>Doubling strategy mode:</strong> Runs 10,000 gamblers using the martingale
              betting strategy. A histogram shows the distribution of final wealth &mdash; many
              small winners, a few catastrophic losers. A counter shows average profit
              converging to zero.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <MartingaleSim />

        {/* Intuitive Explanation */}

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Win &euro;1 for heads, lose &euro;1 for tails. Cumulative winnings
              trace the same random walk from Act 1.
            </p>
            <p>
              The gambler&apos;s temptation: &ldquo;I&apos;ll keep playing until I&apos;m ahead,
              then quit.&rdquo; Sounds foolproof &mdash; surely a run of luck will eventually
              put you in the green?
            </p>
            <p>
              Mathematically, a fair random walk does eventually return to positive territory.
              But the time it takes can be astronomically long, and while you wait you might
              lose everything.
            </p>
            <p>
              <strong>Central insight:</strong> There is no strategy that improves your expected
              outcome in a fair game. This is a proven mathematical theorem. Try any
              stopping rule &mdash; the average winnings always converge to zero.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">The doubling strategy (Martingale betting), exposed</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Lose, double the bet, repeat until you win back your losses plus &euro;1.
              It works &mdash; most of the time.
            </p>
            <p>
              But a long losing streak forces bets of &euro;1, 2, 4, 8, 16, 32, 64, &hellip;
              After just 10 consecutive losses, you must bet &euro;1,024 to win back &euro;1.
              The histogram makes it vivid: a tall bar of people who won &euro;1, and a barely
              visible bar at the far left of people who lost thousands. Multiply heights by
              positions and sum: the average is zero.
            </p>
          </div>
        </div>

        {/* Mathematical Formulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Definition: Martingale</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            A sequence <InlineMath>{`M_0, M_1, M_2, \\ldots`}</InlineMath> is a{' '}
            <strong>martingale</strong> if, at every step, the best prediction of the next
            value is the current value:
          </p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\EE[M_n \\given M_0, M_1, \\ldots, M_{n-1}] = M_{n-1}`}</BlockMath>
          </div>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Reading the notation carefully:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li><InlineMath>{`\\EE[\\cdot]`}</InlineMath> = &ldquo;the expected value of&hellip;&rdquo; (long-run average).</li>
            <li>The vertical bar &ldquo;<InlineMath>{`\\given`}</InlineMath>&rdquo; = &ldquo;given that we know.&rdquo; Everything after the bar is information we have.</li>
            <li><InlineMath>{`M_0, M_1, \\ldots, M_{n-1}`}</InlineMath> = the full history up to step <InlineMath>{`n-1`}</InlineMath>.</li>
            <li>Full sentence: &ldquo;The expected value of <InlineMath>{`M_n`}</InlineMath>, given that we know everything up to step <InlineMath>{`n-1`}</InlineMath>, equals <InlineMath>{`M_{n-1}`}</InlineMath>.&rdquo;</li>
          </ul>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            Knowing the entire history, your best guess for the next value is just
            the current value. The past gives no useful information about the future direction.
          </p>
        </div>

        {/* Verifying martingale */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Verifying: the coin-flip game is a martingale
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Let <InlineMath>{`M_n = S_n`}</InlineMath> (cumulative winnings).
            Then <InlineMath>{`M_n = M_{n-1} + X_n`}</InlineMath>.
          </p>
          <BlockMath>{`\\begin{aligned}
\\EE[M_n \\given M_0, \\ldots, M_{n-1}]
&= \\EE[M_{n-1} + X_n \\given M_0, \\ldots, M_{n-1}] \\\\
&= M_{n-1} + \\EE[X_n \\given M_0, \\ldots, M_{n-1}] \\quad \\text{(}M_{n-1}\\text{ is known)} \\\\
&= M_{n-1} + 0 \\quad \\text{(next flip is independent; }\\EE[X_n] = 0\\text{)} \\\\
&= M_{n-1} \\quad \\checkmark
\\end{aligned}`}</BlockMath>
        </div>

        {/* Doob's Optional Stopping Theorem */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Doob&apos;s Optional Stopping Theorem (1953)
        </h4>

        <div className="bg-white border-2 border-neutral-400 rounded-lg p-5 mb-6">
          <p className="font-semibold text-neutral-900 mb-2">Theorem (Doob&apos;s Optional Stopping Theorem)</p>
          <div className="text-neutral-700 space-y-2">
            <p>
              Let <InlineMath>{`\\{M_n\\}`}</InlineMath> be a martingale and{' '}
              <InlineMath>{`\\tau`}</InlineMath> a <strong>stopping time</strong> &mdash; a rule
              for when to quit that uses only information accumulated so far (no looking
              into the future). Then, under reasonable conditions:
            </p>
            <div className="bg-neutral-50 border border-neutral-300 rounded p-3">
              <BlockMath>{`\\EE[M_\\tau] = \\EE[M_0]`}</BlockMath>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            For a gambler starting with <InlineMath>{`M_0 = 0`}</InlineMath>: expected
            winnings at stopping = 0, always, for any strategy.{' '}
            <strong>You cannot beat a fair game by choosing when to quit.</strong>
          </p>
        </div>

        {/* Stopping time table */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">What is a stopping time?</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            <InlineMath>{`\\tau`}</InlineMath> is a decision rule of the form: &ldquo;Stop
            after step <InlineMath>{`n`}</InlineMath> if [condition based only on what happened
            so far].&rdquo;
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Rule</th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Valid?</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-neutral-300 p-3">Stop after exactly 100 flips</td><td className="border border-neutral-300 p-3 text-green-700">&#10003;</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">Stop the first time I am ahead by &euro;10</td><td className="border border-neutral-300 p-3 text-green-700">&#10003;</td></tr>
                <tr><td className="border border-neutral-300 p-3">Stop when I have lost &euro;50</td><td className="border border-neutral-300 p-3 text-green-700">&#10003;</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3">Stop after 1000 flips <em>or</em> when ahead by &euro;5, whichever first</td><td className="border border-neutral-300 p-3 text-green-700">&#10003;</td></tr>
                <tr><td className="border border-neutral-300 p-3">Stop right before the next loss</td><td className="border border-neutral-300 p-3 text-neutral-500">&#10007; (requires the future!)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reasonable conditions */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          The &ldquo;reasonable conditions&rdquo; for Doob&apos;s theorem
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>Doob&apos;s theorem requires at least one of:</p>
          <ol className="list-decimal ml-6 space-y-1">
            <li><InlineMath>{`\\tau \\leq N`}</InlineMath> for some fixed <InlineMath>{`N`}</InlineMath> (bounded stopping time), <strong>or</strong></li>
            <li><InlineMath>{`|M_n| \\leq C`}</InlineMath> for some fixed <InlineMath>{`C`}</InlineMath> (bounded martingale), <strong>or</strong></li>
            <li><InlineMath>{`\\EE[\\tau] < \\infty`}</InlineMath> and certain integrability conditions (finite expected stopping time).</li>
          </ol>
          <p>
            When <em>none</em> hold &mdash; as with the doubling strategy &mdash; the guarantee
            breaks down.
          </p>
        </div>

        {/* Why doubling fails */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Why the doubling strategy fails</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            The doubling strategy guarantees eventual profit <em>only if</em> you have
            infinite money and infinite time. In practice:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Finite budget &rArr; real probability of ruin before recovery.</li>
            <li>Expected time to recovery is infinite: <InlineMath>{`\\EE[\\tau] = \\infty`}</InlineMath>.</li>
            <li>Doob&apos;s theorem gives <InlineMath>{`\\EE[M_\\tau] \\leq 0`}</InlineMath>, not <InlineMath>{`= 0`}</InlineMath>.</li>
          </ul>
        </div>

        {/* Why this matters */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Why this matters for what is coming</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            The martingale concept reappears in every subsequent act. The likelihood
            ratio (Act 4) is a martingale. The mixture likelihood ratio (Act 7) is a
            martingale. The reason sequential tests control false positives &mdash; even
            with peeking &mdash; is that they exploit the same structure:{' '}
            <strong>a fair game cannot be beaten by choosing when to stop.</strong>
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>Key concepts:</strong> martingale, conditional expectation, stopping time,
              Doob&apos;s Optional Stopping Theorem, the &ldquo;reasonable conditions.&rdquo;
            </p>
          </div>
        </div>

        {/* Historical Note */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-neutral-700 mb-3">Historical Note</h4>
          <p className="text-neutral-700">
            Joseph L. Doob formalised martingale theory in his 1953 monograph{' '}
            <em>Stochastic Processes</em>. The name &ldquo;martingale&rdquo; comes from a French
            term for a type of betting strategy &mdash; the very doubling strategy we just
            debunked.
          </p>
        </div>
      </div>
    </section>
  )
}
