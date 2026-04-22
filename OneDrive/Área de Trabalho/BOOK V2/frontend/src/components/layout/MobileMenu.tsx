'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAdmin, logout } = useUser();

  const handleLogout = async () => {
    onClose();
    await logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { href: '/', label: 'Início', icon: '🏠' },
    { href: '/categories', label: 'Categorias', icon: '📚' },
    { href: '/my-books', label: 'Meus Livros', icon: '📖' },
    { href: '/favorites', label: 'Favoritos', icon: '❤️' },
    { href: '/profile', label: 'Perfil', icon: '👤' },
    { href: '/settings', label: 'Configurações', icon: '⚙️' },
  ];

  if (isAdmin) {
    menuItems.push({ href: '/admin', label: 'Painel Admin', icon: '🛡️' });
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-theme-dark-gray border-l border-theme-medium-gray z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-theme-medium-gray">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-primary-dark rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-theme-primary text-lg font-bold">OursBook</span>
            </div>
            <button
              onClick={onClose}
              className="text-theme-light-gray hover:text-white p-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-theme-medium-gray">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-theme-primary rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">{user.name || 'Usuário'}</p>
                  <p className="text-theme-light-gray text-sm capitalize">{user.subscription_tier || 'Basic'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-theme-medium-gray transition-colors"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-theme-medium-gray">
            <Button
              variant="ghost"
              className="w-full justify-start text-theme-light-gray hover:text-white"
              onClick={handleLogout}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}