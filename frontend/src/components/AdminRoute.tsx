import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminRoute() {
    const { user, isLoadingUser, userErrorMessage, refreshUser } = useAuth();

    if (isLoadingUser) {
        return (
            <p className="admin-feedback" role="status">
                Carregando usuário...
            </p>
        );
    }

    if (userErrorMessage) {
        return (
            <div className="admin-feedback">
                <p className="admin-error" role="alert">
                    {userErrorMessage}
                </p>
                <button type="button" onClick={refreshUser}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default AdminRoute;
