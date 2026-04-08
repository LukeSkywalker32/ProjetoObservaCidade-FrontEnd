import { Geolocation } from "@capacitor/geolocation";
import {
	GoogleMap,
	InfoWindow,
	Marker,
	useJsApiLoader,
} from "@react-google-maps/api";
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
import { useLocation, useNavigate } from "react-router";
import { OCCURRENCE_TYPES } from "../constants/occurrenceTypes";
import { api } from "../services/api";
import { formatRelativeTime } from "../utils/dateUtils";
import { createMarkerIcon } from "../utils/getMarkerIcon";

type Occurrence = {
	_id: string;
	type: string;
	latitude: number;
	longitude: number;
	description: string;
	createdAt: string;
};

export default function Map() {
	const navigate = useNavigate();
	const location = useLocation();
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
	const [loading, setLoading] = useState(true);
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: import.meta.env.VITE_GOOGLEMAPS_API_KEY,
		libraries: ["places"],
		language: "pt-BR",
	});
	// Check both location state and localStorage
	const [isGuest, setIsGuest] = useState(() => {
		const stored = localStorage.getItem("isGuest");
		return stored === "true" || location.state?.isGuest || false;
	});
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [selectedOccurrence, setSelectedOccurrence] =
		useState<Occurrence | null>(null);
	const [cityName, setCityName] = useState<string>("Buscando...");

	// Buscar ocorrências no banco de dados
	useEffect(() => {
		const fetchOccurrences = async () => {
			setLoading(true);
			try {
				const response = await api.get("/public/occurrences");
				setOccurrences(response.data);
			} catch (error: any) {
				console.error("Erro ao carregar ocorrências:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchOccurrences();
	}, []);

	// Atualiza o estado de isGuest quando location state muda
	useEffect(() => {
		const stored = localStorage.getItem("isGuest");
		const newIsGuest = stored === "true" || location.state?.isGuest || false;
		setIsGuest(newIsGuest);
	}, [location.state]);

	// Buscar localização do usuário
	useEffect(() => {
		const getLocation = async () => {
			try {
				const permission = await Geolocation.requestPermissions();

				if (permission.location === "granted") {
					const position = await Geolocation.getCurrentPosition();

					setUserLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
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
					setCityName(""); //Silencia o erro
				}
			};
			fetchCity();
		} else {
			setCityName(""); //Se for convidado e não tiver localização, deixa vazio
		}
	}, [userLocation, isGuest]);

	// Logout
	const handleLogout = () => {
		setShowLogoutModal(false);
		localStorage.removeItem("isGuest");
		navigate("/login");
	};

	// centro do mapa usando a localização do usuário ou padão
	const center =
		userLocation || // 1° prioridade
		(occurrences.length
			? {
					lat: occurrences[0].latitude,
					lng: occurrences[0].longitude,
				}
			: { lat: -23.5505, lng: -46.6333 }); // Default location: São Paulo

	if (loading)
		return (
			<div className="p-8 text-center">Carregando mapa e ocorrências...</div>
		);

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
						{/** NOME DA CIDADE A ESQUERDA DO MAP PIN */}
						{!isGuest && cityName && (
							<span className="text-white text-sm font-medium bg-black/20 px-3 py-1 rounded-full">
								{cityName}
							</span>
						)}
						<MapPin className="w-6 h-6 text-[#f59e0b]" />
						<button
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
					{/* Map */}
					<div className="relative bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
						{/* Map Background */}
						<div className="w-full h-[600px]">
							{!isLoaded || loading ? (
								<p>Carregando mapa...</p>
							) : (
								<GoogleMap
									//key={occurrences.length}
									mapContainerStyle={{ width: "100%", height: "100%" }}
									center={center}
									zoom={13}
									options={{
										mapTypeControl: false,
										streetViewControl: false,
										fullscreenControl: false,
										zoomControl: true,
										styles: [
											{
												featureType: "poi",
												elementType: "labels",
												stylers: [{ visibility: "off" }],
											},
										],
									}}
								>
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
												position={{
													lat: Number(occ.latitude),
													lng: Number(occ.longitude),
												}}
												icon={createMarkerIcon(
													OCCURRENCE_TYPES[
														occ.type
															.toLowerCase()
															.trim() as keyof typeof OCCURRENCE_TYPES
													]?.color || "#000000",
												)}
												onClick={() => setSelectedOccurrence(occ)}
											/>
										))}
									{selectedOccurrence && (
										<InfoWindow
											position={{
												lat: selectedOccurrence.latitude,
												lng: selectedOccurrence.longitude,
											}}
											onCloseClick={() => setSelectedOccurrence(null)}
										>
											<div style={{ maxWidth: "200px" }}>
												<h3 style={{ fontWeight: "bold", marginBottom: "4px" }}>
													{selectedOccurrence.type.toUpperCase()}
												</h3>
												<p style={{ fontSize: "14px" }}>
													{selectedOccurrence.description}
												</p>
												<p style={{ fontSize: "12px", color: "#6b7280" }}>
													{formatRelativeTime(selectedOccurrence.createdAt)}
												</p>
											</div>
										</InfoWindow>
									)}
								</GoogleMap>
							)}
						</div>

						{/* Map Info Overlay */}
						<div className="absolute top-4 left-4 right-4">
							<div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md">
								<p className="text-xs text-[#6b7280] mb-2">Legenda:</p>
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
					</div>

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

			{/* Botão de Registrar Ocorrência - Só aparece se não estiver em modo de convidado */}
			{!isGuest && (
				<button
					onClick={() => navigate("/register")}
					className="fixed bottom-24 right-6 w-16 h-16 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 z-10"
				>
					<Plus className="w-8 h-8" />
				</button>
			)}

			{/* Bottom Navigation */}
			<div className="bg-white border-t border-[#e5e7eb] px-6 py-3 shadow-lg">
				<div className="max-w-md mx-auto flex justify-around items-center">
					<button className="flex flex-col items-center gap-1 text-[#2563eb]">
						<MapPin className="w-6 h-6" />
						<span className="text-xs font-medium">Mapa</span>
					</button>
					{!isGuest && (
						<button className="flex flex-col items-center gap-1 text-[#6b7280]">
							<button onClick={() => navigate("/profile")}>
								<User className="w-6 h-6" />
								<span className="text-xs">Perfil</span>
							</button>
						</button>
					)}
					<button
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
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-80">
						<div className="flex items-center justify-between mb-4">
							<p className="text-lg font-bold text-[#1e3a8a]">Sair</p>
							<button
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
								onClick={() => setShowLogoutModal(false)}
								className="text-sm text-[#6b7280] hover:text-[#1e3a8a] mr-2"
							>
								Cancelar
							</button>
							<button
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
