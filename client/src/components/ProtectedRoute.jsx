import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "../store/redux.js";

export default function ProtectedRoute() {
  const auth = useSelector((state) => state.auth);

  if (auth.status === "loading") {
    return <p style={{ color: "var(--color-text-soft)", padding: "1.5rem" }}>Checking session...</p>;
  }

  if (auth.status !== "authenticated") {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
