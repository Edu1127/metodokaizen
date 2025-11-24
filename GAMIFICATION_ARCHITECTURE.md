# Arquitetura do Sistema de Gamificação

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      localStorage                          │
│  (Hábitos com streak, completion history, etc)            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              useHabits() Hook                              │
│  • getHabitsWithProgress()                                │
│  • toggleHabitCompletion()                                │
│  • deleteHabit()                                          │
│  • addHabit()                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
        ┌───────────────────┐
        │  HabitWithProgress│  (habits array)
        │  Array[]          │
        └─────────┬─────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          useGamification(habits) Hook                      │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ calculateHabitPoints(streak)                        │ │
│  │ • Lookup na tabela STREAK_BONUSES                  │ │
│  │ • Retorna pontos (20-60)                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ calculateTotalPoints()                              │ │
│  │ • Sum de todos calculateHabitPoints()              │ │
│  │ • Result: Total de pontos do usuário               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ getCurrentTitle(totalPoints)                        │ │
│  │ • Lookup na tabela TITLES                          │ │
│  │ • Return: Title com rank, name, icon               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ getPointsToNextTitle(totalPoints)                  │ │
│  │ • Calcula diferença até próximo tier              │ │
│  │ • Return: Número de pontos ou null                │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ getProgressToNextTitle(totalPoints)               │ │
│  │ • Calcula percentual de progresso                │ │
│  │ • Return: 0-100%                                 │ │
│  └─────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
           UserStats Object
    ┌──────────────────────────────┐
    │ totalPoints: number          │
    │ currentTitle: Title          │
    │ currentRank: 1-10            │
    │ completedHabitsCount: number │
    │ currentStreak: number        │
    └──────────────────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
    ┌────┴───┐┌─┴──────┐┌──┴────────┐
    │UserRank││Habit   ││Titles     │
    │Display ││Points  ││Progression│
    └────────┘└────────┘└───────────┘
```

## 🔄 Ciclo de Vida

```
User Habit Completion
        │
        ▼
toggleHabitCompletion() in useHabits
        │
        ├─→ streak + 1
        ├─→ completionHistory updated
        └─→ localStorage updated
        │
        ▼
Re-render Components
        │
        ▼
useGamification() recalculates
        │
        ├─→ calculateHabitPoints() for each habit
        ├─→ Sum all points
        ├─→ Lookup title
        └─→ Calculate progress
        │
        ▼
UserStats updated
        │
        ├─→ UserRankDisplay re-renders
        ├─→ HabitPointsDisplay re-renders
        ├─→ HabitCard badges update
        └─→ TitlesProgression re-renders
```

## 📁 Estrutura de Arquivos

```
src/
├── types/
│   ├── habit.ts              (tipos existentes)
│   └── gamification.ts       ✨ NOVO
│
├── hooks/
│   ├── useHabits.ts          (existente)
│   └── useGamification.ts    ✨ NOVO
│
├── components/
│   ├── HabitCard.tsx         (ATUALIZADO - mostra pontos)
│   ├── AddHabitDialog.tsx    (sem mudanças)
│   ├── UserRankDisplay.tsx   ✨ NOVO
│   ├── HabitPointsDisplay.tsx ✨ NOVO
│   ├── TitlesProgression.tsx ✨ NOVO
│   └── ui/
│       ├── card.tsx          (usado pelo sistema)
│       ├── badge.tsx         (usado pelo sistema)
│       ├── progress.tsx      (usado pelo sistema)
│       └── ... (outros)
│
└── pages/
    └── Index.tsx             (ATUALIZADO - integração)

