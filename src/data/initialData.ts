import type { StockItem, HistoryEntry } from '../types/stock';

export const CATEGORIES = [
  'Velas & Defumação',
  'Ervas & Banhos',
  'Alimentos & Oferendas',
  'Louças & Alguidare',
  'Tecidos & Fitas',
  'Artigos & Fundamento',
  'Limpeza & Manutenção',
  'Geral'
];

export const INITIAL_STOCK: StockItem[] = [
  { id: 'ITEM-001', name: 'Vela de 7 Dias Branca', type: 'Velas & Defumação', quantity: 24, date: '2026-03-01' },
  { id: 'ITEM-002', name: 'Vela Palito Branca (Maço c/ 8)', type: 'Velas & Defumação', quantity: 15, date: '2026-03-01' },
  { id: 'ITEM-003', name: 'Azeite de Dendê 500ml', type: 'Alimentos & Oferendas', quantity: 6, date: '2026-03-02' },
  { id: 'ITEM-004', name: 'Mel Puro de Abelha 500g', type: 'Alimentos & Oferendas', quantity: 4, date: '2026-03-02' },
  { id: 'ITEM-005', name: 'Arruda Desidratada 100g', type: 'Ervas & Banhos', quantity: 8, date: '2026-03-03' },
  { id: 'ITEM-006', name: 'Guiné Desidratada 100g', type: 'Ervas & Banhos', quantity: 7, date: '2026-03-03' },
  { id: 'ITEM-007', name: 'Pemba Branca (Caixa c/ 10)', type: 'Artigos & Fundamento', quantity: 3, date: '2026-03-04' },
  { id: 'ITEM-008', name: 'Alguidar de Barro nº 2', type: 'Louças & Alguidare', quantity: 5, date: '2026-03-04' },
  { id: 'ITEM-009', name: 'Quartinha de Barro c/ Asa', type: 'Louças & Alguidare', quantity: 2, date: '2026-03-05' },
  { id: 'ITEM-010', name: 'Defumador em Tablete (Caixa)', type: 'Velas & Defumação', quantity: 12, date: '2026-03-05' },
  { id: 'ITEM-011', name: 'Sabão da Costa 90g', type: 'Ervas & Banhos', quantity: 10, date: '2026-03-06' },
  { id: 'ITEM-012', name: 'Desinfetante Floral 5L', type: 'Limpeza & Manutenção', quantity: 3, date: '2026-03-06' }
];

export const INITIAL_HISTORY: HistoryEntry[] = [
  {
    id: 'h-1',
    datetime: '01/03/2026 10:00',
    dateRaw: '2026-03-01',
    type: 'CADASTRAR',
    name: 'Vela de 7 Dias Branca',
    qty: 24,
    user: 'Responsável'
  },
  {
    id: 'h-2',
    datetime: '04/03/2026 16:30',
    dateRaw: '2026-03-04',
    type: 'SAIDA',
    name: 'Pemba Branca (Caixa c/ 10)',
    qty: 2,
    user: 'Responsável'
  }
];
