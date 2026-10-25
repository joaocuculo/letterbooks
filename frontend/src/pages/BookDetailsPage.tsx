import { toast } from '../components/ui/toast-manager';
import { Feedback } from '../components/ui/feedback';
import { Button } from '../components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '../components/ui/dialog';
import BookCover from '../components/BookCover';
import AddToShelfDialog from '../components/AddToShelfDialog';
import {
    findMineByGoogleBooksId,
    type BookshelfMembership,
} from '../services/bookshelfService';
import { userBookStatusLabels } from '../utils/userBookStatus';
import DOMPurify from 'dompurify';
import SiteHeader from '../components/SiteHeader';
import BookRelationshipControls from '../components/BookRelationshipControls';
import RatingForm from '../components/RatingForm';
import RatingsList from '../components/RatingsList';
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
        <Feedback
            kind="error"
            title={error}
            action={
                <Button
                    variant="outline"
                    className="book-secondary"
                    type="button"
                    onClick={onRetry}
                >
                    <RefreshCw size={15} aria-hidden="true" />
                    Tentar novamente
                </Button>
            }
        />
    );
}

function BookDetails({ googleBooksId }: { googleBooksId: string | undefined }) {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const source = (location.state as { from?: unknown } | null)?.from;
    const backTo =
        typeof source === 'string' &&
        source.startsWith('/') &&
        !source.startsWith('//')
            ? source
            : '/explore';
    const [shelves, setShelves] = useState<BookshelfMembership[]>([]);
    const [shelvesError, setShelvesError] = useState('');
    const [shelvesBusy, setShelvesBusy] = useState(isAuthenticated);
    const [addingToShelf, setAddingToShelf] = useState(false);
    const [shelvesRetry, setShelvesRetry] = useState(0);
    const [ratingEditing, setRatingEditing] = useState(false);
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

    const consumedRatingAction = useRef(false);
    useEffect(() => {
        const state = location.state as {
            from?: unknown;
            ratingAction?: unknown;
            ratingId?: unknown;
        } | null;
        if (
            consumedRatingAction.current ||
            !state?.ratingAction ||
            !user ||
            userBusy ||
            userError
        )
            return;
        if (state.ratingAction !== 'edit' && state.ratingAction !== 'delete')
            return;
        consumedRatingAction.current = true;
        // Remove the intent from history before opening UI; revisits must not replay it.
        navigate(location.pathname + location.search + location.hash, {
            replace: true,
            state: { from: state.from },
        });
        if (!myRating || myRating.id !== state.ratingId) return;
        const action = state.ratingAction;
        queueMicrotask(() => {
            if (action === 'edit') {
                setRatingEditing(true);
                requestAnimationFrame(() =>
                    document
                        .querySelector<HTMLInputElement>(
                            '#book-rating-form input[type="radio"]'
                        )
                        ?.focus()
                );
            } else {
                setDeleteError('');
                setDeleteOpen(true);
            }
        });
    }, [location, navigate, myRating, user, userBusy, userError]);

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
            setRatingEditing(false);
            setDeleteOpen(false);
            toast.add({
                title: 'Sua avaliação foi excluída.',
                type: 'success',
            });
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
                await toast.promise(
                    createOrUpdate(googleBooksId, userBook?.id ?? null, data),
                    {
                        loading: 'Salvando livro...',
                        success: 'Livro atualizado.',
                        error: (error) =>
                            getApiErrorMessage(
                                error,
                                'Não foi possível salvar o livro.'
                            ),
                    }
                )
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
            setRatingEditing(false);
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
            toast.add({ title: 'Sua avaliação foi salva.', type: 'success' });
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
                    <Link className="book-back" to={backTo}>
                        <ArrowLeft size={16} aria-hidden="true" />
                        Voltar
                    </Link>
                </div>
                {!googleBooksId ? (
                    <h1>Identificador inválido.</h1>
                ) : bookBusy ? (
                    <Feedback kind="loading" title="Carregando livro..." />
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
                                        onAddToShelf={() => {
                                            if (!isAuthenticated) login();
                                            else setAddingToShelf(true);
                                        }}
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
                            <RatingsList
                                headingRef={ratingTitle}
                                ratings={ratingsPage?.content ?? []}
                                ownRating={isAuthenticated ? myRating : null}
                                onEdit={() => {
                                    setSaveRatingError('');
                                    setRatingEditing(true);
                                    requestAnimationFrame(() =>
                                        document
                                            .querySelector<HTMLInputElement>(
                                                '#book-rating-form input[type="radio"]'
                                            )
                                            ?.focus()
                                    );
                                }}
                                onDelete={() => {
                                    setDeleteError('');
                                    setDeleteOpen(true);
                                }}
                                editor={
                                    isAuthenticated && userBusy ? (
                                        <Feedback
                                            kind="loading"
                                            title="Carregando sua avaliação..."
                                        />
                                    ) : isAuthenticated && userError ? (
                                        <Retry
                                            error={userError}
                                            onRetry={() =>
                                                setUserRetry(
                                                    (value) => value + 1
                                                )
                                            }
                                        />
                                    ) : !isAuthenticated ||
                                      !myRating ||
                                      ratingEditing ? (
                                        <>
                                            <RatingForm
                                                key={myRating?.id ?? 'new'}
                                                rating={
                                                    isAuthenticated
                                                        ? myRating
                                                        : null
                                                }
                                                isSaving={savingRating}
                                                errorMessage={saveRatingError}
                                                onCancelEditing={
                                                    isAuthenticated && myRating
                                                        ? () => {
                                                              setRatingEditing(
                                                                  false
                                                              );
                                                              setSaveRatingError(
                                                                  ''
                                                              );
                                                              requestAnimationFrame(
                                                                  () =>
                                                                      ratingTitle.current?.focus()
                                                              );
                                                          }
                                                        : undefined
                                                }
                                                onSave={(data) => {
                                                    if (!isAuthenticated)
                                                        login();
                                                    else void saveRating(data);
                                                }}
                                            />
                                            {!isAuthenticated && (
                                                <p className="book-muted">
                                                    Entre para publicar sua
                                                    avaliação.
                                                </p>
                                            )}
                                        </>
                                    ) : undefined
                                }
                                feedback={
                                    ratingsBusy ? (
                                        <Feedback
                                            kind="loading"
                                            title="Carregando avaliações..."
                                        />
                                    ) : ratingsError ? (
                                        <Retry
                                            error={ratingsError}
                                            onRetry={() =>
                                                setRatingsRetry(
                                                    (value) => value + 1
                                                )
                                            }
                                        />
                                    ) : undefined
                                }
                            />
                        </div>
                    </article>
                )}
            </main>
            {addingToShelf && isAuthenticated && googleBooksId && book && (
                <AddToShelfDialog
                    book={{ googleBooksId, title: book.title }}
                    onClose={() => setAddingToShelf(false)}
                    onAdded={() => {
                        setShelvesRetry((value) => value + 1);
                        toast.add({
                            title: 'Livro adicionado às estantes selecionadas.',
                            type: 'success',
                        });
                    }}
                />
            )}
            <Dialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    if (!deletingRating) setDeleteOpen(open);
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="domain-dialog"
                    finalFocus={ratingTitle}
                    aria-busy={deletingRating}
                >
                    <DialogTitle>Excluir avaliação?</DialogTitle>
                    <DialogDescription>
                        Sua nota e seu comentário serão removidos. O livro
                        continuará na sua biblioteca.
                    </DialogDescription>
                    {deleteError && (
                        <p className="book-error" role="alert">
                            {deleteError}
                        </p>
                    )}
                    <div className="book-form-actions">
                        <DialogClose
                            render={<Button variant="outline" />}
                            className="book-secondary"
                            disabled={deletingRating}
                        >
                            Cancelar
                        </DialogClose>
                        <Button
                            variant="destructive"
                            type="button"
                            className="book-delete-confirm"
                            disabled={deletingRating}
                            onClick={() => void deleteRating()}
                        >
                            {deletingRating
                                ? 'Excluindo...'
                                : 'Excluir avaliação'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
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
