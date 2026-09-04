import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    useLocation,
    useNavigate,
    useSearchParams,
} from 'react-router-dom';
import BookCard from '../components/BookCard';
import SearchForm from '../components/SearchForm';
import { searchBooks } from '../services/bookService';
import { createOrUpdate } from '../services/userBookService';
import type { BookCardResponse } from '../types/book';
import type { BookSearchFilters } from '../types/bookSearch';
import type { PageResponse } from '../types/page';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { useAuth } from '../hooks/useAuth';

const searchFilterKeys: Array<keyof BookSearchFilters> = [
    'freeText',
    'title',
    'author',
    'publisher',
    'subject',
    'isbn',
];

function readFilters(searchParams: URLSearchParams): BookSearchFilters {
    const filters: BookSearchFilters = {};

    searchFilterKeys.forEach((key) => {
        const parameterName = key === 'freeText' ? 'q' : key;
        const value = searchParams.get(parameterName)?.trim();

        if (value) {
            filters[key] = value;
        }
    });

    return filters;
}

function readPage(searchParams: URLSearchParams) {
    const parsedPage = Number(searchParams.get('page'));

    return Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
}

function hasSearchFilters(filters: BookSearchFilters) {
    return Object.values(filters).some(Boolean);
}

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const filters = readFilters(searchParams);
    const hasSearch = hasSearchFilters(filters);
    const searchKey = searchParams.toString();

    const [result, setResult] =
        useState<PageResponse<BookCardResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingBooks, setLoadingBooks] = useState<Record<string, boolean>>(
        {}
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [favoriteErrorMessage, setFavoriteErrorMessage] = useState<
        string | null
    >(null);

    useEffect(() => {
        const activeSearchParams = new URLSearchParams(searchKey);
        const activeFilters = readFilters(activeSearchParams);

        if (!hasSearchFilters(activeFilters)) {
            return;
        }

        const activePage = readPage(activeSearchParams);
        const abortController = new AbortController();

        async function loadResults() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const response = await searchBooks(
                    activeFilters,
                    activePage,
                    abortController.signal
                );

                setResult(response);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setResult(null);
                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Não foi possível pesquisar os livros.'
                        )
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadResults();

        return () => abortController.abort();
    }, [searchKey]);

    function handleSearch(nextFilters: BookSearchFilters) {
        const nextParams = new URLSearchParams();

        searchFilterKeys.forEach((key) => {
            const value = nextFilters[key];

            if (value) {
                nextParams.set(key === 'freeText' ? 'q' : key, value);
            }
        });

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

    async function handleFavoriteToggle(book: BookCardResponse) {
        if (!isAuthenticated) {
            navigate('/login', {
                state: {
                    from:
                        location.pathname +
                        location.search +
                        location.hash,
                },
            });
            return;
        }

        setLoadingBooks((previous) => ({
            ...previous,
            [book.id]: true,
        }));
        setFavoriteErrorMessage(null);

        try {
            const userBook = await createOrUpdate(
                book.id,
                book.userBookId,
                { isFavorite: !book.isFavorite }
            );

            setResult((previous) => {
                if (!previous) {
                    return previous;
                }

                return {
                    ...previous,
                    content: previous.content.map((currentBook) =>
                        currentBook.id === book.id
                            ? {
                                  ...currentBook,
                                  isFavorite: userBook.isFavorite,
                                  userBookId: userBook.id,
                              }
                            : currentBook
                    ),
                };
            });
        } catch (error) {
            setFavoriteErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível atualizar o favorito.'
                )
            );
        } finally {
            setLoadingBooks((previous) => ({
                ...previous,
                [book.id]: false,
            }));
        }
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="mb-6">Pesquisar livros</h1>

            <SearchForm
                key={searchKey}
                initialFilters={filters}
                onSearch={handleSearch}
            />

            <section className="mt-8">
                <h2 className="mb-4">Resultados</h2>

                {favoriteErrorMessage && (
                    <p className="mb-4" role="alert">
                        {favoriteErrorMessage}
                    </p>
                )}

                {!hasSearch ? (
                    <p>Informe um termo para iniciar a pesquisa.</p>
                ) : isLoading ? (
                    <p>Pesquisando livros...</p>
                ) : errorMessage ? (
                    <p role="alert">{errorMessage}</p>
                ) : result?.content.length === 0 ? (
                    <p>Nenhum livro encontrado.</p>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {result?.content.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onFavorite={handleFavoriteToggle}
                                isLoading={loadingBooks[book.id] ?? false}
                            />
                        ))}
                    </div>
                )}

                {result && result.page.totalPages > 1 && (
                    <nav
                        className="mt-6 flex items-center gap-4"
                        aria-label="Paginação da pesquisa"
                    >
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
                                result.page.number + 1 >=
                                    result.page.totalPages || isLoading
                            }
                        >
                            Próxima
                        </button>
                    </nav>
                )}
            </section>
        </div>
    );
}

export default SearchPage;
