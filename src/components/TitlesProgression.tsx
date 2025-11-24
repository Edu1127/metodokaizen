import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TITLES } from "@/types/gamification";

interface TitlesProgessionProps {
  currentRank: number;
}

export const TitlesProgression = ({ currentRank }: TitlesProgessionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progressão de Títulos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {TITLES.map((title) => {
            const isUnlocked = currentRank >= title.rank;
            const isCurrent = currentRank === title.rank;

            return (
              <div
                key={title.rank}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? "bg-amber-100 border-amber-400 shadow-md"
                    : isUnlocked
                      ? "bg-gray-50 border-gray-300"
                      : "bg-gray-50 border-gray-200 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{title.icon}</span>
                  <div>
                    <h4 className={`font-semibold text-sm ${isCurrent ? "text-amber-900" : ""}`}>
                      {title.name}
                    </h4>
                    <p className="text-xs text-gray-600">{title.minPoints} pontos</p>
                  </div>
                </div>

                <div>
                  {isCurrent && (
                    <Badge className="bg-amber-600">Atual</Badge>
                  )}
                  {isUnlocked && !isCurrent && (
                    <Badge variant="outline">Desbloqueado</Badge>
                  )}
                  {!isUnlocked && (
                    <Badge variant="secondary" className="opacity-75">
                      Bloqueado
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
