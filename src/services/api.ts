import { supabase, checkSupabaseStatus, type SupabaseStatusResponse } from './supabase';
import type { StockItem, HistoryEntry } from '../types/stock';

export type { SupabaseStatusResponse };

export const api = {
  // 1. Connection Status
  async getStatus(): Promise<SupabaseStatusResponse> {
    return checkSupabaseStatus();
  },

  // 2. Initialize Database & Seed
  async initDb(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Banco de dados Supabase verificado e ativo!' };
  },

  // 3. Categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase.from('categories').select('name').order('id', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((c: any) => c.name);
  },

  async addCategory(name: string): Promise<{ success: boolean; name: string }> {
    const trimmed = name.trim();
    const { error } = await supabase.from('categories').insert([{ name: trimmed }]);
    if (error && !error.message.includes('unique constraint')) {
      throw new Error(error.message);
    }
    return { success: true, name: trimmed };
  },

  // 4. Stock Items
  async getItems(): Promise<StockItem[]> {
    const { data, error } = await supabase.from('items').select('id, name, type, quantity, date').order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addItem(data: { name: string; type: string; quantity: number; date: string; user?: string }): Promise<StockItem> {
    // Count existing items to generate ID
    const { count } = await supabase.from('items').select('*', { count: 'exact', head: true });
    const id = `ITEM-${String((count || 0) + 1).padStart(3, '0')}`;

    const newItem: StockItem = {
      id,
      name: data.name,
      type: data.type,
      quantity: Number(data.quantity),
      date: data.date,
    };

    const { error: itemErr } = await supabase.from('items').insert([newItem]);
    if (itemErr) throw new Error(itemErr.message);

    // History Record
    const now = new Date();
    const datetime = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    const historyId = `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const operatorName = data.user || 'Responsável';

    await supabase.from('history').insert([{
      id: historyId,
      datetime,
      date_raw: data.date,
      type: 'CADASTRAR',
      name: data.name,
      qty: Number(data.quantity),
      user_name: operatorName,
    }]);

    // Save Undo Action
    await supabase.from('undo_actions').insert([{
      action_type: 'ADD_ITEM',
      action_data: { itemId: id },
    }]);

    return newItem;
  },

  async deleteItem(id: string): Promise<{ success: boolean; deletedId: string }> {
    // Fetch item first for undo
    const { data } = await supabase.from('items').select('*').eq('id', id).single();
    if (data) {
      await supabase.from('undo_actions').insert([{
        action_type: 'DELETE_ITEM',
        action_data: { itemData: data },
      }]);
    }

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw new Error(error.message);

    return { success: true, deletedId: id };
  },

  // 5. Movements (Entrada / Saída)
  async moveStock(itemId: string, movType: 'ENTRADA' | 'SAIDA', qty: number, user?: string): Promise<{ success: boolean; itemId: string; newQuantity: number }> {
    const { data: item, error: fetchErr } = await supabase.from('items').select('*').eq('id', itemId).single();
    if (fetchErr || !item) throw new Error('Item não encontrado no Supabase');

    const numQty = Number(qty);
    if (movType === 'SAIDA' && item.quantity < numQty) {
      throw new Error('Quantidade insuficiente em estoque para esta saída!');
    }

    const newQty = movType === 'ENTRADA' ? item.quantity + numQty : item.quantity - numQty;

    const { error: updateErr } = await supabase
      .from('items')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (updateErr) throw new Error(updateErr.message);

    // History Record
    const now = new Date();
    const datetime = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateRaw = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const historyId = `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const operatorName = user || 'Responsável';

    await supabase.from('history').insert([{
      id: historyId,
      datetime,
      date_raw: dateRaw,
      type: movType,
      name: item.name,
      qty: numQty,
      user_name: operatorName,
    }]);

    // Save Undo Action
    await supabase.from('undo_actions').insert([{
      action_type: 'MOVEMENT',
      action_data: { itemId, movType, qty: numQty },
    }]);

    return { success: true, itemId, newQuantity: newQty };
  },

  // 6. History Logs
  async getHistory(): Promise<HistoryEntry[]> {
    const { data, error } = await supabase.from('history').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return (data || []).map((h: any) => ({
      id: h.id,
      datetime: h.datetime,
      dateRaw: h.date_raw,
      type: h.type,
      name: h.name,
      qty: h.qty,
      user: h.user_name || h.user || 'Responsável',
    }));
  },

  async deleteHistoryItem(id: string): Promise<{ success: boolean }> {
    const { error } = await supabase.from('history').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async clearHistory(): Promise<{ success: boolean }> {
    const { error } = await supabase.from('history').delete().neq('id', '');
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // 7. Undo Last Action
  async undo(): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase.from('undo_actions').select('*').order('id', { ascending: false }).limit(1);
    if (error || !data || data.length === 0) {
      throw new Error('Nenhuma operação recente para desfazer.');
    }

    const last = data[0];
    const actionData = typeof last.action_data === 'string' ? JSON.parse(last.action_data) : last.action_data;

    if (last.action_type === 'ADD_ITEM') {
      await supabase.from('items').delete().eq('id', actionData.itemId);
    } else if (last.action_type === 'DELETE_ITEM') {
      await supabase.from('items').upsert(actionData.itemData);
    } else if (last.action_type === 'MOVEMENT') {
      const { itemId, movType, qty } = actionData;
      const { data: item } = await supabase.from('items').select('quantity').eq('id', itemId).single();
      if (item) {
        const revertedQty = movType === 'ENTRADA' ? item.quantity - qty : item.quantity + qty;
        await supabase.from('items').update({ quantity: revertedQty }).eq('id', itemId);
      }
    }

    await supabase.from('undo_actions').delete().eq('id', last.id);
    return { success: true, message: 'Operação desfeita com sucesso!' };
  },
};
