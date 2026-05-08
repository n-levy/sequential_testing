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
