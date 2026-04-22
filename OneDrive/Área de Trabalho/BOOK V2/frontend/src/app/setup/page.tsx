'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Popular authors across genres
const POPULAR_AUTHORS = [
  { id: 'machado', name: 'Machado de Assis', genre: 'Literatura Brasileira', emoji: '🇧🇷' },
  { id: 'clarice', name: 'Clarice Lispector', genre: 'Literatura Brasileira', emoji: '🇧🇷' },
  { id: 'jorge', name: 'Jorge Amado', genre: 'Literatura Brasileira', emoji: '🇧🇷' },
  { id: 'tolkien', name: 'J.R.R. Tolkien', genre: 'Fantasia', emoji: '🧙' },
  { id: 'rowling', name: 'J.K. Rowling', genre: 'Fantasia', emoji: '⚡' },
  { id: 'martin', name: 'George R.R. Martin', genre: 'Fantasia', emoji: '🐉' },
  { id: 'asimov', name: 'Isaac Asimov', genre: 'Ficção Científica', emoji: '🤖' },
  { id: 'dick', name: 'Philip K. Dick', genre: 'Ficção Científica', emoji: '🚀' },
  { id: 'herbert', name: 'Frank Herbert', genre: 'Ficção Científica', emoji: '🌌' },
  { id: 'christie', name: 'Agatha Christie', genre: 'Mistério', emoji: '🔍' },
  { id: 'conan', name: 'Arthur Conan Doyle', genre: 'Mistério', emoji: '🕵️' },
  { id: 'king', name: 'Stephen King', genre: 'Terror', emoji: '👻' },
  { id: 'dostoevsky', name: 'Fiódor Dostoiévski', genre: 'Clássicos', emoji: '📖' },
  { id: 'tolstoy', name: 'Liev Tolstói', genre: 'Clássicos', emoji: '📜' },
  { id: 'kafka', name: 'Franz Kafka', genre: 'Clássicos', emoji: '🪲' },
  { id: 'orwell', name: 'George Orwell', genre: 'Distopia', emoji: '👁️' },
  { id: 'huxley', name: 'Aldous Huxley', genre: 'Distopia', emoji: '🌐' },
  { id: 'coelho', name: 'Paulo Coelho', genre: 'Autoajuda', emoji: '✨' },
  { id: 'yuval', name: 'Yuval Noah Harari', genre: 'Não-ficção', emoji: '🧠' },
  { id: 'sagan', name: 'Carl Sagan', genre: 'Ciência', emoji: '🔭' },
  { id: 'hawking', name: 'Stephen Hawking', genre: 'Ciência', emoji: '⚛️' },
  { id: 'gaiman', name: 'Neil Gaiman', genre: 'Fantasia', emoji: '🌙' },
  { id: 'pratchett', name: 'Terry Pratchett', genre: 'Fantasia Cômica', emoji: '🎩' },
  { id: 'sanderson', name: 'Brandon Sanderson', genre: 'Fantasia', emoji: '⚔️' },
];

const GENRES = ['Todos', 'Literatura Brasileira', 'Fantasia', 'Ficção Científica', 'Mistério', 'Terror', 'Clássicos', 'Distopia', 'Autoajuda', 'Não-ficção', 'Ciência'];

const PREFS_KEY = 'oursbook_author_prefs';

export function getAuthorPreferences(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
  } catch { return []; }
}

export function saveAuthorPreferences(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(ids));
}

