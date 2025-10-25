'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function BayesCoinDemo() {
  const [priorBiased, setPriorBiased] = useState(10) // % di monete truccate
  const [biasLevel, setBiasLevel] = useState(75) // % testa per moneta truccata
  const [numHeads, setNumHeads] = useState(5) // numero di teste consecutive
  const [currentStep, setCurrentStep] = useState(0)

  // Calcoli
  const pHeadsFair = Math.pow(0.5, numHeads)
  const pHeadsBiased = Math.pow(biasLevel / 100, numHeads)
  const ratio = pHeadsBiased / pHeadsFair

  const pBiased = priorBiased / 100
  const pFair = 1 - pBiased

  // Teorema di Bayes
  const numerator = pHeadsBiased * pBiased
  const denominator = (pHeadsBiased * pBiased) + (pHeadsFair * pFair)
  const posteriorBiased = numerator / denominator

  const steps = [
    {
      title: "Il Setup",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-black">
            Immagina una fabbrica che produce monete. Sappiamo che:
          </p>
          <div className="rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
            <p className="mb-3 font-semibold text-black">📊 Informazioni che abbiamo:</p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-[#666666]">
              <li><span className="font-semibold text-[#003366]">{priorBiased}%</span> delle monete sono truccate</li>
              <li>Le monete truccate danno testa il <span className="font-semibold text-[#003366]">{biasLevel}%</span> delle volte</li>
              <li>Le monete giuste danno testa il <span className="font-semibold text-[#003366]">50%</span> delle volte</li>
            </ul>
          </div>
          <p className="mt-6 text-lg text-black">
            🪙 Prendiamo una moneta a caso e la lanciamo <span className="font-semibold text-[#003366]">{numHeads} volte</span>.
            Otteniamo <span className="font-semibold text-[#003366]">{numHeads} teste consecutive!</span>
          </p>
          <p className="mt-6 font-serif text-xl font-semibold text-[#003366]">
            🤔 Domanda: Qual è la probabilità che questa moneta sia truccata?
          </p>
        </div>
      )
    },
    {
      title: "Passo 1: Confrontiamo le Probabilità",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-black">
            Prima di tutto, calcoliamo quanto è probabile ottenere {numHeads} teste consecutive con ciascun tipo di moneta:
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="border border-[#CCCCCC] bg-white shadow-sm">
              <CardHeader className="border-b border-[#CCCCCC]">
                <CardTitle className="text-[#666666]">Moneta Giusta</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-[#666666]">P({numHeads} teste | giusta) =</p>
                  <p className="font-serif text-3xl font-normal tabular-nums text-black">
                    (0.5)<sup>{numHeads}</sup> = {pHeadsFair.toFixed(5)}
                  </p>
                  <p className="mt-2 text-xs text-[#666666]">
                    Circa {(pHeadsFair * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#003366] bg-white shadow-sm">
              <CardHeader className="border-b border-[#003366]">
                <CardTitle className="text-[#003366]">Moneta Truccata</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-[#666666]">P({numHeads} teste | truccata) =</p>
                  <p className="font-serif text-3xl font-normal tabular-nums text-[#003366]">
                    ({biasLevel/100})<sup>{numHeads}</sup> = {pHeadsBiased.toFixed(5)}
                  </p>
                  <p className="mt-2 text-xs text-[#666666]">
                    Circa {(pHeadsBiased * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-6 border border-[#CCCCCC] bg-[#F5F5F5]">
            <AlertDescription className="text-lg">
              <span className="font-bold text-black">📈 Osservazione Chiave:</span>
              <p className="mt-2 text-black">
                È circa <span className="font-serif text-2xl font-semibold text-[#003366]">{ratio.toFixed(1)}x</span> più probabile
                ottenere {numHeads} teste consecutive con una moneta <span className="font-semibold">truccata</span> rispetto
                a una moneta <span className="font-semibold">giusta</span>!
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Passo 2: Ma Aspetta...",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-black">
            Sappiamo che ottenere {numHeads} teste è molto più probabile con una moneta truccata.
            Ma questo basta per concludere che la nostra moneta è truccata?
          </p>

          <Alert className="mt-4 border border-[#CCCCCC] bg-[#F5F5F5]">
            <AlertDescription>
              <p className="mb-2 font-semibold text-[#003366]">🤔 Non così in fretta!</p>
              <p className="text-black">Dobbiamo considerare anche quanto sono <span className="font-bold">rare</span> le monete truccate.</p>
            </AlertDescription>
          </Alert>

          <div className="mt-6 rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
            <p className="mb-4 font-semibold text-black">Ricordiamo i fatti:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Monete Giuste</p>
                <p className="font-serif text-4xl font-normal tabular-nums text-black">{(100 - priorBiased)}%</p>
                <p className="mt-1 text-xs text-[#666666]">della produzione</p>
              </div>
              <div className="rounded-lg border border-[#003366] bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Monete Truccate</p>
                <p className="font-serif text-4xl font-normal tabular-nums text-[#003366]">{priorBiased}%</p>
                <p className="mt-1 text-xs text-[#666666]">della produzione</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-lg text-black">
            Quindi anche se l'evidenza di {numHeads} teste consecutive favorisce fortemente una moneta truccata,
            dobbiamo bilanciare questo con il fatto che le monete truccate sono <span className="font-semibold text-[#003366]">rare</span>!
          </p>
        </div>
      )
    },
    {
      title: "Passo 3: Il Teorema di Bayes",
      content: (
        <div className="space-y-4">
          <p className="mb-4 text-lg text-black">
            Il Teorema di Bayes ci permette di combinare queste due informazioni:
          </p>

          <div className="rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
            <p className="mb-4 text-center font-serif text-lg font-semibold text-[#003366]">Formula di Bayes:</p>
            <div className="rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-6 text-center text-lg">
              <p className="mb-2 text-black">P(Truccata | {numHeads} teste) = </p>
              <div className="mt-2 border-t-2 border-[#CCCCCC] pt-2">
                <p className="mb-2 text-sm text-black">P({numHeads} teste | Truccata) × P(Truccata)</p>
                <p className="text-xs text-[#666666]">────────────────────────────</p>
                <p className="mt-2 text-xs text-black">P({numHeads} teste | Truccata) × P(Truccata) + P({numHeads} teste | Giusta) × P(Giusta)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-6">
            <p className="mb-3 font-semibold text-black">📝 Sostituiamo i valori:</p>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-[#CCCCCC] bg-white p-3">
                <p className="text-[#666666]">Numeratore:</p>
                <p className="font-mono text-black">
                  {pHeadsBiased.toFixed(5)} × {pBiased.toFixed(2)} = <span className="font-bold text-[#003366]">{numerator.toFixed(6)}</span>
                </p>
              </div>
              <div className="rounded-lg border border-[#CCCCCC] bg-white p-3">
                <p className="text-[#666666]">Denominatore:</p>
                <p className="font-mono text-xs text-black">
                  ({pHeadsBiased.toFixed(5)} × {pBiased.toFixed(2)}) + ({pHeadsFair.toFixed(5)} × {pFair.toFixed(2)})
                </p>
                <p className="font-mono mt-1 text-black">
                  = {numerator.toFixed(6)} + {(pHeadsFair * pFair).toFixed(6)}
                </p>
                <p className="font-mono text-black">
                  = <span className="font-bold text-[#003366]">{denominator.toFixed(6)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🎯 Risultato Finale",
      content: (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-lg border-2 border-[#003366] bg-white p-8 shadow-lg">
            <div className="text-center py-4">
              <p className="mb-2 text-2xl font-semibold text-black">
                P(Moneta Truccata | {numHeads} Teste) =
              </p>
              <p className="my-6 font-serif text-7xl font-normal tabular-nums text-[#003366]">
                {(posteriorBiased * 100).toFixed(1)}%
              </p>
              <p className="text-lg text-[#666666]">
                ≈ {posteriorBiased.toFixed(3)} ≈ {Math.round(posteriorBiased * 10)}/10
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
            <p className="mb-4 font-serif text-xl font-semibold text-[#003366]">💡 Cosa significa?</p>
            <div className="space-y-4">
              <p className="text-lg text-black">
                Dopo aver osservato {numHeads} teste consecutive, la probabilità che la moneta sia truccata è
                aumentata da <span className="font-bold text-black">{priorBiased}%</span> (prima dell'osservazione)
                a circa <span className="font-bold text-[#003366]">{(posteriorBiased * 100).toFixed(1)}%</span>!
              </p>

              <div className="mt-4 rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-4">
                <p className="mb-2 font-semibold text-black">🔍 Interpretazione:</p>
                <p className="text-black">
                  {posteriorBiased > 0.7
                    ? "L'evidenza è forte: molto probabilmente la moneta è truccata!"
                    : posteriorBiased > 0.5
                    ? "È più probabile che la moneta sia truccata, ma non siamo sicurissimi."
                    : posteriorBiased > 0.3
                    ? "L'evidenza è ancora debole. La rarità delle monete truccate bilancia l'evidenza osservata."
                    : "Nonostante le teste consecutive, è ancora più probabile che sia una moneta giusta perché le monete truccate sono molto rare."}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-4">
                <p className="mb-2 font-semibold text-black">🎓 Lezione Chiave:</p>
                <p className="text-sm text-black">
                  Il Teorema di Bayes bilancia l'<span className="font-bold">evidenza</span> che osserviamo
                  (quanto è probabile vedere questi dati con ogni ipotesi) con le nostre
                  <span className="font-bold"> conoscenze pregresse</span> (quanto è probabile ogni ipotesi a priori).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="italic text-[#666666]">
              Prova a cambiare i parametri sopra e osserva come cambia il risultato! 🎲
            </p>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Controlli Interattivi */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Parametri della Simulazione</CardTitle>
          <CardDescription>
            Modifica questi valori per esplorare scenari diversi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-black">% di monete truccate prodotte dalla fabbrica</label>
              <span className="font-serif text-2xl font-normal tabular-nums text-[#003366]">{priorBiased}%</span>
            </div>
            <Slider
              value={[priorBiased]}
              onValueChange={(value) => setPriorBiased(value[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-black">Bias della moneta truccata (% di teste)</label>
              <span className="font-serif text-2xl font-normal tabular-nums text-[#003366]">{biasLevel}%</span>
            </div>
            <Slider
              value={[biasLevel]}
              onValueChange={(value) => setBiasLevel(value[0])}
              min={51}
              max={95}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-black">Numero di teste consecutive osservate</label>
              <span className="font-serif text-2xl font-normal tabular-nums text-[#003366]">{numHeads}</span>
            </div>
            <Slider
              value={[numHeads]}
              onValueChange={(value) => setNumHeads(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Area dei passaggi */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">{steps[currentStep].title}</CardTitle>
          <div className="mt-4 flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-[#003366]' : 'bg-[#CCCCCC]'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {steps[currentStep].content}

          <div className="mt-6 flex items-center justify-between border-t border-[#CCCCCC] pt-6">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              variant="outline"
              className="h-12 px-6"
            >
              ← Indietro
            </Button>
            <span className="text-sm text-[#666666]">
              Passo {currentStep + 1} di {steps.length}
            </span>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="h-12 px-6"
            >
              Avanti →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Riepilogo sempre visibile */}
      {currentStep > 0 && (
        <Card className="border border-[#CCCCCC] bg-white">
          <CardHeader>
            <CardTitle className="text-lg">📊 Riepilogo Rapido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-center md:grid-cols-3">
              <div className="rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Rapporto Likelihood</p>
                <p className="font-serif text-3xl font-normal tabular-nums text-black">{ratio.toFixed(1)}x</p>
              </div>
              <div className="rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Prior</p>
                <p className="font-serif text-3xl font-normal tabular-nums text-black">{priorBiased}%</p>
              </div>
              <div className="rounded-lg border border-[#003366] bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Posterior</p>
                <p className="font-serif text-3xl font-normal tabular-nums text-[#003366]">{(posteriorBiased * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
