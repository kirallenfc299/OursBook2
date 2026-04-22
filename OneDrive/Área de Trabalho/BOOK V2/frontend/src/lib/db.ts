// Database layer — Supabase (Postgres)
// Replaces better-sqlite3 with @supabase/supabase-js server-side client

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side client (used in API routes only)
export const db = createClient(supabaseUrl, supabaseKey);

export type DBUser = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  password: string;
  avatar: string | null;
  subscription_tier: 'basic' | 'premium' | 'ultimate';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type SafeUser = Omit<DBUser, 'password'>;

export function toSafeUser(u: DBUser): SafeUser {
  const { password, ...rest } = u;
  return rest;
}

// ─── Seed default users (called once on first API request) ───────────────────
let seeded = false;
export async function ensureSeeded() {
  if (seeded) return;
  seeded = true;

  const { data } = await db
    .from('users')
    .select('id')
    .eq('email', 'admin@oursbook.com')
    .maybeSingle();

  if (!data) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const userHash = bcrypt.hashSync('user123', 10);
    const now = new Date().toISOString();

    await db.from('users').insert([
      {
        id: uuidv4(),
        email: 'admin@oursbook.com',
        name: 'Administrador',
        password: adminHash,
        subscription_tier: 'ultimate',
        is_admin: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        email: 'user@oursbook.com',
        name: 'Usuário Demo',
        password: userHash,
        subscription_tier: 'basic',
        is_admin: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  }
}

// Legacy compat — getDb() used in old routes
export function getDb() {
  return null as any; // not used anymore
}
