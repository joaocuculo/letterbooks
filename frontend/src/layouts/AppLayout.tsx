import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import AdminShell from '../components/AdminShell';

function AppLayout() {
    const location = useLocation();
    const pathname = location.pathname.replace(/\/+$/, '') || '/';
    if (
        ['/login', '/register', '/forgot-password', '/reset-password'].includes(
            pathname
        )
    ) {
        return <Outlet />;
    }
    let content;
    if (
        /^\/admin\/(authors|categories)(\/[^/]+)?\/?$/.test(pathname) ||
        /^\/admin\/users\/?$/.test(pathname)
    )
        content = (
            <AdminShell>
                <Outlet />
            </AdminShell>
        );
    else if (
        pathname === '/' ||
        pathname === '/profile' ||
        pathname === '/my-ratings' ||
        pathname === '/my-books' ||
        pathname === '/my-books/list' ||
        pathname === '/explore' ||
        pathname === '/search' ||
        /^\/books\/[^/]+\/?$/.test(pathname)
    ) {
        content = <Outlet />;
    } else {
        content = (
            <div className="app-shell">
                <SiteHeader />

                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        );
    }
    return (
        <div className="site-layout">
            <div className="site-layout-content">{content}</div>
            <Footer />
        </div>
    );
}

export default AppLayout;
