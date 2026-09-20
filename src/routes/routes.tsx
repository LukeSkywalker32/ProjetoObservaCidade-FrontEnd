import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

// Lazy loading - code splitting por rota
// Bundle inicial fica menor, cada rota carrega sob demanda
import Admin from "../pages/Admin";
import Confirmation from "../pages/Confirmation";
import Help from "../pages/Help";
import Login from "../pages/Login";
import Map from "../pages/Map";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import SignUp from "../pages/SignUp";
import Welcome from "../pages/Welcome";

function LoadingFalllback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"/>
          <p className="text-gray-500 font-medium">Carregando...</p>
      </div>
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<LoadingFalllback/>}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(Welcome),
  },
  {
    path: "/login",
    element: withSuspense(Login),
  },
  {
    path: "/signup",
    element: withSuspense(SignUp),
  },
  {
    path: "/help",
    element: withSuspense(Help),
  },
  {
    path: "/map",
    element: (
      <PrivateRoute requireAuth={false}>
        {withSuspense(Map)}
      </PrivateRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PrivateRoute blockGuest>
        {withSuspense(Register)}
      </PrivateRoute>
    ),
  },
  {
    path: "/confirmation",
    element: (
      <PrivateRoute>
        {withSuspense(Confirmation)}
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        {withSuspense(Profile)}
      </PrivateRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <PrivateRoute>
        {withSuspense(Admin)}
      </PrivateRoute>
    ),
  },

  // Catch-all -> redireciona para home
  {
    path:"*",
    element: <Navigate to="/" replace />
  },
]);
