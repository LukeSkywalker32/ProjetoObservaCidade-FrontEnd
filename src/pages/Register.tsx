import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  AddressAutocomplete,
  type SelectedAddress,
} from "../components/AddressAutocomplete";
import { OCCURRENCE_TYPES } from "../constants/occurrenceTypes";
import { api } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // ✅ NOVO: armazena cidade/estado/coords do endereço SELECIONADO no autocomplete.
  // Se user digitou manualmente (sem escolher sugestão), fica null e o backend geocodifica.
  const [selectedAddress, setSelectedAddress] =
    useState<SelectedAddress | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !description || !location) {
      return toast.error("Preencha todos os campos obrigatórios");
    }

    try {
      setLoading(true);

      // ✅ Prioridade de coordenadas:
      // 1. Endereço selecionado no autocomplete (preciso, sem geocoding)
      // 2. Localização do usuário via Geolocation
      // 3. Backend geocodifica o endereço digitado (fallback)
      const latitude = selectedAddress?.lat ?? userCoords?.lat;
      const longitude = selectedAddress?.lng ?? userCoords?.lng;

      await api.post("/private/occurrences", {
        type,
        description,
        address: location,
        latitude,
        longitude,
        city: selectedAddress?.city || undefined,
        state: selectedAddress?.state || undefined,
      });

      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return (
            typeof key === "string" &&
            (key.includes("/public/occurrences") ||
              key.includes("/private/occurrences"))
          );
        },
      });

      toast.success("Ocorrência registrada com sucesso!");
      navigate("/map", { replace: true });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao registrar ocorrência";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVO: reset do selectedAddress quando user limpa ou edita o campo
  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (selectedAddress && value !== selectedAddress.address) {
      // user editou manualmente após selecionar — descarta dados do autocomplete
      setSelectedAddress(null);
    }
  };

  useEffect(() => {
    const getCoords = async () => {
      try {
        const isNative =
          typeof window !== "undefined" &&
          // @ts-expect-error - Capacitor injeta global em native
          (window.Capacitor?.isNativePlatform?.() ?? false);

        if (isNative) {
          const { Geolocation } = await import("@capacitor/geolocation");
          const permission = await Geolocation.requestPermissions();
          if (permission.location === "granted") {
            const position = await Geolocation.getCurrentPosition();
            setUserCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          }
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserCoords({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.warn("Geolocation não disponível:", error.message);
            },
            { timeout: 10000 },
          );
        }
      } catch (error) {
        console.error("Erro ao obter localização:", error);
      }
    };
    getCoords();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      <div className="bg-[#1e3a8a] px-6 py-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/map")}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            type="button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Registrar Ocorrência</h1>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#92400e] leading-relaxed">
                Registre apenas informações verídicas. Os dados são
                compartilhados com a comunidade para fins de conscientização.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          >
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-[#1e3a8a] mb-3"
              >
                Tipo de ocorrência *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(OCCURRENCE_TYPES).map(([value, option]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      type === value
                        ? "border-[#2563eb] bg-[#eff6ff]"
                        : "border-[#e5e7eb] bg-white hover:border-[#cbd5e1]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <span className="text-xs text-[#6b7280]">Tipo</span>
                    </div>
                    <p className="text-sm font-medium text-[#1e3a8a] text-left">
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[#1e3a8a] mb-2"
              >
                Descrição *
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-[#6b7280]" />
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none transition-colors resize-none text-black"
                  placeholder="Descreva o que foi observado..."
                  rows={4}
                />
              </div>
              <p className="text-xs text-[#6b7280] mt-1">
                Evite informações pessoais ou sensíveis
              </p>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-[#1e3a8a] mb-2"
              >
                Localização *
              </label>
              <AddressAutocomplete
                value={location}
                onChange={handleLocationChange}
                onSelect={(data) => setSelectedAddress(data)}
                userLocation={userCoords}
                placeholder="Digite o endereço da ocorrência..."
              />
              <p className="text-xs text-[#6b7280] mt-1">
                Selecione uma sugestão para preencher cidade e estado
                automaticamente.
              </p>
              {selectedAddress ? (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Endereço selecionado: {selectedAddress.city}/
                  {selectedAddress.state} ({selectedAddress.lat.toFixed(4)},{" "}
                  {selectedAddress.lng.toFixed(4)})
                </p>
              ) : userCoords ? (
                <p className="text-xs text-blue-600 mt-1">
                  📍 Sua localização atual ({userCoords.lat.toFixed(4)},{" "}
                  {userCoords.lng.toFixed(4)}) — usada se não selecionar
                  sugestão.
                </p>
              ) : (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠ Selecione uma sugestão — sem isso, cidade/estado ficam
                  "Desconhecido".
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!type || !description || loading}
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-[#d1d5db] disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 active:scale-95"
            >
              {loading ? "Enviando..." : "Enviar Registro"}
            </button>
          </form>

          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
}
