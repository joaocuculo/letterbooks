import { Link, NavLink } from 'react-router-dom';

function NavBar() {
    return (
        <header className="bg-sky-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between p-4 text-white">
                <Link to={'/'}>LetterBooks</Link>

                <nav className="flex items-center gap-2">
                    <NavLink to={'/'} end>
                        Início
                    </NavLink>

                    <NavLink to={'/login'}>Entrar</NavLink>
                </nav>
            </div>
        </header>
    );
}

export default NavBar;
