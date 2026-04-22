import { NextRequest, NextResponse } from 'next/server';
import { pgQuery } from '@/lib/pgClient';
import { verifyToken } from '@/lib/jwt';

function safeUser(u: any) {
  const { password_hash, ...rest } = u;
  return rest;
}

function requireAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const p = verifyToken(auth.slice(7));
    return p.is_admin ? p : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

  const { rows } = await pgQuery('SELECT * FROM users ORDER BY created_at DESC');
  return NextResponse.json(rows.map(safeUser));
}
