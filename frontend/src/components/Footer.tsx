import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import '../styles/domain-components.css';

function Footer() {
    const currentYear = new Date().getFullYear();
    const appName = import.meta.env.VITE_APP_NAME;
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <Link to="/" aria-label="LetterBooks, início">
                    <BrandLogo tone="light" />
                </Link>
                <nav aria-label="Navegação do rodapé">
                    <Link to="/">Início</Link>
                    <Link to="/explore">Explorar</Link>
                    <Link to="/my-books">Minha Biblioteca</Link>
                </nav>
            </div>
            <div className="site-footer-bottom">
                <small>
                    © {currentYear} {appName}
                </small>
            </div>
        </footer>
    );
}

export default Footer;
