import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Dialog } from '@base-ui/react/dialog';
import { ArrowLeft, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import LibraryBookCard from '../components/LibraryBookCard';
import ShelfManager from '../components/ShelfManager';
import AddToShelfDialog from '../components/AddToShelfDialog';
import type { BookSummary } from '../types/book';
import { useMyBooks, type LibraryQuery } from '../hooks/useMyBooks';
import { useAuth } from '../hooks/useAuth';
import { isUserBookStatus } from '../utils/userBookStatus';
import type { UserBookFilters, UserBookResponse } from '../types/userBook';
import '../styles/home.css';
import '../styles/my-books.css';

const categories = [
    {
        key: 'READING',
        label: 'Lendo',
        title: 'Continuar lendo',
        filters: { status: 'READING' },
    },
    {
        key: 'WANT_TO_READ',
        label: 'Quero ler',
        title: 'Quero ler',
        filters: { status: 'WANT_TO_READ' },
    },
    {
        key: 'COMPLETED',
        label: 'Lidos',
        title: 'Lidos',
        filters: { status: 'COMPLETED' },
    },
    {
        key: 'ABANDONED',
        label: 'Abandonados',
        title: 'Abandonados',
        filters: { status: 'ABANDONED' },
    },
    {
        key: 'FAVORITES',
        label: 'Favoritos',
        title: 'Favoritos',
        filters: { favorite: true },
    },
] satisfies {
    key: string;
    label: string;
    title: string;
    filters: UserBookFilters;
}[];
const navigation = [
    { key: 'ALL', label: 'Todos' },
    categories[1],
    categories[0],
    ...categories.slice(2),
    { key: 'SHELVES', label: 'Estantes' },
];
function LibraryEmpty({ summary = false }: { summary?: boolean }) {
    return (
        <div className="library-empty">
            <BookOpen size={22} aria-hidden="true" />
            <p>
                {summary
                    ? 'Nenhum livro nesta seção.'
                    : 'Nenhum livro neste agrupamento.'}
            </p>
            <Link to="/explore">
                Explorar livros <ArrowRight size={15} aria-hidden="true" />
            </Link>
        </div>
    );
}
function LibraryContent() {
    const [params, setParams] = useSearchParams();
    const [adding, setAdding] = useState<BookSummary | null>(null);
    const [shelfNotice, setShelfNotice] = useState('');
    const [removeTarget, setRemoveTarget] = useState<UserBookResponse | null>(
        null
    );
    const heading = useRef<HTMLHeadingElement>(null);
    const status = isUserBookStatus(params.get('status'))
        ? (params.get('status') as NonNullable<UserBookFilters['status']>)
        : undefined;
    const favorite = params.get('favorite') === 'true' || undefined;
    const parsedPage = Number(params.get('page'));
    const page =
        Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
    const summary = params.get('view') === 'shelves';
    const selected = summary
        ? 'SHELVES'
        : favorite && !status
          ? 'FAVORITES'
          : (status ?? 'ALL');
    const title = summary
        ? 'Suas estantes'
        : status && favorite
          ? `${categories.find((category) => category.key === status)?.label} · Favoritos`
          : (navigation.find((item) => item.key === selected)?.label ??
            'Todos');
    const queries = useMemo<LibraryQuery[]>(
        () =>
            summary
                ? []
                : [
                      {
                          key: 'active',
                          filters: {
                              status,
                              favorite,
                              page,
                              size: 20,
                              sort: 'updatedAt,desc',
                          },
                      },
                  ],
        [summary, status, favorite, page]
    );
    const changePage = useCallback(
        (next: number) =>
            setParams((previous) => {
                const nextParams = new URLSearchParams(previous);
                if (next === 0) nextParams.delete('page');
                else nextParams.set('page', String(next));
                return nextParams;
            }),
        [setParams]
    );
    const { states, pending, errors, success, reload, mutate } = useMyBooks(
        queries,
        changePage
    );
    function choose(key: string) {
        const next = new URLSearchParams();
        if (key === 'ALL') next.set('view', 'all');
        else if (key === 'SHELVES') next.set('view', 'shelves');
        else if (key === 'FAVORITES') next.set('favorite', 'true');
        else if (key !== 'SUMMARY') next.set('status', key);
        setParams(next);
    }
    function renderBooks(books: UserBookResponse[]) {
        return (
            <div className="library-books">
                {books.map((book) => (
                    <LibraryBookCard
                        key={`${book.id}:${book.book.thumbnailUrl ?? ''}`}
                        book={book}
                        busy={Boolean(pending[book.id])}
                        error={errors[book.id]}
                        onUpdate={(data) => void mutate(book, data)}
                        onRemove={() => setRemoveTarget(book)}
                        onAdd={() => setAdding(book.book)}
                    />
                ))}
            </div>
        );
    }
    function renderQuery(query: LibraryQuery) {
        const state = states[query.key];
        const matches =
            state &&
            JSON.stringify(state.filters) === JSON.stringify(query.filters);
        const data = matches ? state.data : null;
        return (
            <>
                {!matches || (state.busy && !data) ? (
                    <p className="library-loading" role="status">
                        Carregando livros...
                    </p>
                ) : state.error ? (
                    <div className="library-error">
                        <p role="alert">{state.error}</p>
                        <button
                            type="button"
                            className="library-secondary"
                            onClick={() => void reload(query.key)}
                        >
                            <RefreshCw size={15} aria-hidden="true" />
                            Tentar novamente
                        </button>
                    </div>
                ) : data?.content.length ? (
                    renderBooks(data.content)
                ) : (
                    <LibraryEmpty summary={summary} />
                )}
                {state?.busy && data && (
                    <p className="library-loading" role="status">
                        Atualizando livros...
                    </p>
                )}
            </>
        );
    }
    const active = states.active;
    const activeMatches =
        active &&
        JSON.stringify(active.filters) === JSON.stringify(queries[0]?.filters);
    const activeData = activeMatches ? active.data : null;
    async function confirmRemove() {
        if (removeTarget && (await mutate(removeTarget, null)))
            setRemoveTarget(null);
    }
    return (
        <div className="landing library-page library-consolidated">
            <SiteHeader />
            <main className="library-content">
                <header className="library-page-heading">
                    <div>
                        <h1 ref={heading} tabIndex={-1}>
                            Minha Biblioteca
                        </h1>
                        <p>Seus livros, suas leituras e suas estantes.</p>
                    </div>
                </header>
                <div className="library-layout">
                    <nav
                        className="library-navigation"
                        aria-label="Agrupamentos da biblioteca"
                    >
                        <div className="library-category-buttons">
                            {navigation.map((item) => (
                                <button
                                    type="button"
                                    key={item.key}
                                    aria-current={
                                        item.key === selected
                                            ? 'page'
                                            : undefined
                                    }
                                    onClick={() => choose(item.key)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div className="library-category-select">
                            <label htmlFor="library-category">
                                Agrupamento
                            </label>
                            <select
                                id="library-category"
                                value={selected}
                                onChange={(event) => choose(event.target.value)}
                            >
                                {navigation.map((item) => (
                                    <option value={item.key} key={item.key}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </nav>
                    <div className="library-results">
                        <div className="library-results-heading">
                            <h2>{title}</h2>
                            {!summary && activeData && !active?.error && (
                                <span>
                                    {activeData.page.totalElements}{' '}
                                    {activeData.page.totalElements === 1
                                        ? 'livro'
                                        : 'livros'}
                                </span>
                            )}
                        </div>
                        {shelfNotice && (
                            <p className="library-success" role="status">
                                {shelfNotice}
                            </p>
                        )}
                        {success && (
                            <p className="library-success" role="status">
                                {success}
                            </p>
                        )}
                        {status && favorite && (
                            <div className="library-filter-tags">
                                <span>
                                    {
                                        categories.find(
                                            (item) => item.key === status
                                        )?.label
                                    }
                                </span>
                                <span>Favoritos</span>
                            </div>
                        )}
                        {summary ? (
                            <ShelfManager page={page} changePage={changePage} />
                        ) : (
                            <>
                                {renderQuery(queries[0])}
                                {activeData &&
                                    !active?.error &&
                                    activeData.page.totalPages > 1 && (
                                        <nav
                                            className="library-pagination"
                                            aria-label="Paginação dos meus livros"
                                        >
                                            <button
                                                type="button"
                                                className="library-secondary"
                                                onClick={() =>
                                                    changePage(page - 1)
                                                }
                                                disabled={
                                                    page === 0 || active.busy
                                                }
                                            >
                                                <ArrowLeft
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                                Anterior
                                            </button>
                                            <span>
                                                Página {page + 1} de{' '}
                                                {activeData.page.totalPages}
                                            </span>
                                            <button
                                                type="button"
                                                className="library-secondary"
                                                onClick={() =>
                                                    changePage(page + 1)
                                                }
                                                disabled={
                                                    page + 1 >=
                                                        activeData.page
                                                            .totalPages ||
                                                    active.busy
                                                }
                                            >
                                                Próxima
                                                <ArrowRight
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </nav>
                                    )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            {adding && (
                <AddToShelfDialog
                    book={adding}
                    onClose={() => setAdding(null)}
                    onAdded={() => {
                        setShelfNotice('Livro adicionado à estante.');
                        void reload('active');
                    }}
                />
            )}
            <Dialog.Root
                open={Boolean(removeTarget)}
                onOpenChange={(open) => {
                    if (!open && !pending[removeTarget?.id ?? -1])
                        setRemoveTarget(null);
                }}
            >
                <Dialog.Portal>
                    <Dialog.Backdrop className="library-dialog-overlay" />
                    <Dialog.Popup
                        className="landing library-remove-dialog"
                        finalFocus={heading}
                        aria-busy={Boolean(pending[removeTarget?.id ?? -1])}
                    >
                        <Dialog.Title>Remover da biblioteca?</Dialog.Title>
                        <Dialog.Description>
                            Você quer remover “{removeTarget?.book.title}” da
                            sua biblioteca?
                        </Dialog.Description>
                        {errors[removeTarget?.id ?? -1] && (
                            <p className="library-danger" role="alert">
                                {errors[removeTarget!.id]}
                            </p>
                        )}
                        <div className="library-dialog-actions">
                            <Dialog.Close
                                className="library-secondary"
                                disabled={Boolean(
                                    pending[removeTarget?.id ?? -1]
                                )}
                            >
                                Cancelar
                            </Dialog.Close>
                            <button
                                className="library-remove-confirm"
                                type="button"
                                disabled={Boolean(
                                    pending[removeTarget?.id ?? -1]
                                )}
                                onClick={() => void confirmRemove()}
                            >
                                {pending[removeTarget?.id ?? -1]
                                    ? 'Removendo...'
                                    : 'Remover livro'}
                            </button>
                        </div>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
export default function MyBooksPage() {
    const { user } = useAuth();
    return <LibraryContent key={user?.id ?? 'visitor'} />;
}
