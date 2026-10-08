export interface StockItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  date: string;
}

export type MovementType = 'CADASTRAR' | 'ENTRADA' | 'SAIDA';

export interface HistoryEntry {
  id: string;
  datetime: string;
  dateRaw: string;
  type: MovementType;
  name: string;
  qty: number;
  user: string;
}

export type UndoAction =
  | {
      type: 'ADD_ITEM';
      itemId: string;
    }
  | {
      type: 'DELETE_ITEM';
      itemData: StockItem;
    }
  | {
      type: 'MOVEMENT';
      itemId: string;
      movType: 'ENTRADA' | 'SAIDA';
      qty: number;
    };
