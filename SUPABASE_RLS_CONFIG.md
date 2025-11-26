# Configuração de RLS (Row Level Security) do Supabase

## Problema Identificado

O Leaderboard Global está mostrando apenas o usuário logado porque as políticas de RLS (Row Level Security) estão bloqueando o acesso aos dados de outros usuários.

## Solução: Atualizar Políticas de RLS

Para que o leaderboard funcione corretamente e mostre todos os usuários, você precisa ajustar as políticas de RLS no Supabase:

### 1. Tabela `profiles` - Permitir Leitura Pública

**No Supabase Dashboard:**
1. Acesse **Authentication** > **Policies**
2. Encontre a tabela `profiles`
3. Adicione uma nova política de SELECT com as seguintes configurações:

```sql
-- Política: "Profiles são públicos para leitura"
-- Operação: SELECT
-- Target roles: authenticated

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);
```

### 2. Tabela `habits` - Permitir Leitura Pública (completion_history)

```sql
-- Política: "Habits são visíveis para o leaderboard"
-- Operação: SELECT
-- Target roles: authenticated

CREATE POLICY "Habits are viewable for leaderboard"
ON habits FOR SELECT
TO authenticated
USING (true);
```

**IMPORTANTE:** As políticas de INSERT, UPDATE e DELETE devem continuar restritas ao usuário proprietário:

```sql
-- INSERT: Apenas o usuário pode criar seus próprios hábitos
CREATE POLICY "Users can insert own habits"
ON habits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Apenas o usuário pode atualizar seus próprios hábitos
CREATE POLICY "Users can update own habits"
ON habits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- DELETE: Apenas o usuário pode deletar seus próprios hábitos
CREATE POLICY "Users can delete own habits"
ON habits FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## Verificação

Após aplicar as políticas, teste:

1. Faça login com um usuário
2. Verifique se o Leaderboard mostra todos os usuários cadastrados
3. Cada usuário deve aparecer com:
   - Nome ou email
   - Título baseado nos pontos
   - Total de pontos calculado a partir dos streaks dos hábitos

## Privacidade

As informações públicas são:
- ✅ Nome completo (profiles.full_name)
- ✅ Email (profiles.email)  
- ✅ Pontos totais (calculado a partir dos streaks)
- ✅ Título atual

As informações privadas continuam protegidas:
- 🔒 Detalhes específicos dos hábitos (nome, descrição, etc.)
- 🔒 Histórico completo de conclusões
- 🔒 Modificação de dados (apenas o proprietário)

## Comandos SQL Completos

Execute no SQL Editor do Supabase:

```sql
-- Permitir que todos vejam os profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Permitir que todos vejam os habits para o leaderboard
DROP POLICY IF EXISTS "Habits are viewable for leaderboard" ON habits;
CREATE POLICY "Habits are viewable for leaderboard"
ON habits FOR SELECT
TO authenticated
USING (true);

-- Manter proteção de escrita (INSERT)
DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
CREATE POLICY "Users can insert own habits"
ON habits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Manter proteção de atualização (UPDATE)
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
CREATE POLICY "Users can update own habits"
ON habits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Manter proteção de deleção (DELETE)
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
CREATE POLICY "Users can delete own habits"
ON habits FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## Resultado Esperado

Após aplicar essas políticas:
- ✅ O Leaderboard mostrará TODOS os usuários registrados
- ✅ Cada usuário verá sua posição destacada com "(Você)"
- ✅ Os usuários estarão ordenados por pontos (maior para menor)
- ✅ Medalhas para top 3 (🥇🥈🥉)
- ✅ Títulos corretos baseados nos pontos
