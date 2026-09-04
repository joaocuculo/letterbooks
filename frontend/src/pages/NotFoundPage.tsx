import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
            <p>Erro 404</p>

            <h1>Página não encontrada</h1>

            <p>O endereço acessado não existe ou foi alterado.</p>

            <Link to="/">Voltar à página inicial</Link>
        </section>
    );
}

export default NotFoundPage;
