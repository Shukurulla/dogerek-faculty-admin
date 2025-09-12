import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRoute() {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "faculty_admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
