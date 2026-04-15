'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SidebarItem {
  id: string
  label: string
}

interface ActSidebarProps {
  items: SidebarItem[]
}

export function ActSidebar({ items }: ActSidebarProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const observableItems = items.filter(item => !item.id.startsWith('_'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    const targets = observableItems
      .map(item => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    if (id === '_home') {
      router.push('/')
      setOpen(false)
      return
    }
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setOpen(false)
    }
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 lg:hidden bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] pb-4 overflow-y-auto
          w-56 bg-white border-r border-neutral-200 shadow-sm
          transition-transform duration-200
          lg:translate-x-0
          ${open ? 'translate-x-0 z-50' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="px-2 py-4">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={`
                    w-full text-left px-3 py-1.5 rounded text-sm transition-colors
                    ${activeId === item.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }
                  `}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
