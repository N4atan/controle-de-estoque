import React from 'react';
import { ArrowUpDown, Trash2, Calendar } from 'lucide-react';
import type { StockItem, HistoryEntry } from '../types/stock';
import { getItemLastModification } from '../utils/stockUtils';

interface StockItemCardProps {
  item: StockItem;
  history?: HistoryEntry[];
  onOpenMovement: (item: StockItem) => void;
  onDeleteItem: (id: string) => void;
}

export const StockItemCard: React.FC<StockItemCardProps> = ({
  item,
  history,
  onOpenMovement,
  onDeleteItem,
}) => {
  const isLowStock = Number(item.quantity) <= 5;
  const lastMod = getItemLastModification(item, history);

  // Descrição detalhada para tooltip da última alteração
  const lastModTooltip = lastMod.type
    ? `Última ação: ${lastMod.type} (${lastMod.qty ?? ''} un.) em ${lastMod.fullDateTime} por ${lastMod.user || 'Responsável'}`
    : `Cadastrado em: ${lastMod.dateFormatted}`;

  return (
    <div
      className={`card bg-base-100 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between border-base-300 hover:border-base-300`}
    >
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Topo do Card: Categoria, Alerta e Botão Excluir */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className="badge badge-ghost text-xs font-medium px-2.5 py-0.5 truncate"
            title={item.type}
          >
            {item.type}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="btn btn-ghost btn-xs btn-square text-error/70 hover:text-error hover:bg-error/10 transition-colors"
              title={`Excluir ${item.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nome do Item */}
        <h3
          className="font-bold text-base text-base-content leading-snug line-clamp-2 mb-3.5"
          title={item.name}
        >
          {item.name}
        </h3>

        {/* Quantidade em Destaque */}
        <div
          className={`mt-auto rounded-xl p-3 flex items-center justify-between border ${
            isLowStock
              ? 'bg-error/10 border-error/20 text-error'
              : 'bg-base-200/50 border-base-200 text-base-content'
          }`}
        >
          <span className="text-xs font-medium opacity-80">
            Quantidade:
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black tracking-tight">
              {item.quantity}
            </span>
            <span className="text-xs font-semibold opacity-70">
              un.
            </span>
          </div>
        </div>

        {/* Data da última atualização dinâmica com tooltip */}
        <div
          className="flex items-center justify-between text-[11px] text-base-content/60 mt-3 pt-2.5 border-t border-base-200/70"
          title={lastModTooltip}
        >
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 opacity-60" />
            <span>Atualizado:</span>
          </span>
          <span className="font-medium text-base-content/80 flex items-center gap-1">
            <span>{lastMod.dateFormatted}</span>
            {lastMod.type && (
              <span className="text-[10px] opacity-75 font-normal">
                ({lastMod.type === 'ENTRADA' ? '+ Entr.' : lastMod.type === 'SAIDA' ? '- Saída' : 'Cad.'})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Botão de Movimentar em Destaque */}
      <div className="p-3 sm:p-4 pt-0">
        <button
          type="button"
          onClick={() => onOpenMovement(item)}
          className="btn btn-primary btn-sm w-full gap-2 text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
          title="Movimentar quantidade (Entrada ou Saída)"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Movimentar</span>
        </button>
      </div>
    </div>
  );
};
