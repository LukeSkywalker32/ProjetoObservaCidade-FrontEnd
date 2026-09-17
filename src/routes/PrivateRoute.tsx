import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
  requireAuth?: boolean;
  blockGuest?: boolean;
};

export function PrivateRoute({
  children,
  requireAuth = true,
  blockGuest = false,
}: Props) {
  const { token, isGuest, loading } = useAuth();

  //Enquanto esta validando o token no boot, nao redireciona
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Carregando...</div>
    );
  }

  if (requireAuth && !token && !isGuest) {
    return <Navigate to="/" replace />;
  }

  if (blockGuest && isGuest) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
}
