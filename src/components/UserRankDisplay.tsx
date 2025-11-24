import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UserStats, TITLES } from "@/types/gamification";
import { getProgressToNextTitle, getPointsToNextTitle } from "@/hooks/useGamification";

interface UserRankDisplayProps {
  stats: UserStats;
}

export const UserRankDisplay = ({ stats }: UserRankDisplayProps) => {
  const pointsToNext = getPointsToNextTitle(stats.totalPoints);
  const progress = getProgressToNextTitle(stats.totalPoints);
  const isMaxRank = stats.currentRank === TITLES.length;

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {stats.currentTitle.icon} {stats.currentTitle.name}
          </CardTitle>
          <Badge variant="outline" className="text-lg">
            Nível {stats.currentRank}/10
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pontuação Total */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Pontuação Total
            </span>
            <span className="text-2xl font-bold text-amber-600">
              {stats.totalPoints}
            </span>
          </div>
        </div>

        {/* Progresso para Próximo Título */}
        {!isMaxRank && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Próximo Título
              </span>
              <span className="text-sm text-gray-600">
                {pointsToNext} pontos restantes
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {progress}% para{" "}
              <span className="font-semibold">
                {TITLES[stats.currentRank]?.name}
              </span>
            </p>
          </div>
        )}

        {isMaxRank && (
          <div className="text-center p-3 bg-amber-100 rounded-lg border border-amber-300">
            <p className="text-sm font-bold text-amber-900">
              🏆 Você atingiu o nível máximo!
            </p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-amber-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Hábitos Hoje</p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.completedHabitsCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Melhor Streak</p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.currentStreak}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
