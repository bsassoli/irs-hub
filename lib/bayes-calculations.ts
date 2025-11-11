/**
 * Bayesian probability calculation utilities for the Bayes Corvi app
 */

export interface ProbabilitySnapshot {
  h1: number // All crows are black
  h2: number // Half of crows are black
  h3: number // No crows are black
  ce: number // P(e) - probability of observing a black crow
}

/**
 * Update probabilities after observing one black crow
 * @param hypotheses Array of probabilities [P(e|h1), P(e|h2), P(e|h3)] = [1.0, 0.5, 0.0]
 * @param currentProbs Current probabilities [P(h1), P(h2), P(h3)]
 * @returns Updated probabilities and C(e)
 */
export function updateProbabilitiesOnce(
  hypotheses: [number, number, number],
  currentProbs: [number, number, number]
): { probabilities: [number, number, number]; ce: number } {
  // Calculate C(e) using total probability theorem
  const ce = hypotheses.reduce((sum, h, i) => sum + h * currentProbs[i], 0)

  // Apply Bayes' theorem: P(h|e) = P(e|h) * P(h) / P(e)
  const probabilities = hypotheses.map((h, i) =>
    ce === 0 ? 0 : (h * currentProbs[i]) / ce
  ) as [number, number, number]

  return { probabilities, ce }
}

/**
 * Calculate probability evolution over multiple observations
 * @param numObservations Number of black crows observed
 * @returns Array of probability snapshots at each observation
 */
export function calculateProbabilityHistory(
  numObservations: number
): ProbabilitySnapshot[] {
  const hypotheses: [number, number, number] = [1.0, 0.5, 0.0]
  let currentProbs: [number, number, number] = [1/3, 1/3, 1/3]

  // Initial state
  const initialCe = hypotheses.reduce((sum, h, i) => sum + h * currentProbs[i], 0)
  const history: ProbabilitySnapshot[] = [
    { h1: currentProbs[0], h2: currentProbs[1], h3: currentProbs[2], ce: initialCe }
  ]

  // Update for each observation
  for (let i = 0; i < numObservations; i++) {
    const { probabilities, ce } = updateProbabilitiesOnce(hypotheses, currentProbs)
    currentProbs = probabilities
    history.push({ h1: probabilities[0], h2: probabilities[1], h3: probabilities[2], ce })
  }

  return history
}

/**
 * Calculate the probability that the next crow will be black
 * @param currentProbs Current probabilities [P(h1), P(h2), P(h3)]
 * @returns Probability that next observation will be a black crow
 */
export function calculateNextRavenBlackProb(
  currentProbs: [number, number, number]
): number {
  const hypotheses: [number, number, number] = [1.0, 0.5, 0.0]
  return hypotheses.reduce((sum, h, i) => sum + h * currentProbs[i], 0)
}
