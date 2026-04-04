import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

interface User {
    id: string;
    fullName: string;
    email: string;
    cpf: string; // CPF do usuário
    rg: string; // RG do usuário
    documentUrl: string; // URL do documento do usuário
    avatarUrl: string; // URL do avatar do usuário
    documentStatus: string; // Status do documento do usuário
    role: string; // Role do usuário
}
interface AuthContextType {
    user: User | null;
    token: string | null;
    isGuest: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {

        const storedToken = localStorage.getItem("token");
        const guest = localStorage.getItem("isGuest");


        if (storedToken) {
            setToken(storedToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            loadUser();
        }
        if (guest === "true") {
            setIsGuest(true)
        }
    }, []);

    async function loadUser() {
        try {
            const response = await api.get("/private/me");
            setUser(response.data);
        } catch (error) {
            logout();
        }
    }

    async function login(email: string, password: string): Promise<User> {
        try {
            const response = await api.post("/auth/login", {
                login: email,
                password,
            })
            const token = response.data.token;

            localStorage.setItem("token", token)
            localStorage.removeItem("isGuest")

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setToken(token);

            const userResponse = await api.get("/private/me");
            setUser(userResponse.data);

            return userResponse.data;
        } catch (error) {
            throw error;
        }
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("isGuest");
        //api.defaults.headers.common["Authorization"];

        setUser(null);
        setToken(null);
        setIsGuest(false);
    }
    function updateAvatar(avatarUrl: string) {
        setUser((prev) => {
            if (!prev) return prev;
            return { ...prev, avatarUrl };
            // ↑ mantém todos os dados do usuário e sobrescreve apenas o avatarUrl
        });
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isGuest,
                login,
                logout,
                updateAvatar,
            }}>
            {children}
        </AuthContext.Provider>
    )

}
// hook customizado para usar o contexto
export function useAuth() {
    return useContext(AuthContext);
}