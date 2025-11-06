"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { InfoIcon, RefreshCwIcon } from "lucide-react"
import {
  simulateMultipleSampling,
  calculateMarginOfError,
  getZValue,
  formatNumber,
  sampleNormal,
  mean,
  calculateCI,
  capturesParameter
} from "@/lib/confidence-intervals"

// Types
interface IntervalResult {
  interval: [number, number]
  captured: boolean
  sampleMean: number
}

interface QuizAnswer {
  [questionId: number]: number
}

export default function IntervalliConfidenza() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <MultipleSimulationMode />
      <SingleSamplingMode />
      <ParameterExplorer />
      <ConfidenceQuiz />
      <MisconceptionsAccordion />
    </div>
  )
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl font-semibold">📊 Intervalli di Confidenza Explorer</h1>
        <p className="text-lg text-muted-foreground">
          Cosa significa davvero un intervallo di confidenza al 95%?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Esempio Introduttivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Immagina 100 ricercatori che studiano l&apos;altezza media degli italiani.
            Ognuno prende un campione diverso e calcola un intervallo di confidenza al 95%.
          </p>
          <p className="font-semibold text-[#003366]">
            Quanti intervalli conterranno la vera altezza media?
          </p>
          <p className="text-sm text-muted-foreground">
            Risposta: circa 95 su 100. Il 95% non si riferisce alla probabilità che μ sia nell&apos;intervallo,
            ma alla <strong>frequenza relativa</strong> con cui la procedura di costruzione degli intervalli
            cattura il parametro su campionamenti ripetuti.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

