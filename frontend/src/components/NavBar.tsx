import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function NavBar() {
    const { isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();

    function handleSignOut() {
        signOut();
        navigate("/", { replace: true })
    }

    return (
        <header className="bg-sky-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between p-4 text-white">
                <Link to={'/'}>LetterBooks</Link>

                <nav className="flex items-center gap-2">
                    <NavLink to={'/'} end>
                        Início
                        
                    </NavLink>

                    {isAuthenticated ? (
                        <button type="button" onClick={handleSignOut} className='cursor-pointer'>Sair</button>
                    ) : (
                        <NavLink to={'/login'}>Entrar</NavLink>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default NavBar;
