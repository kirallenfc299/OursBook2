// Server-side PostgreSQL client for Next.js API routes
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

// Reuse pool across hot reloads in dev
const pool = global._pgPool ?? new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'oursbook',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
}

export async function pgQuery(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export default pool;
