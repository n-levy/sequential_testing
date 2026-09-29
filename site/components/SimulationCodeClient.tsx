'use client'

import { useState } from 'react'

interface SimFile { filename: string; description: string; code: string }

export function SimulationCodeClient({ files }: { files: SimFile[] }) {
  const [show, setShow] = useState(false)

  return (
    <div id="simulation-code" className="max-w-3xl mx-auto px-4 mb-8">
      <h2 className="text-2xl font-bold mb-2">Simulation source code</h2>
      <p className="text-neutral-700 mb-4">
        Each simulation on this page is a self-contained React/TypeScript component using D3.js for rendering.
        The standalone Python scripts that generate the figures and numbers in the companion guideline document
        are maintained separately at{' '}
        <a
          href="https://github.com/nir-levy_zse/sequential_testing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-900"
        >
          github.com/nir-levy_zse/sequential_testing
        </a>.
      </p>
      <p className="text-sm text-neutral-600 mb-4 italic">
        The description of Eppo&apos;s sequential CI follows Schmit &amp; Miller (2022); it has not been verified
        against Eppo&apos;s current code, which may differ in details (for example relative lift and regression
        adjustment). The guarantee also relies on an estimated variance and can be poor in very small samples or
        for heavy-tailed KPIs such as revenue.
      </p>
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200 mb-4"
      >
        {show ? 'Hide the code of all simulations' : 'Show the code of all simulations'}
      </button>
      {show && (
        <div className="space-y-8">
          {files.map(f => (
            <div key={f.filename}>
              <h4 className="font-semibold text-neutral-900 mb-1">{f.filename}</h4>
              <p className="text-sm text-neutral-600 mb-2">{f.description}</p>
              <pre className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre">
                {f.code}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
