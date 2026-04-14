'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SimulationControls {
  nSimulations: number
  maxSampleSize: number
  peekInterval: number
  alpha: number
}

export function PeekingSimulation() {
  const [controls, setControls] = useState<SimulationControls>({
    nSimulations: 1000,
    maxSampleSize: 1000,
    peekInterval: 100,
    alpha: 0.05,
  })

  const [isRunning, setIsRunning] = useState(false)

  const runSimulation = async () => {
    setIsRunning(true)
    // TODO: Add simulation logic
    setTimeout(() => setIsRunning(false), 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulation Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Number of Simulations
              </label>
              <input
                type="number"
                value={controls.nSimulations}
                onChange={(e) => setControls(prev => ({ ...prev, nSimulations: parseInt(e.target.value) || 1000 }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Max Sample Size
              </label>
              <input
                type="number"
                value={controls.maxSampleSize}
                onChange={(e) => setControls(prev => ({ ...prev, maxSampleSize: parseInt(e.target.value) || 1000 }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                min="100"
                max="5000"
              />
            </div>
          </div>

          <Button
            onClick={runSimulation}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Simulation...' : 'Run Simulation'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}