export default function SetupPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useUser();
  const { toast } = useToast();

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('Todos');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customAuthors, setCustomAuthors] = useState<typeof POPULAR_AUTHORS>([]);
  const [step, setStep] = useState<'authors' | 'done'>('authors');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace('/login');
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    // Load existing preferences
    setSelected(getAuthorPreferences());
  }, []);

  if (isLoading || !user) return null;

  const allAuthors = [...POPULAR_AUTHORS, ...customAuthors];

  const filtered = allAuthors.filter(a => {
    const matchesGenre = activeGenre === 'Todos' || a.genre === activeGenre;
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addCustomAuthor = () => {
    const name = customAuthor.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    const newAuthor = { id, name, genre: 'Personalizado', emoji: '✍️' };
    setCustomAuthors(prev => [...prev, newAuthor]);
    setSelected(prev => [...prev, id]);
    setCustomAuthor('');
    toast.success(`"${name}" adicionado!`);
  };

  const handleFinish = () => {
    if (selected.length === 0) {
      toast.error('Selecione pelo menos um autor para continuar.');
      return;
    }
    saveAuthorPreferences(selected);
    toast.success('Preferências salvas! Sua biblioteca foi personalizada.');
    router.push('/');
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-theme-black">
      {/* Header */}
      <div className="border-b border-theme-medium-gray/30 bg-theme-dark-gray/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-primary-dark rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-theme-primary font-bold text-lg">OursBook</span>
          </div>
          <button onClick={handleSkip} className="text-theme-light-gray hover:text-white text-sm transition-colors">
            Pular por agora →
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Olá, {user.name.split(' ')[0]}! Vamos personalizar sua biblioteca
          </h1>
          <p className="text-theme-light-gray text-lg max-w-2xl mx-auto">
            Selecione os autores que você mais gosta. Os livros deles aparecerão em destaque nos seus carrosséis.
          </p>
          <div className="mt-4 text-theme-primary font-semibold">
            {selected.length} autor{selected.length !== 1 ? 'es' : ''} selecionado{selected.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search + Custom Author */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="🔍 Buscar autor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar autor personalizado..."
              value={customAuthor}
              onChange={e => setCustomAuthor(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomAuthor()}
              className="w-64"
            />
            <Button variant="secondary" onClick={addCustomAuthor} disabled={!customAuthor.trim()}>
              + Adicionar
            </Button>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeGenre === genre
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-medium-gray text-theme-light-gray hover:bg-theme-medium-gray/80 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {filtered.map(author => {
            const isSelected = selected.includes(author.id);
            return (
              <button
                key={author.id}
                onClick={() => toggle(author.id)}
                className={`relative p-4 rounded-oursbook border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-theme-primary bg-theme-primary/10 shadow-lg shadow-theme-primary/20'
                    : 'border-theme-medium-gray bg-theme-dark-gray hover:border-theme-primary/50 hover:bg-theme-medium-gray/30'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-theme-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="text-2xl mb-2">{author.emoji}</div>
                <div className={`font-semibold text-sm leading-tight ${isSelected ? 'text-white' : 'text-theme-light-gray'}`}>
                  {author.name}
                </div>
                <div className="text-xs text-theme-light-gray/70 mt-1">{author.genre}</div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-theme-light-gray">
              <div className="text-4xl mb-3">🔍</div>
              <p>Nenhum autor encontrado. Adicione um personalizado acima!</p>
            </div>
          )}
        </div>

        {/* Selected Summary */}
        {selected.length > 0 && (
          <div className="bg-theme-dark-gray rounded-oursbook p-4 border border-theme-medium-gray/30 mb-8">
            <h3 className="text-white font-semibold mb-3">Autores selecionados:</h3>
            <div className="flex flex-wrap gap-2">
              {selected.map(id => {
                const author = allAuthors.find(a => a.id === id);
                if (!author) return null;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 bg-theme-primary/20 border border-theme-primary/40 text-theme-primary px-3 py-1 rounded-full text-sm"
                  >
                    {author.emoji} {author.name}
                    <button
                      onClick={() => toggle(id)}
                      className="ml-1 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            className="px-12"
            onClick={handleFinish}
            disabled={selected.length === 0}
          >
            ✅ Salvar Preferências e Entrar
          </Button>
          <Button variant="ghost" size="lg" onClick={handleSkip}>
            Pular por agora
          </Button>
        </div>
      </div>
    </div>
  );
}
