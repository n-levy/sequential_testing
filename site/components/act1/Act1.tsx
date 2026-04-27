'use client'

// import { CoinFlipMeanSim } from '../shared/CoinFlipMeanSim'
import { ABTestSim } from '../shared/ABTestSim'
import { InlineMath } from '../ui/Math'

import { useState } from 'react'

// --- DisplayMathBox helper ---
function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  if (show) return <>{children}</>;
  return <button className="px-4 py-2 bg-blue-600 text-white rounded mb-6" onClick={() => setShow(true)}>Display the math</button>;
}

export function Act1() {
  return (
    <div id="act-1" className="max-w-3xl mx-auto px-4">
      {/* Simulation */}
      <div className="mb-8 max-w-2xl">
        <ABTestSim layers={['fixed-ci']} />
      </div>
      {/* Simulation and explanation always visible */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
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
              <td className="border border-neutral-300 p-3">Daily for 4 weeks (28 looks)</td>
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
          With daily checks over a 4-week experiment, about one in four “significant” results will be a false positive. Features shipped on this basis may have no real effect—or may even degrade your metrics.
        </p>
      </div>

      {/* ── Key Takeaway ── */}
      <div className="bg-yellow-50 border border-yellow-600 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-yellow-900 mb-3">Key Takeaway</h4>
        <div className="text-neutral-800 space-y-3">
          <p>
            Sequential methods control the probability of ever making a false positive, no matter when we stop. They use stricter or time-dependent thresholds to account for repeated checking. This way, we can monitor results as often as we like, and the error rate stays controlled.
          </p>
        </div>
      </div>

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mt-8">
          <h4 className="font-bold mb-3">Mathematical Formulation</h4>
          <p className="mb-2">
            Let <InlineMath>X_i</InlineMath> represent the outcome of the <InlineMath>i</InlineMath>th coin flip. We assign:
          </p>
          <ul className="list-disc ml-6 mb-2">
            <li><InlineMath>X_i = +1</InlineMath> if the flip is heads (step forward)</li>
            <li><InlineMath>X_i = -1</InlineMath> if the flip is tails (step backward)</li>
          </ul>
          <p className="mb-2">
            The probability of heads is written <InlineMath>p</InlineMath>. For a fair coin, <InlineMath>p = 0.5</InlineMath>.
          </p>
          <p className="mb-2">
            <strong>Position after n steps:</strong>
          </p>
          <p className="mb-2">
            The person&apos;s position after <InlineMath>n</InlineMath> steps is the sum of all the individual steps:
          </p>
          <p className="mb-2">
            <InlineMath>S_n = X_1 + X_2 + X_3 + ... + X_n</InlineMath>
          </p>
        </div>
      </DisplayMathBox>
    </div>
  )
}