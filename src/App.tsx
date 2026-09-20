import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes/routes";

/**
 * QueryClient global do TanStack Query.
 *
 * Configurações:
 * - staleTime 30s: considera dados "frescos" por 30 segundos
 *   (evita refetch desnecessário ao trocar de aba)
 * - gcTime 5min: mantém cache em memória por 5 minutos após último uso
 * - retry 1: tenta de novo 1x em erro (suficiente — backend já tem retry interno)
 * - refetchOnWindowFocus true: atualiza ao voltar pra aba
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
	return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
		<AuthProvider>
			<ToastContainer />
				<RouterProvider
					router={router}
					fallbackElement={
						<div className="p-8 text-center text-gray-500">Carregando...</div>
					}
				/>
		</AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
	);
}

export default App;
