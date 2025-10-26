import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TaskList from "./TaskList";
import TaskStats from "./TaskStats";

interface UserDashboardProps {
  userId: string;
}

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

const UserDashboard = ({ userId }: UserDashboardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar tus tareas",
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Mis Tareas</h2>
        <p className="text-muted-foreground mt-1">Gestiona tus tareas asignadas</p>
      </div>

      <TaskList 
        tasks={tasks} 
        loading={loading} 
        onTaskUpdated={fetchTasks}
        isAdmin={false}
      />

      <TaskStats tasks={tasks} />
    </div>
  );
};

export default UserDashboard;
