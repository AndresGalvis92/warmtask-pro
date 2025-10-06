import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckSquare, Users, ClipboardList, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <CheckSquare className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-white">TaskFlow</h1>
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Sistema profesional de gestión de tareas para equipos empresariales
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 shadow-soft"
          >
            Comenzar Ahora
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="bg-card/95 backdrop-blur rounded-xl p-6 shadow-soft">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestión de Equipo</h3>
            <p className="text-muted-foreground">
              Administra y asigna tareas a los miembros de tu equipo de forma eficiente
            </p>
          </div>

          <div className="bg-card/95 backdrop-blur rounded-xl p-6 shadow-soft">
            <ClipboardList className="h-10 w-10 text-secondary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Control de Tareas</h3>
            <p className="text-muted-foreground">
              Seguimiento completo del estado y progreso de cada tarea asignada
            </p>
          </div>

          <div className="bg-card/95 backdrop-blur rounded-xl p-6 shadow-soft">
            <TrendingUp className="h-10 w-10 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Productividad</h3>
            <p className="text-muted-foreground">
              Aumenta la eficiencia y productividad de tu equipo con herramientas profesionales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
