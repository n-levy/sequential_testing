'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavigationProps {
  variant?: 'landing' | 'short' | 'detailed'
}

export function Navigation({ variant = 'landing' }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shortActs = [
    { id: 'act1', title: 'The Problem', href: '/short#act1' },
    { id: 'act2', title: 'EPPO Solution', href: '/short#act2' },
    { id: 'act3', title: 'DIY Implementation', href: '/short#act3' },
  ]

  const detailedActs = [
    { id: 'detailed', title: 'Coming Soon', href: '/detailed' },
  ]

  const landingLinks = [
    { id: 'short', title: 'Short Version', href: '/short' },
    { id: 'detailed', title: 'Detailed Version', href: '/detailed' },
  ]

  const links = variant === 'short' ? shortActs
    : variant === 'detailed' ? detailedActs
    : landingLinks

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-700">
              Sequential Testing
            </Link>
            {variant !== 'landing' && (
              <span className={`ml-3 text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                variant === 'short'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {variant === 'short' ? 'Short' : 'Detailed'}
              </span>
            )}
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-neutral-600 hover:text-primary-600 transition-colors"
              >
                {link.title}
              </Link>
            ))}
            {variant !== 'landing' && (
              <Link
                href={variant === 'short' ? '/detailed' : '/short'}
                className="text-neutral-400 hover:text-primary-600 transition-colors text-sm"
              >
                Switch to {variant === 'short' ? 'Detailed' : 'Short'} Version
              </Link>
            )}
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
              {links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="block px-3 py-2 text-neutral-600 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
              {variant !== 'landing' && (
                <Link
                  href={variant === 'short' ? '/detailed' : '/short'}
                  className="block px-3 py-2 text-neutral-400 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Switch to {variant === 'short' ? 'Detailed' : 'Short'} Version
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}