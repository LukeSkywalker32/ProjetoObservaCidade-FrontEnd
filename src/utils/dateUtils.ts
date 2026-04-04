import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale"

/**
 * Converte uma data ( string, Date ou numero) para o formato relativo
 */
export const formatRelativeTime = (date: string | Date | number): string => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;

    return formatDistanceToNow(dateObj, {
        addSuffix: true, // Adiciona o "há" ou "em"
        locale: ptBR // Formato em Português
    })
}
