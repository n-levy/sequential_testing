'use client'

import { useEffect, useRef } from 'react'

/**
 * Giscus-powered comments. Uses GitHub Discussions on the
 * `n-levy/sequential_testing` repository for storage and moderation.
 *
 * Setup checklist:
 *   1. Enable Discussions on the GitHub repo.
 *   2. Install the Giscus app: https://github.com/apps/giscus
 *   3. Visit https://giscus.app/ to generate a category, then update
 *      the `data-category` and `data-category-id` values below.
 */
export function Comments() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.querySelector('iframe.giscus-frame')) return
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', 'n-levy/sequential_testing')
    // Replace these IDs after generating them at https://giscus.app/
    script.setAttribute('data-repo-id', 'R_kgDOPLACEHOLDER')
    script.setAttribute('data-category', 'Comments')
    script.setAttribute('data-category-id', 'DIC_kwDOPLACEHOLDER')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-loading', 'lazy')
    ref.current.appendChild(script)
  }, [])

  return (
    <section id="comments" className="py-12 border-t border-neutral-200 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Comments</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Sign in with GitHub to leave a comment. When commenting for the first time,
          please add your title and institution / workplace at the top of your message.
          Comments are moderated and appear after approval.
        </p>
        <div ref={ref} />
      </div>
    </section>
  )
}
