import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddHabitDialogProps {
  onAdd: (name: string, initialMinutes: number, weeklyIncrement: number) => void;
}

export const AddHabitDialog = ({ onAdd }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [initialMinutes, setInitialMinutes] = useState("10");
  const [weeklyIncrement, setWeeklyIncrement] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Por favor, adicione um nome para o hábito");
      return;
    }

    const initial = parseInt(initialMinutes);
    const increment = parseInt(weeklyIncrement);

    if (isNaN(initial) || initial < 1) {
      toast.error("Tempo inicial deve ser pelo menos 1 minuto");
      return;
    }

    if (isNaN(increment) || increment < 1) {
      toast.error("Incremento deve ser pelo menos 1 minuto");
      return;
    }

    onAdd(name, initial, increment);
    toast.success("Hábito adicionado com sucesso!");
    
    // Reset form
    setName("");
    setInitialMinutes("10");
    setWeeklyIncrement("5");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-growth hover:bg-growth/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Hábito</DialogTitle>
          <DialogDescription>
            Crie um novo hábito e defina seu crescimento Kaizen
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Hábito</Label>
            <Input
              id="name"
              placeholder="Ex: Meditação, Leitura, Exercício..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initial">Tempo Inicial (minutos/dia)</Label>
            <Input
              id="initial"
              type="number"
              min="1"
              value={initialMinutes}
              onChange={(e) => setInitialMinutes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comece pequeno para manter a consistência
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="increment">Incremento Semanal (minutos)</Label>
            <Input
              id="increment"
              type="number"
              min="1"
              value={weeklyIncrement}
              onChange={(e) => setWeeklyIncrement(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Quanto aumentar a cada semana
            </p>
          </div>

          <Button type="submit" className="w-full bg-growth hover:bg-growth/90">
            Criar Hábito
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
