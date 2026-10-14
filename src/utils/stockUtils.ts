import type { StockItem, HistoryEntry, MovementType } from '../types/stock';

/**
 * Formata strings de datas (como YYYY-MM-DD) para formato legível brasileiro (DD/MM/YYYY).
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export interface LastModificationInfo {
  dateFormatted: string;
  fullDateTime: string;
  type: MovementType | null;
  user: string | null;
  qty: number | null;
}

/**
 * Busca a última modificação realizada no item.
 * Prioriza o registro mais recente do histórico (que contém data, hora, tipo e responsável).
 * Caso não haja registro no histórico, usa o campo de data cadastrado no item.
 */
export function getItemLastModification(
  item: StockItem,
  history?: HistoryEntry[]
): LastModificationInfo {
  if (history && history.length > 0) {
    // Procura a entrada mais recente no histórico que coincida com o nome ou ID do item
    const lastEntry = history.find(
      (h) =>
        h.name.trim().toLowerCase() === item.name.trim().toLowerCase() ||
        h.name.trim().toLowerCase().includes(item.id.toLowerCase())
    );

    if (lastEntry) {
      const datePart = lastEntry.datetime.split(' ')[0] || formatDate(lastEntry.dateRaw);
      return {
        dateFormatted: datePart,
        fullDateTime: lastEntry.datetime,
        type: lastEntry.type,
        user: lastEntry.user,
        qty: lastEntry.qty,
      };
    }
  }

  // Fallback para a data cadastrada no item
  const formatted = formatDate(item.date);
  return {
    dateFormatted: formatted,
    fullDateTime: formatted,
    type: null,
    user: null,
    qty: null,
  };
}
