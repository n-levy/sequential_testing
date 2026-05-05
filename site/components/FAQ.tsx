"use client"

import { useState, useEffect } from 'react'
import { InlineMath } from './ui/Math'

function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('show-all-content', handler)
    return () => window.removeEventListener('show-all-content', handler)
  }, [])

  return (
    <div className="border border-neutral-300 rounded-lg mb-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
      >
        <span>{question}</span>
        <span className="ml-4 text-xl font-bold text-blue-700 select-none">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-neutral-700 space-y-4 border-t border-neutral-200 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

export function FAQ() {
  return (
    <div id="faq" className="max-w-3xl mx-auto px-4 mb-12">
      <h2 className="text-2xl font-bold mb-2">FAQ</h2>
      <p className="text-neutral-600 mb-6 text-sm">
        Click <strong>+</strong> to expand a question.
      </p>

      <FAQItem question="Why does the Type I error of the sequential confidence interval grow slightly after n reaches a certain size?">

        <div>
          <h5 className="font-semibold text-neutral-900 mb-2">Short answer</h5>
          <p>
            This is expected behaviour, not a flaw. The sequential confidence interval is designed
            to remain valid at <em>every</em> possible stopping time, including very late ones.
            To guarantee coverage for all future times, the threshold must eventually grow, which
            causes the Type I error fraction to rise slightly. Importantly, the result is{' '}
            <strong>robust to misspecifying <InlineMath>{`n^*`}</InlineMath></strong>: being off by
            a factor of two has minimal impact on the behaviour of the interval. See Howard et
            al.&nbsp;(2021) for the theoretical bounds.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-neutral-900 mb-2">Intuitive explanation</h5>
          <p className="mb-2">
            Two competing forces act on the width of the sequential confidence interval as{' '}
            <InlineMath>{`n`}</InlineMath> grows:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              <strong>More data narrows the interval.</strong> The standard error shrinks as{' '}
              <InlineMath>{`1/\\sqrt{n}`}</InlineMath>, so the interval tightens, just as with a
              fixed-horizon interval.
            </li>
            <li>
              <strong>More data means more peeks.</strong> Continuous monitoring accumulates more
              chances to cross the threshold by luck. To keep the overall false positive rate
              controlled, the sequential multiplier accounts for this by
              growing slowly with <InlineMath>{`n`}</InlineMath>.
            </li>
          </ol>
          <p className="mt-3">
            In the early and middle stages, the first force (data narrowing the interval) dominates:
            the interval gets tighter. Eventually, the second force (the multiplier growing to
            correct for more peeks) starts to dominate, and the interval widens slightly. This
            slight widening is what causes the Type I error fraction to creep up: the threshold
            is being raised just fast enough to maintain the time-uniform coverage guarantee.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-neutral-900 mb-2">Mathematical explanation</h5>
          <p className="mb-2">
            The sequential confidence interval uses a time-varying multiplier in place of the
            fixed 1.96:
          </p>
          <div className="bg-neutral-100 rounded-lg px-4 py-3 font-mono text-sm mb-3">
            m(n) = sqrt( ((n + ν) / n) × log((n + ν) / (ν × α)) )
          </div>
          <p className="mb-2">
            The interval width is proportional to{' '}
            <InlineMath>{`(1/\\sqrt{n}) \\times m(n)`}</InlineMath>. Decompose the multiplier into two
            factors:
          </p>
          <div className="bg-neutral-100 rounded-lg px-4 py-3 font-mono text-sm mb-3">
            A(n) = (n + ν) / n{'\n'}
            B(n) = log((n + ν) / (ν × α)){'\n'}
            m(n) = sqrt( A(n) × B(n) )
          </div>
          <ul className="list-disc list-inside space-y-2 ml-2 mb-3">
            <li>
              <strong>A(n)</strong> starts large (when <InlineMath>{`n`}</InlineMath> is small,{' '}
              <InlineMath>{`A(n) \\approx \\nu/n`}</InlineMath> is large) and{' '}
              <strong>decreases</strong> toward 1 as{' '}
              <InlineMath>{`n`}</InlineMath> grows.
            </li>
            <li>
              <strong>B(n)</strong> starts near a constant (when <InlineMath>{`n`}</InlineMath> is
              small, <InlineMath>{`B(n) \\approx \\log(1/\\alpha)`}</InlineMath>) and then{' '}
              <strong>increases</strong> slowly like{' '}
              <InlineMath>{`\\log(n)`}</InlineMath> as <InlineMath>{`n`}</InlineMath> grows.
            </li>
          </ul>
          <p className="mb-2">
            Three stages of the combined multiplier <InlineMath>{`m(n)`}</InlineMath>:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li><strong>Early (<InlineMath>{`n`}</InlineMath> small):</strong> A(n) dominates, so m(n) is large and the interval is wide.</li>
            <li><strong>Middle:</strong> A(n) decreases faster than B(n) grows, so m(n) decreases and the interval narrows toward its minimum.</li>
            <li><strong>Late (<InlineMath>{`n`}</InlineMath> large):</strong> B(n) grows like <InlineMath>{`\\log(n)`}</InlineMath>, which eventually dominates, so m(n) rises and the interval widens slightly.</li>
          </ol>
          <p className="mt-3">
            The combined interval width (proportional to{' '}
            <InlineMath>{`(1/\\sqrt{n}) \\times m(n)`}</InlineMath>):
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2 mt-2">
            <li><strong>Early:</strong> <InlineMath>{`1/\\sqrt{n}`}</InlineMath> shrinks quickly, so the interval narrows.</li>
            <li><strong>Middle:</strong> both forces help, so the interval is at its tightest.</li>
            <li><strong>Late:</strong> <InlineMath>{`\\log(n)`}</InlineMath> growth in B(n) outpaces{' '}
            <InlineMath>{`1/\\sqrt{n}`}</InlineMath> shrinkage, so the interval widens slightly and
            the Type I error fraction rises slowly from below the nominal level.</li>
          </ol>
          <p className="mt-3 text-sm text-neutral-600">
            This late-stage widening is not a problem: it is the mathematical price of the
            time-uniform coverage guarantee. The sequential interval must remain valid for all
            possible stopping times, including very late ones, and{' '}
            <InlineMath>{`\\log(n)`}</InlineMath> growth is the minimal cost of this guarantee.
          </p>
        </div>

      </FAQItem>
    </div>
  )
}
