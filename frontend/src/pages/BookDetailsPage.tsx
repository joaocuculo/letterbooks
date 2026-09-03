import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { BookResponse } from '../types/book';
import axios from 'axios';
import { getBookById } from '../services/bookService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import DOMPurify from 'dompurify';
import type {
    UserBookResponse,
    UserBookStatus,
    UserBookUpdate,
} from '../types/userBook';
import {
    createOrUpdate,
    findByGoogleBooksId as findUserBookByGoogleBooksId,
} from '../services/userBookService';
import type { PageResponse } from '../types/page';
import type { RatingResponse, RatingUpdate } from '../types/rating';
import {
    create as createRating,
    findByGoogleBooksId as findRatingsByGoogleBooksId,
    findMyRating,
    update as updateRating,
} from '../services/ratingService';
import { useAuth } from '../hooks/useAuth';
import BookRelationshipControls from '../components/BookRelationshipControls';
import RatingForm from '../components/RatingForm';
import RatingsList from '../components/RatingsList';

function BookDetailsPage() {
    const { googleBooksId } = useParams<{ googleBooksId: string }>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [book, setBook] = useState<BookResponse | null>(null);
    const [userBook, setUserBook] = useState<UserBookResponse | null>(null);
    const [ratingsPage, setRatingsPage] =
        useState<PageResponse<RatingResponse> | null>(null);
    const [myRating, setMyRating] = useState<RatingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserDataLoading, setIsUserDataLoading] =
        useState(isAuthenticated);
    const [isUserBookSaving, setIsUserBookSaving] = useState(false);
    const [isRatingSaving, setIsRatingSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [userDataErrorMessage, setUserDataErrorMessage] = useState<
        string | null
    >(null);
    const [userBookErrorMessage, setUserBookErrorMessage] = useState<
        string | null
    >(null);
    const [ratingErrorMessage, setRatingErrorMessage] = useState<
        string | null
    >(null);

    useEffect(() => {
        if (!googleBooksId) {
            return;
        }

        const requestedBookId = googleBooksId;
        const abortController = new AbortController();

        async function loadPublicData() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const [bookResult, ratingsResult] = await Promise.all([
                    getBookById(requestedBookId, abortController.signal),
                    findRatingsByGoogleBooksId(
                        requestedBookId,
                        abortController.signal
                    ),
                ]);

                setBook(bookResult);
                setRatingsPage(ratingsResult);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setBook(null);
                    setRatingsPage(null);
                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar os detalhes do livro.'
                        )
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadPublicData();

        return () => abortController.abort();
    }, [googleBooksId]);

    useEffect(() => {
        if (!googleBooksId || !isAuthenticated) {
            return;
        }

        const requestedBookId = googleBooksId;
        const abortController = new AbortController();

        async function loadUserData() {
            try {
                setIsUserDataLoading(true);
                setUserDataErrorMessage(null);

                const [userBookResult, ratingResult] = await Promise.all([
                    findUserBookByGoogleBooksId(
                        requestedBookId,
                        abortController.signal
                    ),
                    findMyRating(requestedBookId, abortController.signal),
                ]);

                setUserBook(userBookResult);
                setMyRating(ratingResult);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setUserBook(null);
                    setMyRating(null);
                    setUserDataErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar seus dados deste livro.'
                        )
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsUserDataLoading(false);
                }
            }
        }

        void loadUserData();

        return () => abortController.abort();
    }, [googleBooksId, isAuthenticated]);

    function redirectToLogin() {
        navigate('/login', {
            state: {
                from:
                    location.pathname + location.search + location.hash,
            },
        });
    }

    async function saveUserBook(data: UserBookUpdate) {
        if (!googleBooksId) {
            return;
        }

        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        try {
            setIsUserBookSaving(true);
            setUserBookErrorMessage(null);

            const result = await createOrUpdate(
                googleBooksId,
                userBook?.id ?? null,
                data
            );

            setUserBook(result);
        } catch (error) {
            setUserBookErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível atualizar sua relação com o livro.'
                )
            );
        } finally {
            setIsUserBookSaving(false);
        }
    }

    function handleFavoriteToggle() {
        void saveUserBook({
            isFavorite: !(userBook?.isFavorite ?? false),
        });
    }

    function handleStatusChange(status: UserBookStatus) {
        void saveUserBook({ status });
    }

    async function handleRatingSave(data: RatingUpdate) {
        if (!googleBooksId) {
            return;
        }

        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        try {
            setIsRatingSaving(true);
            setRatingErrorMessage(null);

            const result = myRating
                ? await updateRating(myRating.id, data)
                : await createRating({
                      ...data,
                      googleBooksId,
                  });

            setMyRating(result);
            setRatingsPage((previous) => {
                if (!previous) {
                    return previous;
                }

                const ratingAlreadyListed = previous.content.some(
                    (rating) => rating.id === result.id
                );

                if (ratingAlreadyListed) {
                    return {
                        ...previous,
                        content: previous.content.map((rating) =>
                            rating.id === result.id ? result : rating
                        ),
                    };
                }

                const totalElements = previous.page.totalElements + 1;

                return {
                    content: [result, ...previous.content],
                    page: {
                        ...previous.page,
                        totalElements,
                        totalPages: Math.ceil(
                            totalElements / previous.page.size
                        ),
                    },
                };
            });
        } catch (error) {
            setRatingErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível salvar sua avaliação.'
                )
            );
        } finally {
            setIsRatingSaving(false);
        }
    }

    const displayedUserBook = isAuthenticated ? userBook : null;

    if (!googleBooksId) {
        return (
            <div>
                <h1>Identificador inválido.</h1>
                <p>O identificador do livro não foi informado na URL.</p>
                <Link to="/"> Voltar à página inicial</Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div>
                <p>Carregando livro...</p>
            </div>
        );
    }

    if (errorMessage || !book) {
        return (
            <div>
                <h1>Livro não encontrado.</h1>
                <p>{errorMessage ?? 'Não encontramos esse livro.'}</p>
                <Link to="/">Voltar à página inicial</Link>
            </div>
        );
    }

    const authors = book.authors?.join(', ') ?? 'Autor não informado.';
    const categories = book.categories?.join(', ') ?? 'Sem categoria.';
    const coverUrl = (book.thumbnailUrl || book.imageUrl)?.replace(
        /^http:/,
        'https:'
    );

    return (
        <div>
            <Link to="/">← Voltar à página inicial</Link>

            <article>
                <div>
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={`Capa do livro ${book.title}`}
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div>Sem capa disponível</div>
                    )}
                </div>

                <div>
                    <h1>{book.title}</h1>

                    {book.subtitle && <p>{book.subtitle}</p>}

                    {isAuthenticated && userDataErrorMessage ? (
                        <section>
                            <h2>Minha relação com o livro</h2>
                            <p role="alert">{userDataErrorMessage}</p>
                        </section>
                    ) : (
                        <BookRelationshipControls
                            userBook={displayedUserBook}
                            isAuthenticated={isAuthenticated}
                            isLoading={isUserDataLoading}
                            isSaving={isUserBookSaving}
                            errorMessage={userBookErrorMessage}
                            onFavoriteToggle={handleFavoriteToggle}
                            onStatusChange={handleStatusChange}
                        />
                    )}

                    <div>
                        <p>
                            <strong>Autores: </strong>
                            {authors}
                        </p>

                        <p>
                            <strong>Editora: </strong>
                            {book.publisher ?? 'Não informada.'}
                        </p>

                        <p>
                            <strong>Publicação: </strong>
                            {book.publishedDate ?? 'Não informada.'}
                        </p>

                        <p>
                            <strong>Categorias: </strong>
                            {categories}
                        </p>

                        <p>
                            <strong>Páginas: </strong>
                            {book.pageCount ?? 'Não informado.'}
                        </p>

                        <p>
                            <strong>ISBN: </strong>
                            {book.isbn ?? 'Não informado.'}
                        </p>

                        <div
                            dangerouslySetInnerHTML={{
                                __html: book.description
                                    ? DOMPurify.sanitize(book.description)
                                    : 'Descrição não disponível.',
                            }}
                        />
                    </div>
                </div>
            </article>

            {isAuthenticated && userDataErrorMessage ? null : isAuthenticated ? (
                isUserDataLoading ? (
                    <p>Carregando sua avaliação...</p>
                ) : (
                    <RatingForm
                        key={myRating?.id ?? 'new-rating'}
                        rating={myRating}
                        isSaving={isRatingSaving}
                        errorMessage={ratingErrorMessage}
                        onSave={(data) => void handleRatingSave(data)}
                    />
                )
            ) : (
                <section>
                    <h2>Avaliar este livro</h2>
                    <button type="button" onClick={redirectToLogin}>
                        Entre para avaliar
                    </button>
                </section>
            )}

            <RatingsList ratings={ratingsPage?.content ?? []} />
        </div>
    );
}

export default BookDetailsPage;
