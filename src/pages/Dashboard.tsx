/**
 * Página principal del dashboard
 * Verifica autenticación y muestra el dashboard apropiado según el rol del usuario
 * Administradores ven AdminDashboard, usuarios regulares ven UserDashboard
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/AdminDashboard";
import UserDashboard from "@/components/UserDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null); // Rol del usuario (admin o user)
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  // Verificar autenticación y cargar datos del usuario al montar
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Redirigir al login si no hay sesión
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      // Obtener perfil del usuario con su nombre completo
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name);
      }

      // Obtener rol del usuario desde la tabla user_roles
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
      }

      setLoading(false);
    };

    checkAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={userRole || ""} userName={userName} userId={userId || ""} />
      <div className="container mx-auto px-4 py-8">
        {userRole === "admin" ? (
          <AdminDashboard userId={userId!} />
        ) : (
          <UserDashboard userId={userId!} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
