'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter, useSearchParams } from 'next/navigation';

type Panel = 'hero' | 'login' | 'register';

// ─── Login Form ───────────────────────────────────────────────────────────────
interface LoginFormProps {
  onSwitch: (p: Panel) => void;
}
function LoginForm({ onSwitch }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useUser();
  const { toast } = useToast();
  const [data, setData] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email.trim() || !data.password.trim()) { toast.error('Preencha todos os campos'); return; }
    setSubmitting(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) { toast.success(result.message); router.push('/'); }
      else toast.error(result.message);
    } catch { toast.error('Erro inesperado.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-theme-dark-gray rounded-2xl p-8 shadow-2xl border border-theme-medium-gray/30 w-full">
      <h2 className="text-2xl font-bold text-white mb-1">Entrar na sua conta</h2>
      <p className="text-theme-light-gray text-sm mb-6">Bem-vindo de volta!</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-1.5">Email</label>
          <Input name="email" type="email" placeholder="seu@email.com"
            value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-1.5">Senha</label>
          <div className="relative">
            <Input name="password" type={showPw ? 'text' : 'password'} placeholder="Sua senha"
              value={data.password} onChange={e => setData(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-light-gray hover:text-white">
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting || isLoading}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-5 text-center space-y-2">
        <p className="text-theme-light-gray text-sm">
          Não tem conta?{' '}
          <button onClick={() => onSwitch('register')} className="text-theme-primary hover:underline font-medium">
            Cadastre-se grátis
          </button>
        </p>
        <button onClick={() => onSwitch('hero')} className="text-theme-light-gray hover:text-white text-xs">
          ← Voltar
        </button>
      </div>

      <div className="mt-5 p-3 bg-theme-medium-gray/50 rounded-lg border border-theme-medium-gray/30">
        <p className="text-xs text-theme-light-gray text-center mb-1 font-medium">Contas de teste</p>
        <p className="text-xs text-theme-light-gray text-center">
          admin@oursbook.com · admin123<br />
          user@oursbook.com · user123
        </p>
      </div>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
interface RegisterFormProps {
  onSwitch: (p: Panel) => void;
}
function RegisterForm({ onSwitch }: RegisterFormProps) {
  const router = useRouter();
  const { register, isLoading } = useUser();
  const { toast } = useToast();
  const [data, setData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.email.trim() || !data.password.trim()) {
      toast.error('Preencha todos os campos obrigatórios'); return;
    }
    if (data.password !== data.confirmPassword) { toast.error('As senhas não coincidem'); return; }
    if (data.password.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
    if (data.username.trim() && !/^@[a-zA-Z0-9._-]+$/.test(data.username)) {
      toast.error('Username inválido. Deve começar com @'); return;
    }
    setSubmitting(true);
    try {
      const result = await register(data.name, data.email, data.password, data.username.trim() || undefined);
      if (result.success) { toast.success(result.message); router.push('/'); }
      else toast.error(result.message);
    } catch { toast.error('Erro inesperado.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-theme-dark-gray rounded-2xl p-8 shadow-2xl border border-theme-medium-gray/30 w-full">
      <h2 className="text-2xl font-bold text-white mb-1">Criar sua conta</h2>
      <p className="text-theme-light-gray text-sm mb-6">Junte-se a milhares de leitores</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-white text-sm font-medium mb-1.5">Nome Completo</label>
          <Input name="name" type="text" placeholder="Seu nome completo"
            value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-white text-sm font-medium mb-1.5">
              Username <span className="text-theme-light-gray text-xs">(opcional)</span>
            </label>
            <Input name="username" type="text" placeholder="@username"
              value={data.username} onChange={e => setData(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-1.5">Email</label>
            <Input name="email" type="email" placeholder="seu@email.com"
              value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-white text-sm font-medium mb-1.5">Senha</label>
            <div className="relative">
              <Input name="password" type={showPw ? 'text' : 'password'} placeholder="Mín. 6 caracteres"
                value={data.password} onChange={e => setData(p => ({ ...p, password: e.target.value }))}
                required minLength={6} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-light-gray hover:text-white text-sm">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-1.5">Confirmar</label>
            <div className="relative">
              <Input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repita a senha"
                value={data.confirmPassword} onChange={e => setData(p => ({ ...p, confirmPassword: e.target.value }))}
                required />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-light-gray hover:text-white text-sm">
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        {data.password && (
          <div className="space-y-1">
            <PasswordStrength password={data.password} />
            {data.confirmPassword && data.password !== data.confirmPassword && (
              <p className="text-red-400 text-xs">As senhas não coincidem</p>
            )}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting || isLoading}>
          {submitting ? 'Criando conta...' : 'Criar Conta'}
        </Button>
      </form>

      <div className="mt-5 text-center space-y-2">
        <p className="text-theme-light-gray text-sm">
          Já tem conta?{' '}
          <button onClick={() => onSwitch('login')} className="text-theme-primary hover:underline font-medium">
            Faça login
          </button>
        </p>
        <button onClick={() => onSwitch('hero')} className="text-theme-light-gray hover:text-white text-xs">
          ← Voltar
        </button>
      </div>
    </div>
  );
}

// ─── Hero Panel ───────────────────────────────────────────────────────────────
function HeroPanel() {
  return (
    <div className="bg-gradient-to-br from-theme-primary to-theme-primary-dark rounded-2xl p-8 shadow-2xl w-full">
      <div className="text-center text-white space-y-6">
        <div className="text-6xl">📚</div>
        <h3 className="text-2xl font-bold">Interface Moderna e Intuitiva</h3>
        <p className="text-lg opacity-90">Navegue por sua biblioteca com uma experiência única e personalizada</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { icon: '🎯', label: 'Recomendações Inteligentes' },
            { icon: '☁️', label: 'Sync na Nuvem' },
            { icon: '📱', label: 'Multi-dispositivo' },
            { icon: '🔍', label: 'Busca Avançada' },
          ].map(f => (
            <div key={f.label} className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const searchParams = useSearchParams();
  const [panel, setPanel] = useState<Panel>('hero');

  useEffect(() => {
    const p = searchParams.get('panel');
    if (p === 'register') setPanel('register');
    else if (p === 'login') setPanel('login');
  }, [searchParams]);

  const features = [
    { icon: '📚', title: 'Biblioteca Infinita', description: 'Acesse milhares de livros digitais em diversos formatos.' },
    { icon: '🎯', title: 'Experiência Personalizada', description: 'Recomendações baseadas no seu histórico de leitura.' },
    { icon: '☁️', title: 'Sincronização na Nuvem', description: 'Progresso sincronizado em todos os seus dispositivos.' },
    { icon: '👥', title: 'Comunidade de Leitores', description: 'Compartilhe resenhas e descubra novos títulos.' },
    { icon: '🔍', title: 'Busca Inteligente', description: 'Encontre qualquer livro por título, autor ou gênero.' },
    { icon: '📱', title: 'Multiplataforma', description: 'Leia em qualquer dispositivo com sincronização automática.' },
  ];

  return (
    <div className="min-h-screen bg-theme-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-black/95 backdrop-blur-sm border-b border-theme-medium-gray/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-primary-dark rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-theme-primary text-2xl font-bold tracking-tight">OursBook</span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setPanel(p => p === 'login' ? 'hero' : 'login')}
                className="text-white hover:text-theme-primary transition-colors text-sm font-medium">
                Entrar
              </button>
              <Button variant="primary" size="sm" onClick={() => setPanel(p => p === 'register' ? 'hero' : 'register')}>
                Cadastrar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-theme-primary via-transparent to-theme-primary" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Sua biblioteca
                  <span className="text-theme-primary block">digital perfeita</span>
                </h1>
                <p className="text-xl text-theme-light-gray leading-relaxed">
                  Descubra, leia e gerencie milhares de livros digitais com uma experiência única e moderna.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto"
                  onClick={() => setPanel('register')}>
                  🚀 Começar Gratuitamente
                </Button>
                <Button variant="secondary" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto"
                  onClick={() => setPanel('login')}>
                  📖 Já tenho conta
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-theme-medium-gray">
                <div className="text-center">
                  <div className="text-3xl font-bold text-theme-primary">10K+</div>
                  <div className="text-sm text-theme-light-gray">Livros Disponíveis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-theme-primary">5K+</div>
                  <div className="text-sm text-theme-light-gray">Leitores Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-theme-primary">99%</div>
                  <div className="text-sm text-theme-light-gray">Satisfação</div>
                </div>
              </div>
            </div>

            {/* Right — stable components, não recriados a cada render */}
            <div className="w-full">
              {panel === 'login' && <LoginForm onSwitch={setPanel} />}
              {panel === 'register' && <RegisterForm onSwitch={setPanel} />}
              {panel === 'hero' && <HeroPanel />}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-theme-dark-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Por que escolher o OursBook?</h2>
            <p className="text-xl text-theme-light-gray max-w-3xl mx-auto">
              Uma plataforma completa que revoluciona a forma como você consome literatura digital
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-theme-black rounded-oursbook p-6 hover:bg-theme-medium-gray transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-theme-light-gray leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-theme-primary to-theme-primary-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para começar sua jornada literária?</h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de leitores que já descobriram uma nova forma de consumir literatura digital
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4 bg-white text-theme-primary hover:bg-gray-100"
              onClick={() => { setPanel('register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              🚀 Criar Conta Grátis
            </Button>
            <Button variant="ghost" size="lg" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-theme-primary"
              onClick={() => { setPanel('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              📖 Já tenho conta
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-black py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-primary-dark rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-theme-primary text-xl font-bold">OursBook</span>
              </div>
              <p className="text-theme-light-gray text-sm">A plataforma de livros digitais que revoluciona sua experiência de leitura.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-theme-light-gray text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-theme-light-gray text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-theme-light-gray text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-theme-medium-gray mt-8 pt-8 text-center text-theme-light-gray text-sm">
            <p>&copy; 2024 OursBook. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
