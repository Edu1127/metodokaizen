import { useHabits } from "@/hooks/useHabits";
import { useGamification } from "@/hooks/useGamification";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { UserRankDisplay } from "@/components/UserRankDisplay";
import { HabitPointsDisplay } from "@/components/HabitPointsDisplay";
import { TitlesProgression } from "@/components/TitlesProgression";
import { Sprout } from "lucide-react";

const Index = () => {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit } = useHabits();
  const { stats } = useGamification(habits);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="w-10 h-10 text-growth" />
            <h1 className="text-4xl font-bold text-foreground">Kaizen</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Melhoria contínua através de pequenos passos. Crie hábitos que crescem
            naturalmente com você, semana após semana.
          </p>
        </div>

        {/* Add Habit Button */}
        <div className="flex justify-center mb-8">
          <AddHabitDialog onAdd={addHabit} />
        </div>

        {/* Gamification Section */}
        {habits.length > 0 && (
          <div className="mb-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* User Rank Display */}
              <div className="md:col-span-2 lg:col-span-2">
                <UserRankDisplay stats={stats} />
              </div>

              {/* Habit Points Display */}
              <div>
                <HabitPointsDisplay habits={habits} />
              </div>
            </div>

            {/* Titles Progression */}
            <div className="mt-6">
              <TitlesProgression currentRank={stats.currentRank} />
            </div>
          </div>
        )}

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-growth-light mb-4">
              <Sprout className="w-8 h-8 text-growth" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Comece sua jornada Kaizen
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Adicione seu primeiro hábito e veja como pequenos passos levam a
              grandes mudanças
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>改善 - Kaizen: Mudança para melhor</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
