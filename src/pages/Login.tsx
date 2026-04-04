import { Eye, Lock, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTimeout(() => {
        toast.success(`Bem-vindo, ${user.fullName}!`);
        //toast.info("Fazendo login...");
      }, 1000);
      const user = await login(email, password);

      setTimeout(() => {
        //se o usuário for admin, redireciona para a página de admin, senão redireciona para o mapa
        if (user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/map");
        }
      }, 1000);
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao realizar login";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      {/* Header */}
      <div className="bg-[#1e3a8a] pt-12 pb-24 px-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <h1 className="text-2xl font-bold text-white">ObservaCidade</h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 -mt-16 px-6">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#1e3a8a] mb-2 text-center">
            Bem-vindo de volta
          </h2>
          <p className="text-sm text-[#6b7280] mb-8 text-center">
            Entre para acessar o mapa de ocorrências
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                E-mail ou CPF
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none transition-colors text-black"
                  placeholder="Digite seu e-mail ou CPF"
                  required
                />
              </div>
            </div>
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none transition-colors text-black"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>
            {/* Info Text */}
            <div className="flex items-start gap-2 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-3">
              <Shield className="w-5 h-5 text-[#2563eb] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#1e3a8a] leading-relaxed">
                Faça login para garantir a confiabilidade das informações
                registradas.
              </p>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 active:scale-95"
            >
              Entrar
            </button>
            {/* Botão para continuar como visitante */}
            <button
              type="button"
              onClick={() => setShowGuestModal(true)}
              className="w-full border-2 border-[#e5e7eb] hover:border-[#2563eb]
              text-[#6b7280] hover:text-[#2563eb] font-semibold py-4 rounded-xl
              transition-all duration-200 active:scale-95"
            >
              Continuar como visitante
            </button>
            {/* Modal para visitante */}
            {showGuestModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#fef3c7] rounded-full mx-auto mb-4">
                      <Eye className="w-6 h-6 text-[#d97706]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a8a] text-center mb-2">
                      Modo Visitante
                    </h3>
                    <p className="text-sm text-[#6b7280] text-center leading-relaxed mb-6">
                      Você poderá <strong>visualizar as ocorrências</strong> no
                      mapa, mas para{" "}
                      <strong>registrar uma nova ocorrência</strong> será
                      necessário criar uma conta.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          localStorage.setItem("isGuest", "true");
                          navigate("/map");
                        }}
                        className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-95"
                      >
                        Entendi, continuar
                      </button>
                      <button
                        onClick={() => setShowGuestModal(false)}
                        className="w-full border-2 border-[#e5e7eb] text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] font-semibold py-3 rounded-xl transition-all duration-200"
                      >
                        Voltar
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            <p>
              Não tem conta?{" "}
              <span
                onClick={() => navigate("/signup")}
                style={{ cursor: "pointer", color: "blue" }}
                className="font-medium hover:underline"
              >
                Criar conta
              </span>
            </p>
          </div>
        </div>
        <div className="h-8"></div>
      </div>
    </div>
  );
}
