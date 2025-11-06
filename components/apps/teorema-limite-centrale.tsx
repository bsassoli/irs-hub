"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { InfoIcon, PlayIcon, PauseIcon, RefreshCwIcon, FastForwardIcon, TrendingUpIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line
} from "recharts"
import {
  distributions,
  getDistribution,
  createHistogram,
  createHistogramWithNormal,
  generatePopulationSample,
  type Distribution
} from "@/lib/distributions"
import { mean, assessNormality, standardError } from "@/lib/sampling"
import { useCLTSimulation } from "@/hooks/useCLTSimulation"

// Types
interface QuizAnswer {
  [questionId: number]: number
}

export default function TeoremLimiteCentrale() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <MainSimulation />
      <CompareSizesPanel />
      <CLTQuiz />
      <ExplanationAccordion />
    </div>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl font-semibold">📈 Teorema del Limite Centrale in Azione</h1>
        <p className="text-lg text-muted-foreground">
          Osserva la &quot;magia&quot; matematica che rende possibile la statistica inferenziale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Cosa vedrai</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Parti da una popolazione con distribuzione &quot;brutta&quot; (non normale): bimodale, uniforme,
            asimmetrica, o esponenziale.
          </p>
          <p>Estrai ripetutamente campioni di dimensione n e calcola la media di ogni campione.</p>
          <p className="font-semibold text-[#003366]">
            Risultato: anche se la popolazione non è normale, la distribuzione delle medie campionarie
            converge a una curva a campana!
          </p>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle className="font-semibold">Perché è importante?</AlertTitle>
            <AlertDescription>
              Il TLC è la base della statistica inferenziale classica. Ci permette di usare la distribuzione
              normale anche quando i dati originali non lo sono.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  )
}

