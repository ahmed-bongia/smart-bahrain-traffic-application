import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Admin } from "@/types";
import * as api from "@/services/api";

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount - restore session from stored token
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    api
      .getAdminMe()
      .then((data) => setAdmin(data))
      .catch(() => {
        // Token expired or invalid - clear it
        localStorage.removeItem("dashboard_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.adminLogin({ email, password });
    localStorage.setItem("dashboard_token", data.token);
    setAdmin({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await api.adminRegister({ name, email, password });
      localStorage.setItem("dashboard_token", data.token);
      setAdmin({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("dashboard_token");
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: admin !== null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

