import { useNavigate } from "react-router";
import { CheckCircle, Eye, Info } from "lucide-react";

export default function Confirmation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a8a] to-[#2563eb] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Success Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-20 h-20 text-[#10b981]" />
          </div>
          <div className="absolute inset-0 w-32 h-32 bg-[#10b981]/20 rounded-full animate-ping"></div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-white mb-3 text-center">
          Ocorrência registrada com sucesso!
        </h1>

        <p className="text-lg text-blue-100 mb-8 text-center leading-relaxed">
          Sua contribuição ajuda a manter a comunidade informada
        </p>

        {/* Info Card */}
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-[#f59e0b] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-semibold mb-2">
                Importante
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                As informações registradas são de caráter
                colaborativo e utilizadas como apoio à segurança
                comunitária.
              </p>
              <p className="text-sm text-blue-100 leading-relaxed mt-2">
                Este registro não substitui a comunicação
                oficial com órgãos de segurança pública.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={() => navigate("/map")}
            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold py-4 rounded-full shadow-lg transition-all duration-200 active:scale-95"
          >
            Voltar ao mapa
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-4 rounded-full border-2 border-white/30 transition-all duration-200 active:scale-95"
          >
            Registrar outra ocorrência
          </button>
        </div>

        {/* App Branding */}
        <div className="mt-12 flex items-center gap-2 opacity-70">
          <Eye className="w-5 h-5 text-white" />
          <span className="text-sm text-white">
            ObservaCidade
          </span>
        </div>
      </div>
    </div>
  );
}