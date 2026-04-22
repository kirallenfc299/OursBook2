import { NextRequest, NextResponse } from 'next/server';
import { pgQuery } from '@/lib/pgClient';
import { verifyToken } from '@/lib/jwt';

function safeUser(u: any) {
  const { password_hash, ...rest } = u;
  return rest;
}

function getToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const payload = verifyToken(token);
    const { rows } = await pgQuery('SELECT * FROM users WHERE id = $1', [payload.id]);
    if (!rows[0]) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });

    return NextResponse.json(safeUser(rows[0]));
  } catch {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const payload = verifyToken(token);
    const { name, username, avatar } = await req.json();

    await pgQuery(
      `UPDATE users SET
        name = COALESCE($1, name),
        username = COALESCE($2, username),
        avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4`,
      [name ?? null, username ?? null, avatar ?? null, payload.id]
    );

    const { rows } = await pgQuery('SELECT * FROM users WHERE id = $1', [payload.id]);
    return NextResponse.json(safeUser(rows[0]));
  } catch {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }
}
