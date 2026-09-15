import type { LatLngExpression } from "leaflet";
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  FileText,
  LogOut,
  MapPin,
  Search,
  Shield,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RecenterMap } from "../components/Recentermap";
import { OCCURRENCE_TYPES } from "../constants/occurrenceTypes";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { formatRelativeTime } from "../utils/dateUtils";
import { createMarkerIcon } from "../utils/getMarkerIcon";

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
// ↑ mesma chave e mesmo tile usados em Map.tsx, para manter o visual
// do mapa consistente entre o app público e o painel admin

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentStatus = "PENDENTE" | "APROVADO" | "REPROVADO" | "";

type User = {
	_id: string;
	fullName: string;
	email: string;
	cpf: string;
	rg: string;
	documentStatus: DocumentStatus;
	documentUrl: string;
	createdAt: string;
};

type Occurrence = {
	_id: string;
	type: string;
	description: string;
	address: string;
	createdAt: string;
	userId: {
		fullName: string;
		email: string;
		cpf: string;
		rg: string;
	};
};

// tipo separado para as ocorrências do mapa pois precisam de latitude e longitude
// as ocorrências da aba de auditoria não precisam dessas coordenadas
type MapOccurrence = {
	_id: string;
	type: string;
	description: string;
	latitude: number;
	longitude: number;
	createdAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Formata a data para o formato brasileiro
function formatDate(date: string) {
	return new Date(date).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Mascara o CPF
function maskCPF(cpf: string) {
	if (!cpf) return "---";
	return cpf.replace(/^(\d{3})\d{3}(\d{3})(\d{2})$/, "$1.***.***-$3");
}

// Estilos dos status
const STATUS_STYLES: Record<
	string,
	{ label: string; color: string; bg: string }
> = {
	PENDENTE: { label: "Pendente", color: "#d97706", bg: "#fef3c7" },
	APROVADO: { label: "Aprovado", color: "#16a34a", bg: "#dcfce7" },
	REPROVADO: { label: "Reprovado", color: "#dc2626", bg: "#fee2e2" },
};

// Estilos das ocorrências
const OCCURRENCE_COLORS: Record<string, string> = {
	furto: "#ef4444",
	roubo: "#008000",
	vandalismo: "#8b5cf6",
	suspeita: "#f59e0b",
	outros: "#6b7280",
};

// ─── Export to Excel ──────────────────────────────────────────────────────────

// Exporta as ocorrências para CSV
function exportToCSV(occurrences: Occurrence[]) {
	const headers = ["Nome", "CPF", "RG", "Tipo", "Endereço", "Data"];
	const rows = occurrences.map((o) => [
		o.userId?.fullName || "—",
		o.userId?.cpf ? `="${o.userId.cpf}"` : "—",
		// ← prefixo ="" força o Excel a tratar como texto, exibindo todos os dígitos sem máscara
		// sem isso o Excel interpreta CPF como número e remove os zeros à esquerda
		o.userId?.rg ? `="${o.userId.rg}"` : "—",
		// ← mesma lógica para o RG
		o.type,
		o.address,
		formatDate(o.createdAt),
	]);

	const csvContent = [headers, ...rows]
		.map((row) => row.map((cell) => `"${cell}"`).join(","))
		.join("\n");

	const blob = new Blob(["\uFEFF" + csvContent], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `auditoria_ocorrencias_${new Date().toISOString().slice(0, 10)}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Admin() {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [activeTab, setActiveTab] = useState<"users" | "occurrences" | "map">(
		"users",
	);
	// ↑ adicionado "map" como opção válida para a aba ativa

	// Users state
	const [users, setUsers] = useState<User[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [statusFilter, setStatusFilter] = useState<DocumentStatus>("");
	const [search, setSearch] = useState("");
	// Document modal
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [showDocModal, setShowDocModal] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	// Delete user modal
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	// Occurrences state
	const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
	const [loadingOccurrences, setLoadingOccurrences] = useState(false);
	// Delete occurrence modal
	const [occurrenceToDelete, setOccurrenceToDelete] =
		useState<Occurrence | null>(null);
	const [deleteReason, setDeleteReason] = useState("");
	// Map state
	const [mapOccurrences, setMapOccurrences] = useState<MapOccurrence[]>([]);
	// ↑ lista separada de ocorrências para o mapa com lat/lng
	// ↑ removido o estado selectedMapOccurrence: com react-leaflet o <Popup>
	// como filho do <Marker> controla sua própria abertura/fechamento
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	// ↑ removido o hook useGoogleMaps / isLoaded — o Leaflet não depende
	// de um script externo carregando de forma assíncrona, então não
	// existe mais um estado de "carregando a API do mapa"

	// ─── Fetch Users ────────────────────────────────────────────────────────────

	const fetchUsers = async () => {
		setLoadingUsers(true);
		try {
			const params: any = { limit: 50 };
			if (statusFilter) params.status = statusFilter;
			if (search) params.search = search;
			const response = await api.get("/admin/users", { params });
			setUsers(response.data.users);
		} catch {
			toast.error("Erro ao buscar usuários");
		} finally {
			setLoadingUsers(false);
		}
	};

	// ─── Fetch Occurrences ──────────────────────────────────────────────────────

	const fetchOccurrences = async () => {
		setLoadingOccurrences(true);
		try {
			const response = await api.get("/admin/occurrences");
			setOccurrences(response.data);
		} catch {
			toast.error("Erro ao buscar ocorrências");
		} finally {
			setLoadingOccurrences(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [statusFilter]);

	useEffect(() => {
		if (activeTab === "occurrences" && occurrences.length === 0) {
			fetchOccurrences();
		}
	}, [activeTab]);

	// busca as ocorrências para o mapa usando a rota pública
	// usamos a rota pública pois ela já retorna latitude e longitude
	// e só buscamos quando a aba de mapa é aberta pela primeira vez
	const fetchMapOccurrences = async () => {
		try {
			const response = await api.get("/public/occurrences");
			setMapOccurrences(response.data);
			// ↑ armazena as ocorrências com lat/lng no estado separado do mapa
		} catch {
			toast.error("Erro ao carregar ocorrências do mapa");
		}
	};

	useEffect(() => {
		if (activeTab === "map" && mapOccurrences.length === 0) {
			fetchMapOccurrences();
			// ↑ só busca quando a aba mapa é ativada e ainda não tem dados carregados
			// evita requisições desnecessárias ao trocar entre abas
		}
	}, [activeTab]);

	//Verifica se o navegador suporta geolocalização
	useEffect(() => {
		if (!navigator.geolocation) return;
		//Salva as coords reais do usuario
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserLocation({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
			},
			(error) => {
				console.error("Erro ao obter localização", error);
			},
		);
	}, []);

	// ─── User Actions ───────────────────────────────────────────────────────────

	const handleApprove = async () => {
		if (!selectedUser) return;
		setActionLoading(true);
		try {
			await api.patch(`/admin/users/${selectedUser._id}/approve`);
			toast.success("Documento aprovado!");
			setShowDocModal(false);
			fetchUsers();
		} catch {
			toast.error("Erro ao aprovar documento");
		} finally {
			setActionLoading(false);
		}
	};

	const handleReject = async () => {
		if (!selectedUser) return;
		setActionLoading(true);
		try {
			await api.patch(`/admin/users/${selectedUser._id}/reject`, {
				reason: "Documento inválido ou ilegível",
			});
			toast.success("Documento reprovado!");
			setShowDocModal(false);
			fetchUsers();
		} catch {
			toast.error("Erro ao reprovar documento");
		} finally {
			setActionLoading(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;
		try {
			await api.delete(`/admin/users/${userToDelete._id}`);
			toast.success("Usuário excluído!");
			setUserToDelete(null);
			fetchUsers();
		} catch {
			toast.error("Erro ao excluir usuário");
		}
	};

	// ─── Occurrence Actions ─────────────────────────────────────────────────────

	const handleDeleteOccurrence = async () => {
		if (!occurrenceToDelete || !deleteReason.trim()) return;
		try {
			await api.delete(`/admin/occurrences/${occurrenceToDelete._id}`, {
				data: { reason: deleteReason },
			});
			toast.success("Ocorrência excluída!");
			setOccurrenceToDelete(null);
			setDeleteReason("");
			fetchOccurrences();
		} catch {
			toast.error("Erro ao excluir ocorrência");
		}
	};

	// ─── Render ─────────────────────────────────────────────────────────────────

	return (
		<div className="min-h-screen bg-[#f3f4f6] flex flex-col">
			{/* Header */}
			<header className="bg-[#1e3a8a] px-6 py-4 shadow-md">
				<div className="max-w-5xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Shield className="w-6 h-6 text-white" />
						<div>
							<h1 className="text-xl font-bold text-white">Painel Admin</h1>
							<p className="text-xs text-blue-200">ObservaCidade</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => {
							logout();
							navigate("/login");
						}}
						className="flex items-center gap-2 text-white hover:text-[#f59e0b] transition-colors text-sm"
					>
						<LogOut className="w-5 h-5" />
						Sair
					</button>
				</div>

				{/* Tabs */}
				<div className="max-w-5xl mx-auto mt-4 flex gap-2 overflow-x-auto">
					<button
						type="button"
						onClick={() => setActiveTab("users")}
						className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0 whitespace-nowrap ${
							activeTab === "users"
								? "bg-white text-[#1e3a8a]"
								: "text-white/70 hover:text-white"
						}`}
					>
						<Users className="w-4 h-4" />
						Usuários
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("occurrences")}
						className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0 whitespace-nowrap ${
							activeTab === "occurrences"
								? "bg-white text-[#1e3a8a]"
								: "text-white/70 hover:text-white"
						}`}
					>
						<ClipboardList className="w-4 h-4" />
						Ocorrências
					</button>
					{/**Botão de mapa */}
					<button
						type="button"
						onClick={() => setActiveTab("map")}
						className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0 whitespace-nowrap ${
							activeTab === "map"
								? "bg-white text-[#1e3a8a]"
								: "text-white/70 hover:text-white"
						}`}
					>
						<MapPin className="w-4 h-4" />
						Mapa
					</button>
				</div>
			</header>

			{/* Content */}
			<main className="flex-1 p-4 max-w-5xl mx-auto w-full">
				{/* ── USERS TAB ── */}
				{activeTab === "users" && (
					<div className="space-y-4 mt-4">
						{/* Filters */}
						<div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar por nome ou e-mail..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
									className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2563eb]"
								/>
							</div>
							<select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(e.target.value as DocumentStatus)
								}
								className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2563eb] text-gray-600"
							>
								<option value="">Todos os status</option>
								<option value="PENDENTE">Pendentes</option>
								<option value="APROVADO">Aprovados</option>
								<option value="REPROVADO">Reprovados</option>
							</select>
							<button
                     type="button"
								onClick={fetchUsers}
								className="bg-[#1e3a8a] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#1e40af] transition-colors"
							>
								Buscar
							</button>
						</div>

						{/* Users List */}
						{loadingUsers ? (
							<div className="text-center py-12 text-gray-400">
								Carregando...
							</div>
						) : users.length === 0 ? (
							<div className="text-center py-12 text-gray-400">
								Nenhum usuário encontrado
							</div>
						) : (
							<div className="space-y-3">
								{users.map((user) => {
									const status =
										STATUS_STYLES[user.documentStatus] ||
										STATUS_STYLES["PENDENTE"];
									return (
										<div
											key={user._id}
											className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between gap-4"
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1 flex-wrap">
													<p className="font-bold text-[#1e3a8a] truncate">
														{user.fullName}
													</p>
													<span
														className="text-xs font-semibold px-2 py-0.5 rounded-full"
														style={{
															color: status.color,
															backgroundColor: status.bg,
														}}
													>
														{status.label}
													</span>
												</div>
												<p className="text-xs text-gray-400 truncate">
													{user.email}
												</p>
												<p className="text-xs text-gray-400">
													CPF: {maskCPF(user.cpf)}
												</p>
												<p className="text-xs text-gray-300 mt-1">
													{formatDate(user.createdAt)}
												</p>
											</div>

											<div className="flex items-center gap-2 flex-shrink-0">
												{user.documentUrl && (
													<>
														<span
															className="text-xs font-semibold px-2 py-1 rounded-xl hidden sm:inline"
															style={{
																color:
																	STATUS_STYLES[user.documentStatus]?.color,
																backgroundColor:
																	STATUS_STYLES[user.documentStatus]?.bg,
															}}
														>
															{STATUS_STYLES[user.documentStatus]?.label}
														</span>
														<button
															type="button"
															onClick={() => {
																setSelectedUser(user);
																setShowDocModal(true);
															}}
															className="flex items-center gap-1 bg-[#eff6ff] text-[#2563eb] text-xs font-semibold px-3 py-2 rounded-xl hover:bg-[#dbeafe] transition-colors"
														>
															<FileText className="w-4 h-4" />
															Documento
														</button>
													</>
												)}
												<button
													type="button"
													onClick={() => setUserToDelete(user)}
													className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}

				{/* ── OCCURRENCES TAB ── */}
				{activeTab === "occurrences" && (
					<div className="space-y-4 mt-4">
						<div className="flex justify-end">
							<button
								type="button"
								onClick={() => exportToCSV(occurrences)}
								className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
							>
								<FileText className="w-4 h-4" />
								Exportar CSV
							</button>
						</div>

						{loadingOccurrences ? (
							<div className="text-center py-12 text-gray-400">
								Carregando...
							</div>
						) : occurrences.length === 0 ? (
							<div className="text-center py-12 text-gray-400">
								Nenhuma ocorrência encontrada
							</div>
						) : (
							<div className="space-y-3">
								{occurrences.map((occ) => {
									const color =
										OCCURRENCE_COLORS[occ.type.toLowerCase().trim()] ??
										"#6b7280";
									return (
										<div
											key={occ._id}
											className="bg-white rounded-2xl shadow-sm p-4 space-y-3"
										>
											{/* Tipo + Data + Delete */}
											<div className="flex items-center justify-between">
												<span
													className="text-xs font-bold px-3 py-1 rounded-full text-white uppercase"
													style={{ backgroundColor: color }}
												>
													{occ.type}
												</span>
												<div className="flex items-center gap-2">
													<span className="text-xs text-gray-400">
														{formatDate(occ.createdAt)}
													</span>
													<button
														type="button"
														onClick={() => setOccurrenceToDelete(occ)}
														className="p-1.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>

											{/* Usuário */}
											<div className="bg-[#eff6ff] rounded-xl p-3 space-y-1">
												<p className="text-xs font-bold text-[#1e3a8a]">
													{occ.userId?.fullName || "—"}
												</p>
												<div className="flex gap-4">
													<p className="text-xs text-gray-500">
														CPF: {occ.userId?.cpf || "—"}
													</p>
													<p className="text-xs text-gray-500">
														RG: {occ.userId?.rg || "—"}
													</p>
												</div>
											</div>

											{/* Endereço */}
											<div className="flex items-start gap-2">
												<AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
												<p className="text-xs text-gray-500">{occ.address}</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}
				{/* ── MAP TAB ── */}
				{activeTab === "map" && (
					<div className="mt-4">
						<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
							<div className="h-[600px]">
							<MapContainer
								center={
									(userLocation || {
										lat: -23.5505,
										lng: -46.6333,
									}) as LatLngExpression
								}
								// ↑ ↑ usa a localização real do usuário se disponível, caso contrario fallback são paulo
								zoom={12}
								// ↑ zoom um pouco menor que no app para dar uma visão mais ampla da cidade
								zoomControl={true}
								style={{ width: "100%", height: "100%" }}
							>
								<TileLayer
									url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
									attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap contributors'
									maxZoom={20}
								/>
								<RecenterMap
									center={
										(userLocation || {
											lat: -23.5505,
											lng: -46.6333,
										}) as LatLngExpression
									}
								/>
								{mapOccurrences
									.filter(
										(occ) =>
											occ.latitude !== undefined &&
											occ.longitude !== undefined &&
											occ.latitude !== null &&
											occ.longitude !== null,
									)
									// ↑ filtra ocorrências sem coordenadas para evitar erro no mapa
									.map((occ) => (
										<Marker
											key={occ._id}
											position={[Number(occ.latitude), Number(occ.longitude)]}
											// ↑ posiciona o marker nas coordenadas da ocorrência
											icon={createMarkerIcon(
												OCCURRENCE_TYPES[
													occ.type
														.toLowerCase()
														.trim() as keyof typeof OCCURRENCE_TYPES
												]?.color || "#000000",
											)}
											// ↑ usa a cor do tipo da ocorrência para colorir o marker
										>
											{/*
												Popup como filho do Marker: abre sozinho ao
												clicar, fecha o anterior automaticamente ao
												abrir outro. O estado selectedMapOccurrence
												não precisa mais controlar abertura/fechamento
												manualmente como fazia com o InfoWindow do Google.
											*/}
											<Popup>
												<div style={{ maxWidth: "200px" }}>
													<h3 style={{ fontWeight: "bold", marginBottom: "4px" }}>
														{occ.type.toUpperCase()}
													</h3>
													<p style={{ fontSize: "14px" }}>{occ.description}</p>
													<p style={{ fontSize: "12px", color: "#6b7280" }}>
														{formatRelativeTime(occ.createdAt)}
														{/* ↑ exibe "há 2 horas", "há 3 dias", etc — igual ao Map.tsx */}
													</p>
												</div>
											</Popup>
										</Marker>
									))}
							</MapContainer>
						</div>
					</div>
				</div>
				)}
			</main>

			{/* ── MODAL: Visualizar Documento ── */}
			{showDocModal && selectedUser && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
						<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
							<p className="font-bold text-[#1e3a8a]">
								{selectedUser.fullName}
							</p>
							<button
								type="button"
								onClick={() => setShowDocModal(false)}>
								<X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
							</button>
						</div>

						<div className="p-4">
							<img
								src={selectedUser.documentUrl}
								alt="Documento"
								className="w-full rounded-xl object-contain max-h-72 border border-gray-100"
							/>
						</div>

						<div className="flex gap-3 px-5 pb-5">
							{/* botões só aparecem se o status for PENDENTE */}
							{/* se já foi aprovado ou reprovado, o admin só visualiza o documento */}
							{selectedUser.documentStatus === "PENDENTE" && (
								<>
									<button
										type="button"
										onClick={handleReject}
										disabled={actionLoading}
										className="flex-1 flex items-center justify-center gap-2 bg-[#fee2e2] text-[#dc2626] font-bold py-3 rounded-xl hover:bg-[#fecaca] transition-colors disabled:opacity-50"
									>
										<XCircle className="w-5 h-5" />
										Reprovar
									</button>
									<button
										type="button"
										onClick={handleApprove}
										disabled={actionLoading}
										className="flex-1 flex items-center justify-center gap-2 bg-[#dcfce7] text-[#16a34a] font-bold py-3 rounded-xl hover:bg-[#bbf7d0] transition-colors disabled:opacity-50"
									>
										<CheckCircle className="w-5 h-5" />
										Aprovar
									</button>
								</>
							)}

							{/* se já foi processado, exibe apenas o status atual */}
							{selectedUser.documentStatus !== "PENDENTE" && (
								<div
									className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl"
									style={{
										color: STATUS_STYLES[selectedUser.documentStatus]?.color,
										backgroundColor:
											STATUS_STYLES[selectedUser.documentStatus]?.bg,
									}}
								>
									{selectedUser.documentStatus === "APROVADO" ? (
										<>
											<CheckCircle className="w-5 h-5" /> Documento Aprovado
										</>
									) : (
										<>
											<XCircle className="w-5 h-5" /> Documento Reprovado
										</>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* ── MODAL: Excluir Usuário ── */}
			{userToDelete && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
								<Trash2 className="w-5 h-5 text-red-500" />
							</div>
							<div>
								<p className="font-bold text-gray-800">Excluir usuário</p>
								<p className="text-xs text-gray-400">{userToDelete.fullName}</p>
							</div>
						</div>
						<p className="text-sm text-gray-500">
							Essa ação é permanente e não pode ser desfeita. Deseja continuar?
						</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setUserToDelete(null)}
								className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleDeleteUser}
								className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
							>
								Excluir
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ── MODAL: Excluir Ocorrência ── */}
			{occurrenceToDelete && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
								<Trash2 className="w-5 h-5 text-red-500" />
							</div>
							<div>
								<p className="font-bold text-gray-800">Excluir ocorrência</p>
								<p className="text-xs text-gray-400 uppercase">
									{occurrenceToDelete.type}
								</p>
							</div>
						</div>
						<div>
							<label 
                     htmlFor="deleteReason"
                     className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
								Motivo da exclusão *
							</label>
							<textarea
								value={deleteReason}
								onChange={(e) => setDeleteReason(e.target.value)}
								placeholder="Descreva o motivo da exclusão..."
								rows={3}
								className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#2563eb] resize-none"
							/>
						</div>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									setOccurrenceToDelete(null);
									setDeleteReason("");
								}}
								className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleDeleteOccurrence}
								disabled={!deleteReason.trim()}
								className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
							>
								Excluir
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}