import axios from 'axios';
import { useEffect, useState } from 'react';
import MyBooksSection from '../components/MyBooksSection';
import { findMine } from '../services/userBookService';
import type { PageResponse } from '../types/page';
import type { UserBookResponse } from '../types/userBook';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

interface MyBooksOverview {
    reading: PageResponse<UserBookResponse>;
    wantToRead: PageResponse<UserBookResponse>;
    completed: PageResponse<UserBookResponse>;
    favorites: PageResponse<UserBookResponse>;
}

function MyBooksPage() {
    const [overview, setOverview] = useState<MyBooksOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        async function loadOverview() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const [reading, wantToRead, completed, favorites] =
                    await Promise.all([
                        findMine(
                            {
                                status: 'READING',
                                page: 0,
                                size: 4,
                                sort: 'updatedAt,desc',
                            },
                            abortController.signal
                        ),
                        findMine(
                            {
                                status: 'WANT_TO_READ',
                                page: 0,
                                size: 4,
                                sort: 'updatedAt,desc',
                            },
                            abortController.signal
                        ),
                        findMine(
                            {
                                status: 'COMPLETED',
                                page: 0,
                                size: 4,
                                sort: 'updatedAt,desc',
                            },
                            abortController.signal
                        ),
                        findMine(
                            {
                                favorite: true,
                                page: 0,
                                size: 4,
                                sort: 'updatedAt,desc',
                            },
                            abortController.signal
                        ),
                    ]);

                setOverview({ reading, wantToRead, completed, favorites });
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setOverview(null);
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

        void loadOverview();

        return () => abortController.abort();
    }, []);

    if (isLoading) {
        return <p>Carregando seus livros...</p>;
    }

    if (errorMessage || !overview) {
        return (
            <div>
                <h1>Meus Livros</h1>
                <p role="alert">
                    {errorMessage ?? 'Não foi possível carregar seus livros.'}
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Meus Livros</h1>

            <MyBooksSection
                title="Continuar lendo"
                books={overview.reading.content}
                viewMoreTo="/my-books/list?status=READING"
            />
            <MyBooksSection
                title="Quero ler"
                books={overview.wantToRead.content}
                viewMoreTo="/my-books/list?status=WANT_TO_READ"
            />
            <MyBooksSection
                title="Lidos"
                books={overview.completed.content}
                viewMoreTo="/my-books/list?status=COMPLETED"
            />
            <MyBooksSection
                title="Favoritos"
                books={overview.favorites.content}
                viewMoreTo="/my-books/list?favorite=true"
            />
        </div>
    );
}

export default MyBooksPage;
