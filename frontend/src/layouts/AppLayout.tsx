import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

function AppLayout() {
    const { pathname } = useLocation();
    if (
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password' ||
        pathname === '/reset-password' ||
        pathname === '/profile' ||
        pathname === '/explore' ||
        pathname === '/search' ||
        /^\/books\/[^/]+\/?$/.test(pathname)
    ) {
        return <Outlet />;
    }
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
            <NavBar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default AppLayout;
