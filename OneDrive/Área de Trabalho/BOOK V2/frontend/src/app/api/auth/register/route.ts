import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pgQuery } from '@/lib/pgClient';
import { signToken } from '@/lib/jwt';

function safeUser(u: any) {
  const { password_hash, ...rest } = u;
  return rest;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, username } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });

    if (username) {
      if (!/^@[a-zA-Z0-9._-]+$/.test(username))
        return NextResponse.json({ error: 'Username inválido.' }, { status: 400 });
    }

    const { rows: existing } = await pgQuery('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.length > 0)
      return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });

    const hash = bcrypt.hashSync(password, 10);
    const sessionId = crypto.randomUUID();

    const { rows } = await pgQuery(
      `INSERT INTO users (session_id, email, username, name, password_hash, subscription_tier, is_admin)
       VALUES ($1,$2,$3,$4,$5,'basic',false) RETURNING *`,
      [sessionId, email.toLowerCase(), username || null, name, hash]
    );

    const user = rows[0];
    const token = signToken({ id: user.id, email: user.email, is_admin: user.is_admin });
    return NextResponse.json({ message: 'Conta criada com sucesso!', token, user: safeUser(user) }, { status: 201 });
  } catch (err: any) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
