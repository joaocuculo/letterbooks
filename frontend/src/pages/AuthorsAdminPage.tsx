import axios from 'axios';
import { useEffect, useState, type SubmitEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { createAuthor, findAuthors } from '../services/authorService';
import type { AuthorResponse } from '../types/author';
import type { PageResponse } from '../types/page';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

function readPage(searchParams: URLSearchParams) {
    const parsedPage = Number(searchParams.get('page'));
    return Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
}

function AuthorsAdminPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const page = readPage(searchParams);
    const locationState = location.state as { successMessage?: unknown } | null;

    const [result, setResult] = useState<PageResponse<AuthorResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        typeof locationState?.successMessage === 'string'
            ? locationState.successMessage
            : null
    );

    useEffect(() => {
        const abortController = new AbortController();

        async function loadAuthors() {
            try {
                setIsLoading(true);
                setLoadErrorMessage(null);
                setResult(await findAuthors(page, abortController.signal));
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setResult(null);
                    setLoadErrorMessage(
                        getApiErrorMessage(error, 'Não foi possível carregar os autores.')
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadAuthors();
        return () => abortController.abort();
    }, [page, reloadKey]);

    async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedName = name.trim();

        if (!normalizedName) {
            setCreateErrorMessage('Informe o nome do autor.');
            setSuccessMessage(null);
            return;
        }

        try {
            setIsCreating(true);
            setCreateErrorMessage(null);
            setSuccessMessage(null);

            const author = await createAuthor({ name: normalizedName });
            setName('');
            setSuccessMessage(`Autor “${author.name}” criado com sucesso.`);
            setReloadKey((current) => current + 1);
        } catch (error) {
            setCreateErrorMessage(
                getApiErrorMessage(error, 'Não foi possível criar o autor.')
            );
        } finally {
            setIsCreating(false);
        }
    }

    function changePage(nextPage: number) {
        const nextParams = new URLSearchParams(searchParams);
        if (nextPage === 0) {
            nextParams.delete('page');
        } else {
            nextParams.set('page', String(nextPage));
        }
        setSearchParams(nextParams);
    }

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">
            <section className="flex flex-col gap-4">
                <h1>Administração de autores</h1>

                <form className="flex max-w-xl flex-col gap-3" onSubmit={handleCreate}>
                    <label htmlFor="author-name">Nome do autor</label>
                    <input
                        id="author-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={isCreating}
                    />
                    <button className="self-start" type="submit" disabled={isCreating}>
                        {isCreating ? 'Criando...' : 'Criar autor'}
                    </button>
                </form>

                {createErrorMessage && <p role="alert">{createErrorMessage}</p>}
                {successMessage && <p role="status">{successMessage}</p>}
            </section>

            <section className="flex flex-col gap-4">
                <h2>Autores cadastrados</h2>

                {isLoading ? (
                    <p>Carregando autores...</p>
                ) : loadErrorMessage ? (
                    <p role="alert">{loadErrorMessage}</p>
                ) : result?.content.length === 0 ? (
                    <p>Nenhum autor cadastrado.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {result?.content.map((author) => (
                            <li className="flex items-center gap-4" key={author.id}>
                                <span>ID: {author.id}</span>
                                <span>{author.name}</span>
                                <Link to={`/admin/authors/${author.id}`}>Gerenciar</Link>
                            </li>
                        ))}
                    </ul>
                )}

                {result && result.page.totalPages > 1 && (
                    <nav className="flex items-center gap-4" aria-label="Paginação dos autores">
                        <button
                            type="button"
                            onClick={() => changePage(result.page.number - 1)}
                            disabled={result.page.number === 0 || isLoading}
                        >
                            Anterior
                        </button>
                        <span>
                            Página {result.page.number + 1} de {result.page.totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => changePage(result.page.number + 1)}
                            disabled={result.page.number + 1 >= result.page.totalPages || isLoading}
                        >
                            Próxima
                        </button>
                    </nav>
                )}
            </section>
        </div>
    );
}

export default AuthorsAdminPage;
