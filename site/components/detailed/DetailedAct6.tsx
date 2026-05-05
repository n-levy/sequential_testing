'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { VilleInequalitySim } from './sims/VilleInequalitySim'
import { DisplayMathBox } from '../ui/DisplayMathBox'

export function DetailedAct6() {

  return (
    <section id="act-6" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 6 &mdash; Markov, Ville, and the Anytime-Valid Guarantee
          </h2>
        </div>

        {/* Intuition: Why is peeking safe? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              This is the pivotal act: why can you peek at your test statistic after every observation, and still control the false positive rate?
            </p>
            <p>
              <strong>Two steps:</strong>
            </p>
            <ol className="list-decimal ml-6 space-y-1">
              <li><strong>Markov’s inequality:</strong> gives a bound at a single, fixed time.</li>
              <li><strong>Ville’s inequality:</strong> extends the bound to all times, no matter how often you peek.</li>
            </ol>
            <p>
              <strong>Ville’s inequality is the reason sequential testing works.</strong> It’s the mathematical engine behind the anytime-valid guarantee.
            </p>
          </div>
        </div>

        {/* Simulation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Panel 1: Markov (single time):</strong> 10,000 fair-coin paths of <InlineMath>{`\\Lambda_n`}</InlineMath>. Threshold at <InlineMath>{`\\Lambda = 1/\\alpha = 20`}</InlineMath>. How many are above the threshold at step 200? Fraction <InlineMath>{`\\leq 5\\%`}</InlineMath>.
            </p>
            <p>
              <strong>Panel 2: Ville (any time):</strong> Same paths. How many ever cross the threshold at any step? Also <InlineMath>{`\\leq 5\\%`}</InlineMath>—but this needs a stronger theorem.
            </p>
            <p>
              <strong>Panel 3: Comparison:</strong> Standard <InlineMath>{`z`}</InlineMath>-score checked at every step. How many ever show significance? Much higher than 5%—the peeking problem.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <VilleInequalitySim />

        {/* Simulation takeaway */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Simulation takeaway:</strong> Markov's inequality controls the false positive rate at a single time. Ville’s inequality controls it across all times—even if you peek after every flip. This is the anytime-valid guarantee.
          </p>
        </div>

        {/* Step 1: Markov */}
        <DisplayMathBox>

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
            <ul className="mt-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
              <li><InlineMath>{`X`}</InlineMath>:any non-negative random variable (a quantity that is always ≥ 0)</li>
              <li><InlineMath>{`\\EE[X]`}</InlineMath>:the expected value (long-run average) of <InlineMath>{`X`}</InlineMath></li>
              <li><InlineMath>{`c`}</InlineMath>:a threshold value (must be positive)</li>
              <li><InlineMath>{`\\PP(X \\geq c)`}</InlineMath>:the probability that <InlineMath>{`X`}</InlineMath> is at least as large as the threshold</li>
            </ul>
          </div>
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
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\Lambda_n`}</InlineMath>:the likelihood ratio at step <InlineMath>{`n`}</InlineMath> (the test statistic)</li>
            <li><InlineMath>{`1/\\alpha`}</InlineMath>:the rejection threshold (e.g. 20 when <InlineMath>{`\\alpha = 0.05`}</InlineMath>); we reject <InlineMath>{`H_0`}</InlineMath> when the likelihood ratio exceeds this</li>
            <li><InlineMath>{`\\EE[\\Lambda_n] = 1`}</InlineMath>:since <InlineMath>{`\\Lambda_n`}</InlineMath> is a martingale starting at 1, its expected value stays at 1 under <InlineMath>{`H_0`}</InlineMath></li>
            <li><InlineMath>{`\\alpha`}</InlineMath>:the false positive rate; the probability of a false alarm at this single look is at most <InlineMath>{`\\alpha`}</InlineMath></li>
          </ul>
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
            <ul className="mt-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
              <li><InlineMath>{`M_n`}</InlineMath>:a non-negative martingale (e.g. the likelihood ratio <InlineMath>{`\\Lambda_n`}</InlineMath>): a process where the expected future value always equals the current value</li>
              <li><InlineMath>{`m_0`}</InlineMath>:the starting value of the martingale (for our likelihood ratio, <InlineMath>{`m_0 = \\Lambda_0 = 1`}</InlineMath>)</li>
              <li><InlineMath>{`c`}</InlineMath>:the threshold we want to avoid crossing (e.g. <InlineMath>{`c = 1/\\alpha = 20`}</InlineMath> for a 5% false positive rate)</li>
              <li><InlineMath>{`\\sup_{n \\geq 0} M_n`}</InlineMath>:the supremum (highest value ever reached) of <InlineMath>{`M_n`}</InlineMath> across all time steps</li>
              <li><InlineMath>{`\\PP(\\sup M_n \\geq c)`}</InlineMath>:the probability that the process <em>ever</em> crosses the threshold at any point during the experiment</li>
            </ul>
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
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Connecting back to Act 1</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            <InlineMath>{`p`}</InlineMath>-values are not martingales and do not provide
            guarantees that hold under repeated checking. Each interim look gives random
            fluctuations another opportunity to cross the significance threshold.
          </p>
          <p>
            The likelihood ratio <em>is</em> a martingale under <InlineMath>{`H_0`}</InlineMath>.
            Ville&apos;s inequality converts this into a practical guarantee:{' '}
            <strong>peeking is safe.</strong>
          </p>
        </div>

        </DisplayMathBox>

        {/* Historical Note */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-neutral-700 mb-3">Historical Note</h4>
          <p className="text-neutral-700">
            <a href="#ref-ville-1939" className="text-blue-600 hover:text-blue-800">Jean Ville</a> proved this inequality in his 1939 doctoral thesis,{' '}
            <em>&Eacute;tude critique de la notion de collectif</em>. It predated the
            formal development of martingale theory by <a href="#ref-doob-1953" className="text-blue-600 hover:text-blue-800">Doob (1953)</a> and was largely
            overlooked for decades. <a href="#ref-robbins-1970" className="text-blue-600 hover:text-blue-800">Robbins (1970)</a> was among the first to recognise its
            practical importance for sequential testing &mdash; a connection we explore in Act 8.
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
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
