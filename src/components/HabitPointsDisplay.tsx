import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HabitWithProgress } from "@/types/habit";
import { calculateHabitPoints } from "@/hooks/useGamification";

interface HabitPointsDisplayProps {
  habits: HabitWithProgress[];
}

export const HabitPointsDisplay = ({ habits }: HabitPointsDisplayProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pontos por Hábito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habits.map((habit) => {
            const points = calculateHabitPoints(habit.streak);
            const streakMultiplier = (points / 20).toFixed(1);

            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{habit.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      🔥 {habit.streak} dias
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {streakMultiplier}x
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-600">{points}</p>
                  <p className="text-xs text-gray-500">pontos</p>
                </div>
              </div>
            );
          })}

          {habits.length === 0 && (
            <div className="text-center p-4 text-gray-500">
              <p className="text-sm">Nenhum hábito criado ainda</p>
            </div>
          )}

          {habits.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>💡 Dica:</strong> Mantenha streaks altos para ganhar mais pontos e subir de nível!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
