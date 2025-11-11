"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// ========================================
// Prior Comparison Component
// ========================================

type Hypothesis = {
  id: string;
  label: string;
  pBlack: number; // Probabilità di vedere un corvo nero se l'ipotesi è vera
};

const HYPOTHESES: Hypothesis[] = [
  { id: "h1", label: "h₁: quasi tutti neri (p=0.99)", pBlack: 0.99 },
  { id: "h2", label: "h₂: molti neri (p=0.7)", pBlack: 0.7 },
  { id: "h3", label: "h₃: metà neri (p=0.5)", pBlack: 0.5 },
];

type Observation = "B" | "N"; // B = corvo nero, N = non nero

function normalize(arr: number[]): number[] {
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum === 0) return arr.map(() => 1 / arr.length);
  return arr.map((v) => v / sum);
}

function computePosteriorPath(
  rawPrior: number[],
  observations: Observation[]
): number[][] {
  const prior = normalize(rawPrior);
  const history: number[][] = [prior];
  let current = prior;

  observations.forEach((obs) => {
    const unnormalized = current.map((pi, i) => {
      const theta = HYPOTHESES[i].pBlack;
      const like = obs === "B" ? theta : 1 - theta;
      return pi * like;
    });
    const norm = normalize(unnormalized);
    current = norm;
    history.push(current);
  });

  return history;
}

const lineColors = ["#1f77b4", "#ff7f0e", "#2ca02c"]; // blu, arancio, verde

interface PosteriorChartProps {
  title: string;
  history: number[][];
}