// Multiple Simulation Mode - Core Feature
function MultipleSimulationMode() {
  const [sampleSize, setSampleSize] = useState(30)
  const [confidenceLevel, setConfidenceLevel] = useState("95")
  const [popMean, setPopMean] = useState(170)
  const [popStd, setPopStd] = useState(10)
  const [isSimulating, setIsSimulating] = useState(false)
  const [intervals, setIntervals] = useState<IntervalResult[]>([])

  const capturedCount = intervals.filter(i => i.captured).length
  const captureRate = intervals.length > 0 ? capturedCount / intervals.length : 0

  const handleSimulate = async () => {
    setIsSimulating(true)

    // Simulate with slight delay for UX
    await new Promise(resolve => setTimeout(resolve, 100))

    const results = simulateMultipleSampling(
      popMean,
      popStd,
      sampleSize,
      Number(confidenceLevel),
      100
    )

    setIntervals(results)
    setIsSimulating(false)
  }

  const handleReset = () => {
    setIntervals([])
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-serif">🔬 Simulazione Multipla: 100 Ricercatori</CardTitle>
        <CardDescription>
          Simula 100 ricercatori che campionano indipendentemente dalla stessa popolazione
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sample size */}
          <div className="space-y-2">
            <Label htmlFor="sample-size" className="text-sm font-semibold">
              Dimensione campione (n): {sampleSize}
            </Label>
            <Slider
              id="sample-size"
              min={10}
              max={500}
              step={10}
              value={[sampleSize]}
              onValueChange={(value) => setSampleSize(value[0])}
            />
          </div>

          {/* Confidence level */}
          <div className="space-y-2">
            <Label htmlFor="confidence-level" className="text-sm font-semibold">
              Livello di confidenza
            </Label>
            <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
              <SelectTrigger id="confidence-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90%</SelectItem>
                <SelectItem value="95">95%</SelectItem>
                <SelectItem value="99">99%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Population mean */}
          <div className="space-y-2">
            <Label htmlFor="pop-mean" className="text-sm font-semibold">
              Media popolazione (μ)
            </Label>
            <Input
              id="pop-mean"
              type="number"
              min={150}
              max={190}
              value={popMean}
              onChange={(e) => setPopMean(Number(e.target.value))}
              className="h-10"
            />
          </div>

          {/* Population std dev */}
          <div className="space-y-2">
            <Label htmlFor="pop-std" className="text-sm font-semibold">
              Dev. standard (σ)
            </Label>
            <Input
              id="pop-std"
              type="number"
              min={5}
              max={20}
              value={popStd}
              onChange={(e) => setPopStd(Number(e.target.value))}
              className="h-10"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex-1"
          >
            {isSimulating ? "Simulando..." : "Simula 100 Ricercatori"}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            disabled={intervals.length === 0}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Visualization */}
        {intervals.length > 0 && (
          <>
            <IntervalChart
              intervals={intervals}
              trueMean={popMean}
              confidenceLevel={Number(confidenceLevel)}
            />

            {/* Result badge */}
            <div className="flex justify-center">
              <Badge
                variant={captureRate >= 0.93 && captureRate <= 0.97 ? "default" : "secondary"}
                className="text-lg px-4 py-2"
              >
                {capturedCount}/{intervals.length} intervalli hanno catturato μ ({(captureRate * 100).toFixed(1)}%)
              </Badge>
            </div>

            {/* Interpretation alert */}
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle className="font-semibold">Interpretazione</AlertTitle>
              <AlertDescription>
                {captureRate >= 0.93 && captureRate <= 0.97 ? (
                  <>
                    Perfetto! Circa il {confidenceLevel}% degli intervalli ha catturato il vero parametro.
                    Questo è ciò che significa &quot;confidenza al {confidenceLevel}%&quot;: la{" "}
                    <strong>procedura di costruzione</strong> degli intervalli cattura il parametro nel{" "}
                    {confidenceLevel}% dei casi.
                  </>
                ) : (
                  <>
                    Per pura casualità, questa volta abbiamo {capturedCount} intervalli su 100.
                    Ripeti la simulazione più volte: vedrai che la media si stabilizza attorno al {confidenceLevel}%.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Interval Chart Component
interface IntervalChartProps {
  intervals: IntervalResult[]
  trueMean: number
  confidenceLevel: number
}

function IntervalChart({ intervals, trueMean, confidenceLevel }: IntervalChartProps) {
  // Calculate range for positioning
  const allBounds = intervals.flatMap(i => [i.interval[0], i.interval[1]])
  const minBound = Math.min(...allBounds, trueMean)
  const maxBound = Math.max(...allBounds, trueMean)
  const range = maxBound - minBound
  const padding = range * 0.1

  const calculatePosition = (value: number) => {
    return ((value - minBound + padding) / (range + 2 * padding)) * 100
  }

  // Show first 50 intervals to keep visualization manageable
  const displayIntervals = intervals.slice(0, 50)

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-center">
        Visualizzazione (primi 50 intervalli)
      </div>
      <div className="relative w-full border rounded-lg p-4 bg-white" style={{ height: "600px" }}>
        {/* True parameter line */}
        <div
          className="absolute w-1 h-full bg-[#003366] opacity-50 z-10"
          style={{ left: `${calculatePosition(trueMean)}%` }}
        />

        {/* Intervals */}
        <div className="space-y-1 relative h-full overflow-y-auto">
          {displayIntervals.map((interval, idx) => (
            <div key={idx} className="flex items-center gap-2 h-5">
              <span className="text-xs w-8 flex-shrink-0 text-muted-foreground">{idx + 1}</span>
              <div className="flex-1 relative h-3">
                <div
                  className={`absolute h-full rounded ${
                    interval.captured
                      ? "bg-green-500/30 border-2 border-green-500"
                      : "bg-red-500/30 border-2 border-red-500"
                  }`}
                  style={{
                    left: `${calculatePosition(interval.interval[0])}%`,
                    width: `${calculatePosition(interval.interval[1]) - calculatePosition(interval.interval[0])}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Parameter label */}
        <div
          className="absolute top-2 transform -translate-x-1/2 bg-[#003366] text-white text-xs px-2 py-1 rounded font-semibold z-20"
          style={{ left: `${calculatePosition(trueMean)}%` }}
        >
          μ = {trueMean}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/30 border-2 border-green-500 rounded" />
          <span>Cattura μ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/30 border-2 border-red-500 rounded" />
          <span>Non cattura μ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#003366] opacity-50" />
          <span>Vero parametro μ</span>
        </div>
      </div>
    </div>
  )
}

// Single Sampling Mode Component
function SingleSamplingMode() {
  const [sampleSize, setSampleSize] = useState(30)
  const [confidenceLevel, setConfidenceLevel] = useState("95")
  const [popMean, setPopMean] = useState(170)
  const [popStd, setPopStd] = useState(10)
  const [sampleResult, setSampleResult] = useState<IntervalResult | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSingleSample = () => {
    const sample = sampleNormal(popMean, popStd, sampleSize)
    const sampleMean = mean(sample)
    const interval = calculateCI(sampleMean, popStd, sampleSize, Number(confidenceLevel))
    const captured = capturesParameter(interval, popMean)

    setSampleResult({
      interval,
      captured,
      sampleMean
    })
    setRevealed(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">🎯 Campionamento Singolo</CardTitle>
        <CardDescription>
          Prendi un singolo campione e costruisci un intervallo di confidenza
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reuse controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Dimensione campione (n): {sampleSize}
            </Label>
            <Slider
              min={10}
              max={500}
              step={10}
              value={[sampleSize]}
              onValueChange={(value) => setSampleSize(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Livello di confidenza</Label>
            <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90%</SelectItem>
                <SelectItem value="95">95%</SelectItem>
                <SelectItem value="99">99%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Media popolazione (μ)</Label>
            <Input
              type="number"
              min={150}
              max={190}
              value={popMean}
              onChange={(e) => setPopMean(Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Dev. standard (σ)</Label>
            <Input
              type="number"
              min={5}
              max={20}
              value={popStd}
              onChange={(e) => setPopStd(Number(e.target.value))}
              className="h-10"
            />
          </div>
        </div>

        <Button onClick={handleSingleSample} className="w-full">
          Prendi un Campione
        </Button>

        {sampleResult && (
          <>
            <div className="p-4 border rounded-lg bg-muted">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Media campionaria: {formatNumber(sampleResult.sampleMean)}</p>
                <p className="font-mono text-lg">
                  Intervallo al {confidenceLevel}%: [{formatNumber(sampleResult.interval[0])}, {formatNumber(sampleResult.interval[1])}]
                </p>
                <p className="text-sm text-muted-foreground">
                  Ampiezza: {formatNumber(sampleResult.interval[1] - sampleResult.interval[0])}
                </p>
              </div>
            </div>

            {!revealed && (
              <Button onClick={() => setRevealed(true)} variant="outline" className="w-full">
                Rivela se ha catturato μ
              </Button>
            )}

            {revealed && (
              <Alert variant={sampleResult.captured ? "default" : "destructive"}>
                <AlertTitle className="font-semibold">
                  {sampleResult.captured ? "✅ Catturato!" : "❌ Non catturato"}
                </AlertTitle>
                <AlertDescription>
                  Il vero parametro μ = {popMean} è{" "}
                  {sampleResult.captured ? "dentro" : "fuori da"} questo intervallo.
                  {!sampleResult.captured && (
                    <> Questo succede nel {100 - Number(confidenceLevel)}% dei casi.</>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Parameter Explorer Component
function ParameterExplorer() {
  const [n, setN] = useState(30)
  const [confidence, setConfidence] = useState(95)
  const [sigma, setSigma] = useState(10)

  const zValue = getZValue(confidence)
  const marginOfError = calculateMarginOfError(sigma, n, confidence)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">🔍 Esplora i Parametri</CardTitle>
        <CardDescription>
          Vedi come cambiano gli intervalli modificando n, confidenza, e σ
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sliders */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Dimensione campione (n)</Label>
              <span className="text-2xl font-bold font-serif tabular-nums">{n}</span>
            </div>
            <Slider
              min={10}
              max={500}
              step={10}
              value={[n]}
              onValueChange={([value]) => setN(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Livello confidenza</Label>
              <span className="text-2xl font-bold font-serif tabular-nums">{confidence}%</span>
            </div>
            <Slider
              min={80}
              max={99}
              step={1}
              value={[confidence]}
              onValueChange={([value]) => setConfidence(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Deviazione standard (σ)</Label>
              <span className="text-2xl font-bold font-serif tabular-nums">{sigma}</span>
            </div>
            <Slider
              min={5}
              max={20}
              step={1}
              value={[sigma]}
              onValueChange={([value]) => setSigma(value)}
            />
          </div>
        </div>

        {/* Formula display */}
        <div className="p-6 bg-[#2c3e50] rounded-lg text-white font-mono text-center space-y-2">
          <p className="text-sm opacity-80">Ampiezza dell&apos;Intervallo:</p>
          <p className="text-lg">
            IC = x̄ ± {formatNumber(zValue)} × ({sigma}/√{n})
          </p>
          <p className="text-2xl font-bold mt-2">
            ≈ x̄ ± {formatNumber(marginOfError)}
          </p>
        </div>

        {/* Observations */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle className="font-semibold">Osservazioni</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              <li>↑ n → ↓ ampiezza (più preciso)</li>
              <li>↑ confidenza → ↑ ampiezza (trade-off precisione/confidenza)</li>
              <li>↑ σ → ↑ ampiezza (popolazione più variabile)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Quiz questions data
const quizQuestions = [
  {
    id: 1,
    question: "Hai costruito un IC [165, 175] al 95%. Quale affermazione è CORRETTA?",
    options: [
      "C'è il 95% di probabilità che μ sia tra 165 e 175",
      "Su 100 campioni, circa 95 IC conterranno μ",
      "Il parametro μ è probabilmente vicino a 170",
      "Posso essere sicuro al 95% che μ ∈ [165, 175]"
    ],
    correctIndex: 1,
    explanation: "L'IC è casuale, il parametro è fisso. La probabilità del 95% riguarda la PROCEDURA di campionamento ripetuto, non il singolo intervallo."
  },
  {
    id: 2,
    question: "Un IC al 99% rispetto a uno al 95% è:",
    options: [
      "Più stretto (più preciso)",
      "Più largo (meno preciso)",
      "Uguale in ampiezza",
      "Dipende dalla dimensione del campione"
    ],
    correctIndex: 1,
    explanation: "IC al 99% cattura il parametro più spesso (99% vs 95%), ma il prezzo è un intervallo più largo. È un trade-off tra confidenza e precisione."
  },
  {
    id: 3,
    question: "Aumentando la dimensione del campione (n), cosa succede?",
    options: [
      "Gli IC catturano μ più spesso",
      "Gli IC diventano più stretti",
      "Gli IC catturano sempre μ",
      "Non cambia nulla"
    ],
    correctIndex: 1,
    explanation: "Al 95% resta 95%, ma l'IC diventa più STRETTO perché l'errore standard diminuisce (σ/√n). Più n → più precisione."
  }
]

// Quiz Component
function ConfidenceQuiz() {
  const [answers, setAnswers] = useState<QuizAnswer>({})

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">📝 Verifica la tua Comprensione</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {quizQuestions.map((q, idx) => (
          <div key={q.id} className="space-y-3 p-4 border rounded-lg">
            <p className="font-semibold">
              {idx + 1}. {q.question}
            </p>

            <RadioGroup
              value={answers[q.id]?.toString()}
              onValueChange={(value) => handleAnswer(q.id, Number(value))}
            >
              {q.options.map((option, optIdx) => (
                <div key={optIdx} className="flex items-start space-x-2">
                  <RadioGroupItem value={optIdx.toString()} id={`q${q.id}-opt${optIdx}`} />
                  <Label htmlFor={`q${q.id}-opt${optIdx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {answers[q.id] !== undefined && (
              <Alert variant={answers[q.id] === q.correctIndex ? "default" : "destructive"}>
                <AlertTitle className="font-semibold">
                  {answers[q.id] === q.correctIndex ? "✅ Corretto!" : "❌ Non corretto"}
                </AlertTitle>
                <AlertDescription>{q.explanation}</AlertDescription>
              </Alert>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Misconceptions data
const misconceptions = [
  {
    title: '"C\'è il 95% di probabilità che μ sia nell\'intervallo"',
    content: (
      <div className="space-y-2">
        <p className="font-semibold text-red-600">❌ FALSO</p>
        <p>
          Il parametro μ è un valore FISSO (non ha probabilità). L&apos;intervallo è CASUALE.
          Il 95% si riferisce alla frequenza relativa con cui la PROCEDURA cattura μ
          su campionamenti ripetuti.
        </p>
      </div>
    )
  },
  {
    title: '"Un IC più ampio è sempre peggiore"',
    content: (
      <div className="space-y-2">
        <p className="font-semibold text-yellow-600">⚠️ DIPENDE</p>
        <p>
          IC più ampio = maggiore confidenza di catturare μ. È un trade-off:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>IC al 99% è più ampio del 95%, ma cattura più spesso</li>
          <li>IC al 90% è più stretto del 95%, ma cattura meno spesso</li>
        </ul>
        <p>
          Scegli in base al contesto: preferisci confidenza o precisione?
        </p>
      </div>
    )
  },
  {
    title: '"Campione più grande → IC cattura più spesso"',
    content: (
      <div className="space-y-2">
        <p className="font-semibold text-red-600">❌ FALSO</p>
        <p>
          Al 95% resta 95%, indipendentemente da n. Quello che cambia è l&apos;AMPIEZZA:
          campioni più grandi producono IC più stretti (più precisi), ma la frequenza
          di cattura resta la stessa.
        </p>
        <p className="font-mono text-sm bg-muted p-2 rounded mt-2">
          Errore standard = σ/√n → ↑n ⇒ ↓errore ⇒ IC più stretto
        </p>
      </div>
    )
  }
]

// Misconceptions Accordion Component
function MisconceptionsAccordion() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">⚠️ Misconcezioni Comuni</CardTitle>
        <CardDescription>
          Errori frequenti nell&apos;interpretazione degli intervalli di confidenza
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {misconceptions.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left">{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
