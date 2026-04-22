# OursBook Frontend - Guia Técnico

## 🏗️ Arquitetura do Projeto

### Estrutura de Componentes

```
src/components/
├── ui/                     # Componentes base reutilizáveis
│   ├── Button.tsx         # Botão com variantes Netflix
│   ├── Input.tsx          # Campo de entrada com validação
│   ├── Modal.tsx          # Modal responsivo com animações
│   ├── Loading.tsx        # Estados de carregamento
│   ├── Toast.tsx          # Sistema de notificações toast
│   └── index.ts           # Exportações centralizadas
├── books/                 # Componentes relacionados a livros
│   ├── BookCard.tsx       # Card de livro com expansão
│   ├── BookCarousel.tsx   # Carrossel horizontal Netflix
│   └── index.ts
├── layout/                # Componentes de layout
│   └── Header.tsx         # Cabeçalho com navegação
├── home/                  # Componentes da página inicial
│   └── HeroSection.tsx    # Seção principal com destaque
├── search/                # Funcionalidades de busca
│   └── SearchModal.tsx    # Modal de busca avançada
└── notifications/         # Sistema de notificações
    └── NotificationCenter.tsx
```

### Padrões de Design

#### 1. **Composição de Componentes**
```typescript
// Exemplo: Modal com composição
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>Título do Modal</h2>
  </ModalHeader>
  <ModalBody>
    <p>Conteúdo do modal</p>
  </ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Fechar</Button>
  </ModalFooter>
</Modal>
```

#### 2. **Props com Variantes**
```typescript
// Exemplo: Button com variantes
<Button variant="primary" size="lg">Ação Principal</Button>
<Button variant="secondary" size="md">Ação Secundária</Button>
<Button variant="ghost" size="sm">Ação Sutil</Button>
```

#### 3. **Hooks Customizados**
```typescript
// Exemplo: useToast hook
const { toast } = useToast();

toast.success('Livro adicionado aos favoritos!');
toast.error('Erro ao carregar livro');
toast.warning('Conexão instável');
toast.info('Nova atualização disponível');
```

## 🎨 Sistema de Design Netflix

### Paleta de Cores

```css
/* Cores principais */
--netflix-red: #E50914;
--netflix-red-dark: #B20710;
--netflix-black: #000000;
--netflix-dark-gray: #141414;
--netflix-medium-gray: #2F2F2F;
--netflix-light-gray: #B3B3B3;
--netflix-white: #FFFFFF;
```

### Tipografia

```css
/* Hierarquia de texto */
.text-6xl    /* Títulos principais (Hero) */
.text-4xl    /* Títulos de seção */
.text-2xl    /* Subtítulos */
.text-lg     /* Texto destacado */
.text-base   /* Texto padrão */
.text-sm     /* Texto secundário */
.text-xs     /* Texto auxiliar */
```

### Espaçamentos

```css
/* Sistema de espaçamento */
.space-y-12  /* Entre seções principais */
.space-y-8   /* Entre carrosséis */
.space-y-4   /* Entre elementos relacionados */
.space-y-2   /* Entre itens de lista */
```

### Animações

```css
/* Animações customizadas */
.animate-card-expand    /* Expansão de cards */
.animate-carousel-scroll /* Scroll de carrossel */
.animate-fade-in        /* Fade in suave */
.animate-slide-up       /* Slide up */
```

## 🔧 Componentes Técnicos

### BookCarousel

**Funcionalidades:**
- Scroll horizontal suave
- Navegação por setas
- Indicadores de progresso
- Responsividade automática
- Expansão de cards no hover

**Props principais:**
```typescript
interface BookCarouselProps {
  title: string;
  books: Book[];
  category?: string;
  showArrows?: boolean;
  expandOnHover?: boolean;
  className?: string;
}
```

**Uso:**
```tsx
<BookCarousel
  title="Ficção Científica"
  books={sciFiBooks}
  category="sci-fi"
  expandOnHover={true}
/>
```

### BookCard

**Funcionalidades:**
- Expansão animada no hover
- Informações detalhadas
- Botões de ação
- Estados de loading/erro
- Posicionamento inteligente

**Props principais:**
```typescript
interface BookCardProps {
  book: Book;
  isExpanded?: boolean;
  onExpand?: (bookId: string) => void;
  onCollapse?: () => void;
  position?: 'left' | 'center' | 'right';
  showExpandedContent?: boolean;
}
```

