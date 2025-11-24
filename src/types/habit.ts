export interface Habit {
  id: string;
  name: string;
  initialMinutes: number;
  weeklyIncrement: number;
  startDate: string;
  currentWeek: number;
  completedToday: boolean;
  streak: number;
}

export interface HabitWithProgress extends Habit {
  currentMinutes: number;
}
