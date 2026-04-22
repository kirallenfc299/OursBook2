'use client';

import React from 'react';
import { useTheme, type ThemeType } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const getThemePreview = (themeId: ThemeType) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (!theme) return null;

    return (
      <div className="flex space-x-1">
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Tema da Plataforma</h3>
      <p className="text-theme-light-gray text-sm mb-6">
        Escolha o tema visual que mais combina com você. A mudança será aplicada imediatamente.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              'p-4 rounded-oursbook border-2 transition-all duration-200 text-left',
              currentTheme === theme.id
                ? 'border-theme-primary bg-theme-primary/10'
                : 'border-theme-medium-gray hover:border-theme-light-gray bg-theme-dark-gray/50'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getThemePreview(theme.id)}
                <div>
                  <h4 className="font-medium text-white">{theme.name}</h4>
                  <p className="text-sm text-theme-light-gray">{theme.description}</p>
                </div>
              </div>
              {currentTheme === theme.id && (
                <div className="w-5 h-5 rounded-full bg-theme-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Theme Preview */}
            <div className="flex space-x-2 mb-2">
              <div 
                className="flex-1 h-2 rounded"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div 
                className="flex-1 h-2 rounded"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <div 
                className="flex-1 h-2 rounded"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </div>
            
            <div className="text-xs text-theme-light-gray">
              {theme.id === 'oursbook' && '🔵 Padrão'}
              {theme.id === 'netflix' && '🔴 Clássico'}
              {theme.id === 'spotify' && '🟢 Vibrante'}
              {theme.id === 'crunchyroll' && '🟠 Energético'}
              {theme.id === 'deezer' && '⚫ Elegante'}
              {theme.id === 'apple' && '⚪ Minimalista'}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-theme-dark-gray/50 rounded-oursbook border border-theme-medium-gray">
        <h4 className="font-medium text-white mb-2">💡 Dica</h4>
        <p className="text-sm text-theme-light-gray">
          O tema escolhido será salvo automaticamente e aplicado em todas as páginas da plataforma. 
          Você pode alterá-lo a qualquer momento.
        </p>
      </div>
    </div>
  );
}