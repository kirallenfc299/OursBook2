'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  featuredBooks?: any[];
  className?: string;
}

const MAX_HERO_BOOKS = 10;

export function HeroSection({ featuredBooks = [], className }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isLoggedIn, isAdmin } = useUser();

  // Limit to 10 books
  const books = featuredBooks.slice(0, MAX_HERO_BOOKS);
  const currentBook = books[currentIndex];

  const goTo = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, isTransitioning]);

  const goPrev = useCallback(() => {
    const prev = (currentIndex - 1 + books.length) % books.length;
    setIsAutoPlaying(false);
    goTo(prev);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [currentIndex, books.length, goTo]);

  const goNext = useCallback(() => {
    const next = (currentIndex + 1) % books.length;
    setIsAutoPlaying(false);
    goTo(next);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [currentIndex, books.length, goTo]);

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    goTo(index);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying || books.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, books.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  if (!books || books.length === 0) {
    return null;
  }

  if (!currentBook) return null;

  return (
    <section
      className={cn('relative h-screen overflow-hidden select-none', className)}
      aria-label="Livros em destaque"
    >
      {/* Background with transition */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-500',
          isTransitioning ? 'opacity-0' : 'opacity-100'
        )}
      >
        {currentBook.coverImageUrl ? (
          <Image
            src={currentBook.coverImageUrl}
            alt={`Capa do livro ${currentBook.title}`}
            fill
            className="object-cover scale-105"
            priority
            sizes="100vw"
            quality={90}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-theme-dark-gray via-theme-medium-gray to-black" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'max-w-2xl transition-all duration-500',
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            )}
          >
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="bg-theme-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Destaque
              </span>
              {currentBook.genre && (
                <span className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20">
                  {currentBook.genre}
                </span>
              )}
              {currentBook.rating > 0 && (
                <span className="bg-yellow-500/20 backdrop-blur-sm text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1">
                  ⭐ {currentBook.rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
              {currentBook.title}
            </h1>

            {/* Author */}
            <p className="text-lg sm:text-xl text-theme-light-gray mb-4 font-light">
              por <span className="text-white font-medium">{currentBook.author}</span>
            </p>

            {/* Description */}
            {currentBook.description && (
              <p className="text-sm sm:text-base text-white/70 mb-6 max-w-lg leading-relaxed line-clamp-3">
                {currentBook.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mb-8 text-xs text-white/50">
              {currentBook.pageCount && (
                <span className="flex items-center gap-1">
                  📄 {currentBook.pageCount} páginas
                </span>
              )}
              {currentBook.language && (
                <span className="flex items-center gap-1">
                  🌐 {currentBook.language.toUpperCase()}
                </span>
              )}
              {currentBook.viewCount > 0 && (
                <span className="hidden sm:flex items-center gap-1">
                  👁 {currentBook.viewCount.toLocaleString()} visualizações
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                className="px-8 py-3 text-base font-semibold shadow-lg shadow-theme-primary/30"
                onClick={() => window.location.href = `/reader/${currentBook.id}`}
              >
                ▶ Ler Agora
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="px-6 py-3 text-base backdrop-blur-sm"
              >
                + Minha Lista
              </Button>
              {isLoggedIn && isAdmin && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="px-6 py-3 text-base hidden sm:flex"
                  onClick={() => window.location.href = '/admin'}
                >
                  🔧 Gerenciar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {books.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Livro anterior"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Próximo livro"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Bottom bar: dots + thumbnails */}
      {books.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 pt-16 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Thumbnail strip */}
            <div className="flex items-end justify-end gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {books.map((book, index) => (
                <button
                  key={book.id ?? index}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Ir para ${book.title}`}
                  className={cn(
                    'flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-white/50',
                    index === currentIndex
                      ? 'w-14 h-20 sm:w-16 sm:h-24 border-theme-primary shadow-lg shadow-theme-primary/40 scale-105'
                      : 'w-10 h-14 sm:w-12 sm:h-18 border-transparent opacity-60 hover:opacity-90 hover:border-white/40'
                  )}
                >
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={book.title}
                      width={128}
                      height={192}
                      className="w-full h-full object-cover"
                      quality={85}
                    />
                  ) : (
                    <div className="w-full h-full bg-theme-medium-gray flex items-center justify-center text-lg">
                      📚
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Dots + counter */}
            <div className="flex items-center justify-end mt-3">
              <div className="flex items-center gap-1.5">
                {books.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Livro ${index + 1}`}
                    className={cn(
                      'rounded-full transition-all duration-300 focus:outline-none',
                      index === currentIndex
                        ? 'w-6 h-2 bg-theme-primary'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                    )}
                  />
                ))}
              </div>
              <span className="text-white/40 text-xs tabular-nums">
                {currentIndex + 1} / {books.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-play progress bar */}
      {books.length > 1 && isAutoPlaying && (
        <div className="absolute top-0 left-0 right-0 z-30 h-0.5 bg-white/10">
          <div
            key={currentIndex}
            className="h-full bg-theme-primary origin-left"
            style={{ animation: 'progress 6s linear forwards' }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
