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
          macros: {
            "\\RR": "\\mathbb{R}",
            "\\NN": "\\mathbb{N}",
            "\\ZZ": "\\mathbb{Z}",
            "\\QQ": "\\mathbb{Q}",
            "\\CC": "\\mathbb{C}",
            "\\FF": "\\mathbb{F}",
            "\\PP": "\\mathbb{P}",
            "\\EE": "\\mathbb{E}",
            "\\Var": "\\operatorname{Var}",
            "\\Cov": "\\operatorname{Cov}",
            "\\Cor": "\\operatorname{Cor}",
            "\\given": "\\,\\vert\\,",
          }
        })
      } catch (error) {
        console.error('KaTeX rendering error:', error)
        ref.current.textContent = children
      }
    }
  }, [children, block])

  return block ? (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`math-display overflow-x-auto overflow-y-hidden ${className}`} />
  ) : (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className} />
  )
}

// Convenience components for common math expressions
export function InlineMath({ children, className }: { children: string, className?: string }) {
  return <Math block={false} className={className}>{children}</Math>
}

export function BlockMath({ children, className }: { children: string, className?: string }) {
  return <Math block={true} className={className}>{children}</Math>
}

// Common mathematical expressions
export const MathExpressions = {
  confidenceInterval: "\\text{CI} = \\hat{\\tau} \\pm z_{\\alpha/2} \\cdot \\text{SE}",
  sequentialCI: "\\text{CI}(t) = \\hat{\\tau}(t) \\pm \\sqrt{\\frac{n + \\nu}{n} \\cdot \\log\\frac{n + \\nu}{\\nu \\alpha^2}} \\cdot \\hat{\\sigma}_{\\hat{\\tau}}(t)",
  treatmentEffect: "\\hat{\\tau} = \\bar{Y}_1 - \\bar{Y}_0",
  standardError: "\\text{SE} = \\sqrt{\\frac{s_0^2}{n_0} + \\frac{s_1^2}{n_1}}",
  falsePositive: "\\alpha = \\mathbb{P}(\\text{false positive})",
  power: "1 - \\beta = \\mathbb{P}(\\text{detect effect} \\given \\text{effect exists})",
} as const