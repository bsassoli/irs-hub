/**
 * Custom hook for managing Central Limit Theorem simulation
 * Handles sampling, animation, and state management
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Distribution } from '@/lib/distributions'
import { mean } from '@/lib/sampling'

interface UseCLTSimulationProps {
  distribution: Distribution
  sampleSize: number
  speed: number // milliseconds between samples
}

interface UseCLTSimulationReturn {
  meansList: number[]
  currentSample: number[]
  currentMean: number | null
  isRunning: boolean
  progress: number // 0-100
  start: () => void
  pause: () => void
  reset: () => void
  skipTo1000: () => void
}

const MAX_SAMPLES = 1000

export function useCLTSimulation({
  distribution,
  sampleSize,
  speed
}: UseCLTSimulationProps): UseCLTSimulationReturn {
  const [meansList, setMeansList] = useState<number[]>([])
  const [currentSample, setCurrentSample] = useState<number[]>([])
  const [currentMean, setCurrentMean] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRunningRef = useRef(isRunning)

  // Keep ref in sync with state
  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const runSample = () => {
      // Check if we've reached the limit
      if (meansList.length >= MAX_SAMPLES) {
        setIsRunning(false)
        return
      }

      // Estrai campione dalla popolazione
      const sample = distribution.generate(sampleSize)
      setCurrentSample(sample)

      // Calcola media del campione
      const sampleMean = mean(sample)
      setCurrentMean(sampleMean)

      // Aggiungi alla lista delle medie
      setMeansList(prev => {
        const updated = [...prev, sampleMean]

        // Auto-stop at limit
        if (updated.length >= MAX_SAMPLES) {
          setIsRunning(false)
        }

        return updated
      })
    }

    // Run first sample immediately
    runSample()

    // Then set up interval for subsequent samples
    intervalRef.current = setInterval(runSample, speed)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, distribution, sampleSize, speed]) // Re-run when params change

  // Calculate progress percentage
  const progress = (meansList.length / MAX_SAMPLES) * 100

  // Control functions
  const start = useCallback(() => {
    if (meansList.length < MAX_SAMPLES) {
      setIsRunning(true)
    }
  }, [meansList.length])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setMeansList([])
    setCurrentSample([])
    setCurrentMean(null)
  }, [])

  const skipTo1000 = useCallback(() => {
    setIsRunning(false)

    // Generate 1000 samples instantly
    const allMeans: number[] = []
    for (let i = 0; i < MAX_SAMPLES; i++) {
      const sample = distribution.generate(sampleSize)
      allMeans.push(mean(sample))
    }

    setMeansList(allMeans)
    setCurrentSample([])
    setCurrentMean(null)
  }, [distribution, sampleSize])

  return {
    meansList,
    currentSample,
    currentMean,
    isRunning,
    progress,
    start,
    pause,
    reset,
    skipTo1000
  }
}
