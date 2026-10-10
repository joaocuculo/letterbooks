import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Dialog } from '@base-ui/react/dialog';
import BookCover from '../components/BookCover';
import {
    findMineByGoogleBooksId,
    type BookshelfMembership,
} from '../services/bookshelfService';
import { userBookStatusLabels } from '../utils/userBookStatus';
import DOMPurify from 'dompurify';
import SiteHeader from '../components/SiteHeader';
import BookRelationshipControls from '../components/BookRelationshipControls';
import RatingForm from '../components/RatingForm';
import RatingsList, { RatingEntry } from '../components/RatingsList';
import { useAuth } from '../hooks/useAuth';
import { useRemoveUserBook } from '../hooks/useRemoveUserBook';
import { getBookById } from '../services/bookService';
import {
    createOrUpdate,
    findByGoogleBooksId as findUserBook,
} from '../services/userBookService';
import {
    create as createRating,
    update as updateRating,
    findByGoogleBooksId as findRatings,
    findMyRating,
    remove as removeRating,
} from '../services/ratingService';
import type { BookResponse } from '../types/book';
import type {
    UserBookResponse,
    UserBookStatus,
    UserBookUpdate,
} from '../types/userBook';
import type { PageResponse } from '../types/page';
import type { RatingResponse, RatingUpdate } from '../types/rating';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import '../styles/home.css';
import '../styles/book-details.css';

function Retry({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="book-load-error">
            <p className="book-error" role="alert">
                {error}
            </p>
            <button className="book-secondary" type="button" onClick={onRetry}>
                <RefreshCw size={15} aria-hidden="true" />
                Tentar novamente
            </button>
        </div>
    );
}

