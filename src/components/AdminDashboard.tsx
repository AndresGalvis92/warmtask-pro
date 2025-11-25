/**
 * Dashboard de administrador
 * Permite crear nuevas tareas, asignarlas a usuarios y ver todas las tareas del sistema
 * Los administradores pueden ver, editar y eliminar todas las tareas
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { Plus } from "lucide-react";
import TaskStats from "./TaskStats";

interface AdminDashboardProps {
  userId: string; // ID del usuario administrador
}

// Interfaz para el objeto de tarea
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

const AdminDashboard = ({ userId }: AdminDashboardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false); // Controla la visibilidad del formulario
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Obtiene todas las tareas del sistema (admin ve todas)
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        profiles:profiles!assigned_to (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    fetchTasks();
  }, []);

  // Callback cuando se crea una tarea exitosamente
  const handleTaskCreated = () => {
    setShowForm(false);
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Panel de Administración</h2>
          <p className="text-muted-foreground mt-1">Gestiona y asigna tareas a tu equipo</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Crear Nueva Tarea</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm 
              createdBy={userId} 
              onSuccess={handleTaskCreated}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <TaskList 
        tasks={tasks} 
        loading={loading} 
        onTaskUpdated={fetchTasks}
        isAdmin={true}
      />

      <TaskStats tasks={tasks} />
    </div>
  );
};

export default AdminDashboard;
