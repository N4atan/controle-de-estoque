import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

export function getConnectionString(): string | null {
  return process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || null;
}

let poolInstance: InstanceType<typeof Pool> | null = null;

export function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada no ambiente.');
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return poolInstance;
}

export async function checkConnection(): Promise<{ connected: boolean; message: string; dbName?: string }> {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return {
      connected: false,
      message: 'DATABASE_URL não configurada. Configure o .env ou a variável de ambiente no Neon/Vercel.',
    };
  }

  try {
    const pool = getPool();
    const result = await pool.query('SELECT current_database(), current_user, version()');
    const dbName = result.rows[0]?.current_database || 'neondb';
    return {
      connected: true,
      message: `Conectado com sucesso ao PostgreSQL (Neon) - Banco: ${dbName}`,
      dbName,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: `Erro ao conectar ao Neon PostgreSQL: ${error?.message || String(error)}`,
    };
  }
}

export const DEFAULT_CATEGORIES = [
  'Limpeza, Higiene e Manutenção',
  'Velas (Estoque Mensal)',
  'Itens para Trabalho',
  'Alimentos & Oferendas',
  'Artigos & Fundamento',
  'Geral'
];

export const INITIAL_ITEMS = [
  // --- Limpeza, higiene e manutenção ---
  { id: 'ITEM-001', name: 'Água sanitária 5L', type: 'Limpeza, Higiene e Manutenção', quantity: 5, date: '2026-03-01' },
  { id: 'ITEM-002', name: 'Cera incolor (und)', type: 'Limpeza, Higiene e Manutenção', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-003', name: 'Lustra móveis (und)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-004', name: 'Detergente (und)', type: 'Limpeza, Higiene e Manutenção', quantity: 3, date: '2026-03-01' },
  { id: 'ITEM-005', name: 'Sabão em barra (und)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-006', name: 'Álcool 70 (und)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-007', name: 'Álcool 92 (und)', type: 'Limpeza, Higiene e Manutenção', quantity: 3, date: '2026-03-01' },
  { id: 'ITEM-008', name: 'Esponja (pacote)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-009', name: 'Bombril (pacote)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-010', name: 'Sabonete líquido', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-011', name: 'Papel higiênico (rolos)', type: 'Limpeza, Higiene e Manutenção', quantity: 8, date: '2026-03-01' },
  { id: 'ITEM-012', name: 'Ajax rosa 1L', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-013', name: 'Saco de lixo 50L (unidades)', type: 'Limpeza, Higiene e Manutenção', quantity: 20, date: '2026-03-01' },
  { id: 'ITEM-014', name: 'Pano de chão', type: 'Limpeza, Higiene e Manutenção', quantity: 6, date: '2026-03-01' },
  { id: 'ITEM-015', name: 'Papel toalha (rolos)', type: 'Limpeza, Higiene e Manutenção', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-016', name: 'Papel de mão (pacote)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-017', name: 'Plástico filme (rolo)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-018', name: 'Papel alumínio (rolo)', type: 'Limpeza, Higiene e Manutenção', quantity: 1, date: '2026-03-01' },

  // --- Velas (Estoque Mensal) ---
  { id: 'ITEM-019', name: 'Vela Palito Branca (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 8, date: '2026-03-01' },
  { id: 'ITEM-020', name: 'Vela Palito Vermelha (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-021', name: 'Vela Palito Azul (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-022', name: 'Vela Palito Amarela (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-023', name: 'Vela Palito Verde (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-024', name: 'Vela Palito Marrom (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-025', name: 'Vela Palito Cosme (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-026', name: 'Vela Palito Ogum 3 Cores (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-027', name: 'Vela Palito Laranja (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-028', name: 'Vela Palito Preta e Vermelha (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-029', name: 'Vela Palito Preta (pacotes)', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-030', name: 'Vela 7 Dias Vermelha', type: 'Velas (Estoque Mensal)', quantity: 10, date: '2026-03-01' },
  { id: 'ITEM-031', name: 'Vela 7 Dias Laranja', type: 'Velas (Estoque Mensal)', quantity: 10, date: '2026-03-01' },
  { id: 'ITEM-032', name: 'Vela 7 Dias Azul', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-033', name: 'Vela 7 Dias Amarela', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-034', name: 'Vela 7 Dias Marrom', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-035', name: 'Vela 7 Dias Verde', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-036', name: 'Vela 7 Dias Cosme', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-037', name: 'Vela 7 Dias Ogum 3 Cores', type: 'Velas (Estoque Mensal)', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-038', name: 'Vela 7 Dias Branca', type: 'Velas (Estoque Mensal)', quantity: 10, date: '2026-03-01' },

  // --- Itens para Trabalho ---
  { id: 'ITEM-039', name: 'Mel 1kg', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-040', name: 'Fósforo (pacote)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-041', name: 'Defumação (pote)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-042', name: 'Carvão (pacote)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-043', name: 'Pólvora (tubos)', type: 'Itens para Trabalho', quantity: 3, date: '2026-03-01' },
  { id: 'ITEM-044', name: 'Algodão (caixas)', type: 'Itens para Trabalho', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-045', name: 'Abafador barro', type: 'Itens para Trabalho', quantity: 3, date: '2026-03-01' },
  { id: 'ITEM-046', name: 'Bala / Pirulito (vidro)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-047', name: 'Cachaça (unidades)', type: 'Itens para Trabalho', quantity: 6, date: '2026-03-01' },
  { id: 'ITEM-048', name: 'Charuto (unidades)', type: 'Itens para Trabalho', quantity: 20, date: '2026-03-01' },
  { id: 'ITEM-049', name: 'Cigarro longo (carteira)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-050', name: 'Azeite de Dendê 1L', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-051', name: 'Bandejas', type: 'Itens para Trabalho', quantity: 10, date: '2026-03-01' },
  { id: 'ITEM-052', name: 'Café 1kg', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-053', name: 'Filtro de café (102)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-054', name: 'Farinha de mandioca (pacotes)', type: 'Itens para Trabalho', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-055', name: 'Farinha de milho (pacote)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-056', name: 'Alguidar trabalho', type: 'Itens para Trabalho', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-057', name: 'Polenta (pacote)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-058', name: 'Pipoca (pacotes)', type: 'Itens para Trabalho', quantity: 6, date: '2026-03-01' },
  { id: 'ITEM-059', name: 'Milho 2kg', type: 'Itens para Trabalho', quantity: 2, date: '2026-03-01' },
  { id: 'ITEM-060', name: 'Alpiste 500g', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-061', name: 'Semente de girassol 500g', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-062', name: 'Canela em pó (pote)', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-063', name: 'Canela em pau (unidades)', type: 'Itens para Trabalho', quantity: 10, date: '2026-03-01' },
  { id: 'ITEM-064', name: 'Pemba branca', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-065', name: 'Pemba azul', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-066', name: 'Pemba verde', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-067', name: 'Pemba vermelha', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-068', name: 'Pemba amarela', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-069', name: 'Lâmina', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-070', name: 'Alfinete', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-071', name: 'Óleo de rícino', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-072', name: 'Vassoura xapanã', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-073', name: 'Varas marmelo', type: 'Itens para Trabalho', quantity: 1, date: '2026-03-01' },
  { id: 'ITEM-074', name: 'Chaves (unidades)', type: 'Itens para Trabalho', quantity: 7, date: '2026-03-01' },
];

export async function initDb() {
  const pool = getPool();

  // Create Categories Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Items Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      quantity INT NOT NULL DEFAULT 0,
      date VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create History Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS history (
      id VARCHAR(100) PRIMARY KEY,
      datetime VARCHAR(50) NOT NULL,
      date_raw VARCHAR(20) NOT NULL,
      type VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      qty INT NOT NULL,
      user_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Undo Actions Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS undo_actions (
      id SERIAL PRIMARY KEY,
      action_type VARCHAR(50) NOT NULL,
      action_data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if categories table is empty and seed
  const existingCat = await pool.query('SELECT COUNT(*)::int as count FROM categories');
  if (existingCat.rows[0]?.count === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING', [cat]);
    }
  }

  // Check if items table is empty and seed
  const existingItems = await pool.query('SELECT COUNT(*)::int as count FROM items');
  if (existingItems.rows[0]?.count === 0) {
    for (const item of INITIAL_ITEMS) {
      await pool.query(
        `INSERT INTO items (id, name, type, quantity, date)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.name, item.type, item.quantity, item.date]
      );
    }
  }

  return { success: true, message: 'Banco de dados inicializado e migrado com sucesso!' };
}
