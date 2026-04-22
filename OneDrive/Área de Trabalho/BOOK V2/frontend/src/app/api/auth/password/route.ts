import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pgQuery } from '@/lib/pgClient';
import { verifyToken } from '@/lib/jwt';

export async function PUT(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer '))
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const payload = verifyToken(auth.slice(7));
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias.' }, { status: 400 });
    if (newPassword.length < 6)
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });

    const { rows } = await pgQuery('SELECT password_hash FROM users WHERE id = $1', [payload.id]);
    if (!rows[0] || !bcrypt.compareSync(currentPassword, rows[0].password_hash))
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 });

    const hash = bcrypt.hashSync(newPassword, 10);
    await pgQuery('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, payload.id]);

    return NextResponse.json({ message: 'Senha alterada com sucesso!' });
  } catch {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }
}
