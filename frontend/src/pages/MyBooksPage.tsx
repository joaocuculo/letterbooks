import { toast } from '../components/ui/toast-manager';
import PaginationControls from '../components/PaginationControls';
import { Feedback } from '../components/ui/feedback';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '../components/ui/dialog';
import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
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
    const { states, pending, errors, reload, mutate } = useMyBooks(
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
                    <Feedback kind="loading" title="Carregando livros..." />
                ) : state.error ? (
                    <Feedback
                        kind="error"
                        title={state.error}
                        action={
                            <Button
                                variant="outline"
                                type="button"
                                className="library-secondary"
                                onClick={() => void reload(query.key)}
                            >
                                <RefreshCw size={15} aria-hidden="true" />
                                Tentar novamente
                            </Button>
                        }
                    />
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
        <div className="landing catalog-density library-page library-consolidated">
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
                                <Button
                                    variant="outline"
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
                                </Button>
                            ))}
                        </div>
                        <div className="library-category-select">
                            <label htmlFor="library-category">
                                Agrupamento
                            </label>
                            <Select
                                items={navigation.map((item) => ({
                                    value: item.key,
                                    label: item.label,
                                }))}
                                value={selected}
                                onValueChange={(value) => {
                                    if (value !== null) choose(value);
                                }}
                            >
                                <SelectTrigger id="library-category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false}>
                                    <SelectGroup>
                                        {navigation.map((item) => (
                                            <SelectItem
                                                value={item.key}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
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
                                        <PaginationControls
                                            className="library-pagination"
                                            page={page}
                                            total={activeData.page.totalPages}
                                            busy={active.busy}
                                            onChange={changePage}
                                            label="Paginação dos meus livros"
                                        />
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
                        toast.add({
                            title: 'Livro adicionado às estantes selecionadas.',
                            type: 'success',
                        });
                        void reload('active');
                    }}
                />
            )}
            <Dialog
                open={Boolean(removeTarget)}
                onOpenChange={(open) => {
                    if (!open && !pending[removeTarget?.id ?? -1])
                        setRemoveTarget(null);
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="domain-dialog"
                    finalFocus={heading}
                    aria-busy={Boolean(pending[removeTarget?.id ?? -1])}
                >
                    <DialogTitle>Remover da biblioteca?</DialogTitle>
                    <DialogDescription>
                        Você quer remover “{removeTarget?.book.title}” da sua
                        biblioteca?
                    </DialogDescription>
                    {errors[removeTarget?.id ?? -1] && (
                        <p className="library-danger" role="alert">
                            {errors[removeTarget!.id]}
                        </p>
                    )}
                    <div className="library-dialog-actions">
                        <DialogClose
                            render={<Button variant="outline" />}
                            className="library-secondary"
                            disabled={Boolean(pending[removeTarget?.id ?? -1])}
                        >
                            Cancelar
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="library-remove-confirm"
                            type="button"
                            disabled={Boolean(pending[removeTarget?.id ?? -1])}
                            onClick={() => void confirmRemove()}
                        >
                            {pending[removeTarget?.id ?? -1]
                                ? 'Removendo...'
                                : 'Remover livro'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
export default function MyBooksPage() {
    const { user } = useAuth();
    return <LibraryContent key={user?.id ?? 'visitor'} />;
}
