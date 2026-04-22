'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';

const URL_KEY = 'oursbook_supabase_url';
const ANON_KEY = 'oursbook_supabase_anon_key';

export default function SupabaseConfigPage() {
  const { isAdmin, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/');
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    // Load saved values
    setUrl(localStorage.getItem(URL_KEY) || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    setAnonKey(localStorage.getItem(ANON_KEY) || '');
  }, []);

  const testConnection = async () => {
    if (!url || !anonKey) {
      toast.error('Preencha a URL e a Anon Key');
      return;
    }
    setTesting(true);
    setStatus('idle');
    try {
      const res = await fetch(`${url}/rest/v1/books?select=id&limit=1`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });
      if (res.ok || res.status === 200) {
        setStatus('ok');
        toast.success('Conexão bem-sucedida!');
      } else {
        setStatus('error');
        toast.error(`Erro ${res.status}: ${res.statusText}`);
      }
    } catch (e: any) {
      setStatus('error');
      toast.error('Falha na conexão: ' + e.message);
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    localStorage.setItem(URL_KEY, url);
    localStorage.setItem(ANON_KEY, anonKey);
    toast.success('Configurações salvas! Recarregue a página para aplicar.');
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-theme-black">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configuração do Supabase</h1>
          <p className="text-theme-light-gray">
            Configure as credenciais do Supabase para carregar os livros da biblioteca.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mb-6 p-4 rounded-oursbook border border-yellow-500/30 bg-yellow-500/10">
          <h3 className="text-yellow-400 font-semibold mb-1">⚠️ Projeto Supabase pausado</h3>
          <p className="text-sm text-theme-light-gray">
            O projeto Supabase gratuito pausa automaticamente após 7 dias de inatividade.
            Para reativar:
          </p>
          <ol className="text-sm text-theme-light-gray mt-2 space-y-1 list-decimal list-inside">
            <li>Acesse <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-theme-primary underline">supabase.com/dashboard</a></li>
            <li>Selecione o projeto <strong className="text-white">rcskfvbacvlvwvegvtap</strong></li>
            <li>Clique em <strong className="text-white">"Restore project"</strong> se estiver pausado</li>
            <li>Vá em <strong className="text-white">Settings → API</strong> e copie a <strong className="text-white">anon public key</strong></li>
            <li>Cole abaixo e salve</li>
          </ol>
        </div>

        <div className="bg-theme-dark-gray rounded-oursbook p-6 border border-theme-medium-gray space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">URL do Projeto</label>
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xxxx.supabase.co"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Anon Public Key</label>
            <Input
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <p className="text-xs text-theme-light-gray mt-1">
              Encontre em: Supabase Dashboard → Settings → API → Project API keys → anon public
            </p>
          </div>

          {status === 'ok' && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
              ✅ Conexão com Supabase funcionando!
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              ❌ Falha na conexão. Verifique as credenciais.
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={testConnection} disabled={testing}>
              {testing ? 'Testando...' : '🔌 Testar Conexão'}
            </Button>
            <Button variant="primary" onClick={save}>
              💾 Salvar
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-theme-dark-gray rounded-oursbook border border-theme-medium-gray">
          <h3 className="text-white font-semibold mb-2">SQL para executar no Supabase</h3>
          <p className="text-sm text-theme-light-gray mb-3">
            Se a tabela <code className="text-theme-primary">books</code> não existir, execute este SQL no editor do Supabase:
          </p>
          <pre className="text-xs text-green-400 bg-theme-black p-3 rounded overflow-x-auto">
{`-- Habilitar leitura pública dos livros
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read books"
ON public.books FOR SELECT
USING (true);

-- Garantir permissões
GRANT SELECT ON public.books TO anon;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