root/
├── GAMIFICATION.md           ✨ Documentação técnica
├── GAMIFICATION_EXAMPLES.md  ✨ Exemplos de uso
└── GAMIFICATION_SUMMARY.md   ✨ Resumo (este arquivo)
```

## 🧮 Tabelas de Referência

### TITLES Array
```
[
  { rank: 1, minPoints: 0, name: "Novato do Clã", icon: "⚔️" },
  { rank: 2, minPoints: 200, name: "Soldado da Muralha", icon: "🛡️" },
  { rank: 3, minPoints: 500, name: "Lança Iniciante", icon: "🗡️" },
  ...
  { rank: 10, minPoints: 10000, name: "Dragão Imortal do Oriente", icon: "🐲" },
]
```

### STREAK_BONUSES Array
```
[
  { days: 1, multiplier: 1.0, points: 20 },
  { days: 2, multiplier: 1.1, points: 22 },
  { days: 3, multiplier: 1.2, points: 24 },
  { days: 4, multiplier: 1.3, points: 26 },
  { days: 5, multiplier: 1.5, points: 30 },
  { days: 7, multiplier: 1.7, points: 34 },
  { days: 14, multiplier: 2.0, points: 40 },
  { days: 21, multiplier: 2.5, points: 50 },
  { days: 30, multiplier: 3.0, points: 60 },
]
```

## 🎯 Exemplos de Cálculos

### Cenário: Usuário com 3 hábitos

```
Hábitos:
┌─────────────────┬────────┬────────────┐
│ Nome            │ Streak │ Pontos     │
├─────────────────┼────────┼────────────┤
│ Exercício       │ 7      │ 34 (1.7x)  │
│ Leitura         │ 14     │ 40 (2.0x)  │
│ Meditação       │ 3      │ 24 (1.2x)  │
└─────────────────┴────────┴────────────┘

Total Points = 34 + 40 + 24 = 98

Title Lookup:
  98 >= 0? ✓ "Novato do Clã"
  98 >= 200? ✗

Current Rank = 1

Points to Next Title = 200 - 98 = 102

Progress = (98 - 0) / (200 - 0) * 100 = 49%
```

## 🔗 Dependências Entre Componentes

```
UserRankDisplay
├── Usa: UserStats
├── Usa: getProgressToNextTitle()
├── Usa: getPointsToNextTitle()
└── Usa: TITLES array

HabitPointsDisplay
├── Usa: HabitWithProgress[]
└── Usa: calculateHabitPoints()

TitlesProgression
├── Usa: currentRank
└── Usa: TITLES array

HabitCard
├── Usa: calculateHabitPoints()
└── Mostra: Badge com pontos

Index.tsx
├── Usa: useHabits()
├── Usa: useGamification()
└── Renderiza: UserRankDisplay, HabitPointsDisplay, TitlesProgression
```

## 📈 Progresso do Usuário - Timeline

```
DIA 1
├─ 1 hábito (1 dia)
├─ 20 pontos
├─ Nível: 1/10 (Novato do Clã)
└─ Progresso: 20/200 (10%)

DIA 7
├─ 1 hábito (7 dias) + 1 novo (1 dia)
├─ 34 + 20 = 54 pontos
├─ Nível: 1/10 (Novato do Clã)
└─ Progresso: 54/200 (27%)

DIA 30
├─ Vários hábitos com 30+ dias
├─ 60 + 60 + 60 + 60 = 240 pontos
├─ Nível: 2/10 (Soldado da Muralha) ✅ SUBIU!
└─ Progresso: 40/300 (13% para próximo)

DIA 90
├─ Vários hábitos com 90+ dias
├─ 300+ pontos
├─ Nível: 3/10+ (Lança Iniciante+) ✅ SUBIU!
└─ Progresso: Rumo a General
```

## 🎓 Conceitos Principais

### Streak (Sequência)
- Número de dias consecutivos completando um hábito
- Incrementa +1 a cada dia completado
- Decrementa se não completar (opcional, depende da lógica)
- Base para calcular pontos

### Multiplicador
- Baseado no streak do hábito
- Valores de 1.0x a 3.0x
- Determina quanto os 20 pontos base são multiplicados
- Não tem cap por hábito (cada hábito tem seu multiplicador)

### Pontos Totais
- Soma de todos calculateHabitPoints() dos hábitos
- Determinístico: sempre o mesmo para o mesmo conjunto de hábitos
- Recalculado em cada render

### Título
- Determinado pela faixa de pontos totais
- Tem nome, ícone, nível (1-10)
- Muda automaticamente quando cruza threshold

### Rank
- Número de 1 a 10
- Corresponde ao nível do título
- Usado para mostrar progresso (ex: 3/10)

---

**Última atualização**: 24 de novembro de 2025