// Main Simulation Component
function MainSimulation() {
  const [selectedDistId, setSelectedDistId] = useState('uniform')
  const [sampleSize, setSampleSize] = useState(30)
  const [speed, setSpeed] = useState(200)

  const selectedDist = getDistribution(selectedDistId)

  const { meansList, currentMean, isRunning, progress, start, pause, reset, skipTo1000 } =
    useCLTSimulation({
      distribution: selectedDist,
      sampleSize,
      speed
    })

  return (
    <div className="space-y-6">
      {/* Distribution Selector */}
      <DistributionSelector selectedDistId={selectedDistId} onSelect={setSelectedDistId} />

      {/* Simulation Controls */}
      <SimulationControls
        sampleSize={sampleSize}
        setSampleSize={setSampleSize}
        speed={speed}
        setSpeed={setSpeed}
        isRunning={isRunning}
        meansList={meansList}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onSkip={skipTo1000}
        progress={progress}
      />

      {/* Three Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Population Panel */}
        <PopulationPanel distribution={selectedDist} />

        {/* Means Distribution Panel */}
        <MeansDistributionPanel
          means={meansList}
          theoreticalMu={selectedDist.mu}
          theoreticalSigma={standardError(selectedDist.sigma, sampleSize)}
          sampleSize={sampleSize}
          distributionName={selectedDist.name}
        />
      </div>

      {/* Current status */}
      {currentMean !== null && isRunning && (
        <Alert>
          <TrendingUpIcon className="h-4 w-4" />
          <AlertTitle>Campione corrente</AlertTitle>
          <AlertDescription>
            Media del campione appena estratto: <strong>{currentMean.toFixed(2)}</strong>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Distribution Selector
function DistributionSelector({
  selectedDistId,
  onSelect
}: {
  selectedDistId: string
  onSelect: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Seleziona la Popolazione</CardTitle>
        <CardDescription>Scegli una distribuzione NON normale da cui campionare</CardDescription>
      </CardHeader>

      <CardContent>
        <RadioGroup
          value={selectedDistId}
          onValueChange={onSelect}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {distributions.map(dist => (
            <div key={dist.id}>
              <RadioGroupItem value={dist.id} id={dist.id} className="peer sr-only" />
              <Label
                htmlFor={dist.id}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="text-4xl mb-2">{dist.emoji}</div>
                <div className="text-center">
                  <p className="font-semibold">{dist.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dist.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    μ={dist.mu.toFixed(1)}, σ={dist.sigma.toFixed(1)}
                  </p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

// Simulation Controls
function SimulationControls({
  sampleSize,
  setSampleSize,
  speed,
  setSpeed,
  isRunning,
  meansList,
  onStart,
  onPause,
  onReset,
  onSkip,
  progress
}: {
  sampleSize: number
  setSampleSize: (n: number) => void
  speed: number
  setSpeed: (s: number) => void
  isRunning: boolean
  meansList: number[]
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  progress: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Controlli Simulazione</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample size */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Dimensione di ogni campione (n)</Label>
            <Select value={sampleSize.toString()} onValueChange={v => setSampleSize(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">n = 2</SelectItem>
                <SelectItem value="5">n = 5</SelectItem>
                <SelectItem value="10">n = 10</SelectItem>
                <SelectItem value="30">n = 30</SelectItem>
                <SelectItem value="50">n = 50</SelectItem>
                <SelectItem value="100">n = 100</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Numero di osservazioni in ogni campione estratto</p>
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Velocità animazione</Label>
              <span className="text-sm font-mono">{speed}ms</span>
            </div>
            <Slider min={50} max={1000} step={50} value={[speed]} onValueChange={([v]) => setSpeed(v)} />
            <p className="text-xs text-muted-foreground">Intervallo tra campionamenti (più basso = più veloce)</p>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onStart} disabled={isRunning || meansList.length >= 1000} className="flex-1">
            <PlayIcon className="h-4 w-4 mr-2" />
            {isRunning ? 'In esecuzione...' : 'Avvia Simulazione'}
          </Button>

          <Button onClick={onPause} disabled={!isRunning} variant="outline">
            <PauseIcon className="h-4 w-4 mr-2" />
            Pausa
          </Button>

          <Button onClick={onReset} variant="outline" disabled={meansList.length === 0}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reset
          </Button>

          <Button
            onClick={onSkip}
            variant="secondary"
            disabled={isRunning || meansList.length >= 1000}
          >
            <FastForwardIcon className="h-4 w-4 mr-2" />
            Salta a 1000
          </Button>
        </div>

        {/* Progress */}
        {meansList.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-base px-3 py-1">
                Campioni raccolti: {meansList.length} / 1000
              </Badge>
              <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Population Panel
function PopulationPanel({ distribution }: { distribution: Distribution }) {
  const [populationSample, setPopulationSample] = useState<number[]>([])

  useEffect(() => {
    // Generate large sample from population for visualization
    const sample = generatePopulationSample(distribution, 10000)
    setPopulationSample(sample)
  }, [distribution])

  const histogram = useMemo(() => {
    if (populationSample.length === 0) return []
    return createHistogram(populationSample, 40)
  }, [populationSample])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">
          {distribution.emoji} Popolazione Originale
        </CardTitle>
        <CardDescription>
          Distribuzione {distribution.name.toLowerCase()} (μ={distribution.mu.toFixed(1)}, σ=
          {distribution.sigma.toFixed(1)})
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={histogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="bin" tick={{ fontSize: 10 }} stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="count" fill={distribution.color} fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>

        <Alert className="mt-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Questa distribuzione <strong>NON è normale</strong>. Osserva come cambierà quando campioneremo
            ripetutamente!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Means Distribution Panel
function MeansDistributionPanel({
  means,
  theoreticalMu,
  theoreticalSigma,
  sampleSize,
  distributionName
}: {
  means: number[]
  theoreticalMu: number
  theoreticalSigma: number
  sampleSize: number
  distributionName: string
}) {
  const histogramData = useMemo(() => {
    if (means.length === 0) return []
    return createHistogramWithNormal(means, theoreticalMu, theoreticalSigma, 40)
  }, [means, theoreticalMu, theoreticalSigma])

  const normality = useMemo(() => {
    if (means.length < 30) return null
    return assessNormality(means)
  }, [means])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">📊 Distribuzione delle Medie Campionarie</CardTitle>
        <CardDescription>
          {means.length === 0
            ? 'Avvia la simulazione per vedere la distribuzione delle medie'
            : `${means.length} medie campionarie raccolte`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {means.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Clicca &quot;Avvia Simulazione&quot; per iniziare</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bin" tick={{ fontSize: 10 }} stroke="hsl(var(--foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--destructive))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />

                {/* Histogram */}
                <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" fillOpacity={0.6} name="Medie osservate" />

                {/* Theoretical normal curve */}
                {means.length >= 100 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="theoretical"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={3}
                    dot={false}
                    name="Curva normale teorica"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>

            {/* Status messages */}
            {means.length < 30 && (
              <p className="text-sm text-muted-foreground text-center">
                Raccogli almeno 30 campioni per vedere la convergenza...
              </p>
            )}

            {means.length >= 100 && (
              <Alert>
                <TrendingUpIcon className="h-4 w-4" />
                <AlertTitle className="font-semibold">🎉 Convergenza alla Normalità!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    La distribuzione delle medie (barre blu) sta convergendo verso la curva normale teorica (linea
                    rossa). Questo è il Teorema del Limite Centrale in azione!
                  </p>
                  {normality && (
                    <p className="text-xs mt-2">
                      Skewness: {normality.skewness.toFixed(3)} | Kurtosis: {normality.kurtosis.toFixed(3)}
                      {normality.isNormal && ' | ✅ Approssimativamente normale'}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {means.length >= 30 && means.length < 100 && (
              <p className="text-sm text-muted-foreground text-center">
                Continua a campionare per vedere la convergenza più chiaramente...
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Compare Sizes Panel
function CompareSizesPanel() {
  const [selectedDistId, setSelectedDistId] = useState('exponential')
  const selectedDist = getDistribution(selectedDistId)

  const sampleSizes = [2, 10, 30, 100]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">🔍 Confronto: Effetto della Dimensione Campione</CardTitle>
        <CardDescription>Come cambia la convergenza alla normalità con n diversi</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Distribution selector for comparison */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Popolazione per confronto</Label>
          <Select value={selectedDistId} onValueChange={setSelectedDistId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {distributions.map(dist => (
                <SelectItem key={dist.id} value={dist.id}>
                  {dist.emoji} {dist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid of comparisons */}
        <div className="grid grid-cols-2 gap-4">
          {sampleSizes.map(n => (
            <MiniDistributionChart key={n} distribution={selectedDist} sampleSize={n} numSamples={500} />
          ))}
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle className="font-semibold">Osservazione chiave</AlertTitle>
          <AlertDescription>
            Con <strong>n = 30</strong>, la distribuzione delle medie è già molto simile a una normale, anche se
            la popolazione originale non lo è. Questo è il motivo per cui <strong>n ≥ 30</strong> è spesso
            considerata una &quot;regola pratica&quot; per applicare il TLC.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Mini Distribution Chart
function MiniDistributionChart({
  distribution,
  sampleSize,
  numSamples
}: {
  distribution: Distribution
  sampleSize: number
  numSamples: number
}) {
  const [meansData, setMeansData] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    // Generate samples
    const means = []
    for (let i = 0; i < numSamples; i++) {
      const sample = distribution.generate(sampleSize)
      means.push(mean(sample))
    }
    setMeansData(means)
    setIsLoading(false)
  }, [distribution, sampleSize, numSamples])

  const histogram = useMemo(() => {
    if (meansData.length === 0) return []
    return createHistogram(meansData, 20)
  }, [meansData])

  const normality = useMemo(() => {
    if (meansData.length < 30) return null
    return assessNormality(meansData)
  }, [meansData])

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">n = {sampleSize}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[150px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Generando...</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={histogram}>
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {sampleSize <= 5 && '⚠️ Ancora irregolare'}
              {sampleSize > 5 && sampleSize < 30 && '🔄 Convergenza visibile'}
              {sampleSize >= 30 && normality?.isNormal && '✅ Quasi perfettamente normale'}
              {sampleSize >= 30 && !normality?.isNormal && '🔄 Avvicinandosi alla normalità'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Quiz questions
const quizQuestions = [
  {
    id: 1,
    question: 'Il Teorema del Limite Centrale afferma che:',
    options: [
      'Tutti i dati diventano normali con n abbastanza grande',
      'Le medie campionarie si distribuiscono normalmente',
      'La popolazione deve essere normale per applicare TLC',
      'Serve sempre n > 1000'
    ],
    correctIndex: 1,
    explanation:
      'Il TLC riguarda la distribuzione delle MEDIE campionarie, non dei dati individuali. La popolazione può avere qualsiasi forma (purché abbia varianza finita).'
  },
  {
    id: 2,
    question: 'Con quale n puoi iniziare ad applicare il TLC in pratica?',
    options: [
      'n ≥ 5 è sempre sufficiente',
      'n ≥ 30 è una buona regola pratica',
      'n ≥ 1000 è il minimo',
      'Dipende solo dalla popolazione'
    ],
    correctIndex: 1,
    explanation:
      'n = 30 è una regola empirica comunemente accettata. Con popolazioni molto asimmetriche potrebbe servire n maggiore, ma 30 è un buon punto di partenza.'
  },
  {
    id: 3,
    question: 'Il TLC funziona per:',
    options: [
      'Qualsiasi statistica (media, mediana, moda, etc.)',
      'Solo per medie e somme',
      'Solo se la popolazione è normale',
      'Solo con campioni molto grandi (n > 100)'
    ],
    correctIndex: 1,
    explanation:
      'Il TLC classico vale per medie (e somme). Esistono versioni generalizzate per altre statistiche, ma non è universale.'
  }
]

// CLT Quiz
function CLTQuiz() {
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
              onValueChange={value => handleAnswer(q.id, Number(value))}
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
              <Alert variant={answers[q.id] === q.correctIndex ? 'default' : 'destructive'}>
                <AlertTitle className="font-semibold">
                  {answers[q.id] === q.correctIndex ? '✅ Corretto!' : '❌ Non corretto'}
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

// Explanation Accordion
const explanations = [
  {
    title: "Perché le medie si 'normalizzano'?",
    content: (
      <div className="space-y-2">
        <p className="font-semibold">Intuizione informale:</p>
        <p>
          Quando calcoli una media, valori estremi in direzioni opposte tendono a cancellarsi. Con molte
          osservazioni, questo effetto di cancellazione domina, e tutte le medie tendono ad ammassarsi intorno al
          centro secondo una curva a campana.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          La matematica dietro il TLC è complessa (coinvolge funzioni caratteristiche e convergenza in
          distribuzione), ma il risultato è che la somma di variabili casuali indipendenti converge sempre verso
          la normale.
        </p>
      </div>
    )
  },
  {
    title: 'Condizioni di applicabilità del TLC',
    content: (
      <div className="space-y-2">
        <p className="font-semibold">Il TLC richiede:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Osservazioni <strong>indipendenti</strong> (un&apos;osservazione non influenza le altre)
          </li>
          <li>
            Popolazione con <strong>varianza finita</strong> (esiste σ²)
          </li>
          <li>
            Campione <strong>sufficientemente grande</strong> (n ≥ 30 è regola pratica)
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Nota: popolazioni con code molto pesanti (es. Cauchy) potrebbero richiedere n molto grandi.
        </p>
      </div>
    )
  },
  {
    title: 'Quanto grande deve essere n?',
    content: (
      <div className="space-y-2">
        <p>Dipende dalla forma della popolazione originale:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Popolazione già normale</strong>: n = 1 è sufficiente!
          </li>
          <li>
            <strong>Popolazione simmetrica</strong>: n ≥ 15-20 spesso basta
          </li>
          <li>
            <strong>Popolazione asimmetrica moderata</strong>: n ≥ 30 (regola comune)
          </li>
          <li>
            <strong>Popolazione fortemente asimmetrica</strong>: potrebbe servire n ≥ 50-100
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Il TLC matematico vale per n → ∞, ma in pratica n = 30 è &quot;abbastanza grande&quot; per la maggior
          parte delle applicazioni.
        </p>
      </div>
    )
  },
  {
    title: 'Il TLC non vale per tutte le statistiche',
    content: (
      <div className="space-y-2">
        <p>Il TLC classico vale per:</p>
        <ul className="list-disc list-inside">
          <li>Media campionaria (x̄)</li>
          <li>Somma campionaria (Σx)</li>
          <li>Proporzione campionaria (p̂)</li>
        </ul>
        <p className="mt-2">
          <strong>NON vale automaticamente per</strong>: mediana, moda, massimo, minimo, varianza campionaria, e
          altre statistiche. Queste hanno distribuzioni campionarie diverse.
        </p>
      </div>
    )
  }
]

function ExplanationAccordion() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">💡 Approfondimenti sul TLC</CardTitle>
        <CardDescription>Condizioni, limiti e intuizioni sul Teorema del Limite Centrale</CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {explanations.map((item, idx) => (
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
