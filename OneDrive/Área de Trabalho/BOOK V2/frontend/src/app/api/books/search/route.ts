import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Book } from '@/types';

function mapRow(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    genre: row.genre || 'Geral',
    coverImageUrl: row.cover_image_url,
    fileUrl: row.file_url || '',
    fileFormat: row.file_format || 'pdf',
    fileSize: row.file_size,
    pageCount: row.page_count,
    isbn: row.isbn,
    language: row.language || 'pt',
    publicationDate: row.publication_date ? new Date(row.publication_date) : undefined,
    publisher: row.publisher,
    rating: row.rating || 0,
    downloadCount: row.download_count || 0,
    viewCount: row.view_count || 0,
    isFeatured: row.is_featured === 1,
    metadataComplete: true,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// GET /api/books/search?q=query&limit=20
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 100);

  if (!q.trim()) return NextResponse.json({ books: [] });

  const db = getDb();
  const pattern = `%${q}%`;
  const rows = db.prepare(`
    SELECT * FROM books
    WHERE title LIKE ? OR author LIKE ? OR description LIKE ?
    ORDER BY view_count DESC
    LIMIT ?
  `).all(pattern, pattern, pattern, limit);

  return NextResponse.json({ books: rows.map(mapRow) });
}