function BookDetails({ googleBooksId }: { googleBooksId: string | undefined }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [shelves, setShelves] = useState<BookshelfMembership[]>([]);
    const [shelvesError, setShelvesError] = useState('');
    const [shelvesBusy, setShelvesBusy] = useState(isAuthenticated);
    const [shelvesRetry, setShelvesRetry] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingRating, setDeletingRating] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const ratingTitle = useRef<HTMLHeadingElement>(null);
    const [book, setBook] = useState<BookResponse | null>(null);
    const [userBook, setUserBook] = useState<UserBookResponse | null>(null);
    const [ratingsPage, setRatingsPage] =
        useState<PageResponse<RatingResponse> | null>(null);
    const [myRating, setMyRating] = useState<RatingResponse | null>(null);
    const [bookBusy, setBookBusy] = useState(true);
    const [ratingsBusy, setRatingsBusy] = useState(true);
    const [userBusy, setUserBusy] = useState(isAuthenticated);
    const [savingBook, setSavingBook] = useState(false);
    const [savingRating, setSavingRating] = useState(false);
    const [bookError, setBookError] = useState('');
    const [ratingsError, setRatingsError] = useState('');
    const [userError, setUserError] = useState('');
    const [saveBookError, setSaveBookError] = useState('');
    const [saveRatingError, setSaveRatingError] = useState('');
    const [ratingOpen, setRatingOpen] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState('');
    const [bookRetry, setBookRetry] = useState(0);
    const [ratingsRetry, setRatingsRetry] = useState(0);
    const [userRetry, setUserRetry] = useState(0);
    const sidebar = useRef<HTMLDivElement>(null);
    const [sidebarFits, setSidebarFits] = useState(false);
    const { removingUserBookId, removeErrorMessage, removeFromLibrary } =
        useRemoveUserBook({
            onRemoved: () => {
                setUserBook(null);
                setShelvesRetry((value) => value + 1);
            },
        });

    useEffect(() => {
        if (!googleBooksId) return;
        const controller = new AbortController();
        async function load() {
            setBookBusy(true);
            setBookError('');
            try {
                const result = await getBookById(
                    googleBooksId!,
                    controller.signal
                );
                if (!controller.signal.aborted) setBook(result);
            } catch (error) {
                if (!controller.signal.aborted && !axios.isCancel(error))
                    setBookError(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar este livro.'
                        )
                    );
            } finally {
                if (!controller.signal.aborted) setBookBusy(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [googleBooksId, bookRetry]);

    useEffect(() => {
        if (!googleBooksId) return;
        const controller = new AbortController();
        async function load() {
            setRatingsBusy(true);
            setRatingsError('');
            try {
                const result = await findRatings(
                    googleBooksId!,
                    controller.signal
                );
                if (!controller.signal.aborted) setRatingsPage(result);
            } catch (error) {
                if (!controller.signal.aborted && !axios.isCancel(error))
                    setRatingsError(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar as avaliações.'
                        )
                    );
            } finally {
                if (!controller.signal.aborted) setRatingsBusy(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [googleBooksId, ratingsRetry]);

    useEffect(() => {
        if (!googleBooksId || !isAuthenticated) return;
        const controller = new AbortController();
        async function load() {
            setUserBusy(true);
            setUserError('');
            try {
                const [relation, rating] = await Promise.all([
                    findUserBook(googleBooksId!, controller.signal),
                    findMyRating(googleBooksId!, controller.signal),
                ]);
                if (!controller.signal.aborted) {
                    setUserBook(relation);
                    setMyRating(rating);
                }
            } catch (error) {
                if (!controller.signal.aborted && !axios.isCancel(error))
                    setUserError(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar seus dados deste livro.'
                        )
                    );
            } finally {
                if (!controller.signal.aborted) setUserBusy(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [googleBooksId, isAuthenticated, userRetry]);

    useEffect(() => {
        if (!googleBooksId || !isAuthenticated) return;
        const controller = new AbortController();
        async function load() {
            setShelvesBusy(true);
            setShelvesError('');
            try {
                const result = await findMineByGoogleBooksId(
                    googleBooksId!,
                    controller.signal
                );
                if (!controller.signal.aborted) setShelves(result);
            } catch (error) {
                if (!controller.signal.aborted && !axios.isCancel(error))
                    setShelvesError(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar suas estantes.'
                        )
                    );
            } finally {
                if (!controller.signal.aborted) setShelvesBusy(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [googleBooksId, isAuthenticated, shelvesRetry]);

    async function deleteRating() {
        if (!myRating) return;
        setDeletingRating(true);
        setDeleteError('');
        try {
            await removeRating(myRating.id);
            setRatingsPage((previous) => {
                if (!previous) return previous;
                const totalElements = Math.max(
                    0,
                    previous.page.totalElements - 1
                );
                return {
                    content: previous.content.filter(
                        (rating) => rating.id !== myRating.id
                    ),
                    page: {
                        ...previous.page,
                        totalElements,
                        totalPages: Math.ceil(
                            totalElements / previous.page.size
                        ),
                    },
                };
            });
            setMyRating(null);
            setDeleteOpen(false);
            setRatingSuccess('Sua avaliação foi excluída.');
        } catch (error) {
            setDeleteError(
                getApiErrorMessage(
                    error,
                    'Não foi possível excluir sua avaliação.'
                )
            );
        } finally {
            setDeletingRating(false);
        }
    }

    useEffect(() => {
        if (!sidebar.current) return;
        const element = sidebar.current;
        const check = () =>
            setSidebarFits(
                element.getBoundingClientRect().height + 48 <=
                    window.innerHeight
            );
        const observer = new ResizeObserver(check);
        observer.observe(element);
        window.addEventListener('resize', check);
        check();
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', check);
        };
    }, [book]);

    function login() {
        navigate('/login', {
            state: {
                from: location.pathname + location.search + location.hash,
            },
        });
    }
    function closeRating() {
        setRatingOpen(false);
        setSaveRatingError('');
        requestAnimationFrame(() => ratingTitle.current?.focus());
    }
    function openRating() {
        if (!isAuthenticated) {
            login();
            return;
        }
        setRatingSuccess('');
        setSaveRatingError('');
        setRatingOpen(true);
    }
    async function saveRelation(data: UserBookUpdate) {
        if (!isAuthenticated) {
            login();
            return;
        }
        if (!googleBooksId) return;
        setSavingBook(true);
        setSaveBookError('');
        try {
            setUserBook(
                await createOrUpdate(googleBooksId, userBook?.id ?? null, data)
            );
        } catch (error) {
            setSaveBookError(
                getApiErrorMessage(
                    error,
                    'Não foi possível atualizar sua relação com o livro.'
                )
            );
        } finally {
            setSavingBook(false);
        }
    }
    async function saveRating(data: RatingUpdate) {
        if (!isAuthenticated || !googleBooksId) return;
        setSavingRating(true);
        setSaveRatingError('');
        try {
            const wasNew = !myRating;
            const result = myRating
                ? await updateRating(myRating.id, data)
                : await createRating({ ...data, googleBooksId });
            setMyRating(result);
            setRatingsPage((previous) => {
                if (!previous) return previous;
                const listed = previous.content.some(
                    (rating) => rating.id === result.id
                );
                const totalElements =
                    previous.page.totalElements + (wasNew ? 1 : 0);
                return {
                    content: listed
                        ? previous.content.map((rating) =>
                              rating.id === result.id ? result : rating
                          )
                        : [result, ...previous.content].slice(
                              0,
                              previous.page.size
                          ),
                    page: {
                        ...previous.page,
                        totalElements,
                        totalPages: Math.ceil(
                            totalElements / previous.page.size
                        ),
                    },
                };
            });
            setRatingOpen(false);
            setRatingSuccess('Sua avaliação foi salva.');
            requestAnimationFrame(() => ratingTitle.current?.focus());
        } catch (error) {
            setSaveRatingError(
                getApiErrorMessage(
                    error,
                    'Não foi possível salvar sua avaliação.'
                )
            );
        } finally {
            setSavingRating(false);
        }
    }
    const cover = (book?.imageUrl || book?.thumbnailUrl)?.replace(
        /^http:/,
        'https:'
    );
    const metadata = book
        ? [
              ['Editora', book.publisher],
              ['Publicação', book.publishedDate],
              ['Páginas', book.pageCount?.toString()],
              ['ISBN', book.isbn],
              ['Categorias', book.categories?.join(', ')],
          ]
        : [];

    return (
        <div className="landing book-page">
            <SiteHeader />
            <main className="book-content" id="book-content">
                <div className="book-topbar">
                    <Link className="book-back" to="/explore">
                        <ArrowLeft size={16} aria-hidden="true" />
                        Voltar ao Explorar
                    </Link>
                </div>
                {!googleBooksId ? (
                    <h1>Identificador inválido.</h1>
                ) : bookBusy ? (
                    <p className="book-state" role="status">
                        Carregando livro...
                    </p>
                ) : bookError || !book ? (
                    <Retry
                        error={bookError || 'Livro não encontrado.'}
                        onRetry={() => setBookRetry((value) => value + 1)}
                    />
                ) : (
                    <article
                        className="book-layout book-layout-library"
                        aria-label={book.title}
                    >
                        <div
                            ref={sidebar}
                            className={`book-sidebar${sidebarFits ? ' book-sidebar-fits' : ''}`}
                        >
                            <BookCover src={cover} title={book.title} />
                            <div className="book-actions">
                                {userError ? (
                                    <Retry
                                        error={userError}
                                        onRetry={() =>
                                            setUserRetry((value) => value + 1)
                                        }
                                    />
                                ) : (
                                    <BookRelationshipControls
                                        userBook={userBook}
                                        isAuthenticated={isAuthenticated}
                                        isLoading={userBusy}
                                        isSaving={
                                            savingBook ||
                                            removingUserBookId !== null
                                        }
                                        errorMessage={
                                            saveBookError || removeErrorMessage
                                        }
                                        onFavoriteToggle={() =>
                                            void saveRelation({
                                                isFavorite: !(
                                                    userBook?.isFavorite ??
                                                    false
                                                ),
                                            })
                                        }
                                        onStatusChange={(
                                            status: UserBookStatus
                                        ) => void saveRelation({ status })}
                                        onRemove={() => {
                                            if (userBook)
                                                void removeFromLibrary(
                                                    userBook
                                                );
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <header className="book-identity">
                            <h1>{book.title}</h1>
                            {book.subtitle && (
                                <p className="book-subtitle">{book.subtitle}</p>
                            )}
                            <p className="book-authors">
                                {book.authors?.length
                                    ? book.authors.join(', ')
                                    : 'Autor não informado.'}
                            </p>
                        </header>
                        <section
                            className="book-synopsis"
                            aria-labelledby="book-synopsis-title"
                        >
                            <h2 id="book-synopsis-title">Sobre o livro</h2>
                            <div
                                className="book-description"
                                dangerouslySetInnerHTML={{
                                    __html: book.description
                                        ? DOMPurify.sanitize(book.description)
                                        : 'Descrição não disponível.',
                                }}
                            />
                        </section>
                        <section
                            className="book-metadata"
                            aria-labelledby="book-metadata-title"
                        >
                            <h2 id="book-metadata-title">
                                Informações da edição
                            </h2>
                            <dl>
                                {metadata.map(([label, value]) => (
                                    <div key={label}>
                                        <dt>{label}</dt>
                                        <dd>{value || 'Não informado.'}</dd>
                                    </div>
                                ))}
                            </dl>
                            {isAuthenticated &&
                                (shelvesBusy ? (
                                    <p className="book-muted" role="status">
                                        Carregando suas estantes...
                                    </p>
                                ) : shelvesError ? (
                                    <Retry
                                        error={shelvesError}
                                        onRetry={() =>
                                            setShelvesRetry(
                                                (value) => value + 1
                                            )
                                        }
                                    />
                                ) : (
                                    (userBook?.status ||
                                        userBook?.isFavorite ||
                                        shelves.length > 0) && (
                                        <section
                                            className="book-shelves"
                                            aria-label="Presença nas suas estantes"
                                        >
                                            <h3>Na sua biblioteca</h3>
                                            {(userBook?.status ||
                                                userBook?.isFavorite) && (
                                                <div>
                                                    <p className="book-muted">
                                                        Agrupamentos de leitura
                                                    </p>
                                                    <div className="book-shelf-names">
                                                        {userBook?.status && (
                                                            <span>
                                                                {
                                                                    userBookStatusLabels[
                                                                        userBook
                                                                            .status
                                                                    ]
                                                                }
                                                            </span>
                                                        )}
                                                        {userBook?.isFavorite && (
                                                            <span>
                                                                Favoritos
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {shelves.length > 0 && (
                                                <div>
                                                    <p className="book-muted">
                                                        Estantes personalizadas
                                                    </p>
                                                    <div className="book-shelf-names">
                                                        {shelves.map(
                                                            (shelf) => (
                                                                <span
                                                                    key={
                                                                        shelf.id
                                                                    }
                                                                >
                                                                    {shelf.name}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    )
                                ))}
                        </section>
                        <div className="book-opinions">
                            <section
                                className="book-my-rating"
                                aria-labelledby="book-my-rating-title"
                            >
                                <h2
                                    id="book-my-rating-title"
                                    ref={ratingTitle}
                                    tabIndex={-1}
                                >
                                    Sua avaliação
                                </h2>
                                {userBusy ? (
                                    <p role="status">
                                        Carregando sua avaliação...
                                    </p>
                                ) : userError ? (
                                    <Retry
                                        error={userError}
                                        onRetry={() =>
                                            setUserRetry((value) => value + 1)
                                        }
                                    />
                                ) : ratingOpen ? (
                                    <RatingForm
                                        rating={myRating}
                                        isSaving={savingRating}
                                        errorMessage={saveRatingError}
                                        onSave={(data) => void saveRating(data)}
                                        onCancel={closeRating}
                                    />
                                ) : myRating ? (
                                    <>
                                        <RatingEntry
                                            rating={myRating}
                                            own
                                            onEdit={openRating}
                                            onDelete={() => {
                                                setDeleteError('');
                                                setDeleteOpen(true);
                                            }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <p className="book-muted">
                                            {isAuthenticated
                                                ? 'O que você achou desta leitura?'
                                                : 'Entre para registrar sua nota e compartilhar sua opinião.'}
                                        </p>
                                        <button
                                            type="button"
                                            className="book-text-button"
                                            onClick={openRating}
                                        >
                                            {isAuthenticated
                                                ? 'Escrever uma avaliação'
                                                : 'Entrar para avaliar'}
                                        </button>
                                    </>
                                )}
                                {ratingSuccess && (
                                    <p className="book-success" role="status">
                                        {ratingSuccess}
                                    </p>
                                )}
                            </section>
                            {ratingsBusy ? (
                                <p role="status">
                                    Carregando avaliações dos leitores...
                                </p>
                            ) : ratingsError ? (
                                <section>
                                    <h2>Avaliações dos leitores</h2>
                                    <Retry
                                        error={ratingsError}
                                        onRetry={() =>
                                            setRatingsRetry(
                                                (value) => value + 1
                                            )
                                        }
                                    />
                                </section>
                            ) : (
                                <RatingsList
                                    ratings={ratingsPage?.content ?? []}
                                />
                            )}
                        </div>
                    </article>
                )}
            </main>
            <Dialog.Root
                open={deleteOpen}
                onOpenChange={(open) => {
                    if (!deletingRating) setDeleteOpen(open);
                }}
            >
                <Dialog.Portal>
                    <Dialog.Backdrop className="book-dialog-overlay" />
                    <Dialog.Popup
                        className="landing book-delete-dialog"
                        finalFocus={ratingTitle}
                        aria-busy={deletingRating}
                    >
                        <Dialog.Title>Excluir avaliação?</Dialog.Title>
                        <Dialog.Description>
                            Sua nota e seu comentário serão removidos. O livro
                            continuará na sua biblioteca.
                        </Dialog.Description>
                        {deleteError && (
                            <p className="book-error" role="alert">
                                {deleteError}
                            </p>
                        )}
                        <div className="book-form-actions">
                            <Dialog.Close
                                className="book-secondary"
                                disabled={deletingRating}
                            >
                                Cancelar
                            </Dialog.Close>
                            <button
                                type="button"
                                className="book-delete-confirm"
                                disabled={deletingRating}
                                onClick={() => void deleteRating()}
                            >
                                {deletingRating
                                    ? 'Excluindo...'
                                    : 'Excluir avaliação'}
                            </button>
                        </div>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}

export default function BookDetailsPage() {
    const { googleBooksId } = useParams<{ googleBooksId: string }>();
    const { user } = useAuth();
    return (
        <BookDetails
            key={`${googleBooksId}:${user?.id ?? 'visitor'}`}
            googleBooksId={googleBooksId}
        />
    );
}
