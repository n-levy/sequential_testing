'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathProps {
  children: string
  block?: boolean
  className?: string
}

export function Math({ children, block = false, className = '' }: MathProps) {
  const ref = useRef<HTMLSpanElement | HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(children, ref.current, {
          displayMode: block,
          throwOnError: false,
        })
      } catch (error) {
        console.error('KaTeX rendering error:', error)
        ref.current.textContent = children
      }
    }
  }, [children, block])

  return block ? (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`math-display ${className}`} />
  ) : (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className} />
  )
}