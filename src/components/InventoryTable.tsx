import React, { useState } from 'react';
import {
  ArrowUpDown,
  Trash2,
  AlertTriangle,
  PackageOpen,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Table as TableIcon,
  QrCode,
  Printer,
} from 'lucide-react';
import type { StockItem, HistoryEntry } from '../types/stock';
import { StockItemCard } from './StockItemCard';
import { getItemLastModification } from '../utils/stockUtils';

interface InventoryTableProps {
  items: StockItem[];
  totalItems: number;
  history?: HistoryEntry[];
  onOpenMovement: (item: StockItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenQrCode?: (item: StockItem) => void;
  onOpenBatchQrCode?: (items: StockItem[]) => void;
  filterBar?: React.ReactNode;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  totalItems,
  history,
  onOpenMovement,
  onDeleteItem,
  onOpenQrCode,
  onOpenBatchQrCode,
  filterBar,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Modo de visualização: 'cards' ou 'table' (lembrado via localStorage, padrão cards no mobile)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terreira_estoque_view_mode');
      if (saved === 'cards' || saved === 'table') {
        return saved;
      }
      return window.innerWidth < 768 ? 'cards' : 'table';
    }
    return 'table';
  });

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('terreira_estoque_view_mode', mode);
    }
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

          {/* Barra de controle de visualização (Cards vs Tabela) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 pb-1">
            <div className="text-xs text-base-content/70 font-medium">
              Exibindo <span className="font-bold text-base-content">{items.length}</span> {items.length === 1 ? 'item' : 'itens'} no estoque
            </div>

            {/* Alternador de visualização */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-base-content/60 hidden sm:inline">Visualização:</span>
              <div className="join bg-base-200/60 p-0.5 rounded-lg border border-base-300">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('cards')}
                  className={`join-item btn btn-xs gap-1.5 transition-all ${
                    viewMode === 'cards'
                      ? 'btn-primary shadow-xs font-semibold'
                      : 'btn-ghost text-base-content/70 hover:text-base-content'
                  }`}
                  title="Visualização em Cards (ideal para celular)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('table')}
                  className={`join-item btn btn-xs gap-1.5 transition-all ${
                    viewMode === 'table'
                      ? 'btn-primary shadow-xs font-semibold'
                      : 'btn-ghost text-base-content/70 hover:text-base-content'
                  }`}
                  title="Visualização em Tabela detalhada"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tabela</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visualização em CARDS */}
          {viewMode === 'cards' && (
            <div>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {items.map((item) => (
                    <StockItemCard
                      key={item.id}
                      item={item}
                      history={history}
                      onOpenMovement={onOpenMovement}
                      onDeleteItem={onDeleteItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-base-200 rounded-xl overflow-hidden bg-base-100 py-12 flex flex-col items-center justify-center text-center p-4">
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
          )}

          {/* Visualização em TABELA */}
          {viewMode === 'table' && (
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
                      const lastMod = getItemLastModification(item, history);

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

                          {/* Data da Última Modificação */}
                          <td
                            className="text-xs text-center text-base-content/70 px-4 whitespace-nowrap"
                            title={lastMod.fullDateTime}
                          >
                            {lastMod.dateFormatted}
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

                          {/* Ações: QR Code & Excluir */}
                          <td className="px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {onOpenQrCode && (
                                <button
                                  type="button"
                                  onClick={() => onOpenQrCode(item)}
                                  className="btn btn-ghost btn-xs text-base-content/70 hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Gerar / Imprimir QR Code deste item"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onDeleteItem(item.id)}
                                className="btn btn-ghost btn-xs text-error hover:bg-error/10 transition-colors"
                                title="Excluir Item do Estoque"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer da Tabela com Botão de Imprimir Etiquetas em Lote */}
              {items.length > 0 && (
                <div className="p-3.5 bg-base-200/40 border-t border-base-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-base-content/70">
                    Mostrando <strong className="text-base-content">{items.length}</strong> {items.length === 1 ? 'item' : 'itens'} {items.length < totalItems && `(filtrados de ${totalItems})`}
                  </div>
                  {onOpenBatchQrCode && (
                    <button
                      type="button"
                      onClick={() => onOpenBatchQrCode(items)}
                      className="btn btn-outline btn-sm gap-2 text-xs font-semibold hover:btn-primary transition-all shadow-2xs"
                      title="Gerar e imprimir todas as etiquetas filtradas em 4 colunas"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Etiquetas em Lote ({items.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Empty State Tabela */}
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
          )}
        </div>
      )}
    </div>
  );
};

