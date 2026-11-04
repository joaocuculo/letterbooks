import ActiveSearchFilters from '../components/ActiveSearchFilters';
import { toast } from '../components/ui/toast-manager';
import PaginationControls from '../components/PaginationControls';
import { Feedback } from '../components/ui/feedback';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import axios from 'axios';
import {
    Grid2X2,
    LayoutGrid,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerClose,
    DrawerTitle,
    DrawerDescription,
} from '../components/Drawer';
import ExploreBookCard from '../components/ExploreBookCard';
import {
    BookSelectionControls,
    useBookSelection,
} from '../components/BookSelection';
import { useAuth } from '../hooks/useAuth';
import { discover, searchBooks } from '../services/bookService';
import { createOrUpdate } from '../services/userBookService';
import type { BookCardResponse } from '../types/book';
import type { BookSearchFilters } from '../types/bookSearch';
import type { DiscoverSection } from '../types/discover';
import type { PageResponse } from '../types/page';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import '../styles/explore.css';

const filterFields = [
    ['title', 'Título'],
    ['author', 'Autor'],
    ['publisher', 'Editora'],
    ['subject', 'Assunto'],
    ['isbn', 'ISBN'],
] as const;
const keys: Array<keyof BookSearchFilters> = [
    'freeText',
    ...filterFields.map(([key]) => key),
];

function readFilters(params: URLSearchParams): BookSearchFilters {
    return Object.fromEntries(
        keys.map((key) => [
            key,
            params.get(key === 'freeText' ? 'q' : key)?.trim() || '',
        ])
    );
}
function readPage(params: URLSearchParams) {
    const page = Number(params.get('page'));
    return Number.isInteger(page) && page >= 0 ? page : 0;
}

