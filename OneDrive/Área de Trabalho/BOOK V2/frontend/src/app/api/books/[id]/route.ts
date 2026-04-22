import { NextRequest, NextResponse } from 'next/server';
import { pgQuery } from '@/lib/pgClient';
import { verifyToken } from '@/lib/jwt';
import type { Book } from '@/types';

function mapRow(row: any): Book {
  return {
    id: String(row.id),
    title: row.title,
    author: row.author,
    description: row.description,
    genre: row.genre || 'Geral',
    coverImageUrl: row.cover_url || row.cover_image_url || null,
    fileUrl: row.read_url || row.file_url || '',
    fileFormat: row.file_format || 'pdf',
    fileSize: row.file_size || null,
    pageCount: row.total_pages || row.page_count || null,
    isbn: row.isbn || null,
    language: row.language || 'pt',
    publicationDate: row.published_year ? new Date(`${row.published_year}-01-01`) : undefined,
    publisher: row.publisher || null,
    rating: row.rating || 0,
    downloadCount: row.download_count || 0,
    viewCount: row.view_count || 0,
    isFeatured: row.is_featured === true || row.is_featured === 1,
    metadataComplete: true,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at || row.created_at),
  };
}

// GET /api/books/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { rows } = await pgQuery('SELECT * FROM books WHERE id = $1', [params.id]);
    if (!rows[0]) return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });
    return NextResponse.json(mapRow(rows[0]));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/books/:id — admin only
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  try {
    const payload = verifyToken(auth.slice(7));
    if (!payload.is_admin)
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await pgQuery(
      `UPDATE books SET
        title = COALESCE($1, title),
        author = COALESCE($2, author),
        description = COALESCE($3, description),
        cover_url = COALESCE($4, cover_url),
        is_featured = COALESCE($5, is_featured)
       WHERE id = $6`,
      [
        body.title ?? null,
        body.author ?? null,
        body.description ?? null,
        body.coverImageUrl ?? null,
        body.isFeatured !== undefined ? body.isFeatured : null,
        params.id,
      ]
    );
    const { rows } = await pgQuery('SELECT * FROM books WHERE id = $1', [params.id]);
    if (!rows[0]) return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });
    return NextResponse.json(mapRow(rows[0]));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/books/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  try {
    const payload = verifyToken(auth.slice(7));
    if (!payload.is_admin)
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }

  try {
    await pgQuery('DELETE FROM books WHERE id = $1', [params.id]);
    return NextResponse.json({ message: 'Livro excluído.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
