/**
 * Statistical utilities for confidence interval calculations
 * Used in the Intervalli di Confidenza Explorer app
 */

/**
 * Generates a sample from a normal distribution using Box-Muller transform
 * @param mu - Population mean
 * @param sigma - Population standard deviation
 * @param n - Sample size
 * @returns Array of n samples from N(mu, sigma^2)
 */
export function sampleNormal(mu: number, sigma: number, n: number): number[] {
  const samples: number[] = []

  for (let i = 0; i < n; i++) {
    // Box-Muller transform for generating normal random variables
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    samples.push(mu + sigma * z)
  }

  return samples
}

/**
 * Calculates the mean of an array of numbers
 * @param data - Array of numbers
 * @returns Sample mean
 */
export function mean(data: number[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, x) => sum + x, 0) / data.length
}

/**
 * Gets the z-value for a given confidence level
 * @param confidenceLevel - Confidence level as a percentage (e.g., 95 for 95%)
 * @returns Corresponding z-value from standard normal distribution
 */
export function getZValue(confidenceLevel: number): number {
  const zValues: Record<number, number> = {
    80: 1.282,
    85: 1.440,
    90: 1.645,
    95: 1.960,
    99: 2.576,
    99.5: 2.807,
    99.9: 3.291
  }

  return zValues[confidenceLevel] || 1.960 // Default to 95% if not found
}

/**
 * Calculates a confidence interval for the population mean
 * Assumes known population standard deviation (sigma)
 * @param sampleMean - Mean of the sample
 * @param sigma - Known population standard deviation
 * @param n - Sample size
 * @param confidenceLevel - Confidence level as percentage
 * @returns Tuple [lowerBound, upperBound]
 */
export function calculateCI(
  sampleMean: number,
  sigma: number,
  n: number,
  confidenceLevel: number
): [number, number] {
  const z = getZValue(confidenceLevel)
  const standardError = sigma / Math.sqrt(n)
  const marginOfError = z * standardError

  return [
    sampleMean - marginOfError,
    sampleMean + marginOfError
  ]
}

/**
 * Determines if a confidence interval contains the true parameter
 * @param interval - Tuple [lower, upper] bounds of the interval
 * @param trueParameter - True population parameter value
 * @returns true if parameter is in interval, false otherwise
 */
export function capturesParameter(
  interval: [number, number],
  trueParameter: number
): boolean {
  return interval[0] <= trueParameter && trueParameter <= interval[1]
}

/**
 * Simulates multiple researchers independently sampling and constructing CIs
 * This is the core function for demonstrating the frequentist interpretation
 * @param mu - True population mean
 * @param sigma - True population standard deviation
 * @param n - Sample size per researcher
 * @param confidenceLevel - Confidence level as percentage
 * @param numResearchers - Number of independent samples to take
 * @returns Array of results with interval, capture status, and sample mean
 */
export function simulateMultipleSampling(
  mu: number,
  sigma: number,
  n: number,
  confidenceLevel: number,
  numResearchers: number
): Array<{
  interval: [number, number]
  captured: boolean
  sampleMean: number
}> {
  const results = []

  for (let i = 0; i < numResearchers; i++) {
    // Each researcher takes their own independent sample
    const sample = sampleNormal(mu, sigma, n)
    const sampleMean = mean(sample)

    // Calculate confidence interval from their sample
    const interval = calculateCI(sampleMean, sigma, n, confidenceLevel)

    // Check if this interval captured the true parameter
    const captured = capturesParameter(interval, mu)

    results.push({
      interval,
      captured,
      sampleMean
    })
  }

  return results
}

/**
 * Calculates the margin of error for a confidence interval
 * @param sigma - Population standard deviation
 * @param n - Sample size
 * @param confidenceLevel - Confidence level as percentage
 * @returns Margin of error (half-width of CI)
 */
export function calculateMarginOfError(
  sigma: number,
  n: number,
  confidenceLevel: number
): number {
  const z = getZValue(confidenceLevel)
  const standardError = sigma / Math.sqrt(n)
  return z * standardError
}

/**
 * Formats a number consistently for display (Italian locale)
 * Prevents hydration mismatches between server and client
 * @param num - Number to format
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted string
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}
