# Exemplos de Uso - Sistema de Gamificação

## 1. Usar o Hook em um Componente

```typescript
import { useHabits } from "@/hooks/useHabits";
import { useGamification } from "@/hooks/useGamification";

function ExemploComponente() {
  const { habits } = useHabits();
  const { stats } = useGamification(habits);

  return (
    <div>
      <h1>Seu Título: {stats.currentTitle.name}</h1>
      <p>Pontos: {stats.totalPoints}</p>
      <p>Nível: {stats.currentRank}/10</p>
    </div>
  );
}
```

## 2. Cálculos de Pontos

```typescript
import { calculateHabitPoints } from "@/hooks/useGamification";

// Hábito com 1 dia de streak
console.log(calculateHabitPoints(1)); // 20 pontos

// Hábito com 5 dias de streak
console.log(calculateHabitPoints(5)); // 30 pontos (1.5x)

// Hábito com 30 dias de streak
console.log(calculateHabitPoints(30)); // 60 pontos (3.0x)
```

## 3. Obter Título Atual

```typescript
import { getCurrentTitle } from "@/hooks/useGamification";

// 0 pontos = Novato do Clã
const title1 = getCurrentTitle(0);
console.log(title1.name); // "Novato do Clã"
console.log(title1.icon); // "⚔️"

// 250 pontos = Soldado da Muralha
const title2 = getCurrentTitle(250);
console.log(title2.name); // "Soldado da Muralha"

// 10000+ pontos = Dragão Imortal do Oriente
const title3 = getCurrentTitle(10000);
console.log(title3.name); // "Dragão Imortal do Oriente"
```

## 4. Calcular Progresso para Próximo Nível

```typescript
import { 
  getPointsToNextTitle, 
  getProgressToNextTitle 
} from "@/hooks/useGamification";

// Usuário com 50 pontos (rumo a 200)
const pointsToNext1 = getPointsToNextTitle(50); // 150
const progress1 = getProgressToNextTitle(50); // ~25%

// Usuário com 9500 pontos (rumo a 10000)
const pointsToNext2 = getPointsToNextTitle(9500); // 500
const progress2 = getProgressToNextTitle(9500); // 50%

// Usuário no máximo (10000+)
const pointsToNext3 = getPointsToNextTitle(10500); // null
const progress3 = getProgressToNextTitle(10500); // 100
```

## 5. Distribuição de Pontos por Hábito

```typescript
import { calculateHabitPoints } from "@/hooks/useGamification";
import { HabitWithProgress } from "@/types/habit";

const habits: HabitWithProgress[] = [
  { /* ... */ streak: 7 },
  { /* ... */ streak: 14 },
  { /* ... */ streak: 3 },
];

const pontosDistribuicao = habits.map(habit => ({
  nome: habit.name,
  streak: habit.streak,
  pontos: calculateHabitPoints(habit.streak),
}));

console.log(pontosDistribuicao);
// [
//   { nome: "Exercício", streak: 7, pontos: 34 },
//   { nome: "Leitura", streak: 14, pontos: 40 },
//   { nome: "Meditação", streak: 3, pontos: 24 },
// ]

const totalPontos = pontosDistribuicao.reduce((acc, h) => acc + h.pontos, 0);
console.log(`Total: ${totalPontos} pontos`); // Total: 98 pontos
```

## 6. Simular Progressão de Usuário

```typescript
import { calculateHabitPoints, getCurrentTitle } from "@/hooks/useGamification";

function simularProgressao() {
  let totalPontos = 0;

  // Dia 1: Cria 1 hábito com 1 dia de streak
  totalPontos += calculateHabitPoints(1); // +20
  console.log(`Dia 1: ${totalPontos} pontos - ${getCurrentTitle(totalPontos).name}`);
  // Output: Dia 1: 20 pontos - Novato do Clã

  // Dia 5: 2 hábitos com 5 dias
  totalPontos = calculateHabitPoints(5) + calculateHabitPoints(5); // 30+30
  console.log(`Dia 5: ${totalPontos} pontos - ${getCurrentTitle(totalPontos).name}`);
  // Output: Dia 5: 60 pontos - Novato do Clã

  // Dia 30: 3 hábitos com 30 dias
  totalPontos = calculateHabitPoints(30) * 3; // 60+60+60
  console.log(`Dia 30: ${totalPontos} pontos - ${getCurrentTitle(totalPontos).name}`);
  // Output: Dia 30: 180 pontos - Novato do Clã

  // Dia 60: 4 hábitos com 60 dias
  totalPontos = calculateHabitPoints(60) * 4; // 60 cada (não há multiplicador maior que 30 dias)
  console.log(`Dia 60: ${totalPontos} pontos - ${getCurrentTitle(totalPontos).name}`);
  // Output: Dia 60: 240 pontos - Soldado da Muralha
}

simularProgressao();
```

