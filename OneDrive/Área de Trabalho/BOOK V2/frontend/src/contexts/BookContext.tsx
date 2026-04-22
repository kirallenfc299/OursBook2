'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { BookService } from '@/lib/books';
import { UserBooksAPI, type UserBookRow } from '@/lib/api';
import type { Book } from '@/types';
import { getAuthorPreferences } from '@/app/setup/page';

interface BookContextType {
  // Supabase library
  featuredBooks: Book[];
  recentBooks: Book[];
  popularBooks: Book[];
  preferredAuthorBooks: Book[];
  isLoadingBooks: boolean;

  // User lists (DB)
  favorites: Book[];
  readingList: Book[];
  currentlyReading: Book[];

  addToFavorites: (book: Book) => Promise<void>;
  removeFromFavorites: (bookId: string) => Promise<void>;
  isFavorite: (bookId: string) => boolean;

  addToReadingList: (book: Book) => Promise<void>;
  removeFromReadingList: (bookId: string) => Promise<void>;
  isInReadingList: (bookId: string) => boolean;

  startReading: (book: Book) => Promise<void>;
  stopReading: (bookId: string) => Promise<void>;
  isCurrentlyReading: (bookId: string) => boolean;

  refreshBooks: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

// Cache of book objects by id (populated from Supabase)
const bookCache = new Map<string, Book>();

export function BookProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useUser();

  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [preferredAuthorBooks, setPreferredAuthorBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  // IDs stored in DB, resolved to Book objects via cache
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [readingListIds, setReadingListIds] = useState<string[]>([]);
  const [currentlyReadingIds, setCurrentlyReadingIds] = useState<string[]>([]);

  // Load books from Supabase on mount
  useEffect(() => {
    refreshBooks();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Load user lists from DB when user changes
  useEffect(() => {
    if (isLoggedIn && user) {
      loadUserLists();
    } else {
      setFavoriteIds([]);
      setReadingListIds([]);
      setCurrentlyReadingIds([]);
    }
  }, [isLoggedIn, user?.id]);

  const refreshBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const [featured, recent, popular] = await Promise.all([
        BookService.getFeaturedBooks(5),
        BookService.getRecentBooks(10),
        BookService.getPopularBooks(10),
      ]);
      [...featured, ...recent, ...popular].forEach(b => bookCache.set(b.id, b));
      setFeaturedBooks(featured);
      setRecentBooks(recent);
      setPopularBooks(popular);

      // Filter books by preferred authors
      const authorPrefs = getAuthorPreferences();
      if (authorPrefs.length > 0) {
        // Get author names from preferences (handle custom authors)
        const POPULAR_AUTHORS = [
          { id: 'machado', name: 'Machado de Assis' },
          { id: 'clarice', name: 'Clarice Lispector' },
          { id: 'jorge', name: 'Jorge Amado' },
          { id: 'tolkien', name: 'J.R.R. Tolkien' },
          { id: 'rowling', name: 'J.K. Rowling' },
          { id: 'martin', name: 'George R.R. Martin' },
          { id: 'asimov', name: 'Isaac Asimov' },
          { id: 'dick', name: 'Philip K. Dick' },
          { id: 'herbert', name: 'Frank Herbert' },
          { id: 'christie', name: 'Agatha Christie' },
          { id: 'conan', name: 'Arthur Conan Doyle' },
          { id: 'king', name: 'Stephen King' },
          { id: 'dostoevsky', name: 'Fiódor Dostoiévski' },
          { id: 'tolstoy', name: 'Liev Tolstói' },
          { id: 'kafka', name: 'Franz Kafka' },
          { id: 'orwell', name: 'George Orwell' },
          { id: 'huxley', name: 'Aldous Huxley' },
          { id: 'coelho', name: 'Paulo Coelho' },
          { id: 'yuval', name: 'Yuval Noah Harari' },
          { id: 'sagan', name: 'Carl Sagan' },
          { id: 'hawking', name: 'Stephen Hawking' },
          { id: 'gaiman', name: 'Neil Gaiman' },
          { id: 'pratchett', name: 'Terry Pratchett' },
          { id: 'sanderson', name: 'Brandon Sanderson' },
        ];

        const authorNames = authorPrefs
          .map(id => POPULAR_AUTHORS.find(a => a.id === id)?.name || id.replace('custom-', ''))
          .filter(Boolean);

        // Filter all books by preferred authors
        const allBooks = [...featured, ...recent, ...popular];
        const filtered = allBooks.filter(book => 
          authorNames.some(authorName => 
            book.author.toLowerCase().includes(authorName.toLowerCase())
          )
        );
        setPreferredAuthorBooks(filtered);
      } else {
        setPreferredAuthorBooks([]);
      }
    } catch (err) {
      // Supabase unavailable — platform still works, just no books yet
      console.warn('Supabase unavailable, books will be empty:', err);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const loadUserLists = async () => {
    try {
      const rows = await UserBooksAPI.list();
      setFavoriteIds(rows.filter(r => r.list_type === 'favorites').map(r => r.book_id));
      setReadingListIds(rows.filter(r => r.list_type === 'reading_list').map(r => r.book_id));
      setCurrentlyReadingIds(rows.filter(r => r.list_type === 'currently_reading').map(r => r.book_id));
    } catch (err) {
      console.error('Error loading user lists:', err);
    }
  };

  // Resolve IDs to Book objects (from cache or Supabase)
  const resolveBooks = async (ids: string[]): Promise<Book[]> => {
    const books: Book[] = [];
    for (const id of ids) {
      if (bookCache.has(id)) {
        books.push(bookCache.get(id)!);
      } else {
        const b = await BookService.getBookById(id);
        if (b) { bookCache.set(id, b); books.push(b); }
      }
    }
    return books;
  };

  // Derived book arrays
  const favorites = favoriteIds.map(id => bookCache.get(id)).filter(Boolean) as Book[];
  const readingList = readingListIds.map(id => bookCache.get(id)).filter(Boolean) as Book[];
  const currentlyReading = currentlyReadingIds.map(id => bookCache.get(id)).filter(Boolean) as Book[];

  // ─── Favorites ───────────────────────────────────────────────────────────────
  const addToFavorites = async (book: Book) => {
    bookCache.set(book.id, book);
    setFavoriteIds(prev => [...new Set([...prev, book.id])]);
    await UserBooksAPI.add(book.id, 'favorites').catch(console.error);
  };

  const removeFromFavorites = async (bookId: string) => {
    setFavoriteIds(prev => prev.filter(id => id !== bookId));
    await UserBooksAPI.remove(bookId, 'favorites').catch(console.error);
  };

  const isFavorite = (bookId: string) => favoriteIds.includes(bookId);

  // ─── Reading List ─────────────────────────────────────────────────────────────
  const addToReadingList = async (book: Book) => {
    bookCache.set(book.id, book);
    setReadingListIds(prev => [...new Set([...prev, book.id])]);
    await UserBooksAPI.add(book.id, 'reading_list').catch(console.error);
  };

  const removeFromReadingList = async (bookId: string) => {
    setReadingListIds(prev => prev.filter(id => id !== bookId));
    await UserBooksAPI.remove(bookId, 'reading_list').catch(console.error);
  };

  const isInReadingList = (bookId: string) => readingListIds.includes(bookId);

  // ─── Currently Reading ────────────────────────────────────────────────────────
  const startReading = async (book: Book) => {
    bookCache.set(book.id, book);
    setCurrentlyReadingIds(prev => [...new Set([...prev, book.id])]);
    await UserBooksAPI.add(book.id, 'currently_reading').catch(console.error);
  };

  const stopReading = async (bookId: string) => {
    setCurrentlyReadingIds(prev => prev.filter(id => id !== bookId));
    await UserBooksAPI.remove(bookId, 'currently_reading').catch(console.error);
  };

  const isCurrentlyReading = (bookId: string) => currentlyReadingIds.includes(bookId);

  return (
    <BookContext.Provider value={{
      featuredBooks, recentBooks, popularBooks, preferredAuthorBooks, isLoadingBooks,
      favorites, readingList, currentlyReading,
      addToFavorites, removeFromFavorites, isFavorite,
      addToReadingList, removeFromReadingList, isInReadingList,
      startReading, stopReading, isCurrentlyReading,
      refreshBooks,
    }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) throw new Error('useBooks must be used within a BookProvider');
  return context;
}
