export interface Title {
  rank: number;
  name: string;
  minPoints: number;
  icon: string; // Emoji or icon identifier
}

export interface StreakBonus {
  days: number;
  multiplier: number;
  points: number;
}

export interface UserStats {
  totalPoints: number;
  currentTitle: Title;
  currentRank: number;
  completedHabitsCount: number;
  currentStreak: number;
}

export const TITLES: Title[] = [
  { rank: 1, name: "Novato do Clã", minPoints: 0, icon: "⚔️" },
  { rank: 2, name: "Soldado da Muralha", minPoints: 200, icon: "🛡️" },
  { rank: 3, name: "Lança Iniciante", minPoints: 500, icon: "🗡️" },
  { rank: 4, name: "Guerreiro da Mandíbula do Dragão", minPoints: 1000, icon: "🐉" },
  { rank: 5, name: "Sentinela do Império", minPoints: 2000, icon: "👑" },
  { rank: 6, name: "General das Quatro Províncias", minPoints: 3500, icon: "🎖️" },
  { rank: 7, name: "Senhor da Guerra da Dinastia Dourada", minPoints: 5000, icon: "💛" },
  { rank: 8, name: "Mestre da Espada Celestial", minPoints: 7000, icon: "✨" },
  { rank: 9, name: "Sábio do Templo Vermelho", minPoints: 9000, icon: "🏯" },
  { rank: 10, name: "Dragão Imortal do Oriente", minPoints: 10000, icon: "🐲" },
];

export const STREAK_BONUSES: StreakBonus[] = [
  { days: 1, multiplier: 1.0, points: 20 },
  { days: 2, multiplier: 1.1, points: 22 },
  { days: 3, multiplier: 1.2, points: 24 },
  { days: 4, multiplier: 1.3, points: 26 },
  { days: 5, multiplier: 1.5, points: 30 },
  { days: 7, multiplier: 1.7, points: 34 },
  { days: 14, multiplier: 2.0, points: 40 },
  { days: 21, multiplier: 2.5, points: 50 },
  { days: 30, multiplier: 3.0, points: 60 },
];

export const BASE_POINTS = 20;
