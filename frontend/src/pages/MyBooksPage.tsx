import axios from 'axios';
import { useEffect, useState } from 'react';
import MyBooksSection from '../components/MyBooksSection';
import { findMine } from '../services/userBookService';
import type { PageResponse } from '../types/page';
import type { UserBookResponse } from '../types/userBook';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { useRemoveUserBook } from '../hooks/useRemoveUserBook';

interface MyBooksOverview {
    reading: PageResponse<UserBookResponse>;
    wantToRead: PageResponse<UserBookResponse>;
    completed: PageResponse<UserBookResponse>;
    favorites: PageResponse<UserBookResponse>;
}

function removeFromPage(
    page: PageResponse<UserBookResponse>,
    userBookId: number,
    belongsToSection: boolean
): PageResponse<UserBookResponse> {
    if (!belongsToSection) {
        return page;
    }

    const totalElements = Math.max(0, page.page.totalElements - 1);

    return {
        content: page.content.filter(
            (userBook) => userBook.id !== userBookId
        ),
        page: {
            ...page.page,
            totalElements,
            totalPages: Math.ceil(totalElements / page.page.size),
        },
    };
}

function MyBooksPage() {
    const [overview, setOverview] = useState<MyBooksOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const {
        removingUserBookId,
        removeErrorMessage,
        removeFromLibrary,
    } = useRemoveUserBook({
        onRemoved: (removedUserBook) => {
            setOverview((previous) => {
                if (!previous) {
                    return previous;
                }

                return {
                    reading: removeFromPage(
                        previous.reading,
                        removedUserBook.id,
                        removedUserBook.status === 'READING'
                    ),
                    wantToRead: removeFromPage(
                        previous.wantToRead,
                        removedUserBook.id,
                        removedUserBook.status === 'WANT_TO_READ'
                    ),
                    completed: removeFromPage(
                        previous.completed,
                        removedUserBook.id,
                        removedUserBook.status === 'COMPLETED'
                    ),
                    favorites: removeFromPage(
                        previous.favorites,
                        removedUserBook.id,
                        removedUserBook.isFavorite
                    ),
                };
            });
        },
    });

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
        return (
            <p className="mx-auto max-w-7xl px-4 py-6">
                Carregando seus livros...
            </p>
        );
    }

    if (errorMessage || !overview) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-6">
                <h1 className="mb-6">Meus Livros</h1>
                <p role="alert">
                    {errorMessage ?? 'Não foi possível carregar seus livros.'}
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="mb-6">Meus Livros</h1>

            {removeErrorMessage && (
                <p className="mb-4" role="alert">
                    {removeErrorMessage}
                </p>
            )}

            <MyBooksSection
                title="Continuar lendo"
                books={overview.reading.content}
                viewMoreTo="/my-books/list?status=READING"
                removingUserBookId={removingUserBookId}
                onRemove={(userBook) => void removeFromLibrary(userBook)}
            />
            <MyBooksSection
                title="Quero ler"
                books={overview.wantToRead.content}
                viewMoreTo="/my-books/list?status=WANT_TO_READ"
                removingUserBookId={removingUserBookId}
                onRemove={(userBook) => void removeFromLibrary(userBook)}
            />
            <MyBooksSection
                title="Lidos"
                books={overview.completed.content}
                viewMoreTo="/my-books/list?status=COMPLETED"
                removingUserBookId={removingUserBookId}
                onRemove={(userBook) => void removeFromLibrary(userBook)}
            />
            <MyBooksSection
                title="Favoritos"
                books={overview.favorites.content}
                viewMoreTo="/my-books/list?favorite=true"
                removingUserBookId={removingUserBookId}
                onRemove={(userBook) => void removeFromLibrary(userBook)}
            />
        </div>
    );
}

export default MyBooksPage;
