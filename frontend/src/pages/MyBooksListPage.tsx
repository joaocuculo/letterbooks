import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UserBookCard from '../components/UserBookCard';
import { findMine } from '../services/userBookService';
import type { PageResponse } from '../types/page';
import type {
    UserBookResponse,
    UserBookStatus,
} from '../types/userBook';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import {
    isUserBookStatus,
    userBookStatusLabels,
    userBookStatusOptions,
} from '../utils/userBookStatus';

type FilterValue = UserBookStatus | 'ALL' | 'FAVORITES';

function parsePage(value: string | null) {
    const parsedPage = Number(value);

    return Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
}

function MyBooksListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedStatus = searchParams.get('status');
    const status = isUserBookStatus(requestedStatus)
        ? requestedStatus
        : undefined;
    const favorite = searchParams.get('favorite') === 'true' || undefined;
    const page = parsePage(searchParams.get('page'));
    const selectedFilter: FilterValue = favorite
        ? 'FAVORITES'
        : (status ?? 'ALL');

    const [result, setResult] =
        useState<PageResponse<UserBookResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        async function loadBooks() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const response = await findMine(
                    {
                        status,
                        favorite,
                        page,
                        size: 20,
                        sort: 'updatedAt,desc',
                    },
                    abortController.signal
                );

                setResult(response);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setResult(null);
                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar seus livros.'
                        )
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadBooks();

        return () => abortController.abort();
    }, [favorite, page, status]);

    function handleFilterChange(filter: FilterValue) {
        const nextParams = new URLSearchParams();

        if (filter === 'FAVORITES') {
            nextParams.set('favorite', 'true');
        } else if (filter !== 'ALL') {
            nextParams.set('status', filter);
        }

        setSearchParams(nextParams);
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

    const title =
        selectedFilter === 'ALL'
            ? 'Todos os livros'
            : selectedFilter === 'FAVORITES'
              ? 'Favoritos'
              : userBookStatusLabels[selectedFilter];

    return (
        <div>
            <Link to="/my-books">← Voltar para Meus Livros</Link>
            <h1>{title}</h1>

            <label htmlFor="my-books-filter">Filtrar livros</label>
            <select
                id="my-books-filter"
                value={selectedFilter}
                onChange={(event) =>
                    handleFilterChange(event.target.value as FilterValue)
                }
            >
                <option value="ALL">Todos</option>
                {userBookStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
                <option value="FAVORITES">Favoritos</option>
            </select>

            {isLoading ? (
                <p>Carregando livros...</p>
            ) : errorMessage ? (
                <p role="alert">{errorMessage}</p>
            ) : result?.content.length === 0 ? (
                <p>Nenhum livro encontrado.</p>
            ) : (
                <div>
                    {result?.content.map((userBook) => (
                        <UserBookCard
                            key={userBook.id}
                            userBook={userBook}
                        />
                    ))}
                </div>
            )}

            {result && result.page.totalPages > 1 && (
                <nav aria-label="Paginação dos meus livros">
                    <button
                        type="button"
                        onClick={() => changePage(result.page.number - 1)}
                        disabled={result.page.number === 0 || isLoading}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {result.page.number + 1} de{' '}
                        {result.page.totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() => changePage(result.page.number + 1)}
                        disabled={
                            result.page.number + 1 >= result.page.totalPages ||
                            isLoading
                        }
                    >
                        Próxima
                    </button>
                </nav>
            )}
        </div>
    );
}

export default MyBooksListPage;
