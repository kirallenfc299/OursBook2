'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'oursbook' | 'netflix' | 'spotify' | 'crunchyroll' | 'deezer' | 'apple';

interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    accent: string;
    accentDark: string;
    black: string;
    darkGray: string;
    mediumGray: string;
    lightGray: string;
    white: string;
  };
}

export const themes: Record<ThemeType, Theme> = {
  oursbook: {
    id: 'oursbook',
    name: 'OursBook',
    description: 'Tema padrão azul moderno',
    colors: {
      primary: '#6366F1',
      primaryDark: '#4F46E5',
      primaryLight: '#818CF8',
      secondary: '#F59E0B',
      secondaryDark: '#D97706',
      accent: '#10B981',
      accentDark: '#059669',
      black: '#000000',
      darkGray: '#141414',
      mediumGray: '#2F2F2F',
      lightGray: '#B3B3B3',
      white: '#FFFFFF',
    }
  },
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    description: 'Tema vermelho clássico',
    colors: {
      primary: '#E50914',
      primaryDark: '#B20710',
      primaryLight: '#FF1E2D',
      secondary: '#F59E0B',
      secondaryDark: '#D97706',
      accent: '#10B981',
      accentDark: '#059669',
      black: '#000000',
      darkGray: '#141414',
      mediumGray: '#2F2F2F',
      lightGray: '#B3B3B3',
      white: '#FFFFFF',
    }
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    description: 'Tema verde vibrante',
    colors: {
      primary: '#1DB954',
      primaryDark: '#1AA34A',
      primaryLight: '#1ED760',
      secondary: '#F59E0B',
      secondaryDark: '#D97706',
      accent: '#FF6B35',
      accentDark: '#E55A2B',
      black: '#000000',
      darkGray: '#121212',
      mediumGray: '#282828',
      lightGray: '#B3B3B3',
      white: '#FFFFFF',
    }
  },
  crunchyroll: {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    description: 'Tema laranja energético',
    colors: {
      primary: '#FF6500',
      primaryDark: '#E55A00',
      primaryLight: '#FF7A1A',
      secondary: '#F59E0B',
      secondaryDark: '#D97706',
      accent: '#10B981',
      accentDark: '#059669',
      black: '#000000',
      darkGray: '#141414',
      mediumGray: '#2F2F2F',
      lightGray: '#B3B3B3',
      white: '#FFFFFF',
    }
  },
  deezer: {
    id: 'deezer',
    name: 'Deezer',
    description: 'Tema preto elegante',
    colors: {
      primary: '#32323D',
      primaryDark: '#28282F',
      primaryLight: '#3C3C4B',
      secondary: '#FEAA2D',
      secondaryDark: '#E5971A',
      accent: '#A238FF',
      accentDark: '#8B2CE6',
      black: '#000000',
      darkGray: '#0F0F0F',
      mediumGray: '#1A1A1A',
      lightGray: '#B3B3B3',
      white: '#FFFFFF',
    }
  },
  apple: {
    id: 'apple',
    name: 'Apple Music',
    description: 'Tema branco minimalista',
    colors: {
      primary: '#FA2D48',
      primaryDark: '#E1253E',
      primaryLight: '#FB4A63',
      secondary: '#007AFF',
      secondaryDark: '#0056CC',
      accent: '#30D158',
      accentDark: '#28B946',
      black: '#1C1C1E',
      darkGray: '#F2F2F7',
      mediumGray: '#E5E5EA',
      lightGray: '#8E8E93',
      white: '#FFFFFF',
    }
  }
};

interface ThemeContextType {
  currentTheme: ThemeType;
  theme: Theme;
  setTheme: (theme: ThemeType) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('oursbook');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('oursbook-theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Update body class for theme-specific styles
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentTheme}`);
  }, [currentTheme]);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('oursbook-theme', theme);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      theme: themes[currentTheme],
      setTheme,
      availableThemes: Object.values(themes)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}