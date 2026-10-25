import { ArrowRight } from 'lucide-react';
import BrandLogo from './BrandLogo';
import AccountMenu from './AccountMenu';
import { Button } from './ui/button';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/home.css';
function SiteHeader() {
    const { isAuthenticated, user, signOut } = useAuth();
    return (
        <header className="landing-header">
            <Link
                to="/"
                className="landing-brand"
                aria-label="LetterBooks, início"
            >
                <BrandLogo />
            </Link>
            <nav aria-label="Navegação principal" className="landing-nav">
                <NavLink to="/" end>
                    Início
                </NavLink>
                <NavLink to="/explore">Explorar</NavLink>
                <NavLink to="/my-books">Minha Biblioteca</NavLink>
            </nav>
            <div className="landing-account">
                {isAuthenticated ? (
                    <>
                        <AccountMenu user={user} onSignOut={signOut} />
                    </>
                ) : (
                    <>
                        <Link to="/login" className="landing-login">
                            Entrar
                        </Link>
                        <Button
                            nativeButton={false}
                            render={<Link to="/register" />}
                        >
                            Criar conta{' '}
                            <ArrowRight
                                size={18}
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
export default SiteHeader;
