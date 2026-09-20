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
import {
  OccurrenceBase,
  useOccurrences,
} from "../hooks/useOccurrences";
import { api } from "../services/api";
import { formatRelativeTime } from "../utils/dateUtils";
import { createMarkerIcon } from "../utils/getMarkerIcon";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentStatus = "PENDENTE" | "APROVADO" | "REPROVADO" | "";

type AdminUser = {
	_id: string;
	fullName: string;
	email: string;
	cpf: string;
	rg: string;
	documentStatus: DocumentStatus;
	documentUrl: string;
	createdAt: string;
};

type AuditOccurrence = OccurrenceBase & {
	description: string;
	address: string;
	userId: {
		fullName: string;
		email: string;
		cpf: string;
		rg: string;
	};
};

type MapOccurrence = OccurrenceBase & {
	description: string;
	latitude: number;
	longitude: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string) {
	return new Date(date).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function maskCPF(cpf: string) {
	if (!cpf) return "---";
	return cpf.replace(/^(\d{3})\d{3}(\d{3})(\d{2})$/, "$1.***.***-$3");
}

const STATUS_STYLES: Record<
	string,
	{ label: string; color: string; bg: string }
> = {
	PENDENTE: { label: "Pendente", color: "#d97706", bg: "#fef3c7" },
	APROVADO: { label: "Aprovado", color: "#16a34a", bg: "#dcfce7" },
	REPROVADO: { label: "Reprovado", color: "#dc2626", bg: "#fee2e2" },
};

const OCCURRENCE_COLORS: Record<string, string> = {
	furto: "#ef4444",
	roubo: "#008000",
	vandalismo: "#8b5cf6",
	suspeita: "#f59e0b",
	outros: "#6b7280",
};

// ─── Export to CSV ──────────────────────────────────────────────────────────

function exportToCSV(occurrences: AuditOccurrence[]) {
	const headers = ["Nome", "CPF", "RG", "Tipo", "Endereço", "Data"];
	const rows = occurrences.map((o) => [
		o.userId?.fullName || "—",
		o.userId?.cpf ? `="${o.userId.cpf}"` : "—",
		o.userId?.rg ? `="${o.userId.rg}"` : "—",
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

	// Users — fetch com filtros via state local (controla refetch)
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [statusFilter, setStatusFilter] = useState<DocumentStatus>("");
	const [search, setSearch] = useState("");
	const [usersTotal, setUsersTotal] = useState(0);
	const [usersPage, setUsersPage] = useState(1);
	const [usersTotalPages, setUsersTotalPages] = useState(1);

	// Hook de ocorrências (auditoria) — manual, fetch on demand
	const {
		occurrences,
		loading: loadingOccurrences,
		refresh: refreshOccurrences,
	} = useOccurrences<AuditOccurrence>({
		endpoint: "/admin/occurrences",
		limit: 50,
		enabled: false,
	});

	// Hook de ocorrências do mapa (com lat/lng)
	const {
		occurrences: mapOccurrences,
		loading: loadingMap,
		fetch: fetchMapOccurrences,
	} = useOccurrences<MapOccurrence>({
		endpoint: "/public/occurrences",
		limit: 200, // mapa mostra mais
		enabled: false,
	});

	// Document modal
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
	const [showDocModal, setShowDocModal] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);

	// Delete user modal
	const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

	// Delete occurrence modal
	const [occurrenceToDelete, setOccurrenceToDelete] =
		useState<AuditOccurrence | null>(null);
	const [deleteReason, setDeleteReason] = useState("");

	// Map state
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	// ─── Fetch Users ────────────────────────────────────────────────────────────

	const fetchUsers = async (page = 1) => {
		setLoadingUsers(true);
		try {
			const params: Record<string, string | number> = { page, limit: 50 };
			if (statusFilter) params.status = statusFilter;
			if (search) params.search = search;
			const response = await api.get("/admin/users", { params });
			setUsers(response.data.users);
			setUsersTotal(response.data.totalUsers);
			setUsersTotalPages(response.data.totalPages);
			setUsersPage(page);
		} catch {
			toast.error("Erro ao buscar usuários");
		} finally {
			setLoadingUsers(false);
		}
	};

	useEffect(() => {
		fetchUsers(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusFilter]);

	// ─── Fetch Occurrences (auditoria) ──────────────────────────────────────────

	useEffect(() => {
		if (activeTab === "occurrences") {
			refreshOccurrences();
		}
	}, [activeTab, refreshOccurrences]);

	// ─── Fetch Map Occurrences ──────────────────────────────────────────────────

	useEffect(() => {
		if (activeTab === "map") {
			fetchMapOccurrences(1);
		}
	}, [activeTab, fetchMapOccurrences]);

	// ─── Geolocation ───────────────────────────────────────────────────────────

	useEffect(() => {
		if (!navigator.geolocation) return;
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
			fetchUsers(usersPage);
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
			fetchUsers(usersPage);
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
			fetchUsers(usersPage);
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
			refreshOccurrences();
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
						<div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar por nome ou e-mail..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
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
								onClick={() => fetchUsers(1)}
								className="bg-[#1e3a8a] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#1e40af] transition-colors"
							>
								Buscar
							</button>
						</div>

						{/* Contador */}
						{usersTotal > 0 && (
							<p className="text-xs text-gray-500 px-2">
								Página {usersPage} de {usersTotalPages} ({usersTotal}{" "}
								usuários)
							</p>
						)}

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

								{/* Paginação de usuários */}
								{usersTotalPages > 1 && (
									<div className="flex justify-center gap-2 pt-2">
										<button
											type="button"
											disabled={usersPage === 1}
											onClick={() => fetchUsers(usersPage - 1)}
											className="bg-white border border-gray-200 text-[#1e3a8a] font-semibold py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
										>
											← Anterior
										</button>
										<button
											type="button"
											disabled={usersPage === usersTotalPages}
											onClick={() => fetchUsers(usersPage + 1)}
											className="bg-white border border-gray-200 text-[#1e3a8a] font-semibold py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
										>
											Próxima →
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* ── OCCURRENCES TAB ── */}
				{activeTab === "occurrences" && (
					<div className="space-y-4 mt-4">
						<div className="flex justify-between items-center">
							<p className="text-xs text-gray-500">
								{occurrences.length} ocorrências carregadas
							</p>
							<button
								type="button"
								onClick={() => exportToCSV(occurrences)}
								disabled={occurrences.length === 0}
								className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
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
									zoom={12}
									zoomControl={true}
									style={{ width: "100%", height: "100%" }}
								>
								<TileLayer
									url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									maxZoom={19}
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
										.map((occ) => (
											<Marker
												key={occ._id}
												position={[Number(occ.latitude), Number(occ.longitude)]}
												icon={createMarkerIcon(
													OCCURRENCE_TYPES[
														occ.type
															.toLowerCase()
															.trim() as keyof typeof OCCURRENCE_TYPES
													]?.color || "#000000",
												)}
											>
												<Popup>
													<div style={{ maxWidth: "200px" }}>
														<h3
															style={{
																fontWeight: "bold",
																marginBottom: "4px",
															}}
														>
															{occ.type.toUpperCase()}
														</h3>
														<p style={{ fontSize: "14px" }}>
															{occ.description}
														</p>
														<p
															style={{
																fontSize: "12px",
																color: "#6b7280",
															}}
														>
															{formatRelativeTime(occ.createdAt)}
														</p>
													</div>
												</Popup>
											</Marker>
										))}
								</MapContainer>
							</div>
						</div>
						{loadingMap && (
							<p className="text-center text-gray-400 py-4">
								Carregando ocorrências...
							</p>
						)}
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
								onClick={() => setShowDocModal(false)}
							>
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
								className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2"
							>
								Motivo da exclusão *
							</label>
							<textarea
								id="deleteReason"
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
