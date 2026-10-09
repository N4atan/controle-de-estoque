import React, { useState } from 'react';
import { ArrowUpDown, X, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import type { StockItem } from '../types/stock';

interface MovementModalProps {
  item: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, movType: 'ENTRADA' | 'SAIDA', qty: number) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [movType, setMovType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [qty, setQty] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedQty = Number(qty);
    if (!parsedQty || parsedQty <= 0) {
      setErrorMsg('Informe uma quantidade válida maior que zero.');
      return;
    }

    if (movType === 'SAIDA' && item.quantity < parsedQty) {
      setErrorMsg(`Quantidade insuficiente em estoque! Saldo disponível: ${item.quantity} un.`);
      return;
    }

    onSubmit(item.id, movType, parsedQty);
    setQty(1);
    setMovType('ENTRADA');
    setErrorMsg('');
  };

  return (
    <div className="modal modal-open z-50 no-print">
      <div className="modal-box max-w-sm bg-base-100 p-0 overflow-hidden shadow-2xl border border-base-200">
        {/* Header */}
        <div className="text-base-content px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-base-content" />
            <h3 className="font-bold text-base text-base-content">
              Movimentar Estoque
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content hover:bg-base-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selected Item Info Card */}
          <div className="bg-base-200/60 p-3 rounded-xl border border-base-300">
            <span className="text-[10px] uppercase font-bold text-base-content/50 block">
              Item Selecionado:
            </span>
            <p className="text-sm font-bold text-base-content mt-0.5">
              {item.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/70">
              <span className="badge badge-neutral badge-xs font-mono">{item.id}</span>
              <span>Saldo Atual: <strong className="text-primary font-bold">{item.quantity} un.</strong></span>
            </div>
          </div>

          {/* Tipo de Movimento */}
          <div>
            <label className="label text-xs font-bold uppercase text-base-content/70 pb-1">
              Operação de Estoque
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMovType('ENTRADA');
                  setErrorMsg('');
                }}
                className={`btn btn-sm text-xs gap-1.5 ${
                  movType === 'ENTRADA'
                    ? 'btn-success text-success-content'
                    : 'btn-ghost bg-base-200 text-base-content'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Entrada (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovType('SAIDA');
                  setErrorMsg('');
                }}
                className={`btn btn-sm text-xs gap-1.5 ${
                  movType === 'SAIDA'
                    ? 'btn-error text-error-content'
                    : 'btn-ghost bg-base-200 text-base-content'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Saída (-)</span>
              </button>
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="label text-xs font-bold uppercase text-base-content/70 pb-1">
              Quantidade a Movimentar
            </label>
            <input
              type="number"
              min="1"
              required
              value={qty}
              onChange={(e) => {
                setQty(Math.max(1, parseInt(e.target.value) || 0));
                setErrorMsg('');
              }}
              placeholder="Ex: 5"
              className="input input-bordered w-full text-sm bg-base-100"
            />
          </div>

          {/* Projected Balance */}
          <div className="text-xs text-base-content/70 flex justify-between items-center px-1">
            <span>Saldo projetado:</span>
            <span className="font-bold">
              {movType === 'ENTRADA'
                ? item.quantity + (Number(qty) || 0)
                : item.quantity - (Number(qty) || 0)}{' '}
              un.
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="alert alert-error text-xs p-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="modal-action pt-3 border-t border-base-200 flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn btn-sm text-xs font-semibold px-5 ${
                movType === 'ENTRADA' ? 'btn-success' : 'btn-error'
              }`}
            >
              Confirmar {movType === 'ENTRADA' ? 'Entrada' : 'Baixa'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
    </div>
  );
};
