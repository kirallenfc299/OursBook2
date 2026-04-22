'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Book } from '@/types';
import { BookCard } from './BookCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface BookCarouselProps {
  title: string;
  books: Book[];
  category?: string;
  showArrows?: boolean;
  expandOnHover?: boolean;
  className?: string;
}

export function BookCarousel({ 
  title, 
  books, 
  category,
  showArrows = true, 
  expandOnHover = true,
  className 
}: BookCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(6);
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const itemWidth = 200; // Base width for mobile
  const gap = 12; // Gap between items

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) { // sm
        setItemsPerView(2);
      } else if (width < 768) { // md
        setItemsPerView(3);
      } else if (width < 1024) { // lg
        setItemsPerView(4);
      } else if (width < 1280) { // xl
        setItemsPerView(5);
      } else { // 2xl
        setItemsPerView(6);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    updateScrollButtons();
  }, [currentIndex, books.length, itemsPerView]);

  const updateScrollButtons = () => {
    setCanScrollLeft(currentIndex > 0);
    setCanScrollRight(currentIndex < Math.max(0, books.length - itemsPerView));
  };

  const scrollToIndex = (index: number) => {
    const maxIndex = Math.max(0, books.length - itemsPerView);
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
    
    if (trackRef.current) {
      const scrollAmount = newIndex * (itemWidth + gap);
      trackRef.current.style.transform = `translateX(-${scrollAmount}px)`;
    }
  };

  const scrollLeft = () => {
    scrollToIndex(currentIndex - itemsPerView);
  };

  const scrollRight = () => {
    scrollToIndex(currentIndex + itemsPerView);
  };

  const handleCardExpand = (bookId: string) => {
    if (expandOnHover) {
      setExpandedCard(bookId);
    }
  };

  const handleCardCollapse = () => {
    if (expandOnHover) {
      setExpandedCard(null);
    }
  };

  const getCardPosition = (index: number): 'left' | 'center' | 'right' => {
    const visibleStart = currentIndex;
    const visibleEnd = currentIndex + itemsPerView - 1;
    
    if (index <= visibleStart + 1) return 'left';
    if (index >= visibleEnd - 1) return 'right';
    return 'center';
  };

  if (!books || books.length === 0) {
    return (
      <div className={cn('carousel-spacing', className)}>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 px-4 sm:px-6 lg:px-8">{title}</h2>
        <div className="text-theme-light-gray text-center py-8">
          Nenhum livro encontrado nesta categoria.
        </div>
      </div>
    );
  }

  return (
    <div className={cn('carousel-spacing', className)} data-testid="book-carousel">
      {/* Carousel Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        {category && (
          <Button variant="ghost" size="sm" className="hidden sm:block">
            Ver Todos
          </Button>
        )}
      </div>

      {/* Carousel Container */}
      <div className="carousel-container relative px-4 sm:px-6 lg:px-8" ref={carouselRef}>
        {/* Left Arrow */}
        {showArrows && canScrollLeft && (
          <button
            className="carousel-arrow carousel-arrow-left opacity-0 hover:scale-110 hidden sm:block"
            onClick={scrollLeft}
            aria-label="Scroll para a esquerda"
            data-testid="carousel-left"
          >
            <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {showArrows && canScrollRight && (
          <button
            className="carousel-arrow carousel-arrow-right opacity-0 hover:scale-110 hidden sm:block"
            onClick={scrollRight}
            aria-label="Scroll para a direita"
            data-testid="carousel-right"
          >
            <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Carousel Track */}
        <div className="overflow-hidden group">
          <div
            ref={trackRef}
            className="carousel-track"
            style={{
              width: `${books.length * (itemWidth + gap)}px`,
              gap: `${gap}px`
            }}
            data-testid="carousel-container"
          >
            {books.map((book, index) => (
              <div
                key={book.id}
                className="flex-shrink-0 stagger-item"
                style={{ 
                  width: `${itemWidth}px`,
                  animationDelay: `${index * 50}ms`
                }}
              >
                <BookCard
                  book={book}
                  isExpanded={expandedCard === book.id}
                  onExpand={handleCardExpand}
                  onCollapse={handleCardCollapse}
                  position={getCardPosition(index)}
                  showExpandedContent={expandOnHover}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Indicators - Moved outside and below carousel */}
      {books.length > itemsPerView && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(books.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200 hover:scale-125',
                Math.floor(currentIndex / itemsPerView) === index
                  ? 'bg-theme-primary'
                  : 'bg-theme-medium-gray hover:bg-theme-light-gray'
              )}
              onClick={() => scrollToIndex(index * itemsPerView)}
              aria-label={`Ir para página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}