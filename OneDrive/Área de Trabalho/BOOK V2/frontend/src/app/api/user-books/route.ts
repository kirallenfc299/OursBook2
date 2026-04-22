import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { pgQuery } from '@/lib/pgClient';
import { verifyToken } from '@/lib/jwt';

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return verifyToken(auth.slice(7)); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const listType = req.nextUrl.searchParams.get('list_type');
  const params: any[] = [user.id];
  let q = 'SELECT * FROM user_books WHERE user_id = $1';
  if (listType) { q += ' AND list_type = $2'; params.push(listType); }
  q += ' ORDER BY created_at DESC';

  const { rows } = await pgQuery(q, params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { book_id, list_type, progress } = await req.json();
  const valid = ['favorites', 'reading_list', 'currently_reading', 'completed'];
  if (!book_id || !valid.includes(list_type))
    return NextResponse.json({ error: 'book_id e list_type válido são obrigatórios.' }, { status: 400 });

  await pgQuery(
    `INSERT INTO user_books (id, user_id, book_id, list_type, progress)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id, book_id, list_type) DO UPDATE SET progress = EXCLUDED.progress`,
    [crypto.randomUUID(), user.id, book_id, list_type, progress ?? 0]
  );

  const { rows } = await pgQuery(
    'SELECT * FROM user_books WHERE user_id=$1 AND book_id=$2 AND list_type=$3',
    [user.id, book_id, list_type]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
