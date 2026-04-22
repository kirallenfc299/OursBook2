'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Book } from '@/types';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(250); // Mock total pages
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // TODO: Replace with real API call to fetch book by ID
    // For now, no books are available - show placeholder
    setBook({
      id: params.id as string,
      title: 'Livro de Exemplo',
      author: 'Autor Desconhecido',
      genre: 'Geral',
      coverImageUrl: '',
      description: 'Este é um livro de exemplo. O conteúdo real será carregado quando dados reais forem adicionados.',
      rating: 0,
      viewCount: 0,
      downloadCount: 0,
      language: 'pt',
      fileFormat: 'pdf',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }, [params.id]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const progress = (currentPage / totalPages) * 100;

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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-netflix-black' : 'bg-white'} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {!isFullscreen && <Header />}
      
      <main className={`${isFullscreen ? 'pt-0' : 'pt-20'} pb-4`}>
        {/* Reader Header */}
        <div className={`${theme === 'dark' ? 'bg-netflix-dark-gray' : 'bg-gray-100'} border-b ${theme === 'dark' ? 'border-netflix-medium-gray' : 'border-gray-300'} p-4`}>
          <div className="container-netflix flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {book.title}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-netflix-light-gray' : 'text-gray-600'}`}>
                  por {book.author}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Font Size Control */}
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-netflix-light-gray' : 'text-gray-600'}`}>A</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className={`text-sm ${theme === 'dark' ? 'bg-netflix-medium-gray text-white' : 'bg-white text-gray-900'} border ${theme === 'dark' ? 'border-netflix-light-gray' : 'border-gray-300'} rounded px-2 py-1`}
                >
                  <option value="small">Pequena</option>
                  <option value="medium">Média</option>
                  <option value="large">Grande</option>
                  <option value="xlarge">Extra Grande</option>
                </select>
                <span className={`text-lg ${theme === 'dark' ? 'text-netflix-light-gray' : 'text-gray-600'}`}>A</span>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
              >
                {isFullscreen ? '🗗' : '⛶'}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`${theme === 'dark' ? 'bg-netflix-dark-gray' : 'bg-gray-100'} px-4 py-2`}>
          <div className="container-netflix">
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${theme === 'dark' ? 'text-netflix-light-gray' : 'text-gray-600'}`}>
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex-1 bg-netflix-medium-gray rounded-full h-2">
                <div 
                  className="bg-netflix-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-netflix-light-gray' : 'text-gray-600'}`}>
                {progress.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Reader Content */}
        <div className="container-netflix py-8">
          <div className="max-w-4xl mx-auto">
            {/* Mock Book Content */}
            <div 
              className={`${theme === 'dark' ? 'bg-netflix-dark-gray text-white' : 'bg-white text-gray-900'} rounded-netflix p-8 shadow-lg min-h-[600px] relative`}
              style={{
                fontSize: fontSize === 'small' ? '14px' : 
                         fontSize === 'medium' ? '16px' : 
                         fontSize === 'large' ? '18px' : '20px',
                lineHeight: '1.6'
              }}
            >
              <h2 className="text-2xl font-bold mb-6">Capítulo {Math.ceil(currentPage / 10)}</h2>
              
              <div className="space-y-4">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt 
                  in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
                  doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
                
                <p>
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, 
                  sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                </p>

                <p>
                  At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis 
                  praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias 
                  excepturi sint occaecati cupiditate non provident.
                </p>
              </div>

              {/* Page Number */}
              <div className="absolute bottom-4 right-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-netflix-light-gray' : 'text-gray-500'}`}>
                  {currentPage}
                </span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Página Anterior</span>
              </Button>

              <div className="flex items-center space-x-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-netflix-light-gray' : 'text-gray-600'}`}>
                  Ir para página:
                </span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => handleGoToPage(parseInt(e.target.value) || 1)}
                  className={`w-20 px-2 py-1 text-center ${theme === 'dark' ? 'bg-netflix-medium-gray text-white' : 'bg-white text-gray-900'} border ${theme === 'dark' ? 'border-netflix-light-gray' : 'border-gray-300'} rounded`}
                />
              </div>

              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2"
              >
                <span>Próxima Página</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}