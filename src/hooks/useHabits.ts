import { useState, useEffect } from "react";
import { Habit, HabitWithProgress } from "@/types/habit";
import { differenceInWeeks, startOfDay, format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "kaizen-habits";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Função para migrar dados do localStorage para Supabase
  const migrateLocalStorageToSupabase = async () => {
    if (!user) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedHabits = JSON.parse(stored) as Habit[];
        
        // Verificar se já existem hábitos no Supabase
        const { data: existingHabits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id);

        // Se não existem hábitos no Supabase, migrar do localStorage
        if (!existingHabits || existingHabits.length === 0) {
          const habitsToInsert = parsedHabits.map(habit => ({
            id: habit.id,
            user_id: user.id,
            name: habit.name,
            initial_minutes: habit.initialMinutes,
            weekly_increment: habit.weeklyIncrement,
            start_date: habit.startDate,
            current_week: habit.currentWeek,
            completed_today: habit.completedToday,
            streak: habit.streak,
            completion_history: habit.completionHistory || []
          }));

          await supabase.from('habits').insert(habitsToInsert);
          console.log('Hábitos migrados do localStorage para Supabase');
        }

        // Limpar localStorage após migração bem-sucedida
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Erro ao migrar hábitos:', error);
      }
    }
  };

  // Carregar hábitos do Supabase
  const loadHabits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const today = format(startOfDay(new Date()), "yyyy-MM-dd");
      
      // Converter dados do Supabase para o formato esperado
      const formattedHabits: Habit[] = (data || []).map(habit => ({
        id: habit.id,
        name: habit.name,
        initialMinutes: habit.initial_minutes,
        weeklyIncrement: habit.weekly_increment,
        startDate: habit.start_date,
        currentWeek: habit.current_week,
        completedToday: (habit.completion_history || []).includes(today),
        streak: habit.streak,
        completionHistory: habit.completion_history || []
      }));

      setHabits(formattedHabits);
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      migrateLocalStorageToSupabase().then(() => {
        loadHabits();
      });
    } else {
      setLoading(false);
    }
  }, [user]);

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

  const addHabit = async (
    name: string,
    initialMinutes: number,
    weeklyIncrement: number
  ) => {
    if (!user) return;

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

    try {
      const { error } = await supabase.from('habits').insert({
        id: newHabit.id,
        user_id: user.id,
        name: newHabit.name,
        initial_minutes: newHabit.initialMinutes,
        weekly_increment: newHabit.weeklyIncrement,
        start_date: newHabit.startDate,
        current_week: newHabit.currentWeek,
        completed_today: newHabit.completedToday,
        streak: newHabit.streak,
        completion_history: newHabit.completionHistory
      });

      if (error) throw error;

      setHabits([...habits, newHabit]);
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error);
    }
  };

  const toggleHabitCompletion = async (id: string) => {
    if (!user) return;

    const today = format(startOfDay(new Date()), "yyyy-MM-dd");
    
    const updatedHabits = habits.map((habit) => {
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
    });

    setHabits(updatedHabits);

    // Atualizar no Supabase
    const habitToUpdate = updatedHabits.find(h => h.id === id);
    if (habitToUpdate) {
      try {
        const { error } = await supabase
          .from('habits')
          .update({
            completed_today: habitToUpdate.completedToday,
            completion_history: habitToUpdate.completionHistory,
            streak: habitToUpdate.streak
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Erro ao atualizar hábito:', error);
      }
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(habits.filter((habit) => habit.id !== id));
    } catch (error) {
      console.error('Erro ao deletar hábito:', error);
    }
  };

  return {
    habits: getHabitsWithProgress(),
    addHabit,
    toggleHabitCompletion,
    deleteHabit,
    loading,
  };
};
