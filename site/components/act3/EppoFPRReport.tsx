import { useEffect, useState } from 'react'

// Simulate 500 A/A tests using the sequential CI and report the false positive rate
export function EppoFPRReport({ n = 500, alpha = 0.05, seed = 1234 }: { n?: number; alpha?: number; seed?: number }) {
  const [fpr, setFpr] = useState<number | null>(null)
  useEffect(() => {
    // Use the same mixture CI as in CoinFlipMeanSim
    function sequentialHalfWidth(k: number, se: number, alpha: number, nu: number) {
      return se * Math.sqrt(((k + nu) / k) * Math.log((k + nu) / (nu * alpha)))
    }
    function mulberry32(seed: number) {
      return function () {
        let t = (seed += 0x6d2b79f5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }
    let fpCount = 0
    for (let s = 0; s < 500; s++) {
      const rand = mulberry32(seed + s)
      let sum = 0
      let crossed = false
      for (let i = 1; i <= n && !crossed; i++) {
        sum += rand() < 0.5 ? 1 : 0
        const m = sum / i
        const se = Math.sqrt(Math.max(m * (1 - m), 1e-4) / i)
        const hw = sequentialHalfWidth(i, se, alpha, n)
        // Test if 0 is outside the CI
        if (Math.abs(m - 0.5) > hw) crossed = true
      }
      if (crossed) fpCount++
    }
    setFpr(fpCount / 500)
  }, [n, alpha, seed])
  if (fpr == null) return <span>Computing…</span>
  return <span>{(fpr * 100).toFixed(1)}%</span>
}
