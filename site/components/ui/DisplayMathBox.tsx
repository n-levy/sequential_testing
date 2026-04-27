'use client'

import { useState } from 'react'

export function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="mb-16">
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-800 rounded border border-neutral-300 hover:bg-neutral-200 mb-6"
      >
        {show ? 'Hide the math' : 'Show the math'}
      </button>
      {show && children}
    </div>
  )
}
