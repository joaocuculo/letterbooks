import { toast } from './ui/toast-manager';
import { Button } from './ui/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    useSearchParams,
    useLocation,
    useNavigate,
    Link,
} from 'react-router-dom';
import ShelfActionsMenu from './ShelfActionsMenu';
import { Feedback } from './ui/feedback';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLibraryResource } from '../hooks/useLibraryResource';
import * as service from '../services/bookshelfService';
import * as relation from '../services/userBookService';
import type { BookSummary } from '../types/book';
import type { UserBookUpdate } from '../types/userBook';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import LibraryShelfPreview from './LibraryShelfPreview';
import LibraryBookCard from './LibraryBookCard';
import LibraryBareBookCard from './LibraryBareBookCard';
import ShelfEditor from './ShelfEditor';
import AddToShelfDialog from './AddToShelfDialog';
import { BookSelectionControls, useBookSelection } from './BookSelection';

type Target =
    | { shelf: service.BookshelfSummary }
    | { record: service.BookshelfBook; detach: boolean };

// History state keeps list context without changing shared library URLs.
type ShelfListOrigin = { page: number; scrollY: number; shelfId: number };
type ShelfNavigationState = {
    shelfOrigin?: ShelfListOrigin;
    restoreShelfList?: ShelfListOrigin;
};

function ShelfDescription({ text }: { text: string }) {
    const paragraph = useRef<HTMLParagraphElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);
    useEffect(() => {
        const element = paragraph.current;
        if (!element) return;
        const measure = () => {
            const lineHeight = Number.parseFloat(
                getComputedStyle(element).lineHeight
            );
            setOverflows(element.scrollHeight > lineHeight * 3 + 1);
        };
        const frame = requestAnimationFrame(measure);
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);
    return (
        <div className="shelf-description">
            <p
                ref={paragraph}
                className={expanded ? undefined : 'shelf-description-clamped'}
            >
                {text}
            </p>
            {overflows && (
                <Button
                    variant="ghost"
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((value) => !value)}
                >
                    {expanded ? 'Ver menos' : 'Ver mais'}
                </Button>
            )}
        </div>
    );
}

