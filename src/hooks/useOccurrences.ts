import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { api } from "../services/api";

/**
 * Hook genérico pra consumir endpoints paginados de ocorrências.
 *
 * AGORA USANDO TANSTACK QUERY:
 * - Cache automático entre componentes
 * - Refetch ao focar a aba
 * - Deduplicação de requests simultâneos
 * - Retry automático em erro de rede
 * - Stale-while-revalidate (mostra cache + atualiza em background)
 *
 */

export interface UseOccurrencesOptions {
  endpoint: string;
  limit?: number;
  filters?: Record<string, string | number | undefined>;
  /** Se true, não faz fetch automático no mount */
  enabled?: boolean;
}

export interface OccurrenceBase {
  _id: string;
  type: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  occurrences: T[];
}

interface QueryData<T> {
  occurrences: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function buildQueryKey(
  endpoint: string,
  page: number,
  limit: number,
  filters?: Record<string, string | number | undefined>,
) {
  // Filtra valores undefined/null pra query key ficar estável
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== undefined && v !== null && v !== "",
        ),
      )
    : {};

  return [endpoint, page, limit, cleanFilters] as const;
}

async function fetchOccurrences<T>(
  endpoint: string,
  page: number,
  limit: number,
  filters?: Record<string, string | number | undefined>,
): Promise<QueryData<T>> {
  const params: Record<string, string | number> = { page, limit };

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value;
      }
    }
  }

  const response = await api.get(endpoint, { params });
  const data = response.data;

  // Detecta formato: paginado (objeto) ou legado (array)
  if (Array.isArray(data)) {
    return {
      occurrences: data as T[],
      page: 1,
      limit: data.length,
      total: data.length,
      totalPages: 1,
    };
  }

  const paginated = data as PaginatedResponse<T>;
  return {
    occurrences: paginated.occurrences ?? [],
    page: paginated.page ?? 1,
    limit: paginated.limit ?? limit,
    total: paginated.total ?? 0,
    totalPages: paginated.totalPages ?? 1,
  };
}

export function useOccurrences<T extends OccurrenceBase = OccurrenceBase>({
  endpoint,
  limit = 50,
  filters = {},
  enabled = true,
}: UseOccurrencesOptions) {
  const queryClient = useQueryClient();

  // Query principal — sempre carrega página 1 por padrão
  const mainQuery = useQuery({
    queryKey: buildQueryKey(endpoint, 1, limit, filters),
    queryFn: () => fetchOccurrences<T>(endpoint, 1, limit, filters),
    enabled,
    placeholderData: keepPreviousData, // mantém dados antigos enquanto carrega novos
  });

  // Handlers de paginação — usam queryClient.fetchQuery pra carregar sob demanda
  const goToPage = useCallback(
    async (pageNum: number): Promise<void> => {
      await queryClient.fetchQuery({
        queryKey: buildQueryKey(endpoint, pageNum, limit, filters),
        queryFn: () => fetchOccurrences<T>(endpoint, pageNum, limit, filters),
      });
    },
    [queryClient, endpoint, limit, filters],
  );

  const nextPage = useCallback(async (): Promise<void> => {
    if (!mainQuery.data || mainQuery.data.totalPages <= mainQuery.data.page) {
      return;
    }
    await goToPage(mainQuery.data.page + 1);
  }, [mainQuery.data, goToPage]);

  const prevPage = useCallback(async (): Promise<void> => {
    if (!mainQuery.data || mainQuery.data.page <= 1) return;
    await goToPage(mainQuery.data.page - 1);
  }, [mainQuery.data, goToPage]);

  const refresh = useCallback(async (): Promise<void> => {
    if (mainQuery.data) {
      await queryClient.invalidateQueries({
        queryKey: buildQueryKey(endpoint, mainQuery.data.page, limit, filters),
      });
    }
  }, [queryClient, endpoint, limit, mainQuery.data, filters]);

  // Pega a página atual do cache (se existir) — útil pra mostrar
  const currentPageData =
    mainQuery.data?.page ?? 1;

  return {
    occurrences: mainQuery.data?.occurrences ?? [],
    page: currentPageData,
    limit,
    totalPages: mainQuery.data?.totalPages ?? 1,
    total: mainQuery.data?.total ?? 0,
    loading: mainQuery.isPending || mainQuery.isFetching,
    error:
      mainQuery.error instanceof Error
        ? mainQuery.error.message
        : mainQuery.error
          ? "Erro ao carregar ocorrências"
          : null,
    hasNext: mainQuery.data
      ? mainQuery.data.page < mainQuery.data.totalPages
      : false,
    hasPrev: mainQuery.data ? mainQuery.data.page > 1 : false,
    fetch: goToPage,
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
}
