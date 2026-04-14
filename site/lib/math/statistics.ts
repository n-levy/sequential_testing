/**
 * Core statistical functions for sequential testing simulations
 * Based on Howard et al. (2021) confidence sequences and group-sequential methods
 */

export interface ConfidenceInterval {
  lower: number
  upper: number
  width: number
}

export interface SequentialResult {
  ci: ConfidenceInterval
  reject: boolean
  zStatistic: number
  sampleSize: number
}

/**
 * Calculate a standard confidence interval
 */
export function standardCI(
  meanDiff: number,
  se: number,
  alpha: number = 0.05
): ConfidenceInterval {
  const z = 1.96 // For alpha = 0.05
  const lower = meanDiff - z * se
  const upper = meanDiff + z * se
  return {
    lower,
    upper,
    width: upper - lower
  }
}

/**
 * Calculate sequential confidence interval using Howard et al. (2021)
 * Normal mixture boundary approximation
 */
export function sequentialCI(
  meanDiff: number,
  se: number,
  sampleSize: number,
  alpha: number = 0.05,
  tuningParameter?: number
): ConfidenceInterval {
  // Default tuning parameter based on expected sample size
  const nu = tuningParameter || sampleSize * se * se

  // Howard et al. (2021) confidence sequence multiplier
  const logTerm = Math.log(sampleSize + nu) - Math.log(nu * alpha * alpha)
  const multiplier = Math.sqrt((sampleSize + nu) / sampleSize * logTerm)

  const lower = meanDiff - multiplier * se
  const upper = meanDiff + multiplier * se

  return {
    lower,
    upper,
    width: upper - lower
  }
}

/**
 * Bonferroni correction for multiple testing
 */
// Approximation of normal quantile function
function normalQuantile(p: number): number {
  // Abramowitz & Stegun approximation for normal quantile
  if (p <= 0 || p >= 1) return 0

  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637]
  const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833]
  const c = [-2.78718931138, -2.29796479134, 4.85014127135, 2.32121276858]
  const d = [3.54388924762, 1.63706781897]

  const q = p - 0.5
  let r

  if (Math.abs(q) <= 0.42) {
    r = q * q
    return q * (((a[3] * r + a[2]) * r + a[1]) * r + a[0]) /
             (((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1.0
  } else {
    r = p <= 0.5 ? Math.log(-Math.log(p)) : Math.log(-Math.log(1 - p))
    return (q < 0 ? -1 : 1) * (((c[3] * r + c[2]) * r + c[1]) * r + c[0]) /
           ((d[1] * r + d[0]) * r + 1.0)
  }
}

export function bonferroniCI(
  meanDiff: number,
  se: number,
  totalPeeks: number,
  alpha: number = 0.05
): ConfidenceInterval {
  const adjustedAlpha = alpha / totalPeeks
  const z = normalQuantile(1 - adjustedAlpha / 2) // Two-sided

  const lower = meanDiff - z * se
  const upper = meanDiff + z * se

  return {
    lower,
    upper,
    width: upper - lower
  }
}

/**
 * Pocock boundary critical value
 * Approximation for equal-spaced analyses
 */
export function pocockCriticalValue(
  totalPeeks: number,
  alpha: number = 0.05
): number {
  // Simplified approximation - in practice would use multivariate normal
  const approx = 2.4 - 0.3 * Math.log(totalPeeks)
  return Math.max(approx, 2.0) // Conservative bound
}

/**
 * O'Brien-Fleming boundary for a specific peek
 */
export function obfCriticalValue(
  currentPeek: number,
  totalPeeks: number,
  alpha: number = 0.05
): number {
  const fractionComplete = currentPeek / totalPeeks
  return 1.96 / Math.sqrt(fractionComplete) // Approximation
}

/**
 * Simulate the peeking problem
 */
export interface PeekingSimulationResult {
  falsePositiveRate: number
  totalSimulations: number
  significantAtAnyPoint: number[]
}

export function simulatePeeking(
  nSimulations: number = 1000,
  maxSampleSize: number = 1000,
  peekInterval: number = 100,
  alpha: number = 0.05,
  trueEffect: number = 0 // 0 = null hypothesis
): PeekingSimulationResult {
  const peekTimes = []
  for (let t = peekInterval; t <= maxSampleSize; t += peekInterval) {
    peekTimes.push(t)
  }

  let falsePositives = 0
  const significantPoints: number[] = []

  for (let sim = 0; sim < nSimulations; sim++) {
    let everSignificant = false

    for (const n of peekTimes) {
      // Generate data under null (trueEffect = 0)
      const controlData = Array.from({length: n}, () => Math.random() - 0.5)
      const treatmentData = Array.from({length: n}, () => Math.random() - 0.5 + trueEffect)

      const controlMean = controlData.reduce((a, b) => a + b) / n
      const treatmentMean = treatmentData.reduce((a, b) => a + b) / n
      const meanDiff = treatmentMean - controlMean

      const controlVar = controlData.reduce((sum, x) => sum + (x - controlMean) ** 2, 0) / (n - 1)
      const treatmentVar = treatmentData.reduce((sum, x) => sum + (x - treatmentMean) ** 2, 0) / (n - 1)
      const se = Math.sqrt(controlVar / n + treatmentVar / n)

      const ci = standardCI(meanDiff, se, alpha)

      if (ci.lower > 0 || ci.upper < 0) {
        everSignificant = true
        significantPoints.push(n)
        break
      }
    }

    if (everSignificant && trueEffect === 0) {
      falsePositives++
    }
  }

  return {
    falsePositiveRate: falsePositives / nSimulations,
    totalSimulations: nSimulations,
    significantAtAnyPoint: significantPoints
  }
}

/**
 * Calculate sample size needed for desired power
 */
export function requiredSampleSize(
  effectSize: number,
  power: number = 0.8,
  alpha: number = 0.05,
  baselineMean: number = 0
): number {
  // Simplified calculation for two-sample t-test
  const zAlpha = 1.96
  const zBeta = 0.84 // For 80% power

  const numerator = (zAlpha + zBeta) ** 2
  const denominator = effectSize ** 2

  return Math.ceil(numerator / denominator)
}