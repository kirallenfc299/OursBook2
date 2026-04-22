'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/Toast';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  subscriptionTier: 'basic' | 'premium' | 'ultimate';
  isAdmin: boolean;
  createdAt: Date;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, router]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const registeredUsers = localStorage.getItem('oursbook-registered-users');
      const storedUsers: StoredUser[] = registeredUsers ? JSON.parse(registeredUsers) : [];
      
      // Add demo accounts
      const demoAccounts = [
        {
          id: 'admin-demo',
          name: 'Administrador',
          email: 'admin@oursbook.com',
          password: '[DEMO ACCOUNT]',
          subscriptionTier: 'ultimate' as const,
          isAdmin: true,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'user-demo',
          name: 'Usuário Demo',
          email: 'user@oursbook.com',
          password: '[DEMO ACCOUNT]',
          subscriptionTier: 'premium' as const,
          isAdmin: false,
          createdAt: new Date('2024-01-01')
        }
      ];

      setUsers([...demoAccounts, ...storedUsers]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = (userId: string) => {
    if (userId.includes('demo')) {
      toast.error('Não é possível excluir contas de demonstração');
      return;
    }

    if (userId === user?.id) {
      toast.error('Você não pode excluir sua própria conta');
      return;
    }

    try {
      const registeredUsers = localStorage.getItem('oursbook-registered-users');
      const storedUsers: StoredUser[] = registeredUsers ? JSON.parse(registeredUsers) : [];
      
      const updatedUsers = storedUsers.filter(u => u.id !== userId);
      localStorage.setItem('oursbook-registered-users', JSON.stringify(updatedUsers));
      
      loadUsers();
      toast.success('Usuário excluído com sucesso');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const toggleAdminStatus = (userId: string) => {
    if (userId.includes('demo')) {
      toast.error('Não é possível alterar contas de demonstração');
      return;
    }

    if (userId === user?.id) {
      toast.error('Você não pode alterar seu próprio status de admin');
      return;
    }

    try {
      const registeredUsers = localStorage.getItem('oursbook-registered-users');
      const storedUsers: StoredUser[] = registeredUsers ? JSON.parse(registeredUsers) : [];
      
      const updatedUsers = storedUsers.map(u => 
        u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
      );
      
      localStorage.setItem('oursbook-registered-users', JSON.stringify(updatedUsers));
      
      loadUsers();
      toast.success('Status de admin atualizado');
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

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

  return (
    <div className="min-h-screen bg-theme-black">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container-oursbook">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Usuários</h1>
              <p className="text-theme-light-gray">
                Visualize e gerencie todos os usuários da plataforma.
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/admin')}
              className="flex items-center space-x-2"
            >
              <span>←</span>
              <span>Voltar ao Painel</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-light-gray text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>
            
            <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-light-gray text-sm">Administradores</p>
                  <p className="text-2xl font-bold text-white">{users.filter(u => u.isAdmin).length}</p>
                </div>
                <div className="text-3xl">👑</div>
              </div>
            </div>
            
            <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-light-gray text-sm">Usuários Regulares</p>
                  <p className="text-2xl font-bold text-white">{users.filter(u => !u.isAdmin).length}</p>
                </div>
                <div className="text-3xl">👤</div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-theme-dark-gray rounded-oursbook overflow-hidden border border-theme-medium-gray/30">
            <div className="p-6 border-b border-theme-medium-gray">
              <h2 className="text-xl font-bold text-white">Lista de Usuários</h2>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-theme-light-gray">Carregando usuários...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-theme-light-gray">Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-theme-medium-gray">
                    <tr>
                      <th className="text-left p-4 text-white font-semibold">Nome</th>
                      <th className="text-left p-4 text-white font-semibold">Email</th>
                      <th className="text-left p-4 text-white font-semibold">Plano</th>
                      <th className="text-left p-4 text-white font-semibold">Tipo</th>
                      <th className="text-left p-4 text-white font-semibold">Cadastro</th>
                      <th className="text-left p-4 text-white font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userData, index) => (
                      <tr key={userData.id} className={index % 2 === 0 ? 'bg-theme-dark-gray' : 'bg-theme-black'}>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{userData.name}</span>
                            {userData.id.includes('demo') && (
                              <span className="bg-theme-primary text-white text-xs px-2 py-1 rounded">DEMO</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-theme-light-gray">{userData.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            userData.subscriptionTier === 'ultimate' ? 'bg-yellow-600 text-white' :
                            userData.subscriptionTier === 'premium' ? 'bg-theme-primary text-white' :
                            'bg-theme-medium-gray text-theme-light-gray'
                          }`}>
                            {userData.subscriptionTier.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            userData.isAdmin ? 'bg-purple-600 text-white' : 'bg-theme-medium-gray text-theme-light-gray'
                          }`}>
                            {userData.isAdmin ? 'ADMIN' : 'USUÁRIO'}
                          </span>
                        </td>
                        <td className="p-4 text-theme-light-gray text-sm">
                          {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            {!userData.id.includes('demo') && userData.id !== user?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleAdminStatus(userData.id)}
                                  className="text-xs"
                                >
                                  {userData.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteUser(userData.id)}
                                  className="text-xs text-red-400 hover:bg-red-400 hover:text-white"
                                >
                                  Excluir
                                </Button>
                              </>
                            )}
                            {userData.id === user?.id && (
                              <span className="text-xs text-theme-light-gray">Você</span>
                            )}
                            {userData.id.includes('demo') && (
                              <span className="text-xs text-theme-light-gray">Conta Demo</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}