import React from 'react';
import { Boxes, Tags, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StockItem } from '../types/stock';

interface StatsCardsProps {
  items: StockItem[];
  filteredItems: StockItem[];
  isSearching: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  items,
  filteredItems,
  isSearching,
}) => {
  const totalItemsCount = items.length;
  const uniqueCategories = new Set(items.map((i) => i.type)).size;

  // If searching or filtering, sum the filtered items; otherwise all
  const itemsToSum = isSearching ? filteredItems : items;
  const totalQuantity = itemsToSum.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);

  const lowStockItems = items.filter((i) => Number(i.quantity) <= 5);
  const lowStockCount = lowStockItems.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
      {/* Total de Itens */}
      <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
        <div className="card-body p-5 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Total de Itens
            </span>
            <div className="text-2xl font-bold text-base-content mt-1">
              {totalItemsCount}
            </div>
            <span className="text-xs text-base-content/50">Itens cadastrados</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tipos de Suprimento */}
      <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
        <div className="card-body p-5 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Categorias
            </span>
            <div className="text-2xl font-bold text-base-content mt-1">
              {uniqueCategories}
            </div>
            <span className="text-xs text-base-content/50">Tipos de suprimento</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Tags className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quantidade Total */}
      <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
        <div className="card-body p-5 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Qtd. em Estoque
            </span>
            <div className="text-2xl font-bold text-base-content mt-1">
              {totalQuantity.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs text-base-content/50">Unidades totais</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alerta de Baixo Estoque */}
      {lowStockCount > 0 ? (
        <div className="card bg-error/10 border-2 border-error/40 shadow-sm hover:shadow-md transition-all">
          <div className="card-body p-5 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-error">
                  Baixo Estoque
                </span>
              </div>
              <div className="text-2xl font-bold text-error mt-1">
                {lowStockCount}
              </div>
              <span className="text-xs font-medium text-error/80">
                ⚠️ Crítico (≤ 5 unidades)
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error text-error-content flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
          <div className="card-body p-5 flex flex-row items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                Status do Estoque
              </span>
              <div className="text-2xl font-bold text-success mt-1">
                100%
              </div>
              <span className="text-xs text-success font-medium">
                Níveis normais (Sem alertas)
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
