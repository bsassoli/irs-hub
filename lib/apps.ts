export interface App {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export const apps: App[] = [
  {
    id: 'scommesse-eque-probabilita',
    title: 'Scommesse Eque e Probabilità',
    description: 'Calcolatore di scommessa equa e probabilità soggettiva',
    icon: '🎲',
    category: 'Probabilità'
  },
  {
    id: 'bayes-moneta',
    title: 'Teorema di Bayes: La Moneta Misteriosa',
    description: 'Un\'introduzione intuitiva al ragionamento bayesiano attraverso un esempio interattivo',
    icon: '🪙',
    category: 'Probabilità'
  },
  {
    id: 'stima-probabilita-soggettiva',
    title: 'Stimatore Probabilità Soggettiva',
    description: 'Stima la probabilità soggettiva attraverso assicurazione, prezzo di vendita e scommesse - Caso Roberto',
    icon: '🏠',
    category: 'Probabilità'
  },
  {
    id: 'intervalli-confidenza',
    title: 'Intervalli di Confidenza Explorer',
    description: 'Comprendi il vero significato degli intervalli di confidenza attraverso simulazioni interattive',
    icon: '📊',
    category: 'Statistica Inferenziale'
  },
  {
    id: 'teorema-limite-centrale',
    title: 'Teorema del Limite Centrale in Azione',
    description: 'Osserva come le medie campionarie convergono alla normalità, qualunque sia la popolazione di partenza',
    icon: '📈',
    category: 'Statistica Inferenziale'
  },
  // We'll add more apps later
];

export const categories = Array.from(new Set(apps.map(app => app.category)));