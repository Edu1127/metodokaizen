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
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HabitHistoryDialogProps {
  habit: HabitWithProgress;
}

export const HabitHistoryDialog = ({ habit }: HabitHistoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const totalDays = habit.completionHistory.length;

  // Convert completion history to Date objects
  const completedDates = habit.completionHistory.map(dateStr => parseISO(dateStr));

  // Custom modifiers for the calendar
  const modifiers = {
    completed: completedDates,
  };

  const modifiersStyles = {
    completed: {
      backgroundColor: "hsl(var(--growth))",
      color: "white",
      fontWeight: "bold",
    },
  };

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

          {/* Calendar */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground">
              Calendário de Conclusões
            </h4>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                locale={ptBR}
                className="rounded-md border"
              />
            </div>
            {totalDays === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">
                  Nenhum dia concluído ainda. Comece hoje!
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
