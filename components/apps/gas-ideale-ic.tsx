"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { InfoIcon, RefreshCwIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts"

// Utility for formatting numbers
const formatNumber = (num: number, decimals: number = 3): string => {
  return num.toFixed(decimals)
}

// Box-Muller transform for generating normal random variables
function generateNormal(mean: number, stdDev: number): number {
  let u1 = 0, u2 = 0
  while (u1 === 0) u1 = Math.random()
  while (u2 === 0) u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

// Generate array of normal measurements
function generateMeasurements(truePressure: number, sigma: number, n: number): number[] {
  return Array.from({ length: n }, () => generateNormal(truePressure, sigma))
}

// Calculate sample statistics
function calculateStats(measurements: number[]) {
  const n = measurements.length
  const mean = measurements.reduce((sum, val) => sum + val, 0) / n
  const variance = measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  const se = stdDev / Math.sqrt(n)
  return { mean, stdDev, se }
}

// Z-scores for confidence levels
const Z_SCORES: Record<string, number> = {
  "90": 1.64,
  "95": 1.96,
  "99": 2.58,
}

export default function GasIdealeIC() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <SimulationSection />
      <EducationalQuestions />
    </div>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl font-semibold">⚗️ Gas Ideale e Intervalli di Confidenza</h1>
        <p className="text-lg text-muted-foreground">
          Un esperimento interattivo di Filosofia della Scienza e Statistica Inferenziale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Il Modello</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Immaginiamo un gas ideale chiuso in un contenitore rigido, a temperatura costante.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>A livello microscopico il gas è fatto di moltissime molecole in moto caotico.</li>
            <li>Ogni molecola urta contro le pareti esercitando una piccola <strong>spinta</strong>.</li>
            <li>
              La <strong>pressione</strong> è la spinta totale per unità di area:{" "}
              <span className="font-mono">P = F/A</span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            In questo modello supponiamo che esista una vera pressione media <em>P<sub>vera</sub></em> e che il nostro
            sensore fornisca misure rumorose intorno a quel valore. Vogliamo stimare{" "}
            <em>P<sub>vera</sub></em> e costruire un <strong>intervallo di confidenza</strong>.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

// Main Simulation Section
function SimulationSection() {
  const [pVera, setPVera] = useState(1.0)
  const [sigma, setSigma] = useState(0.05)
  const [n, setN] = useState(25)
  const [confidenza, setConfidenza] = useState("95")
  const [seed, setSeed] = useState(0) // Used to trigger re-simulation

  // Memoize measurements to avoid recalculating unless parameters change
  const measurements = useMemo(() => {
    return generateMeasurements(pVera, sigma, n)
  }, [pVera, sigma, n, seed])

  const stats = useMemo(() => calculateStats(measurements), [measurements])
  const z = Z_SCORES[confidenza]
  const margin = z * stats.se
  const ciLower = stats.mean - margin
  const ciUpper = stats.mean + margin
  const ciWidth = ciUpper - ciLower

  // Prepare histogram data
  const histogramData = useMemo(() => {
    const bins = Math.max(5, Math.floor(n / 5))
    const min = Math.min(...measurements)
    const max = Math.max(...measurements)
    const binWidth = (max - min) / bins

    const histogram = Array.from({ length: bins }, (_, i) => {
      const binStart = min + i * binWidth
      const binEnd = binStart + binWidth
      const binCenter = (binStart + binEnd) / 2
      const count = measurements.filter(m => m >= binStart && m < binEnd).length
      return { binCenter: formatNumber(binCenter, 3), count, binStart, binEnd }
    })

    return histogram
  }, [measurements, n])

  const handleResimulate = () => {
    setSeed(prev => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">🔬 Esperimento di Misurazione</CardTitle>
        <CardDescription>
          Modifica i parametri e osserva come variano media, errore standard e intervallo di confidenza
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Parameter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* True Pressure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">
                Vera pressione P<sub>vera</sub> (atm)
              </Label>
              <span className="text-xl font-serif font-semibold tabular-nums">{formatNumber(pVera, 2)}</span>
            </div>
            <Slider
              min={0.8}
              max={1.2}
              step={0.01}
              value={[pVera]}
              onValueChange={([value]) => setPVera(value)}
            />
          </div>

          {/* Sensor Noise */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Rumore del sensore σ (atm)</Label>
              <span className="text-xl font-serif font-semibold tabular-nums">{formatNumber(sigma, 3)}</span>
            </div>
            <Slider
              min={0.005}
              max={0.20}
              step={0.005}
              value={[sigma]}
              onValueChange={([value]) => setSigma(value)}
            />
          </div>

          {/* Number of Measurements */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Numero di misure n</Label>
              <span className="text-xl font-serif font-semibold tabular-nums">{n}</span>
            </div>
            <Slider
              min={5}
              max={200}
              step={5}
              value={[n]}
              onValueChange={([value]) => setN(value)}
            />
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Livello di confidenza</Label>
            <Select value={confidenza} onValueChange={setConfidenza}>
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
        </div>

        {/* Resimulate Button */}
        <Button onClick={handleResimulate} variant="outline" className="w-full">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Nuova simulazione (stesso parametri)
        </Button>

        {/* Results Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            label={<>P<sub>vera</sub> (atm)</>}
            value={formatNumber(pVera)}
            description="Vera pressione"
          />
          <MetricCard
            label="Media campionaria (atm)"
            value={formatNumber(stats.mean)}
            description="x̄"
          />
          <MetricCard
            label="σ rumore sensore (atm)"
            value={formatNumber(sigma)}
            description="Deviazione standard del sensore"
          />
          <MetricCard
            label="Dev. std. campionaria s (atm)"
            value={formatNumber(stats.stdDev)}
            description="Stima di σ dal campione"
          />
          <MetricCard
            label="Errore standard SE (atm)"
            value={formatNumber(stats.se)}
            description="s / √n"
          />
          <MetricCard
            label={`Ampiezza IC ${confidenza}%`}
            value={`${formatNumber(ciWidth)} atm`}
            description="Larghezza intervallo"
          />
        </div>

        {/* Confidence Interval Display */}
        <div className="p-4 bg-[#003366] text-white rounded-lg space-y-2">
          <p className="text-sm opacity-90">Intervallo di confidenza al {confidenza}%:</p>
          <p className="text-2xl font-serif font-semibold text-center">
            [{formatNumber(ciLower)}, {formatNumber(ciUpper)}] atm
          </p>
          <p className="text-xs text-center opacity-80">
            La vera pressione P<sub>vera</sub> = {formatNumber(pVera)} atm è{" "}
            {pVera >= ciLower && pVera <= ciUpper ? "dentro" : "fuori"} questo intervallo
          </p>
        </div>

        {/* Histogram Visualization */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-center">
            Distribuzione delle Misure e Intervallo di Confidenza
          </h3>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="binCenter"
                  label={{ value: "Pressione misurata (atm)", position: "insideBottom", offset: -10 }}
                />
                <YAxis label={{ value: "Frequenza", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-2 border rounded shadow-lg">
                          <p className="text-xs">
                            Range: [{formatNumber(data.binStart, 3)}, {formatNumber(data.binEnd, 3)})
                          </p>
                          <p className="text-xs font-semibold">Frequenza: {data.count}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" fill="#8884d8" />
                <ReferenceLine x={formatNumber(stats.mean, 3)} stroke="#003366" strokeWidth={2} label="Media" />
                <ReferenceLine
                  x={formatNumber(ciLower, 3)}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label="IC inf"
                />
                <ReferenceLine
                  x={formatNumber(ciUpper, 3)}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label="IC sup"
                />
                <ReferenceLine
                  x={formatNumber(pVera, 3)}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label="P_vera"
                />
                <Legend
                  content={() => (
                    <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-[#003366]"></div>
                        <span>Media campionaria</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-[#22c55e]" style={{ borderTop: "2px dashed" }}></div>
                        <span>IC limiti</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-[#ef4444]" style={{ borderTop: "2px dashed" }}></div>
                        <span>P<sub>vera</sub></span>
                      </div>
                    </div>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            La linea tratteggiata verde indica l&apos;intervallo di confidenza. La linea rossa indica la vera
            pressione P<sub>vera</sub>.
          </p>
        </div>

        {/* Interpretation Alert */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle className="font-semibold">Interpretazione</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>↑ n (più misure)</strong> → ↓ errore standard → intervallo più stretto (più preciso)
              </li>
              <li>
                <strong>↑ σ (più rumore)</strong> → ↑ errore standard → intervallo più largo (meno preciso)
              </li>
              <li>
                <strong>↑ confidenza</strong> → z più grande → intervallo più largo (più sicurezza ma meno precisione)
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Metric Card Component
interface MetricCardProps {
  label: React.ReactNode
  value: string
  description: string
}

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-muted/50 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-2xl font-serif font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

// Educational Questions
const questions = [
  {
    question: "Cosa succede all'ampiezza dell'intervallo di confidenza quando aumenti il numero di misure n?",
    answer:
      "L'intervallo diventa più stretto. Più misure → errore standard più piccolo (SE = s/√n) → intervallo più preciso.",
  },
  {
    question: "Cosa succede quando aumenti il rumore del sensore σ?",
    answer:
      "L'intervallo diventa più largo. Più rumore → maggiore variabilità → errore standard più grande → intervallo meno preciso.",
  },
  {
    question: "Perché l'intervallo di confidenza al 99% è più ampio di quello al 90%?",
    answer:
      "Per avere maggiore confidenza di catturare il parametro vero, dobbiamo allargare l'intervallo. È un trade-off: più confidenza = meno precisione.",
  },
  {
    question:
      "In che senso la 'vera' pressione P_vera è legata a una media su moltissime configurazioni microscopiche del gas?",
    answer:
      "A livello microscopico, le molecole del gas sono in continuo movimento caotico. La pressione macroscopica emerge come media statistica di miliardi di urti molecolari. P_vera rappresenta questa media su tutte le configurazioni microscopiche possibili del sistema.",
  },
  {
    question: "L'intervallo di confidenza parla della procedura statistica o del valore vero?",
    answer:
      "L'intervallo di confidenza parla della PROCEDURA STATISTICA. Il 95% significa che se ripetessimo l'esperimento molte volte, circa il 95% degli intervalli calcolati conterrebbe il valore vero. NON significa che c'è il 95% di probabilità che il valore vero sia in questo specifico intervallo (il parametro è fisso, l'intervallo è casuale).",
  },
]

function EducationalQuestions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">💭 Come Usare Questo Esempio in Classe</CardTitle>
        <CardDescription>
          Domande da porre agli studenti mentre modifichi i parametri
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {questions.map((q, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left">{q.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">{q.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">Questo esempio mette in contatto:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Il livello <strong>microscopico</strong> (molecole in moto caotico)
            </li>
            <li>
              Il livello <strong>macroscopico</strong> (pressione come grandezza emergente)
            </li>
            <li>
              Il livello <strong>inferenziale</strong> (stima e intervalli di confidenza)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
