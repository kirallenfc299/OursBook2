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

// GET /api/books?sort=recent|popular&featured=true&limit=10&page=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const sort = searchParams.get('sort') || 'recent';
    const featured = searchParams.get('featured') === 'true';

    const conditions: string[] = [];
    const params: any[] = [];

    if (featured) {
      params.push(true);
      conditions.push(`is_featured = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = sort === 'popular' ? 'rating DESC' : 'created_at DESC';

    const countRes = await pgQuery(`SELECT COUNT(*) as c FROM books ${where}`, params);
    const total = parseInt(countRes.rows[0].c);

    params.push(limit, (page - 1) * limit);
    const dataRes = await pgQuery(
      `SELECT * FROM books ${where} ORDER BY ${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({ books: dataRes.rows.map(mapRow), total });
  } catch (err: any) {
    console.error('[GET /api/books]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/books — admin only
export async function POST(req: NextRequest) {
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
    const { rows } = await pgQuery(
      `INSERT INTO books (title, author, description, cover_url, read_url, total_pages, language, rating, is_featured, published_year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,0,false,$8) RETURNING *`,
      [
        body.title, body.author, body.description || null,
        body.coverImageUrl || null, body.fileUrl || null,
        body.pageCount || null, body.language || 'pt',
        body.publicationDate ? new Date(body.publicationDate).getFullYear() : null,
      ]
    );
    return NextResponse.json(mapRow(rows[0]), { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/books]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
