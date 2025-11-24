import { useMemo } from "react";
import { HabitWithProgress } from "@/types/habit";
import {
  TITLES,
  STREAK_BONUSES,
  BASE_POINTS,
  UserStats,
  Title,
} from "@/types/gamification";

export const useGamification = (habits: HabitWithProgress[]) => {
  const stats = useMemo(() => {
    // Calculate total points
    const totalPoints = habits.reduce((acc, habit) => {
      const pointsFromHabit = calculateHabitPoints(habit.streak);
      return acc + pointsFromHabit;
    }, 0);

    // Get current title based on total points
    const currentTitle = getCurrentTitle(totalPoints);
    const currentRank = currentTitle.rank;

    // Count completed habits
    const completedHabitsCount = habits.filter(h => h.completedToday).length;

    // Get longest streak
    const currentStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);

    return {
      totalPoints,
      currentTitle,
      currentRank,
      completedHabitsCount,
      currentStreak,
    } as UserStats;
  }, [habits]);

  return {
    stats,
    calculateHabitPoints,
    getCurrentTitle,
    getPointsToNextTitle,
  };
};

/**
 * Calcula os pontos de um hábito baseado no streak
 */
export const calculateHabitPoints = (streak: number): number => {
  if (streak === 0) return 0;

  // Find the appropriate bonus tier
  let bonus = STREAK_BONUSES[0];

  for (let i = STREAK_BONUSES.length - 1; i >= 0; i--) {
    if (streak >= STREAK_BONUSES[i].days) {
      bonus = STREAK_BONUSES[i];
      break;
    }
  }

  return bonus.points;
};

/**
 * Retorna o título atual baseado nos pontos totais
 */
export const getCurrentTitle = (totalPoints: number): Title => {
  let currentTitle = TITLES[0];

  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (totalPoints >= TITLES[i].minPoints) {
      currentTitle = TITLES[i];
      break;
    }
  }

  return currentTitle;
};

/**
 * Retorna quantos pontos faltam para o próximo título
 */
export const getPointsToNextTitle = (totalPoints: number): number | null => {
  const currentTitle = getCurrentTitle(totalPoints);
  const currentTitleIndex = TITLES.findIndex((t) => t.rank === currentTitle.rank);

  if (currentTitleIndex === TITLES.length - 1) {
    return null; // Já está no título máximo
  }

  const nextTitle = TITLES[currentTitleIndex + 1];
  return nextTitle.minPoints - totalPoints;
};

/**
 * Retorna progresso para o próximo título em percentual
 */
export const getProgressToNextTitle = (totalPoints: number): number => {
  const currentTitle = getCurrentTitle(totalPoints);
  const currentTitleIndex = TITLES.findIndex((t) => t.rank === currentTitle.rank);

  if (currentTitleIndex === TITLES.length - 1) {
    return 100; // Já está no título máximo
  }

  const nextTitle = TITLES[currentTitleIndex + 1];
  const pointsInCurrentTier = totalPoints - currentTitle.minPoints;
  const pointsNeededForTier = nextTitle.minPoints - currentTitle.minPoints;

  return Math.min(100, Math.round((pointsInCurrentTier / pointsNeededForTier) * 100));
};
