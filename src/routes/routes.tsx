import { createBrowserRouter } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

import Confirmation from "../pages/Confirmation";
import Login from "../pages/Login";
import Map from "../pages/Map";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import Welcome from "../pages/Welcome";
import SignUp from "../pages/SignUp";
import Help from "../pages/Help";
import Admin from "../pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/map",
    element: (
      <PrivateRoute requireAuth={false}>
        <Map />
      </PrivateRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PrivateRoute blockGuest>
        <Register />
      </PrivateRoute>
    ),
  },
  {
    path: "/confirmation",
    element: (
      <PrivateRoute>
        <Confirmation />
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <PrivateRoute>
        <Admin />
      </PrivateRoute>
    ),
  },
]);
