'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Book } from '@/types';
import { Button } from '@/components/ui/Button';
import { useBooks } from '@/contexts/BookContext';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  isExpanded?: boolean;
  onExpand?: (bookId: string) => void;
  onCollapse?: () => void;
  position?: 'left' | 'center' | 'right';
  className?: string;
  showExpandedContent?: boolean;
}

export function BookCard({ 
  book, 
  isExpanded = false, 
  onExpand, 
  onCollapse,
  position = 'center',
  className,
  showExpandedContent = true
}: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const { 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite,
    addToReadingList,
    removeFromReadingList,
    isInReadingList,
    startReading
  } = useBooks();

  const handleMouseEnter = () => {
    if (onExpand && showExpandedContent) {
      onExpand(book.id);
    }
  };

  const handleMouseLeave = () => {
    if (onCollapse && showExpandedContent) {
      onCollapse();
    }
  };

  const handleReadNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    startReading(book);
    router.push(`/reader/${book.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(book.id)) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book);
    }
  };

  const handleToggleReadingList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInReadingList(book.id)) {
      removeFromReadingList(book.id);
    } else {
      addToReadingList(book);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/books/${book.id}`);
  };

  const getExpandedPosition = () => {
    switch (position) {
      case 'left': return 'origin-left';
      case 'right': return 'origin-right';
      default: return 'origin-center';
    }
  };

  const publicationYear = book.publicationDate
    ? new Date(book.publicationDate).getFullYear()
    : null;

  return (
    <div
      className={cn(
        'featured-card group relative cursor-pointer transition-all duration-300',
        isExpanded && showExpandedContent && 'expanded z-expanded-card',
        getExpandedPosition(),
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="book-card"
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-oursbook bg-theme-medium-gray">
        {!imageError && book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={`Capa do livro ${book.title}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 300px, (max-width: 1200px) 400px, 500px"
            quality={90}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-theme-medium-gray to-theme-dark-gray">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">📚</div>
              <p className="text-xs text-theme-light-gray font-medium line-clamp-2">
                {book.title}
              </p>
            </div>
          </div>
        )}

        {/* Rating Badge */}
        {book.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            ⭐ {book.rating.toFixed(1)}
          </div>
        )}

        {/* Featured Badge */}
        {book.isFeatured && (
          <div className="absolute top-2 left-2 bg-theme-secondary text-white text-xs px-2 py-1 rounded">
            Destaque
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && showExpandedContent && (
        <div
          className="card-content absolute top-full left-0 right-0 bg-theme-dark-gray rounded-b-oursbook shadow-expanded p-4 border border-theme-medium-gray border-t-0"
          style={{ zIndex: 30 }}
        >
          <div className="space-y-3">
            {/* Title and Author */}
            <div>
              <h3 className="font-bold text-base line-clamp-2 text-white mb-1">
                {book.title}
              </h3>
              <p className="text-theme-light-gray text-sm">por {book.author}</p>
            </div>

            {/* Rating */}
            {book.rating > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3" fill={i < Math.floor(book.rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-theme-light-gray">{book.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Description */}
            {book.description && (
              <p className="text-xs text-theme-light-gray line-clamp-3 leading-relaxed">
                {book.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 text-xs">
              <span className="bg-theme-primary text-white px-2 py-0.5 rounded">{book.genre}</span>
              {book.pageCount && (
                <span className="bg-theme-medium-gray text-theme-light-gray px-2 py-0.5 rounded">
                  {book.pageCount} pág.
                </span>
              )}
              <span className="bg-theme-medium-gray text-theme-light-gray px-2 py-0.5 rounded">
                {book.language.toUpperCase()}
              </span>
              {publicationYear && (
                <span className="bg-theme-medium-gray text-theme-light-gray px-2 py-0.5 rounded">
                  {publicationYear}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <Button variant="primary" size="sm" className="flex-1 text-xs" onClick={handleReadNow}>
                📖 Ler
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`px-2 text-xs ${isFavorite(book.id) ? 'bg-theme-secondary text-white' : ''}`}
                title={isFavorite(book.id) ? 'Remover dos Favoritos' : 'Favoritar'}
                onClick={handleToggleFavorite}
              >
                {isFavorite(book.id) ? '💖' : '🤍'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`px-2 text-xs ${isInReadingList(book.id) ? 'bg-theme-secondary text-white' : ''}`}
                title={isInReadingList(book.id) ? 'Remover da Lista' : 'Adicionar à Lista'}
                onClick={handleToggleReadingList}
              >
                {isInReadingList(book.id) ? '📚' : '➕'}
              </Button>
              <Button variant="secondary" size="sm" className="px-2 text-xs" onClick={handleViewDetails}>
                ℹ️
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs text-theme-light-gray pt-2 border-t border-theme-medium-gray">
              <span>👁 {book.viewCount.toLocaleString()}</span>
              <span>⬇ {book.downloadCount.toLocaleString()}</span>
              {book.fileSize && <span>{(book.fileSize / (1024 * 1024)).toFixed(1)} MB</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
