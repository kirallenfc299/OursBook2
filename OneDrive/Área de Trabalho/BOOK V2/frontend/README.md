# OursBook Frontend

Uma plataforma moderna de biblioteca digital com interface intuitiva, construída com Next.js 14 e TypeScript.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária com tema personalizado
- **React 18** - Biblioteca de interface do usuário

## 🎨 Design System

O projeto utiliza um design system moderno com:

- **Cores**: Paleta azul índigo, âmbar e verde esmeralda
- **Tipografia**: Inter como fonte principal
- **Componentes**: Biblioteca de componentes reutilizáveis
- **Animações**: Transições suaves e efeitos de hover

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── globals.css        # Estilos globais e tema personalizado
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, Modal, Loading)
│   ├── books/            # Componentes relacionados a livros
│   ├── layout/           # Componentes de layout (Header, Footer)
│   └── home/             # Componentes da página inicial
├── lib/                  # Utilitários e helpers
│   ├── utils.ts          # Funções utilitárias
│   └── mockData.ts       # Dados de exemplo
└── types/                # Definições de tipos TypeScript
    └── index.ts          # Tipos principais
```

## 🧩 Componentes Implementados

### Componentes Base (UI)
- **Button** - Botão com variantes (primary, secondary, ghost, outline)
- **Input** - Campo de entrada com suporte a ícones e validação
- **Modal** - Modal responsivo com overlay e animações
- **Loading** - Componentes de carregamento (spinner, dots, skeleton)

### Componentes de Livros
- **BookCard** - Card de livro com expansão no hover
- **BookCarousel** - Carrossel horizontal moderno com navegação

### Componentes de Layout
- **Header** - Cabeçalho com navegação, busca e perfil do usuário
- **HeroSection** - Seção principal com livro em destaque

## 🎯 Funcionalidades Implementadas

### Interface Moderna ✅
- [x] Carrosséis horizontais com navegação por setas
- [x] Cards de livros com expansão no hover
- [x] Seção hero com livros em destaque
- [x] Design responsivo
- [x] Tema escuro moderno

### Componentes Base ✅
- [x] Sistema de componentes reutilizáveis
- [x] Tipagem TypeScript completa
- [x] Animações e transições suaves
- [x] Estados de carregamento

### Navegação e Layout ✅
- [x] Header com busca e navegação
- [x] Menu de usuário
- [x] Notificações
- [x] Footer informativo

## 🚧 Próximos Passos

### Em Desenvolvimento
- [ ] Sistema de autenticação
- [ ] Leitor de livros (PDF/EPUB)
- [ ] Backend API com Node.js/Express
- [ ] Banco de dados Supabase
- [ ] Sistema de chat em tempo real

### Planejado
- [ ] Perfil do usuário
- [ ] Sistema de favoritos
- [ ] Recomendações personalizadas
- [ ] Download offline
- [ ] Gamificação (badges, ranking)

## 🛠️ Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificar código
- `npm run lint:fix` - Corrigir problemas de lint
- `npm run type-check` - Verificar tipos TypeScript
- `npm run format` - Formatar código com Prettier

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Customização do Tema

O tema personalizado está configurado no `tailwind.config.ts` com:
- Cores personalizadas do OursBook
- Animações customizadas para carrosséis
- Componentes utilitários
- Shadows e efeitos especiais

## 📄 Licença

Este projeto é parte do desenvolvimento da plataforma OursBook.

---

**Status**: 🟢 Em desenvolvimento ativo
**Versão**: 0.1.0
**Última atualização**: Janeiro 2024