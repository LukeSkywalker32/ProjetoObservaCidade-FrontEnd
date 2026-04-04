import { Navigate } from "react-router-dom";

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
  const token = localStorage.getItem("token");
  const isGuest = localStorage.getItem("isGuest") === "true";

  if (requireAuth && !token && !isGuest) {
    return <Navigate to="/" replace />;
  }

  if (blockGuest && isGuest) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
}
