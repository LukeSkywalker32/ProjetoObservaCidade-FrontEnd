import { create } from "zustand"

/**
 * Store global de UI state.
 *
 * Por que Zustand e não Context?
 * - Context re-renderiza TODOS os consumers quando QUALQUER parte muda
 * - Zustand usa selectors — só re-renderiza quem usa o slice específico
 * - 1KB vs ~5KB do Redux Toolkit
 *
 * Use pra:
 * - Estado de modais globais
 * - Tema (claro/escuro)
 * - Sidebar/toggles
 * - Filtros persistentes
 */

interface UIState {
  // Tema
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  //Modais globais(ex: confirmação de logout compartilhada)
  logoutModalOpen: boolean;
  setLogoutModalOpen: (open: boolean) => void;

  // Filtros persistentes do mapa (Sobrevivem ao refresh)
  mapFilters: {
    type?: string;
    city?: string;
    state?: string;
  };

  setMapFilters: (filters: UIState["mapFilters"]) => void;
  clearMapFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Tema — persistido no localStorage
  theme: (localStorage.getItem("theme") as "light" | "dark") ?? "light",
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },

  // Modal de logout global
  logoutModalOpen: false,
  setLogoutModalOpen: (logoutModalOpen) => set({ logoutModalOpen }),

  // Filtros do mapa
  mapFilters: {},
  setMapFilters: (mapFilters) => set({ mapFilters }),
  clearMapFilters: () => set({ mapFilters: {} }),
}));
