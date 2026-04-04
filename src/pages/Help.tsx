import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "O que é o ObservaCidade?",
    answer:
      "O ObservaCidade é uma plataforma colaborativa de registro de ocorrências urbanas. Cidadãos podem reportar situações como furtos, vandalismo, atividades suspeitas e outros eventos, ajudando a construir um mapa comunitário de segurança.",
  },
  {
    question: "Preciso criar uma conta para usar?",
    answer:
      "Não! Qualquer pessoa pode visualizar as ocorrências no mapa sem cadastro. Porém, para registrar uma nova ocorrência, é necessário criar uma conta. Isso garante a confiabilidade e rastreabilidade das informações.",
  },
  {
    question: "As informações são verificadas?",
    answer:
      "As ocorrências são registradas por cidadãos e têm caráter colaborativo. Não realizamos verificação prévia de cada relato. Por isso, recomendamos sempre usar o bom senso e consultar fontes oficiais para situações de emergência.",
  },
  {
    question: "Posso editar ou excluir uma ocorrência que registrei?",
    answer:
      "Atualmente, o registro de ocorrências é permanente para manter a integridade do histórico colaborativo. Caso identifique um erro grave, entre em contato com nosso suporte.",
  },
  {
    question: "Meus dados pessoais são exibidos publicamente?",
    answer:
      "Não. Seu nome, e-mail, CPF e demais dados pessoais nunca são exibidos publicamente. As ocorrências no mapa são anônimas — apenas o tipo, descrição, localização e data são visíveis.",
  },
  {
    question: "Por que meu documento está em análise?",
    answer:
      "Para garantir a qualidade das informações, solicitamos um documento de identificação no cadastro. Nossa equipe analisa manualmente cada envio. O processo costuma levar até 48 horas úteis.",
  },
];

const emergencyContacts = [
  { name: "Polícia Militar", number: "190", color: "#1e3a8a", icon: Shield },
  { name: "Bombeiros", number: "193", color: "#dc2626", icon: AlertTriangle },
  { name: "SAMU", number: "192", color: "#16a34a", icon: Heart },
  { name: "Defesa Civil", number: "199", color: "#d97706", icon: MapPin },
  { name: "Disque Denúncia", number: "181", color: "#7c3aed", icon: Phone },
  {
    name: "Central de Emergência",
    number: "112",
    color: "#0891b2",
    icon: Phone,
  },
];

export default function Help() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      {/* Header */}
      <div className="bg-[#1e3a8a] px-6 py-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-[#f59e0b] transition-colors"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Central de Ajuda</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Sobre o Projeto */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#1e3a8a]" />
              </div>
              <h2 className="text-lg font-bold text-[#1e3a8a]">
                Sobre o ObservaCidade
              </h2>
            </div>
            <p className="text-sm text-[#4b5563] leading-relaxed mb-3">
              O <strong>ObservaCidade</strong> nasceu da necessidade de
              empoderar cidadãos na construção de cidades mais seguras. Nossa
              missão é criar uma rede colaborativa onde cada pessoa pode
              contribuir com informações sobre sua comunidade.
            </p>
            <p className="text-sm text-[#4b5563] leading-relaxed mb-3">
              Através do registro coletivo de ocorrências, buscamos ampliar a
              percepção de segurança urbana, auxiliar no planejamento
              comunitário e fortalecer o senso de pertencimento e
              responsabilidade coletiva.
            </p>
            <div className="flex items-center gap-2 bg-[#fef3c7] border border-[#fcd34d] rounded-xl p-3 mt-4">
              <Users className="w-5 h-5 text-[#d97706] flex-shrink-0" />
              <p className="text-xs text-[#92400e] leading-relaxed">
                Somos uma plataforma de{" "}
                <strong>registro comunitário colaborativo</strong>. Nossas
                informações complementam, mas não substituem os canais oficiais
                de segurança pública.
              </p>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#dc2626] mb-2">
                  ⚠️ Aviso Importante
                </h3>
                <p className="text-sm text-[#7f1d1d] leading-relaxed">
                  O ObservaCidade <strong>não é um canal de emergência</strong>.
                  Em situações de risco à vida ou crimes em andamento, acione
                  imediatamente os serviços oficiais de emergência abaixo.
                </p>
              </div>
            </div>
          </div>

          {/* Contatos de Emergência */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-[#1e3a8a] mb-4">
              📞 Contatos de Emergência
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {emergencyContacts.map((contact) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.number}
                    href={`tel:${contact.number}`}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-95"
                    style={{
                      borderColor: contact.color + "33",
                      backgroundColor: contact.color + "0d",
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: contact.color }}
                    />
                    <span
                      className="text-xl font-bold"
                      style={{ color: contact.color }}
                    >
                      {contact.number}
                    </span>
                    <span className="text-xs text-center text-[#6b7280] font-medium">
                      {contact.name}
                    </span>
                  </a>
                );
              })}
            </div>
            <p className="text-xs text-[#9ca3af] text-center mt-4">
              Toque no número para ligar diretamente
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-[#1e3a8a] mb-4">
              💬 Perguntas Frequentes
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-[#e5e7eb] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f9fafb] transition-colors"
                  >
                    <span className="text-sm font-semibold text-[#1e3a8a] pr-2">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-[#6b7280] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6b7280] flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 border-t border-[#f3f4f6]">
                      <p className="text-sm text-[#4b5563] leading-relaxed pt-3">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suporte */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-[#1e3a8a] mb-3">
              📬 Fale com o Suporte
            </h2>
            <p className="text-sm text-[#4b5563] leading-relaxed mb-4">
              Encontrou algum problema ou tem uma sugestão? Nossa equipe está
              pronta para ajudar.
            </p>
            <a
              href="mailto:suporte@observacidade.com.br"
              className="flex items-center gap-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 transition-all active:scale-95"
            >
              <div className="w-10 h-10 bg-[#1e3a8a] rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1e3a8a]">
                  E-mail de Suporte
                </p>
                <p className="text-xs text-[#2563eb]">
                  suporte@observacidade.com.br
                </p>
              </div>
            </a>
            <p className="text-xs text-[#9ca3af] text-center mt-3">
              Respondemos em até 2 dias úteis
            </p>
          </div>

          {/* Versão */}
          <p className="text-center text-xs text-[#9ca3af] pb-4">
            ObservaCidade v1.0 · Feito com ❤️ para a comunidade
          </p>
        </div>
      </div>
    </div>
  );
}