export default function ShelfManager({
    page,
    changePage,
}: {
    page: number;
    changePage: (page: number, preserveNavigationState?: boolean) => void;
}) {
    const selection = useBookSelection();
    const [params] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const navigationState = location.state as ShelfNavigationState | null;
    const heading = useRef<HTMLHeadingElement>(null);
    const focusedShelf = useRef<number | null>(null);
    const restoredLocation = useRef<string | null>(null);
    const rawId = Number(params.get('shelfId'));
    const id = Number.isSafeInteger(rawId) && rawId > 0 ? rawId : null;
    const selectionKey = `shelf:${id}:${page}`;
    const { user } = useAuth();
    const [revision, setRevision] = useState(0);
    const [editor, setEditor] = useState<
        service.BookshelfSummary | 'new' | null
    >(null);
    const [adding, setAdding] = useState<BookSummary | null>(null);
    const [target, setTarget] = useState<Target | null>(null);
    const [confirmBusy, setConfirmBusy] = useState(false);
    const [confirmError, setConfirmError] = useState('');
    const [pending, setPending] = useState<Record<number, boolean>>({});
    const locks = useRef(new Set<number>());
    const [errors, setErrors] = useState<Record<number, string>>({});

    const refresh = () => setRevision((v) => v + 1);
    const load = useCallback(
        async (signal: AbortSignal) => {
            if (!user) throw new Error('Entre para acessar suas estantes.');
            if (id) {
                const [summary, books] = await Promise.all([
                    service.shelfSummary(id, signal),
                    service.shelfBooks(id, page, signal),
                ]);
                return { summary, books, list: null };
            }
            return {
                summary: null,
                books: null,
                list: await service.listShelves(user.id, page, signal),
            };
        },
        [id, page, user]
    );
    const state = useLibraryResource(`${id}:${page}`, load, revision);
    const data = state.data;
    const pagination = data?.books?.page ?? data?.list?.page;
    useEffect(() => {
        if (!id) {
            focusedShelf.current = null;
            return;
        }
        if (data?.summary && focusedShelf.current !== id) {
            heading.current?.focus({ preventScroll: true });
            window.scrollTo({ top: 0, behavior: 'instant' });
            focusedShelf.current = id;
        }
    }, [id, data?.summary]);
    useEffect(() => {
        const origin = navigationState?.restoreShelfList;
        if (
            id ||
            !origin ||
            !data?.list ||
            state.busy ||
            state.error ||
            restoredLocation.current === location.key ||
            (page > 0 && page >= data.list.page.totalPages)
        )
            return;
        const frame = requestAnimationFrame(() => {
            document
                .getElementById(`shelf-${origin.shelfId}`)
                ?.querySelector<HTMLButtonElement>('.library-shelf-open')
                ?.focus({ preventScroll: true });
            window.scrollTo({ top: origin.scrollY, behavior: 'instant' });
            restoredLocation.current = location.key;
        });
        return () => cancelAnimationFrame(frame);
    }, [
        id,
        navigationState,
        data?.list,
        state.busy,
        state.error,
        location.key,
        page,
    ]);
    function openShelf(shelfId: number) {
        const origin = { page, scrollY: window.scrollY, shelfId };
        // Also mark the current list entry so the browser Back button restores it.
        navigate(
            { pathname: '/my-books', search: location.search },
            {
                replace: true,
                state: { restoreShelfList: origin },
            }
        );
        navigate(
            {
                pathname: '/my-books',
                search: `?view=shelves&shelfId=${shelfId}`,
            },
            {
                state: { shelfOrigin: origin },
            }
        );
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    function returnToShelves() {
        const origin = navigationState?.shelfOrigin;
        const next = new URLSearchParams({ view: 'shelves' });
        if (origin?.page) next.set('page', String(origin.page));
        navigate(
            { pathname: '/my-books', search: `?${next}` },
            {
                state: origin ? { restoreShelfList: origin } : null,
            }
        );
        if (!origin) window.scrollTo({ top: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if (
            pagination &&
            !state.busy &&
            page > 0 &&
            page >= pagination.totalPages
        )
            changePage(Math.max(0, pagination.totalPages - 1), true);
    }, [pagination, state.busy, page, changePage]);
    function closeConfirm() {
        if (!confirmBusy) {
            setTarget(null);
            setConfirmError('');
        }
    }
    async function update(
        record: service.BookshelfBook,
        change: UserBookUpdate
    ) {
        if (!record.userBook || locks.current.has(record.book.id)) return;
        locks.current.add(record.book.id);
        setPending((p) => ({ ...p, [record.book.id]: true }));
        setErrors((p) => ({ ...p, [record.book.id]: '' }));
        try {
            await toast.promise(relation.update(record.userBook.id, change), {
                loading: 'Salvando livro...',
                success: 'Livro atualizado.',
                error: (error) =>
                    getApiErrorMessage(
                        error,
                        'Não foi possível atualizar o livro.'
                    ),
            });
            refresh();
        } catch (e) {
            setErrors((p) => ({
                ...p,
                [record.book.id]: getApiErrorMessage(
                    e,
                    'Não foi possível atualizar o livro.'
                ),
            }));
        } finally {
            locks.current.delete(record.book.id);
            setPending((p) => ({ ...p, [record.book.id]: false }));
        }
    }
    function actions(shelf: service.BookshelfSummary) {
        return (
            <ShelfActionsMenu
                name={shelf.name}
                onEdit={() => setEditor(shelf)}
                onDelete={() => setTarget({ shelf })}
            />
        );
    }
    return (
        <>
            <div className={id ? 'shelf-return' : 'shelf-toolbar'}>
                {id ? (
                    <Button
                        variant="outline"
                        type="button"
                        className="library-view-all"
                        onClick={returnToShelves}
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Estantes
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        type="button"
                        onClick={() => setEditor('new')}
                    >
                        Criar estante
                    </Button>
                )}
            </div>
            {id && (
                <header className="shelf-heading">
                    <div className="shelf-heading-title">
                        <h1 ref={heading} tabIndex={-1}>
                            {data?.summary?.name ?? 'Estante'}
                        </h1>
                        {data?.summary && actions(data.summary)}
                    </div>
                    {data?.summary && (
                        <p className="shelf-metadata">
                            {data.summary.booksCount}{' '}
                            {data.summary.booksCount === 1 ? 'livro' : 'livros'}{' '}
                            ·{' '}
                            {data.summary.isPublicShelf ? 'Pública' : 'Privada'}
                        </p>
                    )}
                    {data?.summary?.description && (
                        <ShelfDescription
                            key={`${id}:${data.summary.description}`}
                            text={data.summary.description}
                        />
                    )}
                </header>
            )}

            {state.busy && (
                <Feedback
                    kind="loading"
                    title={`Carregando ${id ? 'livros' : 'estantes'}...`}
                />
            )}
            {state.error && (
                <Feedback
                    kind="error"
                    title={state.error}
                    action={
                        <Button
                            variant="outline"
                            type="button"
                            onClick={refresh}
                        >
                            Tentar novamente
                        </Button>
                    }
                />
            )}
            {data?.list && !data.list.content.length && (
                <Feedback kind="empty" title="Você ainda não tem estantes.">
                    Use Criar estante para começar.
                </Feedback>
            )}
            <div className="library-shelves-grid">
                {data?.list?.content.map((shelf) => (
                    <div
                        className="shelf-tile"
                        id={`shelf-${shelf.id}`}
                        key={shelf.id}
                    >
                        <LibraryShelfPreview
                            label={shelf.name}
                            books={shelf.previewBooks}
                            total={shelf.booksCount}
                            busy={false}
                            onOpen={() => openShelf(shelf.id)}
                            onRetry={refresh}
                        />
                        {actions(shelf)}
                    </div>
                ))}
            </div>
            {data?.books && !data.books.content.length && (
                <p>
                    Esta estante ainda não tem livros. Use “Adicionar a uma
                    estante” nos cards da <Link to="/my-books">Biblioteca</Link>{' '}
                    ou do <Link to="/explore">Explorar</Link>.
                </p>
            )}
            {data?.books && !state.error && (
                <div className="book-selection-source-heading">
                    <BookSelectionControls
                        contextKey={selectionKey}
                        ids={data.books.content.map(
                            (record) => record.book.googleBooksId
                        )}
                        disabled={
                            state.busy || Object.values(pending).some(Boolean)
                        }
                        onAdded={refresh}
                    />
                </div>
            )}
            <div className="library-books">
                {data?.books?.content.map((record) =>
                    record.userBook ? (
                        <LibraryBookCard
                            selection={selection.cardSelection(
                                selectionKey,
                                record.book.googleBooksId
                            )}
                            key={record.book.id}
                            book={record.userBook}
                            busy={Boolean(pending[record.book.id])}
                            error={errors[record.book.id]}
                            onUpdate={(change) => void update(record, change)}
                            onAdd={() => setAdding(record.book)}
                            onDetach={() => setTarget({ record, detach: true })}
                            onRemove={() =>
                                setTarget({ record, detach: false })
                            }
                        />
                    ) : (
                        <LibraryBareBookCard
                            selection={selection.cardSelection(
                                selectionKey,
                                record.book.googleBooksId
                            )}
                            key={record.book.id}
                            book={record.book}
                            onAdd={() => setAdding(record.book)}
                            onDetach={() => setTarget({ record, detach: true })}
                        />
                    )
                )}
            </div>
            {pagination && pagination.totalPages > 1 && (
                <nav
                    className="library-pagination"
                    aria-label="Paginação das estantes"
                >
                    <Button
                        variant="outline"
                        type="button"
                        disabled={state.busy || page === 0}
                        onClick={() => changePage(page - 1)}
                    >
                        Anterior
                    </Button>
                    <span>
                        Página {page + 1} de {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        type="button"
                        disabled={
                            state.busy || page + 1 >= pagination.totalPages
                        }
                        onClick={() => changePage(page + 1)}
                    >
                        Próxima
                    </Button>
                </nav>
            )}
            {editor && (
                <ShelfEditor
                    shelf={editor === 'new' ? undefined : editor}
                    onClose={() => setEditor(null)}
                    onSaved={() => {
                        setEditor(null);
                        toast.add({ title: 'Estante salva.', type: 'success' });
                        if (!id) changePage(0);
                        refresh();
                    }}
                />
            )}
            {adding && (
                <AddToShelfDialog
                    book={adding}
                    onClose={() => setAdding(null)}
                    onAdded={() => {
                        toast.add({
                            title: 'Livro adicionado às estantes selecionadas.',
                            type: 'success',
                        });
                        refresh();
                    }}
                />
            )}
            <Dialog
                open={Boolean(target)}
                onOpenChange={(open) => {
                    if (!open) closeConfirm();
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="domain-dialog"
                    aria-busy={confirmBusy}
                >
                    <DialogTitle>
                        {target && 'shelf' in target
                            ? 'Excluir estante?'
                            : target?.detach
                              ? 'Retirar desta estante?'
                              : 'Remover da biblioteca?'}
                    </DialogTitle>
                    <DialogDescription>
                        {target && 'shelf' in target
                            ? `Excluir “${target.shelf.name}” e seus vínculos? Os livros permanecem na biblioteca.`
                            : target?.detach
                              ? 'O livro continuará na sua biblioteca e nas demais estantes.'
                              : 'Os vínculos com as estantes serão preservados.'}
                    </DialogDescription>
                    {confirmError && (
                        <p role="alert" className="library-danger">
                            {confirmError}
                        </p>
                    )}
                    <div className="library-dialog-actions">
                        <Button
                            variant="outline"
                            type="button"
                            disabled={confirmBusy}
                            onClick={closeConfirm}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            type="button"
                            disabled={confirmBusy}
                            onClick={async () => {
                                if (!target || confirmBusy) return;
                                setConfirmBusy(true);
                                setConfirmError('');
                                try {
                                    if ('shelf' in target) {
                                        await service.deleteShelf(
                                            target.shelf.id
                                        );
                                        if (id) returnToShelves();
                                    } else if (target.detach)
                                        await service.removeShelfBook(
                                            id!,
                                            target.record.book.id
                                        );
                                    else if (target.record.userBook)
                                        await relation.remove(
                                            target.record.userBook.id
                                        );
                                    setTarget(null);
                                    toast.add({
                                        title: 'Remoção concluída.',
                                        type: 'success',
                                    });
                                    refresh();
                                } catch (e) {
                                    setConfirmError(
                                        getApiErrorMessage(
                                            e,
                                            'Não foi possível remover.'
                                        )
                                    );
                                } finally {
                                    setConfirmBusy(false);
                                }
                            }}
                        >
                            {confirmBusy ? 'Removendo...' : 'Remover'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
