import { useHabits } from "@/hooks/useHabits";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { UserRankDisplay } from "@/components/UserRankDisplay";
import { HabitPointsDisplay } from "@/components/HabitPointsDisplay";
import { TitlesProgression } from "@/components/TitlesProgression";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { Button } from "@/components/ui/button";
import { Sprout, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit, loading } = useHabits();
  const { stats } = useGamification(habits);
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirecionamento manual para garantir que funciona imediatamente
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Carregando seus hábitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sprout className="w-10 h-10 text-growth" />
                <h1 className="text-4xl font-bold text-foreground">Kaizen</h1>
              </div>
              
              {user && (
                <div className="mb-4">
                  {profile?.full_name && (
                    <p className="text-lg text-muted-foreground mb-2">
                      Olá, {profile.full_name}!
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              )}
              
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

            {/* Habits Grid */}
            {habits.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">você não tem nenhum hábito</p>
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

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <LeaderboardPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
