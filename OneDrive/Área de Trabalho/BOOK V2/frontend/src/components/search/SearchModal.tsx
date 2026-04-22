'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Loading } from '@/components/ui';
import { BookCard } from '@/components/books';
import { Book } from '@/types';
import { debounce } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounced search function
  const debouncedSearch = debounce((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // TODO: Replace with real API call
    setTimeout(() => {
      // No books available yet - will be populated when real data is added
      setResults([]);
      setIsLoading(false);
    }, 300);
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('oursbook-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Add to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('oursbook-recent-searches', JSON.stringify(updated));
    
    setQuery(searchQuery);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('oursbook-recent-searches');
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Buscar Livros"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="space-y-6">
        {/* Search Input */}
        <Input
          placeholder="Buscar por título, autor, gênero..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          }
          className="text-lg"
          autoFocus
        />

        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Buscas Recentes</h3>
              <button
                onClick={clearRecentSearches}
                className="text-oursbook-light-gray hover:text-white text-sm"
              >
                Limpar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="bg-oursbook-medium-gray hover:bg-oursbook-light-gray hover:text-oursbook-black text-oursbook-light-gray px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-8">
            <Loading variant="spinner" text="Buscando livros..." />
          </div>
        )}

        {/* Search Results */}
        {!isLoading && query && (
          <div>
            <h3 className="text-white font-semibold mb-4">
              {results.length > 0 
                ? `${results.length} resultado${results.length > 1 ? 's' : ''} encontrado${results.length > 1 ? 's' : ''}`
                : 'Nenhum resultado encontrado'
              }
            </h3>
            
            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {results.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    showExpandedContent={false}
                    className="w-full"
                  />
                ))}
              </div>
            ) : query && (
              <div className="text-center py-8 text-oursbook-light-gray">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-lg mb-2">Nenhum livro encontrado</p>
                <p className="text-sm">Tente buscar por outro termo</p>
              </div>
            )}
          </div>
        )}

        {/* Popular Suggestions */}
        {!query && !isLoading && (
          <div>
            <h3 className="text-white font-semibold mb-4">Sugestões Populares</h3>
            <div className="text-center py-8">
              <p className="text-oursbook-light-gray">
                Nenhum livro disponível ainda. Aguarde enquanto adicionamos conteúdo.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}