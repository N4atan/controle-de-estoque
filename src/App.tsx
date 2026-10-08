import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { InventoryTable } from './components/InventoryTable';
import { HistorySection } from './components/HistorySection';
import { ItemModal } from './components/ItemModal';
import { MovementModal } from './components/MovementModal';
import { CategoryModal } from './components/CategoryModal';
import { DbSettingsModal } from './components/DbSettingsModal';
import { LoginForm } from './components/LoginForm';

import type { StockItem, HistoryEntry } from './types/stock';
import { INITIAL_STOCK, INITIAL_HISTORY, CATEGORIES } from './data/initialData';
import { api, type SupabaseStatusResponse } from './services/api';
import { authService, type User } from './services/auth';
import { supabase } from './services/supabase';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const operatorName = currentUser?.name || 'Responsável do Terreiro';

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<SupabaseStatusResponse | null>(null);
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // App States
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [items, setItems] = useState<StockItem[]>(INITIAL_STOCK);
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);
  const [canUndo, setCanUndo] = useState<boolean>(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<StockItem | null>(null);

  // Check Database Status & Fetch Data
  const loadAppData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const status = await api.getStatus();
      setDbStatus(status);

      if (status.connected) {
        // Fetch from Supabase
        const [cats, stockItems, historyLogs] = await Promise.all([
          api.getCategories().catch(() => CATEGORIES),
          api.getItems().catch(() => INITIAL_STOCK),
          api.getHistory().catch(() => INITIAL_HISTORY),
        ]);

        if (cats && cats.length > 0) setCategories(cats);
        if (stockItems && stockItems.length > 0) setItems(stockItems);
        if (historyLogs) setHistory(historyLogs);
        setCanUndo(true);
      } else {
        // LocalStorage Fallback if Database not connected
        const savedCats = localStorage.getItem('terreira_estoque_categories');
        const savedItems = localStorage.getItem('terreira_estoque_items');
        const savedHist = localStorage.getItem('terreira_estoque_history');

        if (savedCats) setCategories(JSON.parse(savedCats));
        if (savedItems) setItems(JSON.parse(savedItems));
        if (savedHist) setHistory(JSON.parse(savedHist));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do app:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // ⚡ Supabase Realtime Subscription Listener ⚡
  useEffect(() => {
    if (!dbStatus?.connected) return;

    console.log('⚡ Conectando ao canal Supabase Realtime...');
    const channel = supabase
      .channel('realtime-stock')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        console.log('⚡ Alteração em items detectada via Realtime!');
        api.getItems().then(setItems).catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'history' }, () => {
        console.log('⚡ Alteração em history detectada via Realtime!');
        api.getHistory().then(setHistory).catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        console.log('⚡ Alteração em categories detectada via Realtime!');
        api.getCategories().then(setCategories).catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbStatus?.connected]);

  // Sync to LocalStorage when offline
  useEffect(() => {
    if (!dbStatus?.connected) {
      localStorage.setItem('terreira_estoque_categories', JSON.stringify(categories));
      localStorage.setItem('terreira_estoque_items', JSON.stringify(items));
      localStorage.setItem('terreira_estoque_history', JSON.stringify(history));
    }
  }, [categories, items, history, dbStatus]);

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

  // Add Item
  const handleAddItem = async (itemData: {
    name: string;
    type: string;
    quantity: number;
    date: string;
  }) => {
    if (dbStatus?.connected) {
      try {
        const newItem = await api.addItem({ ...itemData, user: operatorName });
        setItems((prev) => [...prev, newItem]);
        const updatedHistory = await api.getHistory();
        setHistory(updatedHistory);
        setIsItemModalOpen(false);
      } catch (err: any) {
        alert(err.message || 'Erro ao cadastrar item no Supabase.');
      }
    } else {
      // Local fallback
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
      ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const newHistoryEntry: HistoryEntry = {
        id: `h-${Date.now()}`,
        datetime,
        dateRaw: itemData.date,
        type: 'CADASTRAR',
        name: newItem.name,
        qty: newItem.quantity,
        user: operatorName,
      };

      setHistory((prev) => [newHistoryEntry, ...prev]);
      setIsItemModalOpen(false);
    }
  };

  // Stock Movement (Entrada / Saída)
  const handleMovement = async (
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

    if (dbStatus?.connected) {
      try {
        const result = await api.moveStock(itemId, movType, qty, operatorName);
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity: result.newQuantity } : i))
        );
        const updatedHistory = await api.getHistory();
        setHistory(updatedHistory);
        setIsMovementModalOpen(false);
        setSelectedItemForMovement(null);
      } catch (err: any) {
        alert(err.message || 'Erro ao registrar movimentação.');
      }
    } else {
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
      ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const dateRaw = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

      const newHistoryEntry: HistoryEntry = {
        id: `h-${Date.now()}`,
        datetime,
        dateRaw,
        type: movType,
        name: item.name,
        qty,
        user: operatorName,
      };

      setHistory((prev) => [newHistoryEntry, ...prev]);
      setIsMovementModalOpen(false);
      setSelectedItemForMovement(null);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = items.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    if (
      !window.confirm(
        `Deseja realmente excluir o item "${itemToDelete.name}" (${itemToDelete.id})?`
      )
    ) {
      return;
    }

    if (dbStatus?.connected) {
      try {
        await api.deleteItem(itemId);
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir item.');
      }
    } else {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  // Undo Last Action
  const handleUndo = async () => {
    if (dbStatus?.connected) {
      try {
        const res = await api.undo();
        alert(res.message);
        loadAppData();
      } catch (err: any) {
        alert(err.message || 'Nenhuma operação recente para desfazer.');
      }
    } else {
      alert('Recurso de desfazer via banco necessita de conexão Supabase ativa.');
    }
  };

  // Delete single history log
  const handleDeleteHistoryItem = async (historyId: string) => {
    if (!window.confirm('Deseja realmente excluir este registro do histórico?')) {
      return;
    }
    if (dbStatus?.connected) {
      try {
        await api.deleteHistoryItem(historyId);
        setHistory((prev) => prev.filter((h) => h.id !== historyId));
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir registro.');
      }
    } else {
      setHistory((prev) => prev.filter((h) => h.id !== historyId));
    }
  };

  // Clear all history
  const handleClearHistory = async () => {
    if (!window.confirm('Deseja realmente limpar todo o histórico de movimentações?')) {
      return;
    }
    if (dbStatus?.connected) {
      try {
        await api.clearHistory();
        setHistory([]);
      } catch (err: any) {
        alert(err.message || 'Erro ao limpar histórico.');
      }
    } else {
      setHistory([]);
    }
  };

  // Add New Category
  const handleAddCategory = async (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('Esta categoria já existe!');
      return;
    }

    if (dbStatus?.connected) {
      try {
        await api.addCategory(trimmed);
        setCategories((prev) => [...prev, trimmed]);
        setSelectedCategory(trimmed);
        setIsCategoryModalOpen(false);
      } catch (err: any) {
        alert(err.message || 'Erro ao adicionar categoria.');
      }
    } else {
      setCategories((prev) => [...prev, trimmed]);
      setSelectedCategory(trimmed);
      setIsCategoryModalOpen(false);
    }
  };

  const handleInitDbManual = async () => {
    await api.initDb();
    await loadAppData();
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200/40 text-base-content antialiased">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        dbStatus={dbStatus}
        onOpenDbSettings={() => setIsDbSettingsOpen(true)}
      />

      {/* Login Form Overlay if not logged in */}
      {!currentUser && (
        <LoginForm onLogin={handleLogin} />
      )}

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {isLoadingData && (
          <div className="alert alert-info shadow-xs flex items-center justify-between text-xs py-2">
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-xs" />
              Sincronizando estoque ao vivo com Supabase Realtime...
            </span>
          </div>
        )}

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
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          searchTerm={searchTerm}
          onSearchChange={(term) => setSearchTerm(term)}
          onOpenNewItemModal={() => setIsItemModalOpen(true)}
          onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
          onUndo={handleUndo}
          canUndo={canUndo}
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

      {/* Supabase Realtime Database Settings Modal */}
      <DbSettingsModal
        isOpen={isDbSettingsOpen}
        onClose={() => setIsDbSettingsOpen(false)}
        dbStatus={dbStatus}
        onRefreshStatus={loadAppData}
        onInitDb={handleInitDbManual}
      />
    </div>
  );
}

export default App;
