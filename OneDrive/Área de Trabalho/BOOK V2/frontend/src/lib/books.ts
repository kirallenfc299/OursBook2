// Books are stored as metadata in local SQLite DB
// Files (PDF, EPUB, covers) are stored in Supabase S3 Storage

import { uploadBookFile, uploadBookCover, getPublicUrl } from './storage';
import type { Book } from '@/types';

export interface BookSearchResult {
  title: string;
  authors: string[];
  description?: string;
  publishedDate?: string;
  categories?: string[];
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  industryIdentifiers?: Array<{ type: string; identifier: string }>;
  pageCount?: number;
  language?: string;
  publisher?: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data as T;
}

// ─── Book Service ─────────────────────────────────────────────────────────────

export class BookService {
  static async getBooks(page = 1, limit = 20): Promise<{ books: Book[]; total: number }> {
    return apiFetch(`/books?page=${page}&limit=${limit}`);
  }

  static async getFeaturedBooks(limit = 5): Promise<Book[]> {
    return apiFetch(`/books?featured=true&limit=${limit}`).then((r: any) => r.books || []);
  }

  static async getRecentBooks(limit = 10): Promise<Book[]> {
    return apiFetch(`/books?sort=recent&limit=${limit}`).then((r: any) => r.books || []);
  }

  static async getPopularBooks(limit = 10): Promise<Book[]> {
    return apiFetch(`/books?sort=popular&limit=${limit}`).then((r: any) => r.books || []);
  }

  static async getBookById(id: string): Promise<Book | null> {
    try {
      return await apiFetch(`/books/${id}`);
    } catch {
      return null;
    }
  }

  static async searchBooks(query: string, limit = 20): Promise<Book[]> {
    return apiFetch(`/books/search?q=${encodeURIComponent(query)}&limit=${limit}`).then((r: any) => r.books || []);
  }

  // Search Google Books API with enhanced metadata and retry logic
  static async searchGoogleBooks(
    query: string, 
    searchType: 'title' | 'author' = 'title',
    retries = 3
  ): Promise<BookSearchResult[]> {
    // Remove API key - use without key to avoid 403 errors
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const q = searchType === 'author' ? `inauthor:${query}` : `intitle:${query}`;
        // Use without API key - public access
        // Reduce maxResults to 20 to avoid rate limiting
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`;
        
        const res = await fetch(url);
        
        // Handle rate limiting with exponential backoff
        if (res.status === 429 || res.status === 403) {
          const waitTime = Math.pow(2, attempt + 2) * 1000; // 4s, 8s, 16s
          console.warn(`API rate limit (${res.status}), waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        if (!res.ok) {
          throw new Error(`Google Books API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        const results = (data.items || []).map((item: any) => {
          const volumeInfo = item.volumeInfo;
          
          // Get highest quality cover image
          let thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
          if (thumbnail) {
            // Replace with higher resolution version
            thumbnail = thumbnail
              .replace('http:', 'https:')
              .replace('&edge=curl', '')
              .replace('zoom=1', 'zoom=2'); // Higher zoom for better quality
          }
          
          return {
            title: volumeInfo.title,
            authors: volumeInfo.authors || [],
            description: volumeInfo.description,
            publishedDate: volumeInfo.publishedDate,
            categories: volumeInfo.categories,
            imageLinks: { 
              thumbnail,
              smallThumbnail: volumeInfo.imageLinks?.smallThumbnail 
            },
            industryIdentifiers: volumeInfo.industryIdentifiers,
            pageCount: volumeInfo.pageCount,
            language: volumeInfo.language,
            publisher: volumeInfo.publisher,
          };
        });
        
        return results;
      } catch (err) {
        console.error(`Google Books search error (attempt ${attempt + 1}/${retries}):`, err);
        
        // If last attempt, try fallback to Open Library
        if (attempt === retries - 1) {
          console.log('Trying fallback to Open Library API...');
          return await this.searchOpenLibrary(query, searchType);
        }
        
        // Wait before retry with exponential backoff
        const waitTime = Math.pow(2, attempt + 2) * 1000; // 4s, 8s, 16s
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    return [];
  }

  // Fallback: Search Open Library API (NO RATE LIMITS - use as primary!)
  static async searchOpenLibrary(query: string, searchType: 'title' | 'author' = 'title'): Promise<BookSearchResult[]> {
    try {
      const searchParam = searchType === 'author' ? 'author' : 'title';
      // Increased limit to 100 for bulk imports
      const url = `https://openlibrary.org/search.json?${searchParam}=${encodeURIComponent(query)}&limit=100`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Open Library API error');
      
      const data = await res.json();
      
      return (data.docs || []).map((doc: any) => ({
        title: doc.title,
        authors: doc.author_name || [],
        description: doc.first_sentence?.join(' '),
        publishedDate: doc.first_publish_year?.toString(),
        categories: doc.subject?.slice(0, 3) || [],
        imageLinks: doc.cover_i ? {
          thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
          smallThumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        } : undefined,
        industryIdentifiers: doc.isbn ? [
          { type: 'ISBN_13', identifier: doc.isbn[0] }
        ] : undefined,
        pageCount: doc.number_of_pages_median,
        language: doc.language?.[0] || 'pt',
        publisher: doc.publisher?.[0],
      }));
    } catch (err) {
      console.error('Open Library search error:', err);
      return [];
    }
  }

  // Enhanced metadata from Open Library (similar to MusicBrainz for music)
  static async getOpenLibraryMetadata(isbn?: string, title?: string, author?: string): Promise<{
    description?: string;
    subjects?: string[];
    coverUrl?: string;
    publishDate?: string;
  } | null> {
    try {
      let url = '';
      
      // Try ISBN first (most accurate)
      if (isbn) {
        url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
      } else if (title && author) {
        // Fallback to title + author search
        const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData.docs && searchData.docs.length > 0) {
          const doc = searchData.docs[0];
          const key = doc.key;
          url = `https://openlibrary.org${key}.json`;
        }
      }
      
      if (!url) return null;
      
      const res = await fetch(url);
      if (!res.ok) return null;
      
      const data = await res.json();
      
      // Parse response based on API type
      let metadata: any = {};
      
      if (isbn && data[`ISBN:${isbn}`]) {
        const bookData = data[`ISBN:${isbn}`];
        metadata = {
          description: bookData.notes || bookData.description,
          subjects: bookData.subjects?.map((s: any) => s.name || s) || [],
          coverUrl: bookData.cover?.large || bookData.cover?.medium,
          publishDate: bookData.publish_date,
        };
      } else if (data.description) {
        metadata = {
          description: typeof data.description === 'string' ? data.description : data.description?.value,
          subjects: data.subjects || [],
          publishDate: data.publish_date,
        };
      }
      
      return metadata;
    } catch (err) {
      console.error('Open Library API error:', err);
      return null;
    }
  }

