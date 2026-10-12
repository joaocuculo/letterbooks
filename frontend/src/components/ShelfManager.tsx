import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Menu } from '@base-ui/react/menu';
import { Dialog } from '@base-ui/react/dialog';
import { Ellipsis, ArrowLeft } from 'lucide-react';
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
    const [success, setSuccess] = useState('');
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
            await relation.update(record.userBook.id, change);
            setSuccess('Livro atualizado.');
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
            <Menu.Root>
                <Menu.Trigger
                    className="library-secondary library-shelf-menu"
                    aria-label={`Opções da estante ${shelf.name}`}
                >
                    <Ellipsis size={18} />
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner>
                        <Menu.Popup className="landing library-menu">
                            <Menu.Item onClick={() => setEditor(shelf)}>
                                Editar estante
                            </Menu.Item>
                            <Menu.Item
                                className="library-danger"
                                onClick={() => setTarget({ shelf })}
                            >
                                Excluir estante
                            </Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        );
    }
    return (
        <>
            <div className="shelf-toolbar">
                {id ? (
                    <button
                        className="library-view-all"
                        onClick={() => setParams({ view: 'shelves' })}
                    >
                        <ArrowLeft size={16} />
                        Voltar às estantes
                    </button>
                ) : (
                    <button
                        className="shelf-primary"
                        onClick={() => setEditor('new')}
                    >
                        Criar estante
                    </button>
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
            {success && (
                <p className="library-success" role="status">
                    {success}
                </p>
            )}
            {state.busy && (
                <p role="status">Carregando {id ? 'livros' : 'estantes'}...</p>
            )}
            {state.error && (
                <div className="library-error">
                    <p role="alert">{state.error}</p>
                    <button className="library-secondary" onClick={refresh}>
                        Tentar novamente
                    </button>
                </div>
            )}
            {data?.list && !data.list.content.length && (
                <p>
                    Você ainda não tem estantes. Use Criar estante para começar.
                </p>
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
                    <button
                        className="library-secondary"
                        disabled={state.busy || page === 0}
                        onClick={() => changePage(page - 1)}
                    >
                        Anterior
                    </button>
                    <span>
                        Página {page + 1} de {pagination.totalPages}
                    </span>
                    <button
                        className="library-secondary"
                        disabled={
                            state.busy || page + 1 >= pagination.totalPages
                        }
                        onClick={() => changePage(page + 1)}
                    >
                        Próxima
                    </button>
                </nav>
            )}
            {editor && (
                <ShelfEditor
                    shelf={editor === 'new' ? undefined : editor}
                    onClose={() => setEditor(null)}
                    onSaved={() => {
                        setEditor(null);
                        setSuccess('Estante salva.');
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
                        setSuccess('Livro adicionado à estante.');
                        refresh();
                    }}
                />
            )}
            <Dialog.Root
                open={Boolean(target)}
                onOpenChange={(open) => {
                    if (!open) closeConfirm();
                }}
            >
                <Dialog.Portal>
                    <Dialog.Backdrop className="library-dialog-overlay" />
                    <Dialog.Popup
                        className="landing library-remove-dialog"
                        aria-busy={confirmBusy}
                    >
                        <Dialog.Title>
                            {target && 'shelf' in target
                                ? 'Excluir estante?'
                                : target?.detach
                                  ? 'Retirar desta estante?'
                                  : 'Remover da biblioteca?'}
                        </Dialog.Title>
                        <Dialog.Description>
                            {target && 'shelf' in target
                                ? `Excluir “${target.shelf.name}” e seus vínculos? Os livros permanecem na biblioteca.`
                                : target?.detach
                                  ? 'O livro continuará na sua biblioteca e nas demais estantes.'
                                  : 'Os vínculos com as estantes serão preservados.'}
                        </Dialog.Description>
                        {confirmError && (
                            <p role="alert" className="library-danger">
                                {confirmError}
                            </p>
                        )}
                        <div className="library-dialog-actions">
                            <button
                                className="library-secondary"
                                disabled={confirmBusy}
                                onClick={closeConfirm}
                            >
                                Cancelar
                            </button>
                            <button
                                className="library-remove-confirm"
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
                                            if (id)
                                                setParams({ view: 'shelves' });
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
                                        setSuccess('Remoção concluída.');
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
                            </button>
                        </div>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
