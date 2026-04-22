import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pgQuery } from '@/lib/pgClient';
import { signToken } from '@/lib/jwt';

function safeUser(u: any) {
  const { password_hash, ...rest } = u;
  return rest;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });

    const { rows } = await pgQuery('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];

    if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash))
      return NextResponse.json({ error: 'Email ou senha incorretos.' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, is_admin: user.is_admin });
    return NextResponse.json({ message: `Bem-vindo, ${user.name}!`, token, user: safeUser(user) });
  } catch (err: any) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
