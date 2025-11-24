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
import { Calendar } from "@/components/ui/calendar";
import { History } from "lucide-react";
import { parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface HabitHistoryDialogProps {
  habit: HabitWithProgress;
}

export const HabitHistoryDialog = ({ habit }: HabitHistoryDialogProps) => {
  const [open, setOpen] = useState(false);

  // Convert completion history strings to Date objects
  const completedDates = habit.completionHistory.map(dateStr => parseISO(dateStr));
  
  // Custom matcher to highlight completed dates
  const isCompletedDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habit.completionHistory.includes(dateStr);
  };

  const totalDays = habit.completionHistory.length;
  const startDate = parseISO(habit.startDate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Ver Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="multiple"
              selected={completedDates}
              defaultMonth={startDate}
              fromDate={startDate}
              toDate={new Date()}
              className={cn("rounded-md border pointer-events-auto")}
              modifiers={{
                completed: isCompletedDate
              }}
              modifiersStyles={{
                completed: {
                  backgroundColor: "hsl(var(--growth))",
                  color: "white",
                  fontWeight: "bold"
                }
              }}
              disabled={(date) => date > new Date() || date < startDate}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-growth"></div>
              <span className="text-muted-foreground">Dia concluído</span>
            </div>
          </div>

          {/* Recent completions list */}
          {totalDays > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground">
                Últimas conclusões
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {habit.completionHistory
                  .slice()
                  .sort()
                  .reverse()
                  .slice(0, 10)
                  .map((date) => (
                    <div
                      key={date}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-growth"></div>
                      {new Date(date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {totalDays === 0 && (
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
