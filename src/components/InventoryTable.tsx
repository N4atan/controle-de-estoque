import React, { useState } from 'react';
import { ArrowUpDown, Trash2, AlertTriangle, PackageOpen, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import type { StockItem } from '../types/stock';

interface InventoryTableProps {
  items: StockItem[];
  totalItems: number;
  onOpenMovement: (item: StockItem) => void;
  onDeleteItem: (id: string) => void;
  filterBar?: React.ReactNode;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  totalItems,
  onOpenMovement,
  onDeleteItem,
  filterBar,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden no-print">
      {/* Table Header Accordion Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-base-100 hover:bg-base-200/50 text-left flex justify-between items-center transition-colors no-print cursor-pointer gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-base-content leading-tight">
                Artigos e Materiais em Estoque
              </h2>
              <span className="text-xs text-base-content/50 hidden md:inline">
                (Clique para expandir/recolher)
              </span>
            </div>
            <p className="text-xs text-base-content/60 font-medium truncate">
              Listagem geral de itens cadastrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="badge badge-neutral badge-sm font-semibold whitespace-nowrap h-auto py-1 px-2.5 text-xs">
            {items.length === totalItems ? (
              `${totalItems} itens`
            ) : (
              `${items.length} de ${totalItems} itens`
            )}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-base-content/60 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-base-content/60 shrink-0" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-5 space-y-4 border-t border-base-200">
          {/* Internal FilterBar */}
          {filterBar}

          {/* Table Container com a mesma bordinha e pad do histórico */}
          <div className="border border-base-200 rounded-xl overflow-hidden bg-base-100">
            <div className="overflow-x-auto w-full">
              <table className="table table-zebra table-sm sm:table-md w-full">
                <thead>
                  <tr className="bg-base-200/50 text-base-content/70 uppercase text-xs whitespace-nowrap">
                    <th className="font-semibold py-3 px-4 min-w-[200px]">Nome do Item</th>
                    <th className="font-semibold py-3 px-4 text-center">Quantidade</th>
                    <th className="font-semibold py-3 px-4">Categoria</th>
                    <th className="font-semibold py-3 px-4 text-center">Última Atualização</th>
                    <th className="font-semibold py-3 px-4 text-center">Movimentar</th>
                    <th className="font-semibold py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isLowStock = Number(item.quantity) <= 5;

                    return (
                      <tr key={item.id} className="hover:bg-base-200/40 transition-colors">
                        {/* Nome */}
                        <td className="font-medium text-base-content px-4 min-w-[200px]">
                          {item.name}
                        </td>

                        {/* Quantidade */}
                        <td className="px-4 text-center whitespace-nowrap">
                          {isLowStock ? (
                            <span className="badge badge-error gap-1 font-bold text-xs py-1 px-2.5 h-auto whitespace-nowrap shadow-xs">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{item.quantity} un.</span>
                            </span>
                          ) : (
                            <span className="badge badge-ghost font-bold text-xs py-1 px-2.5 h-auto whitespace-nowrap">
                              {item.quantity} un.
                            </span>
                          )}
                        </td>

                        {/* Categoria */}
                        <td className="px-4 whitespace-nowrap">
                          <span className="badge badge-outline text-xs font-medium whitespace-nowrap px-3 py-1 h-auto">
                            {item.type}
                          </span>
                        </td>

                        {/* Data */}
                        <td className="text-xs text-center text-base-content/70 px-4 whitespace-nowrap">
                          {formatDate(item.date)}
                        </td>

                        {/* Movimentar */}
                        <td className="px-4 text-center">
                          <button
                            onClick={() => onOpenMovement(item)}
                            className="btn btn-primary btn-outline btn-xs sm:btn-sm gap-1 text-xs"
                            title="Movimentar quantidade (Entrada ou Saída)"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span>Movimentar</span>
                          </button>
                        </td>

                        {/* Excluir */}
                        <td className="px-4 text-center">
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                            title="Excluir Item do Estoque"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-base-200/80 text-base-content/40 flex items-center justify-center mb-3">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-base-content">
                  Nenhum item encontrado
                </h3>
                <p className="text-xs text-base-content/60 max-w-sm mt-1">
                  Não há artigos cadastrados correspondentes aos critérios de busca ou categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