### SearchModal

**Funcionalidades:**
- Busca em tempo real com debounce
- Histórico de buscas (localStorage)
- Sugestões populares
- Filtros por categoria
- Estados de loading

**Implementação:**
```typescript
const debouncedSearch = debounce((query: string) => {
  // Lógica de busca
}, 300);
```

### NotificationCenter

**Funcionalidades:**
- Notificações em tempo real
- Filtros (todas/não lidas)
- Ações contextuais
- Persistência de estado
- Tipos de notificação

**Tipos suportados:**
- `achievement` - Conquistas e badges
- `friend_activity` - Atividade de amigos
- `system` - Atualizações do sistema
- `message` - Mensagens de chat

## 📱 Responsividade

### Breakpoints

```css
/* Mobile First */
.block          /* Mobile (< 768px) */
.md:hidden      /* Tablet (768px - 1024px) */
.lg:block       /* Desktop (> 1024px) */
```

### Grid System

```tsx
{/* Carrossel responsivo */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  {books.map(book => <BookCard key={book.id} book={book} />)}
</div>
```

### Navegação Móvel

```tsx
{/* Menu mobile */}
<nav className="hidden md:flex">
  {/* Desktop navigation */}
</nav>
<button className="md:hidden">
  {/* Mobile menu button */}
</button>
```

## 🚀 Performance

### Otimizações Implementadas

1. **Lazy Loading de Imagens**
```tsx
<Image
  src={book.coverImageUrl}
  alt={book.title}
  loading="lazy"
  sizes="(max-width: 768px) 150px, 250px"
/>
```

2. **Debounce em Buscas**
```typescript
const debouncedSearch = debounce(searchFunction, 300);
```

3. **Memoização de Componentes**
```tsx
const BookCard = React.memo(({ book, ...props }) => {
  // Component logic
});
```

4. **Code Splitting**
```tsx
const SearchModal = lazy(() => import('./SearchModal'));
```

### Métricas de Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🧪 Testing

### Estrutura de Testes

```
__tests__/
├── components/
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   ├── Modal.test.tsx
│   │   └── Loading.test.tsx
│   ├── books/
│   │   ├── BookCard.test.tsx
│   │   └── BookCarousel.test.tsx
│   └── layout/
│       └── Header.test.tsx
├── hooks/
│   └── useToast.test.tsx
└── utils/
    └── utils.test.tsx
```

### Exemplo de Teste

```typescript
describe('BookCard', () => {
  it('should expand on hover', async () => {
    const mockBook = createMockBook();
    const onExpand = jest.fn();
    
    render(
      <BookCard 
        book={mockBook} 
        onExpand={onExpand}
        expandOnHover={true}
      />
    );
    
    const card = screen.getByTestId('book-card');
    fireEvent.mouseEnter(card);
    
    await waitFor(() => {
      expect(onExpand).toHaveBeenCalledWith(mockBook.id);
    });
  });
});
```

## 🔒 Acessibilidade

### Implementações

1. **Navegação por Teclado**
```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

2. **ARIA Labels**
```tsx
<button aria-label="Adicionar aos favoritos">
  ❤️
</button>
```

3. **Focus Management**
```tsx
<Modal onOpen={() => {
  setTimeout(() => {
    inputRef.current?.focus();
  }, 100);
}}>
```

4. **Screen Reader Support**
```tsx
<div role="region" aria-label="Carrossel de livros">
  <h2 id="carousel-title">Ficção Científica</h2>
  <div role="group" aria-labelledby="carousel-title">
    {/* Carousel content */}
  </div>
</div>
```

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas
npm run type-check   # Verificar tipos
npm run format       # Formatar código
npm test             # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Cobertura de testes
```

### Configuração do Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Debugging

```typescript
// Debug mode para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', debugData);
}
```

## 📦 Build e Deploy

### Build Otimizado

```bash
npm run build
```

**Otimizações automáticas:**
- Tree shaking
- Code splitting
- Image optimization
- CSS minification
- Bundle analysis

### Deploy na Vercel

```bash
# Configuração automática
vercel --prod
```

**Configurações de produção:**
- CDN global
- Edge functions
- Automatic HTTPS
- Performance monitoring

---

**Próximos Passos:**
1. Implementar backend API
2. Integrar autenticação
3. Adicionar testes E2E
4. Configurar CI/CD
5. Implementar PWA features