## 7. Usar Componentes de Gamificação

```typescript
import { useHabits } from "@/hooks/useHabits";
import { useGamification } from "@/hooks/useGamification";
import { UserRankDisplay } from "@/components/UserRankDisplay";
import { HabitPointsDisplay } from "@/components/HabitPointsDisplay";
import { TitlesProgression } from "@/components/TitlesProgression";

function Dashboard() {
  const { habits } = useHabits();
  const { stats } = useGamification(habits);

  return (
    <div className="space-y-6">
      {/* Mostrar rank do usuário */}
      <UserRankDisplay stats={stats} />

      {/* Mostrar pontos por hábito */}
      <HabitPointsDisplay habits={habits} />

      {/* Mostrar progressão de títulos */}
      <TitlesProgression currentRank={stats.currentRank} />
    </div>
  );
}
```

## 8. Barra de Progresso Customizada

```typescript
import { getProgressToNextTitle, getPointsToNextTitle } from "@/hooks/useGamification";

function ProgressBar({ stats }) {
  const progress = getProgressToNextTitle(stats.totalPoints);
  const pointsToNext = getPointsToNextTitle(stats.totalPoints);

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="font-semibold">Próximo Nível</p>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {pointsToNext ?? "Máximo!"} pontos faltando
      </p>
    </div>
  );
}
```

## 9. Notificações de Mudança de Título

```typescript
import { getCurrentTitle } from "@/hooks/useGamification";

function verificarMudancaTitulo(pontosAntigos: number, pontosNovos: number) {
  const tituloAnterior = getCurrentTitle(pontosAntigos);
  const tituloNovo = getCurrentTitle(pontosNovos);

  if (tituloAnterior.rank < tituloNovo.rank) {
    console.log(
      `Parabéns! Você subiu para ${tituloNovo.name}! ${tituloNovo.icon}`
    );
    // Você pode disparar uma notificação toast aqui
    // toast.success(`Novo Título: ${tituloNovo.name}!`);
  }
}
```

## 10. Integração com Hábitos Existentes

O sistema funciona automaticamente com hábitos que já têm a propriedade `streak`:

```typescript
// No useHabits.ts, quando o hábito é concluído:
const toggleHabitCompletion = (id: string) => {
  setHabits(
    habits.map((habit) => {
      if (habit.id === id) {
        return {
          ...habit,
          completedToday: true,
          streak: habit.streak + 1, // Isso gera automaticamente pontos!
        };
      }
      return habit;
    })
  );
};
```

## Resumo dos Arquivos Criados

| Arquivo | Propósito |
|---------|----------|
| `src/types/gamification.ts` | Tipos, interfaces e constantes |
| `src/hooks/useGamification.ts` | Hook principal com lógica de cálculos |
| `src/components/UserRankDisplay.tsx` | Exibe rank e progresso do usuário |
| `src/components/HabitPointsDisplay.tsx` | Exibe pontos de cada hábito |
| `src/components/TitlesProgression.tsx` | Exibe todos os títulos disponíveis |
| `GAMIFICATION.md` | Documentação completa do sistema |
| `GAMIFICATION_EXAMPLES.md` | Este arquivo com exemplos de uso |

## Dicas Importantes

1. **Cálculos são em tempo real**: Não há banco de dados separado, tudo é calculado a partir do `streak`
2. **Sem sincronização necessária**: Funciona 100% local com localStorage
3. **Componentes responsivos**: Todos adaptam automaticamente para mobile
4. **Fácil de customizar**: Edite `TITLES` e `STREAK_BONUSES` em `gamification.ts`
5. **Integração simples**: Basta usar o hook `useGamification` em qualquer componente
