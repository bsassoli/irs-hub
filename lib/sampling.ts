/**
 * Statistical utilities for sampling and CLT demonstrations
 */

/**
 * Calcola media di un array
 * (Può riutilizzare da confidence-intervals.ts se preferisci)
 */
export function mean(data: number[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, x) => sum + x, 0) / data.length
}

/**
 * Calcola varianza campionaria
 */
export function variance(data: number[]): number {
  if (data.length === 0) return 0
  const mu = mean(data)
  return data.reduce((sum, x) => sum + Math.pow(x - mu, 2), 0) / data.length
}

/**
 * Calcola deviazione standard campionaria
 */
export function standardDeviation(data: number[]): number {
  return Math.sqrt(variance(data))
}

/**
 * Calcola skewness (asimmetria)
 * Skewness = 0 per distribuzione simmetrica
 * Skewness > 0 coda a destra
 * Skewness < 0 coda a sinistra
 */
export function skewness(data: number[]): number {
  const n = data.length
  if (n < 3) return 0

  const mu = mean(data)
  const sigma = standardDeviation(data)

  if (sigma === 0) return 0

  const m3 = data.reduce((sum, x) => sum + Math.pow((x - mu) / sigma, 3), 0) / n

  return m3
}

/**
 * Calcola excess kurtosis (curtosi in eccesso)
 * Kurtosis = 0 per distribuzione normale
 * Kurtosis > 0 code pesanti (leptokurtica)
 * Kurtosis < 0 code leggere (platikurtica)
 */
export function excessKurtosis(data: number[]): number {
  const n = data.length
  if (n < 4) return 0

  const mu = mean(data)
  const sigma = standardDeviation(data)

  if (sigma === 0) return 0

  const m4 = data.reduce((sum, x) => sum + Math.pow((x - mu) / sigma, 4), 0) / n

  // Excess kurtosis (normale = 0)
  return m4 - 3
}

/**
 * Valuta se una distribuzione appare normale
 * Basato su skewness e kurtosis
 */
export function assessNormality(data: number[]): {
  isNormal: boolean
  skewness: number
  kurtosis: number
  message: string
} {
  const skew = skewness(data)
  const kurt = excessKurtosis(data)

  // Soglie approssimative per normalità
  const isNormal = Math.abs(skew) < 0.5 && Math.abs(kurt) < 1

  let message = ''
  if (isNormal) {
    message = 'La distribuzione appare approssimativamente normale'
  } else if (Math.abs(skew) >= 0.5) {
    message = skew > 0 ? 'Distribuzione asimmetrica a destra' : 'Distribuzione asimmetrica a sinistra'
  } else if (Math.abs(kurt) >= 1) {
    message = kurt > 0 ? 'Code più pesanti della normale' : 'Code più leggere della normale'
  }

  return {
    isNormal,
    skewness: skew,
    kurtosis: kurt,
    message
  }
}

/**
 * Calcola errore standard della media
 * SEM = σ / √n
 */
export function standardError(sigma: number, n: number): number {
  return sigma / Math.sqrt(n)
}

/**
 * Calcola quartili e mediana
 */
export function quartiles(data: number[]): {
  q1: number
  median: number
  q3: number
  iqr: number
} {
  if (data.length === 0) {
    return { q1: 0, median: 0, q3: 0, iqr: 0 }
  }

  const sorted = [...data].sort((a, b) => a - b)
  const n = sorted.length

  const getPercentile = (p: number) => {
    const index = (p / 100) * (n - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower

    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }

  const q1 = getPercentile(25)
  const median = getPercentile(50)
  const q3 = getPercentile(75)
  const iqr = q3 - q1

  return { q1, median, q3, iqr }
}

/**
 * Genera statistiche descrittive complete
 */
export function descriptiveStats(data: number[]): {
  n: number
  mean: number
  median: number
  std: number
  min: number
  max: number
  skewness: number
  kurtosis: number
} {
  if (data.length === 0) {
    return {
      n: 0,
      mean: 0,
      median: 0,
      std: 0,
      min: 0,
      max: 0,
      skewness: 0,
      kurtosis: 0
    }
  }

  const { median } = quartiles(data)

  return {
    n: data.length,
    mean: mean(data),
    median,
    std: standardDeviation(data),
    min: Math.min(...data),
    max: Math.max(...data),
    skewness: skewness(data),
    kurtosis: excessKurtosis(data)
  }
}
