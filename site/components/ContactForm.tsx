'use client'

import { useState, FormEvent } from 'react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdqbneg'

/**
 * Contact form that submits to Formspree. The endpoint owner (Formspree
 * account) receives the messages by email and can review them in the
 * Formspree dashboard.
 */
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    const form = e.currentTarget
    const data = new FormData(form)
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setStatus('sent')
        form.reset()
      } else {
        const json = await res.json().catch(() => ({}))
        setStatus('error')
        setErrorMsg(json?.error ?? 'Submission failed. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <section id="contact" className="py-12 border-t border-neutral-200 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Contact us</h2>
        <p className="text-sm text-neutral-700 mb-6">
          Found an error? Have a suggestion for improvement? Please let us know!
        </p>

        {status === 'sent' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            Thank you — your message has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-neutral-700 mb-1">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-neutral-700 mb-1">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
