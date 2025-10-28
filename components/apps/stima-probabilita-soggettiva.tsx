"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Format numbers consistently for SSR/client hydration
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('it-IT').format(Math.round(num))
}

export default function StimaProbabilitaSoggettiva() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  // Base parameters
  const [houseValue, setHouseValue] = useState(300000)
  const [lossPercent, setLossPercent] = useState(30)

  // Method 1: Insurance
  const [insurancePremium, setInsurancePremium] = useState(45000)
  const [insuranceProb, setInsuranceProb] = useState<number | null>(null)

  // Method 2: Selling Price
  const [sellingPrice, setSellingPrice] = useState(270000)
  const [sellingProb, setSellingProb] = useState<number | null>(null)

  // Method 3: Betting
  const [betAmount, setBetAmount] = useState(1000)
  const [winAmount, setWinAmount] = useState(2000)
  const [betProb, setBetProb] = useState<number | null>(null)

  // Comparison results
  const [showComparison, setShowComparison] = useState(false)
  const [showSensitivity, setShowSensitivity] = useState(false)

  // Calculate base values
  const potentialLoss = houseValue * (lossPercent / 100)
  const valueIfLoss = houseValue - potentialLoss

  // Calculate from insurance method
  const calculateFromInsurance = () => {
    const probability = insurancePremium / potentialLoss
    setInsuranceProb(probability)
  }

  // Calculate from selling price method
  const calculateFromSellingPrice = () => {
    const probability = (houseValue - sellingPrice) / potentialLoss
    setSellingProb(probability)
  }

  // Calculate from betting method
  const calculateFromBet = () => {
    const probability = betAmount / (betAmount + winAmount)
    setBetProb(probability)
  }

  // Get interpretation
  const getInterpretation = (prob: number) => {
    if (prob > 0.8) return "Molto probabile"
    if (prob > 0.5) return "Probabile"
    if (prob > 0.2) return "Poco probabile"
    return "Molto improbabile"
  }

  const getInterpretationColor = (prob: number) => {
    if (prob > 0.8) return "text-red-600"
    if (prob > 0.5) return "text-orange-600"
    return "text-[#003366]"
  }

  const getInterpretationIcon = (prob: number) => {
    if (prob > 0.8) return "🔴"
    if (prob > 0.5) return "🟡"
    return "🟢"
  }

  // Comparison calculations
  const compareAllMethods = () => {
    calculateFromInsurance()
    calculateFromSellingPrice()
    calculateFromBet()
    setShowComparison(true)
  }

  const average = insuranceProb !== null && sellingProb !== null && betProb !== null
    ? (insuranceProb + sellingProb + betProb) / 3
    : null

  const getConsistencyAnalysis = (p1: number, p2: number, p3: number) => {
    const max = Math.max(p1, p2, p3)
    const min = Math.min(p1, p2, p3)
    const range = max - min

    if (range < 0.1) {
      return "Le stime sono molto coerenti tra loro."
    } else if (range < 0.3) {
      return "Le stime sono ragionevolmente coerenti."
    } else {
      return "Le stime mostrano una certa incoerenza. Roberto potrebbe rivedere le sue valutazioni."
    }
  }

  return (
    <div className="space-y-6">
      {/* Scenario Box */}
      <Card className="border-[#003366] bg-gradient-to-br from-[#003366] to-[#004080]">
        <CardHeader>
          <CardTitle className="text-white font-serif text-2xl">📋 Scenario</CardTitle>
        </CardHeader>
        <CardContent className="text-white space-y-2">
          <p><strong>Roberto</strong> possiede una casa che potrebbe essere soggetta a un'ingiunzione.</p>
          <p>Se l'ingiunzione si verifica, la casa perderà il <strong>{lossPercent}% del suo valore</strong>.</p>
          <p>Vogliamo stimare la sua <strong>probabilità soggettiva</strong> che l'evento si verifichi.</p>
        </CardContent>
      </Card>

      {/* Base Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Parametri del Caso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Valore attuale casa (€)</label>
              <Input
                type="number"
                value={houseValue}
                onChange={(e) => setHouseValue(Number(e.target.value))}
                min={1000}
                step={1000}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Percentuale di perdita (%)</label>
              <Input
                type="number"
                value={lossPercent}
                onChange={(e) => setLossPercent(Number(e.target.value))}
                min={1}
                max={100}
                className="h-12 text-lg"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-6">
            <div className="space-y-2 text-center">
              <div className="text-sm font-medium uppercase tracking-wide text-[#666666]">Calcoli Base</div>
              <div className="space-y-1 text-base">
                <div>Valore attuale: <span className="font-semibold">€{formatNumber(houseValue)}</span></div>
                <div>Perdita potenziale: <span className="font-semibold">€{formatNumber(potentialLoss)}</span> ({lossPercent}%)</div>
                <div>Valore se si verifica l'ingiunzione: <span className="font-semibold">€{formatNumber(valueIfLoss)}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 1: Insurance */}
      <Card>
        <CardHeader>
          <CardTitle>🛡️ Metodo 1: Assicurazione</CardTitle>
          <CardDescription>
            Roberto è disposto a pagare un'assicurazione per coprire completamente la perdita. Quanto pagherebbe?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Premio assicurazione (€)</label>
            <Input
              type="number"
              value={insurancePremium}
              onChange={(e) => setInsurancePremium(Number(e.target.value))}
              min={0}
              step={1000}
              className="h-12 text-lg"
            />
          </div>

          <Button onClick={calculateFromInsurance} className="w-full h-12 text-base font-semibold">
            Calcola Probabilità
          </Button>

          {insuranceProb !== null && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#CCCCCC] bg-white p-8 shadow-sm">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-[#CCCCCC] pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[#003366]">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-serif text-lg font-semibold uppercase tracking-wider text-[#003366]">
                      Probabilità Soggettiva Stimata
                    </span>
                  </div>
                  <div className="text-center">
                    <div className={`font-serif text-6xl font-normal tabular-nums ${getInterpretationColor(insuranceProb)}`}>
                      {Math.max(0, Math.min(100, insuranceProb * 100)).toFixed(1)}%
                    </div>
                  </div>
                  <div className="border-t border-[#CCCCCC] pt-4 text-center text-base leading-relaxed text-[#666666]">
                    {getInterpretationIcon(insuranceProb)} Roberto crede {getInterpretation(insuranceProb).toLowerCase()} l'ingiunzione
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#2c3e50] p-6 text-white font-mono text-center">
                <div className="text-sm opacity-80 mb-2">Formula</div>
                <div className="text-base">
                  P = Premio / Perdita = €{formatNumber(insurancePremium)} / €{formatNumber(potentialLoss)} = {insuranceProb.toFixed(3)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Method 2: Selling Price */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Metodo 2: Prezzo di Vendita</CardTitle>
          <CardDescription>
            A che prezzo minimo Roberto venderebbe la casa oggi per evitare il rischio?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Prezzo minimo accettato (€)</label>
            <Input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              min={0}
              step={1000}
              className="h-12 text-lg"
            />
          </div>

          <Button onClick={calculateFromSellingPrice} className="w-full h-12 text-base font-semibold">
            Calcola Probabilità
          </Button>

          {sellingProb !== null && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#CCCCCC] bg-white p-8 shadow-sm">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-[#CCCCCC] pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[#003366]">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-serif text-lg font-semibold uppercase tracking-wider text-[#003366]">
                      Probabilità Soggettiva Stimata
                    </span>
                  </div>
                  <div className="text-center">
                    <div className={`font-serif text-6xl font-normal tabular-nums ${getInterpretationColor(sellingProb)}`}>
                      {Math.max(0, Math.min(100, sellingProb * 100)).toFixed(1)}%
                    </div>
                  </div>
                  <div className="border-t border-[#CCCCCC] pt-4 text-center text-base leading-relaxed text-[#666666]">
                    {getInterpretationIcon(sellingProb)} Roberto crede {getInterpretation(sellingProb).toLowerCase()} l'ingiunzione
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#2c3e50] p-6 text-white font-mono text-sm text-center">
                <div className="text-sm opacity-80 mb-2">Formula</div>
                <div>Valore Atteso = P × €{formatNumber(valueIfLoss)} + (1-P) × €{formatNumber(houseValue)} = €{formatNumber(sellingPrice)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Method 3: Betting */}
      <Card>
        <CardHeader>
          <CardTitle>🎲 Metodo 3: Scommessa Equa</CardTitle>
          <CardDescription>
            Roberto scommette che NON riceverà l'ingiunzione. Che quota considera equa?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Importo che scommette (€)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={1}
                step={100}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Importo che riceve se vince (€)</label>
              <Input
                type="number"
                value={winAmount}
                onChange={(e) => setWinAmount(Number(e.target.value))}
                min={1}
                step={100}
                className="h-12 text-lg"
              />
            </div>
          </div>

          <Button onClick={calculateFromBet} className="w-full h-12 text-base font-semibold">
            Calcola Probabilità
          </Button>

          {betProb !== null && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#CCCCCC] bg-white p-8 shadow-sm">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-[#CCCCCC] pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[#003366]">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-serif text-lg font-semibold uppercase tracking-wider text-[#003366]">
                      Probabilità Soggettiva Stimata
                    </span>
                  </div>
                  <div className="text-center">
                    <div className={`font-serif text-6xl font-normal tabular-nums ${getInterpretationColor(betProb)}`}>
                      {(betProb * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="border-t border-[#CCCCCC] pt-4 text-center text-base leading-relaxed text-[#666666]">
                    {getInterpretationIcon(betProb)} Roberto crede {getInterpretation(betProb).toLowerCase()} l'ingiunzione
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#2c3e50] p-6 text-white font-mono text-center">
                <div className="text-sm opacity-80 mb-2">Formula</div>
                <div className="text-base">
                  P = Scommessa / (Scommessa + Vincita) = €{betAmount} / (€{betAmount} + €{winAmount}) = {betProb.toFixed(3)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Confronto dei Metodi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={compareAllMethods} className="w-full h-12 text-base font-semibold">
            🔍 Confronta Tutti i Metodi
          </Button>

          {showComparison && insuranceProb !== null && sellingProb !== null && betProb !== null && average !== null && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-lg border border-[#CCCCCC] shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#2c3e50] text-white">
                      <th className="px-6 py-4 text-left font-semibold">Metodo</th>
                      <th className="px-6 py-4 text-left font-semibold">Probabilità Stimata</th>
                      <th className="px-6 py-4 text-left font-semibold">Interpretazione</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-[#CCCCCC] hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-6 py-4 font-semibold">🛡️ Assicurazione</td>
                      <td className="px-6 py-4 font-bold tabular-nums">{(insuranceProb * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4">{getInterpretation(insuranceProb)}</td>
                    </tr>
                    <tr className="border-b border-[#CCCCCC] hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-6 py-4 font-semibold">💰 Prezzo Vendita</td>
                      <td className="px-6 py-4 font-bold tabular-nums">{(sellingProb * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4">{getInterpretation(sellingProb)}</td>
                    </tr>
                    <tr className="border-b border-[#CCCCCC] hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-6 py-4 font-semibold">🎲 Scommessa</td>
                      <td className="px-6 py-4 font-bold tabular-nums">{(betProb * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4">{getInterpretation(betProb)}</td>
                    </tr>
                    <tr className="bg-[#F5F5F5] border-b border-[#CCCCCC]">
                      <td className="px-6 py-4 font-bold">📊 Media</td>
                      <td className="px-6 py-4 font-bold tabular-nums text-[#003366]">{(average * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 font-semibold">{getInterpretation(average)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-orange-300 bg-orange-50 p-6">
                <div className="text-lg font-semibold mb-2 text-orange-900">💡 Analisi</div>
                <div className="text-base text-orange-900">
                  La probabilità soggettiva media di Roberto è del <span className="font-bold">{(average * 100).toFixed(1)}%</span>.
                  <br />
                  {getConsistencyAnalysis(insuranceProb, sellingProb, betProb)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensitivity Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Analisi di Sensibilità</CardTitle>
          <CardDescription>
            Come cambia la probabilità stimata al variare dei parametri?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={() => setShowSensitivity(!showSensitivity)} className="w-full h-12 text-base font-semibold">
            📊 {showSensitivity ? "Nascondi" : "Mostra"} Analisi
          </Button>

          {showSensitivity && (
            <div className="space-y-4">
              <h4 className="font-serif text-xl font-semibold">📊 Analisi di Sensibilità - Metodo Assicurazione</h4>

              <div className="overflow-hidden rounded-lg border border-[#CCCCCC] shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#2c3e50] text-white">
                      <th className="px-6 py-4 text-left font-semibold">Premio Assicurazione</th>
                      <th className="px-6 py-4 text-left font-semibold">Probabilità Implicita</th>
                      <th className="px-6 py-4 text-left font-semibold">Interpretazione</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {[10000, 20000, 30000, 45000, 60000, 75000, 90000].map((premium) => {
                      const prob = premium / potentialLoss
                      return (
                        <tr key={premium} className="border-b border-[#CCCCCC] hover:bg-[#F5F5F5] transition-colors">
                          <td className="px-6 py-4">€{formatNumber(premium)}</td>
                          <td className="px-6 py-4 font-bold tabular-nums">{(prob * 100).toFixed(1)}%</td>
                          <td className="px-6 py-4">{getInterpretation(prob)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
