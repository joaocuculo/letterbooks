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

                    <NavLink to="/search">Pesquisar</NavLink>

                    {isAuthenticated ? (
                        <>
                            <details>
                                <summary className="cursor-pointer">
                                    Meus Livros
                                </summary>
                                <div className="flex flex-col gap-1 p-2">
                                    <NavLink to="/my-books">
                                        Visão geral
                                    </NavLink>
                                    <NavLink to="/my-books/list">
                                        Todos
                                    </NavLink>
                                    <NavLink to="/my-books/list?status=WANT_TO_READ">
                                        Quero ler
                                    </NavLink>
                                    <NavLink to="/my-books/list?status=READING">
                                        Lendo
                                    </NavLink>
                                    <NavLink to="/my-books/list?status=COMPLETED">
                                        Lidos
                                    </NavLink>
                                    <NavLink to="/my-books/list?status=ABANDONED">
                                        Abandonados
                                    </NavLink>
                                    <NavLink to="/my-books/list?favorite=true">
                                        Favoritos
                                    </NavLink>
                                </div>
                            </details>

                            <button type="button" onClick={handleSignOut} className='cursor-pointer'>Sair</button>
                        </>
                    ) : (
                        <NavLink to={'/login'}>Entrar</NavLink>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default NavBar;
