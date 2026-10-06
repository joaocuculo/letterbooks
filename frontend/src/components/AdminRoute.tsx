import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminRoute() {
    const {
        user,
        isLoadingUser,
        userErrorMessage,
        refreshUser,
    } = useAuth();

    if (isLoadingUser) {
        return <p className="mx-auto max-w-7xl px-4 py-6">Carregando usuário...</p>;
    }

    if (userErrorMessage) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-6">
                <p role="alert">{userErrorMessage}</p>
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
