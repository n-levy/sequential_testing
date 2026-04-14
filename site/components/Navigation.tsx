'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const acts = [
    { id: 'act1', title: 'The Problem', href: '#act1' },
    { id: 'act2', title: 'EPPO Solution', href: '#act2' },
    { id: 'act3', title: 'DIY Implementation', href: '#act3' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-700">
              Sequential Testing
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {acts.map((act) => (
              <Link
                key={act.id}
                href={act.href}
                className="text-neutral-600 hover:text-primary-600 transition-colors"
              >
                {act.title}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-600 hover:text-primary-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-neutral-50">
              {acts.map((act) => (
                <Link
                  key={act.id}
                  href={act.href}
                  className="block px-3 py-2 text-neutral-600 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  {act.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}