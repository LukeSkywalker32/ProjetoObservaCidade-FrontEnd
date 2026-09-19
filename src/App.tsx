import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes/routes";

function App() {
	return (
    <ErrorBoundary>
		<AuthProvider>
			<ToastContainer />
				<RouterProvider
					router={router}
					fallbackElement={
						<div className="p-8 text-center text-gray-500">Carregando...</div>
					}
				/>
		</AuthProvider>
    </ErrorBoundary>
	);
}

export default App;
