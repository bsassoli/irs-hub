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
  // We'll add more apps later
];

export const categories = Array.from(new Set(apps.map(app => app.category)));