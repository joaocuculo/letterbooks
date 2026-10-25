import { toast } from './ui/toast-manager';
import { Button } from './ui/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

type Target =
    | { shelf: service.BookshelfSummary }
    | { record: service.BookshelfBook; detach: boolean };
export default function ShelfManager({
    page,
    changePage,
}: {
    page: number;
    changePage: (page: number) => void;
}) {
    const [params, setParams] = useSearchParams();
    const rawId = Number(params.get('shelfId'));
    const id = Number.isSafeInteger(rawId) && rawId > 0 ? rawId : null;
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
    const state = useLibraryResource(`${id}:${page}:${revision}`, load);
    const data = state.data;
    const pagination = data?.books?.page ?? data?.list?.page;
    useEffect(() => {
        if (
            pagination &&
            !state.busy &&
            page > 0 &&
            page >= pagination.totalPages
        )
            changePage(Math.max(0, pagination.totalPages - 1));
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
            <div className="shelf-toolbar">
                {id ? (
                    <Button
                        variant="outline"
                        type="button"
                        className="library-view-all"
                        onClick={() => setParams({ view: 'shelves' })}
                    >
                        <ArrowLeft size={16} />
                        Voltar às estantes
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
                {data?.summary && actions(data.summary)}
            </div>
            {data?.summary && (
                <header className="shelf-heading">
                    <h2>{data.summary.name}</h2>
                    {data.summary.description && (
                        <p>{data.summary.description}</p>
                    )}
                    <p>
                        {data.summary.booksCount} livros ·{' '}
                        {data.summary.isPublicShelf ? 'Pública' : 'Privada'}
                    </p>
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
                    <div className="shelf-tile" key={shelf.id}>
                        <LibraryShelfPreview
                            label={shelf.name}
                            books={shelf.previewBooks}
                            total={shelf.booksCount}
                            busy={false}
                            onOpen={() =>
                                setParams({
                                    view: 'shelves',
                                    shelfId: String(shelf.id),
                                })
                            }
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
            <div className="library-books">
                {data?.books?.content.map((record) =>
                    record.userBook ? (
                        <LibraryBookCard
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
                                        if (id) setParams({ view: 'shelves' });
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
