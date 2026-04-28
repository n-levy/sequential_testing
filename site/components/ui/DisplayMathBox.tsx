'use client'

import { useState } from 'react'

export function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="mb-16">
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200 mb-6"
      >
        {show ? 'Hide the math' : 'Show the math'}
      </button>
      {show && (
        <div>
          <h4 className="font-bold text-neutral-900 mb-4">The math</h4>
          {children}
        </div>
      )}
    </div>
  )
}
