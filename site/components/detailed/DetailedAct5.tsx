'use client'

import { InlineMath, BlockMath } from '@/components/ui/Math'
import { VilleInequalitySim } from './sims/VilleInequalitySim'

export function DetailedAct5() {
  return (
    <section id="act-5" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 5 &mdash; Markov, Ville, and the Anytime-Valid Guarantee
          </h2>
          <p className="text-neutral-600">This is the pivotal act of the entire presentation.</p>
        </div>

        {/* Simulation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Panel 1 &mdash; Markov (single time):</strong>{' '}
              10,000 fair-coin paths of <InlineMath>{`\\Lambda_n`}</InlineMath>. A threshold at{' '}
              <InlineMath>{`\\Lambda = 1/\\alpha = 20`}</InlineMath>. Count: how many paths are
              above the threshold at step 200? Fraction <InlineMath>{`\\leq 5\\%`}</InlineMath>.
            </p>
            <p>
              <strong>Panel 2 &mdash; Ville (any time):</strong>{' '}
              Same paths. Count: how many <em>ever</em> crossed the threshold at <em>any</em> step?
              Also <InlineMath>{`\\leq 5\\%`}</InlineMath> &mdash; but requires a stronger theorem.
            </p>
            <p>
              <strong>Panel 3 &mdash; Comparison:</strong>{' '}
              Standard <InlineMath>{`z`}</InlineMath>-score checked at every step. Count how many
              ever show significance. Much higher than 5% &mdash; the peeking problem.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <VilleInequalitySim />

        {/* Intuition */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>We are about to prove the most important result in this entire presentation:
              the <strong>anytime-valid guarantee</strong>.
            </p>
            <p>Two steps:</p>
            <ol className="list-decimal ml-6 space-y-1">
              <li><strong>Markov&apos;s inequality</strong> &mdash; a simple bound at one point in time.</li>
              <li><strong>Ville&apos;s inequality</strong> &mdash; extends the bound to all points in time simultaneously.</li>
            </ol>
            <p>Ville&apos;s inequality is <em>the reason</em> sequential testing works.</p>
          </div>
        </div>

        {/* Step 1: Markov */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Step 1: Markov&apos;s Inequality</h4>

        <div className="bg-white border-2 border-neutral-400 rounded-lg p-5 mb-6">
          <p className="font-semibold text-neutral-900 mb-2">Theorem (Markov&apos;s Inequality)</p>
          <div className="text-neutral-700">
            <p>
              For any non-negative random variable <InlineMath>{`X`}</InlineMath> with finite{' '}
              <InlineMath>{`\\EE[X]`}</InlineMath>:
            </p>
            <div className="bg-neutral-50 border border-neutral-300 rounded p-3 mt-2">
              <BlockMath>{`\\PP(X \\geq c) \\leq \\frac{\\EE[X]}{c}`}</BlockMath>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 text-neutral-600">
          <p>
            <InlineMath>{`\\PP(\\cdot)`}</InlineMath> denotes probability &mdash; a number between
            0 and 1 measuring how likely an event is. So &ldquo;the probability that{' '}
            <InlineMath>{`X`}</InlineMath> is at least <InlineMath>{`c`}</InlineMath> cannot exceed
            the average of <InlineMath>{`X`}</InlineMath> divided by <InlineMath>{`c`}</InlineMath>.&rdquo;
          </p>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Why is this true? An intuitive proof.</strong></p>
          <p>
            Suppose <InlineMath>{`X \\geq 0`}</InlineMath> always. Let{' '}
            <InlineMath>{`q = \\PP(X \\geq c)`}</InlineMath> be the fraction of outcomes at or
            above <InlineMath>{`c`}</InlineMath>. Those outcomes contribute <em>at least</em>{' '}
            <InlineMath>{`q \\times c`}</InlineMath> to the average (each is{' '}
            <InlineMath>{`\\geq c`}</InlineMath>). The rest contribute{' '}
            <InlineMath>{`\\geq 0`}</InlineMath> (since <InlineMath>{`X \\geq 0`}</InlineMath>):
          </p>
          <BlockMath>{`\\EE[X] \\geq q \\cdot c + (1-q) \\cdot 0 = q \\cdot c \\quad \\Longrightarrow \\quad q \\leq \\frac{\\EE[X]}{c} \\quad \\checkmark`}</BlockMath>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Concrete example.</strong> Average income in a town is &euro;50,000.</p>
          <BlockMath>{`\\PP(\\text{income} \\geq \\text{€}500{,}000) \\leq \\frac{50{,}000}{500{,}000} = 0.10 = 10\\%`}</BlockMath>
          <p>At most 10% of people can earn &euro;500,000+.</p>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Applying Markov to the likelihood ratio.</strong></p>
          <p>
            Under <InlineMath>{`H_0`}</InlineMath>, <InlineMath>{`\\Lambda_n`}</InlineMath> is a
            martingale with <InlineMath>{`\\EE[\\Lambda_n] = \\Lambda_0 = 1`}</InlineMath> and{' '}
            <InlineMath>{`\\Lambda_n \\geq 0`}</InlineMath>. Markov gives:
          </p>
          <BlockMath>{`\\PP\\!\\left(\\Lambda_n \\geq \\frac{1}{\\alpha}\\right) \\leq \\frac{\\EE[\\Lambda_n]}{1/\\alpha} = 1 \\cdot \\alpha = \\alpha`}</BlockMath>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              At any single, pre-specified step <InlineMath>{`n`}</InlineMath>, the false positive
              probability is at most <InlineMath>{`\\alpha`}</InlineMath>. Reassuring &mdash; but
              only for <em>one</em> moment.
            </p>
          </div>
        </div>

        {/* Step 2: Ville */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Step 2: <a href="#ref-ville-1939" className="text-blue-600 hover:text-blue-800">Ville&apos;s Inequality (1939)</a></h4>

        <div className="bg-white border-2 border-neutral-400 rounded-lg p-5 mb-6">
          <p className="font-semibold text-neutral-900 mb-2">Theorem (Ville&apos;s Inequality)</p>
          <div className="text-neutral-700">
            <p>
              For any <strong>non-negative martingale</strong>{' '}
              <InlineMath>{`\\{M_n\\}_{n \\geq 0}`}</InlineMath> with{' '}
              <InlineMath>{`M_0 = m_0`}</InlineMath>:
            </p>
            <div className="bg-neutral-50 border border-neutral-300 rounded p-3 mt-2">
              <BlockMath>{`\\PP\\!\\left(\\sup_{n \\geq 0}\\, M_n \\geq c\\right) \\leq \\frac{m_0}{c}`}</BlockMath>
            </div>
            <p className="mt-2">
              where <InlineMath>{`\\sup_{n \\geq 0} M_n`}</InlineMath> is the highest value{' '}
              <InlineMath>{`M_n`}</InlineMath> <em>ever</em> reaches.
            </p>
          </div>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>Why this is remarkable:</strong></p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
              <tbody>
                <tr><td className="border border-neutral-300 p-3 font-semibold bg-neutral-100">Markov</td><td className="border border-neutral-300 p-3">At any single <em>fixed</em> moment, <InlineMath>{`\\PP(M_n \\geq c)`}</InlineMath> is small.</td></tr>
                <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3 font-semibold bg-neutral-100">Ville</td><td className="border border-neutral-300 p-3"><InlineMath>{`\\PP(M_n`}</InlineMath> <strong>ever</strong> <InlineMath>{`\\geq c`}</InlineMath>, at <strong>any</strong> moment<InlineMath>{`)`}</InlineMath> is <em>also</em> small.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p><strong>The intuition behind Ville.</strong></p>
          <p>
            For a non-negative martingale, reaching a high value &ldquo;uses up&rdquo; the
            available expected value. Once high, it must stay high on average (martingale
            property), yet it cannot go below zero (non-negativity). These two constraints
            together limit how often it can ever be high.
          </p>
        </div>

        {/* Applying Ville to LR */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Applying Ville to the likelihood ratio
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Set <InlineMath>{`M_n = \\Lambda_n`}</InlineMath>,{' '}
            <InlineMath>{`m_0 = \\Lambda_0 = 1`}</InlineMath>,{' '}
            <InlineMath>{`c = 1/\\alpha`}</InlineMath>:
          </p>
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <BlockMath>{`\\PP\\!\\left(\\Lambda_n \\text{ ever reaches } \\frac{1}{\\alpha} \\text{ or higher}\\right) \\leq \\alpha`}</BlockMath>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              The probability that the likelihood ratio ever crosses our rejection threshold
              &mdash; at any point, across all flips, even if you run forever &mdash; is at
              most <InlineMath>{`\\alpha`}</InlineMath>.
            </p>
            <p className="mt-2">
              <strong>This is the anytime-valid guarantee.</strong> You can peek after every
              observation. The false positive rate, across all checks combined, stays{' '}
              <InlineMath>{`\\leq \\alpha`}</InlineMath>.
            </p>
          </div>
        </div>

        {/* Connecting back */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Connecting back to Act 0</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Standard test statistics (like <InlineMath>{`p`}</InlineMath>-values from a{' '}
            <InlineMath>{`t`}</InlineMath>-test) are <em>not</em> martingales. Checking
            repeatedly gives many independent chances to be fooled.
          </p>
          <p>
            The likelihood ratio <em>is</em> a martingale under <InlineMath>{`H_0`}</InlineMath>.
            Ville&apos;s inequality converts this into a practical guarantee:{' '}
            <strong>peeking is safe.</strong>
          </p>
        </div>

        {/* Historical Note */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-neutral-700 mb-3">Historical Note</h4>
          <p className="text-neutral-700">
            <a href="#ref-ville-1939" className="text-blue-600 hover:text-blue-800">Jean Ville</a> proved this inequality in his 1939 doctoral thesis,{' '}
            <em>&Eacute;tude critique de la notion de collectif</em>. It predated the
            formal development of martingale theory by <a href="#ref-doob-1953" className="text-blue-600 hover:text-blue-800">Doob (1953)</a> and was largely
            overlooked for decades. <a href="#ref-robbins-1970" className="text-blue-600 hover:text-blue-800">Robbins (1970)</a> was among the first to recognise its
            practical importance for sequential testing &mdash; a connection we explore in Act 7.
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-green-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>Key concepts:</strong> Markov&apos;s inequality (with proof),
              Ville&apos;s inequality, the anytime-valid guarantee,
              martingale + non-negative = peek-safe.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
