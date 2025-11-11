"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BlockMath, InlineMath } from 'react-katex'
import { calculateProbabilityHistory, calculateNextRavenBlackProb } from '@/lib/bayes-calculations'

export default function BayesCorvi() {
  const [numObservations, setNumObservations] = useState(4)

  // Calculate probability history
  const history = useMemo(() => calculateProbabilityHistory(numObservations), [numObservations])

  // Current probabilities
  const currentProbs = history[history.length - 1]
  const nextRavenBlackProb = calculateNextRavenBlackProb([currentProbs.h1, currentProbs.h2, currentProbs.h3])

  // Prepare chart data
  const chartData = history.map((snapshot, index) => ({
    observation: index,
    'h1 (tutti neri)': snapshot.h1,
    'h2 (metà neri)': snapshot.h2,
    'h3 (zero neri)': snapshot.h3,
  }))

  const ceChartData = history.map((snapshot, index) => ({
    observation: index,
    'C(e)': snapshot.ce,
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-[5fr_4fr]">
      {/* Left Column - Educational Content */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Teorema di Bayes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-black">
              Ricordiamo la formulazione del{" "}
              <a
                href="https://it.wikipedia.org/wiki/Teorema_di_Bayes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003366] underline hover:text-[#004488]"
              >
                <strong>teorema di Bayes</strong>
              </a>
              {" "}e vediamone un caso pratico (ispirato da Michael Strevens,{" "}
              <a
                href="https://www.strevens.org/bct/BCT.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003366] underline hover:text-[#004488]"
              >
                Notes on Bayesian Confirmation Theory
              </a>
              {" "}(2017))
            </p>

            <div className="my-4 overflow-x-auto">
              <BlockMath math="P(h\mid e) = \dfrac{P(e \mid h)P(h)}{P(e)}" />
            </div>

            <p className="text-black">
              Ora immaginiamo di avere tre ipotesi in competizione tra loro, e di non avere ancora alcuno tipo di riscontro empirico:
            </p>

            <ul className="ml-6 list-disc space-y-2 text-black">
              <li><InlineMath math="h_1" /> = tutti i corvi sono neri</li>
              <li><InlineMath math="h_2" /> = metà dei corvi è nera</li>
              <li><InlineMath math="h_3" /> = nessun corvo è nero</li>
            </ul>

            <p className="text-black">
              Dato che non ho ancora raccolto alcuna evidenza, assegno alle tre ipotesi la stessa probabilità a priori:{" "}
              <InlineMath math="P(h_1)=P(h_2)=P(h_3) = \dfrac{1}{3}" />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">1. Osservo un corvo nero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-black">
              Al tempo <InlineMath math="t_1" /> osservo un corvo nero. Come cambiano le mie credenze nelle tre ipotesi?
              Cioè, applicando il teorema di Bayes, quale sarà la probabilità <InlineMath math="P(h|e)" /> dato{" "}
              <InlineMath math="e=\text{ho osservato un corvo nero}" /> per ognuna di <InlineMath math="h_1, h_2, h_3" />?
            </p>

            <p className="text-black">Iniziamo osservando che:</p>

            <ul className="ml-6 list-disc space-y-2 text-black">
              <li><InlineMath math="P(e\mid h_1) = 1.0" /> - la probabilità di osservare un corvo nero dato che so che tutti i corvi sono neri</li>
              <li><InlineMath math="P(e\mid h_2) = 0.5" /> - la probabilità di osservare un corvo nero dato che so che metà dei corvi sono neri</li>
              <li><InlineMath math="P(e \mid h_3) = 0.0" /> - la probabilità di osservare un corvo nero dato che so che nessun corvo è nero</li>
            </ul>

            <p className="text-black">
              A questo punto per applicare il teorema di Bayes mi manca solo il denominatore, cioè <InlineMath math="P(e)" />,
              la probabilità di osservare un corvo nero. Per calcolare <InlineMath math="P(e)" /> posso applicare il{" "}
              <a
                href="https://it.wikipedia.org/wiki/Teorema_della_probabilit%C3%A0_totale"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003366] underline hover:text-[#004488]"
              >
                teorema della probabilità totale
              </a>:
            </p>

            <div className="my-4 overflow-x-auto">
              <BlockMath math="\begin{align*}P(e) &= P(e | h_1)P(h_1) + P(e | h_2)P(h_2) + P(e | h_3)P(h_3)\\&= 1 \times \frac{1}{3} + \frac{1}{2} \times \frac{1}{3} + 0 \times \frac{1}{3}\\&= \frac{1}{2}\end{align*}" />
            </div>

            <p className="text-black">Di conseguenza, dopo aver osservato un corvo avrò:</p>

            <ul className="ml-6 list-disc space-y-2 text-black">
              <li><InlineMath math="P(h_1\mid e) = \dfrac{1 \times \dfrac{1}{3}}{\dfrac{1}{2}}=\dfrac{2}{3}" /></li>
              <li><InlineMath math="P(h_2\mid e) = \dfrac{\dfrac{1}{2} \times \dfrac{1}{3}}{\dfrac{1}{2}}=\dfrac{1}{3}" /></li>
              <li><InlineMath math="P(h_3\mid e) = \dfrac{0\times \dfrac{1}{3}}{\dfrac{1}{2}}=0" /></li>
            </ul>

            <p className="text-black">
              La probabilità della prima ipotesi <InlineMath math="h_1" />, che tutti i corvi siano neri, è raddoppiata,
              passando da 1/3 a 2/3; quella dell'ipotesi che metà dei corvi siano neri, <InlineMath math="h_2" />, è rimasta immutata;
              mentre la probabilità dell'ipotesi <InlineMath math="h_3" />, che nessun corvo sia nero è ora pari a 0
              (come intuitivamente ci aspettiamo che sia), e possiamo di conseguenza scartarla.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">2. Osservo un secondo corvo nero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-black">
              Cosa succede se a questo punto osservo un secondo corvo nero? Per prima cosa dovrò calcolare qual è{" "}
              <InlineMath math="P(e)" /> a questo stadio utilizzando di nuovo il teorema della probabilità totale:
            </p>

            <div className="my-4 overflow-x-auto">
              <BlockMath math="\begin{align*}P(e) &= P(e \mid h_1)P(h_1) + P(e \mid h_2)P(h_2)\\&= 1 \times \frac{2}{3} + \frac{1}{2} \times \frac{1}{3}\\&= \frac{5}{6}\end{align*}" />
            </div>

            <p className="text-black">E, applicando nuovamente il teorema di Bayes, avrò:</p>

            <ul className="ml-6 list-disc space-y-2 text-black">
              <li><InlineMath math="P(h_1\mid e) = \dfrac{1 \times \dfrac{2}{3}}{\dfrac{5}{6}}=\dfrac{4}{5}" /></li>
              <li><InlineMath math="P(h_2\mid e) = \dfrac{\dfrac{1}{2} \times \dfrac{1}{3}}{\dfrac{5}{6}}=\dfrac{1}{5}" /></li>
            </ul>

            <p className="text-black">
              Da notare che la probabilità di <InlineMath math="h_1" /> questa volta aumenta ma non raddoppia,
              e la probabilità di <InlineMath math="h_2" /> invece diminuisce sensibilmente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">3. Terza (e successive) osservazione di un corvo nero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-black">
              Dopo la seconda volta che osservo un corvo nero la probabilità che il prossimo corvo sarà nero è salita a:
            </p>

            <div className="my-4 overflow-x-auto">
              <BlockMath math="\begin{align*}P(e)&= 1\times\frac{4}{5} + \frac{1}{2}\times\frac{1}{5}\\&=\frac{9}{10}\end{align*}" />
            </div>

            <p className="text-black">
              Di conseguenza (saltando questa volta i calcoli espliciti): La probabilità della terza ipotesi resta zero,
              la probabilità della prima continua ad avvicinarsi a 1 ma in modo sempre meno drammatico e la probabilità
              della seconda ipotesi si avvicina a sua volta a zero. La tabella successiva riassume l'evoluzione delle
              credenze nelle tre ipotesi.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Tabella di Evoluzione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Corvi osservati</TableHead>
                    <TableHead className="text-center"><InlineMath math="P(h_1)" /></TableHead>
                    <TableHead className="text-center"><InlineMath math="P(h_2)" /></TableHead>
                    <TableHead className="text-center"><InlineMath math="P(h_3)" /></TableHead>
                    <TableHead className="text-center"><InlineMath math="P(e)" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center">0</TableCell>
                    <TableCell className="text-center">1/3</TableCell>
                    <TableCell className="text-center">1/3</TableCell>
                    <TableCell className="text-center">1/3</TableCell>
                    <TableCell className="text-center">1/2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">1</TableCell>
                    <TableCell className="text-center">2/3</TableCell>
                    <TableCell className="text-center">1/3</TableCell>
                    <TableCell className="text-center">0</TableCell>
                    <TableCell className="text-center">5/6</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">2</TableCell>
                    <TableCell className="text-center">4/5</TableCell>
                    <TableCell className="text-center">1/5</TableCell>
                    <TableCell className="text-center">0</TableCell>
                    <TableCell className="text-center">9/10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">3</TableCell>
                    <TableCell className="text-center">8/9</TableCell>
                    <TableCell className="text-center">1/9</TableCell>
                    <TableCell className="text-center">0</TableCell>
                    <TableCell className="text-center">17/18</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">...</TableCell>
                    <TableCell className="text-center">...</TableCell>
                    <TableCell className="text-center">...</TableCell>
                    <TableCell className="text-center">...</TableCell>
                    <TableCell className="text-center">...</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">4. E quindi?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-black">
              Il teorema di Bayes, che come abbiamo visto è una sorta di conseguenza banalissima delle leggi fondamentali
              della probabilità (ricordate che la sua dimostrazione non chiede altro che la definizione di probabilità condizionata),
              cattura moltissime delle nostre intuizioni sulla relazione tra evidenza empirica ed evoluzione delle credenze nella
              probabilità di un'ipotesi.
            </p>

            <p className="text-black">Più specificamente, per esempio:</p>

            <ol className="ml-6 list-decimal space-y-2 text-black">
              <li>Se un'ipotesi è logicamente incoerente con l'evidenza, la sua probabilità va a zero.</li>
              <li>Una volta che la probabilità di un'ipotesi scende a zero, non può mai risalire. L'ipotesi viene eliminata.</li>
              <li>
                L'ipotesi che assegna la più alta probabilità all'evidenza osservata (<InlineMath math="h_1" /> nel nostro esempio)
                riceve il maggior incremento di probabilità dall'osservazione dell'evidenza. Un'ipotesi che assegna probabilità 1
                all'evidenza riceverà il massimo incremento possibile nelle circostanze.
              </li>
              <li>
                Se un'ipotesi è coerente con l'evidenza, la sua probabilità non può mai scendere a zero, anche se può avvicinarsi
                a zero quanto si desidera (come accadrebbe alla probabilità di <InlineMath math="h_2" /> se venissero osservati solo corvi neri).
              </li>
              <li>
                A mano a mano che un'ipotesi diventa dominante, nel senso che la sua probabilità si avvicina a uno, il suo incremento
                di probabilità derivante da ulteriori predizioni di successo diminuisce (anche se c'è sempre un incremento).
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Interactive Simulation */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Simulazione Interattiva</CardTitle>
            <CardDescription>
              Questo è un'applicazione interattiva per simulare il teorema di Bayes con un esempio pratico
              realizzata per il corso di Introduzione al Ragionamento Scientifico, A.A. 2025/2026, Università di Milano.
            </CardDescription>
            <div className="mt-4">
              <a
                href="mailto:bernardino.sassoli@unimi.it"
                className="text-[#003366] underline hover:text-[#004488]"
              >
                Bernardino Sassoli
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-black">
                  Numero di corvi neri osservati:
                </label>
                <span className="font-serif text-2xl font-normal tabular-nums text-[#003366]">
                  {numObservations}
                </span>
              </div>
              <Slider
                value={[numObservations]}
                onValueChange={(value) => setNumObservations(value[0])}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Evoluzione della probabilità delle ipotesi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
                <XAxis
                  dataKey="observation"
                  label={{ value: 'Numero di corvi neri osservati', position: 'insideBottom', offset: -5 }}
                  stroke="#666666"
                />
                <YAxis
                  label={{ value: 'Probabilità', angle: -90, position: 'insideLeft' }}
                  stroke="#666666"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC' }}
                  formatter={(value: number) => value.toFixed(4)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="h1 (tutti neri)"
                  stroke="#003366"
                  strokeWidth={2}
                  dot={{ fill: '#003366', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="h2 (metà neri)"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B6B', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="h3 (zero neri)"
                  stroke="#95A5A6"
                  strokeWidth={2}
                  dot={{ fill: '#95A5A6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Evoluzione di C(e)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
                <XAxis
                  dataKey="observation"
                  label={{ value: 'Numero di corvi neri osservati', position: 'insideBottom', offset: -5 }}
                  stroke="#666666"
                />
                <YAxis
                  label={{ value: 'C(e)', angle: -90, position: 'insideLeft' }}
                  stroke="#666666"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC' }}
                  formatter={(value: number) => value.toFixed(4)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="C(e)"
                  stroke="#9B59B6"
                  strokeWidth={2}
                  dot={{ fill: '#9B59B6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Probabilità dopo {numObservations} osservazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-3">
              <span className="text-sm font-semibold text-black">
                <InlineMath math="h_1" /> (tutti neri):
              </span>
              <span className="font-serif text-2xl font-normal tabular-nums text-[#003366]">
                {currentProbs.h1.toFixed(10)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-3">
              <span className="text-sm font-semibold text-black">
                <InlineMath math="h_2" /> (metà neri):
              </span>
              <span className="font-serif text-2xl font-normal tabular-nums text-black">
                {currentProbs.h2.toFixed(10)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#CCCCCC] bg-[#F5F5F5] p-3">
              <span className="text-sm font-semibold text-black">
                <InlineMath math="h_3" /> (nessuno nero):
              </span>
              <span className="font-serif text-2xl font-normal tabular-nums text-black">
                {currentProbs.h3.toFixed(10)}
              </span>
            </div>
            <div className="mt-4 rounded-lg border-2 border-[#003366] bg-white p-4">
              <span className="text-sm font-semibold text-[#666666]">
                Credenza che il prossimo corvo sarà nero:
              </span>
              <p className="mt-2 font-serif text-3xl font-normal tabular-nums text-[#003366]">
                {nextRavenBlackProb.toFixed(10)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
