import type { LatLngExpression } from "leaflet";
import {
  AlertTriangle,
  Eye,
  HelpCircle,
  LogOut,
  MapPin,
  Plus,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useLocation, useNavigate } from "react-router";
import { RecenterMap } from "../components/Recentermap";
import { OCCURRENCE_TYPES } from "../constants/occurrenceTypes";
import { OccurrenceBase, useOccurrences } from "../hooks/useOccurrences";
import { api } from "../services/api";
import { formatRelativeTime } from "../utils/dateUtils";
import { createMarkerIcon } from "../utils/getMarkerIcon";

type Occurrence = OccurrenceBase & {
	description: string;
	latitude: number;
	longitude: number;
};

export default function Map() {
	const navigate = useNavigate();
	const location = useLocation();
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isGuest, setIsGuest] = useState(() => {
		const stored = localStorage.getItem("isGuest");
		return stored === "true" || location.state?.isGuest || false;
	});
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [cityName, setCityName] = useState<string>("Buscando...");

	// Hook unificado — substitui o useEffect + useState antigos
	const {
		occurrences,
		loading,
		hasNext,
		nextPage,
		total,
	} = useOccurrences<Occurrence>({
		endpoint: "/public/occurrences",
		limit: 100, // mapa mostra mais
	});

	// Atualiza o estado de isGuest quando location state muda
	useEffect(() => {
		const stored = localStorage.getItem("isGuest");
		const newIsGuest = stored === "true" || location.state?.isGuest || false;
		setIsGuest(newIsGuest);
	}, [location.state]);

	// Buscar localização do usuário (web e nativo)
	useEffect(() => {
		const getLocation = async () => {
			try {
				// Detecta plataforma — Capacitor funciona só no Android/iOS
				const isNative =
					typeof window !== "undefined" &&
					// @ts-expect-error - Capacitor injeta essa var global no native
					(window.Capacitor?.isNativePlatform?.() ?? false);

				if (isNative) {
					const { Geolocation } = await import("@capacitor/geolocation");
					const permission = await Geolocation.requestPermissions();
					if (permission.location === "granted") {
						const position = await Geolocation.getCurrentPosition();
						setUserLocation({
							lat: position.coords.latitude,
							lng: position.coords.longitude,
						});
					}
				} else if (navigator.geolocation) {
					// Web — usa API nativa do navegador
					navigator.geolocation.getCurrentPosition(
						(position) => {
							setUserLocation({
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
		getLocation();
	}, []);

	// Buscar nome da cidade
	useEffect(() => {
		if (userLocation && !isGuest) {
			const fetchCity = async () => {
				try {
					const response = await api.get("/private/geocode/city", {
						params: {
							lat: userLocation.lat,
							lng: userLocation.lng,
						},
					});
					setCityName(response.data.city);
				} catch (error) {
					setCityName("");
				}
			};
			fetchCity();
		} else {
			setCityName("");
		}
	}, [userLocation, isGuest]);

	// Logout
	const handleLogout = () => {
		setShowLogoutModal(false);
		localStorage.removeItem("isGuest");
		navigate("/login");
	};

	// Centro do mapa — localização do usuário > primeira ocorrência > SP
	const center: LatLngExpression =
		userLocation ||
		(occurrences.length
			? {
					lat: occurrences[0].latitude,
					lng: occurrences[0].longitude,
				}
			: { lat: -23.5505, lng: -46.6333 });

	return (
		<div className="min-h-screen bg-[#f3f4f6] flex flex-col">
			{/* Header */}
			<div className="bg-primary px-6 py-4 shadow-md">
				<div className="max-w-md mx-auto flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Eye className="w-6 h-6 text-white" />
						<h1 className="text-xl font-bold text-white">ObservaCidade</h1>
					</div>
					<div className="flex items-center gap-3">
						{!isGuest && cityName && (
							<span className="text-white text-sm font-medium bg-black/20 px-3 py-1 rounded-full">
								{cityName}
							</span>
						)}
						<MapPin className="w-6 h-6 text-[#f59e0b]" />
						<button
							type="button"
							onClick={() => setShowLogoutModal(true)}
							className="flex items-center gap-2 text-white hover:text-[#f59e0b] transition-colors"
						>
							<LogOut className="w-6 h-6" />
						</button>
					</div>
				</div>
			</div>

			{/* Map Container */}
			<div className="flex-1 p-4">
				<div className="max-w-3xl mx-auto">
					<div className="relative bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
						<div className="w-full h-[600px]">
							<MapContainer
								center={center}
								zoom={13}
								zoomControl={true}
								style={{ width: "100%", height: "100%" }}
							>
								<TileLayer
									url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									maxZoom={19}
								/>
								<RecenterMap center={center} />
								{occurrences
									.filter(
										(occ) =>
											occ.latitude !== undefined &&
											occ.longitude !== undefined &&
											occ.latitude !== null &&
											occ.longitude !== null,
									)
									.map((occ) => (
										<Marker
											key={occ._id}
											position={[Number(occ.latitude), Number(occ.longitude)]}
											icon={createMarkerIcon(
												OCCURRENCE_TYPES[
													occ.type.toLowerCase().trim() as keyof typeof OCCURRENCE_TYPES
												]?.color || "#000000",
											)}
										>
											<Popup>
												<div style={{ maxWidth: "200px" }}>
													<h3 style={{ fontWeight: "bold", marginBottom: "4px" }}>
														{occ.type.toUpperCase()}
													</h3>
													<p style={{ fontSize: "14px" }}>{occ.description}</p>
													<p style={{ fontSize: "12px", color: "#6b7280" }}>
														{formatRelativeTime(occ.createdAt)}
													</p>
												</div>
											</Popup>
										</Marker>
									))}
							</MapContainer>
						</div>

						{/* Legenda + contador */}
						<div className="absolute top-4 left-4 right-4 z-[1000]">
							<div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md">
								<div className="flex items-center justify-between mb-2">
									<p className="text-xs text-[#6b7280]">Legenda:</p>
									{total > 0 && (
										<p className="text-xs text-[#6b7280]">
											{occurrences.length}/{total} ocorrências
										</p>
									)}
								</div>
								<div className="flex flex-wrap gap-3">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
										<span className="text-xs text-[#1e3a8a]">Furto</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
										<span className="text-xs text-[#1e3a8a]">Suspeita</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
										<span className="text-xs text-[#1e3a8a]">Vandalismo</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[#008000]"></div>
										<span className="text-xs text-[#1e3a8a]">Roubo</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-[#6b7280]"></div>
										<span className="text-xs text-[#1e3a8a]">Outros</span>
									</div>
								</div>
							</div>
						</div>

						{/* Loading overlay */}
						{loading && occurrences.length === 0 && (
							<div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1001]">
								<p className="text-gray-500">Carregando mapa e ocorrências...</p>
							</div>
						)}
					</div>

					{/* Botão "Ver mais" — carrega próxima página */}
					{hasNext && (
						<div className="flex justify-center mb-4">
							<button
								type="button"
								onClick={nextPage}
								disabled={loading}
								className="bg-white border border-gray-200 text-[#1e3a8a] font-semibold py-2 px-6 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
							>
								{loading ? "Carregando..." : "Ver mais ocorrências"}
							</button>
						</div>
					)}

					{/* Info Banner */}
					<div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 mb-4">
						<div className="flex items-start gap-3">
							<AlertTriangle className="w-5 h-5 text-[#2563eb] flex-shrink-0 mt-0.5" />
							<div>
								<p className="text-sm text-[#1e3a8a] leading-relaxed">
									As informações exibidas são de caráter colaborativo e não
									substituem canais oficiais de segurança pública.
								</p>
							</div>
						</div>
					</div>

					{/* Guest Mode Banner */}
					{isGuest && (
						<div className="bg-[#fef3c7] border border-[#fcd34d] rounded-xl p-4 mb-4">
							<div className="flex items-start gap-3">
								<Eye className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-semibold text-[#92400e] mb-1">
										Modo Visualização
									</p>
									<p className="text-sm text-[#92400e] leading-relaxed">
										Você está navegando sem login. Para registrar ocorrências,
										faça login.
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Botão flutuante de Registrar Ocorrência */}
			{!isGuest && (
				<button
					type="button"
					onClick={() => navigate("/register")}
					className="fixed bottom-24 right-6 w-16 h-16 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 z-[500]"
				>
					<Plus className="w-8 h-8" />
				</button>
			)}

			{/* Bottom Navigation */}
			<div className="bg-white border-t border-[#e5e7eb] px-6 py-3 shadow-lg">
				<div className="max-w-md mx-auto flex justify-around items-center">
					<button
						type="button"
						className="flex flex-col items-center gap-1 text-[#2563eb]"
					>
						<MapPin className="w-6 h-6" />
						<span className="text-xs font-medium">Mapa</span>
					</button>
					{!isGuest && (
  <div className="flex flex-col items-center gap-1 text-[#6b7280]">
    <button
      type="button"
      onClick={() => navigate("/profile")}
      className="flex flex-col items-center gap-1 text-[#6b7280]"
    >
      <User className="w-6 h-6" />
      <span className="text-xs">Perfil</span>
    </button>
  
</div>
)}
					<button
						type="button"
						onClick={() => navigate("/help")}
						className="flex flex-col items-center gap-1 text-[#6b7280]"
					>
						<HelpCircle className="w-6 h-6" />
						<span className="text-xs">Ajuda</span>
					</button>
				</div>
			</div>

			{/* Logout Modal */}
			{showLogoutModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
					<div className="bg-white rounded-lg shadow-lg p-6 w-80">
						<div className="flex items-center justify-between mb-4">
							<p className="text-lg font-bold text-[#1e3a8a]">Sair</p>
							<button
								type="button"
								onClick={() => setShowLogoutModal(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<p className="text-sm text-[#6b7280] leading-relaxed">
							Você tem certeza que deseja sair?
						</p>
						<div className="flex justify-end mt-4">
							<button
								type="button"
								onClick={() => setShowLogoutModal(false)}
								className="text-sm text-[#6b7280] hover:text-[#1e3a8a] mr-2"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleLogout}
								className="text-sm bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-full px-3 py-1"
							>
								Sair
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
