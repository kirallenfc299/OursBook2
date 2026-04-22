require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'oursbook',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// ─── Schema: adiciona colunas que faltam sem destruir dados existentes ────────
async function initSchema() {
  // Adicionar colunas que podem não existir ainda
  await query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'basic'
        CHECK(subscription_tier IN ('basic','premium','ultimate')),
      ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `).catch(() => {}); // ignora se já existir

  // Criar tabela user_books se não existir (mapeada sobre favorites + reading_progress)
  await query(`
    CREATE TABLE IF NOT EXISTS user_books (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id    INTEGER NOT NULL,
      list_type  TEXT NOT NULL
                   CHECK(list_type IN ('favorites','reading_list','currently_reading','completed')),
      progress   REAL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, book_id, list_type)
    )
  `);

  // Seed admin se não existir
  const { rows } = await query(`SELECT id FROM users WHERE email = $1`, ['admin@oursbook.com']);
  if (rows.length === 0) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const userHash  = bcrypt.hashSync('user123', 10);
    const sid1 = require('crypto').randomUUID();
    const sid2 = require('crypto').randomUUID();

    await query(`
      INSERT INTO users (session_id, email, name, password_hash, subscription_tier, is_admin)
      VALUES ($1,$2,$3,$4,'ultimate',true), ($5,$6,$7,$8,'basic',false)
    `, [sid1, 'admin@oursbook.com', 'Administrador', adminHash,
        sid2, 'user@oursbook.com',  'Usuário Demo',  userHash]);

    console.log('✅ Default users created');
  }

  console.log('✅ Database ready (PostgreSQL oursbook)');
}

module.exports = { pool, query, initSchema };
