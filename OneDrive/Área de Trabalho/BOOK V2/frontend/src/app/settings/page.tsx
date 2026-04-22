'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    // Account Settings
    notifications: {
      email: true,
      push: true,
      newBooks: true,
      recommendations: false,
      social: true,
      marketing: false
    },
    // Reading Preferences
    reading: {
      autoBookmark: true,
      nightMode: false,
      fontSize: 'medium',
      fontFamily: 'serif',
      pageAnimation: true,
      autoPlay: false
    },
    // Privacy Settings
    privacy: {
      profileVisibility: 'public',
      readingActivity: true,
      showFavorites: true,
      allowMessages: true,
      showOnlineStatus: true
    },
    // Language & Region
    language: {
      interface: 'pt-BR',
      content: 'all',
      timezone: 'America/Sao_Paulo'
    }
  });

  const tabs = [
    { id: 'account', name: 'Conta', icon: '👤' },
    { id: 'theme', name: 'Tema', icon: '🎨' },
    { id: 'notifications', name: 'Notificações', icon: '🔔' },
    { id: 'reading', name: 'Leitura', icon: '📖' },
    { id: 'privacy', name: 'Privacidade', icon: '🔒' },
    { id: 'language', name: 'Idioma', icon: '🌐' }
  ];

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implementar salvamento real
    console.log('Configurações salvas:', settings);
    alert('Configurações salvas com sucesso!');
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void; 
    label: string; 
    description?: string; 
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-white font-medium">{label}</div>
        {description && (
          <div className="text-theme-light-gray text-sm mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-theme-primary' : 'bg-theme-medium-gray'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectField = ({ 
    label, 
    value, 
    options, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    options: { value: string; label: string }[]; 
    onChange: (value: string) => void; 
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-theme-light-gray mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-theme-medium-gray border border-theme-light-gray text-white rounded-oursbook px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-black">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container-oursbook">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
            <p className="text-theme-light-gray">
              Personalize sua experiência no OursBook
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="bg-theme-dark-gray rounded-oursbook p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-oursbook text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-theme-primary text-white'
                          : 'text-theme-light-gray hover:bg-theme-medium-gray hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-theme-dark-gray rounded-oursbook p-6">
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Configurações da Conta</h2>
                    <div className="space-y-6">
                      <Input
                        label="Nome de Usuário"
                        defaultValue="joao.silva"
                        placeholder="Seu nome de usuário"
                      />
                      <Input
                        label="Email"
                        type="email"
                        defaultValue="joao.silva@email.com"
                        placeholder="Seu email"
                      />
                      <div>
                        <label className="block text-sm font-medium text-netflix-light-gray mb-2">
                          Alterar Senha
                        </label>
                        <div className="space-y-3">
                          <Input
                            type="password"
                            placeholder="Senha atual"
                          />
                          <Input
                            type="password"
                            placeholder="Nova senha"
                          />
                          <Input
                            type="password"
                            placeholder="Confirmar nova senha"
                          />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-theme-medium-gray">
                        <h3 className="text-lg font-semibold text-white mb-4">Zona de Perigo</h3>
                        <div className="space-y-3">
                          <Button variant="secondary" size="sm">
                            Exportar Dados
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 border-red-400 hover:bg-red-400">
                            Excluir Conta
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Theme Settings */}
                {activeTab === 'theme' && (
                  <div>
                    <ThemeSelector />
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Notificações</h2>
                    <div className="space-y-1">
                      <ToggleSwitch
                        checked={settings.notifications.email}
                        onChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                        label="Notificações por Email"
                        description="Receba atualizações importantes por email"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.push}
                        onChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                        label="Notificações Push"
                        description="Receba notificações no navegador"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.newBooks}
                        onChange={(checked) => handleSettingChange('notifications', 'newBooks', checked)}
                        label="Novos Livros"
                        description="Seja notificado quando novos livros forem adicionados"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.recommendations}
                        onChange={(checked) => handleSettingChange('notifications', 'recommendations', checked)}
                        label="Recomendações"
                        description="Receba sugestões personalizadas de livros"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.social}
                        onChange={(checked) => handleSettingChange('notifications', 'social', checked)}
                        label="Atividade Social"
                        description="Notificações sobre seguidores e atividades de amigos"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.marketing}
                        onChange={(checked) => handleSettingChange('notifications', 'marketing', checked)}
                        label="Marketing"
                        description="Receba ofertas especiais e promoções"
                      />
                    </div>
                  </div>
                )}

                {/* Reading Preferences */}
                {activeTab === 'reading' && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Preferências de Leitura</h2>
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <ToggleSwitch
                          checked={settings.reading.autoBookmark}
                          onChange={(checked) => handleSettingChange('reading', 'autoBookmark', checked)}
                          label="Marcador Automático"
                          description="Salvar automaticamente o progresso de leitura"
                        />
                        <ToggleSwitch
                          checked={settings.reading.nightMode}
                          onChange={(checked) => handleSettingChange('reading', 'nightMode', checked)}
                          label="Modo Noturno"
                          description="Ativar tema escuro para leitura noturna"
                        />
                        <ToggleSwitch
                          checked={settings.reading.pageAnimation}
                          onChange={(checked) => handleSettingChange('reading', 'pageAnimation', checked)}
                          label="Animações de Página"
                          description="Efeitos visuais ao virar páginas"
                        />
                        <ToggleSwitch
                          checked={settings.reading.autoPlay}
                          onChange={(checked) => handleSettingChange('reading', 'autoPlay', checked)}
                          label="Reprodução Automática"
                          description="Iniciar audiobooks automaticamente"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                          label="Tamanho da Fonte"
                          value={settings.reading.fontSize}
                          options={[
                            { value: 'small', label: 'Pequena' },
                            { value: 'medium', label: 'Média' },
                            { value: 'large', label: 'Grande' },
                            { value: 'xlarge', label: 'Extra Grande' }
                          ]}
                          onChange={(value) => handleSettingChange('reading', 'fontSize', value)}
                        />
                        <SelectField
                          label="Família da Fonte"
                          value={settings.reading.fontFamily}
                          options={[
                            { value: 'serif', label: 'Serif' },
                            { value: 'sans-serif', label: 'Sans Serif' },
                            { value: 'monospace', label: 'Monospace' }
                          ]}
                          onChange={(value) => handleSettingChange('reading', 'fontFamily', value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Privacidade</h2>
                    <div className="space-y-6">
                      <SelectField
                        label="Visibilidade do Perfil"
                        value={settings.privacy.profileVisibility}
                        options={[
                          { value: 'public', label: 'Público' },
                          { value: 'friends', label: 'Apenas Amigos' },
                          { value: 'private', label: 'Privado' }
                        ]}
                        onChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                      />
                      
                      <div className="space-y-1">
                        <ToggleSwitch
                          checked={settings.privacy.readingActivity}
                          onChange={(checked) => handleSettingChange('privacy', 'readingActivity', checked)}
                          label="Atividade de Leitura"
                          description="Permitir que outros vejam o que você está lendo"
                        />
                        <ToggleSwitch
                          checked={settings.privacy.showFavorites}
                          onChange={(checked) => handleSettingChange('privacy', 'showFavorites', checked)}
                          label="Mostrar Favoritos"
                          description="Exibir seus livros favoritos no perfil"
                        />
                        <ToggleSwitch
                          checked={settings.privacy.allowMessages}
                          onChange={(checked) => handleSettingChange('privacy', 'allowMessages', checked)}
                          label="Permitir Mensagens"
                          description="Receber mensagens de outros usuários"
                        />
                        <ToggleSwitch
                          checked={settings.privacy.showOnlineStatus}
                          onChange={(checked) => handleSettingChange('privacy', 'showOnlineStatus', checked)}
                          label="Status Online"
                          description="Mostrar quando você está online"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Language & Region */}
                {activeTab === 'language' && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Idioma e Região</h2>
                    <div className="space-y-4">
                      <SelectField
                        label="Idioma da Interface"
                        value={settings.language.interface}
                        options={[
                          { value: 'pt-BR', label: 'Português (Brasil)' },
                          { value: 'en-US', label: 'English (US)' },
                          { value: 'es-ES', label: 'Español' },
                          { value: 'fr-FR', label: 'Français' }
                        ]}
                        onChange={(value) => handleSettingChange('language', 'interface', value)}
                      />
                      <SelectField
                        label="Preferência de Conteúdo"
                        value={settings.language.content}
                        options={[
                          { value: 'all', label: 'Todos os idiomas' },
                          { value: 'pt', label: 'Apenas Português' },
                          { value: 'en', label: 'Apenas Inglês' },
                          { value: 'pt-en', label: 'Português e Inglês' }
                        ]}
                        onChange={(value) => handleSettingChange('language', 'content', value)}
                      />
                      <SelectField
                        label="Fuso Horário"
                        value={settings.language.timezone}
                        options={[
                          { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
                          { value: 'America/New_York', label: 'Nova York (GMT-5)' },
                          { value: 'Europe/London', label: 'Londres (GMT+0)' },
                          { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)' }
                        ]}
                        onChange={(value) => handleSettingChange('language', 'timezone', value)}
                      />
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-theme-medium-gray mt-8">
                  <div className="space-x-3">
                    <Button variant="secondary" size="sm">
                      Cancelar
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveSettings}>
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}