import { Link, NavLink } from "react-router-dom";

function Header() {
    return (
        <header>
            <div>
                <Link to={"/"}>
                    <span>LetterBooks</span>
                </Link>

                <div>
                    <NavLink to={"/"}>
                        Início
                    </NavLink>
                    <NavLink to={"/login"}>
                        Entrar
                    </NavLink>
                </div>
            </div>
        </header>
    );
}

export default Header;