function SearchControls({
    filters,
    active,
    onSearch,
    onClear,
}: {
    filters: BookSearchFilters;
    active: boolean;
    onSearch: (filters: BookSearchFilters) => void;
    onClear: () => void;
}) {
    const [draft, setDraft] = useState(filters);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [filterError, setFilterError] = useState('');
    const filterKey = JSON.stringify(filters);
    const [previousKey, setPreviousKey] = useState(filterKey);
    if (previousKey !== filterKey) {
        setPreviousKey(filterKey);
        setDraft(filters);
        setError('');
        setFilterError('');
    }
    function submit(event: React.FormEvent, advanced = false) {
        event.preventDefault();
        const values = advanced
            ? draft
            : { ...filters, freeText: draft.freeText };
        const trimmed = Object.fromEntries(
            keys.map((key) => [key, values[key]?.trim() || ''])
        );
        if (!Object.values(trimmed).some(Boolean)) {
            (advanced ? setFilterError : setError)(
                'Informe um termo ou preencha um filtro para pesquisar.'
            );
            return;
        }
        setError('');
        setFilterError('');
        if (advanced) setOpen(false);
        onSearch(trimmed);
    }
    return (
        <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
            <form
                className={`explore-search-form${active ? ' explore-search-active' : ''}`}
                onSubmit={(event) => submit(event)}
            >
                <div className="explore-search-bar">
                    <label className="explore-sr-only" htmlFor="explore-query">
                        Pesquisar livros
                    </label>
                    <div className="explore-query-wrap">
                        <Search size={20} aria-hidden="true" />
                        <Input
                            id="explore-query"
                            type="search"
                            value={draft.freeText || ''}
                            placeholder="Título, autor ou assunto"
                            aria-describedby={
                                error ? 'explore-search-error' : undefined
                            }
                            onChange={(e) =>
                                setDraft({ ...draft, freeText: e.target.value })
                            }
                        />
                        <DrawerTrigger
                            type="button"
                            className="explore-filter-trigger"
                            aria-label="Abrir pesquisa avançada"
                        >
                            <SlidersHorizontal size={20} aria-hidden="true" />
                        </DrawerTrigger>
                    </div>
                    {active && (
                        <Button
                            variant="ghost"
                            className="explore-clear"
                            type="button"
                            onClick={onClear}
                        >
                            <X size={17} aria-hidden="true" />
                            Limpar pesquisa
                        </Button>
                    )}
                    {error && (
                        <p
                            id="explore-search-error"
                            className="explore-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </div>
                <ActiveSearchFilters
                    items={filterFields.map(([key, label]) => ({
                        label,
                        value: filters[key],
                    }))}
                />
            </form>
            <DrawerContent className="landing catalog-density explore-drawer">
                <div className="explore-drawer-heading">
                    <DrawerTitle>Pesquisa avançada</DrawerTitle>
                    <DrawerClose
                        className="explore-filter-trigger"
                        aria-label="Fechar pesquisa avançada"
                    >
                        <X size={20} aria-hidden="true" />
                    </DrawerClose>
                </div>
                <DrawerDescription className="explore-drawer-description">
                    Refine a busca por título, autor, editora, assunto ou ISBN.
                </DrawerDescription>
                <form
                    className="explore-filter-fields"
                    data-base-ui-swipe-ignore
                    onSubmit={(event) => submit(event, true)}
                >
                    {filterError && (
                        <p className="explore-error" role="alert">
                            {filterError}
                        </p>
                    )}
                    {filterFields.map(([key, label]) => (
                        <div className="explore-field" key={key}>
                            <label htmlFor={`explore-${key}`}>{label}</label>
                            <Input
                                id={`explore-${key}`}
                                value={draft[key] || ''}
                                onChange={(e) =>
                                    setDraft({
                                        ...draft,
                                        [key]: e.target.value,
                                    })
                                }
                            />
                        </div>
                    ))}
                    <Button
                        variant="default"
                        type="submit"
                        className="explore-primary"
                    >
                        Aplicar filtros
                    </Button>
                    <Button
                        variant="ghost"
                        type="button"
                        className="explore-text-button"
                        onClick={() => {
                            const next = { freeText: filters.freeText || '' };
                            setDraft(next);
                            setError('');
                            setFilterError('');
                            setOpen(false);
                            onSearch(next);
                        }}
                    >
                        Limpar filtros
                    </Button>
                </form>
            </DrawerContent>
        </Drawer>
    );
}

export default function ExplorePage() {
    const selection = useBookSelection();
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const searchKey = params.toString();
    const requestParams = new URLSearchParams(params);
    requestParams.delete('layout');
    const requestKey = requestParams.toString();
    const filters = readFilters(params);
    const active = Object.values(filters).some(Boolean);
    const [sections, setSections] = useState<DiscoverSection[]>([]);
    const [result, setResult] = useState<PageResponse<BookCardResponse> | null>(
        null
    );
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [loadingBooks, setLoadingBooks] = useState<Record<string, boolean>>(
        {}
    );
    const detailed = params.get('layout') === 'detailed';
    function setDetailed(value: boolean) {
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                if (value) next.set('layout', 'detailed');
                else next.delete('layout');
                return next;
            },
            { replace: true }
        );
    }
    const [retry, setRetry] = useState(0);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const dataKey = `${requestKey}:${isAuthenticated}:${user?.id ?? ''}`;
    const selectionKey = `explore:${requestKey}:search`;
    const reloadSelectionSource = () => setRetry((value) => value + 1);

    useEffect(() => {
        const controller = new AbortController();
        const current = new URLSearchParams(requestKey);
        const currentFilters = readFilters(current);
        async function load() {
            setBusy(true);
            setError('');
            try {
                if (Object.values(currentFilters).some(Boolean)) {
                    const response = await searchBooks(
                        currentFilters,
                        readPage(current),
                        controller.signal
                    );
                    if (!controller.signal.aborted) {
                        setResult(response);
                        setSections([]);
                        setLoadedKey(dataKey);
                    }
                } else {
                    const response = await discover(controller.signal);
                    if (!controller.signal.aborted) {
                        setSections(response.sections);
                        setResult(null);
                        setLoadedKey(dataKey);
                    }
                }
            } catch (failure) {
                if (!controller.signal.aborted && !axios.isCancel(failure))
                    setError(
                        getApiErrorMessage(
                            failure,
                            'Não foi possível carregar os livros. Tente novamente.'
                        )
                    );
            } finally {
                if (!controller.signal.aborted) setBusy(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [requestKey, retry, isAuthenticated, user?.id, dataKey]);

    function search(next: BookSearchFilters) {
        const updated = new URLSearchParams();
        if (detailed) updated.set('layout', 'detailed');
        keys.forEach((key) => {
            if (next[key]?.trim())
                updated.set(key === 'freeText' ? 'q' : key, next[key]!.trim());
        });
        if (updated.toString() === searchKey)
            selection.confirmChange(() => {
                selection.cancel();
                setRetry((value) => value + 1);
            });
        else setParams(updated);
    }
    function changePage(page: number) {
        const updated = new URLSearchParams(params);
        if (page === 0) updated.delete('page');
        else updated.set('page', String(page));
        setParams(updated);
        document
            .getElementById('explore-results')
            ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    async function favorite(book: BookCardResponse) {
        if (!isAuthenticated) {
            navigate('/login', {
                state: {
                    from: location.pathname + location.search + location.hash,
                },
            });
            return;
        }
        setLoadingBooks((previous) => ({ ...previous, [book.id]: true }));
        try {
            const saved = await toast.promise(
                createOrUpdate(book.id, book.userBookId, {
                    isFavorite: !book.isFavorite,
                }),
                {
                    loading: 'Salvando favorito...',
                    success: 'Favorito atualizado.',
                    error: (failure) =>
                        getApiErrorMessage(
                            failure,
                            'Não foi possível atualizar o favorito.'
                        ),
                }
            );
            const update = (current: BookCardResponse) =>
                current.id === book.id
                    ? {
                          ...current,
                          isFavorite: saved.isFavorite,
                          userBookId: saved.id,
                      }
                    : current;
            setResult(
                (previous) =>
                    previous && {
                        ...previous,
                        content: previous.content.map(update),
                    }
            );
            setSections((previous) =>
                previous.map((section) => ({
                    ...section,
                    books: section.books.map(update),
                }))
            );
        } catch {
            // The promise toast presents the request error.
        } finally {
            setLoadingBooks((previous) => ({ ...previous, [book.id]: false }));
        }
    }
    function books(
        items: BookCardResponse[],
        showDetails = false,
        contextKey = selectionKey
    ) {
        return (
            <div
                className={`explore-grid${showDetails ? ' explore-grid-detailed' : ''}`}
            >
                {items.map((book) => (
                    <ExploreBookCard
                        selection={selection.cardSelection(contextKey, book.id)}
                        key={book.id}
                        book={book}
                        detailed={showDetails}
                        busy={loadingBooks[book.id] || false}
                        onFavorite={favorite}
                    />
                ))}
            </div>
        );
    }
    return (
        <div className="landing catalog-density explore-page">
            <SiteHeader />
            <main
                className={`explore-content${active ? ' explore-has-search' : ''}`}
            >
                {!active && (
                    <div className="explore-intro">
                        <h1>Encontre sua próxima leitura.</h1>
                        <p>
                            Pesquise por título, autor ou assunto. Descubra
                            histórias para a sua estante.
                        </p>
                    </div>
                )}
                <SearchControls
                    filters={filters}
                    active={active}
                    onSearch={search}
                    onClear={() => setParams(new URLSearchParams())}
                />
                <section
                    className="explore-results"
                    id="explore-results"
                    aria-busy={busy}
                    aria-label={
                        active ? 'Resultados da pesquisa' : 'Seleções de livros'
                    }
                >
                    {active && (
                        <div
                            className={`explore-results-heading${selection.session?.key === selectionKey ? ' explore-results-heading-selecting' : ''}`}
                        >
                            <h1>Resultados da pesquisa</h1>
                            <div className="explore-results-actions">
                                {loadedKey === dataKey && !error && result && (
                                    <BookSelectionControls
                                        contextKey={selectionKey}
                                        ids={result.content.map(
                                            (book) => book.id
                                        )}
                                        disabled={
                                            busy ||
                                            Object.values(loadingBooks).some(
                                                Boolean
                                            )
                                        }
                                        onAdded={reloadSelectionSource}
                                    />
                                )}
                                <div
                                    className="explore-view"
                                    role="group"
                                    aria-label="Visualização dos livros"
                                >
                                    <Button
                                        variant="outline"
                                        type="button"
                                        aria-label="Visualização compacta"
                                        aria-pressed={!detailed}
                                        onClick={() => setDetailed(false)}
                                    >
                                        <LayoutGrid
                                            size={20}
                                            aria-hidden="true"
                                        />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        aria-label="Visualização detalhada"
                                        aria-pressed={detailed}
                                        onClick={() => setDetailed(true)}
                                    >
                                        <Grid2X2 size={20} aria-hidden="true" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {busy && loadedKey !== dataKey ? (
                        <Feedback
                            kind="loading"
                            title={
                                active
                                    ? 'Pesquisando livros...'
                                    : 'Carregando seleções...'
                            }
                        />
                    ) : error ? (
                        <Feedback
                            kind="error"
                            title={error}
                            action={
                                <Button
                                    variant="default"
                                    className="explore-primary"
                                    type="button"
                                    onClick={() =>
                                        setRetry((value) => value + 1)
                                    }
                                >
                                    Tentar novamente
                                </Button>
                            }
                        />
                    ) : active ? (
                        result?.content.length ? (
                            <>
                                {books(result.content, detailed)}
                                {result.page.totalPages > 1 && (
                                    <PaginationControls
                                        className="explore-pagination"
                                        page={result.page.number}
                                        total={result.page.totalPages}
                                        busy={busy}
                                        onChange={changePage}
                                        label="Paginação da pesquisa"
                                    />
                                )}
                            </>
                        ) : (
                            <Feedback
                                kind="empty"
                                title="Nenhum livro encontrado."
                            >
                                Tente outro termo ou remova alguns filtros.
                            </Feedback>
                        )
                    ) : sections.length ? (
                        sections.map((section) => (
                            <section
                                className="explore-section"
                                key={section.key}
                            >
                                <div className="book-selection-source-heading">
                                    <h2>{section.title}</h2>
                                    {loadedKey === dataKey && (
                                        <BookSelectionControls
                                            contextKey={`explore:${requestKey}:${section.key}`}
                                            ids={section.books.map(
                                                (book) => book.id
                                            )}
                                            section
                                            disabled={
                                                busy ||
                                                Object.values(
                                                    loadingBooks
                                                ).some(Boolean)
                                            }
                                            onAdded={reloadSelectionSource}
                                        />
                                    )}
                                </div>
                                {books(
                                    section.books,
                                    false,
                                    `explore:${requestKey}:${section.key}`
                                )}
                            </section>
                        ))
                    ) : (
                        <p className="explore-state" role="status">
                            Nenhum livro disponível no momento.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
}
