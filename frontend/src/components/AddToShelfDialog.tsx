import { useCallback, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLibraryResource } from '../hooks/useLibraryResource';
import {
    listShelves,
    findMineByGoogleBooksId,
    addShelfBook,
} from '../services/bookshelfService';
import ShelfEditor from './ShelfEditor';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import '../styles/my-books.css';

export default function AddToShelfDialog({
    book,
    onClose,
    onAdded,
}: {
    book: { googleBooksId: string; title: string };
    onClose: () => void;
    onAdded?: () => void;
}) {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [retry, setRetry] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState<{ id: number; name: string } | null>(
        null
    );
    const load = useCallback(
        async (signal: AbortSignal) => {
            if (!user) return null;
            const [shelves, memberships] = await Promise.all([
                listShelves(user.id, page, signal),
                findMineByGoogleBooksId(book.googleBooksId, signal),
            ]);
            return { shelves, memberships };
        },
        [user, page, book.googleBooksId]
    );
    const state = useLibraryResource(
        `add:${page}:${retry}:${book.googleBooksId}`,
        load
    );
    const membership = new Set(state.data?.memberships.map((s) => s.id));
    return (
        <>
            <Dialog.Root
                open
                onOpenChange={(open) => {
                    if (!open && !busy) onClose();
                }}
            >
                <Dialog.Portal>
                    <Dialog.Backdrop className="library-dialog-overlay" />
                    <Dialog.Popup className="landing library-remove-dialog shelf-dialog">
                        <Dialog.Title>Adicionar a uma estante</Dialog.Title>
                        <Dialog.Description>{book.title}</Dialog.Description>
                        {!user ? (
                            <>
                                <p>Entre para organizar seus livros.</p>
                                <button
                                    className="shelf-primary"
                                    onClick={() =>
                                        navigate('/login', {
                                            state: {
                                                from:
                                                    location.pathname +
                                                    location.search +
                                                    location.hash,
                                            },
                                        })
                                    }
                                >
                                    Entrar
                                </button>
                            </>
                        ) : (
                            <>
                                {state.busy && (
                                    <p role="status">
                                        Carregando suas estantes...
                                    </p>
                                )}
                                {state.error && (
                                    <>
                                        <p
                                            role="alert"
                                            className="library-danger"
                                        >
                                            {state.error}
                                        </p>
                                        <button
                                            className="library-secondary"
                                            onClick={() =>
                                                setRetry((v) => v + 1)
                                            }
                                        >
                                            Tentar novamente
                                        </button>
                                    </>
                                )}
                                <fieldset
                                    className="shelf-options"
                                    disabled={busy || state.busy}
                                >
                                    <legend>Selecione uma estante</legend>
                                    {created &&
                                        !state.data?.shelves.content.some(
                                            (s) => s.id === created.id
                                        ) && (
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="shelf"
                                                    checked={
                                                        selected === created.id
                                                    }
                                                    onChange={() =>
                                                        setSelected(created.id)
                                                    }
                                                />
                                                {created.name}
                                            </label>
                                        )}
                                    {state.data?.shelves.content.map((s) => (
                                        <label key={s.id}>
                                            <input
                                                type="radio"
                                                name="shelf"
                                                checked={selected === s.id}
                                                disabled={membership.has(s.id)}
                                                onChange={() =>
                                                    setSelected(s.id)
                                                }
                                            />
                                            <span>
                                                {s.name}
                                                {membership.has(s.id)
                                                    ? ' — Já contém este livro'
                                                    : ''}
                                            </span>
                                        </label>
                                    ))}
                                </fieldset>
                                {state.data &&
                                    !state.data.shelves.content.length &&
                                    !created && (
                                        <p>Você ainda não tem estantes.</p>
                                    )}
                                {state.data &&
                                    state.data.shelves.page.totalPages > 1 && (
                                        <div className="shelf-pager">
                                            <button
                                                className="library-secondary"
                                                disabled={
                                                    page === 0 ||
                                                    busy ||
                                                    state.busy
                                                }
                                                onClick={() =>
                                                    setPage((p) => p - 1)
                                                }
                                            >
                                                Anterior
                                            </button>
                                            <span>
                                                {page + 1} /{' '}
                                                {
                                                    state.data.shelves.page
                                                        .totalPages
                                                }
                                            </span>
                                            <button
                                                className="library-secondary"
                                                disabled={
                                                    page + 1 >=
                                                        state.data.shelves.page
                                                            .totalPages ||
                                                    busy ||
                                                    state.busy
                                                }
                                                onClick={() =>
                                                    setPage((p) => p + 1)
                                                }
                                            >
                                                Próxima
                                            </button>
                                        </div>
                                    )}
                                <button
                                    className="library-secondary"
                                    disabled={busy}
                                    onClick={() => setCreating(true)}
                                >
                                    Criar estante
                                </button>
                                {error && (
                                    <p role="alert" className="library-danger">
                                        {error}
                                    </p>
                                )}
                                <div className="library-dialog-actions">
                                    <button
                                        className="library-secondary"
                                        disabled={busy}
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="shelf-primary"
                                        disabled={
                                            busy ||
                                            state.busy ||
                                            selected === null ||
                                            membership.has(selected)
                                        }
                                        onClick={async () => {
                                            if (selected === null || busy)
                                                return;
                                            setBusy(true);
                                            setError('');
                                            try {
                                                await addShelfBook(
                                                    selected,
                                                    book.googleBooksId
                                                );
                                                onAdded?.();
                                                onClose();
                                            } catch (e) {
                                                setError(
                                                    getApiErrorMessage(
                                                        e,
                                                        'Não foi possível adicionar o livro.'
                                                    )
                                                );
                                                setRetry((v) => v + 1);
                                            } finally {
                                                setBusy(false);
                                            }
                                        }}
                                    >
                                        {busy
                                            ? 'Adicionando...'
                                            : 'Adicionar livro'}
                                    </button>
                                </div>
                            </>
                        )}
                        <Link
                            className="shelf-library-link"
                            to="/my-books?view=shelves"
                        >
                            Ver minhas estantes
                        </Link>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            {creating && (
                <ShelfEditor
                    onClose={() => setCreating(false)}
                    onSaved={(s) => {
                        setCreated(s);
                        setSelected(s.id);
                        setCreating(false);
                        setPage(0);
                        setRetry((v) => v + 1);
                    }}
                />
            )}
        </>
    );
}
