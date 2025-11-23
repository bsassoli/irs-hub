'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

type NodeId = 'income' | 'genetics' | 'smoking' | 'healthcare' | 'lighter' | 'disease'

interface InterventionState {
  node: NodeId | null
  value: number | null
}

export default function CausalNetworkSmoking() {
  const [currentStep, setCurrentStep] = useState(0)
  const [intervention, setIntervention] = useState<InterventionState>({ node: null, value: null })

  // Adjustable base probabilities
  const [pIncome, setPIncome] = useState(30) // 30% high income
  const [pGenetics, setPGenetics] = useState(15) // 15% genetic risk
  const [pSmoking, setPSmoking] = useState(25) // 25% smokers

  // Convert to decimals for calculations
  const pI = pIncome / 100
  const pG = pGenetics / 100
  const pS = pSmoking / 100

  // Conditional probabilities (fixed for simplicity)
  const pHealthcareGivenIncome = 0.80 // Good healthcare if high income
  const pHealthcareGivenNoIncome = 0.30 // Good healthcare if low income
  const pLighterGivenSmoking = 0.90 // 90% of smokers carry lighter
  const pLighterGivenNoSmoking = 0.05 // 5% of non-smokers carry lighter

  // P(Disease | Genetics, Smoking, Healthcare) - using noisy-OR like model
  const getDiseaseProb = (genetics: number, smoking: number, healthcare: number): number => {
    let prob = 0.05 // Baseline 5%
    if (genetics === 1) prob += 0.25 // +25% if genetic risk
    if (smoking === 1) prob += 0.35 // +35% if smoker
    if (healthcare === 1) prob *= 0.40 // 60% reduction if good healthcare
    return Math.min(prob, 0.95) // Cap at 95%
  }

  // Calculate marginal probabilities (natural observation)
  const calculateMarginals = () => {
    let pHealthcare = 0
    let pLighter = 0
    let pDisease = 0

    for (let income = 0; income <= 1; income++) {
      for (let genetics = 0; genetics <= 1; genetics++) {
        for (let smoking = 0; smoking <= 1; smoking++) {
          const pInc = income === 1 ? pI : (1 - pI)
          const pGen = genetics === 1 ? pG : (1 - pG)
          const pSmk = smoking === 1 ? pS : (1 - pS)

          const pHGivenI = income === 1 ? pHealthcareGivenIncome : pHealthcareGivenNoIncome
          const pLGivenS = smoking === 1 ? pLighterGivenSmoking : pLighterGivenNoSmoking

          for (let healthcare = 0; healthcare <= 1; healthcare++) {
            for (let lighter = 0; lighter <= 1; lighter++) {
              const pH = healthcare === 1 ? pHGivenI : (1 - pHGivenI)
              const pL = lighter === 1 ? pLGivenS : (1 - pLGivenS)

              const pD = getDiseaseProb(genetics, smoking, healthcare)

              const jointProb = pInc * pGen * pSmk * pH * pL
              pHealthcare += healthcare === 1 ? jointProb : 0
              pLighter += lighter === 1 ? jointProb : 0
              pDisease += pD * jointProb
            }
          }
        }
      }
    }

    return { pHealthcare, pLighter, pDisease }
  }

  // Calculate conditional probabilities (observation)
  const calculateConditional = (observeNode: NodeId, observeValue: number) => {
    let pDiseaseCond = 0
    let totalProb = 0

    for (let income = 0; income <= 1; income++) {
      for (let genetics = 0; genetics <= 1; genetics++) {
        for (let smoking = 0; smoking <= 1; smoking++) {
          for (let healthcare = 0; healthcare <= 1; healthcare++) {
            for (let lighter = 0; lighter <= 1; lighter++) {
              const matches = (
                (observeNode === 'income' && income !== observeValue) ||
                (observeNode === 'genetics' && genetics !== observeValue) ||
                (observeNode === 'smoking' && smoking !== observeValue) ||
                (observeNode === 'healthcare' && healthcare !== observeValue) ||
                (observeNode === 'lighter' && lighter !== observeValue)
              )

              if (matches) continue

              const pInc = income === 1 ? pI : (1 - pI)
              const pGen = genetics === 1 ? pG : (1 - pG)
              const pSmk = smoking === 1 ? pS : (1 - pS)
              const pHGivenI = income === 1 ? pHealthcareGivenIncome : pHealthcareGivenNoIncome
              const pH = healthcare === 1 ? pHGivenI : (1 - pHGivenI)
              const pLGivenS = smoking === 1 ? pLighterGivenSmoking : pLighterGivenNoSmoking
              const pL = lighter === 1 ? pLGivenS : (1 - pLGivenS)

              const jointProb = pInc * pGen * pSmk * pH * pL
              const pD = getDiseaseProb(genetics, smoking, healthcare)

              totalProb += jointProb
              pDiseaseCond += pD * jointProb
            }
          }
        }
      }
    }

    return totalProb > 0 ? pDiseaseCond / totalProb : 0
  }

  // Calculate interventional probabilities (experimental manipulation)
  const calculateIntervention = (interventionNode: NodeId, interventionValue: number) => {
    let pDiseaseIntervention = 0
    let totalProb = 0

    for (let income = 0; income <= 1; income++) {
      for (let genetics = 0; genetics <= 1; genetics++) {
        for (let smoking = 0; smoking <= 1; smoking++) {
          for (let healthcare = 0; healthcare <= 1; healthcare++) {
            for (let lighter = 0; lighter <= 1; lighter++) {
              let actualIncome = income
              let actualGenetics = genetics
              let actualSmoking = smoking
              let actualHealthcare = healthcare
              let actualLighter = lighter

              if (interventionNode === 'income') actualIncome = interventionValue
              if (interventionNode === 'genetics') actualGenetics = interventionValue
              if (interventionNode === 'smoking') actualSmoking = interventionValue
              if (interventionNode === 'healthcare') actualHealthcare = interventionValue
              if (interventionNode === 'lighter') actualLighter = interventionValue

              // When we intervene, we break parent links
              let jointProb = 1

              // Income (exogenous, unless intervened)
              if (interventionNode === 'income') {
                jointProb *= actualIncome === interventionValue ? 1 : 0
              } else {
                jointProb *= income === 1 ? pI : (1 - pI)
              }

              // Genetics (exogenous, unless intervened)
              if (interventionNode === 'genetics') {
                jointProb *= actualGenetics === interventionValue ? 1 : 0
              } else {
                jointProb *= genetics === 1 ? pG : (1 - pG)
              }

              // Smoking (exogenous, unless intervened)
              if (interventionNode === 'smoking') {
                jointProb *= actualSmoking === interventionValue ? 1 : 0
              } else {
                jointProb *= smoking === 1 ? pS : (1 - pS)
              }

              // Healthcare (depends on income, unless intervened)
              if (interventionNode === 'healthcare') {
                jointProb *= actualHealthcare === interventionValue ? 1 : 0
              } else {
                const pHGivenI = actualIncome === 1 ? pHealthcareGivenIncome : pHealthcareGivenNoIncome
                jointProb *= healthcare === 1 ? pHGivenI : (1 - pHGivenI)
              }

              // Lighter (depends on smoking, unless intervened)
              if (interventionNode === 'lighter') {
                jointProb *= actualLighter === interventionValue ? 1 : 0
              } else {
                const pLGivenS = actualSmoking === 1 ? pLighterGivenSmoking : pLighterGivenNoSmoking
                jointProb *= lighter === 1 ? pLGivenS : (1 - pLGivenS)
              }

              if (jointProb === 0) continue

              const pD = getDiseaseProb(actualGenetics, actualSmoking, actualHealthcare)

              totalProb += jointProb
              pDiseaseIntervention += pD * jointProb
            }
          }
        }
      }
    }

    return totalProb > 0 ? pDiseaseIntervention / totalProb : 0
  }

  const marginals = calculateMarginals()

  // Calculate edge strengths (causal effects)
  const calculateEdgeStrength = (parent: NodeId, child: NodeId): number => {
    // Calculate the marginal effect of parent on child
    if (parent === 'income' && child === 'healthcare') {
      return Math.abs(pHealthcareGivenIncome - pHealthcareGivenNoIncome)
    }
    if (parent === 'smoking' && child === 'lighter') {
      return Math.abs(pLighterGivenSmoking - pLighterGivenNoSmoking)
    }
    // For disease effects, calculate conditional probabilities
    const pChildGivenParent1 = calculateConditional(parent, 1)
    const pChildGivenParent0 = calculateConditional(parent, 0)
    return Math.abs(pChildGivenParent1 - pChildGivenParent0)
  }

  const edgeStrengths = {
    'income-healthcare': calculateEdgeStrength('income', 'healthcare'),
    'genetics-disease': Math.abs(calculateConditional('genetics', 1) - calculateConditional('genetics', 0)),
    'smoking-disease': Math.abs(calculateConditional('smoking', 1) - calculateConditional('smoking', 0)),
    'smoking-lighter': calculateEdgeStrength('smoking', 'lighter'),
    'healthcare-disease': Math.abs(calculateConditional('healthcare', 1) - calculateConditional('healthcare', 0))
  }

  // Observational vs interventional on Lighter
  const pDiseaseGivenLighter = calculateConditional('lighter', 1)
  const pDiseaseGivenNoLighter = calculateConditional('lighter', 0)
  const pDiseaseInterveneLighter = calculateIntervention('lighter', 1)
  const pDiseaseInterveneNoLighter = calculateIntervention('lighter', 0)

  // Interventions on Smoking and Healthcare
  const pDiseaseInterveneSmoking = calculateIntervention('smoking', 1)
  const pDiseaseInterveneNoSmoking = calculateIntervention('smoking', 0)
  const pDiseaseInterveneHealthcare = calculateIntervention('healthcare', 1)
  const pDiseaseInterveneNoHealthcare = calculateIntervention('healthcare', 0)

  // Network visualization component
  const NetworkDiagram = ({
    highlightEdges = [],
    cutEdges = [],
    showProbs = false,
    nodeOverrides = {}
  }: {
    highlightEdges?: string[]
    cutEdges?: string[]
    showProbs?: boolean
    nodeOverrides?: Record<string, number>
  }) => {
    const nodes = {
      income: { x: 80, y: 80, label: '💰', name: 'Reddito', prob: nodeOverrides.income ?? pI },
      genetics: { x: 280, y: 50, label: '🧬', name: 'Genetica', prob: nodeOverrides.genetics ?? pG },
      smoking: { x: 280, y: 180, label: '🚬', name: 'Fumo', prob: nodeOverrides.smoking ?? pS },
      healthcare: { x: 80, y: 220, label: '🏥', name: 'Assistenza', prob: nodeOverrides.healthcare ?? marginals.pHealthcare },
      lighter: { x: 480, y: 180, label: '🔥', name: 'Accendino', prob: nodeOverrides.lighter ?? marginals.pLighter },
      disease: { x: 280, y: 300, label: '🫁', name: 'Malattia', prob: nodeOverrides.disease ?? marginals.pDisease }
    }

    const edges = [
      { from: 'income', to: 'healthcare', id: 'income-healthcare' },
      { from: 'genetics', to: 'disease', id: 'genetics-disease' },
      { from: 'smoking', to: 'disease', id: 'smoking-disease' },
      { from: 'smoking', to: 'lighter', id: 'smoking-lighter' },
      { from: 'healthcare', to: 'disease', id: 'healthcare-disease' }
    ]

    return (
      <div className="relative mx-auto max-w-3xl">
        <svg viewBox="0 0 560 380" className="w-full">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#003366" />
            </marker>
            <marker id="arrowhead-highlight" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#CC6600" />
            </marker>
            <marker id="arrowhead-cut" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#CCCCCC" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map(edge => {
            const from = nodes[edge.from as NodeId]
            const to = nodes[edge.to as NodeId]
            const isHighlight = highlightEdges.includes(edge.id)
            const isCut = cutEdges.includes(edge.id)

            // Get edge strength and map to visual properties
            const strength = edgeStrengths[edge.id as keyof typeof edgeStrengths] || 0.5
            const strokeWidth = isHighlight ? 5 : Math.max(1, Math.min(6, strength * 8)) // Map 0-1 to 1-6px
            const opacity = isCut ? 0.3 : Math.max(0.4, Math.min(1, 0.4 + strength * 0.6)) // Map 0-1 to 0.4-1.0

            const dx = to.x - from.x
            const dy = to.y - from.y
            const len = Math.sqrt(dx * dx + dy * dy)
            const offsetStart = 45
            const offsetEnd = 45

            const x1 = from.x + (dx / len) * offsetStart
            const y1 = from.y + (dy / len) * offsetStart
            const x2 = to.x - (dx / len) * offsetEnd
            const y2 = to.y - (dy / len) * offsetEnd

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isCut ? '#CCCCCC' : isHighlight ? '#CC6600' : '#003366'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isCut ? '5,5' : 'none'}
                  markerEnd={`url(#arrowhead${isCut ? '-cut' : isHighlight ? '-highlight' : ''})`}
                  opacity={opacity}
                />
                {isCut && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2}
                    fontSize="20"
                    textAnchor="middle"
                    fill="#CC0000"
                  >
                    ✂️
                  </text>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {Object.entries(nodes).map(([id, node]) => {
            const isIntervened = intervention.node === id
            return (
              <g key={id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="40"
                  fill={isIntervened ? '#FFF4E6' : '#E8F4F8'}
                  stroke={isIntervened ? '#CC6600' : '#003366'}
                  strokeWidth={isIntervened ? 3 : 2}
                />
                {isIntervened && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="44"
                    fill="none"
                    stroke="#CC6600"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                )}
                <text x={node.x} y={node.y - 5} textAnchor="middle" fontSize="28">
                  {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#003366"
                  fontWeight="600"
                >
                  {node.name}
                </text>
                {showProbs && (
                  <text
                    x={node.x}
                    y={node.y + 60}
                    textAnchor="middle"
                    fontSize="14"
                    fill={isIntervened ? '#CC6600' : '#003366'}
                    fontWeight="700"
                  >
                    {(node.prob * 100).toFixed(0)}%
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const steps = [
    {
      title: "La Rete Causale: Fumo e Malattia Polmonare",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-black">
            Esploriamo una rete causale che ci aiuterà a capire come identificare
            i <span className="font-bold">confondenti</span> e perché l'intervento è diverso dall'osservazione.
          </p>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="mb-2 text-4xl">💰</div>
              <p className="font-semibold text-[#003366]">Reddito</p>
              <p className="mt-2 text-sm text-[#666666]">
                Reddito alto o basso
              </p>
            </div>
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="mb-2 text-4xl">🧬</div>
              <p className="font-semibold text-[#003366]">Genetica</p>
              <p className="mt-2 text-sm text-[#666666]">
                Predisposizione genetica
              </p>
            </div>
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="mb-2 text-4xl">🚬</div>
              <p className="font-semibold text-[#003366]">Fumo</p>
              <p className="mt-2 text-sm text-[#666666]">
                Fumatore o non fumatore
              </p>
            </div>
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="mb-2 text-4xl">🏥</div>
              <p className="font-semibold text-[#003366]">Assistenza Sanitaria</p>
              <p className="mt-2 text-sm text-[#666666]">
                Qualità delle cure mediche
              </p>
            </div>
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="mb-2 text-4xl">🔥</div>
              <p className="font-semibold text-[#003366]">Accendino</p>
              <p className="mt-2 text-sm text-[#666666]">
                Porta o meno un accendino
              </p>
            </div>
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="mb-2 text-4xl">🫁</div>
              <p className="font-semibold text-[#003366]">Malattia</p>
              <p className="mt-2 text-sm text-[#666666]">
                Malattia polmonare
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-lg border-2 border-[#003366] bg-white p-6">
            <p className="mb-4 font-serif text-xl font-semibold text-[#003366]">
              📊 La Struttura Causale
            </p>

            <NetworkDiagram />

            <div className="mt-6 space-y-3 text-sm text-black">
              <p>
                <span className="font-semibold text-[#003366]">💰 → 🏥:</span> Un reddito alto aumenta
                l'accesso a cure sanitarie di qualità
              </p>
              <p>
                <span className="font-semibold text-[#003366]">🧬 → 🫁:</span> La predisposizione genetica
                aumenta il rischio di malattia polmonare
              </p>
              <p>
                <span className="font-semibold text-[#003366]">🚬 → 🫁:</span> Il fumo causa direttamente
                malattie polmonari
              </p>
              <p>
                <span className="font-semibold text-[#003366]">🚬 → 🔥:</span> I fumatori tendono a portare
                un accendino con sé
              </p>
              <p>
                <span className="font-semibold text-[#003366]">🏥 → 🫁:</span> Una buona assistenza sanitaria
                <span className="font-bold"> previene</span> le malattie polmonari
              </p>
            </div>

            <div className="mt-6 rounded-lg bg-[#F5F5F5] p-4">
              <p className="text-sm font-semibold text-[#003366] mb-2">📏 Spessore delle Frecce</p>
              <p className="text-xs text-black">
                Lo spessore e l'intensità di ogni freccia rappresentano la <span className="font-bold">forza dell'associazione causale</span>.
                Frecce più spesse e scure indicano effetti più forti. Modifica i parametri sopra per vedere come cambiano le relazioni!
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-[#003366] opacity-40"></div>
                  <span className="text-xs text-[#666666]">Debole</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-[#003366] opacity-70"></div>
                  <span className="text-xs text-[#666666]">Medio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1.5 bg-[#003366]"></div>
                  <span className="text-xs text-[#666666]">Forte</span>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border border-[#CCCCCC] bg-[#F5F5F5]">
            <AlertDescription className="text-black">
              <p className="font-semibold">🔍 Nota Importante:</p>
              <p className="mt-2">
                Osserva che l'<span className="font-bold">accendino</span> non ha frecce che escono verso
                la malattia! È correlato con la malattia, ma <span className="font-bold">non la causa</span>.
                Questa è la chiave per capire i confondenti.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Le Probabilità del Sistema",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-black">
            Assegniamo le probabilità a ciascuna variabile della rete. Puoi modificare i parametri
            principali usando gli slider per esplorare diversi scenari:
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-center text-3xl">💰</p>
                <span className="font-serif text-2xl tabular-nums text-[#003366]">{pIncome}%</span>
              </div>
              <p className="text-sm text-[#666666] mb-2">P(Reddito Alto)</p>
              <Slider
                value={[pIncome]}
                onValueChange={(value) => setPIncome(value[0])}
                min={10}
                max={70}
                step={5}
                className="w-full"
              />
            </div>
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-center text-3xl">🧬</p>
                <span className="font-serif text-2xl tabular-nums text-[#003366]">{pGenetics}%</span>
              </div>
              <p className="text-sm text-[#666666] mb-2">P(Rischio Genetico)</p>
              <Slider
                value={[pGenetics]}
                onValueChange={(value) => setPGenetics(value[0])}
                min={5}
                max={40}
                step={5}
                className="w-full"
              />
            </div>
            <div className="rounded-lg border border-[#CCCCCC] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-center text-3xl">🚬</p>
                <span className="font-serif text-2xl tabular-nums text-[#003366]">{pSmoking}%</span>
              </div>
              <p className="text-sm text-[#666666] mb-2">P(Fumatore)</p>
              <Slider
                value={[pSmoking]}
                onValueChange={(value) => setPSmoking(value[0])}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
            <p className="mb-4 font-semibold text-[#003366]">🏥 Assistenza Sanitaria (dipende dal reddito)</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Se reddito alto:</p>
                <p className="font-serif text-3xl tabular-nums text-black">
                  {(pHealthcareGivenIncome * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Se reddito basso:</p>
                <p className="font-serif text-3xl tabular-nums text-black">
                  {(pHealthcareGivenNoIncome * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#CCCCCC] bg-white p-6 shadow-sm">
            <p className="mb-4 font-semibold text-[#003366]">🔥 Accendino (dipende dal fumo)</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Se fumatore:</p>
                <p className="font-serif text-3xl tabular-nums text-black">
                  {(pLighterGivenSmoking * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg bg-[#F5F5F5] p-4">
                <p className="text-sm text-[#666666]">Se non fumatore:</p>
                <p className="font-serif text-3xl tabular-nums text-black">
                  {(pLighterGivenNoSmoking * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-[#003366] bg-white p-6">
            <p className="mb-4 font-semibold text-[#003366]">📊 Probabilità Calcolate</p>
            <NetworkDiagram showProbs={true} />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-[#F5F5F5] p-4 text-center">
                <p className="text-sm text-[#666666]">P(Buona Assistenza)</p>
                <p className="font-serif text-4xl tabular-nums text-[#003366]">
                  {(marginals.pHealthcare * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-[#F5F5F5] p-4 text-center">
                <p className="text-sm text-[#666666]">P(Porta Accendino)</p>
                <p className="font-serif text-4xl tabular-nums text-[#003366]">
                  {(marginals.pLighter * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-[#F5F5F5] p-4 text-center">
                <p className="text-sm text-[#666666]">P(Malattia Polmonare)</p>
                <p className="font-serif text-4xl tabular-nums text-[#003366]">
                  {(marginals.pDisease * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <Alert className="border border-[#CCCCCC] bg-[#F5F5F5]">
            <AlertDescription className="text-black">
              <p className="font-semibold">💡 Prova a modificare i parametri!</p>
              <p className="mt-2">
                Gli slider ti permettono di esplorare diversi scenari. Osserva come cambiano le probabilità
                calcolate nella rete quando modifichi i valori base.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Il Confondente: L'Accendino",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border-2 border-[#CC6600] bg-[#FFF4E6] p-6">
            <p className="mb-2 font-serif text-2xl font-semibold text-[#CC6600]">
              🔍 Uno Studio Osservazionale
            </p>
            <p className="text-lg text-black">
              Un ricercatore nota che le persone che portano un accendino hanno più malattie polmonari.
              Conclude che gli accendini causano il cancro ai polmoni!
            </p>
          </div>

          <div className="rounded-lg border border-[#CCCCCC] bg-white p-6">
            <p className="mb-4 font-semibold text-[#003366]">📊 I Dati Osservazionali</p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border-2 border-[#CC0000] bg-[#FFE8E8] p-6">
                <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                  Con Accendino 🔥
                </p>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-black">P(Malattia | Accendino)</p>
                  <p className="font-serif text-5xl tabular-nums text-[#CC0000]">
                    {(pDiseaseGivenLighter * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="rounded-lg border-2 border-[#00AA00] bg-[#E8F8E8] p-6">
                <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                  Senza Accendino
                </p>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-black">P(Malattia | No Accendino)</p>
                  <p className="font-serif text-5xl tabular-nums text-[#00AA00]">
                    {(pDiseaseGivenNoLighter * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <Alert className="mt-6 border border-[#CC6600] bg-[#FFF4E6]">
              <AlertDescription>
                <p className="font-semibold text-black">⚠️ Correlazione Trovata!</p>
                <p className="mt-2 text-black">
                  La differenza è enorme! Chi porta un accendino ha {((pDiseaseGivenLighter / pDiseaseGivenNoLighter - 1) * 100).toFixed(0)}%
                  più probabilità di ammalarsi. Ma è davvero l'accendino la causa?
                </p>
              </AlertDescription>
            </Alert>
          </div>

          <div className="rounded-lg border-2 border-[#003366] bg-white p-6">
            <p className="mb-4 font-serif text-xl font-semibold text-[#003366]">
              🤔 Il Problema
            </p>

            <NetworkDiagram highlightEdges={['smoking-lighter', 'smoking-disease']} />

            <div className="mt-6 space-y-4 text-black">
              <p>
                L'accendino è correlato con la malattia, ma <span className="font-bold">non la causa</span>!
                La vera causa è il <span className="font-bold">fumo</span>, che:
              </p>
              <ol className="ml-6 list-decimal space-y-2">
                <li>Causa direttamente la malattia polmonare (freccia 🚬 → 🫁)</li>
                <li>Fa sì che le persone portino un accendino (freccia 🚬 → 🔥)</li>
              </ol>
              <p className="mt-4">
                Il fumo è un <span className="font-bold text-[#CC6600]">confondente</span> - una causa
                comune che crea una correlazione spuria tra accendino e malattia.
              </p>
            </div>
          </div>

          <Alert className="border border-[#CCCCCC] bg-[#F5F5F5]">
            <AlertDescription className="text-black">
              <p className="font-semibold">💡 Definizione: Confondente</p>
              <p className="mt-2">
                Un <span className="font-bold">confondente</span> è una variabile che causa sia la variabile
                "indipendente" che quella "dipendente", creando una correlazione falsa tra di esse.
                L'osservazione da sola non può distinguere una vera relazione causale da un confondente!
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Intervento sull'Accendino: Nessun Effetto",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border-2 border-[#003366] bg-[#E8F4F8] p-6">
            <p className="mb-2 font-serif text-2xl font-semibold text-[#003366]">
              🎛️ Un Esperimento Controllato
            </p>
            <p className="text-lg text-black">
              Invece di osservare, <span className="font-bold">interveniamo</span>: assegniamo casualmente
              degli accendini alle persone. Cosa succede alla malattia?
            </p>
          </div>

          <div className="rounded-lg border-2 border-[#CC6600] bg-white p-6">
            <p className="mb-4 font-serif text-xl font-semibold text-[#CC6600]">
              ✂️ Tagliamo il Link Causale
            </p>

            <NetworkDiagram cutEdges={['smoking-lighter']} showProbs={true} />

            <p className="mt-6 text-black">
              Quando <span className="font-bold">interveniamo</span> sull'accendino, "tagliamo" la freccia
              dal fumo all'accendino. Ora l'accendino non dipende più dal fumo - dipende dal nostro intervento!
            </p>
          </div>

          <div className="rounded-lg border border-[#CCCCCC] bg-white p-6">
            <p className="mb-4 font-semibold text-[#003366]">📊 Risultati dell'Esperimento</p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border-2 border-[#003366] bg-[#E8F4F8] p-6">
                <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                  Diamo Accendino 🔥
                </p>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-black">P(Malattia | diamo accendino)</p>
                  <p className="font-serif text-5xl tabular-nums text-[#003366]">
                    {(pDiseaseInterveneLighter * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="rounded-lg border-2 border-[#003366] bg-[#E8F4F8] p-6">
                <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                  Non Diamo Accendino
                </p>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-black">P(Malattia | non diamo accendino)</p>
                  <p className="font-serif text-5xl tabular-nums text-[#003366]">
                    {(pDiseaseInterveneNoLighter * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <Alert className="mt-6 border-2 border-[#00AA00] bg-[#E8F8E8]">
              <AlertDescription>
                <p className="font-semibold text-black">✅ Nessun Effetto Causale!</p>
                <p className="mt-2 text-black">
                  Le probabilità sono praticamente identiche! Dare o togliere l'accendino
                  <span className="font-bold"> non cambia</span> la probabilità di malattia.
                  Questo conferma che l'accendino non è una causa della malattia.
                </p>
              </AlertDescription>
            </Alert>
          </div>

          <div className="rounded-lg border-2 border-[#CC6600] bg-[#FFF4E6] p-6">
            <p className="mb-4 font-serif text-xl font-semibold text-[#CC6600]">
              ⚖️ Confronto Diretto
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-[#CCCCCC] bg-white p-4">
                <p className="mb-2 font-semibold text-black">🔍 Osservazione (correlazione):</p>
                <p className="text-black">
                  P(Malattia | Accendino) = {(pDiseaseGivenLighter * 100).toFixed(1)}% vs {(pDiseaseGivenNoLighter * 100).toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-[#CC0000]">
                  → Grande differenza! Sembra causale, ma non lo è.
                </p>
              </div>

              <div className="rounded-lg border border-[#CCCCCC] bg-white p-4">
                <p className="mb-2 font-semibold text-black">🎛️ Intervento (causazione):</p>
                <p className="text-black">
                  P(Malattia | intervento accendino) = {(pDiseaseInterveneLighter * 100).toFixed(1)}% vs {(pDiseaseInterveneNoLighter * 100).toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-[#00AA00]">
                  → Nessuna differenza! Non c'è effetto causale.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Interventi Reali: Fumo e Assistenza Sanitaria",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border-2 border-[#003366] bg-[#E8F4F8] p-6">
            <p className="mb-2 font-serif text-2xl font-semibold text-[#003366]">
              💊 Interventi che Funzionano
            </p>
            <p className="text-lg text-black">
              A differenza dell'accendino, ci sono interventi che <span className="font-bold">hanno davvero</span>
              un effetto causale sulla malattia polmonare.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border-2 border-[#CC0000] bg-white p-6">
              <p className="mb-4 font-serif text-xl font-semibold text-[#CC0000]">
                🚬 Intervento sul Fumo
              </p>

              <NetworkDiagram
                cutEdges={[]}
                highlightEdges={['smoking-disease', 'smoking-lighter']}
                showProbs={false}
              />

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border-2 border-[#CC0000] bg-[#FFE8E8] p-6">
                  <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                    Forzare il Fumo
                  </p>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-sm text-black">P(Malattia)</p>
                    <p className="font-serif text-5xl tabular-nums text-[#CC0000]">
                      {(pDiseaseInterveneSmoking * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-[#00AA00] bg-[#E8F8E8] p-6">
                  <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                    Prevenire il Fumo
                  </p>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-sm text-black">P(Malattia)</p>
                    <p className="font-serif text-5xl tabular-nums text-[#00AA00]">
                      {(pDiseaseInterveneNoSmoking * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="mt-4 border border-[#CC0000] bg-[#FFE8E8]">
                <AlertDescription>
                  <p className="font-semibold text-black">🎯 Effetto Causale Enorme!</p>
                  <p className="mt-2 text-black">
                    Prevenire il fumo riduce la probabilità di malattia del
                    {' '}{((1 - pDiseaseInterveneNoSmoking / pDiseaseInterveneSmoking) * 100).toFixed(0)}%!
                    Questo è un <span className="font-bold">vero effetto causale</span>.
                  </p>
                </AlertDescription>
              </Alert>
            </div>

            <div className="rounded-lg border-2 border-[#0066CC] bg-white p-6">
              <p className="mb-4 font-serif text-xl font-semibold text-[#0066CC]">
                🏥 Intervento sull'Assistenza Sanitaria
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border-2 border-[#0066CC] bg-[#E8F0FF] p-6">
                  <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                    Fornire Assistenza
                  </p>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-sm text-black">P(Malattia)</p>
                    <p className="font-serif text-5xl tabular-nums text-[#0066CC]">
                      {(pDiseaseInterveneHealthcare * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-[#CC6600] bg-[#FFF4E6] p-6">
                  <p className="mb-3 text-center text-sm font-semibold text-[#666666]">
                    Nessuna Assistenza
                  </p>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-sm text-black">P(Malattia)</p>
                    <p className="font-serif text-5xl tabular-nums text-[#CC6600]">
                      {(pDiseaseInterveneNoHealthcare * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="mt-4 border border-[#0066CC] bg-[#E8F0FF]">
                <AlertDescription>
                  <p className="font-semibold text-black">💙 L'Assistenza Sanitaria Aiuta!</p>
                  <p className="mt-2 text-black">
                    Fornire assistenza sanitaria di qualità riduce la probabilità di malattia del
                    {' '}{((1 - pDiseaseInterveneHealthcare / pDiseaseInterveneNoHealthcare) * 100).toFixed(0)}%.
                    Anche questo è un <span className="font-bold">vero effetto causale</span>.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <div className="rounded-lg border-2 border-[#003366] bg-white p-6">
            <p className="mb-4 font-serif text-xl font-semibold text-[#003366]">
              📋 Riepilogo degli Effetti Causali
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-[#E8F8E8] p-4">
                <span className="font-semibold text-black">Dare/Togliere Accendino:</span>
                <Badge variant="secondary" className="bg-[#CCCCCC] text-black">
                  Nessun effetto (confondente)
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#FFE8E8] p-4">
                <span className="font-semibold text-black">Prevenire il Fumo:</span>
                <Badge className="bg-[#00AA00] text-white hover:bg-[#00AA00]">
                  -{((1 - pDiseaseInterveneNoSmoking / pDiseaseInterveneSmoking) * 100).toFixed(0)}% malattia
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#E8F0FF] p-4">
                <span className="font-semibold text-black">Fornire Assistenza Sanitaria:</span>
                <Badge className="bg-[#0066CC] text-white hover:bg-[#0066CC]">
                  -{((1 - pDiseaseInterveneHealthcare / pDiseaseInterveneNoHealthcare) * 100).toFixed(0)}% malattia
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🎓 Lezioni Fondamentali",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border-2 border-[#003366] bg-white p-8 shadow-lg">
            <p className="mb-6 text-center font-serif text-3xl font-semibold text-[#003366]">
              Le Reti Causali ci Insegnano...
            </p>

            <div className="space-y-6">
              <div className="rounded-lg border-2 border-[#CC6600] bg-[#FFF4E6] p-6">
                <p className="mb-3 font-serif text-xl font-semibold text-[#CC6600]">
                  1️⃣ Correlazione ≠ Causazione
                </p>
                <p className="text-black">
                  L'accendino è <span className="font-bold">fortemente correlato</span> con la malattia
                  polmonare, ma non la causa. La struttura causale ci aiuta a identificare queste
                  correlazioni spurie.
                </p>
              </div>

              <div className="rounded-lg border-2 border-[#003366] bg-[#E8F4F8] p-6">
                <p className="mb-3 font-serif text-xl font-semibold text-[#003366]">
                  2️⃣ I Confondenti Ingannano
                </p>
                <p className="text-black">
                  Un <span className="font-bold">confondente</span> è una causa comune che crea una
                  correlazione falsa. Senza conoscere la struttura causale, possiamo facilmente
                  scambiare una correlazione per una relazione causale.
                </p>
                <div className="mt-4 rounded-lg bg-white p-4">
                  <p className="text-sm text-[#666666]">Schema del confondente:</p>
                  <p className="mt-2 text-center font-mono text-sm text-black">
                    Confondente → Variabile A<br/>
                    Confondente → Variabile B
                  </p>
                  <p className="mt-2 text-xs text-center text-[#666666]">
                    (Nel nostro caso: Fumo → Malattia e Fumo → Accendino)
                  </p>
                </div>
              </div>

              <div className="rounded-lg border-2 border-[#0066CC] bg-[#E8F0FF] p-6">
                <p className="mb-3 font-serif text-xl font-semibold text-[#0066CC]">
                  3️⃣ L'Intervento Rivela la Verità
                </p>
                <p className="text-black">
                  Quando <span className="font-bold">interveniamo</span> su una variabile, "tagliamo"
                  i suoi link causali in entrata. Questo ci permette di misurare il <span className="font-bold">vero
                  effetto causale</span>, separandolo dai confondenti.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-sm font-semibold text-black">Osservazione:</p>
                    <p className="text-xs text-[#666666]">P(Y | X)</p>
                    <p className="mt-1 text-xs text-black">Include i confondenti</p>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-sm font-semibold text-black">Intervento:</p>
                    <p className="text-xs text-[#666666]">P(Y | intervento su X)</p>
                    <p className="mt-1 text-xs text-black">Effetto causale puro</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-[#00AA00] bg-[#E8F8E8] p-6">
                <p className="mb-3 font-serif text-xl font-semibold text-[#00AA00]">
                  4️⃣ Applicazioni nel Mondo Reale
                </p>
                <div className="space-y-3">
                  <div className="rounded-lg bg-white p-4">
                    <p className="mb-2 font-semibold text-black">🏥 Medicina:</p>
                    <p className="text-sm text-black">
                      I trial clinici randomizzati sono interventi che ci permettono di identificare
                      gli effetti causali dei farmaci, eliminando i confondenti.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <p className="mb-2 font-semibold text-black">📊 Economia:</p>
                    <p className="text-sm text-black">
                      Gli esperimenti naturali e gli studi quasi-sperimentali cercano di approssimare
                      interventi per stimare effetti causali di politiche economiche.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <p className="mb-2 font-semibold text-black">🤖 Machine Learning:</p>
                    <p className="text-sm text-black">
                      Il causal ML cerca di andare oltre le predizioni e identificare relazioni causali
                      che permettano interventi efficaci nei sistemi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-2 border-[#003366] bg-[#E8F4F8]">
            <AlertDescription>
              <p className="font-bold text-lg text-[#003366]">🎯 La Grande Conclusione</p>
              <p className="mt-3 text-black">
                Le <span className="font-bold">reti causali bayesiane</span> sono strumenti potentissimi perché:
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-1 text-black">
                <li>Rendono esplicite le nostre assunzioni sulle relazioni causali</li>
                <li>Ci permettono di distinguere correlazione da causazione</li>
                <li>Ci aiutano a identificare i confondenti</li>
                <li>Ci dicono quali esperimenti/interventi sono necessari per testare ipotesi causali</li>
                <li>Ci permettono di ragionare su "cosa succederebbe se..." (ragionamento controfattuale)</li>
              </ul>
              <p className="mt-4 text-black">
                Senza questa struttura causale, rischiamo di prendere decisioni sbagliate basate su
                correlazioni spurie - come vietare gli accendini invece di combattere il fumo!
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Interactive Controls */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Parametri della Popolazione</CardTitle>
          <CardDescription>
            Modifica le probabilità base per esplorare diversi scenari e osservare come cambiano le probabilità nella rete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-black">💰 Reddito Alto</label>
                <span className="font-serif text-xl tabular-nums text-[#003366]">{pIncome}%</span>
              </div>
              <Slider
                value={[pIncome]}
                onValueChange={(value) => setPIncome(value[0])}
                min={10}
                max={70}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-black">🧬 Rischio Genetico</label>
                <span className="font-serif text-xl tabular-nums text-[#003366]">{pGenetics}%</span>
              </div>
              <Slider
                value={[pGenetics]}
                onValueChange={(value) => setPGenetics(value[0])}
                min={5}
                max={40}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-black">🚬 Fumatori</label>
                <span className="font-serif text-xl tabular-nums text-[#003366]">{pSmoking}%</span>
              </div>
              <Slider
                value={[pSmoking]}
                onValueChange={(value) => setPSmoking(value[0])}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
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

          <div className="mt-8 flex items-center justify-between border-t border-[#CCCCCC] pt-6">
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

      {/* Comparison table - visible after step 3 */}
      {currentStep >= 3 && (
        <Card className="border-2 border-[#003366]">
          <CardHeader>
            <CardTitle>⚖️ Tabella Comparativa: Osservazione vs Intervento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#003366]">
                    <th className="p-3 text-left font-semibold text-[#003366]">Variabile</th>
                    <th className="p-3 text-center font-semibold text-[#003366]">Osservazione</th>
                    <th className="p-3 text-center font-semibold text-[#003366]">Intervento</th>
                    <th className="p-3 text-center font-semibold text-[#003366]">Effetto?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#CCCCCC]">
                    <td className="p-3 font-semibold text-black">🔥 Accendino</td>
                    <td className="p-3 text-center tabular-nums">
                      {(pDiseaseGivenLighter * 100).toFixed(1)}% vs {(pDiseaseGivenNoLighter * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-center tabular-nums">
                      {(pDiseaseInterveneLighter * 100).toFixed(1)}% vs {(pDiseaseInterveneNoLighter * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className="bg-[#CCCCCC]">No (confondente)</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-[#CCCCCC]">
                    <td className="p-3 font-semibold text-black">🚬 Fumo</td>
                    <td className="p-3 text-center text-[#666666] text-xs">
                      (correlazione ovvia)
                    </td>
                    <td className="p-3 text-center tabular-nums">
                      {(pDiseaseInterveneSmoking * 100).toFixed(1)}% vs {(pDiseaseInterveneNoSmoking * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-[#CC0000] hover:bg-[#CC0000]">Sì (causale forte)</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-black">🏥 Assistenza</td>
                    <td className="p-3 text-center text-[#666666] text-xs">
                      (potrebbe essere confuso)
                    </td>
                    <td className="p-3 text-center tabular-nums">
                      {(pDiseaseInterveneHealthcare * 100).toFixed(1)}% vs {(pDiseaseInterveneNoHealthcare * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-[#0066CC] hover:bg-[#0066CC]">Sì (previene)</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
