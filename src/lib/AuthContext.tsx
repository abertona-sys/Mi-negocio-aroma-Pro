import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("¡Sesión iniciada con éxito!");
    } catch (error: any) {
      console.error("Error de autenticación Firebase:", error);
      if (error?.code === "auth/unauthorized-domain") {
        toast.error("Error: Dominio no autorizado en Firebase", {
          description: `Debes agregar "${window.location.hostname}" en la consola de Firebase > Authentication > Ajustes > Dominios autorizados.`,
          duration: 10000,
        });
      } else if (error?.code === "auth/popup-blocked") {
        toast.error("Ventana emergente bloqueada", {
          description: "Por favor habilita las ventanas emergentes en tu navegador para poder iniciar sesión con Google.",
          duration: 8000,
        });
      } else {
        toast.error("Error al iniciar sesión", {
          description: error?.message || "No se pudo conectar con Firebase Auth.",
          duration: 8000,
        });
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada");
    } catch (error: any) {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
