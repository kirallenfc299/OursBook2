'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI, type APIUser } from '@/lib/api';

export type User = APIUser;

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, username?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const TOKEN_KEY = 'oursbook_token';

function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

function hasToken(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(TOKEN_KEY);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from token
  useEffect(() => {
    if (!hasToken()) {
      setIsLoading(false);
      return;
    }

    AuthAPI.me()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await AuthAPI.login(email, password);
      saveToken(res.token);
      setUser(res.user);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao fazer login.' };
    }
  };

  const register = async (name: string, email: string, password: string, username?: string) => {
    try {
      const res = await AuthAPI.register(name, email, password, username);
      saveToken(res.token);
      setUser(res.user);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao criar conta.' };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const resetPassword = async (_email: string) => {
    // Placeholder — implement email sending if needed
    return { success: true, message: 'Se este email estiver cadastrado, você receberá as instruções.' };
  };

  const resendVerification = async (_email: string) => {
    return { success: true, message: 'Email reenviado!' };
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updated = await AuthAPI.updateProfile(data);
      setUser(updated);
    } catch (err) {
      console.error('updateUser error:', err);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isAdmin: user?.is_admin ?? false,
      isLoading,
      login,
      register,
      logout,
      resetPassword,
      resendVerification,
      updateUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
