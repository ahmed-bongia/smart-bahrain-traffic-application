import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { authService } from "@/src/services/auth.service";
import type {
  User,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "@/src/types";

const TOKEN_KEY = "auth_token";

// Context shape
interface AuthContextType {
  /** The JWT token, or null when logged out */
  token: string | null;
  /** The logged-in user object, or null when logged out */
  user: User | null;
  /** True while the initial token check is happening at app start */
  isLoading: boolean;
  /** True while a login / register request is in-flight */
  isAuthenticating: boolean;
  /** Error message from the last auth action */
  authError: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  /** Re-fetch /auth/me and update the user in context */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to persist / remove token
async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
async function loadToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// Helper to convert AuthResponse into a User object
function authResponseToUser(res: AuthResponse): User {
  return {
    _id: res._id,
    cpr: res.cpr,
    name: res.name,
    phone: res.phone,
    role: res.role,
    balance: res.balance,
    totalEarned: res.totalEarned,
    createdAt: "",
    updatedAt: "",
  };
}

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Boot: restore session from secure storage
  useEffect(() => {
    (async () => {
      try {
        console.log("[Auth] Booting - loading token from storage");
        const stored = await loadToken();
        console.log("[Auth] Token loaded:", stored ? "found" : "not found");
        if (stored) {
          console.log("[Auth] Fetching user profile");
          const me = await authService.getMe(stored);
          console.log("[Auth] User profile loaded:", me?.name || me?._id);
          setToken(stored);
          setUser(me);
        }
      } catch (error) {
        console.error("[Auth] Boot error:", error instanceof Error ? error.message : error);
        // Token expired or invalid - clear it silently
        await removeToken();
      } finally {
        console.log("[Auth] Boot complete");
        setIsLoading(false);
      }
    })();
  }, []);

  // Login
  const login = useCallback(async (payload: LoginPayload) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await authService.login(payload);
      await saveToken(res.token);
      setToken(res.token);
      setUser(authResponseToUser(res));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setAuthError(msg);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Register
  const register = useCallback(async (payload: RegisterPayload) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await authService.register(payload);
      await saveToken(res.token);
      setToken(res.token);
      setUser(authResponseToUser(res));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setAuthError(msg);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  }, []);

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const me = await authService.getMe(token);
      setUser(me);
    } catch {
      // If refresh fails the token is likely dead - log out
      await logout();
    }
  }, [token, logout]);

  const clearError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticating,
        authError,
        login,
        register,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
