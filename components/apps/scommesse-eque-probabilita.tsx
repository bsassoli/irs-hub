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
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Probabilità</label>
              <span className="text-3xl font-bold tabular-nums">{probability}%</span>
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

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Importo scommesso (€)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
              className="h-12 text-lg"
            />
          </div>

          <div className="relative overflow-hidden rounded-lg border border-[#CCCCCC] bg-white p-8 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-[#CCCCCC] pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-[#003366]">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-serif text-lg font-semibold uppercase tracking-wider text-[#003366]">Scommessa Equa</span>
              </div>
              <div className="space-y-3">
                <div className="font-serif text-4xl font-normal leading-tight text-black">
                  Scommetti €{betAmount} → Ricevi €{fairWin.toFixed(2)}
                </div>
                <div className="text-base text-[#666666]">se vinci</div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="rounded border border-[#CCCCCC] bg-[#F5F5F5] px-4 py-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-[#666666]">Valore atteso</span>
                  <div className="mt-1 text-xl font-bold tabular-nums text-[#003366]">€{expectedValue.toFixed(2)}</div>
                </div>
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
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Scommetti (€)</label>
              <Input
                type="number"
                value={betStake}
                onChange={(e) => setBetStake(Number(e.target.value))}
                min={1}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Ricevi se vinci (€)</label>
              <Input
                type="number"
                value={betWin}
                onChange={(e) => setBetWin(Number(e.target.value))}
                min={1}
                className="h-12 text-lg"
              />
            </div>
          </div>

          <Button onClick={calculateImplicitProbability} className="w-full h-12 text-base font-semibold">
            Calcola Probabilità Implicita
          </Button>

          {implicitProb !== null && (
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-8 shadow-sm">
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-[#CCCCCC] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[#003366]">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="font-serif text-lg font-semibold uppercase tracking-wider text-[#003366]">
                    Probabilità Soggettiva Implicita
                  </span>
                </div>
                <div className="text-center">
                  <div className="font-serif text-6xl font-normal tabular-nums text-black">
                    {(implicitProb * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="border-t border-[#CCCCCC] pt-4 text-center text-base leading-relaxed text-[#666666]">
                  Se accetti questa scommessa, implicitamente credi che l'evento abbia{" "}
                  <span className="font-semibold text-black">{(implicitProb * 100).toFixed(1)}%</span> di probabilità
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Probabilità reale</label>
              <span className="text-2xl font-bold tabular-nums">{realProb}%</span>
            </div>
            <Slider
              value={[realProb]}
              onValueChange={(value) => setRealProb(value[0])}
              min={1}
              max={99}
              step={1}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Tua probabilità soggettiva</label>
              <span className="text-2xl font-bold tabular-nums">{subjProb}%</span>
            </div>
            <Slider
              value={[subjProb]}
              onValueChange={(value) => setSubjProb(value[0])}
              min={1}
              max={99}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Numero di simulazioni</label>
            <Input
              type="number"
              value={numSims}
              onChange={(e) => setNumSims(Number(e.target.value))}
              min={100}
              max={10000}
              step={100}
              className="h-12 text-lg"
            />
          </div>

          <Button
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full h-12 text-base font-semibold"
          >
            {isSimulating ? "⏳ Simulazione in corso..." : "🚀 Avvia Simulazione"}
          </Button>

          {simResults && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#666666]">Partite</div>
                  <div className="mt-2 font-serif text-3xl font-normal tabular-nums text-black">{simResults.totalGames}</div>
                </div>
                <div className="rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#666666]">Vittorie</div>
                  <div className="mt-2 font-serif text-3xl font-normal tabular-nums text-black">{simResults.wins}</div>
                </div>
                <div className={`rounded-lg border p-6 shadow-sm ${simResults.totalProfit >= 0 ? 'border-[#003366] bg-white' : 'border-red-600 bg-white'}`}>
                  <div className="text-xs font-medium uppercase tracking-wider text-[#666666]">Profitto Tot.</div>
                  <div className={`mt-2 font-serif text-3xl font-normal tabular-nums ${simResults.totalProfit >= 0 ? 'text-[#003366]' : 'text-red-600'}`}>€{simResults.totalProfit.toFixed(2)}</div>
                </div>
                <div className={`rounded-lg border p-6 shadow-sm ${simResults.avgProfit >= 0 ? 'border-[#003366] bg-white' : 'border-red-600 bg-white'}`}>
                  <div className="text-xs font-medium uppercase tracking-wider text-[#666666]">Profitto Medio</div>
                  <div className={`mt-2 font-serif text-3xl font-normal tabular-nums ${simResults.avgProfit >= 0 ? 'text-[#003366]' : 'text-red-600'}`}>€{simResults.avgProfit.toFixed(2)}</div>
                </div>
              </div>

              <div className="rounded-lg border border-[#CCCCCC] bg-white p-6">
                <div className="mb-4 flex items-center justify-between border-b border-[#CCCCCC] pb-3">
                  <span className="text-sm font-semibold uppercase tracking-wider text-black">Visualizzazione Risultati</span>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-[#003366]"></div>
                      Vittoria
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-[#CCCCCC]"></div>
                      Sconfitta
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {simResults.outcomes.slice(0, 500).map((won, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-full transition-transform hover:scale-125 ${won ? "bg-[#003366]" : "bg-[#CCCCCC]"
                        }`}
                      title={won ? "Vittoria" : "Sconfitta"}
                    />
                  ))}
                  {simResults.outcomes.length > 500 && (
                    <span className="flex items-center text-sm text-[#666666]">
                      +{simResults.outcomes.length - 500} più
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-[#003366] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✓</div>
                  <div className="flex-1">
                    <div className="font-serif text-xl font-semibold text-black">Simulazione Completata!</div>
                    <div className="mt-2 text-base text-[#666666]">
                      Tasso di vittoria effettivo: <span className="font-semibold text-black">{((simResults.wins / simResults.totalGames) * 100).toFixed(1)}%</span>
                      {" "}(atteso: <span className="font-semibold text-black">{realProb}%</span>)
                    </div>
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