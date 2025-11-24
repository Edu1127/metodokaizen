import { useState } from "react";
import { HabitWithProgress } from "@/types/habit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { parseISO, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HabitHistoryDialogProps {
  habit: HabitWithProgress;
}

export const HabitHistoryDialog = ({ habit }: HabitHistoryDialogProps) => {
  const [open, setOpen] = useState(false);

  const totalDays = habit.completionHistory.length;

  // Group completions by month for display
  const completionsByMonth = habit.completionHistory.reduce((acc, dateStr) => {
    const date = parseISO(dateStr);
    const monthKey = format(date, "MMMM yyyy", { locale: ptBR });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(dateStr);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Ver Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit.name}</DialogTitle>
          <DialogDescription>
            Histórico completo de conclusões do hábito
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-growth-light rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total de dias</p>
              <p className="text-2xl font-bold text-growth">{totalDays}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Streak atual</p>
              <p className="text-2xl font-bold text-foreground">
                {habit.streak} 🔥
              </p>
            </div>
          </div>

          {/* Timeline by month */}
          {totalDays > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-foreground">
                Histórico de Conclusões
              </h4>
              <div className="space-y-4">
                {Object.entries(completionsByMonth)
                  .sort(([a], [b]) => {
                    const dateA = parseISO(completionsByMonth[a][0]);
                    const dateB = parseISO(completionsByMonth[b][0]);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map(([month, dates]) => (
                    <div key={month} className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground capitalize">
                        {month}
                      </h5>
                      <div className="grid grid-cols-7 gap-2">
                        {dates
                          .sort()
                          .reverse()
                          .map((dateStr) => {
                            const date = parseISO(dateStr);
                            const isToday = isSameDay(date, new Date());
                            return (
                              <div
                                key={dateStr}
                                className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs ${
                                  isToday
                                    ? "bg-growth text-white font-bold ring-2 ring-growth ring-offset-2"
                                    : "bg-growth-light text-growth"
                                }`}
                              >
                                <span className="text-[10px] opacity-70">
                                  {format(date, "EEE", { locale: ptBR })}
                                </span>
                                <span className="font-semibold">
                                  {format(date, "dd")}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum dia concluído ainda. Comece hoje!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
