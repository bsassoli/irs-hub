/**
 * Distribution generators for Central Limit Theorem app
 * Provides various non-normal distributions to demonstrate CLT
 */

/**
 * Helper: genera numero da distribuzione normale N(mu, sigma)
 * Box-Muller transform (riutilizzato da confidence-intervals.ts)
 */
function normalRandom(mu: number, sigma: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mu + sigma * z
}

/**
 * Distribution interface
 */
export interface Distribution {
  id: string
  name: string
  emoji: string
  description: string
  mu: number       // Media vera popolazione
  sigma: number    // Deviazione standard vera
  generate: (n: number) => number[]
  color: string    // Per grafico
}

/**
 * Available distributions for CLT demonstration
 */
export const distributions: Distribution[] = [
  {
    id: 'uniform',
    name: 'Uniforme',
    emoji: '🎲',
    description: 'Dado a 6 facce: tutti gli esiti equiprobabili',
    mu: 3.5,
    sigma: 1.71,
    generate: (n: number) => {
      return Array(n).fill(0).map(() => Math.floor(Math.random() * 6) + 1)
    },
    color: 'hsl(210, 100%, 50%)'  // Blue
  },
  {
    id: 'bimodal',
    name: 'Bimodale',
    emoji: '⛰️',
    description: 'Due gruppi distinti (es. altezze bambini + adulti)',
    mu: 145,
    sigma: 25,
    generate: (n: number) => {
      return Array(n).fill(0).map(() => {
        // 50% da N(120, 10), 50% da N(170, 10)
        if (Math.random() < 0.5) {
          return normalRandom(120, 10)
        } else {
          return normalRandom(170, 10)
        }
      })
    },
    color: 'hsl(270, 100%, 50%)'  // Purple
  },
  {
    id: 'exponential',
    name: 'Esponenziale',
    emoji: '📉',
    description: 'Tempi di attesa: coda lunga a destra',
    mu: 5,
    sigma: 5,
    generate: (n: number) => {
      return Array(n).fill(0).map(() => -Math.log(Math.random()) * 5)
    },
    color: 'hsl(120, 100%, 40%)'  // Green
  },
  {
    id: 'skewed',
    name: 'Fortemente Asimmetrica',
    emoji: '💰',
    description: 'Distribuzione redditi: pochi ricchissimi, molti poveri',
    mu: 35000,
    sigma: 30000,
    generate: (n: number) => {
      // Log-normale
      return Array(n).fill(0).map(() => {
        const logValue = normalRandom(10.3, 0.7)
        return Math.exp(logValue)
      })
    },
    color: 'hsl(30, 100%, 50%)'  // Orange
  }
]

/**
 * Get distribution by ID
 */
export function getDistribution(id: string): Distribution {
  const dist = distributions.find(d => d.id === id)
  if (!dist) {
    throw new Error(`Distribution ${id} not found`)
  }
  return dist
}

/**
 * Crea istogramma da array di dati
 * @param data - Array di valori
 * @param numBins - Numero di bin (default 30)
 * @returns Array di oggetti con bin info
 */
export function createHistogram(
  data: number[],
  numBins: number = 30
): Array<{ bin: string; count: number; binStart: number; binEnd: number }> {
  if (data.length === 0) {
    return []
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const binWidth = (max - min) / numBins

  const bins = Array(numBins)
    .fill(0)
    .map((_, i) => ({
      bin: '',
      count: 0,
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth
    }))

  // Conta valori in ogni bin
  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1)
    if (binIndex >= 0 && binIndex < numBins) {
      bins[binIndex].count++
    }
  })

  // Formatta label bins
  bins.forEach(bin => {
    bin.bin = bin.binStart.toFixed(1)
  })

  return bins
}

/**
 * Genera curva normale teorica per overlay su grafico
 * @param mu - Media
 * @param sigma - Deviazione standard
 * @param numPoints - Numero di punti sulla curva
 * @param scaleFactor - Fattore di scala per adattare Y ai dati
 * @returns Array di punti {x, y}
 */
export function normalCurve(
  mu: number,
  sigma: number,
  numPoints: number = 100,
  scaleFactor: number = 1
): Array<{ x: number; y: number }> {
  const points = []
  const start = mu - 4 * sigma
  const end = mu + 4 * sigma
  const step = (end - start) / numPoints

  for (let i = 0; i <= numPoints; i++) {
    const x = start + i * step
    // PDF normale
    const y =
      (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2))
    points.push({ x, y: y * scaleFactor })
  }

  return points
}

/**
 * Genera dati per istogramma con overlay di curva normale
 * Combina istogramma empirico con curva teorica
 */
export function createHistogramWithNormal(
  data: number[],
  mu: number,
  sigma: number,
  numBins: number = 30
): Array<{ bin: string; count: number; theoretical: number; x: number }> {
  if (data.length === 0) {
    return []
  }

  const histogram = createHistogram(data, numBins)
  const binWidth = histogram[0] ? histogram[0].binEnd - histogram[0].binStart : 1

  // Calcola scala per curva teorica
  // Vogliamo che l'area sotto la curva teorica corrisponda al numero totale di osservazioni
  const totalCount = data.length
  const scaleFactor = totalCount * binWidth

  // Aggiungi curva teorica per ogni bin
  return histogram.map(bin => {
    const x = (bin.binStart + bin.binEnd) / 2
    // PDF normale scalata
    const theoreticalPDF =
      (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2))
    const theoretical = theoreticalPDF * scaleFactor

    return {
      bin: bin.bin,
      count: bin.count,
      theoretical,
      x
    }
  })
}

/**
 * Genera popolazione di esempio per visualizzazione iniziale
 * @param distribution - Distribuzione da cui campionare
 * @param size - Dimensione popolazione (default 10000)
 */
export function generatePopulationSample(distribution: Distribution, size: number = 10000): number[] {
  return distribution.generate(size)
}
