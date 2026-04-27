'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavigationProps {
  variant?: 'landing' | 'focused' | 'in-depth'
}

export function Navigation({ variant = 'landing' }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const focusedActs = [
    { id: 'act1', title: 'The Problem', href: '/focused#act1' },
    { id: 'act2', title: 'EPPO Solution', href: '/focused#act2' },
    { id: 'act3', title: 'DIY Implementation', href: '/focused#act3' },
  ]

  const inDepthActs = [
    { id: 'act-1', title: 'Act 1: Peeking', href: '/in-depth#act-1' },
    { id: 'act-2', title: 'Act 2: Random Walk', href: '/in-depth#act-2' },
    { id: 'act-3', title: 'Act 3: Martingale', href: '/in-depth#act-3' },
    { id: 'act-4', title: 'Act 4: Likelihood', href: '/in-depth#act-4' },
    { id: 'act-5', title: 'Act 5: LR = Martingale', href: '/in-depth#act-5' },
    { id: 'act-6', title: 'Act 6: Ville', href: '/in-depth#act-6' },
    { id: 'act-7', title: 'Act 7: SPRT', href: '/in-depth#act-7' },
    { id: 'act-8', title: 'Act 8: mSPRT', href: '/in-depth#act-8' },
    { id: 'act-9', title: 'Act 9: Conf. Sequences', href: '/in-depth#act-9' },
    { id: 'act-10', title: 'Act 10: Eppo Problem', href: '/in-depth#act-10' },
    { id: 'act-11', title: 'Act 11: Pipeline', href: '/in-depth#act-11' },
    { id: 'act-12', title: 'Act 12: CUPED', href: '/in-depth#act-12' },
    { id: 'act-13', title: 'Act 13: Sequential CI', href: '/in-depth#act-13' },
    { id: 'act-14', title: 'Act 14: DIY', href: '/in-depth#act-14' },
  ]

  const landingLinks = [
    { id: 'focused', title: 'Focused', href: '/focused' },
    { id: 'in-depth', title: 'In-depth', href: '/in-depth' },
  ]

  const links = variant === 'focused' ? focusedActs
    : variant === 'in-depth' ? inDepthActs
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
                variant === 'focused'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {variant === 'focused' ? 'Focused' : 'In-depth'}
              </span>
            )}
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {variant === 'in-depth' ? (
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
                href={variant === 'focused' ? '/in-depth' : '/focused'}
                className="text-neutral-400 hover:text-primary-600 transition-colors text-sm"
              >
                Switch to {variant === 'focused' ? 'In-depth' : 'Focused'} Version
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-600 hover:text-primary-600 p-2 -mr-2"
              aria-label="Toggle navigation menu"
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
              {variant !== 'landing' && (
                <>
                  <Link
                    href="/"
                    className="block px-3 py-2 text-neutral-600 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href={variant === 'focused' ? '/focused#intro' : '/in-depth#intro'}
                    className="block px-3 py-2 text-neutral-600 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Introduction
                  </Link>
                </>
              )}
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
                  href={variant === 'focused' ? '/in-depth' : '/focused'}
                  className="block px-3 py-2 text-neutral-400 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Switch to {variant === 'focused' ? 'In-depth' : 'Focused'} Version
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}