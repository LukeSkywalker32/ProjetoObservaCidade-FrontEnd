import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { GoogleMapsProvider } from "./context/GoogleMapsContext";
import { router } from "./routes/routes";

function App() {
	return (
		<AuthProvider>
			<ToastContainer />
			<GoogleMapsProvider>
				<RouterProvider
					router={router}
					fallbackElement={
						<div className="p-8 text-center text-gray-500">Carregando...</div>
					}
				/>
			</GoogleMapsProvider>
		</AuthProvider>
	);
}

export default App;
