import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
  existingCategories: string[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  existingCategories,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = categoryName.trim();
    if (!trimmed) {
      setError('O nome da categoria não pode ficar vazio.');
      return;
    }

    const alreadyExists = existingCategories.some(
      (cat) => cat.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setError('Esta categoria já existe no sistema.');
      return;
    }

    onAddCategory(trimmed);
    setCategoryName('');
    setError('');
  };

  return (
    <div className="modal modal-open z-50 no-print">
      <div className="modal-box max-w-sm bg-base-100 p-0 overflow-hidden shadow-2xl border border-base-200">
        {/* Header */}
        <div className="text-base-content px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-base-content" />
            <h3 className="font-bold text-base text-base-content">
              Nova Categoria
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
          <div>
            <label className="label text-xs font-bold uppercase text-base-content/70 pb-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              required
              autoFocus
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError('');
              }}
              placeholder="Ex: Imagens & Estátuas"
              className="input input-bordered w-full text-sm bg-base-100"
            />
            {error && (
              <p className="text-xs text-error font-medium mt-1.5">{error}</p>
            )}
          </div>

          {/* Modal Actions */}
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
              className="btn btn-primary btn-sm text-xs font-semibold px-4"
            >
              Adicionar Categoria
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
    </div>
  );
};
