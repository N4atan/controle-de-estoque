import React, { useState } from 'react';
import { Plus, RotateCcw, Search, X, FolderPlus } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 no-print">
      {/* Searchbar & Category Filter */}
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Searchbar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Pesquisar por nome, código ou descrição..."
            className="input input-bordered input-sm w-full pl-9 pr-8 text-xs bg-base-200/40 border-base-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
              title="Limpar pesquisa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Select */}
        <select
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          className="select select-bordered select-sm w-full sm:w-56 text-xs font-medium bg-base-200 border-base-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Todas as Categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons: + Categoria e Desfazer acima, Novo Item em linha única abaixo */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onOpenNewCategoryModal}
            className="btn btn-outline btn-primary btn-sm gap-1.5 text-xs font-semibold whitespace-nowrap flex-1 sm:flex-initial"
            title="Adicionar nova categoria"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Categoria</span>
          </button>

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="btn btn-outline btn-sm gap-1.5 text-xs whitespace-nowrap flex-1 sm:flex-initial"
            title="Desfazer última operação"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Desfazer</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenNewItemModal}
          className="btn btn-primary btn-sm gap-1.5 text-xs font-semibold shadow-xs whitespace-nowrap w-full"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item</span>
        </button>
      </div>
    </div>
  );
};