  // Create book — uploads files to S3, saves metadata to local DB
  static async createBookFromSearch(
    searchResult: BookSearchResult,
    files?: { bookFile?: File; coverFile?: File }
  ): Promise<{ success: boolean; message: string; book?: Book }> {
    try {
      const bookId = crypto.randomUUID();

      // Get ISBN for enhanced metadata lookup
      const isbn = searchResult.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier ||
                   searchResult.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier;

      // Try to get enhanced metadata from Open Library
      const openLibData = await this.getOpenLibraryMetadata(
        isbn,
        searchResult.title,
        searchResult.authors[0]
      );

      let fileUrl = '';
      let fileFormat = 'pdf';
      let fileSize: number | undefined;
      
      // Use enhanced cover from Open Library if available, otherwise use Google Books
      let coverImageUrl = openLibData?.coverUrl || 
                         searchResult.imageLinks?.thumbnail?.replace('http:', 'https:') || '';

      // Upload book file to S3
      if (files?.bookFile) {
        const result = await uploadBookFile(files.bookFile, bookId);
        fileUrl = result.url;
        fileFormat = files.bookFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        fileSize = files.bookFile.size;
      }

      // Upload cover to S3 (overrides any API cover)
      if (files?.coverFile) {
        const result = await uploadBookCover(files.coverFile, bookId);
        coverImageUrl = result.url;
      } else if (coverImageUrl) {
        // Download and upload cover from API to our storage
        try {
          const coverRes = await fetch(coverImageUrl);
          if (coverRes.ok) {
            const coverBlob = await coverRes.blob();
            const coverFile = new File([coverBlob], `${bookId}-cover.jpg`, { type: 'image/jpeg' });
            const result = await uploadBookCover(coverFile, bookId);
            coverImageUrl = result.url;
          }
        } catch (err) {
          console.warn('Failed to download/upload cover:', err);
          // Keep original URL if upload fails
        }
      }

      // Combine descriptions (prefer Open Library, fallback to Google Books)
      const description = openLibData?.description || searchResult.description;
      
      // Combine categories/subjects
      const categories = [
        ...(searchResult.categories || []),
        ...(openLibData?.subjects || [])
      ];
      const genre = categories[0] || 'Geral';

      // Use enhanced publish date if available
      const publicationDate = openLibData?.publishDate || searchResult.publishedDate;

      // Save metadata to local DB via API
      const token = typeof window !== 'undefined' ? localStorage.getItem('oursbook_token') : null;
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: bookId,
          title: searchResult.title,
          author: searchResult.authors.join(', '),
          description,
          genre,
          coverImageUrl,
          fileUrl,
          fileFormat,
          fileSize,
          pageCount: searchResult.pageCount,
          isbn,
          language: searchResult.language || 'pt',
          publicationDate,
          publisher: searchResult.publisher,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      return { success: true, message: 'Livro importado com sucesso!', book: data };
    } catch (err: any) {
      console.error('createBookFromSearch error:', err);
      return { success: false, message: err.message || 'Erro ao importar livro.' };
    }
  }

  static async deleteBook(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('oursbook_token') : null;
      await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, message: 'Livro excluído.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}
