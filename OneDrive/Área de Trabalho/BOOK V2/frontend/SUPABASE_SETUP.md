# Configuração do Supabase para OursBook

Este guia explica como configurar o Supabase para o projeto OursBook.

## 1. Configuração Inicial do Supabase

### Pré-requisitos
- Conta no Supabase (https://supabase.com)
- Projeto criado no Supabase

### Informações do Projeto
- **URL do Projeto**: https://rcskfvbacvlvwvegvtap.supabase.co
- **Bucket de Storage**: Book
- **Região**: us-east-2

## 2. Configuração do Banco de Dados

### Executar Schema SQL
1. Acesse o painel do Supabase
2. Vá para **SQL Editor**
3. Execute o arquivo `supabase-schema.sql` completo
4. Verifique se todas as tabelas foram criadas:
   - `users`
   - `books`
   - `user_books`
   - `book_categories`
   - `reading_sessions`
   - `book_reviews`

### Verificar Políticas RLS
As políticas de Row Level Security foram configuradas automaticamente:
- ✅ Usuários podem ver apenas seus próprios dados
- ✅ Livros são públicos para leitura
- ✅ Apenas admins podem gerenciar livros
- ✅ Storage público para arquivos de livros

## 3. Configuração de Storage

### Bucket "Book"
O bucket já está configurado com as credenciais fornecidas:
- **Access Key ID**: c5d894e41cfd1db07d3442bd547d3c34
- **Secret Access Key**: c81cb32002a0ecbe89da8aea5ff3b8436415b94454bcc3a41850ddab9bffc410
- **Endpoint**: https://rcskfvbacvlvwvegvtap.storage.supabase.co/storage/v1/s3

### Estrutura de Arquivos
```
Book/
├── covers/          # Capas de livros
│   ├── {book-id}.jpg
│   └── {book-id}.png
├── {book-id}.pdf    # Arquivos de livros
├── {book-id}.epub
└── {book-id}.mobi
```

## 4. Configuração de Autenticação

### Email Templates (Opcional)
Configure templates personalizados em **Authentication > Email Templates**:

1. **Confirm Signup**:
```html
<h2>Bem-vindo ao OursBook!</h2>
<p>Clique no link abaixo para confirmar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
```

2. **Reset Password**:
```html
<h2>Redefinir Senha - OursBook</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
```

### Configurações de URL
Em **Authentication > URL Configuration**:
- **Site URL**: http://localhost:3000 (desenvolvimento)
- **Redirect URLs**: 
  - http://localhost:3000/reset-password
  - http://localhost:3000/auth/callback

## 5. Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` está configurado:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rcskfvbacvlvwvegvtap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Storage Configuration
SUPABASE_STORAGE_ACCESS_KEY=c5d894e41cfd1db07d3442bd547d3c34
SUPABASE_STORAGE_SECRET_KEY=c81cb32002a0ecbe89da8aea5ff3b8436415b94454bcc3a41850ddab9bffc410
SUPABASE_STORAGE_ENDPOINT=https://rcskfvbacvlvwvegvtap.storage.supabase.co/storage/v1/s3
SUPABASE_STORAGE_REGION=us-east-2
SUPABASE_STORAGE_BUCKET=Book
```

## 6. Testando a Configuração

### 1. Criar Usuário Admin
Execute no SQL Editor:
```sql
-- Após criar um usuário via interface, promova para admin
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'seu-email@exemplo.com';
```

### 2. Testar Funcionalidades
1. **Registro**: Crie uma conta em `/register`
2. **Login**: Faça login em `/login`
3. **Admin**: Acesse `/admin` com conta admin
4. **Import**: Teste importação de livros via Google Books API

## 7. Funcionalidades Implementadas

### ✅ Autenticação Completa
- Registro com verificação de email
- Login com validação
- Recuperação de senha
- Logout seguro

### ✅ Gerenciamento de Livros
- Busca via Google Books API
- Upload de arquivos (PDF, EPUB, etc.)
- Upload de capas personalizadas
- Metadados completos

### ✅ Listas de Usuário
- Favoritos
- Lista de leitura
- Lendo atualmente
- Sincronização em tempo real

### ✅ Painel Administrativo
- Importação de livros
- Gerenciamento de usuários
- Estatísticas em tempo real

## 8. Próximos Passos

1. **Configurar Email SMTP** (opcional para produção)
2. **Configurar domínio personalizado**
3. **Implementar cache Redis** (para melhor performance)
4. **Configurar CDN** (para arquivos de livros)
5. **Implementar analytics** (tracking de leitura)

## 9. Troubleshooting

### Erro de Conexão
- Verifique as variáveis de ambiente
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS

### Erro de Upload
- Confirme que o bucket "Book" existe
- Verifique as credenciais de storage
- Confirme as políticas de storage

### Erro de Autenticação
- Verifique se o email foi confirmado
- Confirme as URLs de redirecionamento
- Verifique se o usuário existe na tabela `users`

## 10. Suporte

Para problemas específicos:
1. Verifique os logs no Supabase Dashboard
2. Confirme a configuração das tabelas
3. Teste as políticas RLS
4. Verifique as permissões de storage