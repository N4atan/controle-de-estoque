import React, { useState } from 'react';
import { Plus, RotateCcw, Search, X, Boxes, FolderPlus } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onOpenNewItemModal: () => void;
  onOpenNewCategoryModal: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  onOpenNewItemModal,
  onOpenNewCategoryModal,
  onUndo,
  canUndo,
}) => {
  const [searchInput, setSearchInput] = useState(searchTerm);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    onSearchChange(val);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearchChange('');
  };

  return (
    <div className="card bg-white shadow-sm border border-gray-200 p-4 space-y-4 rounded-xl no-print">
      {/* Top action row com o título Painel de Estoque Atual */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
            Painel de Estoque Atual
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenNewItemModal}
            className="btn btn-primary btn-sm gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Item</span>
          </button>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="btn btn-outline btn-sm gap-1.5 text-xs"
            title="Desfazer última operação"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Desfazer</span>
          </button>
        </div>
      </div>

      {/* Row de Filtros: Searchbar, Select de Categorias e Botão Adicionar Categoria */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
        {/* Searchbar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Pesquisar por nome, código ou descrição..."
            className="input input-bordered input-sm w-full pl-9 pr-8 text-xs bg-gray-50 border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Limpar pesquisa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Select de Categoria + Botão Adicionar Categoria */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="select select-bordered select-sm flex-1 sm:w-60 text-xs font-medium bg-gray-50 border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenNewCategoryModal}
            className="btn btn-outline btn-primary btn-sm gap-1.5 text-xs shrink-0 font-semibold"
            title="Adicionar nova categoria"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Categoria</span>
          </button>
        </div>
      </div>
    </div>
  );
};
