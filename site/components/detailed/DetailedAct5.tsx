'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { LRMartingaleSim } from './sims/LRMartingaleSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'

export function DetailedAct5() {

  return (
    <section id="act-5" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 5 &mdash; The Likelihood Ratio Is a Martingale
          </h2>
        </div>

        {/* Intuition: Why is the likelihood ratio a martingale? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              Under <InlineMath>{`H_0`}</InlineMath> (the coin is fair), the likelihood ratio <InlineMath>{`\\Lambda_n`}</InlineMath> bounces up and down, but on average stays at 1. No matter how you peek or stop, you can’t systematically make it large. This is the martingale property in action.
            </p>
            <p>
              <strong>Key point:</strong> The likelihood ratio is just like the gambler’s winnings in Act 3. No clever strategy can beat the system if the coin is fair.
            </p>
          </div>
        </div>

        {/* Simulation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              The plot shows 100 paths of <InlineMath>{`\\Lambda_n`}</InlineMath> over time. When the coin is fair (<InlineMath>{`H_0`}</InlineMath>), the paths wander with no trend. When the coin is biased (<InlineMath>{`H_1`}</InlineMath>), the paths drift upward.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <LRMartingaleSim />

        {/* Simulation takeaway */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Simulation takeaway:</strong> If the coin is fair, the likelihood ratio stays around 1, no matter how you peek. If the coin is biased, it grows. This is the core of sequential testing.
          </p>
        </div>

        {/* Proof */}
        <DisplayMathBox>
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Mathematical Formulation</h3>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Proof that <InlineMath>{`\\Lambda_n`}</InlineMath> is a martingale under <InlineMath>{`H_0`}</InlineMath>
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            We must show: <InlineMath>{`\\EE[\\Lambda_n \\given \\Lambda_0, \\ldots, \\Lambda_{n-1}] = \\Lambda_{n-1}`}</InlineMath>.
          </p>
          <p>
            From Act 4, <InlineMath>{`\\Lambda_n = \\Lambda_{n-1} \\times \\frac{f_1(x_n)}{f_0(x_n)}`}</InlineMath>.
            Therefore:
          </p>
          <BlockMath>{`\\begin{aligned}
\\EE[\\Lambda_n \\given \\text{past}]
&= \\EE\\!\\left[\\Lambda_{n-1} \\cdot \\frac{f_1(x_n)}{f_0(x_n)} \\;\\bigg\\vert\\; \\text{past}\\right] \\\\
&= \\Lambda_{n-1} \\cdot \\EE\\!\\left[\\frac{f_1(x_n)}{f_0(x_n)}\\right]
\\quad \\text{(}\\Lambda_{n-1}\\text{ is known)}
\\end{aligned}`}</BlockMath>

          <p>
            Now the key step. Under <InlineMath>{`H_0`}</InlineMath>,{' '}
            <InlineMath>{`x_n`}</InlineMath> is drawn from <InlineMath>{`f_0`}</InlineMath>. So:
          </p>

          <BlockMath>{`\\begin{aligned}
\\EE\\!\\left[\\frac{f_1(x_n)}{f_0(x_n)}\\right]
&= \\sum_{\\text{all outcomes } x} f_0(x) \\cdot \\frac{f_1(x)}{f_0(x)} \\\\
&= \\sum_x \\cancel{f_0(x)} \\cdot \\frac{f_1(x)}{\\cancel{f_0(x)}} \\quad \\textbf{(the cancellation!)} \\\\
&= \\sum_x f_1(x) \\\\
&= 1 \\quad \\text{(}f_1\\text{ is a probability distribution)}
\\end{aligned}`}</BlockMath>

          <p>Therefore:</p>
          <BlockMath>{`\\EE[\\Lambda_n \\given \\text{past}] = \\Lambda_{n-1} \\times 1 = \\Lambda_{n-1} \\quad \\checkmark`}</BlockMath>
        </div>

        {/* Cancellation with numbers */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          The cancellation with actual numbers
        </h4>

        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            For <InlineMath>{`\\delta = 0.1`}</InlineMath> (biased coin{' '}
            <InlineMath>{`p = 0.6`}</InlineMath>):
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-3 text-left font-semibold">Outcome</th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`f_0(x)`}</InlineMath></th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`f_1(x)/f_0(x)`}</InlineMath></th>
                  <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`f_0(x) \\times [f_1(x)/f_0(x)]`}</InlineMath></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-neutral-300 p-3">Heads</td>
                  <td className="border border-neutral-300 p-3">0.5</td>
                  <td className="border border-neutral-300 p-3"><InlineMath>{`0.6/0.5 = 1.2`}</InlineMath></td>
                  <td className="border border-neutral-300 p-3"><InlineMath>{`0.5 \\times 1.2 = 0.6`}</InlineMath></td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="border border-neutral-300 p-3">Tails</td>
                  <td className="border border-neutral-300 p-3">0.5</td>
                  <td className="border border-neutral-300 p-3"><InlineMath>{`0.4/0.5 = 0.8`}</InlineMath></td>
                  <td className="border border-neutral-300 p-3"><InlineMath>{`0.5 \\times 0.8 = 0.4`}</InlineMath></td>
                </tr>
                <tr className="bg-neutral-100 font-semibold">
                  <td className="border border-neutral-300 p-3" colSpan={3}>Total:</td>
                  <td className="border border-neutral-300 p-3"><strong>1.0</strong> &#10003;</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              When we compute the expected ratio under <InlineMath>{`H_0`}</InlineMath>, the{' '}
              <InlineMath>{`H_0`}</InlineMath> probabilities cancel out, leaving the sum of the{' '}
              <InlineMath>{`H_1`}</InlineMath> probabilities &mdash; which equals 1 because{' '}
              <InlineMath>{`f_1`}</InlineMath> is a valid probability distribution.
            </p>
          </div>
        </div>

        {/* Additional properties */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Two additional properties</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              <strong><InlineMath>{`\\Lambda_n`}</InlineMath> is non-negative:</strong> It is a product
              of non-negative ratios (probabilities divided by probabilities), so{' '}
              <InlineMath>{`\\Lambda_n \\geq 0`}</InlineMath>.
            </li>
            <li>
              <strong><InlineMath>{`\\Lambda_0 = 1`}</InlineMath>:</strong> Before any data, neither
              hypothesis is favoured.
            </li>
          </ol>
          <p>
            So <InlineMath>{`\\Lambda_n`}</InlineMath> is a{' '}
            <strong>non-negative martingale starting at 1</strong>. Remember these properties &mdash;
            they are exactly what <a href="#ref-ville-1939" className="text-blue-600 hover:text-blue-800">Ville&apos;s inequality</a> needs.
          </p>
        </div>

        {/* Under H1 */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Under <InlineMath>{`H_1`}</InlineMath>, <InlineMath>{`\\Lambda_n`}</InlineMath> drifts upward
        </h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>When the coin really is biased:</p>
          <BlockMath>{`\\EE\\!\\left[\\frac{f_1(x_n)}{f_0(x_n)}\\right]_{H_1} = \\sum_x f_1(x) \\cdot \\frac{f_1(x)}{f_0(x)} > 1`}</BlockMath>
          <p>
            So <InlineMath>{`\\Lambda_n`}</InlineMath> tends to grow &mdash; this upward drift is
            the signal the test detects.
          </p>
        </div>

        </DisplayMathBox>

        {/* Key Takeaway */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              <strong>Key concepts:</strong> the likelihood ratio is a martingale under{' '}
              <InlineMath>{`H_0`}</InlineMath>; the cancellation that makes it work;
              non-negative martingale; drift under <InlineMath>{`H_1`}</InlineMath>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
