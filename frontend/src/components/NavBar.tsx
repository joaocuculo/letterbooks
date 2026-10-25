import NavigationMenu from './NavigationMenu';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { Button } from './ui/button';
import '../styles/domain-components.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from './BrandLogo';

function NavBar() {
    const { isAuthenticated, user, signOut } = useAuth();
    const navigate = useNavigate();

    function handleSignOut() {
        signOut();
        navigate('/', { replace: true });
    }

    return (
        <header className="legacy-navigation">
            <div className="legacy-navigation-inner">
                <Link to="/" aria-label="LetterBooks, início">
                    <BrandLogo />
                </Link>

                <nav className="flex items-center gap-2">
                    <NavLink to={'/'} end>
                        Início
                    </NavLink>

                    <NavLink to="/explore">Explorar</NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavigationMenu label="Meus Livros">
                                <DropdownMenuItem
                                    render={<NavLink to="/my-books" />}
                                >
                                    Visão geral
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={<NavLink to="/my-books/list" />}
                                >
                                    Todos
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <NavLink to="/my-books/list?status=WANT_TO_READ" />
                                    }
                                >
                                    Quero ler
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <NavLink to="/my-books/list?status=READING" />
                                    }
                                >
                                    Lendo
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <NavLink to="/my-books/list?status=COMPLETED" />
                                    }
                                >
                                    Lidos
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <NavLink to="/my-books/list?status=ABANDONED" />
                                    }
                                >
                                    Abandonados
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <NavLink to="/my-books/list?favorite=true" />
                                    }
                                >
                                    Favoritos
                                </DropdownMenuItem>
                            </NavigationMenu>

                            <NavLink to="/profile">Meu perfil</NavLink>

                            {user?.role === 'ADMIN' && (
                                <NavigationMenu label="Administração">
                                    <DropdownMenuItem
                                        render={<NavLink to="/admin/authors" />}
                                    >
                                        Autores
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        render={
                                            <NavLink to="/admin/categories" />
                                        }
                                    >
                                        Categorias
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        render={<NavLink to="/admin/users" />}
                                    >
                                        Usuários
                                    </DropdownMenuItem>
                                </NavigationMenu>
                            )}

                            <Button
                                variant="ghost"
                                type="button"
                                onClick={handleSignOut}
                                className="cursor-pointer"
                            >
                                Sair
                            </Button>
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
