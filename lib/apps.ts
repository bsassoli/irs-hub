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
    id: 'bayes-corvi',
    title: 'Bayes e Corvi',
    description: 'Esplora il teorema di Bayes attraverso l\'esempio dei corvi neri e l\'aggiornamento bayesiano delle credenze',
    icon: '🐦‍⬛',
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
  {
    id: 'gas-ideale-ic',
    title: 'Gas Ideale e Intervalli di Confidenza',
    description: 'Esperimento interattivo su misure di pressione, rumore del sensore e costruzione di intervalli di confidenza',
    icon: '⚗️',
    category: 'Statistica Inferenziale'
  },
  {
    id: 'genetica-intervalli-confidenza',
    title: 'Genetica e Intervalli di Confidenza',
    description: 'Stima la frequenza di un allele in una popolazione e costruisci intervalli di confidenza basati su campioni finiti',
    icon: '🧬',
    category: 'Statistica Inferenziale'
  },
  {
    id: 'reti-causali-fumo',
    title: 'Reti Causali: Fumo e Confondenti',
    description: 'Esplora come le reti causali identificano i confondenti e distinguono correlazione da causazione attraverso interventi',
    icon: '🚬',
    category: 'Reti Causali'
  },
  // We'll add more apps later
];

export const categories = Array.from(new Set(apps.map(app => app.category)));