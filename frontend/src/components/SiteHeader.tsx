import { ArrowRight, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/home.css';
function SiteHeader() {
    const { isAuthenticated, user, signOut } = useAuth();
    const { pathname } = useLocation();
    return (
        <header className="landing-header">
            <Link
                to="/"
                className="landing-brand"
                aria-label="LetterBooks, início"
            >
                <BookOpen size={28} strokeWidth={1.7} aria-hidden="true" />
                LetterBooks<span className="brand-dot">.</span>
            </Link>
            <nav aria-label="Navegação principal" className="landing-nav">
                <Link to="/explore">Explorar</Link>
                <Link to="/search" className="landing-search-link">
                    Pesquisar
                </Link>
                <a
                    href={
                        pathname === '/' ? '#possibilities' : '/#possibilities'
                    }
                    className="landing-about-link"
                >
                    Como funciona
                </a>
            </nav>
            <div className="landing-account">
                {isAuthenticated ? (
                    <>
                        <Link to="/my-books">Meus livros</Link>
                        <details className="landing-user-menu">
                            <summary>
                                {user?.name?.split(' ')[0] ?? 'Minha conta'}
                            </summary>
                            <div>
                                <Link to="/profile">Meu perfil</Link>
                                {user?.role === 'ADMIN' && (
                                    <>
                                        <Link to="/admin/authors">Autores</Link>
                                        <Link to="/admin/categories">
                                            Categorias
                                        </Link>
                                    </>
                                )}
                                <button type="button" onClick={signOut}>
                                    Sair
                                </button>
                            </div>
                        </details>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="landing-login">
                            Entrar
                        </Link>
                        <Link
                            to="/register"
                            className="landing-button landing-button-small"
                        >
                            Criar conta{' '}
                            <ArrowRight
                                size={18}
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
export default SiteHeader;
