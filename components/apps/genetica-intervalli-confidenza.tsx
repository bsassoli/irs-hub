"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const formatNumber = (num: number, decimals: number = 3): string => {
  return num.toFixed(decimals)
}

export default function GeneticaIntervalliConfidenza() {
  // Parametri
  const [pVera, setPVera] = useState(0.36)
  const [n, setN] = useState(100)
  const [confidenza, setConfidenza] = useState<"90%" | "95%" | "99%">("95%")

  // Seed per la simulazione (cambia quando clicchi "Simula nuovamente")
  const [seed, setSeed] = useState(0)

  // Mappatura livelli di confidenza -> z-score
  const zMap = {
    "90%": 1.64,
    "95%": 1.96,
    "99%": 2.58,
  }
  const z = zMap[confidenza]

  // Simulazione: genera un campione binomiale
  const { X, pHat, se, icBasso, icAlto } = useMemo(() => {
    // Generatore pseudo-casuale semplice (basato su seed)
    const random = () => {
      const x = Math.sin(seed * 12345.6789) * 10000
      return x - Math.floor(x)
    }

    // Simula X ~ Binomiale(n, pVera)
    let successi = 0
    for (let i = 0; i < n; i++) {
      const val = Math.sin((seed + i) * 12345.6789) * 10000
      const r = val - Math.floor(val)
      if (r < pVera) successi++
    }

    const X = successi
    const pHat = X / n

    // Errore standard
    const se = Math.sqrt((pHat * (1 - pHat)) / n)

    // Intervallo di confidenza
    const margine = z * se
    const icBasso = Math.max(0, pHat - margine)
    const icAlto = Math.min(1, pHat + margine)

    return { X, pHat, se, icBasso, icAlto }
  }, [pVera, n, z, seed])

  const ampiezzaIC = icAlto - icBasso

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">🧬 Genetica e Intervalli di Confidenza</CardTitle>
          <CardDescription className="text-base space-y-3">
            <p>
              Questo esperimento interattivo illustra come si stima la <strong>frequenza di un allele</strong> in una popolazione
              e come si costruisce un <strong>intervallo di confidenza</strong> basato su un campione finito.
            </p>
            <p>
              In genetica, un <strong>allele</strong> è una variante di un gene (ad esempio, l'allele per il colore rosso dei fiori).
              La <strong>frequenza allelica</strong> è la probabilità con cui un certo allele compare nella popolazione.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Spiegazione concettuale */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">💡 Come funziona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Il modello</h3>
            <p className="text-sm text-muted-foreground">
              Immaginiamo una popolazione di piante dove una certa frazione p<sub>vera</sub> mostra un tratto specifico
              (ad esempio, fiori rossi). Noi osserviamo solo un campione di <em>n</em> individui e contiamo quanti
              mostrano il tratto (successi X).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Stima della frequenza</h3>
            <p className="text-sm text-muted-foreground">
              La frequenza campionaria è p̂ = X/n. L'<strong>errore standard</strong> (SE) misura l'incertezza della stima.
              L'<strong>intervallo di confidenza</strong> fornisce un range di valori plausibili per la vera frequenza.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Controlli */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">⚙️ Parametri dell'esperimento</CardTitle>
          <CardDescription>
            Modifica i parametri per vedere come cambiano la stima e l'intervallo di confidenza
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vera frequenza */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Vera frequenza p<sub>vera</sub>
              </Label>
              <span className="text-2xl font-serif font-semibold tabular-nums">
                {formatNumber(pVera, 2)}
              </span>
            </div>
            <Slider
              value={[pVera]}
              onValueChange={([v]) => setPVera(v)}
              min={0.05}
              max={0.95}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              La frazione reale della popolazione che possiede il tratto (0.05 - 0.95)
            </p>
          </div>

          {/* Numero di individui */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Numero di individui osservati (n)</Label>
              <span className="text-2xl font-serif font-semibold tabular-nums">{n}</span>
            </div>
            <Slider
              value={[n]}
              onValueChange={([v]) => setN(v)}
              min={10}
              max={1000}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Dimensione del campione osservato (10 - 1000)
            </p>
          </div>

          {/* Livello di confidenza */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Livello di confidenza</Label>
            <Select value={confidenza} onValueChange={(v) => setConfidenza(v as "90%" | "95%" | "99%")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90%">90%</SelectItem>
                <SelectItem value="95%">95%</SelectItem>
                <SelectItem value="99%">99%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Un livello più alto produce un intervallo più ampio
            </p>
          </div>

          {/* Pulsante per simulare di nuovo */}
          <Button
            onClick={() => setSeed(seed + 1)}
            className="w-full"
            variant="default"
          >
            🔄 Simula nuovamente
          </Button>
        </CardContent>
      </Card>

      {/* Risultati */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">📊 Risultati della simulazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metriche principali */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Vera frequenza</p>
              <p className="text-3xl font-serif font-semibold tabular-nums">{formatNumber(pVera, 3)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Frequenza campionaria p̂</p>
              <p className="text-3xl font-serif font-semibold tabular-nums">{formatNumber(pHat, 3)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Individui con tratto</p>
              <p className="text-3xl font-serif font-semibold tabular-nums">{X} / {n}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Errore standard (SE)</p>
              <p className="text-3xl font-serif font-semibold tabular-nums">{formatNumber(se, 3)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ampiezza IC {confidenza}</p>
              <p className="text-3xl font-serif font-semibold tabular-nums">{formatNumber(ampiezzaIC, 3)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dimensione campione</p>
              <p className="text-3xl font-serif font-semibold tabular-nums">{n}</p>
            </div>
          </div>

          {/* Intervallo di confidenza */}
          <div className="space-y-3">
            <h3 className="font-semibold">
              Intervallo di confidenza {confidenza} sulla frequenza del tratto:
            </h3>
            <p className="text-xl font-serif">
              [{formatNumber(icBasso, 3)}, {formatNumber(icAlto, 3)}]
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• La barra verticale centrale rappresenta la frequenza campionaria p̂</p>
              <p>• La barra orizzontale rappresenta l'intervallo di confidenza</p>
              <p>• La linea tratteggiata indica la <strong>vera</strong> frequenza p<sub>vera</sub></p>
            </div>
          </div>

          {/* Visualizzazione grafica */}
          <div className="w-full overflow-x-auto">
            <svg width="100%" height="200" viewBox="0 0 800 200" className="border rounded">
              {/* Scala 0-1 */}
              <line x1="50" y1="100" x2="750" y2="100" stroke="#e5e5e5" strokeWidth="2" />

              {/* Tick marks */}
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((tick) => {
                const x = 50 + tick * 700
                return (
                  <g key={tick}>
                    <line x1={x} y1="95" x2={x} y2="105" stroke="#999" strokeWidth="1" />
                    <text x={x} y="125" textAnchor="middle" fontSize="12" fill="#666">
                      {tick.toFixed(1)}
                    </text>
                  </g>
                )
              })}

              {/* Intervallo di confidenza */}
              <line
                x1={50 + icBasso * 700}
                y1="100"
                x2={50 + icAlto * 700}
                y2="100"
                stroke="#003366"
                strokeWidth="6"
              />

              {/* Frequenza campionaria p̂ */}
              <line
                x1={50 + pHat * 700}
                y1="70"
                x2={50 + pHat * 700}
                y2="130"
                stroke="#003366"
                strokeWidth="3"
              />
              <text
                x={50 + pHat * 700}
                y="55"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#003366"
              >
                p̂
              </text>

              {/* Vera frequenza p_vera */}
              <line
                x1={50 + pVera * 700}
                y1="60"
                x2={50 + pVera * 700}
                y2="140"
                stroke="#e11d48"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={50 + pVera * 700}
                y="160"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#e11d48"
              >
                p_vera
              </text>

              {/* Label asse */}
              <text x="400" y="180" textAnchor="middle" fontSize="14" fill="#666">
                Frequenza del tratto / allele
              </text>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Domande per la discussione */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">🤔 Spunti per la discussione</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>1.</strong> Cosa succede all'ampiezza dell'intervallo di confidenza quando aumenti il numero di individui <em>n</em>?
            </li>
            <li>
              <strong>2.</strong> Cosa succede quando la frequenza vera p<sub>vera</sub> è vicina a 0 o a 1 rispetto a quando è intorno a 0.5?
            </li>
            <li>
              <strong>3.</strong> Perché un livello di confidenza del 99% produce un intervallo più ampio rispetto al 90%?
            </li>
            <li>
              <strong>4.</strong> In che senso la <strong>frequenza allelica vera</strong> p<sub>vera</sub> è una proprietà della popolazione e non del singolo campione?
            </li>
            <li>
              <strong>5.</strong> L'intervallo di confidenza descrive l'<strong>incertezza epistemica</strong> sul parametro vero oppure il comportamento <strong>frequenziale</strong> della procedura di stima?
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Nota finale */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Questo esempio mostra come lo stesso concetto di <strong>intervallo di confidenza</strong> sia applicabile
            sia in Fisica (pressione di un gas) sia in Genetica (frequenza di un allele),
            mettendo in evidenza il ruolo dei <strong>modelli statistici</strong> nel collegare mondo microscopico,
            popolazioni e dati osservati.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
