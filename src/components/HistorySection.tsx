import React, { useState } from 'react';
import {
  History,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trash2,
  FolderOpen,
  Plus,
  Minus
} from 'lucide-react';
import type { HistoryEntry } from '../types/stock';

interface HistorySectionProps {
  history: HistoryEntry[];
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory?: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onDeleteHistoryItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');

  const filteredHistory = history.filter((h) => {
    if (!filterMonth) return true;
    if (!h.dateRaw) return false;
    return h.dateRaw.substring(0, 7) === filterMonth;
  });

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-base-100 hover:bg-base-100 text-left flex justify-between items-center transition-colors no-print"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm text-base-content">
            Histórico de Movimentações
          </h2>
          <span className="text-xs text-base-content/50 hidden sm:inline">
            (Clique para expandir/recolher)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="badge badge-neutral badge-sm font-semibold whitespace-nowrap h-auto py-1 px-2.5 text-xs">
            {history.length} registros
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-base-content/60 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-base-content/60 shrink-0" />
          )}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-5 space-y-4 border-t border-base-200">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 no-print">
            {/* Monthly Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-base-content/70">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Mês:</span>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="input input-bordered input-xs sm:input-sm text-xs font-medium bg-base-100"
                />
                {filterMonth && (
                  <button
                    onClick={() => setFilterMonth('')}
                    className="btn btn-ghost btn-xs text-xs"
                  >
                    Mostrar Tudo
                  </button>
                )}
              </div>
            </div>

            {/* Export and Action buttons 
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="btn btn-success btn-soft btn-xs sm:btn-sm gap-1.5 text-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Excel</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="btn btn-error btn-soft btn-xs sm:btn-sm gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>

              <button
                onClick={onClearHistory}
                className="btn btn-ghost btn-xs sm:btn-sm text-error hover:bg-error/10 gap-1.5 text-xs"
                title="Limpar histórico de movimentações"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            </div>
            */}
          </div>

          {/* Table Container / Print Area */}
          <div id="history-print-area" className="border border-base-200 rounded-xl overflow-hidden bg-base-100">
            {/* Header visible only on print */}
            <div className="p-4 bg-base-200 border-b border-base-300 hidden print:block">
              <h3 className="font-bold text-lg text-base-content">
                Relatório de Histórico de Movimentações - Terreira
              </h3>
              <p className="text-xs text-base-content/70 mt-1">
                Filtro Mensal: {filterMonth || 'Todos os períodos'} | Gerado em:{' '}
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="table table-zebra table-xs sm:table-sm w-full">
                <thead>
                  <tr className="bg-base-200/50 text-base-content/70 uppercase text-xs">
                    <th className="py-2.5 px-4 font-semibold">Data / Hora</th>
                    <th className="py-2.5 px-4 font-semibold">Operação</th>
                    <th className="py-2.5 px-4 font-semibold">Item</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Quantidade</th>
                    <th className="py-2.5 px-4 font-semibold">Responsável</th>
                    <th className="py-2.5 px-4 font-semibold text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h) => {
                    return (
                      <tr key={h.id} className="hover:bg-base-200/30 transition-colors">
                        <td className="font-mono text-xs text-base-content/80 py-2.5 px-4">
                          {h.datetime}
                        </td>
                        <td className="py-2.5 px-4">
                          {h.type === 'ENTRADA' && (
                            <span className="badge badge-success badge-sm gap-1 text-xs font-semibold py-2">
                              <Plus className="w-3 h-3" /> ENTRADA
                            </span>
                          )}
                          {h.type === 'SAIDA' && (
                            <span className="badge badge-error badge-sm gap-1 text-xs font-semibold py-2">
                              <Minus className="w-3 h-3" /> SAÍDA
                            </span>
                          )}
                          {h.type === 'CADASTRAR' && (
                            <span className="badge badge-info badge-sm gap-1 text-xs font-semibold py-2">
                              CADASTRO
                            </span>
                          )}
                        </td>
                        <td className="font-medium text-base-content py-2.5 px-4">
                          {h.name}
                        </td>
                        <td className="text-center font-bold text-base-content py-2.5 px-4">
                          {h.qty} un.
                        </td>
                        <td className="text-xs text-base-content/70 py-2.5 px-4">
                          {h.user}
                        </td>
                        <td className="text-center no-print py-2.5 px-4">
                          <button
                            onClick={() => onDeleteHistoryItem(h.id)}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                            title="Excluir este registro"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredHistory.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center text-center p-4">
                <FolderOpen className="w-8 h-8 text-base-content/30 mb-2" />
                <p className="text-xs font-medium text-base-content/60">
                  Nenhum registro de movimentação encontrado no período selecionado.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
