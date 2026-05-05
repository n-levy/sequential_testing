'use client'

import { InlineMath, BlockMath } from '../ui/Math'
import { LikelihoodRatioSim } from './sims/LikelihoodRatioSim'
import { DisplayMathBox } from '../ui/DisplayMathBox'

export function DetailedAct4() {

  return (
    <section id="act-4" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 4 &mdash; Hypothesis Testing: Telling Two Coins Apart
          </h2>
        </div>

        {/* Intuition: How do you tell two coins apart? */}
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <div className="text-neutral-800 space-y-3">
            <p>
              You’re handed a coin. Is it fair (<InlineMath>{`p = 0.5`}</InlineMath>) or biased (<InlineMath>{`p = 0.5 + \\delta`}</InlineMath>)? With just a few flips, the difference is invisible. With hundreds, the truth emerges.
            </p>
            <p>
              <strong>Null hypothesis <InlineMath>{`H_0`}</InlineMath>:</strong> The coin is fair. <br />
              <strong>Alternative hypothesis <InlineMath>{`H_1`}</InlineMath>:</strong> The coin is biased.
            </p>
            <p>
              <strong>Type I error (false positive):</strong> You call the coin biased when it’s actually fair.<br />
              <strong>Type II error (false negative):</strong> You call the coin fair when it’s actually biased.
            </p>
            <p>
              Standard thresholds: <InlineMath>{`\\alpha = 0.05`}</InlineMath> (max false positive rate), <InlineMath>{`\\beta = 0.20`}</InlineMath> (max false negative rate). <strong>Power</strong> = <InlineMath>{`1 - \\beta = 0.80`}</InlineMath>.
            </p>
            <p>
              The more data you collect, the easier it is to tell the difference. But with small bias, even long sequences can be ambiguous.
            </p>
          </div>
        </div>

        {/* Simulation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Flip a coin and try to decide: is it fair or biased? The simulation shows how hard it is to distinguish the two, especially when the bias is small. Over short runs, the sequences look nearly identical.
            </p>
          </div>
        </div>

        {/* Interactive Simulation */}
        <LikelihoodRatioSim />

        {/* Simulation takeaway */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Simulation takeaway:</strong> Even with a real bias, it takes a lot of data to reliably tell the difference. Short sequences are noisy; long sequences reveal the truth.
          </p>
        </div>

        <DisplayMathBox>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">The likelihood</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Suppose you flip the coin <InlineMath>{`n`}</InlineMath> times and see <InlineMath>{`k`}</InlineMath> heads.
          </p>
          <p>The likelihood if the coin is fair (<InlineMath>{`H_0`}</InlineMath>):</p>
          <BlockMath>{`\\mathcal{L}_0 = (0.5)^k \\times (0.5)^{n-k} = (0.5)^n`}</BlockMath>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\mathcal{L}_0`}</InlineMath>:likelihood under the null hypothesis (fair coin): the probability of seeing the exact sequence of heads and tails we observed, if the coin truly is fair</li>
            <li><InlineMath>{`n`}</InlineMath>:total number of coin flips</li>
            <li><InlineMath>{`k`}</InlineMath>:number of heads observed</li>
            <li><InlineMath>{`n - k`}</InlineMath>:number of tails observed</li>
          </ul>
          <p>The likelihood if the coin is biased (<InlineMath>{`H_1`}</InlineMath>):</p>
          <BlockMath>{`\\mathcal{L}_1 = (0.5 + \\delta)^k \\times (0.5 - \\delta)^{n-k}`}</BlockMath>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\mathcal{L}_1`}</InlineMath>:likelihood under the alternative hypothesis (biased coin): the probability of the observed sequence if the coin has bias <InlineMath>{`\\delta`}</InlineMath></li>
            <li><InlineMath>{`\\delta`}</InlineMath>:the amount of bias added to the heads probability (e.g. <InlineMath>{`\\delta = 0.1`}</InlineMath> means the biased coin lands heads with probability 0.6)</li>
            <li><InlineMath>{`0.5 + \\delta`}</InlineMath>:probability of heads under the biased coin</li>
            <li><InlineMath>{`0.5 - \\delta`}</InlineMath>:probability of tails under the biased coin</li>
          </ul>
        </div>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">The likelihood ratio</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\Lambda_n = \\frac{\\mathcal{L}_1}{\\mathcal{L}_0} = \\frac{(0.5+\\delta)^k \\;(0.5-\\delta)^{n-k}}{(0.5)^n}`}</BlockMath>
          </div>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\Lambda_n`}</InlineMath>:the likelihood ratio after <InlineMath>{`n`}</InlineMath> flips: how many times more likely the observed data are under the biased-coin hypothesis vs. the fair-coin hypothesis</li>
            <li><InlineMath>{`\\mathcal{L}_1 / \\mathcal{L}_0`}</InlineMath>:ratio of the biased-coin likelihood to the fair-coin likelihood</li>
          </ul>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-600">
            <p>
              The likelihood ratio tells you how much more likely the data are if the coin is biased versus fair.
            </p>
          </div>
        </div>

        {/* Example */}
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            <strong>Example.</strong><br />
            <InlineMath>{`\\delta = 0.1`}</InlineMath> (biased coin has{' '}
            <InlineMath>{`p = 0.6`}</InlineMath>);{' '}
            <InlineMath>{`n = 10`}</InlineMath> flips, <InlineMath>{`k = 7`}</InlineMath> heads.
          </p>
          <BlockMath>{`\\begin{aligned}
\\mathcal{L}_1 &= (0.6)^7 \\times (0.4)^3 \\approx 0.001792 \\
\\mathcal{L}_0 &= (0.5)^{10} \\approx 0.000977 \\
\\Lambda_{10} &= \\frac{0.001792}{0.000977} \\approx 1.83
\\end{aligned}`}</BlockMath>
          <p>
            The data is <InlineMath>{`\\approx 1.83`}</InlineMath> times more likely if the coin
            is biased.
          </p>
        </div>

        {/* Interpreting LR */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">
          Interpreting <InlineMath>{`\\Lambda_n`}</InlineMath>
        </h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold"><InlineMath>{`\\Lambda_n`}</InlineMath></th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-neutral-300 p-3"><InlineMath>{`= 1`}</InlineMath></td><td className="border border-neutral-300 p-3">Data equally consistent with both hypotheses</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`= 10`}</InlineMath></td><td className="border border-neutral-300 p-3">10&times; more likely under <InlineMath>{`H_1`}</InlineMath> &mdash; moderate evidence</td></tr>
              <tr><td className="border border-neutral-300 p-3"><InlineMath>{`= 100`}</InlineMath></td><td className="border border-neutral-300 p-3">100&times; more likely under <InlineMath>{`H_1`}</InlineMath> &mdash; strong evidence</td></tr>
              <tr className="bg-neutral-50"><td className="border border-neutral-300 p-3"><InlineMath>{`= 0.1`}</InlineMath></td><td className="border border-neutral-300 p-3">10&times; more likely under <InlineMath>{`H_0`}</InlineMath> &mdash; evidence for fairness</td></tr>
            </tbody>
          </table>
        </div>

        {/* Incremental updating */}
        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Incremental updating</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p><InlineMath>{`\\Lambda_n`}</InlineMath> can be computed one flip at a time:</p>
          <div className="bg-white border border-neutral-300 rounded-lg p-4">
            <BlockMath>{`\\Lambda_n = \\Lambda_{n-1} \\times \\frac{f_1(x_n)}{f_0(x_n)}`}</BlockMath>
          </div>
          <ul className="mb-3 text-sm text-neutral-600 space-y-1 ml-4 list-disc">
            <li><InlineMath>{`\\Lambda_{n-1}`}</InlineMath>:the likelihood ratio computed from all previous flips (before the <InlineMath>{`n`}</InlineMath>th flip)</li>
            <li><InlineMath>{`f_j(x_n)`}</InlineMath>:the probability of the <InlineMath>{`n`}</InlineMath>th flip's outcome <InlineMath>{`x_n`}</InlineMath> under hypothesis <InlineMath>{`H_j`}</InlineMath> (where <InlineMath>{`j=0`}</InlineMath> is fair and <InlineMath>{`j=1`}</InlineMath> is biased)</li>
            <li><InlineMath>{`x_n`}</InlineMath>:the actual outcome of the <InlineMath>{`n`}</InlineMath>th flip (heads or tails)</li>
            <li><InlineMath>{`f_1(x_n) / f_0(x_n)`}</InlineMath>:the likelihood ratio for just the one new observation; multiply by this at each step to update the running total</li>
          </ul>
          <p>
            where <InlineMath>{`f_j(x_n)`}</InlineMath> is the probability of the{' '}
            <InlineMath>{`n`}</InlineMath>th flip&apos;s outcome under <InlineMath>{`H_j`}</InlineMath>.
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Heads: multiply by <InlineMath>{`\\frac{0.5 + \\delta}{0.5}`}</InlineMath>.</li>
            <li>Tails: multiply by <InlineMath>{`\\frac{0.5 - \\delta}{0.5}`}</InlineMath>.</li>
          </ul>
          <p>This incremental structure is what makes <em>sequential</em> testing possible.</p>
        </div>

        <h4 className="text-lg font-semibold text-neutral-800 mb-3">Starting value</h4>
        <div className="text-neutral-700 space-y-3 mb-6">
          <p>
            Before any data: <InlineMath>{`\\Lambda_0 = 1`}</InlineMath>.
            Neither hypothesis is favoured. This will be important for <a href="#ref-ville-1939" className="text-blue-600 hover:text-blue-800">Ville&apos;s inequality</a>{' '}
            (which requires the starting value to equal 1).
          </p>
        </div>

        </DisplayMathBox>

        {/* Key Takeaway */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800">
            <p>
              The likelihood ratio quantifies how many times more probable the observed data are under <InlineMath>{`H_1`}</InlineMath> relative to <InlineMath>{`H_0`}</InlineMath>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
