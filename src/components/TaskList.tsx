import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onTaskUpdated: () => void;
  isAdmin: boolean;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
};

const statusLabels = {
  pending: "Pendiente",
  in_progress: "En Progreso",
  completed: "Completada",
};

const TaskList = ({ tasks, loading, onTaskUpdated, isAdmin }: TaskListProps) => {
  const { toast } = useToast();

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Obtener el usuario actual y su perfil
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Obtener perfil del usuario actual
    const { data: currentUserProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Obtener información de la tarea para la notificación
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Actualizar el estado de la tarea
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus as "pending" | "in_progress" | "completed" })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
      return;
    }

    // Crear notificación para el usuario asignado (si es diferente al usuario actual)
    if (task.assigned_to && task.assigned_to !== user.id) {
      await supabase.from("notifications").insert({
        user_id: task.assigned_to,
        title: "Estado de tarea actualizado",
        message: `${currentUserProfile?.full_name || "Un usuario"} cambió el estado de "${task.title}" a ${statusLabels[newStatus as keyof typeof statusLabels]}`,
        type: "task_update",
        link: "/dashboard"
      });
    }

    toast({
      title: "Estado actualizado",
      description: "El estado de la tarea ha sido actualizado",
    });
    onTaskUpdated();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarea?")) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente",
      });
      onTaskUpdated();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No hay tareas {isAdmin ? "creadas" : "asignadas"} todavía
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.id} className="shadow-soft hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <Badge
                variant="outline"
                className={statusColors[task.status as keyof typeof statusColors]}
              >
                {statusLabels[task.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {task.description}
              </p>
            )}
            
            {task.profiles && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {task.profiles.full_name}
                </span>
              </div>
            )}

            {task.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(new Date(task.due_date), "dd 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Select
                value={task.status}
                onValueChange={(value) => handleStatusChange(task.id, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
