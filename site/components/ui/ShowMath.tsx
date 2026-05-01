'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ShowMathProps {
  children: ReactNode
  label?: string
}

/**
 * Collapsible wrapper for math sections. Hidden by default; user clicks
 * "Show me the math" to reveal. Use to wrap "Mathematical Formulation"
 * blocks so the page reads cleanly without forcing readers through formulas.
 */
export function ShowMath({ children, label = 'Show me the math' }: ShowMathProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('show-all-content', handler)
    return () => window.removeEventListener('show-all-content', handler)
  }, [])

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors text-sm font-medium"
        aria-expanded={open}
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {open ? 'Hide the math' : label}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  )
}
