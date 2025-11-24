export interface Habit {
  id: string;
  name: string;
  initialMinutes: number;
  weeklyIncrement: number;
  startDate: string;
  currentWeek: number;
  completedToday: boolean;
  streak: number;
  completionHistory: string[]; // Array of ISO date strings
}

export interface HabitWithProgress extends Habit {
  currentMinutes: number;
}
