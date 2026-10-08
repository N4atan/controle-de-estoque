import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { InventoryTable } from './components/InventoryTable';
import { HistorySection } from './components/HistorySection';
import { ItemModal } from './components/ItemModal';
import { MovementModal } from './components/MovementModal';
import { CategoryModal } from './components/CategoryModal';

import type { StockItem, HistoryEntry, UndoAction } from './types/stock';
import { INITIAL_STOCK, INITIAL_HISTORY, CATEGORIES } from './data/initialData';

const STORAGE_KEYS = {
  ITEMS: 'terreira_estoque_items',
  HISTORY: 'terreira_estoque_history',
  UNDO: 'terreira_estoque_undo',
  CATEGORIES: 'terreira_estoque_categories',
};

function App() {
  const [operatorName] = useState<string>('Responsável do Terreiro');

  // Categories State
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  });

  // Items State
  const [items, setItems] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_STOCK;
    } catch {
      return INITIAL_STOCK;
    }
  });

  // History Log State
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  // Undo Stack State
  const [undoStack, setUndoStack] = useState<UndoAction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNDO);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<StockItem | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNDO, JSON.stringify(undoStack));
  }, [undoStack]);

  // Filtered items logic
  const filteredItems = items.filter((item) => {
    const sTerm = searchTerm.toLowerCase().trim();
    if (sTerm !== '') {
      return (
        item.name.toLowerCase().includes(sTerm) ||
        item.id.toLowerCase().includes(sTerm) ||
        item.type.toLowerCase().includes(sTerm)
      );
    }
    if (selectedCategory !== '') {
      return item.type === selectedCategory;
    }
    return true;
  });

  // Helper to record undoable actions
  const pushUndoAction = (action: UndoAction) => {
    setUndoStack((prev) => {
      const updated = [...prev, action];
      if (updated.length > 20) updated.shift();
      return updated;
    });
  };

  // Add Item
  const handleAddItem = (itemData: {
    name: string;
    type: string;
    quantity: number;
    date: string;
  }) => {
    const count = items.length + 1;
    const id = `ITEM-${String(count).padStart(3, '0')}`;

    const newItem: StockItem = {
      id,
      name: itemData.name,
      type: itemData.type,
      quantity: itemData.quantity,
      date: itemData.date,
    };

    setItems((prev) => [...prev, newItem]);

    const now = new Date();
    const datetime = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newHistoryEntry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      datetime,
      dateRaw: itemData.date,
      type: 'CADASTRAR',
      name: newItem.name,
      qty: newItem.quantity,
      user: operatorName,
    };

    setHistory((prev) => [newHistoryEntry, ...prev]);

    pushUndoAction({
      type: 'ADD_ITEM',
      itemId: id,
    });

    setIsItemModalOpen(false);
  };

  // Stock Movement (Entrada / Saída)
  const handleMovement = (
    itemId: string,
    movType: 'ENTRADA' | 'SAIDA',
    qty: number
  ) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (movType === 'SAIDA' && item.quantity < qty) {
      alert('Quantidade insuficiente em estoque para esta saída!');
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const newQty = movType === 'ENTRADA' ? i.quantity + qty : i.quantity - qty;
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );

    const now = new Date();
    const datetime = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateRaw = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')}`;

    const newHistoryEntry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      datetime,
      dateRaw,
      type: movType,
      name: item.name,
      qty,
      user: operatorName,
    };

    setHistory((prev) => [newHistoryEntry, ...prev]);

    pushUndoAction({
      type: 'MOVEMENT',
      itemId,
      movType,
      qty,
    });

    setIsMovementModalOpen(false);
    setSelectedItemForMovement(null);
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = items.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    if (
      !window.confirm(
        `Deseja realmente excluir o item "${itemToDelete.name}" (${itemToDelete.id})?`
      )
    ) {
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== itemId));

    pushUndoAction({
      type: 'DELETE_ITEM',
      itemData: itemToDelete,
    });
  };

  // Undo Last Action
  const handleUndo = () => {
    if (undoStack.length === 0) {
      alert('Nenhuma operação recente para desfazer.');
      return;
    }

    const newStack = [...undoStack];
    const lastAction = newStack.pop();
    if (!lastAction) return;

    setUndoStack(newStack);

    if (lastAction.type === 'ADD_ITEM') {
      setItems((prev) => prev.filter((i) => i.id !== lastAction.itemId));
      setHistory((prev) => prev.slice(1));
    } else if (lastAction.type === 'DELETE_ITEM') {
      setItems((prev) => [...prev, lastAction.itemData]);
    } else if (lastAction.type === 'MOVEMENT') {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === lastAction.itemId) {
            const revertedQty =
              lastAction.movType === 'ENTRADA'
                ? i.quantity - lastAction.qty
                : i.quantity + lastAction.qty;
            return { ...i, quantity: revertedQty };
          }
          return i;
        })
      );
      setHistory((prev) => prev.slice(1));
    }

    alert('Última operação desfeita com sucesso!');
  };

  // Delete single history log
  const handleDeleteHistoryItem = (historyId: string) => {
    if (!window.confirm('Deseja realmente excluir este registro do histórico?')) {
      return;
    }
    setHistory((prev) => prev.filter((h) => h.id !== historyId));
  };

  // Clear all history
  const handleClearHistory = () => {
    if (
      !window.confirm('Deseja realmente limpar todo o histórico de movimentações?')
    ) {
      return;
    }
    setHistory([]);
  };

  // Add New Category
  const handleAddCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('Esta categoria já existe!');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setSelectedCategory(trimmed);
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200/40 text-base-content antialiased">
      {/* Top Header */}
      <Header operatorName={operatorName} />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* KPI / Summary Cards */}
        <StatsCards
          items={items}
          filteredItems={filteredItems}
          isSearching={searchTerm !== '' || selectedCategory !== ''}
        />

        {/* Action & Filter Bar */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
          }}
          searchTerm={searchTerm}
          onSearchChange={(term) => setSearchTerm(term)}
          onOpenNewItemModal={() => setIsItemModalOpen(true)}
          onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
          onUndo={handleUndo}
          canUndo={undoStack.length > 0}
        />

        {/* Inventory Items Table */}
        <InventoryTable
          items={filteredItems}
          totalItems={items.length}
          onOpenMovement={(item) => {
            setSelectedItemForMovement(item);
            setIsMovementModalOpen(true);
          }}
          onDeleteItem={handleDeleteItem}
        />

        {/* History Log Section */}
        <HistorySection
          history={history}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Footer */}
      <footer className="footer sm:footer-horizontal bg-base-100 text-base-content/70 border-t border-base-200 p-4 text-center justify-center no-print mt-8">
        <p className="text-xs">
          Controle de Estoque da Terreira &copy; {new Date().getFullYear()} — Sistema Integrado de Gestão de Suprimentos
        </p>
      </footer>

      {/* Add New Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSubmit={handleAddItem}
        categories={categories}
        onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      {/* Move Stock Modal */}
      <MovementModal
        item={selectedItemForMovement}
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setSelectedItemForMovement(null);
        }}
        onSubmit={handleMovement}
      />

      {/* Add New Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        existingCategories={categories}
      />
    </div>
  );
}

export default App;
