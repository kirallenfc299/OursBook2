'use client';

import { useUser } from '@/contexts/UserContext';
import { useBooks } from '@/contexts/BookContext';
import { useCustomNavigation } from '@/hooks/useCustomNavigation';
import { useEffect } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { BookCarousel } from '@/components/books/BookCarousel';
import { PageLayout } from '@/components/layout/PageLayout';

export default function Home() {
  const { isLoggedIn, isLoading } = useUser();
  const { featuredBooks, recentBooks, popularBooks, preferredAuthorBooks } = useBooks();
  const { replace } = useCustomNavigation();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      replace('/landing');
    }
  }, [isLoggedIn, isLoading, replace]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <PageLayout>
      <main className="w-full">
        <HeroSection featuredBooks={featuredBooks} />
        <div className="space-y-8 md:space-y-12 pb-16 md:pb-20">
          {preferredAuthorBooks.length > 0 && (
            <BookCarousel
              title="📚 Seus Autores Favoritos"
              books={preferredAuthorBooks}
              category="preferred"
            />
          )}
          <BookCarousel
            title="Adicionados Recentemente"
            books={recentBooks}
            category="recent"
          />
          <BookCarousel
            title="Mais Populares"
            books={popularBooks}
            category="popular"
          />
          <BookCarousel
            title="Destaques"
            books={featuredBooks}
            category="featured"
          />
        </div>
      </main>
    </PageLayout>
  );
}
