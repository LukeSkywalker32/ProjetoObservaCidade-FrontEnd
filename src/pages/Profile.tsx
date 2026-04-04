import {
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Eye,
  HelpCircle,
  LogOut,
  Mail,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { formatRelativeTime } from "../utils/dateUtils";

type Occurrence = {
  _id: string;
  type: string;
  description: string;
  address: string;
  createdAt: string;
};

function maskCPF(cpf: string) {
  if (!cpf) return "---.***.***-**";
  return cpf.replace(/^(\d{3})\d{3}(\d{3})(\d{2})$/, "$1.***.***-$3");
}

function maskRG(rg: string) {
  if (!rg) return "--.---.---";
  return rg.replace(/^(\d{2})\d{3}(\d{3})(\d{1})$/, "$1.***.***-$3");
}

const OCCURRENCE_COLORS: Record<string, string> = {
  furto: "#ef4444",
  roubo: "#008000",
  vandalismo: "#8b5cf6",
  suspeita: "#f59e0b",
  outros: "#6b7280",
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateAvatar } = useAuth();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loadingOccurrences, setLoadingOccurrences] = useState(false);
  const [showOccurrences, setShowOccurrences] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // ↑ controla o estado de carregamento durante o upload do avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ↑ referência para o input file oculto
  // usamos ref para acionar o clique no input via botão customizado
  // evitando o input feio padrão do navegador
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
    // ↑ aciona o clique no input file oculto
  }
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // ↑ verifica se um arquivo foi selecionado

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      // ↑ cria o FormData com o campo "avatar" que o backend espera

      const response = await api.post("/private/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // ↑ necessário para o multer processar o arquivo corretamente
      });

      updateAvatar(response.data.avatarUrl);
      // ↑ atualiza o contexto com a nova URL sem precisar recarregar a página
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      toast.error("Erro ao atualizar foto de perfil");
    } finally {
      setUploadingAvatar(false);
      // ↑ desativa o loading independente de sucesso ou erro
    }
  };

  // ↑ função para buscar as ocorrências do usuário
  const fetchMyOccurrences = async () => {
    if (occurrences.length > 0) {
      setShowOccurrences((prev) => !prev);
      return;
    }
    setShowOccurrences(true);
    setLoadingOccurrences(true);
    try {
      const response = await api.get("/private/occurrences/me");
      setOccurrences(response.data);
    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);
    } finally {
      setLoadingOccurrences(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-primary px-6 py-6 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Eye className="w-7 h-7 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Meu Perfil
              </h1>
              <p className="text-xs text-blue-200 font-medium">
                Gerencie suas informações
              </p>
            </div>
          </div>

          {/* Avatar com botão de upload */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 bg-white/20 rounded-xl overflow-hidden border-2 border-white shadow-lg">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Foto de Perfil"
                  className="w-full h-full object-cover"
                />
                // ↑ exibe o avatar do usuário se existir
                // usa avatarUrl em vez de documentUrl que era exibido antes
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <User size={28} />
                  {/* ↑ ícone padrão quando não tem foto de perfil */}
                </div>
              )}
            </div>

            {/* Botão de câmera sobre o avatar */}
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#f59e0b] hover:bg-[#d97706] rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
            >
              {/* ↑ botão posicionado no canto inferior direito do avatar */}
              {/* absolute com -bottom-1 -right-1 para ficar fora do container */}
              {uploadingAvatar ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                // ↑ spinner de carregamento durante o upload
              ) : (
                <Camera size={14} className="text-white" />
                // ↑ ícone de câmera indicando que é possível trocar a foto
              )}
            </button>

            {/* Input file oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleAvatarChange}
              className="hidden"
            // ↑ input invisível acionado pelo botão de câmera
            // accept limita apenas imagens — não permite PDF como no documento
            />
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Dados Cadastrais */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="text-primary" size={18} />
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Dados Cadastrais
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="border-b border-gray-50 pb-4">
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">
                Nome Completo
              </label>
              <p className="text-gray-800 font-bold text-lg">
                {user?.fullName || "Usuário"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 border-b border-gray-50 pb-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest flex items-center mb-1">
                  <CreditCard size={12} className="mr-1" /> CPF
                </label>
                <p className="text-gray-700 font-semibold">
                  {maskCPF(user?.cpf || "")}
                </p>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest flex items-center mb-1">
                  <CreditCard size={12} className="mr-1" /> RG
                </label>
                <p className="text-gray-700 font-semibold">
                  {maskRG(user?.rg || "")}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest flex items-center mb-1">
                <Mail size={12} className="mr-1" /> E-mail de Contato
              </label>
              <p className="text-gray-700 font-semibold">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Minhas Ocorrências */}
        <section className="space-y-3">
          <button
            onClick={fetchMyOccurrences}
            className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-primary" />
              <span className="font-bold text-sm">Minhas Ocorrências</span>
              {occurrences.length > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {occurrences.length}
                </span>
              )}
            </div>
            {showOccurrences ? (
              <ChevronUp size={18} className="text-gray-300" />
            ) : (
              <ChevronDown size={18} className="text-gray-300" />
            )}
          </button>

          {/* Lista de Ocorrências */}
          {showOccurrences && (
            <div className="space-y-3 animate-slide-down">
              {loadingOccurrences ? (
                <div className="bg-white rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-400">Carregando...</p>
                </div>
              ) : occurrences.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                  <AlertTriangle
                    size={32}
                    className="text-gray-300 mx-auto mb-2"
                  />
                  <p className="text-sm font-semibold text-gray-400">
                    Nenhuma ocorrência registrada
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Suas ocorrências aparecerão aqui
                  </p>
                </div>
              ) : (
                occurrences.map((occ) => {
                  const color =
                    OCCURRENCE_COLORS[occ.type.toLowerCase().trim()] ??
                    "#6b7280";
                  return (
                    <div
                      key={occ._id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
                    >
                      {/* Tipo + Data */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full text-white uppercase tracking-wide"
                          style={{ backgroundColor: color }}
                        >
                          {occ.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(occ.createdAt)}
                        </span>
                      </div>

                      {/* Descrição */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {occ.description}
                      </p>

                      {/* Endereço */}
                      <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-2">
                        <MapPin
                          size={20}
                          className="text-primary flex-shrink-0 mt-0.5"
                        />
                        <p
                          className="text-sm font-medium
                        ; text-gray-500"
                        >
                          {occ.address}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black flex items-center justify-center shadow-sm active:bg-red-50 transition-all mt-8"
        >
          <LogOut size={20} className="mr-2" />
          ENCERRAR SESSÃO
        </button>
      </main>

      {/* Navegação Inferior */}
      <nav className="bg-white border-t border-gray-200 px-8 py-4 flex justify-around items-center">
        <button
          onClick={() => navigate("/map")}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <MapPin className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Mapa</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-primary">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Perfil</span>
        </button>

        <button
          onClick={() => navigate("/help")}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <HelpCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Ajuda</span>
        </button>
      </nav>
    </div>
  );
};

export default Profile;
