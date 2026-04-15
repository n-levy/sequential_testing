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
    { id: 'act-0', title: 'Act 0: Peeking', href: '/detailed#act-0' },
    { id: 'act-1', title: 'Act 1: Random Walk', href: '/detailed#act-1' },
    { id: 'act-2', title: 'Act 2: Martingale', href: '/detailed#act-2' },
    { id: 'act-3', title: 'Act 3: Likelihood', href: '/detailed#act-3' },
    { id: 'act-4', title: 'Act 4: LR = Martingale', href: '/detailed#act-4' },
    { id: 'act-5', title: 'Act 5: Ville', href: '/detailed#act-5' },
    { id: 'act-6', title: 'Act 6: SPRT', href: '/detailed#act-6' },
    { id: 'act-7', title: 'Act 7: mSPRT', href: '/detailed#act-7' },
    { id: 'act-8', title: 'Act 8: Conf. Sequences', href: '/detailed#act-8' },
    { id: 'act-9', title: 'Act 9: Eppo Problem', href: '/detailed#act-9' },
    { id: 'act-10', title: 'Act 10: Pipeline', href: '/detailed#act-10' },
    { id: 'act-11', title: 'Act 11: CUPED', href: '/detailed#act-11' },
    { id: 'act-12', title: 'Act 12: Sequential CI', href: '/detailed#act-12' },
    { id: 'act-13', title: 'Act 13: DIY', href: '/detailed#act-13' },
  ]

  const landingLinks = [
    { id: 'short', title: 'Focused', href: '/short' },
    { id: 'detailed', title: 'In-depth', href: '/detailed' },
  ]

  const links = variant === 'short' ? shortActs
    : variant === 'detailed' ? detailedActs
    : landingLinks

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
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
                {variant === 'short' ? 'Focused' : 'In-depth'}
              </span>
            )}
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {variant === 'detailed' ? (
              <>
                <div className="relative group">
                  <button className="text-neutral-600 hover:text-primary-600 transition-colors flex items-center gap-1">
                    Acts
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 w-56 hidden group-hover:block z-50">
                    {links.map((link) => (
                      <Link
                        key={link.id}
                        href={link.href}
                        className="block px-4 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-600"
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link href="#summary" className="text-neutral-600 hover:text-primary-600 transition-colors">Summary</Link>
                <Link href="#references" className="text-neutral-600 hover:text-primary-600 transition-colors">References</Link>
              </>
            ) : (
              links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {link.title}
                </Link>
              ))
            )}
            {variant !== 'landing' && (
              <Link
                href={variant === 'short' ? '/detailed' : '/short'}
                className="text-neutral-400 hover:text-primary-600 transition-colors text-sm"
              >
                Switch to {variant === 'short' ? 'In-depth' : 'Focused'} Version
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
                  Switch to {variant === 'short' ? 'In-depth' : 'Focused'} Version
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}