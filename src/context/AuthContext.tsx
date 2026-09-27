import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import {
  api,
  clearTokens,
  setTokens,
  getAccessToken,
} from "../services/api";

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
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guest = localStorage.getItem("isGuest");

    if (guest === "true") {
      setIsGuest(true);
    }

    if (getAccessToken()) {
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
      setUser(null);
    }
  }

  async function login(email: string, password: string): Promise<User> {
    const response = await api.post("/auth/login", {
      login: email,
      password,
    });

    const { accessToken, refreshToken, user: userData } = response.data;

    setTokens(accessToken, refreshToken);
    localStorage.removeItem("isGuest");

    setToken(accessToken);
    setUser(userData);
    setIsGuest(false);

    return userData;
  }

  async function logout(): Promise<void> {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        { refreshToken: localStorage.getItem("refreshToken") },
      );
    } catch {
      // Ignora — desloga de qualquer jeito
    }
    clearTokens();
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
