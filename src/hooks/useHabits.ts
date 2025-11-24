import { useState, useEffect } from "react";
import { Habit, HabitWithProgress } from "@/types/habit";
import { differenceInWeeks, startOfDay, isToday, format } from "date-fns";

const STORAGE_KEY = "kaizen-habits";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedHabits = JSON.parse(stored) as Habit[];
      const today = format(startOfDay(new Date()), "yyyy-MM-dd");
      
      // Check if habit was completed today based on completionHistory
      const updatedHabits = parsedHabits.map((habit) => {
        // Ensure completionHistory exists (for backwards compatibility)
        const completionHistory = habit.completionHistory || [];
        const wasCompletedToday = completionHistory.includes(today);
        
        return {
          ...habit,
          completionHistory,
          completedToday: wasCompletedToday,
        };
      });
      setHabits(updatedHabits);
    }
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits]);

  const calculateCurrentMinutes = (habit: Habit): number => {
    const weeksPassed = differenceInWeeks(
      startOfDay(new Date()),
      startOfDay(new Date(habit.startDate))
    );
    return habit.initialMinutes + weeksPassed * habit.weeklyIncrement;
  };

  const getHabitsWithProgress = (): HabitWithProgress[] => {
    return habits.map((habit) => ({
      ...habit,
      currentMinutes: calculateCurrentMinutes(habit),
    }));
  };

  const addHabit = (
    name: string,
    initialMinutes: number,
    weeklyIncrement: number
  ) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      initialMinutes,
      weeklyIncrement,
      startDate: new Date().toISOString(),
      currentWeek: 0,
      completedToday: false,
      streak: 0,
      completionHistory: [],
    };
    setHabits([...habits, newHabit]);
  };

  const toggleHabitCompletion = (id: string) => {
    const today = format(startOfDay(new Date()), "yyyy-MM-dd");
    
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          const newCompleted = !habit.completedToday;
          let newHistory = [...habit.completionHistory];
          
          if (newCompleted) {
            // Add today to history if not already there
            if (!newHistory.includes(today)) {
              newHistory.push(today);
            }
          } else {
            // Remove today from history
            newHistory = newHistory.filter(date => date !== today);
          }
          
          return {
            ...habit,
            completedToday: newCompleted,
            completionHistory: newHistory,
            streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
          };
        }
        return habit;
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  return {
    habits: getHabitsWithProgress(),
    addHabit,
    toggleHabitCompletion,
    deleteHabit,
  };
};
