import axios from 'axios';
import {
    ArrowLeft,
    ArrowRight,
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
                        <input
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
                        <button type="submit" className="explore-primary">
                            Pesquisar
                        </button>
                    </div>
                    {active && (
                        <button
                            className="explore-clear"
                            type="button"
                            onClick={onClear}
                        >
                            <X size={17} aria-hidden="true" />
                            Limpar pesquisa
                        </button>
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
            </form>
            <DrawerContent className="landing explore-drawer">
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
                            <input
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
                    <button type="submit" className="explore-primary">
                        Aplicar filtros
                    </button>
                    <button
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
                    </button>
                </form>
            </DrawerContent>
        </Drawer>
    );
}

export default function ExplorePage() {
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const searchKey = params.toString();
    const filters = readFilters(params);
    const active = Object.values(filters).some(Boolean);
    const [sections, setSections] = useState<DiscoverSection[]>([]);
    const [result, setResult] = useState<PageResponse<BookCardResponse> | null>(
        null
    );
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [favoriteError, setFavoriteError] = useState('');
    const [loadingBooks, setLoadingBooks] = useState<Record<string, boolean>>(
        {}
    );
    const [detailed, setDetailed] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const current = new URLSearchParams(searchKey);
        const currentFilters = readFilters(current);
        async function load() {
            setBusy(true);
            setError('');
            setFavoriteError('');
            setResult(null);
            setSections([]);
            try {
                if (Object.values(currentFilters).some(Boolean)) {
                    const response = await searchBooks(
                        currentFilters,
                        readPage(current),
                        controller.signal
                    );
                    if (!controller.signal.aborted) setResult(response);
                } else {
                    const response = await discover(controller.signal);
                    if (!controller.signal.aborted)
                        setSections(response.sections);
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
    }, [searchKey, retry, isAuthenticated, user?.id]);

    function search(next: BookSearchFilters) {
        const updated = new URLSearchParams();
        keys.forEach((key) => {
            if (next[key]?.trim())
                updated.set(key === 'freeText' ? 'q' : key, next[key]!.trim());
        });
        if (updated.toString() === searchKey) setRetry((value) => value + 1);
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
        setFavoriteError('');
        try {
            const saved = await createOrUpdate(book.id, book.userBookId, {
                isFavorite: !book.isFavorite,
            });
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
        } catch (failure) {
            setFavoriteError(
                getApiErrorMessage(
                    failure,
                    'Não foi possível atualizar o favorito.'
                )
            );
        } finally {
            setLoadingBooks((previous) => ({ ...previous, [book.id]: false }));
        }
    }
    function books(items: BookCardResponse[], showDetails = false) {
        return (
            <div
                className={`explore-grid${showDetails ? ' explore-grid-detailed' : ''}`}
            >
                {items.map((book) => (
                    <ExploreBookCard
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
        <div className="landing explore-page">
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
                        <div className="explore-results-heading">
                            <h1>Resultados da pesquisa</h1>
                            <div
                                className="explore-view"
                                role="group"
                                aria-label="Visualização dos livros"
                            >
                                <button
                                    type="button"
                                    aria-label="Visualização compacta"
                                    aria-pressed={!detailed}
                                    onClick={() => setDetailed(false)}
                                >
                                    <LayoutGrid size={20} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Visualização detalhada"
                                    aria-pressed={detailed}
                                    onClick={() => setDetailed(true)}
                                >
                                    <Grid2X2 size={20} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    )}
                    {favoriteError && (
                        <p role="alert" className="explore-error">
                            {favoriteError}
                        </p>
                    )}
                    {busy ? (
                        <p className="explore-state" role="status">
                            {active
                                ? 'Pesquisando livros...'
                                : 'Carregando seleções...'}
                        </p>
                    ) : error ? (
                        <div className="explore-state">
                            <p className="explore-error" role="alert">
                                {error}
                            </p>
                            <button
                                className="explore-primary"
                                type="button"
                                onClick={() => setRetry((value) => value + 1)}
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : active ? (
                        result?.content.length ? (
                            <>
                                {books(result.content, detailed)}
                                {result.page.totalPages > 1 && (
                                    <nav
                                        className="explore-pagination"
                                        aria-label="Paginação da pesquisa"
                                    >
                                        <button
                                            type="button"
                                            disabled={
                                                busy || result.page.number === 0
                                            }
                                            onClick={() =>
                                                changePage(
                                                    result.page.number - 1
                                                )
                                            }
                                        >
                                            <ArrowLeft
                                                size={18}
                                                aria-hidden="true"
                                            />
                                            Anterior
                                        </button>
                                        <span>
                                            Página {result.page.number + 1} de{' '}
                                            {result.page.totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={
                                                busy ||
                                                result.page.number + 1 >=
                                                    result.page.totalPages
                                            }
                                            onClick={() =>
                                                changePage(
                                                    result.page.number + 1
                                                )
                                            }
                                        >
                                            Próxima
                                            <ArrowRight
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </nav>
                                )}
                            </>
                        ) : (
                            <div className="explore-state" role="status">
                                <h2>Nenhum livro encontrado.</h2>
                                <p>
                                    Tente outro termo ou remova alguns filtros.
                                </p>
                            </div>
                        )
                    ) : sections.length ? (
                        sections.map((section) => (
                            <section
                                className="explore-section"
                                key={section.key}
                            >
                                <h2>{section.title}</h2>
                                {books(section.books)}
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
