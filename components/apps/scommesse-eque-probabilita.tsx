"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function BettingCalculator() {
  // Section 1: Fair Bet Calculator
  const [probability, setProbability] = useState(50)
  const [betAmount, setBetAmount] = useState(100)
  const [fairWin, setFairWin] = useState(0)
  const [expectedValue, setExpectedValue] = useState(0)

  // Section 2: Implicit Probability
  const [betStake, setBetStake] = useState(30)
  const [betWin, setBetWin] = useState(70)
  const [implicitProb, setImplicitProb] = useState<number | null>(null)

  // Section 3: Simulation
  const [realProb, setRealProb] = useState(60)
  const [subjProb, setSubjProb] = useState(50)
  const [numSims, setNumSims] = useState(1000)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simResults, setSimResults] = useState<{
    totalGames: number
    wins: number
    totalProfit: number
    avgProfit: number
    outcomes: boolean[]
  } | null>(null)

  // Calculate fair bet whenever probability or amount changes
  useEffect(() => {
    const prob = probability / 100
    if (prob > 0 && prob < 1 && betAmount > 0) {
      const win = ((1 - prob) * betAmount) / prob
      const ev = prob * win - (1 - prob) * betAmount
      setFairWin(win)
      setExpectedValue(ev)
    }
  }, [probability, betAmount])

  // Calculate implicit probability
  const calculateImplicitProbability = () => {
    if (betStake > 0 && betWin > 0) {
      const prob = betStake / (betStake + betWin)
      setImplicitProb(prob)
    }
  }

  // Run simulation
  const runSimulation = async () => {
    setIsSimulating(true)
    setSimResults(null)

    const realProbValue = realProb / 100
    const subjProbValue = subjProb / 100
    const betAmountSim = 10
    const fairWinSim = ((1 - subjProbValue) * betAmountSim) / subjProbValue

    let wins = 0
    let totalProfit = 0
    const outcomes: boolean[] = []

    // Simulate in batches for better UX
    const batchSize = 50
    for (let batch = 0; batch < numSims / batchSize; batch++) {
      await new Promise(resolve => setTimeout(resolve, 50))

      for (let i = 0; i < batchSize; i++) {
        const won = Math.random() < realProbValue
        outcomes.push(won)

        if (won) {
          wins++
          totalProfit += fairWinSim
        } else {
          totalProfit -= betAmountSim
        }
      }

      // Update progress
      setSimResults({
        totalGames: outcomes.length,
        wins,
        totalProfit,
        avgProfit: totalProfit / outcomes.length,
        outcomes: [...outcomes],
      })
    }

    setIsSimulating(false)
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Fair Bet Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Calcolatore di Scommessa Equa</CardTitle>
          <CardDescription>
            Inserisci la tua probabilità soggettiva e scopri quanto dovresti ricevere per una scommessa equa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Probabilità</label>
              <Badge variant="secondary" className="text-lg">
                {probability}%
              </Badge>
            </div>
            <Slider
              value={[probability]}
              onValueChange={(value) => setProbability(value[0])}
              min={1}
              max={99}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Importo scommesso (€)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <div className="text-center">
              <div className="text-sm font-medium">Scommessa Equa</div>
              <div className="mt-2 text-2xl font-bold">
                Scommetti €{betAmount} → Ricevi €{fairWin.toFixed(2)} se vinci
              </div>
              <div className="mt-2 text-sm opacity-90">
                Valore atteso: €{expectedValue.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Implicit Probability */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Scopri la Probabilità Soggettiva</CardTitle>
          <CardDescription>
            Se accetti una certa scommessa, qual è la tua probabilità soggettiva implicita?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scommetti (€)</label>
            <Input
              type="number"
              value={betStake}
              onChange={(e) => setBetStake(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ricevi se vinci (€)</label>
            <Input
              type="number"
              value={betWin}
              onChange={(e) => setBetWin(Number(e.target.value))}
              min={1}
            />
          </div>

          <Button onClick={calculateImplicitProbability} className="w-full">
            Calcola Probabilità Implicita
          </Button>

          {implicitProb !== null && (
            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  Probabilità Soggettiva Implicita: {(implicitProb * 100).toFixed(1)}%
                </div>
                <div className="mt-2 text-sm opacity-90">
                  Se accetti questa scommessa, implicitamente credi che l'evento abbia{" "}
                  {(implicitProb * 100).toFixed(1)}% di probabilità
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>🎮 Simulazione Interattiva</CardTitle>
          <CardDescription>
            Simula migliaia di scommesse per vedere come la teoria si applica nella pratica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Probabilità reale</label>
              <Badge variant="secondary">{realProb}%</Badge>
            </div>
            <Slider
              value={[realProb]}
              onValueChange={(value) => setRealProb(value[0])}
              min={1}
              max={99}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tua probabilità soggettiva</label>
              <Badge variant="secondary">{subjProb}%</Badge>
            </div>
            <Slider
              value={[subjProb]}
              onValueChange={(value) => setSubjProb(value[0])}
              min={1}
              max={99}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Numero di simulazioni</label>
            <Input
              type="number"
              value={numSims}
              onChange={(e) => setNumSims(Number(e.target.value))}
              min={100}
              max={10000}
              step={100}
            />
          </div>

          <Button
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full"
          >
            {isSimulating ? "⏳ Simulazione in corso..." : "🚀 Avvia Simulazione"}
          </Button>

          {simResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white">
                  <div className="text-2xl font-bold">{simResults.totalGames}</div>
                  <div className="text-sm">Partite Totali</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white">
                  <div className="text-2xl font-bold">{simResults.wins}</div>
                  <div className="text-sm">Vittorie</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white">
                  <div className="text-2xl font-bold">€{simResults.totalProfit.toFixed(2)}</div>
                  <div className="text-sm">Profitto Totale</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white">
                  <div className="text-2xl font-bold">€{simResults.avgProfit.toFixed(2)}</div>
                  <div className="text-sm">Profitto Medio</div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 text-sm font-medium">Risultati:</div>
                <div className="flex flex-wrap gap-1">
                  {simResults.outcomes.slice(0, 500).map((won, i) => (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-full ${won ? "bg-green-500" : "bg-red-500"
                        }`}
                      title={won ? "Vittoria" : "Sconfitta"}
                    />
                  ))}
                  {simResults.outcomes.length > 500 && (
                    <span className="text-sm text-muted-foreground">
                      ... e altri {simResults.outcomes.length - 500}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    ✅ Simulazione Completata!
                  </div>
                  <div className="mt-2 text-sm">
                    Tasso di vittoria effettivo: {((simResults.wins / simResults.totalGames) * 100).toFixed(1)}%
                    {" "}(atteso: {realProb}%)
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}