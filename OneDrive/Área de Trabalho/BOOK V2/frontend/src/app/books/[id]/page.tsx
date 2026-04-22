'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { BookCarousel } from '@/components/books/BookCarousel';
import { useBooks } from '@/contexts/BookContext';
import { Book } from '@/types';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite,
    addToReadingList,
    removeFromReadingList,
    isInReadingList,
    startReading
  } = useBooks();

  useEffect(() => {
    // TODO: Replace with real API call to fetch book by ID
    // For now, no books are available
    setBook(null);
  }, [params.id]);

  if (!book) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-white mb-2">Livro não encontrado</h1>
          <p className="text-netflix-light-gray mb-4">O livro que você está procurando não existe.</p>
          <Button onClick={() => router.push('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const handleReadNow = () => {
    startReading(book);
    router.push(`/reader/${book.id}`);
  };

  const handleToggleFavorite = () => {
    if (isFavorite(book.id)) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book);
    }
  };

  const handleToggleReadingList = () => {
    if (isInReadingList(book.id)) {
      removeFromReadingList(book.id);
    } else {
      addToReadingList(book);
    }
  };

  // TODO: Add related books when real data is available
  const relatedBooks: Book[] = [];
  const tabs = [
    { id: 'overview', name: 'Visão Geral' },
    { id: 'details', name: 'Detalhes' },
    { id: 'reviews', name: 'Avaliações' }
  ];

  return (
    <div className="min-h-screen bg-netflix-black">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/80 to-transparent z-10" />
          
          {/* Background Image */}
          <div className="h-96 bg-netflix-dark-gray relative overflow-hidden">
            {book.cover_image_url && !imageError && (
              <Image
                src={book.cover_image_url}
                alt={`Capa do livro ${book.title}`}
                fill
                className="object-cover opacity-30 blur-sm"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Content */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container-netflix">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  <div className="w-64 h-96 bg-netflix-medium-gray rounded-netflix overflow-hidden shadow-expanded">
                    {book.cover_image_url && !imageError ? (
                      <Image
                        src={book.cover_image_url}
                        alt={`Capa do livro ${book.title}`}
                        width={256}
                        height={384}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-netflix-medium-gray to-netflix-dark-gray">
                        <div className="text-center p-6">
                          <div className="text-4xl mb-4">📚</div>
                          <p className="text-netflix-light-gray font-medium text-center">
                            {book.title}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                      {book.title}
                    </h1>
                    <p className="text-xl text-netflix-light-gray mb-4">
                      por {book.author}
                    </p>
                    
                    {/* Rating */}
                    {book.rating > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-5 h-5" fill={i < Math.floor(book.rating) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-white font-semibold">
                          {book.rating.toFixed(1)}
                        </span>
                        <span className="text-netflix-light-gray">
                          ({Math.floor(Math.random() * 500) + 50} avaliações)
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="bg-netflix-red text-white px-3 py-1 rounded-full text-sm font-medium">
                        {book.genre}
                      </span>
                      {book.page_count && (
                        <span className="bg-netflix-medium-gray text-netflix-light-gray px-3 py-1 rounded-full text-sm">
                          {book.page_count} páginas
                        </span>
                      )}
                      <span className="bg-netflix-medium-gray text-netflix-light-gray px-3 py-1 rounded-full text-sm">
                        {book.language.toUpperCase()}
                      </span>
                      {book.publication_date && (
                        <span className="bg-netflix-medium-gray text-netflix-light-gray px-3 py-1 rounded-full text-sm">
                          {new Date(book.publication_date).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={handleReadNow}
                      className="flex items-center space-x-2"
                    >
                      <span>📖</span>
                      <span>Ler Agora</span>
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={handleToggleFavorite}
                      className={`flex items-center space-x-2 ${isFavorite(book.id) ? 'bg-netflix-red text-white' : ''}`}
                    >
                      <span>{isFavorite(book.id) ? '💖' : '🤍'}</span>
                      <span>{isFavorite(book.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={handleToggleReadingList}
                      className={`flex items-center space-x-2 ${isInReadingList(book.id) ? 'bg-netflix-red text-white' : ''}`}
                    >
                      <span>{isInReadingList(book.id) ? '📚' : '➕'}</span>
                      <span>{isInReadingList(book.id) ? 'Remover da Lista' : 'Adicionar à Lista'}</span>
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-netflix-light-gray">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      <span>{book.viewCount.toLocaleString()} visualizações</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      <span>{book.downloadCount.toLocaleString()} downloads</span>
                    </span>
                    {book.fileSize && (
                      <span>{(book.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container-netflix py-12">
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b border-netflix-medium-gray mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-netflix-red'
                    : 'text-netflix-light-gray hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-white mb-4">Sinopse</h2>
                  <p className="text-netflix-light-gray leading-relaxed">
                    {book.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Informações</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-netflix-light-gray">Autor:</span>
                      <span className="text-white">{book.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-netflix-light-gray">Gênero:</span>
                      <span className="text-white">{book.genre}</span>
                    </div>
                    {book.pageCount && (
                      <div className="flex justify-between">
                        <span className="text-netflix-light-gray">Páginas:</span>
                        <span className="text-white">{book.pageCount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-netflix-light-gray">Idioma:</span>
                      <span className="text-white">{book.language.toUpperCase()}</span>
                    </div>
                    {book.publicationDate && (
                      <div className="flex justify-between">
                        <span className="text-netflix-light-gray">Publicação:</span>
                        <span className="text-white">{new Date(book.publicationDate).getFullYear()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-netflix-light-gray">Formato:</span>
                      <span className="text-white">{book.fileFormat.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Detalhes Técnicos</h2>
                <div className="bg-netflix-dark-gray rounded-netflix p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Informações do Arquivo</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-netflix-light-gray">Formato:</span>
                          <span className="text-white">{book.fileFormat.toUpperCase()}</span>
                        </div>
                        {book.fileSize && (
                          <div className="flex justify-between">
                            <span className="text-netflix-light-gray">Tamanho:</span>
                            <span className="text-white">{(book.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        )}
                        {book.isbn && (
                          <div className="flex justify-between">
                            <span className="text-netflix-light-gray">ISBN:</span>
                            <span className="text-white">{book.isbn}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-netflix-light-gray">Visualizações:</span>
                          <span className="text-white">{book.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-netflix-light-gray">Downloads:</span>
                          <span className="text-white">{book.downloadCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-netflix-light-gray">Adicionado em:</span>
                          <span className="text-white">{new Date(book.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Avaliações dos Leitores</h2>
                <div className="space-y-6">
                  {/* Mock Reviews */}
                  {[
                    { name: 'Maria Silva', rating: 5, comment: 'Livro excepcional! A narrativa é envolvente e os personagens são muito bem desenvolvidos.' },
                    { name: 'João Santos', rating: 4, comment: 'Boa leitura, recomendo para quem gosta do gênero. Algumas partes poderiam ser mais dinâmicas.' },
                    { name: 'Ana Costa', rating: 5, comment: 'Não consegui parar de ler! Uma obra-prima da literatura contemporânea.' }
                  ].map((review, index) => (
                    <div key={index} className="bg-netflix-dark-gray rounded-netflix p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-netflix-red rounded-full flex items-center justify-center text-white font-bold">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{review.name}</h4>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-netflix-light-gray text-sm">
                          {Math.floor(Math.random() * 30) + 1} dias atrás
                        </span>
                      </div>
                      <p className="text-netflix-light-gray">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="container-netflix pb-16">
            <BookCarousel
              title={`Mais livros de ${book.genre}`}
              books={relatedBooks}
            />
          </div>
        )}
      </main>
    </div>
  );
}