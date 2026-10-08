import React, { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: { name: string; type: string; quantity: number; date: string }) => void;
  categories: string[];
  onOpenNewCategoryModal?: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  onOpenNewCategoryModal,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [type, setType] = useState(categories[0] || '');
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState(today);

  // Sync default type when categories change or modal opens
  useEffect(() => {
    if (categories.length > 0 && (!type || !categories.includes(type))) {
      setType(categories[0]);
    }
  }, [categories, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      type: type || categories[0] || 'Geral',
      quantity: Number(quantity) || 0,
      date,
    });

    // Reset form
    setName('');
    setType(categories[0] || '');
    setQuantity(0);
    setDate(today);
  };

  return (
    <div className="modal modal-open z-50 no-print">
      <div className="modal-box max-w-md bg-base-100 p-0 overflow-hidden shadow-2xl border border-base-200">
        {/* Modal Header */}
        <div className="text-base-content px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-base-content" />
            <h3 className="font-bold text-base text-base-content">
              Novo Suprimento / Item
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label text-xs font-bold uppercase text-base-content/70 pb-1">
              Nome do Item
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vela de 7 Dias Branca"
              className="input input-bordered w-full text-sm bg-base-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center pb-1">
              <label className="label text-xs font-bold uppercase text-base-content/70 p-0">
                Categoria / Tipo de Suprimento
              </label>
              {onOpenNewCategoryModal && (
                <button
                  type="button"
                  onClick={onOpenNewCategoryModal}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  + Nova Categoria
                </button>
              )}
            </div>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="select select-bordered w-full text-sm bg-base-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-bold uppercase text-base-content/70 pb-1">
                Quantidade Inicial
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="input input-bordered w-full text-sm bg-base-100"
              />
            </div>

            <div>
              <label className="label text-xs font-bold uppercase text-base-content/70 pb-1">
                Data de Entrada
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input input-bordered w-full text-sm bg-base-100"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-action pt-4 border-t border-base-200 flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm text-xs font-semibold px-4"
            >
              Cadastrar Item
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
    </div>
  );
};
