'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useUser();

  // Handle redirect in useEffect to avoid render-phase setState
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

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

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Grátis',
      priceValue: 0,
      features: [
        'Acesso a livros básicos',
        'Leitura online',
        'Marcadores automáticos',
        'Suporte por email'
      ],
      color: 'from-gray-600 to-gray-800',
      current: user.subscription_tier === 'basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 19,90',
      priceValue: 19.90,
      period: '/mês',
      features: [
        'Todos os recursos do Basic',
        'Acesso ilimitado a todos os livros',
        'Download para leitura offline',
        'Sem anúncios',
        'Recomendações personalizadas',
        'Suporte prioritário'
      ],
      color: 'from-theme-primary to-theme-primary-dark',
      popular: true,
      current: user.subscription_tier === 'premium'
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 'R$ 39,90',
      priceValue: 39.90,
      period: '/mês',
      features: [
        'Todos os recursos do Premium',
        'Acesso antecipado a novos lançamentos',
        'Audiobooks inclusos',
        'Compartilhamento familiar (até 5 pessoas)',
        'Estatísticas avançadas de leitura',
        'Suporte VIP 24/7',
        'Badge exclusivo de membro Ultimate'
      ],
      color: 'from-yellow-600 to-yellow-800',
      current: user.subscription_tier === 'ultimate'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === user.subscription_tier) {
      return; // Already on this plan
    }
    
    // TODO: Implement payment flow
    alert(`Funcionalidade de pagamento em desenvolvimento.\n\nPlano selecionado: ${planId}`);
  };

  const handleCancelSubscription = () => {
    if (user.subscription_tier === 'basic') {
      alert('Você já está no plano gratuito.');
      return;
    }
    
    const confirmed = confirm('Tem certeza que deseja cancelar sua assinatura?\n\nVocê continuará tendo acesso até o final do período pago.');
    if (confirmed) {
      // TODO: Implement cancellation
      alert('Funcionalidade de cancelamento em desenvolvimento.');
    }
  };

  return (
    <div className="min-h-screen bg-theme-black">
      <Header />

      <main className="pt-20 pb-16">
        <div className="container-oursbook">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Gerenciar Assinatura</h1>
            <p className="text-theme-light-gray text-lg">
              Escolha o plano ideal para sua experiência de leitura
            </p>
          </div>

          {/* Current Plan Info */}
          <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Plano Atual</h3>
                <p className="text-theme-light-gray text-sm">
                  Você está no plano <span className="text-theme-primary font-semibold">{user.subscription_tier.toUpperCase()}</span>
                </p>
              </div>
              {user.subscription_tier !== 'basic' && (
                <Button variant="ghost" size="sm" onClick={handleCancelSubscription}>
                  Cancelar Assinatura
                </Button>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-theme-dark-gray rounded-oursbook p-8 border ${
                  plan.current
                    ? 'border-theme-primary shadow-lg shadow-theme-primary/20'
                    : 'border-theme-medium-gray/30'
                } ${plan.popular ? 'md:scale-105' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-theme-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {plan.current && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ✓ ATIVO
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <span className="text-2xl">
                      {plan.id === 'basic' ? '📚' : plan.id === 'premium' ? '⭐' : '👑'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-white mb-1">
                    {plan.price}
                    {plan.period && <span className="text-lg text-theme-light-gray">{plan.period}</span>}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-theme-light-gray text-sm">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  variant={plan.current ? 'secondary' : plan.popular ? 'primary' : 'ghost'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.current}
                >
                  {plan.current ? 'Plano Atual' : plan.id === 'basic' ? 'Downgrade' : 'Fazer Upgrade'}
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Perguntas Frequentes</h2>
            <div className="space-y-4">
              <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
                <h3 className="text-white font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-theme-light-gray text-sm">
                  Sim! Você pode cancelar sua assinatura a qualquer momento. Você continuará tendo acesso aos recursos premium até o final do período pago.
                </p>
              </div>
              <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
                <h3 className="text-white font-semibold mb-2">Como funciona o compartilhamento familiar?</h3>
                <p className="text-theme-light-gray text-sm">
                  No plano Ultimate, você pode adicionar até 5 membros da família para compartilhar sua assinatura. Cada membro terá sua própria conta e biblioteca personalizada.
                </p>
              </div>
              <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray/30">
                <h3 className="text-white font-semibold mb-2">Posso fazer upgrade ou downgrade do meu plano?</h3>
                <p className="text-theme-light-gray text-sm">
                  Sim! Você pode alterar seu plano a qualquer momento. O upgrade é imediato, e o downgrade entra em vigor no próximo ciclo de cobrança.
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <Button variant="secondary" onClick={() => router.push('/profile')}>
              Voltar ao Perfil
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
