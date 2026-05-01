'use client'

import { useState, useEffect } from 'react'

export function DisplayMathBox({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = () => setShow(true)
    window.addEventListener('show-all-content', handler)
    return () => window.removeEventListener('show-all-content', handler)
  }, [])

  return (
    <div>
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200 mb-6"
      >
        {show ? 'Hide the math' : 'Show the math'}
      </button>
      {show && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 leading-relaxed">
          <h4 className="font-bold text-neutral-900 mb-4">The math</h4>
          {children}
        </div>
      )}
      <div style={{ height: '2rem' }} />
    </div>
  )
}
