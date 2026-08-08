import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

function AppLayout() {
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
