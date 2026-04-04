import { useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, Mail, Lock, User, FileText, Calendar, Upload } from "lucide-react";
import { isValidCPF, isValidRG, isOver18 } from "../utils/validators";

export default function SignUp() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [rg, setRg] = useState("");
    const [cpf, setCpf] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [document, setDocument] = useState<File | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        //validação simplles de senha
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }
        //validação de cpf
        if (!isValidCPF(cpf)) {
            toast.error("CPF inválido");
            return;
        }
        //validação de rg
        if (!isValidRG(rg)) {
            toast.error("RG inválido");
            return;
        }
        //validação de data de nascimento
        if (!isOver18(birthDate)) {
            toast.error("Você deve ter pelo menos 18 anos");
            return;
        }
        //validação de documento
        if (!document) {
            toast.error("Envie um documento com foto");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("fullName", fullName);
            formData.append("email", email);
            formData.append("rg", rg);
            formData.append("cpf", cpf);
            formData.append("birthDate", birthDate);
            formData.append("password", password);
            formData.append("document", document);

            await api.post("/auth/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Cadastro realizado com sucesso!");
            setTimeout(() => navigate("/login"), 1000);
        } catch (error: any) {
            const message = error.response?.data?.message || "Erro ao realizar cadastro";
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
            <div className="flex-1 -mt-16 px-6 pb-12">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-[#1e3a8a] mb-2 text-center">
                        Criar Conta
                    </h2>
                    <p className="text-sm text-[#6b7280] mb-8 text-center">
                        Registre-se para contribuir com a comunidade
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome Completo */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                            <input
                                type="text"
                                placeholder="Nome completo"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none text-black"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none text-black"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* RG */}
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                                <input
                                    type="text"
                                    placeholder="RG"
                                    value={rg}
                                    onChange={(e) => setRg(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none text-black"
                                    required
                                />
                            </div>
                            {/* CPF */}
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                                <input
                                    type="text"
                                    placeholder="CPF"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none text-black"
                                    required
                                />
                            </div>
                        </div>

                        {/* Data de Nascimento */}
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none text-black"
                                required
                            />
                        </div>

                        {/* Senha */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none text-black"
                                required
                            />
                        </div>

                        {/* Confirmar Senha */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                            <input
                                type="password"
                                placeholder="Confirmar senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none text-black"
                                required
                            />
                        </div>

                        {/* Upload de Documento */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#1e3a8a] ml-1">Documento com foto</label>
                            <div className="relative border-2 border-dashed border-[#e5e7eb] rounded-xl p-4 hover:border-[#2563eb] transition-colors text-center">
                                <input
                                    type="file"
                                    onChange={(e) => e.target.files && setDocument(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-6 h-6 text-[#6b7280]" />
                                    <span className="text-sm text-[#6b7280]">
                                        {document ? document.name : "Clique para enviar o arquivo"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 active:scale-95 mt-4"
                        >
                            Criar conta
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm">
                        <p>
                            Já tem uma conta?{" "}
                            <span
                                onClick={() => navigate("/login")}
                                style={{ cursor: "pointer", color: "blue" }}
                                className="font-medium hover:underline"
                            >
                                Fazer login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}