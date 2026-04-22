import { Book } from '@/types';

// Empty data structure - TO BE REPLACED WITH REAL API DATA
export const mockBooks: Book[] = [];

export function getBooksByCategory(category: string): Book[] {
  return [];
}

export function getRecentBooks(limit: number = 8): Book[] {
  return [];
}

export function getPopularBooks(limit: number = 8): Book[] {
  return [];
}

export function getFeaturedBooks(limit: number = 5): Book[] {
  return [];
}