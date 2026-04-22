'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const getStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate score
    if (checks.length) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.special) score += 1;

    return { score, checks };
  };

  const { score, checks } = getStrength(password);

  const getStrengthText = (score: number) => {
    if (score === 0) return { text: '', color: '' };
    if (score <= 2) return { text: 'Fraca', color: 'text-red-500' };
    if (score <= 3) return { text: 'Média', color: 'text-yellow-500' };
    if (score <= 4) return { text: 'Forte', color: 'text-green-500' };
    return { text: 'Muito Forte', color: 'text-green-400' };
  };

  const strengthInfo = getStrengthText(score);

  if (!password) return null;

  return (
    <div className={cn('mt-2 space-y-2', className)}>
      {/* Strength Bar */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              score >= level
                ? score <= 2
                  ? 'bg-red-500'
                  : score <= 3
                  ? 'bg-yellow-500'
                  : score <= 4
                  ? 'bg-green-500'
                  : 'bg-green-400'
                : 'bg-oursbook-medium-gray'
            )}
          />
        ))}
      </div>

      {/* Strength Text */}
      {strengthInfo.text && (
        <p className={cn('text-sm font-medium', strengthInfo.color)}>
          Força da senha: {strengthInfo.text}
        </p>
      )}

      {/* Requirements */}
      <div className="text-xs space-y-1">
        <div className={cn('flex items-center space-x-2', checks.length ? 'text-green-400' : 'text-oursbook-light-gray')}>
          <span>{checks.length ? '✓' : '○'}</span>
          <span>Pelo menos 6 caracteres</span>
        </div>
        <div className={cn('flex items-center space-x-2', checks.lowercase ? 'text-green-400' : 'text-oursbook-light-gray')}>
          <span>{checks.lowercase ? '✓' : '○'}</span>
          <span>Letra minúscula</span>
        </div>
        <div className={cn('flex items-center space-x-2', checks.uppercase ? 'text-green-400' : 'text-oursbook-light-gray')}>
          <span>{checks.uppercase ? '✓' : '○'}</span>
          <span>Letra maiúscula</span>
        </div>
        <div className={cn('flex items-center space-x-2', checks.numbers ? 'text-green-400' : 'text-oursbook-light-gray')}>
          <span>{checks.numbers ? '✓' : '○'}</span>
          <span>Número</span>
        </div>
        <div className={cn('flex items-center space-x-2', checks.special ? 'text-green-400' : 'text-oursbook-light-gray')}>
          <span>{checks.special ? '✓' : '○'}</span>
          <span>Caractere especial</span>
        </div>
      </div>
    </div>
  );
}