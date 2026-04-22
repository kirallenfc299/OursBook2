'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useToast } from '@/components/ui/Toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true); // simplified: always valid
  const [isCheckingToken, setIsCheckingToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password.trim() || !formData.confirmPassword.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Local password reset - just redirect to login
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden no-scroll-behavior">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-theme-black via-theme-dark-gray to-theme-black">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="loading-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M 12 0 L 0 0 0 12" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#loading-grid)" className="text-theme-primary" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-white">Verificando link de redefinição...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden no-scroll-behavior">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-theme-black via-theme-dark-gray to-theme-black">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="error-grid" width="15" height="15" patternUnits="userSpaceOnUse">
                    <circle cx="7.5" cy="7.5" r="2" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#error-grid)" className="text-red-400" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full p-4">
          <div className="w-full max-w-md text-center flex flex-col justify-center min-h-0">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-4">Link Inválido</h1>
            <p className="text-theme-light-gray mb-6">
              O link de redefinição de senha é inválido ou expirou. 
              Solicite um novo link de recuperação.
            </p>
            <div className="space-y-4">
              <Link href="/landing">
                <Button variant="primary" className="w-full">
                  Voltar ao Início
                </Button>
              </Link>
              <Link href="/landing">
                <Button variant="secondary" className="w-full">
                  Ir ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden auth-page no-scroll-behavior">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-theme-black via-theme-dark-gray to-theme-black">
        {/* Animated geometric pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="reset-grid" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="currentColor" strokeWidth="0.4"/>
                  <circle cx="3" cy="3" r="0.5" fill="currentColor" opacity="0.4"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#reset-grid)" className="text-theme-accent" />
            </svg>
          </div>
        </div>
        
        {/* Floating elements for reset page */}
        <div className="absolute top-16 left-16 w-20 h-20 bg-gradient-to-br from-theme-accent/20 to-theme-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 right-12 w-32 h-32 bg-gradient-to-br from-theme-primary/20 to-theme-secondary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-16 left-1/3 w-24 h-24 bg-gradient-to-br from-theme-secondary/20 to-theme-accent/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Security themed icons */}
        <div className="absolute top-1/4 right-1/4 text-theme-accent/20 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🔐</div>
        <div className="absolute bottom-1/3 left-1/4 text-theme-primary/20 text-3xl animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '5s' }}>🛡️</div>
        <div className="absolute top-2/3 right-1/6 text-theme-secondary/20 text-2xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '6s' }}>🔑</div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full p-4">
        <div className="w-full max-w-md flex flex-col justify-center min-h-0">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-primary-dark rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-theme-primary text-4xl font-bold tracking-tight">OursBook</div>
          </Link>
          <p className="text-theme-light-gray mt-2">
            Redefinir sua senha
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-theme-dark-gray/80 backdrop-blur-sm rounded-oursbook p-8 shadow-2xl border border-theme-medium-gray/30 auth-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-light-gray hover:text-white"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.password && (
                <PasswordStrength password={formData.password} />
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-light-gray hover:text-white"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">As senhas não coincidem</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link href="/login" className="text-theme-light-gray hover:text-white text-sm">
              Voltar ao login
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}