import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <section>
            <p>Erro 404</p>

            <h1>Página não encontrada</h1>

            <p>O endereço acessado não existe ou foi alterado.</p>

            <Link to="/">Voltar à página inicial</Link>
        </section>
    );
}

export default NotFoundPage;
