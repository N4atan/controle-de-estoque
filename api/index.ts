import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getPool, checkConnection, initDb } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Health check & status
app.get('/api/status', async (_req, res) => {
  const status = await checkConnection();
  res.json(status);
});

// 2. Initialize Database Tables & Seed
app.post('/api/init', async (_req, res) => {
  try {
    const result = await initDb();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Erro ao inicializar banco de dados' });
  }
});

// 3. Categories
app.get('/api/categories', async (_req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT name FROM categories ORDER BY id ASC');
    res.json(result.rows.map((r: any) => r.name));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao buscar categorias' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Nome da categoria é obrigatório' });
      return;
    }
    const trimmed = name.trim();
    const pool = getPool();
    await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING', [trimmed]);
    res.json({ success: true, name: trimmed });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao adicionar categoria' });
  }
});

// 4. Stock Items
app.get('/api/items', async (_req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT id, name, type, quantity, date FROM items ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao buscar itens' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, type, quantity, date, user } = req.body;
    if (!name || !type || quantity === undefined || !date) {
      res.status(400).json({ error: 'Todos os campos do item são obrigatórios' });
      return;
    }

    const pool = getPool();
    // Count existing items to generate ID
    const countResult = await pool.query('SELECT COUNT(*)::int as count FROM items');
    const count = (countResult.rows[0]?.count || 0) + 1;
    const id = `ITEM-${String(count).padStart(3, '0')}`;

    // Insert Item
    await pool.query(
      'INSERT INTO items (id, name, type, quantity, date) VALUES ($1, $2, $3, $4, $5)',
      [id, name, type, quantity, date]
    );

    // Add History Record
    const now = new Date();
    const datetime = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    const historyId = `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const operatorName = user || 'Responsável';

    await pool.query(
      'INSERT INTO history (id, datetime, date_raw, type, name, qty, user_name) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [historyId, datetime, date, 'CADASTRAR', name, quantity, operatorName]
    );

    // Save Undo Action
    await pool.query(
      'INSERT INTO undo_actions (action_type, action_data) VALUES ($1, $2)',
      ['ADD_ITEM', JSON.stringify({ itemId: id })]
    );

    const newItem = { id, name, type, quantity: Number(quantity), date };
    res.json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao criar item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Fetch existing item for undo
    const existing = await pool.query('SELECT id, name, type, quantity, date FROM items WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    const itemToDelete = existing.rows[0];

    // Delete item
    await pool.query('DELETE FROM items WHERE id = $1', [id]);

    // Save Undo Action
    await pool.query(
      'INSERT INTO undo_actions (action_type, action_data) VALUES ($1, $2)',
      ['DELETE_ITEM', JSON.stringify({ itemData: itemToDelete })]
    );

    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao excluir item' });
  }
});

// 5. Stock Movement (Entrada / Saída)
app.post('/api/movements', async (req, res) => {
  try {
    const { itemId, movType, qty, user } = req.body;
    if (!itemId || !movType || !qty) {
      res.status(400).json({ error: 'Dados da movimentação incompletos' });
      return;
    }

    const pool = getPool();
    const existing = await pool.query('SELECT id, name, quantity FROM items WHERE id = $1', [itemId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    const currentItem = existing.rows[0];
    const numQty = Number(qty);

    if (movType === 'SAIDA' && currentItem.quantity < numQty) {
      res.status(400).json({ error: 'Quantidade insuficiente em estoque para esta saída!' });
      return;
    }

    const newQty = movType === 'ENTRADA' ? currentItem.quantity + numQty : currentItem.quantity - numQty;

    // Update quantity
    await pool.query('UPDATE items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newQty, itemId]);

    // History Entry
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

    await pool.query(
      'INSERT INTO history (id, datetime, date_raw, type, name, qty, user_name) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [historyId, datetime, dateRaw, movType, currentItem.name, numQty, operatorName]
    );

    // Save Undo Action
    await pool.query(
      'INSERT INTO undo_actions (action_type, action_data) VALUES ($1, $2)',
      ['MOVEMENT', JSON.stringify({ itemId, movType, qty: numQty })]
    );

    res.json({ success: true, itemId, newQuantity: newQty });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao realizar movimentação' });
  }
});

// 6. History
app.get('/api/history', async (_req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT id, datetime, date_raw as "dateRaw", type, name, qty, user_name as "user"
      FROM history
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao carregar histórico' });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('DELETE FROM history WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao remover histórico' });
  }
});

app.delete('/api/history', async (_req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM history');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao limpar histórico' });
  }
});

// 7. Undo Last Action
app.post('/api/undo', async (_req, res) => {
  try {
    const pool = getPool();
    const lastActions = await pool.query('SELECT id, action_type, action_data FROM undo_actions ORDER BY id DESC LIMIT 1');
    if (lastActions.rows.length === 0) {
      res.status(400).json({ error: 'Nenhuma operação recente para desfazer.' });
      return;
    }

    const last = lastActions.rows[0];
    const data = typeof last.action_data === 'string' ? JSON.parse(last.action_data) : last.action_data;

    if (last.action_type === 'ADD_ITEM') {
      await pool.query('DELETE FROM items WHERE id = $1', [data.itemId]);
    } else if (last.action_type === 'DELETE_ITEM') {
      const item = data.itemData;
      await pool.query(
        `INSERT INTO items (id, name, type, quantity, date)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET quantity = $4`,
        [item.id, item.name, item.type, item.quantity, item.date]
      );
    } else if (last.action_type === 'MOVEMENT') {
      const { itemId, movType, qty } = data;
      const existing = await pool.query('SELECT quantity FROM items WHERE id = $1', [itemId]);
      if (existing.rows.length > 0) {
        const curQty = existing.rows[0].quantity;
        const revertedQty = movType === 'ENTRADA' ? curQty - qty : curQty + qty;
        await pool.query('UPDATE items SET quantity = $1 WHERE id = $2', [revertedQty, itemId]);
      }
    }

    // Remove the undo action row
    await pool.query('DELETE FROM undo_actions WHERE id = $1', [last.id]);

    res.json({ success: true, message: 'Operação desfeita com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao desfazer ação' });
  }
});

// Local development server listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API Server rodando em http://localhost:${PORT}`);
  });
}

export default app;
