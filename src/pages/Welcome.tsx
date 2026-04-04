import { useNavigate } from "react-router-dom";
import { Eye, Shield, MapPin, BarChart3 } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-b from-[#1e3a8a] to-[#2563eb] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center text-center animate-fade-in">
        {/* Logo Icon */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Eye className="w-12 h-12 text-[#1e3a8a]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#f59e0b] rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-3">
          ObservaCidade
        </h1>

        {/* Slogan */}
        <p className="text-lg text-blue-100 mb-12 leading-relaxed">
          Plataforma colaborativa de apoio à segurança
          comunitária
        </p>

        {/* Illustration */}
        <div className="w-full mb-12">
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 overflow-hidden">

            {/* Glow decorativo */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

            {/* Ícones principais */}
            <div className="flex justify-center items-center gap-8 mb-8 relative z-10">
              <div className="w-20 h-20 flex items-center justify-center bg-white/30 rounded-2xl transition-all duration-300 hover:scale-110 hover:bg-white/30">
                <MapPin size={30} />
              </div>
              <div className="w-20 h-20 flex items-center justify-center bg-white/30 rounded-2xl transition-all duration-300 hover:scale-110 hover:bg-white/30">
                <BarChart3 size={30} />
              </div>
              <div className="w-20 h-20 flex items-center justify-center bg-white/30 rounded-2xl transition-all duration-300 hover:scale-110 hover:bg-white/30">
                <Shield size={30} />
              </div>
            </div>

            {/* Barras simulando dados */}
            <div className="space-y-3 relative z-10">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-blue-400 rounded-full animate-oscillate"></div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-purple-400 rounded-full animate-oscillate2"></div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-green-400 rounded-full animate-oscillate3"></div>
              </div>
            </div>

          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold py-4 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 active:scale-95 hover:scale-[1.02]"        >
          Entrar
        </button>

        {/* Footer Text */}
        <p className="text-sm text-blue-200 mt-4 leading-relaxed">
          Plataforma de mapeamento criminal <br /> e vigilância comunitária integrada.
        </p>
      </div>
    </div>
  );
}