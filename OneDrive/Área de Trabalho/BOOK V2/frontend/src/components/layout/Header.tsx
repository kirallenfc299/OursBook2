'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchModal } from '@/components/search/SearchModal';
import { NotificationSystem } from '@/components/notifications/NotificationSystem';
import { MobileMenu } from './MobileMenu';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, isAdmin, logout } = useUser();
  const { unreadCount } = useNotifications();

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className={cn(
        'w-full bg-transparent no-scroll-behavior',
        className
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href={isLoggedIn ? "/" : "/login"} className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  {/* Nova Logo do OursBook */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-theme-primary to-theme-primary-dark rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {/* Notification dot for logo */}
                  {isLoggedIn && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-theme-secondary rounded-full border-2 border-theme-black" />
                  )}
                </div>
                <div className="text-theme-primary text-lg sm:text-2xl font-bold tracking-tight">
                  OursBook
                </div>
              </Link>

              {/* Navigation Menu - Only show when logged in */}
              {isLoggedIn && (
                <nav className="hidden lg:flex items-center space-x-6">
                  <Link 
                    href="/" 
                    className="text-white hover:text-theme-light-gray transition-colors text-sm"
                  >
                    Início
                  </Link>
                  <Link 
                    href="/categories" 
                    className="text-theme-light-gray hover:text-white transition-colors text-sm"
                  >
                    Categorias
                  </Link>
                  <Link 
                    href="/my-books" 
                    className="text-theme-light-gray hover:text-white transition-colors text-sm"
                  >
                    Meus Livros
                  </Link>
                  <Link 
                    href="/favorites" 
                    className="text-theme-light-gray hover:text-white transition-colors text-sm"
                  >
                    Favoritos
                  </Link>
                </nav>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isLoggedIn ? (
                <>
                  {/* Search - Only show when logged in */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="text-theme-light-gray hover:text-white transition-colors p-2 relative"
                    aria-label="Abrir busca"
                  >
                    <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Notifications - Only show when logged in */}
                  <button
                    onClick={() => setIsNotificationsOpen(true)}
                    className="text-theme-light-gray hover:text-white transition-colors p-2 relative"
                    aria-label="Notificações"
                  >
                    <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    {/* Notification Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-theme-secondary text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* User Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="hidden md:block text-right">
                        <p className="text-white text-sm font-medium">{user?.name || 'Usuário'}</p>
                        <p className="text-theme-light-gray text-xs capitalize">{user?.subscription_tier || 'Basic'}</p>
                      </div>
                      
                      <button 
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-theme-primary rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm hover:bg-theme-primary-dark transition-colors relative"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        aria-label="Menu do usuário"
                      >
                        {getUserInitials()}
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-theme-accent rounded-full border-2 border-theme-black" />
                      </button>
                    </div>

                    {/* Profile Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-theme-dark-gray border border-theme-medium-gray rounded-oursbook shadow-lg z-50">
                        <div className="py-2">
                          {/* Profile Option */}
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-white hover:bg-theme-medium-gray transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Perfil
                          </Link>

                          {/* Settings Option */}
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm text-white hover:bg-theme-medium-gray transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Configurações
                          </Link>

                          {/* Admin Panel Option - Only show if user is admin */}
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center px-4 py-2 text-sm text-theme-secondary hover:bg-theme-medium-gray transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Painel Admin
                            </Link>
                          )}

                          {/* Divider */}
                          <div className="border-t border-theme-medium-gray my-2"></div>

                          {/* Logout Option */}
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-theme-light-gray hover:text-white hover:bg-theme-medium-gray transition-colors"
                            onClick={handleLogout}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Login/Register Buttons for non-authenticated users */
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Cadastrar
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button - Only show when logged in */}
              {isLoggedIn && (
                <button 
                  className="lg:hidden text-theme-light-gray hover:text-white p-2"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isLoggedIn && (
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Search Modal - Only show when logged in */}
      {isLoggedIn && (
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
      )}

      {/* Notification System - Only show when logged in */}
      {isLoggedIn && (
        <NotificationSystem
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}
    </>
  );
}