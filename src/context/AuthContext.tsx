import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  rg: string;
  documentUrl: string;
  avatarUrl: string;
  documentStatus: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const guest = localStorage.getItem("isGuest");

    if (guest === "true") {
      setIsGuest(true);
    }

    if (storedToken) {
      setToken(storedToken);
      loadUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function loadUser() {
    try {
      const response = await api.get("/private/me");
      setUser(response.data);
    } catch {
      logout();
    }
  }

  async function login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post("/auth/login", {
        login: email,
        password,
      });

      const { token: newToken, user: userData } = response.data;
      localStorage.setItem("token", newToken);
      localStorage.removeItem("isGuest");

      setToken(newToken);
      setUser(userData);
      setIsGuest(false);

      return userData;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("isGuest");
    setUser(null);
    setToken(null);
    setIsGuest(false);
  }

  function updateAvatar(avatarUrl: string) {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, avatarUrl };
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isGuest,
        loading,
        login,
        logout,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
