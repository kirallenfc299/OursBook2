import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  const { rows } = await pgQuery('SELECT * FROM users WHERE id = $1', [params.id]);
  if (!rows[0]) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  return NextResponse.json(safeUser(rows[0]));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

  const { name, email, subscription_tier, is_admin, newPassword } = await req.json();

  if (newPassword) {
    if (newPassword.length < 6)
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    const hash = bcrypt.hashSync(newPassword, 10);
    await pgQuery('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, params.id]);
  }

  await pgQuery(
    `UPDATE users SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      is_admin = COALESCE($3, is_admin)
     WHERE id = $4`,
    [name ?? null, email?.toLowerCase() ?? null, is_admin !== undefined ? is_admin : null, params.id]
  );

  const { rows } = await pgQuery('SELECT * FROM users WHERE id = $1', [params.id]);
  return NextResponse.json(safeUser(rows[0]));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  if (String(params.id) === String(admin.id))
    return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 });

  await pgQuery('DELETE FROM users WHERE id = $1', [params.id]);
  return NextResponse.json({ message: 'Usuário excluído com sucesso.' });
}
