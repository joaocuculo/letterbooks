import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        const from =
            location.pathname + location.search + location.hash;

        return <Navigate to="/login" state={{ from }} replace />
    }

    return <Outlet />
}

export default ProtectedRoute;
