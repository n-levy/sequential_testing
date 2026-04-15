'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { RandomWalkSim } from './sims/RandomWalkSim'

export function DetailedAct1() {
  return (
    <section id="act-1" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 1 &mdash; The Random Walk
          </h2>
        </div>

        {/* Simulation description */}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              A dot starts at position 0. Each step, a coin is flipped. Heads: the dot
              moves up one step. Tails: down one step. The path is drawn as a graph
              (position vs. step number).
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <RandomWalkSim />

        {/* Intuitive Explanation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4 mt-8">Intuitive Explanation</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Imagine you are standing in the middle of a long hallway. Flip a coin.
              Heads &mdash; step forward. Tails &mdash; step back. Repeat hundreds of times.
            </p>
            <p>
              Where will you end up? We don&apos;t know exactly, but we can say something
              precise about the <em>range</em> of likely outcomes. Most of the time
              you won&apos;t wander far. Occasionally, a long streak of heads or tails
              carries you far in one direction. The longer you walk, the wider the
              range of possible positions &mdash; but the centre of that range stays at zero.
            </p>
            <p>
              When we run many people simultaneously, they fan out over time &mdash; like
              ink dropped into water. This spreading has a precise mathematical shape.
            </p>
          </div>
        </div>

        {/* Mathematical Formulation */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Setting up the notation</h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Let <InlineMath>{`X_i`}</InlineMath> represent the outcome of the{' '}
            <InlineMath>{`i`}</InlineMath>th coin flip:
          </p>
          <BlockMath>{`X_i = \\begin{cases} +1 & \\text{if heads (step forward)} \\\\ -1 & \\text{if tails (step backward)} \\end{cases}`}</BlockMath>
          <p>
            The probability of heads is written <InlineMath>{`p`}</InlineMath>. For a fair coin,{' '}
            <InlineMath>{`p = 0.5`}</InlineMath>.
          </p>
        </div>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Position after <InlineMath>{`n`}</InlineMath> steps
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`S_n = \\sum_{i=1}^{n} X_i = X_1 + X_2 + \\cdots + X_n`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              Read as: &ldquo;<InlineMath>{`S`}</InlineMath> sub <InlineMath>{`n`}</InlineMath> equals
              the sum of all <InlineMath>{`X_i`}</InlineMath>, starting from{' '}
              <InlineMath>{`i = 1`}</InlineMath> up to <InlineMath>{`i = n`}</InlineMath>.&rdquo;
            </p>
          </div>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Worked example.</strong> First 5 flips: H, T, H, H, T, so{' '}
            <InlineMath>{`X_1 = +1,\\; X_2 = -1,\\; X_3 = +1,\\; X_4 = +1,\\; X_5 = -1`}</InlineMath>.
          </p>
          <BlockMath>{`S_1 = 1, \\quad S_2 = 0, \\quad S_3 = 1, \\quad S_4 = 2, \\quad S_5 = 1`}</BlockMath>
        </div>

        {/* Expected value */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          The average outcome (expected value)
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            When <InlineMath>{`p = 0.5`}</InlineMath>, each flip has expected value zero:
          </p>
          <BlockMath>{`\\EE[X_i] = \\underbrace{0.5}_{P(\\text{heads})} \\times (+1) + \\underbrace{0.5}_{P(\\text{tails})} \\times (-1) = 0`}</BlockMath>
          <p>Because each step averages to zero:</p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\EE[S_n] = \\EE[X_1] + \\EE[X_2] + \\cdots + \\EE[X_n] = 0`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>On average, across many trials, you end up back where you started.</p>
          </div>
        </div>

        {/* Variance */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          How spread out the outcomes are &mdash; variance &amp; standard deviation
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            <strong>Variance</strong> measures the average squared distance from the mean.
            For a single fair coin flip:
          </p>
          <BlockMath>{`\\Var(X_i) = \\EE[(X_i - 0)^2] = 0.5 \\times (+1)^2 + 0.5 \\times (-1)^2 = 1`}</BlockMath>
          <p>
            Because flips are independent, the variance of the sum is the sum of the variances:
          </p>
          <BlockMath>{`\\Var(S_n) = \\Var(X_1) + \\Var(X_2) + \\cdots + \\Var(X_n) = \\underbrace{1 + 1 + \\cdots + 1}_{n \\text{ terms}} = n`}</BlockMath>
          <p>
            The <strong>standard deviation</strong> is the square root of the variance &mdash;
            same units as the position:
          </p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\text{SD}(S_n) = \\sqrt{\\Var(S_n)} = \\sqrt{n}`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              Before we begin flipping the coin, the expected position is zero: <InlineMath>{`\\EE[S_n] = 0`}</InlineMath>.
              But positions spread out over time. If we flip the coin a large number of times,
              about 68% of walks would end up within{' '}
              <InlineMath>{`\\pm\\sqrt{n}`}</InlineMath> of zero (one standard deviation),
              and about 95% within <InlineMath>{`\\pm 2\\sqrt{n}`}</InlineMath> (two standard deviations).
              More generally, the distribution of the sum of walks would be approximately normal.
              For example, after 100 steps, 68% of walks are within ±10
              and 95% within ±20.
              The spread grows with the <em>square root</em> of the number of steps, not the
              number itself.
            </p>
          </div>
        </div>

        {/* Biased coin */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          What if the coin is not fair?
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            When <InlineMath>{`p \\neq 0.5`}</InlineMath>, each step has a non-zero average:
          </p>
          <BlockMath>{`\\EE[X_i] = p \\times (+1) + (1-p) \\times (-1) = 2p - 1`}</BlockMath>
          <p>
            For <InlineMath>{`p = 0.6`}</InlineMath>: <InlineMath>{`\\EE[X_i] = 0.2`}</InlineMath>.
            After <InlineMath>{`n`}</InlineMath> steps:
          </p>
          <BlockMath>{`\\EE[S_n] = n(2p - 1)`}</BlockMath>
          <p>This is a systematic <em>drift</em> &mdash; the random walk now has a trend.</p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>Key concepts:</strong> stochastic process, expected value, variance,
              standard deviation, the <InlineMath>{`\\sqrt{n}`}</InlineMath> growth of randomness.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
