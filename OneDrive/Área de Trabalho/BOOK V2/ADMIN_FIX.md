# Como Resolver o Erro "Acesso Negado"

## Problema
Você está recebendo "Acesso negado" ao tentar importar livros porque sua conta não está marcada como administrador no banco de dados.

## Solução Rápida

### Opção 1: Usar a Conta Admin Padrão (Mais Rápido)

1. **Faça logout** da sua conta atual
2. **Faça login** com a conta admin padrão:
   - **Email**: `admin@oursbook.com`
   - **Senha**: `admin123`
3. Agora você terá acesso total ao painel admin e poderá importar livros!

### Opção 2: Tornar Sua Conta Admin (Recomendado)

Se você já tem uma conta registrada (como `ytalosave@gmail.com`) e quer torná-la admin:

1. **Abra o terminal** na pasta `frontend`

2. **Execute o script**:
   ```bash
   node scripts/make-admin.js
   ```

3. **Faça logout e login novamente** para atualizar o token

4. Pronto! Agora você é admin! 🎉

### Opção 3: Manualmente no Banco de Dados

Se preferir fazer manualmente:

1. Abra o arquivo `frontend/data/oursbook.db` com um editor SQLite

2. Execute este SQL:
   ```sql
   UPDATE users 
   SET is_admin = 1, subscription_tier = 'ultimate' 
   WHERE email = 'ytalosave@gmail.com';
   ```

3. Faça logout e login novamente

## Verificar se Funcionou

Depois de seguir qualquer uma das opções acima:

1. **Faça logout** (importante!)
2. **Faça login** novamente
3. Vá para `/admin`
4. Tente importar livros com o Magic Import
5. Deve funcionar! ✅

## Por Que Isso Acontece?

O sistema verifica se o usuário é admin através do token JWT. Quando você faz login, o sistema gera um token com as informações do usuário, incluindo se ele é admin ou não.

**Fluxo:**
```
Login → Gera Token com is_admin → Salva no localStorage → 
API verifica token → Se is_admin = true → Permite importar
```

Se sua conta não está marcada como admin no banco de dados, o token será gerado com `is_admin: false`, e você receberá "Acesso negado" ao tentar importar livros.

## Contas Padrão do Sistema

O sistema vem com 2 contas pré-configuradas:

1. **Admin** (tem acesso total):
   - Email: `admin@oursbook.com`
   - Senha: `admin123`
   - Subscription: Ultimate
   - Admin: ✅ SIM

2. **Usuário Demo** (acesso básico):
   - Email: `user@oursbook.com`
   - Senha: `user123`
   - Subscription: Basic
   - Admin: ❌ NÃO

## Dica de Segurança

⚠️ **IMPORTANTE**: Em produção, sempre mude as senhas padrão!

```sql
-- Mudar senha do admin
UPDATE users 
SET password = '[hash_bcrypt_da_nova_senha]' 
WHERE email = 'admin@oursbook.com';
```

---

**Status**: ✅ Solução Documentada
**Data**: 2026-04-21
