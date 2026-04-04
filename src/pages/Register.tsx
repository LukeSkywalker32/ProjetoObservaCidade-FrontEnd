import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { OCCURRENCE_TYPES } from "../constants/occurrenceTypes";


export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !description || !location) {
      return toast.error("Preencha todos os campos obrigatórios")
    }

    try {
      setLoading(true);

      //2 - Enviar para o backend
      await api.post("/private/occurrences", {
        type,
        description,
        address: location,
      });

      toast.success("Ocorrência registrada com sucesso!");
      navigate("/map", { replace: true });

    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao registrar ocorrência";

      toast.error(message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      {/* Header */}
      <div className="bg-[#1e3a8a] px-6 py-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/map")}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">
            Registrar Ocorrência
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {/* Info Alert */}
          <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#92400e] leading-relaxed">
                Registre apenas informações verídicas. Os dados
                são compartilhados com a comunidade para fins de
                conscientização.
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          >
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[#1e3a8a] mb-3">
                Tipo de ocorrência *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(OCCURRENCE_TYPES).map(([value, option]) => (
                  < button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`p-4 rounded-xl border-2 transition-all ${type === value
                      ? "border-[#2563eb] bg-[#eff6ff]"
                      : "border-[#e5e7eb] bg-white hover:border-[#cbd5e1]"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <span className="text-xs text-[#6b7280]">
                        Tipo
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#1e3a8a] text-left">
                      {option.label}
                    </p>
                  </button>
                ))
                }
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                Descrição *
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-[#6b7280]" />
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none transition-colors resize-none text-black"
                  placeholder="Descreva o que foi observado..."
                  rows={4}
                />
              </div>
              <p className="text-xs text-[#6b7280] mt-1">
                Evite informações pessoais ou sensíveis
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                Localização
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10b981]" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none transition-colors bg-[#f9fafb] text-black"
                  placeholder="Digite a localização aproximada"
                />
              </div>
              <p className="text-xs text-[#6b7280] mt-1">
                Exemplo: Rua Exemplo, 123 - Centro - São Paulo - SP
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!type || !description || loading}
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-[#d1d5db] disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 active:scale-95"
            >
              {loading ? "Enviando..." : "Enviar Registro"}
            </button>
          </form>

          {/* Bottom Spacing */}
          <div className="h-8"></div>
        </div>
      </div >
    </div >
  );
}