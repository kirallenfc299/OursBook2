'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookCarousel } from '@/components/books/BookCarousel';
import { useUser } from '@/contexts/UserContext';
import { useBooks } from '@/contexts/BookContext';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, updateUser } = useUser();
  const { favorites, currentlyReading, readingList } = useBooks();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', bio: '' });

  // Handle redirect in useEffect to avoid render-phase setState
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, username: user.username || '', bio: '' });
    }
  }, [user]);

  // Show loading state while checking auth
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

  // Don't render if not logged in (redirect is happening)
  if (!isLoggedIn || !user) return null;

  const handleSave = async () => {
    // Validar username se fornecido
    if (formData.username.trim()) {
      const usernameRegex = /^@[a-zA-Z0-9._-]+$/;
      if (!usernameRegex.test(formData.username)) {
        toast.error('Username inválido. Deve começar com @ e conter apenas letras, números, ponto (.), hífen (-) ou underscore (_)');
        return;
      }
    }

    try {
      await updateUser({ 
        name: formData.name,
        username: formData.username.trim() || null
      });
      toast.success('Perfil atualizado!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    }
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tierLabel: Record<string, string> = {
    basic: 'Basic',
    premium: 'Premium',
    ultimate: 'Ultimate',
  };

  const badges = [
    { name: 'Leitor', icon: '📚', description: 'Conta criada' },
    { name: 'Explorador', icon: '🗺️', description: 'Explorou a biblioteca' },
    ...(user.is_admin ? [{ name: 'Admin', icon: '🛡️', description: 'Administrador' }] : []),
    ...(user.subscription_tier !== 'basic' ? [{ name: 'Premium', icon: '👑', description: 'Membro Premium' }] : []),
  ];

  return (
    <div className="min-h-screen bg-theme-black">
      <Header />

      <main className="pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Cover */}
          <div className="h-48 bg-gradient-to-r from-theme-primary via-theme-primary-dark to-theme-black rounded-oursbook mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="text-theme-light-gray text-sm mt-1">Gerencie suas informações e preferências</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left */}
            <div className="lg:w-1/3 space-y-6">
              {/* Avatar + Info */}
              <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-theme-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                    {initials}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Nome</label>
                      <Input
                        placeholder="Digite seu nome"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Username</label>
                      <Input
                        placeholder="@seu.username"
                        value={formData.username}
                        onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                      />
                      <p className="text-theme-light-gray text-xs mt-1">
                        Deve começar com @ e conter apenas letras, números, . - _
                      </p>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Email</label>
                      <Input
                        value={user.email}
                        disabled
                        className="bg-theme-medium-gray/50 cursor-not-allowed"
                      />
                      <p className="text-theme-light-gray text-xs mt-1">
                        O email não pode ser alterado
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={handleSave}>Salvar</Button>
                      <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-bold text-white">{user.name || 'Defina seu nome'}</h2>
                      <p className="text-theme-light-gray text-sm">{user.username || 'Defina seu username'}</p>
                      <p className="text-theme-light-gray text-xs mt-1">{user.email}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  </div>
                )}
              </div>

              {/* Subscription */}
              <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
                <h3 className="text-lg font-bold text-white mb-4">Assinatura</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-theme-light-gray text-sm">Plano</span>
                  <span className="bg-theme-primary text-white px-3 py-1 rounded text-xs font-semibold">
                    {tierLabel[user.subscription_tier] || 'Basic'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-theme-light-gray text-sm">Membro desde</span>
                  <span className="text-white text-sm">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push('/subscriptions')}>
                  Gerenciar Assinatura
                </Button>
              </div>
            </div>

            {/* Right */}
            <div className="lg:w-2/3 space-y-6">
              {/* Stats */}
              <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
                <h3 className="text-lg font-bold text-white mb-6">Estatísticas</h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-theme-primary">{favorites.length}</div>
                    <div className="text-theme-light-gray text-sm mt-1">Favoritos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-theme-primary">{currentlyReading.length}</div>
                    <div className="text-theme-light-gray text-sm mt-1">Lendo</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-theme-primary">{readingList.length}</div>
                    <div className="text-theme-light-gray text-sm mt-1">Na Lista</div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
                <h3 className="text-lg font-bold text-white mb-4">Conquistas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {badges.map((badge, i) => (
                    <div key={i} className="bg-theme-medium-gray rounded-oursbook p-4 text-center hover:bg-theme-light-gray/20 transition-colors">
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="text-white font-semibold text-sm">{badge.name}</div>
                      <div className="text-theme-light-gray text-xs mt-1">{badge.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Book Lists */}
          <div className="mt-12 space-y-8">
            {currentlyReading.length > 0 && (
              <BookCarousel title="Lendo Atualmente" books={currentlyReading} showArrows={false} />
            )}
            {favorites.length > 0 && (
              <BookCarousel title="Meus Favoritos" books={favorites} />
            )}
            {readingList.length > 0 && (
              <BookCarousel title="Minha Lista" books={readingList} />
            )}
            {favorites.length === 0 && currentlyReading.length === 0 && readingList.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">Sua biblioteca está vazia</h3>
                <p className="text-theme-light-gray mb-6">Explore os livros e adicione aos favoritos ou à sua lista de leitura.</p>
                <Button variant="primary" onClick={() => router.push('/')}>Explorar Biblioteca</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
