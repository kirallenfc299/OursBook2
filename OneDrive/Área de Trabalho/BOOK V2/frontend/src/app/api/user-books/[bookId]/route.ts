import { NextRequest, NextResponse } from 'next/server';
import { pgQuery } from '@/lib/pgClient';
import { verifyToken } from '@/lib/jwt';

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return verifyToken(auth.slice(7)); } catch { return null; }
}

export async function DELETE(req: NextRequest, { params }: { params: { bookId: string } }) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const listType = req.nextUrl.searchParams.get('list_type');
  const qParams: any[] = [user.id, params.bookId];
  let q = 'DELETE FROM user_books WHERE user_id = $1 AND book_id = $2';
  if (listType) { q += ' AND list_type = $3'; qParams.push(listType); }

  await pgQuery(q, qParams);
  return NextResponse.json({ message: 'Removido.' });
}
