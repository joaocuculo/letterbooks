import { NavLink } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import '../styles/home.css';
import '../styles/admin.css';
export default function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="landing admin-shell">
            <SiteHeader />
            <main className="admin-main">
                <nav className="admin-tabs" aria-label="Administração">
                    <NavLink to="/admin/authors">Autores</NavLink>
                    <NavLink to="/admin/categories">Categorias</NavLink>
                </nav>
                {children}
            </main>
        </div>
    );
}
