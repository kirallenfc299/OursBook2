'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/Toast';
import { BookService } from '@/lib/books';
import type { BookSearchResult } from '@/lib/books';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMagicImportModalOpen, setIsMagicImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'title' | 'author'>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{ bookFile?: File; coverFile?: File }>({});
  const [userStats, setUserStats] = useState({ total: 0, admins: 0 });
  
  // Magic Import states
  const [magicAuthor, setMagicAuthor] = useState('');
  const [magicMaxBooks, setMagicMaxBooks] = useState(20); // Increased default to 20
  const [magicSlowMode, setMagicSlowMode] = useState(true); // Enable slow mode by default
  const [isMagicImporting, setIsMagicImporting] = useState(false);
  const [magicProgress, setMagicProgress] = useState({ current: 0, total: 0, status: '' });
  const [magicSearchResults, setMagicSearchResults] = useState<BookSearchResult[]>([]);
  const [magicSelectedBooks, setMagicSelectedBooks] = useState<Set<number>>(new Set());
  const [magicImportedBooks, setMagicImportedBooks] = useState<Set<string>>(new Set());
  const [isLoadingMagicSearch, setIsLoadingMagicSearch] = useState(false);

  // Load user statistics
  React.useEffect(() => {
    const loadStats = () => {
      try {
        const registeredUsers = localStorage.getItem('oursbook-registered-users');
        const users = registeredUsers ? JSON.parse(registeredUsers) : [];
        
        // Add demo accounts to count
        const totalUsers = users.length + 2; // +2 for demo accounts
        const adminUsers = users.filter((u: any) => u.isAdmin).length + 1; // +1 for admin demo
        
        setUserStats({ total: totalUsers, admins: adminUsers });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-theme-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-theme-light-gray mb-4">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => router.push('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Por favor, insira um termo de busca');
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await BookService.searchGoogleBooks(searchQuery, importType);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('Nenhum livro encontrado para este termo');
      } else {
        toast.success(`${results.length} livros encontrados!`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar livros. Verifique sua conexão.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportBook = async (bookData: BookSearchResult) => {
    try {
      const result = await BookService.createBookFromSearch(bookData, selectedFiles);
      
      if (result.success) {
        toast.success(result.message);
        setSearchResults([]);
        setSearchQuery('');
        setSelectedFiles({});
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar livro');
    }
  };

  // Magic Import - Search for books and show list
  const handleMagicSearch = async () => {
    if (!magicAuthor.trim()) {
      toast.error('Por favor, insira o nome do autor');
      return;
    }

    setIsLoadingMagicSearch(true);
    setMagicSearchResults([]);
    setMagicSelectedBooks(new Set());

    try {
      // Search Open Library (primary source)
      console.log('Searching Open Library for:', magicAuthor);
      let results = await BookService.searchOpenLibrary(magicAuthor, 'author');
      
      // Supplement with Google Books if needed
      if (results.length < 5) {
        console.log('Open Library returned few results, trying Google Books...');
        try {
          const googleResults = await BookService.searchGoogleBooks(magicAuthor, 'author');
          const existingTitles = new Set(results.map(b => b.title.toLowerCase()));
          const newResults = googleResults.filter(b => !existingTitles.has(b.title.toLowerCase()));
          results = [...results, ...newResults];
        } catch (error) {
          console.warn('Google Books failed, continuing with Open Library only:', error);
        }
      }

      if (results.length === 0) {
        toast.error('Nenhum livro encontrado para este autor.');
        setIsLoadingMagicSearch(false);
        return;
      }

      // Limit to maxBooks
      const limitedResults = results.slice(0, magicMaxBooks);
      setMagicSearchResults(limitedResults);

      // Check which books are already imported
      const response = await fetch('/api/books?limit=1000');
      const data = await response.json();
      const existingBooks = data.books || [];
      
      const importedTitles = new Set(
        existingBooks.map((b: any) => b.title.toLowerCase().trim())
      );
      setMagicImportedBooks(importedTitles);

      // Auto-select books that are NOT imported
      const notImportedIndexes = new Set<number>();
      limitedResults.forEach((book, index) => {
        if (!importedTitles.has(book.title.toLowerCase().trim())) {
          notImportedIndexes.add(index);
        }
      });
      setMagicSelectedBooks(notImportedIndexes);

      toast.success(`${limitedResults.length} livros encontrados! ${notImportedIndexes.size} novos para importar.`);
    } catch (error) {
      console.error('Magic search error:', error);
      toast.error('Erro ao buscar livros. Tente novamente.');
    } finally {
      setIsLoadingMagicSearch(false);
    }
  };

  // Toggle book selection
  const toggleBookSelection = (index: number) => {
    const newSelection = new Set(magicSelectedBooks);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setMagicSelectedBooks(newSelection);
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (magicSelectedBooks.size === magicSearchResults.length) {
      setMagicSelectedBooks(new Set());
    } else {
      setMagicSelectedBooks(new Set(magicSearchResults.map((_, i) => i)));
    }
  };

  // Magic Import - Inspired by Import V1.py
  const handleMagicImport = async () => {
    if (magicSearchResults.length === 0) {
      toast.error('Primeiro busque os livros do autor');
      return;
    }

    if (magicSelectedBooks.size === 0) {
      toast.error('Selecione pelo menos um livro para importar');
      return;
    }

    // Check if user is logged in and is admin
    if (!user || !isAdmin) {
      toast.error('Você precisa estar logado como administrador para importar livros');
      return;
    }

    // Verify token exists
    const token = localStorage.getItem('oursbook_token');
    if (!token) {
      toast.error('Sessão expirada. Faça login novamente.');
      router.push('/login');
      return;
    }

    setIsMagicImporting(true);
    
    // Get only selected books
    const booksToImport = Array.from(magicSelectedBooks)
      .map(index => magicSearchResults[index])
      .filter(Boolean);

    setMagicProgress({ current: 0, total: booksToImport.length, status: `Preparando importação de ${booksToImport.length} livros...` });

    // Wait 2 seconds before starting
    await new Promise(resolve => setTimeout(resolve, 2000));

    let successCount = 0;
    let failCount = 0;

    // Calculate delay based on slow mode
    const baseDelay = magicSlowMode ? 5000 : 2000;
    const openLibDelay = magicSlowMode ? 3000 : 1500;

    try {
      // Import each selected book
      for (let i = 0; i < booksToImport.length; i++) {
        const book = booksToImport[i];
        setMagicProgress({ 
          current: i + 1, 
          total: booksToImport.length, 
          status: `📚 Importando: ${book.title}...` 
        });

        try {
          // Get enhanced metadata from Open Library
          const isbn = book.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                       book.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;
          
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, openLibDelay));
          }
          
          let openLibData = null;
          try {
            openLibData = await BookService.getOpenLibraryMetadata(
              isbn,
              book.title,
              book.authors[0]
            );
          } catch (error) {
            console.warn('Open Library metadata failed, continuing without it:', error);
          }

          // Import book
          const result = await BookService.createBookFromSearch(book);
          
          if (result.success) {
            successCount++;
            setMagicProgress({ 
              current: i + 1, 
              total: booksToImport.length, 
              status: `✅ ${book.title} importado!` 
            });
          } else {
            failCount++;
            console.warn(`Failed to import: ${book.title}`, result.message);
            
            if (result.message.includes('Acesso negado') || result.message.includes('Não autenticado')) {
              toast.error('Sessão expirada. Faça login novamente como administrador.');
              setIsMagicImporting(false);
              setTimeout(() => router.push('/login'), 2000);
              return;
            }
            
            setMagicProgress({ 
              current: i + 1, 
              total: booksToImport.length, 
              status: `⚠️ Falha: ${book.title}` 
            });
          }

          await new Promise(resolve => setTimeout(resolve, baseDelay));
        } catch (error) {
          failCount++;
          console.error(`Error importing ${book.title}:`, error);
          setMagicProgress({ 
            current: i + 1, 
            total: booksToImport.length, 
            status: `❌ Erro: ${book.title}` 
          });
        }
      }

      // Final status
      setMagicProgress({ 
        current: booksToImport.length, 
        total: booksToImport.length, 
        status: `🎉 Concluído! ${successCount} importados, ${failCount} falharam` 
      });

      if (successCount > 0) {
        toast.success(`Magic Import concluído! ${successCount} livros importados com sucesso.`);
      } else {
        toast.error('Nenhum livro foi importado. Verifique os logs para mais detalhes.');
      }
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsMagicImportModalOpen(false);
        setMagicAuthor('');
        setMagicSearchResults([]);
        setMagicSelectedBooks(new Set());
        setMagicProgress({ current: 0, total: 0, status: '' });
      }, 5000);

    } catch (error) {
      console.error('Magic Import error:', error);
      toast.error('Erro durante Magic Import. Tente novamente.');
      setMagicProgress({ current: 0, total: 0, status: '❌ Erro durante importação' });
    } finally {
      setIsMagicImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-black">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container-oursbook">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
            <p className="text-theme-light-gray">
              Gerencie o conteúdo da plataforma.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-theme-dark-gray rounded-oursbook p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-light-gray text-sm">Total de Livros</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="text-3xl">📚</div>
              </div>
            </div>
            
            <div className="bg-theme-dark-gray rounded-oursbook p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-light-gray text-sm">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-white">{userStats.total}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>
            
            <div className="bg-theme-dark-gray rounded-oursbook p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-light-gray text-sm">Downloads Hoje</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="text-3xl">⬇️</div>
              </div>
            </div>
            
            <div className="bg-theme-dark-gray rounded-oursbook p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-light-gray text-sm">Novos Usuários</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="text-3xl">✨</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
              <h3 className="text-xl font-bold text-white mb-4">Importar Livros</h3>
              <p className="text-theme-light-gray mb-4">
                Busque e importe livros automaticamente usando APIs públicas.
              </p>
              <Button 
                variant="primary" 
                onClick={() => setIsImportModalOpen(true)}
                className="w-full"
              >
                Importar Livros
              </Button>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-oursbook p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                ✨ Magic Import
              </h3>
              <p className="text-white/90 mb-4">
                Importe TODOS os livros de um autor automaticamente com metadados enriquecidos!
              </p>
              <Button 
                variant="secondary" 
                onClick={() => setIsMagicImportModalOpen(true)}
                className="w-full bg-white text-purple-600 hover:bg-purple-50"
              >
                🪄 Magic Import
              </Button>
            </div>
            
            <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
              <h3 className="text-xl font-bold text-white mb-4">Gerenciar Usuários</h3>
              <p className="text-theme-light-gray mb-4">
                Visualize e gerencie contas de usuários da plataforma.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => router.push('/admin/users')}
                className="w-full"
              >
                Ver Usuários
              </Button>
            </div>
            
            <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
              <h3 className="text-xl font-bold text-white mb-4">Relatórios</h3>
              <p className="text-theme-light-gray mb-4">
                Acesse relatórios detalhados de uso e estatísticas.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                className="w-full"
              >
                Ver Relatórios
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-theme-dark-gray rounded-oursbook p-6">
            <h3 className="text-xl font-bold text-white mb-4">Atividade Recente</h3>
            <div className="text-center py-8">
              <p className="text-theme-light-gray">
                Nenhuma atividade registrada ainda. As atividades aparecerão aqui quando o sistema estiver em uso.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importar Livros"
        size="lg"
      >
        <div className="space-y-6">
          {/* Import Type Selection */}
          <div>
            <label className="block text-white font-medium mb-2">Tipo de Busca</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importType"
                  value="title"
                  checked={importType === 'title'}
                  onChange={(e) => setImportType(e.target.value as 'title' | 'author')}
                  className="mr-2"
                />
                <span className="text-theme-light-gray">Por Título</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importType"
                  value="author"
                  checked={importType === 'author'}
                  onChange={(e) => setImportType(e.target.value as 'title' | 'author')}
                  className="mr-2"
                />
                <span className="text-theme-light-gray">Por Autor</span>
              </label>
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-white font-medium mb-2">
              {importType === 'title' ? 'Nome do Livro' : 'Nome do Autor'}
            </label>
            <Input
              placeholder={importType === 'title' ? 'Digite o título do livro...' : 'Digite o nome do autor...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Search Button */}
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="w-full"
          >
            {isSearching ? 'Buscando...' : 'Buscar Livros'}
          </Button>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-4">Resultados da Busca ({searchResults.length})</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.map((book, index) => (
                  <div key={index} className="bg-theme-medium-gray rounded p-4">
                    <div className="flex items-start space-x-4">
                      {/* Book Cover */}
                      <div className="flex-shrink-0">
                        {book.imageLinks?.thumbnail ? (
                          <img
                            src={book.imageLinks.thumbnail}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-theme-dark-gray rounded flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-white font-medium text-sm mb-1 truncate">{book.title}</h5>
                        <p className="text-theme-light-gray text-xs mb-1">
                          {book.authors.join(', ')}
                        </p>
                        {book.publishedDate && (
                          <p className="text-theme-light-gray text-xs mb-1">
                            Publicado: {book.publishedDate}
                          </p>
                        )}
                        {book.categories && (
                          <p className="text-theme-light-gray text-xs mb-2">
                            Categoria: {book.categories.join(', ')}
                          </p>
                        )}
                        {book.description && (
                          <p className="text-theme-light-gray text-xs line-clamp-2">
                            {book.description.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      
                      {/* Import Button */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleImportBook(book)}
                          className="text-xs"
                        >
                          Importar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Section */}
          <div>
            <h4 className="text-white font-medium mb-4">Arquivos Opcionais</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-theme-light-gray text-sm mb-2">
                  Arquivo do Livro (PDF, EPUB, etc.)
                </label>
                <input
                  type="file"
                  accept=".pdf,.epub,.mobi,.txt"
                  onChange={(e) => setSelectedFiles(prev => ({ ...prev, bookFile: e.target.files?.[0] }))}
                  className="w-full text-sm text-theme-light-gray file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-theme-primary file:text-white hover:file:bg-theme-primary-dark"
                />
              </div>
              
              <div>
                <label className="block text-theme-light-gray text-sm mb-2">
                  Capa Personalizada (JPG, PNG)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => setSelectedFiles(prev => ({ ...prev, coverFile: e.target.files?.[0] }))}
                  className="w-full text-sm text-theme-light-gray file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-theme-primary file:text-white hover:file:bg-theme-primary-dark"
                />
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-theme-medium-gray rounded p-4">
            <p className="text-theme-light-gray text-sm">
              <strong>Como usar:</strong>
            </p>
            <ul className="text-theme-light-gray text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Busque livros por título ou autor usando a API do Google Books</li>
              <li>Opcionalmente, faça upload do arquivo do livro e capa personalizada</li>
              <li>Clique em "Importar" para adicionar o livro à biblioteca</li>
              <li>Os livros serão salvos no Supabase com todos os metadados</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Magic Import Modal */}
      <Modal
        isOpen={isMagicImportModalOpen}
        onClose={() => !isMagicImporting && setIsMagicImportModalOpen(false)}
        title="✨ Magic Import - Importação em Massa"
        size="xl"
      >
        <div className="space-y-6">
          {!isMagicImporting ? (
            <>
              {/* Search Section - Always visible at top */}
              <div className="space-y-4 pb-4 border-b border-theme-medium-gray">
                {/* Author Input */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    🎤 Nome do Autor
                  </label>
                  <Input
                    placeholder="Ex: Machado de Assis, J.K. Rowling, Stephen King..."
                    value={magicAuthor}
                    onChange={(e) => setMagicAuthor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleMagicSearch()}
                  />
                </div>

                {/* Max Books and Slow Mode in same row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Max Books Limit */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      🔢 Limite de Livros
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={magicMaxBooks}
                      onChange={(e) => setMagicMaxBooks(Math.min(100, Math.max(1, parseInt(e.target.value) || 20)))}
                    />
                  </div>

                  {/* Slow Mode Toggle */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      ⚙️ Modo de Importação
                    </label>
                    <label className="flex items-center cursor-pointer bg-theme-medium-gray rounded p-3">
                      <input
                        type="checkbox"
                        checked={magicSlowMode}
                        onChange={(e) => setMagicSlowMode(e.target.checked)}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-white text-sm">🐢 Modo Lento</span>
                    </label>
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  variant="primary"
                  onClick={handleMagicSearch}
                  disabled={!magicAuthor.trim() || isLoadingMagicSearch}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                >
                  {isLoadingMagicSearch ? '🔍 Buscando...' : '🔍 Buscar Livros'}
                </Button>
              </div>

              {/* Book List Section */}
              {magicSearchResults.length > 0 && (
                <>
                  {/* Import Button - Fixed at top of list */}
                  <div className="sticky top-0 z-10 bg-theme-dark-gray p-4 rounded-lg border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">
                          {magicSelectedBooks.size} de {magicSearchResults.length} livros selecionados
                        </h4>
                        <p className="text-theme-light-gray text-sm">
                          ✅ Já importados | ⏳ Novos para importar
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="text-xs"
                      >
                        {magicSelectedBooks.size === magicSearchResults.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                      </Button>
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleMagicImport}
                      disabled={magicSelectedBooks.size === 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                    >
                      🚀 Importar {magicSelectedBooks.size} Livro{magicSelectedBooks.size !== 1 ? 's' : ''}
                    </Button>
                  </div>

                  {/* Book List */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {magicSearchResults.map((book, index) => {
                      const isImported = magicImportedBooks.has(book.title.toLowerCase().trim());
                      const isSelected = magicSelectedBooks.has(index);
                      
                      return (
                        <div
                          key={index}
                          onClick={() => toggleBookSelection(index)}
                          className={`
                            flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all
                            ${isSelected 
                              ? 'bg-purple-600/20 border-2 border-purple-500' 
                              : 'bg-theme-medium-gray border-2 border-transparent hover:border-theme-light-gray/30'
                            }
                          `}
                        >
                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-5 h-5 rounded"
                            />
                          </div>

                          {/* Book Cover */}
                          <div className="flex-shrink-0">
                            {book.imageLinks?.thumbnail ? (
                              <img
                                src={book.imageLinks.thumbnail}
                                alt={book.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-theme-dark-gray rounded flex items-center justify-center">
                                <span className="text-xl">📚</span>
                              </div>
                            )}
                          </div>

                          {/* Book Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h5 className="text-white font-medium text-sm mb-1 line-clamp-2 flex-1">
                                {book.title}
                              </h5>
                              {/* Status Badge */}
                              <span className={`
                                ml-2 px-2 py-1 rounded text-xs font-semibold flex-shrink-0
                                ${isImported 
                                  ? 'bg-green-600/20 text-green-300 border border-green-500/30' 
                                  : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                }
                              `}>
                                {isImported ? '✅ Importado' : '⏳ Novo'}
                              </span>
                            </div>
                            <p className="text-theme-light-gray text-xs mb-1">
                              {book.authors.join(', ')}
                            </p>
                            {book.publishedDate && (
                              <p className="text-theme-light-gray text-xs">
                                📅 {book.publishedDate}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Info Boxes - Only show if no results yet */}
              {magicSearchResults.length === 0 && (
                <>
                  {/* Info Box */}
                  <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <span className="text-2xl mr-2">🪄</span>
                      Como funciona?
                    </h4>
                    <ul className="text-theme-light-gray text-sm space-y-1">
                      <li>• Busca livros do autor no Open Library</li>
                      <li>• Mostra quais já foram importados</li>
                      <li>• Selecione os livros que deseja importar</li>
                      <li>• Importação automática com metadados completos</li>
                    </ul>
                  </div>

                  {/* Success Info Box */}
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-200 font-semibold mb-2 flex items-center">
                      <span className="text-xl mr-2">✅</span>
                      Sem limites de API!
                    </h4>
                    <ul className="text-green-100 text-sm space-y-1">
                      <li>• Open Library não tem rate limiting</li>
                      <li>• Importe até 100 livros de uma vez</li>
                      <li>• Modo Lento garante importação estável</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Progress Display */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-bounce">✨</div>
                  <h3 className="text-xl font-bold text-white mb-2">Magic Import em Andamento...</h3>
                  <p className="text-theme-light-gray">{magicProgress.status}</p>
                </div>

                {/* Progress Bar */}
                {magicProgress.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-theme-light-gray">
                      <span>Progresso</span>
                      <span>{magicProgress.current} / {magicProgress.total}</span>
                    </div>
                    <div className="w-full bg-theme-medium-gray rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-purple-800 h-full transition-all duration-500 ease-out"
                        style={{ width: `${(magicProgress.current / magicProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-center text-theme-light-gray text-sm">
                      {Math.round((magicProgress.current / magicProgress.total) * 100)}% concluído
                    </p>
                  </div>
                )}

                {/* Warning */}
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded p-3">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ Não feche esta janela durante a importação!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
