import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <section className="not-found">
            <p>Erro 404</p>

            <h1>Página não encontrada</h1>

            <p>O endereço acessado não existe ou foi alterado.</p>

            <Button nativeButton={false} render={<Link to="/" />}>
                Voltar à página inicial
            </Button>
        </section>
    );
}

export default NotFoundPage;
