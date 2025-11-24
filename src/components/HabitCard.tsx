import { HabitWithProgress } from "@/types/habit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, TrendingUp } from "lucide-react";
import { differenceInWeeks, startOfDay } from "date-fns";
import { HabitHistoryDialog } from "@/components/HabitHistoryDialog";
import { calculateHabitPoints } from "@/hooks/useGamification";

interface HabitCardProps {
  habit: HabitWithProgress;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HabitCard = ({ habit, onToggle, onDelete }: HabitCardProps) => {
  const weeksPassed = differenceInWeeks(
    startOfDay(new Date()),
    startOfDay(new Date(habit.startDate))
  );
  const habitPoints = calculateHabitPoints(habit.streak);

  return (
    <Card className="p-6 transition-all hover:shadow-lg border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {habit.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            Semana {weeksPassed + 1}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {habitPoints > 0 && (
            <Badge className="bg-amber-600">⭐ {habitPoints} pts</Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(habit.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-growth" />
          <span className="text-2xl font-bold text-growth">
            {habit.currentMinutes} min
          </span>
          <span className="text-sm text-muted-foreground">por dia</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Incremento semanal: +{habit.weeklyIncrement} min
          </span>
          <span className="text-muted-foreground">
            🔥 {habit.streak} dias
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onToggle(habit.id)}
            className={`flex-1 ${
              habit.completedToday
                ? "bg-growth hover:bg-growth/90"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {habit.completedToday ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Concluído hoje!
              </>
            ) : (
              "Marcar como concluído"
            )}
          </Button>
        </div>

        <div className="mt-3">
          <HabitHistoryDialog habit={habit} />
        </div>
      </div>
    </Card>
  );
};
