'use client'

import { PeekingSimulation } from './PeekingSimulation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InlineMath, BlockMath } from '@/components/ui/Math'

export function Act1() {
  return (
    <section id="act1" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 1 &mdash; The Peeking Problem
          </h2>
        </div>

        {/* ── Motivation ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Motivation</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              You work at a company running an A/B test. Half your users see the old
              website, half see a new design. Every day, you check the dashboard:
              &ldquo;Is the new design better?&rdquo; After a week, the dashboard shows{' '}
              <InlineMath>{`p = 0.03`}</InlineMath> &mdash; that looks significant! You call it:
              the new design wins.
            </p>
            <p>
              But here is the problem:{' '}
              <strong>
                the more often you check, the more likely you are to see a false positive.
              </strong>{' '}
              A test designed to have a 5% false positive rate can easily reach 20&ndash;30% if
              you peek at it repeatedly. One in four or five &ldquo;winning&rdquo; experiments
              might actually be noise. That is, it results from randomness rather than
              indicating a systematic difference between the Treatment and Control groups.
            </p>
          </div>
        </div>

        {/* ── Simulation ── */}

        <div className="bg-orange-50 border border-orange-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-orange-900 mb-3">Simulation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>Setup:</strong>{' '}
              1,000 A/B experiments where there is <em>no real effect</em> &mdash; any apparent
              difference is pure noise.
            </p>
            <p>
              Two groups of observations (control and treatment) are generated from{' '}
              <em>identical</em> distributions. A standard <InlineMath>{`t`}</InlineMath>-test
              is computed after every new observation arrives.
            </p>
            <p>
              A counter shows: &ldquo;Number of times <InlineMath>{`p < 0.05`}</InlineMath> so
              far.&rdquo; Watch the <InlineMath>{`p`}</InlineMath>-value bounce
              around. Every time it dips below <InlineMath>{`0.05`}</InlineMath>, it lights up
              red &mdash; a false positive.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <PeekingSimulation />
        </div>

        {/* ── Why Does This Happen? ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">Why Does This Happen?</h3>

        <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-blue-900 mb-3">Intuitive Explanation</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              Traditional statistical tests promise: &ldquo;If there is no real effect, I will
              falsely cry wolf at most 5% of the time.&rdquo; But this promise comes with fine
              print:{' '}
              <strong>
                you may only look at the result once, at a pre-determined time.
              </strong>
            </p>
            <p>
              Every time you peek, you get another chance for randomness to fool you. It is
              like rolling a die repeatedly &mdash; the more rolls, the more likely you are to
              get a six eventually, even though any single roll has only a{' '}
              <InlineMath>{`1/6`}</InlineMath> chance.
            </p>
          </div>
        </div>

        {/* ── How Bad Is It? ── */}
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">How Bad Is It?</h3>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 p-3 text-left font-semibold">Checking schedule</th>
                <th className="border border-neutral-300 p-3 text-left font-semibold">Actual false positive rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 p-3">Once at the end (as designed)</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 5\\%`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">Daily for 1 week</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 13\\%`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">Daily for 2 weeks</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 19\\%`}</InlineMath></td>
              </tr>
              <tr className="bg-neutral-50">
                <td className="border border-neutral-300 p-3">Daily for 4 weeks</td>
                <td className="border border-neutral-300 p-3"><InlineMath>{`\\sim 25\\%`}</InlineMath></td>
              </tr>
              <tr>
                <td className="border border-neutral-300 p-3">Continuously (every observation)</td>
                <td className="border border-neutral-300 p-3">Can exceed <InlineMath>{`30\\%`}</InlineMath></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-8">
          <p className="text-neutral-700">
            If you check a 4-week experiment every day, roughly 1 in 4 &ldquo;significant&rdquo;
            results could be false. This means you might ship features that have
            no real effect &mdash; or even hurt your metrics.
          </p>
        </div>

        {/* ── Key Takeaway ── */}
        <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
          <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
          <div className="text-neutral-800 space-y-3">
            <p>
              <strong>The peeking problem:</strong> Checking a traditional test repeatedly inflates
              the false positive rate far beyond its nominal level. We need a fundamentally
              different kind of test &mdash; one that remains valid no matter when or how often
              we look.
            </p>
            <p>
              That kind of test exists. It is called a <strong>sequential test</strong>, and it is
              what Eppo (and similar platforms) use under the hood.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}