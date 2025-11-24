# Sistema de Gamificação - Kaizen

Um sistema completo de gamificação para o app de hábitos Kaizen, com títulos inspirados em guerra chinesa antiga, sistema de pontos e streaks.

## 📊 Componentes

### 1. **Types/Gamification** (`src/types/gamification.ts`)
Define a estrutura de dados para o sistema:

- **Title**: Representa um título do usuário com nível, nome, pontos mínimos e ícone
- **StreakBonus**: Define o multiplicador de pontos baseado no streak
- **UserStats**: Estatísticas agregadas do usuário

### 2. **Hook useGamification** (`src/hooks/useGamification.ts`)
Lógica central de cálculos de gamificação:

- `calculateHabitPoints(streak)`: Calcula pontos baseado no streak
- `getCurrentTitle(totalPoints)`: Retorna o título atual
- `getPointsToNextTitle(totalPoints)`: Pontos faltando para próximo título
- `getProgressToNextTitle(totalPoints)`: Progresso em percentual

### 3. **UserRankDisplay** (`src/components/UserRankDisplay.tsx`)
Componente visual principal que mostra:

- Título atual do usuário com ícone
- Nível (1-10)
- Pontuação total
- Progresso para próximo título
- Hábitos completos hoje
- Melhor streak

### 4. **HabitPointsDisplay** (`src/components/HabitPointsDisplay.tsx`)
Exibe pontos de cada hábito:

- Nome do hábito
- Dias de streak com ícone de fogo
- Multiplicador aplicado
- Pontos ganhos

### 5. **TitlesProgression** (`src/components/TitlesProgression.tsx`)
Mostra a progressão completa de títulos:

- Todos os 10 títulos disponíveis
- Status: Atual, Desbloqueado ou Bloqueado
- Pontos necessários para cada título

## 🎖️ Sistema de Títulos

Baseado em guerra chinesa antiga com 10 níveis:

| Nível | Título | Pontos | Ícone |
|-------|--------|--------|-------|
| 1 | Novato do Clã | 0 | ⚔️ |
| 2 | Soldado da Muralha | 200 | 🛡️ |
| 3 | Lança Iniciante | 500 | 🗡️ |
| 4 | Guerreiro da Mandíbula do Dragão | 1.000 | 🐉 |
| 5 | Sentinela do Império | 2.000 | 👑 |
| 6 | General das Quatro Províncias | 3.500 | 🎖️ |
| 7 | Senhor da Guerra da Dinastia Dourada | 5.000 | 💛 |
| 8 | Mestre da Espada Celestial | 7.000 | ✨ |
| 9 | Sábio do Templo Vermelho | 9.000 | 🏯 |
| 10 | Dragão Imortal do Oriente | 10.000 | 🐲 |

## ⭐ Sistema de Pontos

### Base: 20 pontos por hábito concluído

### Multiplicadores por Streak:

| Streak | Multiplicador | Pontos |
|--------|---------------|--------|
| 1 dia | 1.0x | 20 |
| 2 dias | 1.1x | 22 |
| 3 dias | 1.2x | 24 |
| 4 dias | 1.3x | 26 |
| 5 dias | 1.5x | 30 |
| 7 dias | 1.7x | 34 |
| 14 dias | 2.0x | 40 |
| 21 dias | 2.5x | 50 |
| 30+ dias | 3.0x | 60 |

## 🔥 Sistema de Streak

- Cada dia consecutivo completando um hábito aumenta o multiplicador
- Quanto maior o streak, mais pontos são ganhos
- Máximo de 3.0x em 30+ dias consecutivos

## 📈 Cálculo de Pontos

A pontuação total do usuário é a soma de todos os hábitos:
- Cada hábito contribui `calculateHabitPoints(streak)` para o total
- O título é determinado pela pontuação total acumulada
- O progresso para o próximo título é mostrado em percentual

## 🎮 Como Usar

### Integração em Componentes

```tsx
import { useGamification } from "@/hooks/useGamification";
import { UserRankDisplay } from "@/components/UserRankDisplay";
import { HabitPointsDisplay } from "@/components/HabitPointsDisplay";
import { TitlesProgression } from "@/components/TitlesProgression";

function MyComponent() {
  const { habits } = useHabits();
  const { stats } = useGamification(habits);

  return (
    <>
      <UserRankDisplay stats={stats} />
      <HabitPointsDisplay habits={habits} />
      <TitlesProgression currentRank={stats.currentRank} />
    </>
  );
}
```

### Acessar Dados de Gamificação

```tsx
const { stats } = useGamification(habits);

console.log(stats.totalPoints); // Pontuação total
console.log(stats.currentTitle); // Título atual
console.log(stats.currentRank); // Nível (1-10)
console.log(stats.completedHabitsCount); // Hábitos concluídos hoje
console.log(stats.currentStreak); // Melhor streak atual
```

## 🎯 Exemplos de Progressão

### Cenário 1: Iniciante
- 1 hábito criado hoje (streak = 1)
- Pontos: 20
- Título: Novato do Clã (0 pts)
- Próximo: 180 pontos para Soldado da Muralha

### Cenário 2: Em Progresso
- 3 hábitos com streak variado
  - Hábito 1: 7 dias → 34 pontos
  - Hábito 2: 14 dias → 40 pontos
  - Hábito 3: 3 dias → 24 pontos
- Total: 98 pontos
- Título: Novato do Clã
- Próximo: 102 pontos para Soldado da Muralha

### Cenário 3: Avançado
- 5 hábitos com bons streaks
- Total: 250+ pontos
- Título: Soldado da Muralha
- Caminhando para Lança Iniciante (500 pts)

## 💾 Armazenamento

O sistema utiliza o localStorage existente:
- Hábitos com `streak` são lidos pelo `useGamification`
- Pontos são calculados sob demanda a partir dos streaks
- Nenhum armazenamento adicional necessário

## 🔄 Atualização de Dados

O sistema atualiza automaticamente quando:
- Um hábito é marcado como concluído/incompleto
- O streak é alterado
- Novos hábitos são adicionados/removidos

## 🎨 Customização

### Alterar Títulos
Edite o array `TITLES` em `src/types/gamification.ts`

### Alterar Pontos Base
Modifique a constante `BASE_POINTS` (atualmente 20)

### Alterar Multiplicadores
Edite o array `STREAK_BONUSES` em `src/types/gamification.ts`

## 📝 Notas

- O sistema é totalmente determinístico baseado em streak
- Todos os cálculos são feitos em tempo real
- Não há necessidade de sincronizar com backend para gamificação local
- Os componentes são responsivos e funcionam em mobile
