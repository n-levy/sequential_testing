"use client"
import { ABTestSim } from '../shared/ABTestSim'
import { InlineMath } from '../ui/Math'
import { useState } from 'react'

function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  if (show) return <>{children}</>;
  return <button className="px-4 py-2 bg-blue-600 text-white rounded mb-6" onClick={() => setShow(true)}>Display the math</button>;
}

export function Act2() {
  return (
    <div>
      {/* Simulation always visible */}
      <div className="mb-8">
        <ABTestSim layers={['fixed-ci', 'sequential-ci']} showPeekStats={true} />
      </div>

      {/* Intuitive explanation always visible */}
      <div className="bg-white border border-neutral-400 rounded-lg p-5 mb-8">
        <p className="text-neutral-700 mb-2">
          Eppo's sequential confidence interval lets you peek as often as you want, while still controlling the false positive rate. The band gets wider when you peek more, but you can stop the experiment at any time and trust the interval.
        </p>
        <p className="text-neutral-700">
          This method is more conservative than the standard 95% CI, but it is valid no matter how many times you look at the data.
        </p>
      </div>

      {/* Math section with DisplayMathBox */}
      <DisplayMathBox>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 mt-8">
          <h4 className="font-bold mb-3">Mathematical Formulation</h4>
          <p className="mb-2">
            The sequential confidence interval is based on a mixture boundary. For each time <InlineMath>n</InlineMath>, the interval is:
          </p>
          <p className="mb-2">
            <InlineMath>{`\left[ \bar{X}_n - c_n,\ \bar{X}_n + c_n \right]`}</InlineMath>
          </p>
          <p className="mb-2">
            where <InlineMath>{`\\bar{X}_n`}</InlineMath> is the running mean and <InlineMath>{`c_n`}</InlineMath> is a time-dependent width chosen so that the interval covers the true mean with at least 95% probability, no matter when you stop.
          </p>
        </div>
      </DisplayMathBox>
    </div>
  )
}