const PosteriorChart: React.FC<PosteriorChartProps> = ({ title, history }) => {
  const width = 400;
  const height = 200;
  const padding = 30;

  const maxT = Math.max(history.length - 1, 1);

  const xScale = (t: number) =>
    padding + (t / maxT) * (width - 2 * padding);
  const yScale = (p: number) =>
    height - padding - p * (height - 2 * padding);

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white">
      <h3 className="font-semibold mb-2">{title}</h3>
      <svg width={width} height={height}>
        {/* assi */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#ccc"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#ccc"
        />

        {/* tacche y (0, 0.5, 1) */}
        {[0, 0.5, 1].map((p) => (
          <g key={p}>
            <line
              x1={padding - 4}
              y1={yScale(p)}
              x2={padding}
              y2={yScale(p)}
              stroke="#999"
            />
            <text
              x={padding - 8}
              y={yScale(p) + 4}
              fontSize={10}
              textAnchor="end"
              fill="#555"
            >
              {p.toFixed(1)}
            </text>
          </g>
        ))}

        {/* linee per ogni ipotesi */}
        {HYPOTHESES.map((h, i) => (
          <polyline
            key={h.id}
            fill="none"
            stroke={lineColors[i]}
            strokeWidth={2}
            points={history
              .map((step, t) => {
                const x = xScale(t);
                const y = yScale(step[i]);
                return `${x},${y}`;
              })
              .join(" ")}
          />
        ))}

        {/* etichette ipotesi come legenda */}
        {HYPOTHESES.map((h, i) => (
          <g key={h.id} transform={`translate(${padding + i * 120}, 15)`}>
            <rect width={10} height={10} fill={lineColors[i]} />
            <text x={16} y={10} fontSize={11} fill="#333">
              {h.id}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-gray-600 mt-1">
        Asse X: numero di osservazioni • Asse Y: probabilità posterior per ogni
        ipotesi.
      </p>
    </div>
  );
};

const SliderRow: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className="w-8 text-sm">{label}</span>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1"
    />
    <span className="w-10 text-right text-xs">{value}</span>
  </div>
);

const BayesPriorDemo: React.FC = () => {
  const [obs, setObs] = useState<Observation[]>([]);

  // prior grezzi in "punti" 0-100 (li normalizziamo noi)
  const [priorA, setPriorA] = useState<number[]>([33, 33, 34]);
  const [priorB, setPriorB] = useState<number[]>([70, 20, 10]);

  const normalizedA = useMemo(() => normalize(priorA), [priorA]);
  const normalizedB = useMemo(() => normalize(priorB), [priorB]);

  const historyA = useMemo(
    () => computePosteriorPath(priorA, obs),
    [priorA, obs]
  );
  const historyB = useMemo(
    () => computePosteriorPath(priorB, obs),
    [priorB, obs]
  );

  const countBlack = obs.filter((o) => o === "B").length;
  const countNonBlack = obs.filter((o) => o === "N").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif">
          Quanto contano i prior?
        </h1>
        <p className="text-sm text-gray-700 mt-2">
          Qui puoi confrontare due scenari con <strong>prior diversi</strong> ma{" "}
          <strong>stessa sequenza di osservazioni</strong>. All&apos;inizio le
          posteriori possono divergere parecchio, ma man mano che aumentano i
          dati tendono a convergere verso le ipotesi che spiegano meglio le
          osservazioni.
        </p>
      </div>

      {/* Controlli osservazioni */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Osservazioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setObs((prev) => [...prev, "B"])}
              className="px-3 py-1 text-sm rounded-lg bg-black text-white"
            >
              Aggiungi corvo nero
            </button>
            <button
              onClick={() => setObs((prev) => [...prev, "N"])}
              className="px-3 py-1 text-sm rounded-lg bg-gray-200"
            >
              Aggiungi corvo non nero
            </button>
            <button
              onClick={() => setObs([])}
              className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700"
            >
              Reset osservazioni
            </button>
          </div>
          <p className="text-xs text-gray-700">
            Totale osservazioni: <strong>{obs.length}</strong> (neri:{" "}
            <strong>{countBlack}</strong>, non neri:{" "}
            <strong>{countNonBlack}</strong>)
          </p>
          <div className="flex flex-wrap gap-1 text-xs">
            {obs.map((o, i) => (
              <span
                key={i}
                className={
                  "px-1.5 py-0.5 rounded-md border " +
                  (o === "B"
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-700")
                }
              >
                {o === "B" ? "nero" : "non nero"}
              </span>
            ))}
            {obs.length === 0 && (
              <span className="text-gray-500 text-xs">
                Nessuna osservazione ancora.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priors */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Scenario A – Prior</CardTitle>
            <CardDescription>
              Usa gli slider (0–100). Verranno normalizzati per sommare a 1.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {HYPOTHESES.map((h, i) => (
              <SliderRow
                key={h.id}
                label={h.id}
                value={priorA[i]}
                onChange={(v) =>
                  setPriorA((prev) =>
                    prev.map((x, j) => (j === i ? v : x))
                  )
                }
              />
            ))}
            <p className="text-xs text-gray-600 mt-2">
              Prior normalizzati:{" "}
              {normalizedA.map((p, i) => (
                <span key={i} className="mr-2">
                  {HYPOTHESES[i].id} = {p.toFixed(2)}
                </span>
              ))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Scenario B – Prior</CardTitle>
            <CardDescription>
              Qui puoi scegliere priors molto diversi per confrontare gli effetti.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {HYPOTHESES.map((h, i) => (
              <SliderRow
                key={h.id}
                label={h.id}
                value={priorB[i]}
                onChange={(v) =>
                  setPriorB((prev) =>
                    prev.map((x, j) => (j === i ? v : x))
                  )
                }
              />
            ))}
            <p className="text-xs text-gray-600 mt-2">
              Prior normalizzati:{" "}
              {normalizedB.map((p, i) => (
                <span key={i} className="mr-2">
                  {HYPOTHESES[i].id} = {p.toFixed(2)}
                </span>
              ))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafici posteriori */}
      <div className="grid md:grid-cols-2 gap-4">
        <PosteriorChart
          title="Scenario A – Posteriori nel tempo"
          history={historyA}
        />
        <PosteriorChart
          title="Scenario B – Posteriori nel tempo"
          history={historyB}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-gray-700">
            Osserva che, con poche osservazioni, gli scenari A e B possono dare
            posteriori molto diverse, perché i prior pesano. Ma se aggiungi molti
            corvi (soprattutto se la sequenza favorisce chiaramente un&apos;ipotesi),
            le due figure tendono a raccontare la stessa storia: i{" "}
            <em>dati</em> vincono sul <em>prior</em>, finché quest&apos;ultimo non è
            dogmatico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// ========================================
// Main Component with Tabs
// ========================================

function BayesTheoryTab() {
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

export default function BayesCorvi() {
  return (
    <Tabs defaultValue="theory" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="theory">Teoria di Bayes</TabsTrigger>
        <TabsTrigger value="prior">Confronto Prior</TabsTrigger>
      </TabsList>
      <TabsContent value="theory">
        <BayesTheoryTab />
      </TabsContent>
      <TabsContent value="prior">
        <BayesPriorDemo />
      </TabsContent>
    </Tabs>
  )
}
