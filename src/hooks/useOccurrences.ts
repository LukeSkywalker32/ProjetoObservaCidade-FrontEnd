import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export interface UseOccurrencesOptions {
  endpoint: string;
  /** Quantos itens por página (default: 50, máx: 100 no backend) */
  limit?: number;
  /** Filtros adicionais (viram query params) */
  filters?: Record<string, string | number | undefined>;
  /** Se true, não faz fetch automático no mount */
  manual?: boolean;
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

export function useOccurrences<T extends OccurrenceBase = OccurrenceBase>({
  endpoint,
  limit = 50,
  filters = {},
  manual = false,
}: UseOccurrencesOptions) {
  const [occurrences, setOccurrences] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref pra evitar loop em filters (objeto novo a cada render)
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const pageRef = useRef(page);
  pageRef.current = page;

  // A função real que faz o fetch (muda só quando endpoint/limit mudam)
  const fetchPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {
          page: pageNum,
          limit,
        };

        for (const [key, value] of Object.entries(filtersRef.current)) {
          if (value !== undefined && value !== null && value !== "") {
            params[key] = value;
          }
        }

        const response = await api.get(endpoint, { params });
        const data = response.data;

        if (Array.isArray(data)) {
          setOccurrences(data as T[]);
          setTotal(data.length);
          setTotalPages(1);
        } else {
          const paginated = data as PaginatedResponse<T>;
          setOccurrences(paginated.occurrences ?? []);
          setTotal(paginated.total ?? 0);
          setTotalPages(paginated.totalPages ?? 1);
        }

        setPage(pageNum);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Erro ao carregar ocorrências";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, limit],
  );

  // Ref da fetchPage atual — usado pelas funções estáveis abaixo
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  // ============================================
  // Funções ESTÁVEIS — não mudam de referência.
  // Use estas em arrays de deps de useEffect.
  // ============================================
  const stableFetch = useCallback((pageNum: number) => {
    return fetchPageRef.current(pageNum);
  }, []);

  const stableNextPage = useCallback(() => {
    if (pageRef.current < totalPages) {
      return fetchPageRef.current(pageRef.current + 1);
    }
    return Promise.resolve();
  }, [totalPages]);

  const stablePrevPage = useCallback(() => {
    if (pageRef.current > 1) {
      return fetchPageRef.current(pageRef.current - 1);
    }
    return Promise.resolve();
  }, []);

  const stableRefresh = useCallback(() => {
    return fetchPageRef.current(pageRef.current);
  }, []);

  // Fetch automático no mount (a menos que `manual`)
  // Depende só de endpoint/limit/manual — não muda com loading/error
  useEffect(() => {
    if (!manual) {
      fetchPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, limit, manual]);

  return {
    occurrences,
    page,
    limit,
    totalPages,
    total,
    loading,
    error,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    fetch: stableFetch,
    nextPage: stableNextPage,
    prevPage: stablePrevPage,
    goToPage: stableFetch,
    refresh: stableRefresh,
  };
}
